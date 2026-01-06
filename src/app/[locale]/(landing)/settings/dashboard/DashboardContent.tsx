'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface CreditsData {
  balance: number;
  currency: string;
  credits: Array<{
    id: string;
    credits: number;
    remainingCredits: number;
    description: string;
    expiresAt: string | null;
    createdAt: string;
  }>;
  recentTransactions: Array<{
    id: string;
    transactionType: string;
    transactionScene: string | null;
    credits: number;
    description: string | null;
    createdAt: string;
  }>;
}

export const DashboardContent: React.FC = () => {
  const [creditsData, setCreditsData] = useState<CreditsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCredits();
  }, []);

  const fetchCredits = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/credits');

      if (!res.ok) {
        if (res.status === 401) {
          // 未登录，重定向到登录页
          window.location.href = '/sign-in?callback=/dashboard';
          return;
        }
        throw new Error('Failed to fetch credits');
      }

      const data = await res.json();
      setCreditsData(data);
    } catch (err) {
      console.error('[DashboardContent] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load credits');
    } finally {
      setLoading(false);
    }
  };

  const getBalanceColor = (balance: number) => {
    if (balance === 0) return 'text-red-500';
    if (balance < 10) return 'text-yellow-500 animate-pulse';
    return 'text-green-500';
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'grant':
        return '⬇️';
      case 'consume':
        return '⬆️';
      default:
        return '🔄';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={fetchCredits}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Dashboard
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Manage your credits and projects
            </p>
          </div>
          <Link
            href="/"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-colors"
          >
            New Project
          </Link>
        </div>

        {/* Credits Overview Card */}
        <div className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm uppercase tracking-wider mb-2">
                Available Credits
              </p>
              <div className="flex items-baseline gap-2">
                <span className={`text-5xl font-black ${getBalanceColor(creditsData?.balance || 0)}`}>
                  {creditsData?.balance || 0}
                </span>
                <span className="text-gray-500 text-lg">credits</span>
              </div>
            </div>
            <div className="flex gap-3">
              <Link
                href="/pricing"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all transform hover:scale-105"
              >
                Get More Credits
              </Link>
              <button
                onClick={fetchCredits}
                className="px-6 py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl font-semibold transition-colors border border-white/10"
              >
                Refresh
              </button>
            </div>
          </div>

          {/* Credits Breakdown */}
          {creditsData?.credits && creditsData.credits.length > 0 && (
            <div className="mt-8 pt-6 border-t border-white/10">
              <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-4">
                Credits Breakdown
              </h3>
              <div className="space-y-3">
                {creditsData.credits.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                  >
                    <div>
                      <p className="text-white font-semibold">{c.description}</p>
                      <p className="text-gray-500 text-xs">
                        Expires: {formatDate(c.expiresAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-blue-400 font-bold font-mono">
                        {c.remainingCredits} / {c.credits}
                      </p>
                      <div className="w-24 h-1.5 bg-white/10 rounded-full mt-1">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{
                            width: `${(c.remainingCredits / c.credits) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-500 text-xl">
                🎨
              </div>
              <p className="text-gray-400 text-sm">AI Decompositions</p>
            </div>
            <p className="text-3xl font-black text-white">
              {creditsData?.recentTransactions.filter(
                (t) => t.transactionScene === 'decompose'
              ).length || 0}
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-green-600/20 flex items-center justify-center text-green-500 text-xl">
                💰
              </div>
              <p className="text-gray-400 text-sm">Total Credits Purchased</p>
            </div>
            <p className="text-3xl font-black text-white">
              {creditsData?.credits.reduce((sum, c) => sum + c.credits, 0) || 0}
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-purple-600/20 flex items-center justify-center text-purple-500 text-xl">
                📊
              </div>
              <p className="text-gray-400 text-sm">Member Since</p>
            </div>
            <p className="text-lg font-bold text-white">
              {creditsData?.credits[0]?.createdAt
                ? formatDate(creditsData.credits[0].createdAt)
                : 'N/A'}
            </p>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-black text-white mb-4">
            Recent Transactions
          </h2>
          {creditsData?.recentTransactions &&
          creditsData.recentTransactions.length > 0 ? (
            <div className="space-y-3">
              {creditsData.recentTransactions.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {getTransactionIcon(t.transactionType)}
                    </span>
                    <div>
                      <p className="text-white font-semibold">
                        {t.description || t.transactionScene}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {formatDate(t.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-bold font-mono ${
                        t.transactionType === 'grant'
                          ? 'text-green-500'
                          : 'text-red-500'
                      }`}
                    >
                      {t.transactionType === 'grant' ? '+' : ''}
                      {t.credits}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No transactions yet. Start creating!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
