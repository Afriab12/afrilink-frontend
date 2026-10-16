'use client';

import { ChatView } from '@/features/messaging/ChatView';

export default function MessagesPage() {
  return (
    <div className="w-full max-w-full min-w-0 flex-1">
      <ChatView />
    </div>
  );
}
