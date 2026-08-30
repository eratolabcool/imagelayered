'use client';

import React, { useEffect } from 'react';
import { useRouter } from '@/core/i18n/navigation';
import { Icons } from './Icon';
import { useCrookedCopy } from '../i18n';
import { trackFunnel } from '../lib/funnel-events';
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

  useEffect(() => {
    if (isOpen) trackFunnel('paywall_view', { type });
  }, [isOpen, type]);


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
    trackFunnel('paywall_click', { type });
    // 跳转到定价页面
    router.push('/pricing');
    onClose();
  };

  const handleSignIn = () => {
    trackFunnel('signup_click', { type });
    // Return to the editor after signing in. Use pathname + search so the
    // current project/query is preserved across the auth flow.
    const currentPath = `${window.location.pathname}${window.location.search}`;

    // Check if we should redirect to sign-up for "Register" actions.
    // The auth pages read the `callbackUrl` query param (not `callback`).
    if (type === 'limit' || type === 'export') {
      router.push(`/sign-up?callbackUrl=${encodeURIComponent(currentPath)}`);
    } else {
      router.push(`/sign-in?callbackUrl=${encodeURIComponent(currentPath)}`);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#17141c] p-7 shadow-[0_30px_100px_rgba(0,0,0,0.58)] animate-in fade-in zoom-in-95 duration-200">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="flex size-14 items-center justify-center rounded-xl bg-[#f33b72]/12 text-[#ff7ca2]">
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
            <p className="mt-3 text-xs font-bold text-[#ff7ca2]">
              {content.subtext}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleSignIn}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#f33b72] py-4 font-bold text-white shadow-[0_14px_34px_rgba(243,59,114,0.24)] outline-none hover:bg-[#ff4f83] focus-visible:ring-2 focus-visible:ring-[#ff9ab7] active:scale-[0.99]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            {content.cta}
          </button>

          <button
            onClick={handleUpgrade}
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.035] py-3 font-semibold text-[#d8d2dc] hover:bg-white/[0.065]"
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
        <div className="mt-8 border-t border-white/[0.06] pt-6">
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
