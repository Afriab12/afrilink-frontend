'use client';

import React, { use } from 'react';
import { ChatView } from '@/features/messaging/ChatView';

interface MessageDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function MessageDetailPage({ params }: MessageDetailPageProps) {
  const resolvedParams = use(params);
  return (
    <div className="w-full max-w-full min-w-0 flex-1">
      <ChatView initialConversationId={resolvedParams.id} />
    </div>
  );
}
