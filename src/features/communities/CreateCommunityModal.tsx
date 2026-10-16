'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { AFRICAN_COUNTRIES } from '@/utils/countryData';
import { useSocial } from '@/stores/socialContext';
import { Lock, Globe, Plus, Trash2, AlertCircle, Sparkles } from 'lucide-react';
import { communityService } from '@/services/communityService';

interface CreateCommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const COMMUNITY_CATEGORIES = [
  'Technology',
  'Business',
  'Agritech & Climate',
  'Education',
  'Entertainment',
  'Music & Arts',
  'Sports & Football',
  'Culture & Heritage',
  'Fashion & Design',
  'Food & Culinary',
  'Travel & Tourism',
  'Healthcare & Biotech',
  'AfCFTA & Cross-Border',
  'Diaspora & Global Africa',
];

export const CreateCommunityModal: React.FC<CreateCommunityModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { createCommunity } = useSocial();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(COMMUNITY_CATEGORIES[0]);
  const [country, setCountry] = useState('Pan-African');
  const [isPrivate, setIsPrivate] = useState(false);
  const [rules, setRules] = useState<string[]>([
    'Respect fellow African members and honor cultural diversity.',
    'No spam, fraudulent promotions, or unauthorized advertising.',
  ]);
  const [newRule, setNewRule] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddRule = () => {
    if (!newRule.trim()) return;
    setRules((prev) => [...prev, newRule.trim()]);
    setNewRule('');
    setError(null);
  };

  const handleRemoveRule = (index: number) => {
    if (rules.length <= 1) {
      setError('At least one community rule is required to maintain conduct.');
      return;
    }
    setRules((prev) => prev.filter((_, i) => i !== index));
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      communityService.validateCommunityInput({
        name,
        description,
        category,
        country,
        isPrivate,
        rules,
      });
    } catch (err: any) {
      setError(err.message || 'Validation error');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      createCommunity({
        name: name.trim(),
        description: description.trim(),
        category,
        country,
        isPrivate,
        rules,
      });
      setIsLoading(false);
      setName('');
      setDescription('');
      setError(null);
      onClose();
    }, 400);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create African Community"
      description="Gather changemakers, creatives, or industry peers across the continent"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 rounded-2xl text-xs flex items-center gap-2 border border-red-200 dark:border-red-900">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Input
          label="Community Name"
          placeholder="e.g. Pan-African Fintech Circle"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (error) setError(null);
          }}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-2xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3.5 py-2.5 text-xs sm:text-sm text-neutral-900 dark:text-white focus:border-[#087443] focus:outline-none"
            >
              {COMMUNITY_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
              Country Focus
            </label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full rounded-2xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3.5 py-2.5 text-xs sm:text-sm text-neutral-900 dark:text-white focus:border-[#087443] focus:outline-none"
            >
              <option value="Pan-African">🌍 Pan-African (All Africa)</option>
              {AFRICAN_COUNTRIES.map((c) => (
                <option key={c.code} value={c.name}>
                  {c.flag} {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
            Description & Purpose
          </label>
          <textarea
            rows={3}
            placeholder="Describe the mission, values, and who should join this community..."
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              if (error) setError(null);
            }}
            className="w-full rounded-2xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3.5 py-2.5 text-xs sm:text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#087443] resize-none"
            required
          />
        </div>

        {/* Public vs Private */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
            Membership Type
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setIsPrivate(false)}
              className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition ${
                !isPrivate
                  ? 'border-[#087443] bg-emerald-50/50 dark:bg-emerald-950/30 ring-1 ring-[#087443]'
                  : 'border-neutral-200 dark:border-neutral-800'
              }`}
            >
              <Globe
                className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                  !isPrivate ? 'text-[#087443]' : 'text-neutral-400'
                }`}
              />
              <div>
                <p className="text-xs font-bold text-neutral-900 dark:text-white">Public Hub</p>
                <p className="text-[11px] text-neutral-500 leading-tight">
                  Anyone across Africa can join instantly.
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setIsPrivate(true)}
              className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition ${
                isPrivate
                  ? 'border-[#087443] bg-emerald-50/50 dark:bg-emerald-950/30 ring-1 ring-[#087443]'
                  : 'border-neutral-200 dark:border-neutral-800'
              }`}
            >
              <Lock
                className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                  isPrivate ? 'text-[#087443]' : 'text-neutral-400'
                }`}
              />
              <div>
                <p className="text-xs font-bold text-neutral-900 dark:text-white">Private Circle</p>
                <p className="text-[11px] text-neutral-500 leading-tight">
                  Membership requires moderator approval.
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Rules Builder */}
        <div className="space-y-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
          <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
            Community Rules ({rules.length})
          </label>
          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {rules.map((rule, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 bg-neutral-50 dark:bg-neutral-800 rounded-xl text-xs"
              >
                <span className="text-neutral-700 dark:text-neutral-300 flex-1 pr-2">
                  <span className="font-bold text-[#087443] mr-1.5">#{idx + 1}</span>
                  {rule}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveRule(idx)}
                  className="text-neutral-400 hover:text-red-500 transition p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-1">
            <input
              type="text"
              placeholder="Add another rule or guideline..."
              value={newRule}
              onChange={(e) => setNewRule(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddRule();
                }
              }}
              className="flex-1 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-1.5 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-[#087443]"
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleAddRule}
              className="text-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Add
            </Button>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-neutral-100 dark:border-neutral-800">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading} className="font-bold">
            Create Hub
          </Button>
        </div>
      </form>
    </Modal>
  );
};
