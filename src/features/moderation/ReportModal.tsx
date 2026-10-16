'use client';

import React, { useState } from 'react';
import { ReportCategory } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useSocial } from '@/stores/socialContext';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: 'user' | 'post' | 'comment' | 'community' | 'message';
  targetId: string;
  targetPreview: string;
}

export const REPORT_CATEGORIES: ReportCategory[] = [
  'Spam',
  'Harassment',
  'Hate',
  'Impersonation',
  'Scam/fraud',
  'Violence',
  'Sexual content',
  'Misinformation',
  'Other',
];

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetPreview,
}) => {
  const { submitReport } = useSocial();
  const [category, setCategory] = useState<ReportCategory>('Spam');
  const [details, setDetails] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      submitReport({
        targetType,
        targetId,
        targetPreview: targetPreview.slice(0, 80),
        category,
        details,
      });
      setIsSubmitting(false);
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setDetails('');
        onClose();
      }, 1500);
    }, 400);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Report ${targetType.toUpperCase()}`}
      description="Help maintain a safe and trusted Pan-African community"
      maxWidth="md"
    >
      {isSubmitted ? (
        <div className="py-6 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-[#087443] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-base text-neutral-900 dark:text-white">
            Report Received
          </h4>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Our moderation team will review this {targetType} against our community standards. Thank you for protecting the platform.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl text-xs text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700">
            <span className="font-bold text-neutral-900 dark:text-white">Subject: </span>
            <span className="italic">&ldquo;{targetPreview.slice(0, 60)}...&rdquo;</span>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
              Select Reason
            </label>
            <div className="grid grid-cols-2 gap-2">
              {REPORT_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`p-2.5 rounded-xl border text-left text-xs font-medium transition ${
                    category === cat
                      ? 'border-red-500 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 ring-1 ring-red-500'
                      : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 text-neutral-800 dark:text-neutral-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
              Additional Details (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Provide any context that helps our trust & safety team..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-3 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="danger" size="sm" isLoading={isSubmitting}>
              <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Submit Report
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
