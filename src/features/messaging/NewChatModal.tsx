'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Search, UserPlus, MessageCircle } from 'lucide-react';
import { User } from '@/types';
import { INITIAL_USERS } from '@/services/mockBackend';
import { useAuth } from '@/stores/authContext';

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUser: (user: User) => void;
}

export const NewChatModal: React.FC<NewChatModalProps> = ({
  isOpen,
  onClose,
  onSelectUser,
}) => {
  const { currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const candidates = INITIAL_USERS.filter((u) => u.id !== currentUser?.id);

  const filtered = candidates.filter((u) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      u.fullName.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      u.country.toLowerCase().includes(q)
    );
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Start African Dialogue"
      description="Connect directly with changemakers, creators, and professionals across the continent"
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search by name, handle, or country..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 rounded-2xl text-xs sm:text-sm text-neutral-900 dark:text-white placeholder-neutral-400 border border-transparent focus:border-[#087443] focus:outline-none transition"
          />
        </div>

        {/* Directory List */}
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {filtered.length > 0 ? (
            filtered.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 rounded-2xl hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700 cursor-pointer group"
                onClick={() => {
                  onSelectUser(user);
                  onClose();
                }}
              >
                <div className="flex items-center gap-3">
                  <Avatar src={user.avatarUrl} alt={user.fullName} size="md" />
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-neutral-900 dark:text-white group-hover:text-[#087443] transition font-sora">
                      {user.fullName}
                    </h4>
                    <p className="text-[11px] text-neutral-500">
                      @{user.username} • {user.country}
                    </p>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs text-[#087443] font-bold group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/40"
                >
                  <MessageCircle className="w-3.5 h-3.5 mr-1" /> Chat
                </Button>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-xs text-neutral-500">
              No contacts found matching &ldquo;{searchQuery}&rdquo;.
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
