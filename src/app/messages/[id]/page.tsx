'use client';

import React, { use } from 'react';
import { ChatView } from '@/features/messaging/ChatView';

interface MessageDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function MessageDetailPage({ params }: MessageDetailPageProps) {
  const resolvedParams = use(params);
  return <ChatView initialConversationId={resolvedParams.id} />;
}
