'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
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

  if (!isOpen) return null;

  // 根据触发类型显示不同内容
  const getContent = () => {
    switch (type) {
      case 'save':
        return {
          icon: <Icons.Save />,
          title: '保存您的创作',
          message: '登录后即可保存您的编辑进度，随时继续创作！',
          cta: '立即登录',
          subtext: '完全免费 · 无需信用卡'
        };

      case 'export':
        return {
          icon: <Icons.Download />,
          title: '高清无水印导出',
          message: '登录并使用积分即可导出高分辨率无水印的分层图像。',
          cta: '获取积分',
          subtext: '单次分层仅需 5 积分'
        };

      case 'limit':
        return {
          icon: <Icons.Upload />,
          title: '试用次数已用完',
          message: `您已用完免费试用次数（${3 - remainingUploads}/3）。登录即可获得更多免费额度！`,
          cta: '注册获取更多',
          subtext: '注册即送 10 积分'
        };

      case 'login':
        return {
          icon: <Icons.User />,
          title: '登录以继续',
          message: '登录后即可使用完整功能，包括保存、导出和无限次 AI 分层。',
          cta: '立即登录',
          subtext: '支持 Google / GitHub 快速登录'
        };

      default:
        return {
          icon: <Icons.Star />,
          title: '升级您的体验',
          message: '解锁更多功能，享受完整的 AI 图像分层编辑体验。',
          cta: '了解更多',
          subtext: ''
        };
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
            {content.icon}
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
            查看积分套餐
          </button>

          <button
            onClick={onClose}
            className="w-full py-3 text-gray-500 hover:text-gray-400 text-sm transition-colors"
          >
            暂不升级
          </button>
        </div>

        {/* Trust Badges */}
        <div className="mt-8 pt-6 border-t border-white/5">
          <div className="flex items-center justify-center gap-6 text-gray-600 text-xs">
            <div className="flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <span>安全加密</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              <span>按需付费</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              <span>随时取消</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrookedUpgradeModal;
