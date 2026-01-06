/**
 * [INPUT]: 依赖 credits API 获取积分信息，依赖 auth session
 * [OUTPUT]: 对外提供用户仪表板页面，显示积分余额、项目列表、快捷操作
 * [POS]: 用户仪表板主页面
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { getTranslations } from 'next-intl/server';

import { DashboardContent } from './DashboardContent';

export const metadata = {
  title: 'Dashboard',
  description: 'Manage your projects and credits',
};

export default async function DashboardPage() {
  const t = await getTranslations('dashboard');

  return <DashboardContent />;
}
