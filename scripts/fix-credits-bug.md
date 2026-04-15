# 积分系统Bug修复方案

## 问题描述
用户购买500积分后，积分丢失，只剩62积分赠送积分可见。

## 根本原因
1. 500积分记录的 `expiresAt` 字段存储为 `Invalid Date`（时间戳 `NaN`）
2. `getRemainingCredits` 函数的过滤条件 `gt(credit.expiresAt, currentTime)` 无法处理 `NaN`
3. 500积分记录被过滤掉，用户无法使用

## 数据修复
立即修复受影响用户的数据：
```sql
-- 将无效的 expiresAt 修改为 null（永不过期）
UPDATE credit
SET expires_at = NULL
WHERE user_id = 'ef36dc7d-bc39-4c97-8cdb-d0adfcca5a82'
  AND credits = 500
  AND expires_at IS NOT NULL
  AND (expires_at < 0 OR expires_at IS NULL);  -- 捕获无效时间戳
```

## 代码修复
修复 `calculateCreditExpirationTime` 函数，增加防御性检查：
```typescript
export function calculateCreditExpirationTime({
  creditsValidDays,
  currentPeriodEnd,
}: {
  creditsValidDays: number;
  currentPeriodEnd?: Date;
}): Date | null {
  // 永不过期
  if (!creditsValidDays || creditsValidDays <= 0) {
    return null;
  }

  const now = new Date();

  // 防御性检查：确保当前日期有效
  if (isNaN(now.getTime())) {
    console.error('[calculateCreditExpirationTime] Invalid current date');
    return null;
  }

  const expiresAt = new Date(now);

  if (currentPeriodEnd) {
    // 订阅：使用订阅周期结束时间
    if (isNaN(currentPeriodEnd.getTime())) {
      console.error('[calculateCreditExpirationTime] Invalid currentPeriodEnd');
      return null;
    }
    expiresAt.setTime(currentPeriodEnd.getTime());
  } else {
    // 一次性购买：使用有效天数
    expiresAt.setDate(now.getDate() + creditsValidDays);
  }

  // 验证结果
  if (isNaN(expiresAt.getTime())) {
    console.error('[calculateCreditExpirationTime] Calculated expiration is invalid');
    return null;
  }

  return expiresAt;
}
```

## 查询逻辑修复
修复 `getRemainingCredits` 函数，增加对无效日期的处理：
```typescript
export async function getRemainingCredits(userId: string): Promise<number> {
  const currentTime = new Date();

  // 验证当前时间
  if (isNaN(currentTime.getTime())) {
    console.error('[getRemainingCredits] Invalid current time');
    return 0;
  }

  const [result] = await db()
    .select({
      total: sum(credit.remainingCredits),
    })
    .from(credit)
    .where(
      and(
        eq(credit.userId, userId),
        eq(credit.transactionType, CreditTransactionType.GRANT),
        eq(credit.status, CreditStatus.ACTIVE),
        gt(credit.remainingCredits, 0),
        or(
          isNull(credit.expiresAt),  // 永不过期
          and(
            sql`${credit.expiresAt} IS NOT NULL`,
            sql`${credit.expiresAt} != 0`,  // 排除 NaN（SQLite 中 NaN 存储为 NULL 或 0）
            gt(credit.expiresAt, currentTime)
          )
        )
      )
    );

  return parseInt(result?.total || '0');
}
```

## 立即行动
1. ✅ 运行诊断脚本确认问题范围
2. ⬜ 修复受影响用户的 `expiresAt` 数据
3. ⬜ 更新代码防御性检查
4. ⬜ 增加监控和日志
5. ⬜ 撰写产品文章
