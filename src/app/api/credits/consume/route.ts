/**
 * [INPUT]: 依赖 better-auth 的 session，依赖 credit 表的 FIFO 逻辑
 * [OUTPUT]: 对外提供积分扣减接口，自动按过期时间消费（FIFO）
 * [POS]: API 路由，处理 AI 分层等操作的积分扣减
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/core/db';
import { credit } from '@/config/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { getUserInfo } from '@/shared/models/user';

// ========================================
// POST /api/credits/consume - 消费积分（FIFO）
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
    const { amount, description, scene = 'consume', metadata } = body;

    // 参数验证
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount. Must be a positive number.' },
        { status: 400 }
      );
    }

    if (!description) {
      return NextResponse.json(
        { error: 'Description is required.' },
        { status: 400 }
      );
    }

    // 查询用户所有有效的积分授予记录（按过期时间升序，实现 FIFO）
    const activeCredits = await db()
      .select()
      .from(credit)
      .where(
        and(
          eq(credit.userId, user.id),
          eq(credit.transactionType, 'grant'),
          eq(credit.status, 'active'),
          sql`${credit.remainingCredits} > 0`
        )
      )
      .orderBy(credit.expiresAt); // 先消费最早过期的积分

    // 计算总余额
    const totalBalance = activeCredits.reduce((sum: number, c: any) => sum + (c.remainingCredits || 0), 0);

    // 检查余额是否足够
    if (totalBalance < amount) {
      return NextResponse.json(
        {
          error: 'Insufficient credits',
          balance: totalBalance,
          required: amount,
          message: `You need ${amount - totalBalance} more credits to complete this operation.`,
        },
        { status: 402 } // Payment Required
      );
    }

    // FIFO 消费积分
    let remainingToConsume = amount;
    const consumedFrom = [];
    const now = new Date();

    for (const creditRecord of activeCredits) {
      if (remainingToConsume <= 0) break;

      const consumeFromThis = Math.min(remainingToConsume, creditRecord.remainingCredits || 0);
      const newRemaining = (creditRecord.remainingCredits || 0) - consumeFromThis;

      // 更新原授予记录的剩余积分
      await db()
        .update(credit)
        .set({
          remainingCredits: newRemaining,
          updatedAt: now,
        })
        .where(eq(credit.id, creditRecord.id));

      // 记录消费详情
      consumedFrom.push({
        creditId: creditRecord.id,
        consumedAmount: consumeFromThis,
        previousRemaining: creditRecord.remainingCredits,
        newRemaining,
      });

      remainingToConsume -= consumeFromThis;
    }

    // 生成消费记录
    const transactionNo = `CC-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    const consumeRecord = await db()
      .insert(credit)
      .values({
        id: crypto.randomUUID(),
        userId: user.id,
        userEmail: user.email,
        transactionNo,
        transactionType: 'consume',
        transactionScene: scene,
        credits: -amount,
        remainingCredits: totalBalance - amount,
        description,
        status: 'completed',
        consumedDetail: JSON.stringify(consumedFrom),
        metadata: metadata ? JSON.stringify(metadata) : null,
      })
      .returning();

    return NextResponse.json({
      success: true,
      consumed: amount,
      remainingBalance: totalBalance - amount,
      transaction: consumeRecord[0],
      consumedFrom,
    });
  } catch (error) {
    console.error('[POST /api/credits/consume] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
