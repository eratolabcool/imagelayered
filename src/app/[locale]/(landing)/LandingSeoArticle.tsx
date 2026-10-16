'use client';

import { useState } from 'react';
import { BookOpen, CheckCircle2, ChevronDown, Layers, Sparkles, ShieldCheck } from 'lucide-react';
import { landingSeoArticles } from './landing-seo-content';

export default function LandingSeoArticle({ locale }: { locale: string }) {
  const langKey = (locale === 'zh' ? 'zh' : locale === 'ko' ? 'ko' : 'en') as 'en' | 'zh' | 'ko';
  const article = landingSeoArticles[langKey];
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleSection = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <article
      id="seo-architecture-guide"
      className="border-t border-zinc-800/80 bg-[#09090b] px-5 py-20 text-zinc-100 md:px-8"
      aria-label={article.title}
    >
      <div className="mx-auto max-w-[1216px]">
        {/* Header Block */}
        <header className="max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400">
            <Sparkles className="size-3.5" />
            <span>{article.badge}</span>
            <span className="text-zinc-600">|</span>
            <span className="font-mono text-zinc-300">
              {langKey === 'zh'
                ? '产品使用指南'
                : langKey === 'ko'
                ? '제품 사용 가이드'
                : 'Product usage guide'}
            </span>
          </div>

          <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-white sm:text-3xl lg:text-4xl">
            {article.title}
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-zinc-400 sm:text-base">
            {article.subtitle}
          </p>
        </header>

        {/* Content Section Grid */}
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {article.sections.map((section, idx) => {
            const isFirstFew = idx < 4;
            const isExpanded = expandedIndex === idx;

            return (
              <section
                key={section.title}
                className={`relative flex flex-col justify-between rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 transition-all duration-200 hover:border-zinc-700/80 hover:bg-zinc-900/70 ${
                  idx === 0 || idx === 1 ? 'md:col-span-2' : ''
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="flex size-7 items-center justify-center rounded-lg bg-blue-500/10 font-mono text-xs font-bold text-blue-400">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <h3 className="text-base font-bold text-zinc-100 sm:text-lg">
                        {section.title}
                      </h3>
                    </div>
                  </div>

                  <div className="mt-4 text-xs leading-relaxed text-zinc-300/90 sm:text-sm">
                    <p className="whitespace-pre-line leading-7">
                      {section.body}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-zinc-800/60 pt-4 text-xs text-zinc-500">
                  <span className="inline-flex items-center gap-1.5 text-blue-400/90">
                    <CheckCircle2 className="size-3.5" />
                    {langKey === 'zh'
                      ? '专业级生产标准'
                      : langKey === 'ko'
                      ? '프로덕션 규격 검증'
                      : 'Production Standard'}
                  </span>
                  <span className="text-[11px] text-zinc-600">
                    {langKey === 'zh' ? '实际工作流' : langKey === 'ko' ? '실제 워크플로우' : 'Practical workflow'}
                  </span>
                </div>
              </section>
            );
          })}
        </div>

        {/* Authority Footer Note */}
        <footer className="mt-12 rounded-xl border border-zinc-800/60 bg-zinc-900/30 p-5 text-center text-xs text-zinc-400 sm:flex sm:items-center sm:justify-between sm:text-left">
          <div className="flex items-center justify-center gap-2 sm:justify-start">
            <ShieldCheck className="size-4 text-emerald-400" />
            <span>
              {langKey === 'zh'
                ? '全部解析内容由 Image Layered 架构团队撰写，符合 W3C 与 OpenGraph 语义规范。'
                : langKey === 'ko'
                ? '모든 테크니컬 리포트는 Image Layered 아키텍처 팀에서 검증하였으며 글로벌 검색 엔진 색인 기준을 준수합니다.'
                : 'All technical content is curated by the Image Layered engineering team, adhering to semantic search standards.'}
            </span>
          </div>
        </footer>
      </div>
    </article>
  );
}
