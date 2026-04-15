/**
 * [INPUT]: 依赖数据库 schema 的 credit 表
 * [OUTPUT]: 修复积分系统的数据一致性问题
 * [POS]: 数据修复脚本，用于修复积分系统的不一致数据
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { db } from '@/core/db';
import { credit } from '@/config/db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';

/**
 * 修复指定用户的积分数据
 *
 * 问题: grant 记录的 remainingCredits 与实际消费不匹配
 * 解决: 重新计算所有 grant 记录的 remainingCredits
 */
async function fixUserCredits(userId: string, dryRun = true) {
  console.log(`\n========================================`);
  console.log(`${dryRun ? '模拟修复' : '修复'}用户积分: ${userId}`);
  console.log(`========================================\n`);

  // 1. 查询所有积分记录
  const allCredits = await db()
    .select()
    .from(credit)
    .where(eq(credit.userId, userId))
    .orderBy(desc(credit.createdAt));

  // 2. 分离 grant 和 consume 记录
  const grants = allCredits.filter((r: any) => r.transactionType === 'grant');
  const consumes = allCredits.filter((r: any) => r.transactionType === 'consume');

  console.log(`📊 找到 ${grants.length} 条授予记录, ${consumes.length} 条消费记录\n`);

  // 3. 计算总消费
  let totalConsumed = 0;
  for (const consume of consumes) {
    totalConsumed += Math.abs(consume.credits || 0);
  }

  console.log(`💰 总消费积分: ${totalConsumed}\n`);

  // 4. 重新计算每个 grant 记录的 remainingCredits（FIFO）
  let remainingToDeduct = totalConsumed;
  const updates: { id: string; oldRemaining: number; newRemaining: number }[] = [];

  for (const grant of grants) {
    if (remainingToDeduct <= 0) {
      // 已扣完，这个 grant 应该保持原值或设为 0
      if ((grant.remainingCredits || 0) !== 0) {
        updates.push({
          id: grant.id,
          oldRemaining: grant.remainingCredits || 0,
          newRemaining: 0,
        });
      }
      continue;
    }

    const oldRemaining = grant.remainingCredits || 0;
    const toDeduct = Math.min(remainingToDeduct, oldRemaining);
    const newRemaining = oldRemaining - toDeduct;

    if (newRemaining !== oldRemaining) {
      updates.push({
        id: grant.id,
        oldRemaining,
        newRemaining,
      });
    }

    remainingToDeduct -= toDeduct;
  }

  // 5. 显示修复计划
  if (updates.length === 0) {
    console.log('✅ 数据一致，无需修复\n');
    return;
  }

  console.log('🔧 修复计划:');
  console.log('ID\t\t旧剩余\t新剩余\t差异');
  console.log('─'.repeat(60));
  for (const update of updates) {
    const diff = update.newRemaining - update.oldRemaining;
    console.log(`${update.id.substring(0, 8)}...\t${update.oldRemaining}\t${update.newRemaining}\t${diff}`);
  }

  // 6. 执行修复
  if (dryRun) {
    console.log('\n⚠️  这是模拟运行，使用 --apply 参数来实际修复');
  } else {
    console.log('\n🚀 开始执行修复...');

    await db().transaction(async (tx: any) => {
      for (const update of updates) {
        await tx
          .update(credit)
          .set({ remainingCredits: update.newRemaining })
          .where(eq(credit.id, update.id));
      }
    });

    console.log('✅ 修复完成');
  }

  console.log('\n========================================\n');
}

// ========================================
// 主函数
// ========================================

async function main() {
  const args = process.argv.slice(2);
  const userId = args[0];
  const dryRun = !args.includes('--apply');

  if (!userId) {
    console.error('用法: tsx scripts/diagnose-credits-fix.ts <userId> [--apply]');
    console.error('示例: tsx scripts/diagnose-credits-fix.ts user-123 --apply');
    process.exit(1);
  }

  await fixUserCredits(userId, dryRun);
}

main()
  .then(() => {
    console.log('操作完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('操作失败:', error);
    process.exit(1);
  });
