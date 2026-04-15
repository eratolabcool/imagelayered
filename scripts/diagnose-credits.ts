/**
 * [INPUT]: 依赖数据库 schema 的 credit 表
 * [OUTPUT]: 输出积分系统的诊断信息到控制台
 * [POS]: 诊断脚本，用于排查积分系统问题
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { db } from '@/core/db';
import { credit } from '@/config/db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';

/**
 * 诊断用户的积分问题
 */
async function diagnoseUserCredits(userId: string) {
  console.log(`\n========================================`);
  console.log(`诊断用户积分: ${userId}`);
  console.log(`========================================\n`);

  // 1. 查询所有积分记录
  const allCredits = await db()
    .select()
    .from(credit)
    .where(eq(credit.userId, userId))
    .orderBy(desc(credit.createdAt));

  console.log(`\n📊 所有积分记录 (共 ${allCredits.length} 条):\n`);
  console.log('类型\t\t积分\t剩余\t状态\t过期时间\t\t创建时间');
  console.log('─'.repeat(100));

  let totalGrant = 0;
  let totalGrantRemaining = 0;
  let totalConsume = 0;

  for (const record of allCredits) {
    const type = record.transactionType || 'unknown';
    const credits = record.credits || 0;
    const remaining = record.remainingCredits || 0;
    const status = record.status || 'unknown';

    let expires = '永不过期';
    try {
      if (record.expiresAt) {
        expires = new Date(record.expiresAt).toISOString();
      }
    } catch (e) {
      expires = 'Invalid Date';
    }

    let created = 'Invalid Date';
    try {
      if (record.createdAt) {
        created = new Date(record.createdAt).toISOString();
      }
    } catch (e) {
      created = String(record.createdAt);
    }

    console.log(`${type}\t\t${credits}\t${remaining}\t${status}\t${expires}\t${created}`);

    // 统计
    if (type === 'grant') {
      totalGrant += credits;
      totalGrantRemaining += remaining;
    } else if (type === 'consume') {
      totalConsume += Math.abs(credits);
    }
  }

  console.log('\n📈 统计摘要:');
  console.log(`  总授予积分: ${totalGrant}`);
  console.log(`  总剩余积分 (grant.remainingCredits): ${totalGrantRemaining}`);
  console.log(`  总消费积分 (consume记录的绝对值): ${totalConsume}`);
  console.log(`  理论剩余: ${totalGrant} - ${totalConsume} = ${totalGrant - totalConsume}`);
  console.log(`  实际剩余 (查询结果): ${totalGrantRemaining}`);

  // 2. 检查数据一致性
  console.log('\n🔍 数据一致性检查:');
  const difference = Math.abs(totalGrantRemaining - (totalGrant - totalConsume));
  if (difference > 0) {
    console.log(`  ❌ 数据不一致！差异: ${difference} 积分`);
    console.log(`     可能原因: grant记录的remainingCredits与consume记录不匹配`);
  } else {
    console.log(`  ✅ 数据一致`);
  }

  // 3. 查询有效的积分授予记录（用于计算余额）
  const currentTime = new Date();
  const activeGrants = await db()
    .select()
    .from(credit)
    .where(
      and(
        eq(credit.userId, userId),
        sql`transaction_type = 'grant'`,
        sql`status = 'active'`,
        sql`remaining_credits > 0`,
        sql`(expires_at IS NULL OR expires_at > ${currentTime.toISOString()})`
      )
    )
    .orderBy(credit.expiresAt);

  console.log('\n💰 有效积分授予记录 (FIFO消费顺序):');
  console.log('ID\t\t积分\t剩余\t过期时间');
  console.log('─'.repeat(80));
  for (const grant of activeGrants) {
    const expires = grant.expiresAt ? new Date(grant.expiresAt).toISOString() : '永不过期';
    console.log(`${grant.id.substring(0, 8)}...\t${grant.credits}\t${grant.remainingCredits}\t${expires}`);
  }

  // 4. 检查异常记录
  console.log('\n⚠️  异常记录检查:');

  // 检查是否有剩余积分小于0的记录
  const negativeRecords = allCredits.filter((r: any) => (r.remainingCredits || 0) < 0);
  if (negativeRecords.length > 0) {
    console.log(`  ❌ 发现 ${negativeRecords.length} 条剩余积分小于0的记录:`);
    for (const record of negativeRecords) {
      console.log(`     - ID: ${record.id}, 剩余: ${record.remainingCredits}`);
    }
  } else {
    console.log(`  ✅ 没有负剩余积分记录`);
  }

  // 检查是否有消费记录的剩余积分不为0
  const consumeWithRemaining = allCredits.filter(
    (r: any) => r.transactionType === 'consume' && (r.remainingCredits || 0) !== 0
  );
  if (consumeWithRemaining.length > 0) {
    console.log(`  ⚠️  发现 ${consumeWithRemaining.length} 条消费记录有非零剩余积分:`);
    for (const record of consumeWithRemaining) {
      console.log(`     - ID: ${record.id}, 剩余: ${record.remainingCredits}`);
    }
  }

  // 检查是否有重复的 transactionNo
  const transactionNos = allCredits.map((r: any) => r.transactionNo);
  const duplicates = transactionNos.filter((item: any, index: number) => transactionNos.indexOf(item) !== index);
  if (duplicates.length > 0) {
    console.log(`  ❌ 发现重复的 transactionNo: ${[...new Set(duplicates)].join(', ')}`);
  } else {
    console.log(`  ✅ 没有重复的 transactionNo`);
  }

  console.log('\n========================================\n');
}

/**
 * 诊断所有用户的积分问题
 */
async function diagnoseAllUsers() {
  console.log('\n========================================');
  console.log('诊断所有用户的积分');
  console.log('========================================\n');

  // 获取所有有积分记录的用户
  const users = await db()
    .selectDistinct({
      userId: credit.userId,
      userEmail: credit.userEmail,
    })
    .from(credit)
    .orderBy(desc(credit.createdAt))
    .limit(10);

  console.log(`找到 ${users.length} 个有积分记录的用户\n`);

  for (const user of users) {
    await diagnoseUserCredits(user.userId);
  }
}

// ========================================
// 主函数
// ========================================

async function main() {
  const args = process.argv.slice(2);
  const userId = args[0];

  if (userId) {
    await diagnoseUserCredits(userId);
  } else {
    await diagnoseAllUsers();
  }
}

main()
  .then(() => {
    console.log('诊断完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('诊断失败:', error);
    process.exit(1);
  });
