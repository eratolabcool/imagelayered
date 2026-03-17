'use client';

import React from 'react';
import { useRouter } from '@/core/i18n/navigation';
import { Icons } from './Icon';
import { useCrookedCopy } from '../i18n';

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
  const t = useCrookedCopy().upgrade;

  if (!isOpen) return null;

  // 根据触发类型显示不同内容
  const getContent = () => {
    switch (type) {
      case 'save': return { ...t.save, icon: <Icons.Save /> };
      case 'export': return { ...t.export, icon: <Icons.Download /> };
      case 'limit': return { ...t.limit, message: t.limit.message.replace('{used}', String(3 - remainingUploads)), icon: <Icons.Upload /> };
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
    // 跳转到注册页面，带上回调
    // Use window.location.pathname is safer for full path including locale if not handled by router,
    // but since we are using i18n router now, we can just use the relative path if needed, 
    // or keep full path for callback to be safe.
    const currentPath = window.location.pathname;
    
    // Check if we should redirect to sign-up for "Register" actions
    if (type === 'limit' || type === 'export') {
       router.push(`/sign-up?callback=${encodeURIComponent(currentPath)}`);
    } else {
       router.push(`/sign-in?callback=${encodeURIComponent(currentPath)}`);
    }
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
            {t.viewPackages}
          </button>

          <button
            onClick={onClose}
            className="w-full py-3 text-gray-500 hover:text-gray-400 text-sm transition-colors"
          >
            {t.notNow}
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
