'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { UserAvatar } from '@/components/ui/user-avatar';
import { Button } from '@/components/ui/Button';
import { Search, MessageSquare } from 'lucide-react';
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
      (u.country && u.country.toLowerCase().includes(q))
    );
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Start Dialogue"
      description="Connect directly with changemakers, creators, and professionals across Africa."
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <div className="h-10 rounded-xl bg-white/[0.03] border border-white/[0.06] px-3.5 flex items-center gap-2.5 focus-within:border-emerald-500/50 focus-within:bg-white/[0.05] transition-colors">
            <Search className="h-4 w-4 text-white/30 shrink-0" strokeWidth={1.75} />
            <input
              type="text"
              placeholder="Search by name, handle, or country..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs text-white placeholder:text-white/20 focus:outline-none"
            />
          </div>
        </div>

        {/* Directory List */}
        <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
          {filtered.length > 0 ? (
            filtered.map((user) => (
              <div
                key={user.id}
                role="button"
                tabIndex={0}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.04] transition-colors border border-transparent hover:border-white/[0.06] cursor-pointer group select-none"
                onClick={() => {
                  onSelectUser(user);
                  onClose();
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectUser(user);
                    onClose();
                  }
                }}
              >
                <div className="flex items-center gap-3">
                  <UserAvatar
                    src={user.avatarUrl}
                    alt={user.fullName}
                    username={user.username}
                    userId={user.id}
                    size="md"
                  />
                  <div>
                    <h4 className="font-semibold text-xs sm:text-sm text-white/90 group-hover:text-emerald-400 transition-colors font-sora">
                      {user.fullName}
                    </h4>
                    <p className="text-[11px] text-white/30">
                      @{user.username} • {user.country}
                    </p>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs text-emerald-400 font-semibold group-hover:bg-emerald-500/10"
                >
                  <MessageSquare className="h-3.5 w-3.5 mr-1" strokeWidth={1.75} /> Chat
                </Button>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-xs text-white/30">
              No contacts found matching &ldquo;{searchQuery}&rdquo;.
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
