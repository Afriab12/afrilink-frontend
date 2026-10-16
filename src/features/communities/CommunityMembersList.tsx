'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Community, CommunityMember, CommunityRole } from '@/types';
import { communityService } from '@/services/communityService';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { ShieldCheck, Search, Users, Crown, ShieldAlert } from 'lucide-react';

interface CommunityMembersListProps {
  community: Community;
}

export const CommunityMembersList: React.FC<CommunityMembersListProps> = ({ community }) => {
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<'all' | 'leaders' | 'members'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    communityService
      .getCommunityMembers(community.id)
      .then((data) => {
        if (isMounted) {
          setMembers(data);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [community.id]);

  const filteredMembers = members.filter((member) => {
    const matchesRole =
      selectedRole === 'all'
        ? true
        : selectedRole === 'leaders'
        ? member.role === 'owner' || member.role === 'moderator'
        : member.role === 'member';

    const matchesSearch =
      member.user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.user.country?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesRole && matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* Search & Filters */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl p-4 border border-neutral-200/80 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search members by name or country..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-neutral-50 dark:bg-neutral-800 rounded-2xl text-xs text-neutral-900 dark:text-white placeholder-neutral-400 border border-transparent focus:border-[#087443] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto text-xs">
          <button
            onClick={() => setSelectedRole('all')}
            className={`px-3 py-1.5 rounded-full font-bold transition ${
              selectedRole === 'all'
                ? 'bg-[#087443] text-white'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
            }`}
          >
            All ({members.length})
          </button>
          <button
            onClick={() => setSelectedRole('leaders')}
            className={`px-3 py-1.5 rounded-full font-bold transition ${
              selectedRole === 'leaders'
                ? 'bg-[#087443] text-white'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
            }`}
          >
            Leadership
          </button>
          <button
            onClick={() => setSelectedRole('members')}
            className={`px-3 py-1.5 rounded-full font-bold transition ${
              selectedRole === 'members'
                ? 'bg-[#087443] text-white'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
            }`}
          >
            Members
          </button>
        </div>
      </div>

      {/* Grid of Members */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-neutral-900 rounded-2xl p-4 border border-neutral-200 dark:border-neutral-800 animate-pulse flex items-center gap-3"
            >
              <div className="w-12 h-12 rounded-full bg-neutral-200 dark:bg-neutral-800" />
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-1/2" />
                <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredMembers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredMembers.map((member) => (
            <div
              key={member.id}
              className="bg-white dark:bg-neutral-900 rounded-2xl p-4 border border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between shadow-sm hover:border-neutral-300 dark:hover:border-neutral-700 transition"
            >
              <div className="flex items-center gap-3">
                <Avatar
                  src={member.user.avatarUrl}
                  alt={member.user.fullName}
                  size="md"
                  className="ring-1 ring-neutral-200 dark:ring-neutral-700"
                />
                <div>
                  <Link
                    href={`/profile/${member.user.username}`}
                    className="font-bold text-sm text-neutral-900 dark:text-white hover:text-[#087443] transition font-sora inline-flex items-center gap-1"
                  >
                    {member.user.fullName}
                  </Link>
                  <p className="text-xs text-neutral-500">
                    @{member.user.username} • {member.user.country}
                  </p>
                </div>
              </div>

              {member.role === 'owner' ? (
                <Badge variant="gold" size="sm">
                  <Crown className="w-3 h-3 mr-1" />
                  Owner
                </Badge>
              ) : member.role === 'moderator' ? (
                <Badge variant="emerald" size="sm">
                  <ShieldCheck className="w-3 h-3 mr-1" />
                  Moderator
                </Badge>
              ) : (
                <Badge variant="neutral" size="sm">
                  Member
                </Badge>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-10 text-center border border-neutral-200 dark:border-neutral-800">
          <Users className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-neutral-600 dark:text-neutral-400">
            No community members match your filter criteria.
          </p>
        </div>
      )}
    </div>
  );
};
