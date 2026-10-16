'use client';

import React from 'react';
import { Community } from '@/types';
import { ShieldCheck, BookOpen, AlertCircle, HeartHandshake } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

interface CommunityRulesCardProps {
  community: Community;
}

export const CommunityRulesCard: React.FC<CommunityRulesCardProps> = ({ community }) => {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-[#087443] flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-white font-sora">
              Rules & Code of Conduct
            </h3>
            <p className="text-xs text-neutral-500">
              Community guidelines set by the hub founders
            </p>
          </div>
        </div>

        <Badge variant="emerald" size="sm">
          <ShieldCheck className="w-3.5 h-3.5 mr-1" />
          Pan-African Safe Space
        </Badge>
      </div>

      {/* Mission & Purpose */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
          Mission & Scope
        </h4>
        <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed bg-neutral-50 dark:bg-neutral-800/40 p-4 rounded-2xl border border-neutral-100 dark:border-neutral-800">
          {community.description}
        </p>
      </div>

      {/* Rules List */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3 flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-[#087443]" />
          Guidelines & Rules ({community.rules.length})
        </h4>

        <div className="space-y-2.5">
          {community.rules.map((rule, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3.5 p-3.5 bg-neutral-50/80 dark:bg-neutral-800/50 rounded-2xl border border-neutral-100 dark:border-neutral-800/80 transition hover:border-neutral-200 dark:hover:border-neutral-700"
            >
              <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-[#087443] text-xs font-black flex items-center justify-center flex-shrink-0 font-sora">
                {idx + 1}
              </div>
              <p className="text-xs sm:text-sm text-neutral-800 dark:text-neutral-200 leading-relaxed pt-0.5">
                {rule}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Ubuntu Commitment */}
      <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center gap-3 text-xs text-neutral-500">
        <HeartHandshake className="w-4 h-4 text-[#D9A441] flex-shrink-0" />
        <span>
          Rooted in <strong>Ubuntu philosophy</strong>: &ldquo;I am because we are.&rdquo; Treat every African voice with cultural empathy and integrity.
        </span>
      </div>
    </div>
  );
};
