'use client';

import React, { useState } from 'react';
import { User } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Ban, CheckCircle2 } from 'lucide-react';
import { useSocial } from '@/stores/socialContext';

interface BlockUserModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
}

export const BlockUserModal: React.FC<BlockUserModalProps> = ({ user, isOpen, onClose }) => {
  const { blockUser } = useSocial();
  const [isBlocked, setIsBlocked] = useState(false);

  if (!user) return null;

  const handleConfirmBlock = () => {
    blockUser(user.id);
    setIsBlocked(true);
    setTimeout(() => {
      setIsBlocked(false);
      onClose();
    }, 1200);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Block ${user.fullName}?`}
      description="They will not be able to interact with you on AfriLink"
      maxWidth="sm"
    >
      {isBlocked ? (
        <div className="py-6 text-center space-y-2">
          <CheckCircle2 className="w-10 h-10 text-red-500 mx-auto" />
          <h4 className="font-bold text-sm text-neutral-900 dark:text-white">
            {user.fullName} has been blocked
          </h4>
          <p className="text-xs text-neutral-500">
            Their profile, content, and direct messages have been removed from your experience.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
            <Avatar src={user.avatarUrl} alt={user.fullName} size="md" />
            <div>
              <p className="font-bold text-sm text-neutral-900 dark:text-white">{user.fullName}</p>
              <p className="text-xs text-neutral-500">@{user.username}</p>
            </div>
          </div>

          <div className="text-xs text-neutral-600 dark:text-neutral-400 space-y-1.5 list-disc pl-4">
            <li>Their profile will become inaccessible to you.</li>
            <li>Messaging will be immediately disabled.</li>
            <li>Friend and follow relationships will be severed.</li>
            <li>Their posts will no longer appear in your feed.</li>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleConfirmBlock}>
              <Ban className="w-3.5 h-3.5 mr-1" /> Block User
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
