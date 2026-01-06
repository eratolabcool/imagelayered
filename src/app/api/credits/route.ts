/**
 * [INPUT]: 依赖 better-auth 的 session，依赖 db schema 的 credit 表
 * [OUTPUT]: 对外提供 GET/POST 积分查询和充值接口
 * [POS]: API 路由，管理用户积分余额和交易记录
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/core/db';
import { credit } from '@/config/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { getUserInfo } from '@/shared/models/user';

// ========================================
// GET /api/credits - 查询用户积分余额
// ========================================
export async function GET(req: NextRequest) {
  try {
    // 验证用户身份
    const user = await getUserInfo();

    if (!user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      );
    }

    // 查询用户所有有效的积分授予记录
    const credits = await db()
      .select()
      .from(credit)
      .where(
        and(
          eq(credit.userId, user.id),
          eq(credit.transactionType, 'grant'),
          eq(credit.status, 'active')
        )
      )
      .orderBy(desc(credit.expiresAt));

    // 计算总余额（FIFO 消费后的剩余）
    const totalBalance = credits.reduce((sum: number, c: any) => sum + (c.remainingCredits || 0), 0);

    // 查询最近的交易记录
    const recentTransactions = await db()
      .select()
      .from(credit)
      .where(eq(credit.userId, user.id))
      .orderBy(desc(credit.createdAt))
      .limit(10);

    return NextResponse.json({
      balance: totalBalance,
      currency: 'credits',
      credits: credits.map((c: any) => ({
        id: c.id,
        credits: c.credits,
        remainingCredits: c.remainingCredits,
        description: c.description,
        expiresAt: c.expiresAt,
        createdAt: c.createdAt,
      })),
      recentTransactions: recentTransactions.map((t: any) => ({
        id: t.id,
        transactionType: t.transactionType,
        transactionScene: t.transactionScene,
        credits: t.credits,
        remainingCredits: t.remainingCredits,
        description: t.description,
        createdAt: t.createdAt,
      })),
    });
  } catch (error) {
    console.error('[GET /api/credits] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ========================================
// POST /api/credits - 充值/奖励积分
// ========================================
export async function POST(req: NextRequest) {
  try {
    // 验证用户身份
    const user = await getUserInfo();

    if (!user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { amount, description, scene = 'manual', expiresInDays = 365 } = body;

    // 参数验证
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount. Must be a positive number.' },
        { status: 400 }
      );
    }

    if (!description || typeof description !== 'string') {
      return NextResponse.json(
        { error: 'Description is required.' },
        { status: 400 }
      );
    }

    // 计算过期时间
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    // 生成唯一交易号
    const transactionNo = `CR-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // 创建积分授予记录
    const newCredit = await db()
      .insert(credit)
      .values({
        id: crypto.randomUUID(),
        userId: user.id,
        userEmail: user.email,
        transactionNo,
        transactionType: 'grant',
        transactionScene: scene,
        credits: amount,
        remainingCredits: amount,
        description,
        expiresAt,
        status: 'active',
      })
      .returning();

    return NextResponse.json({
      success: true,
      credit: newCredit[0],
      message: `Successfully granted ${amount} credits.`,
    });
  } catch (error) {
    console.error('[POST /api/credits] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
