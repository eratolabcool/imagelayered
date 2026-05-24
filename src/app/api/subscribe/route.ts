import { eq } from 'drizzle-orm';
import { db } from '@/core/db';
import { newsletterSubscriber } from '@/config/db/schema';
import { respOk, respErr, respJson } from '@/shared/lib/resp';
import { getEmailService } from '@/shared/services/email';

export async function POST(req: Request) {
  try {
    const { email, utmSource } = await req.json();

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return respErr('Invalid email address');
    }

    const normalizedEmail = email.trim().toLowerCase();
    const source = utmSource ? String(utmSource).trim() : '';

    // Check if subscriber already exists
    const [existing] = await db()
      .select()
      .from(newsletterSubscriber)
      .where(eq(newsletterSubscriber.email, normalizedEmail))
      .limit(1);

    if (existing) {
      if (existing.status === 'unsubscribed') {
        // Resubscribe
        await db()
          .update(newsletterSubscriber)
          .set({
            status: 'active',
            updatedAt: new Date(),
          })
          .where(eq(newsletterSubscriber.email, normalizedEmail));
      }
      return respJson(0, 'You have already subscribed to our newsletter! Thank you.');
    }

    // Insert new subscriber
    const newId = crypto.randomUUID();
    await db().insert(newsletterSubscriber).values({
      id: newId,
      email: normalizedEmail,
      status: 'active',
      utmSource: source,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Try sending welcome email in background (don't let it crash if Resend is unconfigured)
    try {
      const emailService = await getEmailService();
      // Check if Resend is active in email service (configs have resend_api_key)
      await emailService.sendEmail({
        to: normalizedEmail,
        subject: '🎁 Your AI Poster Editing Cheat-Sheet & Guide!',
        html: `
          <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; rounded: 12px; color: #1a1a1a;">
            <div style="text-align: center; margin-bottom: 24px;">
              <span style="font-size: 40px;">🎨</span>
              <h2 style="font-size: 24px; font-weight: 800; margin-top: 10px; color: #2563eb;">Welcome to Image Layered!</h2>
              <p style="font-size: 14px; color: #666; margin-top: -5px;">The AI-Powered Poster & Product Design Workspace</p>
            </div>
            
            <p>Hi there,</p>
            <p>Thank you for subscribing to <strong>Image Layered</strong>! You've joined a community of innovative independent developers, e-commerce builders, and designers who are reshaping how graphics are edited.</p>
            
            <div style="background-color: #f3f4f6; padding: 18px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #1e40af; font-size: 16px;">💡 Your Quick AI Poster Design Cheat-Sheet:</h3>
              <ul style="padding-left: 20px; margin-bottom: 0; line-height: 1.6;">
                <li><strong>Recolor Layer:</strong> Use phrases like <em>"change the product color to premium dynamic sunset orange"</em> for natural blend.</li>
                <li><strong>Replace Object:</strong> Select your layer and write <em>"a sleek professional leather product package"</em>.</li>
                <li><strong>Perfect Transparent PNGs:</strong> Make sure to toggle transparency in the layers panel before high-res export.</li>
              </ul>
            </div>

            <p style="margin-top: 24px;">
              Get started by uploading your own poster or product visual directly on our workspace:
            </p>

            <div style="text-align: center; margin: 28px 0;">
              <a href="https://image-layered.app" style="background-color: #2563eb; color: white; padding: 12px 28px; border-radius: 9999px; text-decoration: none; font-weight: bold; font-size: 14px; box-shadow: 0 4px 12px rgba(37,99,235,0.2);">
                Decompose & Edit a Poster Now
              </a>
            </div>

            <hr style="border: 0; border-top: 1px solid #eaeaea; margin: 24px 0;" />
            <p style="font-size: 12px; color: #888; text-align: center;">
              You received this email because you subscribed on image-layered.app.<br/>
              If you wish to stop receiving updates, <a href="#" style="color: #666;">unsubscribe here</a>.
            </p>
          </div>
        `,
      });
    } catch (emailErr) {
      console.warn('[subscribe] Welcome email sending skipped or failed:', emailErr);
    }

    return respJson(0, 'Thank you! You have successfully subscribed to our newsletter.');
  } catch (e) {
    console.error('[subscribe] API error:', e);
    return respErr('Subscription failed. Please try again later.');
  }
}
