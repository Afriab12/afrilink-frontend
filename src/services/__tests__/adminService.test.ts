import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { adminService } from '../adminService.ts';
import { ApiError } from '../apiClient.ts';
import type { User } from '../../types/index.ts';

describe('AdminService — Moderation & Administrative Command Center', () => {
  const adminUser: User = {
    id: 'admin-1',
    username: 'admin_kwame',
    fullName: 'Kwame Admin',
    email: 'admin@afrilink.africa',
    bio: 'Platform Administrator',
    avatarUrl: '',
    coverImageUrl: '',
    country: 'Ghana',
    countryCode: 'GH',
    city: 'Accra',
    interests: [],
    joinedDate: '2024-01-01',
    role: 'admin',
    status: 'active',
    followersCount: 0,
    followingCount: 0,
    friendsCount: 0,
  };

  const regularUser: User = {
    ...adminUser,
    id: 'user-regular',
    role: 'user',
  };

  describe('RBAC Access Verification', () => {
    it('should grant access to admin and community manager roles', () => {
      assert.equal(adminService.hasAdminAccess(adminUser), true);
      assert.equal(
        adminService.hasAdminAccess({ ...adminUser, role: 'community_manager' }),
        true
      );
    });

    it('should deny access to standard users', () => {
      assert.equal(adminService.hasAdminAccess(regularUser), false);
      assert.equal(adminService.hasAdminAccess(null), false);
    });

    it('should throw 403 FORBIDDEN when asserting admin access on regular user', () => {
      assert.throws(
        () => {
          adminService.assertAdminAccess(regularUser);
        },
        (err: any) => {
          assert.equal(err instanceof ApiError, true);
          assert.equal(err.code, 'FORBIDDEN');
          assert.equal(err.status, 403);
          return true;
        }
      );
    });
  });

  describe('Platform KPIs & Metrics', () => {
    it('should retrieve platform metrics and system health', async () => {
      const metrics = await adminService.getPlatformMetrics();
      assert.equal(typeof metrics.totalUsers, 'number');
      assert.equal(metrics.totalUsers > 0, true);
      assert.equal(typeof metrics.pendingReportsCount, 'number');
      assert.equal(metrics.systemHealth, 'optimal');
    });
  });

  describe('Moderation Queue & Action Dispatch', () => {
    it('should retrieve moderation reports and filter by status', async () => {
      const allReports = await adminService.getModerationReports();
      assert.equal(Array.isArray(allReports), true);

      const pending = await adminService.getModerationReports('pending');
      pending.forEach((r) => {
        assert.equal(r.status, 'pending');
      });
    });

    it('should throw VALIDATION_ERROR (400) if report ID is empty', async () => {
      await assert.rejects(
        async () => {
          await adminService.executeReportAction('', { action: 'resolve' });
        },
        (err: any) => {
          assert.equal(err instanceof ApiError, true);
          assert.equal(err.status, 400);
          return true;
        }
      );
    });

    it('should execute moderation action on a report and record audit log', async () => {
      const reports = await adminService.getModerationReports('pending');
      if (reports.length > 0) {
        const targetReport = reports[0];
        const res = await adminService.executeReportAction(targetReport.id, {
          action: 'warn_user',
          note: 'Issued formal community warning for spam violation',
        });

        assert.equal(res.success, true);
        assert.equal(res.report.status, 'resolved');

        // Verify audit log entry was created
        const logs = await adminService.getAuditLogs();
        assert.equal(logs.some((l) => l.targetId === targetReport.id), true);
      }
    });
  });

  describe('User Status Management', () => {
    it('should search users and update user standing', async () => {
      const users = await adminService.getUsers('amina');
      assert.equal(users.length > 0, true);

      const target = users[0];
      const updated = await adminService.updateUserStatus(target.id, 'warning');
      assert.equal(updated.status, 'warning');

      // Restore to active
      const restored = await adminService.updateUserStatus(target.id, 'active');
      assert.equal(restored.status, 'active');
    });
  });

  describe('Audit Logs Trail', () => {
    it('should retrieve chronological administrative audit logs', async () => {
      const logs = await adminService.getAuditLogs();
      assert.equal(Array.isArray(logs), true);
      assert.equal(logs.length > 0, true);
      logs.forEach((log) => {
        assert.equal(typeof log.id, 'string');
        assert.equal(typeof log.actorName, 'string');
        assert.equal(typeof log.action, 'string');
      });
    });
  });
});
