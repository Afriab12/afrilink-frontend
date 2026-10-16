'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  Users,
  FileText,
  MessageSquare,
  Building2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Ban,
  RotateCcw,
  Search,
  ExternalLink,
} from 'lucide-react';
import { Report, User, Community, AccountStatus } from '@/types';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { mockBackend, INITIAL_USERS } from '@/services/mockBackend';
import { useSocial } from '@/stores/socialContext';
import { formatDate } from '@/lib/utils';

export const AdminDashboardView: React.FC = () => {
  const { posts, communities, deletePost } = useSocial();
  const [reports, setReports] = useState<Report[]>(mockBackend.getReports());
  const [users, setUsers] = useState<User[]>(mockBackend.getUsers());
  const [activeTab, setActiveTab] = useState<'kpis' | 'reports' | 'users' | 'communities'>('kpis');
  const [userSearchQuery, setUserSearchQuery] = useState('');

  const totalUsers = users.length + 14850;
  const totalPosts = posts.length + 84200;
  const totalComments = 124300;
  const totalMessages = 98200;
  const activeReports = reports.filter((r) => r.status === 'pending');

  const handleResolveReport = (reportId: string) => {
    mockBackend.resolveReport(reportId, 'resolve');
    setReports(mockBackend.getReports());
  };

  const handleDismissReport = (reportId: string) => {
    mockBackend.resolveReport(reportId, 'dismiss');
    setReports(mockBackend.getReports());
  };

  const handleUpdateUserStatus = (userId: string, status: AccountStatus) => {
    mockBackend.updateUserAccountStatus(userId, status);
    setUsers(mockBackend.getUsers());
  };

  const filteredUsers = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-neutral-900 to-[#111827] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-neutral-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#087443]/20 text-[#0e9357] text-xs font-bold mb-2 border border-[#087443]/30">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>AfriLink Trust & Safety Command Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-sora">
              Administration & Moderation
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1">
              Real-time platform health, abuse queues, user restrictions, and community governance.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-neutral-800/80 px-4 py-2 rounded-2xl border border-neutral-700 text-right">
              <p className="text-[10px] text-neutral-400 uppercase font-semibold">Active Queue</p>
              <p className="text-xl font-black text-amber-400 font-sora">
                {activeReports.length} Pending
              </p>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 mt-6 pt-6 border-t border-neutral-800 overflow-x-auto no-scrollbar text-xs font-bold">
          <button
            onClick={() => setActiveTab('kpis')}
            className={`px-4 py-2 rounded-xl transition ${
              activeTab === 'kpis'
                ? 'bg-[#087443] text-white'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            Platform KPIs
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
              activeTab === 'reports'
                ? 'bg-[#087443] text-white'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            Reports Queue{' '}
            {activeReports.length > 0 && (
              <span className="bg-amber-500 text-neutral-900 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {activeReports.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl transition ${
              activeTab === 'users'
                ? 'bg-[#087443] text-white'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            User Management
          </button>
          <button
            onClick={() => setActiveTab('communities')}
            className={`px-4 py-2 rounded-xl transition ${
              activeTab === 'communities'
                ? 'bg-[#087443] text-white'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            Community Oversight
          </button>
        </div>
      </div>

      {/* KPI Section */}
      {activeTab === 'kpis' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-neutral-900 rounded-3xl p-5 border border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center justify-between text-neutral-400 mb-2">
                <span className="text-xs font-bold uppercase">Total Users</span>
                <Users className="w-4 h-4 text-[#087443]" />
              </div>
              <p className="text-2xl font-black text-neutral-900 dark:text-white font-sora">
                {totalUsers.toLocaleString()}
              </p>
              <p className="text-[11px] text-emerald-600 mt-1 font-semibold">+18% this week</p>
            </div>

            <div className="bg-white dark:bg-neutral-900 rounded-3xl p-5 border border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center justify-between text-neutral-400 mb-2">
                <span className="text-xs font-bold uppercase">Daily Active (DAU)</span>
                <Users className="w-4 h-4 text-[#D9A441]" />
              </div>
              <p className="text-2xl font-black text-neutral-900 dark:text-white font-sora">
                9,420
              </p>
              <p className="text-[11px] text-emerald-600 mt-1 font-semibold">63.4% stickiness</p>
            </div>

            <div className="bg-white dark:bg-neutral-900 rounded-3xl p-5 border border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center justify-between text-neutral-400 mb-2">
                <span className="text-xs font-bold uppercase">Total Posts</span>
                <FileText className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-2xl font-black text-neutral-900 dark:text-white font-sora">
                {totalPosts.toLocaleString()}
              </p>
              <p className="text-[11px] text-neutral-500 mt-1">Multi-format feed</p>
            </div>

            <div className="bg-white dark:bg-neutral-900 rounded-3xl p-5 border border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center justify-between text-neutral-400 mb-2">
                <span className="text-xs font-bold uppercase">Communities</span>
                <Building2 className="w-4 h-4 text-purple-500" />
              </div>
              <p className="text-2xl font-black text-neutral-900 dark:text-white font-sora">
                {communities.length + 84}
              </p>
              <p className="text-[11px] text-neutral-500 mt-1">Across 5 regions</p>
            </div>

            <div className="bg-white dark:bg-neutral-900 rounded-3xl p-5 border border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center justify-between text-neutral-400 mb-2">
                <span className="text-xs font-bold uppercase">Messages Sent</span>
                <MessageSquare className="w-4 h-4 text-indigo-500" />
              </div>
              <p className="text-2xl font-black text-neutral-900 dark:text-white font-sora">
                {totalMessages.toLocaleString()}
              </p>
              <p className="text-[11px] text-neutral-500 mt-1">Direct connections</p>
            </div>

            <div className="bg-white dark:bg-neutral-900 rounded-3xl p-5 border border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center justify-between text-neutral-400 mb-2">
                <span className="text-xs font-bold uppercase">Meaningful Connections</span>
                <CheckCircle className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-black text-neutral-900 dark:text-white font-sora">
                48,190
              </p>
              <p className="text-[11px] text-[#087443] font-bold mt-1">North Star Target Met 🎯</p>
            </div>
          </div>
        </div>
      )}

      {/* Reports Queue */}
      {activeTab === 'reports' && (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm">
          <div className="p-5 border-b border-neutral-100 dark:border-neutral-800">
            <h3 className="font-bold text-base text-neutral-900 dark:text-white font-sora">
              Content & Safety Moderation Queue
            </h3>
            <p className="text-xs text-neutral-500">
              Review flagged items according to the AfriLink Prevent → Detect → Review → Act framework
            </p>
          </div>

          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {reports.map((report) => (
              <div key={report.id} className="p-5 space-y-3">
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="danger" size="sm">
                      {report.category}
                    </Badge>
                    <span className="text-xs text-neutral-400">
                      Target: <strong className="text-neutral-700 dark:text-neutral-300 capitalize">{report.targetType}</strong>
                    </span>
                    <span className="text-xs text-neutral-400">• Reported by {report.reporterName}</span>
                  </div>

                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                      report.status === 'pending'
                        ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300'
                        : report.status === 'resolved'
                        ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600'
                    }`}
                  >
                    {report.status}
                  </span>
                </div>

                <div className="bg-neutral-50 dark:bg-neutral-800/60 p-3 rounded-2xl border border-neutral-100 dark:border-neutral-800 text-xs">
                  <p className="font-bold text-neutral-900 dark:text-white">Flagged Content Preview:</p>
                  <p className="text-neutral-600 dark:text-neutral-400 italic mt-0.5">
                    &ldquo;{report.targetPreview}&rdquo;
                  </p>
                  {report.details && (
                    <p className="text-neutral-500 mt-1">Reporter details: {report.details}</p>
                  )}
                </div>

                {report.status === 'pending' && (
                  <div className="flex items-center gap-2 pt-1">
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleResolveReport(report.id)}
                    >
                      <XCircle className="w-3.5 h-3.5 mr-1" /> Remove Content & Penalize
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDismissReport(report.id)}
                    >
                      <CheckCircle className="w-3.5 h-3.5 mr-1" /> Dismiss (No Violation)
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User Management */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm">
          <div className="p-5 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="font-bold text-base text-neutral-900 dark:text-white font-sora">
                User Management
              </h3>
              <p className="text-xs text-neutral-500">Manage account states, warnings, and bans</p>
            </div>

            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search user..."
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-xl text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {filteredUsers.map((u) => (
              <div
                key={u.id}
                className="p-4 flex items-center justify-between flex-wrap gap-3"
              >
                <div className="flex items-center gap-3">
                  <Avatar src={u.avatarUrl} alt={u.fullName} size="md" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-neutral-900 dark:text-white">
                        {u.fullName}
                      </span>
                      <span className="text-xs text-neutral-400">@{u.username}</span>
                      <Badge
                        size="sm"
                        variant={
                          u.status === 'active'
                            ? 'emerald'
                            : u.status === 'warning'
                            ? 'gold'
                            : 'danger'
                        }
                      >
                        {u.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-neutral-500">
                      {u.country} • {u.email} • Role: {u.role}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link href={`/profile/${u.username}`}>
                    <Button size="sm" variant="outline">
                      <ExternalLink className="w-3.5 h-3.5 mr-1" /> View Profile
                    </Button>
                  </Link>

                  {u.status === 'active' ? (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateUserStatus(u.id, 'warning')}
                        className="text-amber-600 border-amber-300"
                      >
                        Warn
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleUpdateUserStatus(u.id, 'suspended')}
                      >
                        <Ban className="w-3.5 h-3.5 mr-1" /> Suspend
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleUpdateUserStatus(u.id, 'active')}
                    >
                      <RotateCcw className="w-3.5 h-3.5 mr-1" /> Restore Account
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Community Oversight */}
      {activeTab === 'communities' && (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-neutral-900 dark:text-white font-sora">
            Community Oversight
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {communities.map((comm) => (
              <div
                key={comm.id}
                className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 flex items-center justify-between"
              >
                <div>
                  <h4 className="font-bold text-sm text-neutral-900 dark:text-white">
                    {comm.name}
                  </h4>
                  <p className="text-xs text-neutral-500">
                    {comm.category} • {comm.memberCount} members
                  </p>
                  <p className="text-[11px] text-emerald-600 mt-1">0 pending violations</p>
                </div>
                <Link href={`/communities/${comm.id}`}>
                  <Button size="sm" variant="outline">
                    View
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
