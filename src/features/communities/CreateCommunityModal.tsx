'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { AFRICAN_COUNTRIES } from '@/utils/countryData';
import { useSocial } from '@/stores/socialContext';
import { Lock, Globe, Plus, Trash2 } from 'lucide-react';

interface CreateCommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const COMMUNITY_CATEGORIES = [
  'Technology',
  'Business',
  'Education',
  'Entertainment',
  'Music',
  'Sports',
  'Culture',
  'Fashion',
  'Food',
  'Travel',
  'Lifestyle',
  'Professional',
  'University',
  'Local communities',
];

export const CreateCommunityModal: React.FC<CreateCommunityModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { createCommunity } = useSocial();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Technology');
  const [country, setCountry] = useState('Pan-African');
  const [isPrivate, setIsPrivate] = useState(false);
  const [rules, setRules] = useState<string[]>([
    'Respect fellow members and diverse African heritage.',
    'No spam or unauthorized product selling.',
  ]);
  const [newRule, setNewRule] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAddRule = () => {
    if (!newRule.trim()) return;
    setRules((prev) => [...prev, newRule.trim()]);
    setNewRule('');
  };

  const handleRemoveRule = (index: number) => {
    setRules((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) return;

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
      onClose();
    }, 400);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create African Community"
      description="Gather changemakers, creatives, or industry peers"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Community Name"
          placeholder="e.g. Pan-African Fintech Circle"
          value={name}
          onChange={(e) => setName(e.target.value)}
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
              className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3.5 py-2.5 text-sm text-neutral-900 dark:text-white focus:border-[#087443] focus:outline-none"
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
              className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3.5 py-2.5 text-sm text-neutral-900 dark:text-white focus:border-[#087443] focus:outline-none"
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
            Description
          </label>
          <textarea
            rows={3}
            placeholder="Describe the mission, values, and who should join this community..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3.5 py-2.5 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#087443] resize-none"
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
              <Globe className="w-4 h-4 text-[#087443] mt-0.5" />
              <div>
                <p className="font-bold text-xs text-neutral-900 dark:text-white">Public</p>
                <p className="text-[10px] text-neutral-500">Anyone can discover and join</p>
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
              <Lock className="w-4 h-4 text-amber-600 mt-0.5" />
              <div>
                <p className="font-bold text-xs text-neutral-900 dark:text-white">Private</p>
                <p className="text-[10px] text-neutral-500">Admins review membership requests</p>
              </div>
            </button>
          </div>
        </div>

        {/* Community Rules */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
            Community Guidelines & Rules
          </label>
          <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
            {rules.map((rule, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-xs bg-neutral-50 dark:bg-neutral-800/60 p-2 rounded-xl"
              >
                <span>{rule}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveRule(idx)}
                  className="text-neutral-400 hover:text-red-500"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add another rule..."
              value={newRule}
              onChange={(e) => setNewRule(e.target.value)}
              className="flex-1 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-1.5 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#087443]"
            />
            <Button type="button" variant="outline" size="sm" onClick={handleAddRule}>
              <Plus className="w-3.5 h-3.5" /> Add
            </Button>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isLoading}>
            Launch Community
          </Button>
        </div>
      </form>
    </Modal>
  );
};
