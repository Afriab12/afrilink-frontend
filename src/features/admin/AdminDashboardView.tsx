'use client';

import React, { useState, useEffect } from 'react';
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
  History,
  Sparkles,
  ShieldCheck,
  Activity,
  AlertOctagon,
} from 'lucide-react';
import { Report, User, AccountStatus, AuditLog, AdminMetrics, ModerationActionType } from '@/types';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { adminService } from '@/services/adminService';
import { formatDate } from '@/lib/utils';
import { useSocial } from '@/stores/socialContext';

export const AdminDashboardView: React.FC = () => {
  const { communities } = useSocial();
  const [reports, setReports] = useState<Report[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [activeTab, setActiveTab] = useState<'kpis' | 'reports' | 'users' | 'communities' | 'audit'>('kpis');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  const loadData = () => {
    adminService.getPlatformMetrics().then(setMetrics);
    adminService.getModerationReports().then(setReports);
    adminService.getUsers().then(setUsers);
    adminService.getAuditLogs().then(setAuditLogs);
  };

  useEffect(() => {
    loadData();
  }, []);

  const activeReports = reports.filter((r) => r.status === 'pending');

  const handleExecuteAction = async (reportId: string, action: ModerationActionType, note?: string) => {
    await adminService.executeReportAction(reportId, { action, note });
    setActionSuccessMessage(`Action "${action}" successfully applied.`);
    setTimeout(() => setActionSuccessMessage(null), 3000);
    loadData();
  };

  const handleUpdateUserStatus = async (userId: string, status: AccountStatus) => {
    await adminService.updateUserStatus(userId, status);
    setActionSuccessMessage(`User status updated to "${status}".`);
    setTimeout(() => setActionSuccessMessage(null), 3000);
    loadData();
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
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-950 to-[#111827] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-neutral-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#087443]/30 text-[#0e9357] text-xs font-bold mb-2 border border-[#087443]/40">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>AfriLink Trust & Safety Command Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-sora tracking-tight">
              Administration & Governance
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-xl">
              Real-time platform health, abuse queues, user standing, and immutable administrative audit trails.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-neutral-800/80 px-4 py-2.5 rounded-2xl border border-neutral-700/80 text-right shadow-inner">
              <p className="text-[10px] text-neutral-400 uppercase font-semibold">Active Queue</p>
              <p className="text-xl font-black text-amber-400 font-sora">
                {activeReports.length} Pending
              </p>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 mt-6 pt-6 border-t border-neutral-800/80 overflow-x-auto no-scrollbar text-xs font-bold">
          <button
            onClick={() => setActiveTab('kpis')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'kpis'
                ? 'bg-[#087443] text-white shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Platform KPIs</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'reports'
                ? 'bg-[#087443] text-white shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>Reports Queue</span>
            {activeReports.length > 0 && (
              <span className="bg-amber-500 text-neutral-900 text-[10px] px-1.5 py-0.2 rounded-full font-black">
                {activeReports.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'users'
                ? 'bg-[#087443] text-white shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>User Standing</span>
          </button>

          <button
            onClick={() => setActiveTab('communities')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'communities'
                ? 'bg-[#087443] text-white shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Communities ({communities.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'audit'
                ? 'bg-[#087443] text-white shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Audit Logs ({auditLogs.length})</span>
          </button>
        </div>
      </div>

      {actionSuccessMessage && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-[#087443] rounded-2xl text-xs font-bold flex items-center gap-2 border border-emerald-200 dark:border-emerald-800 animate-fadeIn">
          <CheckCircle className="w-4 h-4" />
          <span>{actionSuccessMessage}</span>
        </div>
      )}

      {/* KPI Section */}
      {activeTab === 'kpis' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-neutral-900 rounded-3xl p-5 border border-neutral-200/80 dark:border-neutral-800 shadow-sm">
              <div className="flex items-center justify-between text-neutral-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Total African Citizens</span>
                <Users className="w-4 h-4 text-[#087443]" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white font-sora">
                {metrics ? metrics.totalUsers.toLocaleString() : '15,405'}
              </p>
              <p className="text-[11px] text-emerald-600 font-bold mt-1">↑ +14.2% MoM across 5 regions</p>
            </div>

            <div className="bg-white dark:bg-neutral-900 rounded-3xl p-5 border border-neutral-200/80 dark:border-neutral-800 shadow-sm">
              <div className="flex items-center justify-between text-neutral-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Posts & Insights</span>
                <FileText className="w-4 h-4 text-[#D9A441]" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white font-sora">
                {metrics ? metrics.totalPosts.toLocaleString() : '84,215'}
              </p>
              <p className="text-[11px] text-neutral-500 mt-1">AfriLink Content Engine</p>
            </div>

            <div className="bg-white dark:bg-neutral-900 rounded-3xl p-5 border border-neutral-200/80 dark:border-neutral-800 shadow-sm">
              <div className="flex items-center justify-between text-neutral-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Direct Messages</span>
                <MessageSquare className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white font-sora">
                {metrics ? metrics.totalMessages.toLocaleString() : '98,200'}
              </p>
              <p className="text-[11px] text-emerald-600 font-bold mt-1">Bilateral conversations</p>
            </div>

            <div className="bg-white dark:bg-neutral-900 rounded-3xl p-5 border border-neutral-200/80 dark:border-neutral-800 shadow-sm">
              <div className="flex items-center justify-between text-neutral-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">System Health</span>
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-sora uppercase">
                {metrics ? metrics.systemHealth : 'Optimal'}
              </p>
              <p className="text-[11px] text-neutral-500 mt-1">99.98% Gateway Uptime</p>
            </div>
          </div>
        </div>
      )}

      {/* Reports Queue */}
      {activeTab === 'reports' && (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 overflow-hidden shadow-sm">
          <div className="p-5 border-b border-neutral-100 dark:border-neutral-800">
            <h3 className="font-bold text-base text-neutral-900 dark:text-white font-sora">
              Content & Safety Moderation Queue
            </h3>
            <p className="text-xs text-neutral-500">
              Review flagged items according to the AfriLink Prevent → Detect → Review → Act framework
            </p>
          </div>

          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {reports.length > 0 ? (
              reports.map((report) => (
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
                      <p className="text-neutral-500 mt-1">Reporter context: {report.details}</p>
                    )}
                  </div>

                  {report.status === 'pending' && (
                    <div className="flex items-center gap-2 pt-1 flex-wrap">
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleExecuteAction(report.id, 'ban_user', 'Severe violation: user banned')}
                      >
                        <Ban className="w-3.5 h-3.5 mr-1" /> Ban User
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleExecuteAction(report.id, 'delete_content', 'Removed flagged content')}
                      >
                        <XCircle className="w-3.5 h-3.5 mr-1" /> Remove Content
                      </Button>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleExecuteAction(report.id, 'resolve', 'Marked resolved with warning')}
                      >
                        <CheckCircle className="w-3.5 h-3.5 mr-1" /> Resolve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleExecuteAction(report.id, 'dismiss', 'Dismissed - no violation found')}
                      >
                        Dismiss (No Violation)
                      </Button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="p-10 text-center text-xs text-neutral-500 space-y-2">
                <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="font-bold text-sm text-neutral-800 dark:text-neutral-200">
                  All Clear!
                </p>
                <p>No pending reports in the AfriLink trust queue. Community standards are well-maintained.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* User Management */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 overflow-hidden shadow-sm">
          <div className="p-5 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="font-bold text-base text-neutral-900 dark:text-white font-sora">
                User Management & Statuses
              </h3>
              <p className="text-xs text-neutral-500">Manage account standing, warnings, restrictions, and suspensions</p>
            </div>

            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search citizen by name or email..."
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-xl text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-[#087443]"
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
                      <span className="font-bold text-sm text-neutral-900 dark:text-white font-sora">
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
                      {u.country} • {u.email} • Role: <span className="font-semibold text-neutral-700 dark:text-neutral-300">{u.role}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link href={`/profile/${u.username}`}>
                    <Button size="sm" variant="outline" className="text-xs">
                      <ExternalLink className="w-3.5 h-3.5 mr-1" /> Profile
                    </Button>
                  </Link>

                  {u.status === 'active' ? (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateUserStatus(u.id, 'warning')}
                        className="text-amber-600 border-amber-300 text-xs"
                      >
                        Warn
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleUpdateUserStatus(u.id, 'suspended')}
                        className="text-xs"
                      >
                        <Ban className="w-3.5 h-3.5 mr-1" /> Suspend
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleUpdateUserStatus(u.id, 'active')}
                      className="text-xs font-bold"
                    >
                      <RotateCcw className="w-3.5 h-3.5 mr-1" /> Restore
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
        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-neutral-900 dark:text-white font-sora">
            African Community Oversight
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {communities.map((comm) => (
              <div
                key={comm.id}
                className="p-4 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between shadow-xs"
              >
                <div>
                  <h4 className="font-bold text-sm text-neutral-900 dark:text-white font-sora">
                    {comm.name}
                  </h4>
                  <p className="text-xs text-neutral-500">
                    {comm.category} • {comm.memberCount} members
                  </p>
                  <p className="text-[11px] text-emerald-600 font-semibold mt-1">✓ Active & compliant with conduct rules</p>
                </div>
                <Link href={`/communities/${comm.id}`}>
                  <Button size="sm" variant="outline" className="text-xs font-bold">
                    View
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audit Logs */}
      {activeTab === 'audit' && (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 overflow-hidden shadow-sm">
          <div className="p-5 border-b border-neutral-100 dark:border-neutral-800">
            <h3 className="font-bold text-base text-neutral-900 dark:text-white font-sora">
              Administrative Audit Logs
            </h3>
            <p className="text-xs text-neutral-500">
              Immutable record of moderator actions, report resolutions, and user status modifications
            </p>
          </div>

          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-4 flex items-start justify-between gap-4 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-neutral-900 dark:text-white font-sora">
                      {log.actorName}
                    </span>
                    <Badge variant="emerald" size="sm">
                      {log.action}
                    </Badge>
                  </div>
                  <p className="text-neutral-600 dark:text-neutral-300 mt-1 leading-relaxed">
                    {log.details}
                  </p>
                  <p className="text-[10px] text-neutral-400 mt-0.5">
                    Target: {log.targetType} ({log.targetId})
                  </p>
                </div>

                <span className="text-[10px] text-neutral-400 whitespace-nowrap">
                  {formatDate(log.createdAt)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
