import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { communityService } from '../communityService.ts';
import { ApiError } from '../apiClient.ts';
import type { CreateCommunityInput } from '../../types/index.ts';

describe('CommunityService — African Communities & Groups Engine', () => {
  describe('generateSlug', () => {
    it('should generate URL-safe slugs from pan-African community names', () => {
      assert.equal(
        communityService.generateSlug('AfCFTA Cross-Border Trade & SMEs'),
        'afcfta-cross-border-trade-smes'
      );
      assert.equal(
        communityService.generateSlug('East African Climate & AgriTech'),
        'east-african-climate-agritech'
      );
      assert.equal(
        communityService.generateSlug('Lagos & Accra Tech Founders (2026)'),
        'lagos-accra-tech-founders-2026'
      );
    });

    it('should handle accents, extra spaces, and edge cases', () => {
      assert.equal(
        communityService.generateSlug('  Café Africain & Côte d’Ivoire Tech  '),
        'cafe-africain-cote-divoire-tech'
      );
      assert.equal(
        communityService.generateSlug('---Special---Characters---'),
        'special-characters'
      );
    });
  });

  describe('validateCommunityInput', () => {
    const validPayload: CreateCommunityInput = {
      name: 'Nairobi AI & Robotics Circle',
      description: 'A pan-African collaborative group exploring machine learning applications for Kenya and East Africa.',
      category: 'Technology',
      country: 'Kenya',
      isPrivate: false,
      rules: ['Respect intellectual property and open source licenses.', 'No hate speech or unsolicited promotional spam.'],
    };

    it('should pass validation for well-formed community payload', () => {
      assert.doesNotThrow(() => {
        communityService.validateCommunityInput(validPayload);
      });
    });

    it('should throw VALIDATION_ERROR (400) if name is less than 3 characters', () => {
      assert.throws(
        () => {
          communityService.validateCommunityInput({ ...validPayload, name: 'AI' });
        },
        (err: any) => {
          assert.equal(err instanceof ApiError, true);
          assert.equal(err.code, 'VALIDATION_ERROR');
          assert.equal(err.status, 400);
          assert.match(err.message, /between 3 and 80 characters/);
          return true;
        }
      );
    });

    it('should throw VALIDATION_ERROR (400) if name exceeds 80 characters', () => {
      const longName = 'A'.repeat(85);
      assert.throws(
        () => {
          communityService.validateCommunityInput({ ...validPayload, name: longName });
        },
        (err: any) => {
          assert.equal(err instanceof ApiError, true);
          assert.equal(err.code, 'VALIDATION_ERROR');
          assert.equal(err.status, 400);
          return true;
        }
      );
    });

    it('should throw VALIDATION_ERROR (400) if description is less than 10 characters', () => {
      assert.throws(
        () => {
          communityService.validateCommunityInput({ ...validPayload, description: 'Short' });
        },
        (err: any) => {
          assert.equal(err instanceof ApiError, true);
          assert.equal(err.code, 'VALIDATION_ERROR');
          assert.equal(err.status, 400);
          assert.match(err.message, /between 10 and 1000 characters/);
          return true;
        }
      );
    });

    it('should throw VALIDATION_ERROR (400) if category is missing', () => {
      assert.throws(
        () => {
          communityService.validateCommunityInput({ ...validPayload, category: '   ' });
        },
        (err: any) => {
          assert.equal(err instanceof ApiError, true);
          assert.equal(err.code, 'VALIDATION_ERROR');
          assert.equal(err.status, 400);
          assert.match(err.message, /African vertical category is required/);
          return true;
        }
      );
    });

    it('should throw VALIDATION_ERROR (400) if rules array is empty or has only whitespace', () => {
      assert.throws(
        () => {
          communityService.validateCommunityInput({ ...validPayload, rules: [] });
        },
        (err: any) => {
          assert.equal(err instanceof ApiError, true);
          assert.equal(err.code, 'VALIDATION_ERROR');
          assert.equal(err.status, 400);
          assert.match(err.message, /rule or conduct guideline/);
          return true;
        }
      );
    });
  });

  describe('getCommunities & getCommunityByIdOrSlug', () => {
    it('should retrieve communities with pagination metadata', async () => {
      const result = await communityService.getCommunities({ limit: 10 });
      assert.equal(Array.isArray(result.data), true);
      assert.equal(result.data.length > 0, true);
      assert.equal(typeof result.hasMore, 'boolean');
      assert.equal(typeof result.total, 'number');
    });

    it('should filter communities by category', async () => {
      const result = await communityService.getCommunities({ category: 'Business' });
      assert.equal(result.data.length > 0, true);
      result.data.forEach((c) => {
        assert.equal(c.category.toLowerCase(), 'business');
      });
    });

    it('should find community by ID or slug', async () => {
      const byId = await communityService.getCommunityByIdOrSlug('comm-afrotech');
      assert.equal(byId.id, 'comm-afrotech');
      assert.equal(byId.name, 'AfroTech Innovators');

      const bySlug = await communityService.getCommunityByIdOrSlug('afrotech-innovators');
      assert.equal(bySlug.id, 'comm-afrotech');
    });

    it('should throw 404 NOT_FOUND for non-existent community', async () => {
      await assert.rejects(
        async () => {
          await communityService.getCommunityByIdOrSlug('non-existent-community-xyz');
        },
        (err: any) => {
          assert.equal(err instanceof ApiError, true);
          assert.equal(err.status, 404);
          return true;
        }
      );
    });
  });

  describe('createCommunity', () => {
    it('should successfully create a new community with valid payload and owner role', async () => {
      const newComm = await communityService.createCommunity({
        name: 'Sahel Renewable Energy Circle',
        description: 'Accelerating solar microgrids and clean tech infrastructure across the Sahel corridor.',
        category: 'Technology',
        country: 'Senegal',
        isPrivate: false,
        rules: ['Focus on sustainable and decentralized solar engineering.', 'Respect local community governance.'],
      });

      assert.equal(typeof newComm.id, 'string');
      assert.equal(newComm.name, 'Sahel Renewable Energy Circle');
      assert.equal(newComm.isJoined, true);
      assert.equal(newComm.myRole, 'owner');
      assert.equal(newComm.memberCount, 1);
    });
  });

  describe('joinCommunity & leaveCommunity Lifecycle', () => {
    it('should join an unjoined public community and increment member count', async () => {
      // comm-nairobi-climate is private in mock seed, comm-afrotech is joined.
      // Let's create a temporary public community to test join/leave lifecycle
      const testComm = await communityService.createCommunity({
        name: 'Addis Ababa Fintech Hub',
        description: 'Connecting Ethiopian fintech developers and mobile money builders.',
        category: 'Business',
        country: 'Ethiopia',
        isPrivate: false,
        rules: ['Be helpful and collaborative.'],
      });

      // Initially joined as creator
      assert.equal(testComm.isJoined, true);
      const initialCount = testComm.memberCount;

      // Leave
      const leaveRes = await communityService.leaveCommunity(testComm.id);
      assert.equal(leaveRes.success, true);
      assert.equal(leaveRes.memberCount, initialCount - 1);

      // Re-join
      const joinRes = await communityService.joinCommunity(testComm.id);
      assert.equal(joinRes.status, 'joined');
      assert.equal(joinRes.memberCount, initialCount);
    });

    it('should return pending status when requesting membership to a private hub', async () => {
      const privateComm = await communityService.getCommunityByIdOrSlug('comm-nairobi-climate');
      // comm-nairobi-climate isPrivate: true, isJoined: false
      if (!privateComm.isJoined) {
        const joinRes = await communityService.joinCommunity(privateComm.id);
        assert.equal(joinRes.status, 'pending');
      }
    });
  });

  describe('getCommunityMembers & RBAC', () => {
    it('should return community members with role taxonomy', async () => {
      const members = await communityService.getCommunityMembers('comm-afrotech');
      assert.equal(Array.isArray(members), true);
      assert.equal(members.length > 0, true);

      // Verify that every member has valid role
      members.forEach((m) => {
        assert.equal(['owner', 'moderator', 'member'].includes(m.role), true);
        assert.equal(typeof m.user.fullName, 'string');
      });
    });

    it('should support filtering members by role', async () => {
      const owners = await communityService.getCommunityMembers('comm-afrotech', 'owner');
      owners.forEach((m) => {
        assert.equal(m.role, 'owner');
      });
    });
  });

  describe('getCommunityPosts & Privacy Protection Gate', () => {
    it('should return posts for an accessible community', async () => {
      const result = await communityService.getCommunityPosts('comm-afrotech');
      assert.equal(Array.isArray(result.data), true);
      result.data.forEach((post) => {
        assert.equal(post.communityId, 'comm-afrotech');
      });
    });

    it('should throw 403 FORBIDDEN when attempting to read private community posts without membership', async () => {
      // comm-nairobi-climate is private and unjoined
      await assert.rejects(
        async () => {
          await communityService.getCommunityPosts('comm-nairobi-climate');
        },
        (err: any) => {
          assert.equal(err instanceof ApiError, true);
          assert.equal(err.status, 403);
          assert.equal(err.code, 'FORBIDDEN');
          assert.match(err.message, /Private community discussions are only visible to approved members/);
          return true;
        }
      );
    });
  });
});
