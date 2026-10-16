import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { messagingService } from '../messagingService.ts';
import { ApiError } from '../apiClient.ts';
import { mockBackend } from '../mockBackend.ts';
import type { SendMessagePayload } from '../../types/index.ts';

describe('MessagingService — Direct Real-Time Messaging Engine', () => {
  describe('validateMessagePayload', () => {
    it('should throw VALIDATION_ERROR (400) when both text content and media are empty', () => {
      assert.throws(
        () => {
          messagingService.validateMessagePayload({ content: '   ' });
        },
        (err: any) => {
          assert.equal(err instanceof ApiError, true);
          assert.equal(err.code, 'VALIDATION_ERROR');
          assert.equal(err.status, 400);
          assert.match(err.message, /either text content or a media attachment/);
          return true;
        }
      );
    });

    it('should throw VALIDATION_ERROR (400) when content exceeds 2000 characters', () => {
      const longMessage = 'A'.repeat(2005);
      assert.throws(
        () => {
          messagingService.validateMessagePayload({ content: longMessage });
        },
        (err: any) => {
          assert.equal(err instanceof ApiError, true);
          assert.equal(err.code, 'VALIDATION_ERROR');
          assert.equal(err.status, 400);
          assert.match(err.message, /cannot exceed 2000 characters/);
          return true;
        }
      );
    });

    it('should pass validation when text content is present within bounds', () => {
      assert.doesNotThrow(() => {
        messagingService.validateMessagePayload({
          content: 'Hello brother, looking forward to our fintech sync in Nairobi tomorrow!',
        });
      });
    });

    it('should pass validation when text is empty but mediaUrl is provided', () => {
      assert.doesNotThrow(() => {
        messagingService.validateMessagePayload({
          content: '',
          mediaUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df',
        });
      });
    });
  });

  describe('startConversation & Blocking Restrictions', () => {
    it('should throw VALIDATION_ERROR (400) if recipient ID is missing', async () => {
      await assert.rejects(
        async () => {
          await messagingService.startConversation('');
        },
        (err: any) => {
          assert.equal(err instanceof ApiError, true);
          assert.equal(err.code, 'VALIDATION_ERROR');
          assert.equal(err.status, 400);
          return true;
        }
      );
    });

    it('should throw 403 FORBIDDEN when attempting to message a blocked user', async () => {
      // Temporarily block user-tendai in mockBackend
      const blocked = mockBackend.getBlockedUsers();
      if (!blocked.includes('user-tendai')) {
        mockBackend.blockUser('user-tendai');
      }

      await assert.rejects(
        async () => {
          await messagingService.startConversation('user-tendai');
        },
        (err: any) => {
          assert.equal(err instanceof ApiError, true);
          assert.equal(err.status, 403);
          assert.equal(err.code, 'FORBIDDEN');
          assert.match(err.message, /privacy or blocking restrictions/);
          return true;
        }
      );
    });

    it('should return a valid conversation when recipient is unblocked', async () => {
      const conv = await messagingService.startConversation('user-amina');
      assert.equal(typeof conv.id, 'string');
      assert.equal(conv.participant.id, 'user-amina');
      assert.equal(typeof conv.unreadCount, 'number');
    });
  });

  describe('getConversations & getConversationById', () => {
    it('should return conversations list', async () => {
      const convs = await messagingService.getConversations('primary');
      assert.equal(Array.isArray(convs), true);
      assert.equal(convs.length > 0, true);
      convs.forEach((c) => {
        assert.equal(typeof c.id, 'string');
        assert.equal(typeof c.participant.fullName, 'string');
      });
    });

    it('should retrieve single conversation by ID', async () => {
      const all = await messagingService.getConversations();
      const first = all[0];
      const retrieved = await messagingService.getConversationById(first.id);
      assert.equal(retrieved.id, first.id);
      assert.equal(retrieved.participant.id, first.participant.id);
    });

    it('should throw 404 NOT_FOUND for non-existent conversation', async () => {
      await assert.rejects(
        async () => {
          await messagingService.getConversationById('non-existent-conv-999');
        },
        (err: any) => {
          assert.equal(err instanceof ApiError, true);
          assert.equal(err.status, 404);
          return true;
        }
      );
    });
  });

  describe('getMessages & sendMessage', () => {
    it('should retrieve messages for a conversation', async () => {
      const all = await messagingService.getConversations();
      const conv = all[0];
      const result = await messagingService.getMessages(conv.id);
      assert.equal(Array.isArray(result.messages), true);
    });

    it('should send a message and append to conversation history', async () => {
      const all = await messagingService.getConversations();
      const conv = all[0];

      const sent = await messagingService.sendMessage(conv.id, {
        content: 'Building Pan-African digital bridges from Accra to Kigali! 🚀',
      });

      assert.equal(typeof sent.id, 'string');
      assert.equal(sent.content, 'Building Pan-African digital bridges from Accra to Kigali! 🚀');
      assert.equal(sent.conversationId, conv.id);
      assert.equal(sent.isRead, true);
    });
  });

  describe('markConversationAsRead & acceptMessageRequest', () => {
    it('should mark conversation messages as read and clear unread count', async () => {
      const all = await messagingService.getConversations();
      const conv = all[0];

      const result = await messagingService.markConversationAsRead(conv.id);
      assert.equal(result.success, true);

      const refreshed = await messagingService.getConversationById(conv.id);
      assert.equal(refreshed.unreadCount, 0);
    });

    it('should transition message request to standard inbox conversation', async () => {
      // Create a temporary conversation with isRequest = true
      const all = mockBackend.getConversations();
      if (all.length > 0) {
        all[0].isRequest = true;
        const accepted = await messagingService.acceptMessageRequest(all[0].id);
        assert.equal(accepted.isRequest, false);
      }
    });
  });

  describe('WebSocket Gateway Presence & Event Management', () => {
    it('should register and deregister event listeners cleanly', () => {
      let fired = false;
      const handler = () => {
        fired = true;
      };

      messagingService.on('test:event', handler);
      (messagingService as any).emitLocal('test:event', { ok: true });
      assert.equal(fired, true);

      fired = false;
      messagingService.off('test:event', handler);
      (messagingService as any).emitLocal('test:event', { ok: true });
      assert.equal(fired, false);
    });

    it('should safely report disconnected state in Node test environment', () => {
      const state = messagingService.getConnectionState();
      assert.equal(['connected', 'connecting', 'disconnected'].includes(state), true);
    });
  });
});
