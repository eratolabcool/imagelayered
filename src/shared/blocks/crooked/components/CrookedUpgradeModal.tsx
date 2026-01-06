'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Icons } from './Icon';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'save' | 'export' | 'limit' | 'login';
  remainingUploads?: number;
}

const CrookedUpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  type,
  remainingUploads = 0
}) => {
  const router = useRouter();
  const locale = useLocale();
  // Default to English unless it explicitly starts with 'zh'
  const isZh = locale?.startsWith('zh');

  // Debug logging for locale issues
  React.useEffect(() => {
    console.log('[CrookedUpgradeModal] Current locale:', locale, 'isZh:', isZh);
  }, [locale, isZh]);

  if (!isOpen) return null;

  // Multi-language content dictionary
  const t = {
    save: {
      title: isZh ? '保存您的创作' : 'Save Your Creation',
      message: isZh ? '登录后即可保存您的编辑进度，随时继续创作！' : 'Log in to save your progress and continue creating anytime!',
      cta: isZh ? '立即登录' : 'Log In Now',
      subtext: isZh ? '完全免费 · 无需信用卡' : 'Free · No Credit Card Required'
    },
    export: {
      title: isZh ? '高清无水印导出' : 'HD Export Without Watermark',
      message: isZh ? '登录并使用积分即可导出高分辨率无水印的分层图像。' : 'Log in and use credits to export high-resolution layered images without watermarks.',
      cta: isZh ? '获取积分' : 'Get Credits',
      subtext: isZh ? '单次分层仅需 5 积分' : '5 credits per layer decomposition'
    },
    limit: {
      title: isZh ? '试用次数已用完' : 'Trial Limit Reached',
      message: isZh 
        ? `您已用完免费试用次数（${3 - remainingUploads}/3）。登录即可获得更多免费额度！`
        : `You have used your free trials (${3 - remainingUploads}/3). Log in to get more free credits!`,
      cta: isZh ? '注册获取更多' : 'Register for More',
      subtext: isZh ? '注册即送 10 积分' : 'Get 10 credits upon registration'
    },
    login: {
      title: isZh ? '登录以继续' : 'Log In to Continue',
      message: isZh ? '登录后即可使用完整功能，包括保存、导出和无限次 AI 分层。' : 'Log in to access full features including save, export, and unlimited AI layering.',
      cta: isZh ? '立即登录' : 'Log In Now',
      subtext: isZh ? '支持 Google / GitHub 快速登录' : 'Supports Google / GitHub Quick Login'
    },
    default: {
      title: isZh ? '升级您的体验' : 'Upgrade Your Experience',
      message: isZh ? '解锁更多功能，享受完整的 AI 图像分层编辑体验。' : 'Unlock more features and enjoy the full AI image layering experience.',
      cta: isZh ? '了解更多' : 'Learn More',
      subtext: ''
    },
    buttons: {
      viewPackages: isZh ? '查看积分套餐' : 'View Credit Packages',
      notNow: isZh ? '暂不升级' : 'Not Now'
    },
    badges: {
      secure: isZh ? '安全加密' : 'Secure',
      payAsYouGo: isZh ? '按需付费' : 'Pay As You Go',
      cancelAnytime: isZh ? '随时取消' : 'Cancel Anytime'
    }
  };

  // 根据触发类型显示不同内容
  const getContent = () => {
    switch (type) {
      case 'save': return { ...t.save, icon: <Icons.Save /> };
      case 'export': return { ...t.export, icon: <Icons.Download /> };
      case 'limit': return { ...t.limit, icon: <Icons.Upload /> };
      case 'login': return { ...t.login, icon: <Icons.User /> };
      default: return { ...t.default, icon: <Icons.Star /> };
    }
  };

  const content = getContent();

  const handleUpgrade = () => {
    // 跳转到定价页面
    router.push('/pricing');
    onClose();
  };

  const handleSignIn = () => {
    // 跳转到登录页面，带上回调
    const currentPath = window.location.pathname;
    router.push(`/sign-in?callback=${encodeURIComponent(currentPath)}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-300">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-500">
            {content.icon || <Icons.Star />}
          </div>
        </div>

        {/* Content */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-black text-white mb-3 tracking-tight">
            {content.title}
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            {content.message}
          </p>
          {content.subtext && (
            <p className="text-blue-500 text-xs font-bold mt-3 uppercase tracking-widest">
              {content.subtext}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleSignIn}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all transform hover:scale-[1.02] shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            {content.cta}
          </button>

          <button
            onClick={handleUpgrade}
            className="w-full py-3 bg-white/5 hover:bg-white/10 text-gray-300 font-semibold rounded-xl transition-all border border-white/10"
          >
            {t.buttons.viewPackages}
          </button>

          <button
            onClick={onClose}
            className="w-full py-3 text-gray-500 hover:text-gray-400 text-sm transition-colors"
          >
            {t.buttons.notNow}
          </button>
        </div>

        {/* Trust Badges */}
        <div className="mt-8 pt-6 border-t border-white/5">
          <div className="flex items-center justify-center gap-6 text-gray-600 text-xs">
            <div className="flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <span>{t.badges.secure}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              <span>{t.badges.payAsYouGo}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              <span>{t.badges.cancelAnytime}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrookedUpgradeModal;
