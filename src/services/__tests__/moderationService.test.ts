import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { moderationService } from '../moderationService.ts';
import { ApiError } from '../apiClient.ts';
import { mockBackend } from '../mockBackend.ts';

describe('ModerationService — Trust, Safety & Abuse Reporting', () => {
  describe('validateReportInput', () => {
    it('should throw VALIDATION_ERROR (400) if target ID is missing', () => {
      assert.throws(
        () => {
          moderationService.validateReportInput({
            targetType: 'post',
            targetId: '  ',
            targetPreview: 'Spam post',
            category: 'Spam',
          });
        },
        (err: any) => {
          assert.equal(err instanceof ApiError, true);
          assert.equal(err.code, 'VALIDATION_ERROR');
          assert.equal(err.status, 400);
          assert.match(err.message, /Target content or user ID is required/);
          return true;
        }
      );
    });

    it('should throw VALIDATION_ERROR (400) if target type is invalid', () => {
      assert.throws(
        () => {
          moderationService.validateReportInput({
            targetType: 'invalid_type' as any,
            targetId: 'target-123',
            targetPreview: 'Spam post',
            category: 'Spam',
          });
        },
        (err: any) => {
          assert.equal(err instanceof ApiError, true);
          assert.equal(err.code, 'VALIDATION_ERROR');
          assert.equal(err.status, 400);
          assert.match(err.message, /Invalid target type/);
          return true;
        }
      );
    });

    it('should throw VALIDATION_ERROR (400) if report reason is unrecognized', () => {
      assert.throws(
        () => {
          moderationService.validateReportInput({
            targetType: 'post',
            targetId: 'post-123',
            targetPreview: 'Sample post',
            category: 'Other',
            reason: 'unrecognized_reason_xyz' as any,
          });
        },
        (err: any) => {
          assert.equal(err instanceof ApiError, true);
          assert.equal(err.code, 'VALIDATION_ERROR');
          assert.equal(err.status, 400);
          assert.match(err.message, /Invalid report reason/);
          return true;
        }
      );
    });

    it('should pass validation for well-formed report input', () => {
      assert.doesNotThrow(() => {
        moderationService.validateReportInput({
          targetType: 'user',
          targetId: 'user-troll',
          targetPreview: 'Troll profile',
          category: 'Harassment',
          reason: 'harassment',
          details: 'Repeated offensive comments across multiple posts.',
        });
      });
    });
  });

  describe('submitReport & getMyReports', () => {
    it('should submit abuse report and record pending status', async () => {
      const report = await moderationService.submitReport({
        targetType: 'comment',
        targetId: 'comm-abuse-1',
        targetPreview: 'Offensive language in discussion',
        category: 'Hate',
        reason: 'hate_speech',
        details: 'Violates African community mutual respect guideline.',
      });

      assert.equal(typeof report.id, 'string');
      assert.equal(report.status, 'pending');
      assert.equal(report.category, 'Hate');
      assert.equal(report.targetType, 'comment');
    });

    it('should retrieve reports filed by the current user', async () => {
      const myReports = await moderationService.getMyReports();
      assert.equal(Array.isArray(myReports), true);
    });
  });

  describe('User Blocking Lifecycle', () => {
    it('should throw VALIDATION_ERROR (400) if blocked user ID is empty', async () => {
      await assert.rejects(
        async () => {
          await moderationService.blockUser('');
        },
        (err: any) => {
          assert.equal(err instanceof ApiError, true);
          assert.equal(err.status, 400);
          return true;
        }
      );
    });

    it('should throw INVALID_ACTION (400) when attempting to block self', async () => {
      const currentUser = mockBackend.getCurrentUser();
      await assert.rejects(
        async () => {
          await moderationService.blockUser(currentUser.id);
        },
        (err: any) => {
          assert.equal(err instanceof ApiError, true);
          assert.equal(err.status, 400);
          assert.equal(err.code, 'INVALID_ACTION');
          assert.match(err.message, /cannot block yourself/);
          return true;
        }
      );
    });

    it('should block a user and unblock them successfully', async () => {
      const targetUserId = 'user-tendai';

      // Block
      const blockRes = await moderationService.blockUser(targetUserId);
      assert.equal(blockRes.success, true);
      assert.equal(blockRes.blockedUserId, targetUserId);

      // Verify in blocked list
      const blockedList = await moderationService.getBlockedUsers();
      assert.equal(blockedList.some((u) => u.id === targetUserId), true);

      // Unblock
      const unblockRes = await moderationService.unblockUser(targetUserId);
      assert.equal(unblockRes.success, true);

      // Verify removed from blocked list
      const updatedBlockedList = await moderationService.getBlockedUsers();
      assert.equal(updatedBlockedList.some((u) => u.id === targetUserId), false);
    });
  });

  describe('User Settings & Account Deletion', () => {
    it('should retrieve and update user privacy and notification settings', async () => {
      const initial = await moderationService.getUserSettings();
      assert.equal(typeof initial.privacy.profileVisibility, 'string');
      assert.equal(typeof initial.notifications.pushNotifs, 'boolean');

      const updated = await moderationService.updateUserSettings({
        privacy: {
          profileVisibility: 'friends',
          allowFriendRequests: 'friends_of_friends',
          allowMessages: 'friends',
          showFriendList: false,
        },
      });

      assert.equal(updated.privacy.profileVisibility, 'friends');
      assert.equal(updated.privacy.showFriendList, false);
    });

    it('should execute account soft-deletion in compliance with privacy standards', async () => {
      const res = await moderationService.deleteAccount();
      assert.equal(res.success, true);
      assert.match(res.message, /compliance with data privacy standards/);
    });
  });
});
