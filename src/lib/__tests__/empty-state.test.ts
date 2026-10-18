import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import {
  EMPTY_STATE_PRESETS,
  EMPTY_STATE_LAYOUT,
  EMPTY_STATE_PRESET_NAMES,
  resolveEmptyStateConfig,
} from '../empty-state.ts';

describe('Phase 3B — Empty States & Zero-Data Illustrations', () => {
  const emptyStateComponentPath = path.resolve(
    process.cwd(),
    'src/components/ui/empty-state.tsx'
  );
  const emptyStateSource = fs.readFileSync(emptyStateComponentPath, 'utf-8');

  const feedListSource = fs.readFileSync(
    path.resolve(process.cwd(), 'src/features/feed/FeedList.tsx'),
    'utf-8'
  );
  const conversationListSource = fs.readFileSync(
    path.resolve(process.cwd(), 'src/features/messaging/ConversationList.tsx'),
    'utf-8'
  );
  const notificationListSource = fs.readFileSync(
    path.resolve(process.cwd(), 'src/features/notifications/NotificationListView.tsx'),
    'utf-8'
  );
  const communityMembersSource = fs.readFileSync(
    path.resolve(process.cwd(), 'src/features/communities/CommunityMembersList.tsx'),
    'utf-8'
  );
  const searchOverlaySource = fs.readFileSync(
    path.resolve(process.cwd(), 'src/features/search/SearchOverlay.tsx'),
    'utf-8'
  );

  describe('1. Presets Configuration & Invariants', () => {
    it('Empty Feed preset matches requirements: CTA Discover People', () => {
      const feed = EMPTY_STATE_PRESETS.feed;
      assert.strictEqual(feed.title, 'No posts in your feed');
      assert.strictEqual(
        feed.description,
        'Connect with African creators and communities to see updates.'
      );
      assert.strictEqual(feed.actionLabel, 'Discover People');
      assert.strictEqual(feed.actionHref, '/discover');
    });

    it('Empty Messages preset matches requirements: CTA Find People', () => {
      const messages = EMPTY_STATE_PRESETS.messages;
      assert.strictEqual(messages.title, 'No conversations yet');
      assert.strictEqual(
        messages.description,
        'Start a dialogue with innovators and creators across borders.'
      );
      assert.strictEqual(messages.actionLabel, 'Find People');
      assert.strictEqual(messages.actionHref, '/discover');
    });

    it('Empty Notifications preset matches requirements: No CTA ("All caught up")', () => {
      const notifs = EMPTY_STATE_PRESETS.notifications;
      assert.strictEqual(notifs.title, 'All caught up');
      assert.strictEqual(
        notifs.description,
        'No new activity or alerts at this moment.'
      );
      assert.strictEqual(notifs.actionLabel, undefined);
    });

    it('Empty Community Members preset matches requirements: CTA Join', () => {
      const commMembers = EMPTY_STATE_PRESETS['community-members'];
      assert.strictEqual(commMembers.title, 'No members found');
      assert.strictEqual(
        commMembers.description,
        'Be the first to join this community and connect with peers.'
      );
      assert.strictEqual(commMembers.actionLabel, 'Join');
    });

    it('Empty Search preset matches requirements: No CTA', () => {
      const search = EMPTY_STATE_PRESETS.search;
      assert.strictEqual(search.title, 'No results found');
      assert.strictEqual(
        search.description,
        'Try searching for a person, community, or Pan-African topic.'
      );
      assert.strictEqual(search.actionLabel, undefined);
    });

    it('Network Error preset matches requirements: CTA Retry (refetch)', () => {
      const netError = EMPTY_STATE_PRESETS['network-error'];
      assert.strictEqual(netError.title, 'Network connection lost');
      assert.strictEqual(
        netError.description,
        'Unable to connect to the AfriLink network. Please verify your connection.'
      );
      assert.strictEqual(netError.actionLabel, 'Retry');
    });
  });

  describe('2. Design Tokens and Layout Standards', () => {
    it('Container must be centered max-w-xs mx-auto py-16', () => {
      assert.ok(
        EMPTY_STATE_LAYOUT.container.includes('max-w-xs mx-auto py-16'),
        'Must specify max-w-xs mx-auto py-16'
      );
      assert.ok(
        EMPTY_STATE_LAYOUT.container.includes('flex flex-col items-center justify-center text-center'),
        'Must center content'
      );
    });

    it('SVG must be exactly 120x120 with emerald-500/10 stroke', () => {
      assert.strictEqual(EMPTY_STATE_LAYOUT.svgDimensions.width, 120);
      assert.strictEqual(EMPTY_STATE_LAYOUT.svgDimensions.height, 120);
      assert.strictEqual(EMPTY_STATE_LAYOUT.svgDimensions.viewBox, '0 0 120 120');
      assert.ok(
        EMPTY_STATE_LAYOUT.svgClasses.includes('w-[120px] h-[120px]'),
        'Must include w-[120px] h-[120px]'
      );
      assert.ok(
        EMPTY_STATE_LAYOUT.svgClasses.includes('stroke-emerald-500/10'),
        'Must include stroke-emerald-500/10'
      );
      assert.strictEqual(EMPTY_STATE_LAYOUT.strokeToken, 'emerald-500/10');
    });

    it('Title typography must be text-base font-semibold text-white/90 mt-6', () => {
      assert.ok(
        EMPTY_STATE_LAYOUT.title.includes('text-base font-semibold text-white/90 mt-6'),
        'Title must have text-base font-semibold text-white/90 mt-6'
      );
    });

    it('Description typography must be text-sm text-white/35 mt-2', () => {
      assert.ok(
        EMPTY_STATE_LAYOUT.description.includes('text-sm text-white/35 mt-2'),
        'Description must have text-sm text-white/35 mt-2'
      );
    });

    it('CTA button must have mt-6 margin and active:scale micro-interaction', () => {
      assert.strictEqual(EMPTY_STATE_LAYOUT.ctaWrapper, 'mt-6');
      assert.ok(
        EMPTY_STATE_LAYOUT.ctaButton.includes('bg-emerald-600'),
        'CTA must be primary emerald button'
      );
      assert.ok(
        EMPTY_STATE_LAYOUT.ctaButton.includes('active:scale-[0.97]'),
        'CTA must use GPU-safe button press scale'
      );
    });
  });

  describe('3. Configuration Resolver Pure Logic', () => {
    it('returns default preset when no overrides are passed', () => {
      const config = resolveEmptyStateConfig('feed');
      assert.strictEqual(config.title, 'No posts in your feed');
      assert.strictEqual(config.actionLabel, 'Discover People');
    });

    it('supports custom title and description overrides', () => {
      const config = resolveEmptyStateConfig('messages', {
        title: 'Custom Title',
        description: 'Custom description for conversations',
      });
      assert.strictEqual(config.title, 'Custom Title');
      assert.strictEqual(config.description, 'Custom description for conversations');
      assert.strictEqual(config.actionLabel, 'Find People');
    });

    it('allows suppressing action button with null actionLabel', () => {
      const config = resolveEmptyStateConfig('feed', {
        actionLabel: null,
      });
      assert.strictEqual(config.actionLabel, undefined);
    });

    it('allows overriding action label and href', () => {
      const config = resolveEmptyStateConfig('network-error', {
        actionLabel: 'Try Again',
        actionHref: '/refresh',
      });
      assert.strictEqual(config.actionLabel, 'Try Again');
      assert.strictEqual(config.actionHref, '/refresh');
    });
  });

  describe('4. Component Implementation Invariants (empty-state.tsx)', () => {
    it('empty-state.tsx contains 120x120 SVG definitions for all 6 presets', () => {
      for (const preset of EMPTY_STATE_PRESET_NAMES) {
        assert.ok(
          emptyStateSource.includes(`geometry-${preset}`),
          `Must define geometry group for preset: ${preset}`
        );
      }
    });

    it('implements inline SVG without external canvas or image files', () => {
      assert.ok(!emptyStateSource.includes('<canvas'), 'Must not use HTML5 canvas');
      assert.ok(!emptyStateSource.includes('<img'), 'Must not use <img> raster photos');
      assert.ok(emptyStateSource.includes('<svg'), 'Must render inline SVG');
      assert.ok(emptyStateSource.includes('width={120}'), 'SVG width must be 120');
      assert.ok(emptyStateSource.includes('height={120}'), 'SVG height must be 120');
      assert.ok(emptyStateSource.includes('viewBox="0 0 120 120"'), 'viewBox must be 0 0 120 120');
      assert.ok(
        emptyStateSource.includes('stroke-emerald-500/10'),
        'SVG must have stroke-emerald-500/10 class'
      );
    });

    it('uses GPU-safe BUTTON_PRESS_CLASS on CTA button', () => {
      assert.ok(
        emptyStateSource.includes('BUTTON_PRESS_CLASS'),
        'EmptyState must use BUTTON_PRESS_CLASS from animations'
      );
    });
  });

  describe('5. Surface Integrations & Wire-up Verification', () => {
    it('FeedList wires EmptyState preset="feed" on empty list', () => {
      assert.ok(
        feedListSource.includes("import { EmptyState } from '@/components/ui/empty-state'"),
        'FeedList must import EmptyState'
      );
      assert.ok(
        feedListSource.includes('preset="feed"'),
        'FeedList must use preset="feed"'
      );
      assert.ok(
        feedListSource.includes('actionLabel={feedFilter === \'all\' ? \'Discover People\' : \'Show All Posts\'}'),
        'FeedList must wire Discover People CTA'
      );
    });

    it('ConversationList wires EmptyState preset="messages" with Find People CTA', () => {
      assert.ok(
        conversationListSource.includes("import { EmptyState } from '@/components/ui/empty-state'"),
        'ConversationList must import EmptyState'
      );
      assert.ok(
        conversationListSource.includes('preset="messages"'),
        'ConversationList must use preset="messages"'
      );
      assert.ok(
        conversationListSource.includes("setIsNewChatModalOpen(true)"),
        'ConversationList must trigger New Chat modal on Find People CTA'
      );
    });

    it('NotificationListView wires EmptyState preset="notifications"', () => {
      assert.ok(
        notificationListSource.includes("import { EmptyState } from '@/components/ui/empty-state'"),
        'NotificationListView must import EmptyState'
      );
      assert.ok(
        notificationListSource.includes('preset="notifications"'),
        'NotificationListView must use preset="notifications"'
      );
    });

    it('CommunityMembersList wires EmptyState preset="community-members" with Join CTA', () => {
      assert.ok(
        communityMembersSource.includes("import { EmptyState } from '@/components/ui/empty-state'"),
        'CommunityMembersList must import EmptyState'
      );
      assert.ok(
        communityMembersSource.includes('preset="community-members"'),
        'CommunityMembersList must use preset="community-members"'
      );
      assert.ok(
        communityMembersSource.includes('joinCommunity(community.id)'),
        'CommunityMembersList must wire join action'
      );
    });

    it('SearchOverlay wires EmptyState preset="search" on empty query results', () => {
      assert.ok(
        searchOverlaySource.includes("import { EmptyState } from '@/components/ui/empty-state'"),
        'SearchOverlay must import EmptyState'
      );
      assert.ok(
        searchOverlaySource.includes('preset="search"'),
        'SearchOverlay must use preset="search"'
      );
    });
  });
});
