/**
 * Claim Stripe subscriptions paid before the D1 migration (Turso data lost).
 * On sign-up / sign-in we look up active Stripe subscriptions for the user's
 * email that belong to Image Layered, and if no D1 subscription row exists we
 * create subscription + order rows and grant the CURRENT period's credits.
 * Idempotent: subscription_no = stripe_<sub id>, order_no / transaction_no =
 * claim_<invoice id>; all unique columns, inserted with ON CONFLICT DO NOTHING.
 * Renewal webhooks for unknown subscriptions are acknowledged and left "pending"
 * in Stripe (the source of truth) until the customer signs up.
 */
import { and, eq, ne } from 'drizzle-orm';

import { db } from '@/core/db';
import { credit, order, subscription } from '@/config/db/schema';
import pricing from '@/config/locale/messages/en/pages/pricing.json';
import { getUuid } from '@/shared/lib/hash';
import { getAllConfigs } from '@/shared/models/config';

const APP_NAME = 'Image Layered';
const STRIPE = 'https://api.stripe.com/v1';

async function stripeGet(key: string, path: string) {
  const r = await fetch(`${STRIPE}${path}`, {
    headers: { Authorization: `Bearer ${key}` },
  });
  if (!r.ok) throw new Error(`stripe ${path.split('?')[0]} ${r.status}`);
  return r.json() as Promise<any>;
}

function findPricingItem(amount: number, currency: string, interval: string) {
  const items: any[] = (pricing as any)?.page?.sections?.pricing?.items || [];
  return items.find(
    (i) =>
      Number(i.amount) === amount &&
      String(i.currency).toLowerCase() === currency.toLowerCase() &&
      i.interval === interval
  );
}

export async function claimStripeSubscriptionsForUser(user: {
  id: string;
  email?: string | null;
}) {
  const email = String(user?.email || '').trim().toLowerCase();
  if (!user?.id || !email) return { claimed: 0 };
  const configs = await getAllConfigs();
  const key = configs.stripe_secret_key;
  if (!key) return { claimed: 0 };

  const customers = await stripeGet(
    key,
    `/customers/search?limit=10&query=${encodeURIComponent(`email:'${email.replace(/'/g, '')}'`)}`
  );
  let claimed = 0;
  for (const cus of customers.data || []) {
    const subs = await stripeGet(
      key,
      `/subscriptions?customer=${cus.id}&status=active&limit=20&expand[]=data.latest_invoice`
    );
    for (const sub of subs.data || []) {
      try {
        if (await claimOne(key, user.id, email, sub)) claimed++;
      } catch (e) {
        console.log('[stripe-claim] failed', sub?.id, e);
      }
    }
  }
  return { claimed };
}

async function claimOne(key: string, userId: string, email: string, sub: any) {
  // already known in D1 (normal checkout flow or earlier claim)
  const [existing] = await db()
    .select({ id: subscription.id })
    .from(subscription)
    .where(
      and(
        eq(subscription.subscriptionId, sub.id),
        eq(subscription.paymentProvider, 'stripe'),
        ne(subscription.subscriptionNo, `stripe_${sub.id}`)
      )
    );
  if (existing) return false;

  // shared Stripe account: only claim Image Layered subscriptions
  let appName = sub.metadata?.app_name;
  if (!appName) {
    const sessions = await stripeGet(key, `/checkout/sessions?subscription=${sub.id}&limit=1`);
    appName = sessions.data?.[0]?.metadata?.app_name;
  }
  if (appName !== APP_NAME) return false;

  const item = sub.items?.data?.[0];
  const price = item?.price;
  const amount = Number(price?.unit_amount || 0);
  const currency = String(price?.currency || 'usd');
  const interval = String(price?.recurring?.interval || '');
  const plan = findPricingItem(amount, currency, interval);
  if (!plan) {
    console.log('[stripe-claim] no pricing item for', sub.id, amount, currency, interval);
    return false;
  }

  const inv = sub.latest_invoice;
  const invoiceId = typeof inv === 'string' ? inv : inv?.id;
  if (!invoiceId || (typeof inv === 'object' && inv.status !== 'paid')) return false;

  // a webhook already recorded this invoice
  const [byInvoice] = await db()
    .select({ id: order.id })
    .from(order)
    .where(and(eq(order.invoiceId, invoiceId), ne(order.orderNo, `claim_${invoiceId}`)));
  if (byInvoice) return false;

  const ps = Number(item?.current_period_start || sub.current_period_start) * 1000;
  const pe = Number(item?.current_period_end || sub.current_period_end) * 1000;
  const periodStart = new Date(ps);
  const periodEnd = new Date(pe);
  const subscriptionNo = `stripe_${sub.id}`;
  const orderNo = `claim_${invoiceId}`;
  const credits = Number(plan.credits || 0);
  const validDays = Number(plan.valid_days || 0);
  const now = new Date();

  await db()
    .insert(order)
    .values({
      id: getUuid(),
      orderNo,
      userId,
      userEmail: email,
      status: 'paid',
      amount,
      currency,
      productId: plan.product_id,
      paymentType: 'subscription',
      paymentInterval: interval,
      paymentProvider: 'stripe',
      checkoutInfo: '',
      description: 'Restored Stripe subscription (claimed at sign-in)',
      productName: plan.product_name,
      subscriptionId: sub.id,
      subscriptionNo,
      creditsAmount: credits,
      creditsValidDays: validDays,
      planName: plan.title || plan.product_name,
      paymentProductId: price?.id,
      invoiceId,
      invoiceUrl: typeof inv === 'object' ? inv.hosted_invoice_url : undefined,
      paymentEmail: email,
      paymentAmount: typeof inv === 'object' ? inv.amount_paid : amount,
      paymentCurrency: currency,
      paymentUserId: sub.customer,
      paidAt:
        typeof inv === 'object' && inv.status_transitions?.paid_at
          ? new Date(inv.status_transitions.paid_at * 1000)
          : now,
    })
    .onConflictDoNothing();

  await db()
    .insert(subscription)
    .values({
      id: getUuid(),
      subscriptionNo,
      userId,
      userEmail: email,
      status: 'active',
      paymentProvider: 'stripe',
      subscriptionId: sub.id,
      productId: plan.product_id,
      description: 'Restored Stripe subscription',
      amount,
      currency,
      interval,
      intervalCount: Number(price?.recurring?.interval_count || 1),
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
      planName: plan.title || plan.product_name,
      productName: plan.product_name,
      creditsAmount: credits,
      creditsValidDays: validDays,
      paymentProductId: price?.id,
      paymentUserId: sub.customer,
    })
    .onConflictDoNothing();

  if (credits <= 0) return false;
  {
    const inserted = await db()
      .insert(credit)
      .values({
        id: getUuid(),
        userId,
        userEmail: email,
        orderNo,
        subscriptionNo,
        transactionNo: orderNo,
        transactionType: 'grant',
        transactionScene: 'subscription',
        credits,
        remainingCredits: credits,
        description: 'Grant credit (restored subscription)',
        // credits for the current period expire at period end
        expiresAt: validDays > 0 ? periodEnd : null,
        status: 'active',
      })
      .onConflictDoNothing()
      .returning({ id: credit.id });
    if (!inserted.length) return false; // already granted
  }
  console.log('[stripe-claim] claimed', sub.id, 'for user', userId);
  return true;
}
