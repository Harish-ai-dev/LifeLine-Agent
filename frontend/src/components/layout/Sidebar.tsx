'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useDashboard } from '@/context/DashboardContext';
import {
  LayoutDashboard,
  Siren,
  Users,
  BedDouble,
  Droplets,
  Send,
  AlertTriangle,
  Package2,
  ScrollText,
  Network,
  FileBarChart2,
  Bot,
  Heart,
  ChevronLeft,
  ChevronRight,
  Activity,
  ShieldAlert,
  Cpu,
  Radio,
  Sparkles,
  Building2,
} from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  badge?: string | number;
  badgeColor?: string;
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

export function Sidebar() {
  const { currentUser, alerts, activeHospitalId, issues, inventory, donorRequests, openCopilot } = useDashboard();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const isDashboardRoute = pathname.startsWith('/hospital') || pathname.startsWith('/government') || pathname.startsWith('/donor') || pathname.startsWith('/emergency');
  if (!currentUser || !isDashboardRoute) return null;

  // Real-time badge counts
  const hospitalAlerts = alerts.filter((a) => a.assignedHospitalId === activeHospitalId);
  const pendingAlertsCount = hospitalAlerts.filter((a) => a.status === 'pending_ack').length;
  const activeIssuesCount = issues.filter(
    (i) => (i.hospital_id === activeHospitalId || i.status !== 'resolved')
  ).length;
  const lowStockCount = inventory.filter(
    (i) => i.hospital_id === activeHospitalId && i.is_low_stock
  ).length;
  const inboundDonorsCount = donorRequests
    .filter((r) => r.hospitalId === activeHospitalId)
    .reduce(
      (acc, req) =>
        acc +
        req.matchedDonors.filter((d) =>
          ['en_route', 'arrived', 'accepted'].includes(d.responseStatus)
        ).length,
      0
    );

  const getNavSections = (): NavSection[] => {
    if (currentUser.role === 'hospital_staff') {
      return [
        {
          title: 'COMMAND & TRIAGE',
          items: [
            { label: 'Overview', path: '/hospital', icon: LayoutDashboard },
            { label: 'Facilities Network', path: '/hospital/facilities', icon: Building2 },
            { 
              label: 'Emergency SOS', 
              path: '/hospital/sos', 
              icon: Siren,
              badge: pendingAlertsCount > 0 ? `${pendingAlertsCount} STAT` : undefined,
              badgeColor: 'bg-red-100 text-red-700 border border-red-200 animate-pulse'
            },
            { 
              label: 'Patients & Queue', 
              path: '/hospital/patients', 
              icon: Users,
              badge: hospitalAlerts.length > 0 ? hospitalAlerts.length : undefined,
              badgeColor: 'bg-sky-100 text-sky-700 border border-sky-200'
            },
            { label: 'AI Copilot & Alerts', path: '/hospital/copilot', icon: Bot },
          ],
        },
        {
          title: 'CLINICAL CAPACITY',
          items: [
            { label: 'Bed & Bay Manager', path: '/hospital/beds', icon: BedDouble },
            { label: 'Blood Bank', path: '/hospital/blood-bank', icon: Droplets },
            { 
              label: 'Resource Requests', 
              path: '/hospital/requests', 
              icon: Send,
              badge: inboundDonorsCount > 0 ? `${inboundDonorsCount} Inbound` : undefined,
              badgeColor: 'bg-emerald-100 text-emerald-700 border border-emerald-200'
            },
          ],
        },
        {
          title: 'OPERATIONS & AUDIT',
          items: [
            { 
              label: 'Issue Board', 
              path: '/hospital/issues', 
              icon: AlertTriangle,
              badge: activeIssuesCount > 0 ? activeIssuesCount : undefined,
              badgeColor: 'bg-amber-100 text-amber-700 border border-amber-200'
            },
            { 
              label: 'Inventory & Supplies', 
              path: '/hospital/inventory', 
              icon: Package2,
              badge: lowStockCount > 0 ? `${lowStockCount} Low` : undefined,
              badgeColor: 'bg-rose-100 text-rose-700 border border-rose-200'
            },
            { label: 'Decision Audit Log', path: '/hospital/audit', icon: ScrollText },
          ],
        },
      ];
    }

    if (currentUser.role === 'government_authority') {
      return [
        {
          title: 'EXECUTIVE OVERSIGHT',
          items: [
            { label: 'Regional Command', path: '/government', icon: LayoutDashboard },
            { label: 'Network Grid Map', path: '/government/network', icon: Network },
            { label: 'AI Intelligence Report', path: '/government/report', icon: FileBarChart2 },
            { label: 'AI Copilot & Alerts', path: '/government/copilot', icon: Bot },
            { label: 'Jurisdiction Audit', path: '/government/audit', icon: ScrollText },
          ],
        },
      ];
    }

    // Blood Donor
    return [
      {
        title: 'DONOR PORTAL',
        items: [
          { label: 'Dashboard Pass', path: '/donor', icon: Heart },
          { label: 'Open STAT Requests', path: '/donor/requests', icon: Droplets },
          { label: 'Donation History', path: '/donor/donations', icon: Activity },
          { label: 'Digital Health Profile', path: '/donor/profile', icon: Users },
        ],
      },
    ];
  };

  const sections = getNavSections();

  return (
    <aside
      className={`bg-white border-r border-slate-200 flex flex-col justify-between transition-all duration-300 z-30 shrink-0 select-none shadow-sm ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 bg-slate-50">
        <div className="flex items-center gap-3 overflow-hidden">
          <img src="/logo.png" alt="LifeLine Agent Logo" className="w-9 h-9 rounded-[11px] shadow-md shrink-0 hover:scale-110 transition-transform duration-300" />
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-black text-sm tracking-tight text-slate-900 flex items-center gap-1.5">
                LifeLine <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-100 text-sky-700 font-mono font-bold">AGENT</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono tracking-wider truncate">
                AI SUPERVISOR V2.4
              </span>
            </div>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 hover:bg-slate-200/80 rounded-lg text-slate-500 hover:text-slate-900 transition-colors"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {sections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1">
            {!collapsed && section.title && (
              <div className="px-3 pb-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase font-mono">
                {section.title}
              </div>
            )}
            {section.items.map((item) => {
              const Icon = item.icon;
              const isCopilot = item.path.endsWith('/copilot');
              const isActive =
                pathname === item.path ||
                (pathname.startsWith(item.path) && item.path !== `/${currentUser.role}`);

              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={(e) => {
                    if (isCopilot) {
                      e.preventDefault();
                      openCopilot();
                    }
                  }}
                  className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-sky-50 text-sky-900 border border-sky-200 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                        isActive ? 'text-sky-600' : 'text-slate-400 group-hover:text-slate-600'
                      }`}
                    />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </div>

                  {!collapsed && item.badge && (
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                        item.badgeColor || 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Live Agent Health Status Footer */}
      {!collapsed ? (
        <div className="p-3 border-t border-slate-200 bg-slate-50 m-2 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-[11px] font-bold text-slate-800">ADK Multi-Level Pipeline</span>
            </div>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>

          <div className="space-y-1 font-mono text-[10px] text-slate-600">
            <div className="flex justify-between items-center">
              <span>L1 Orchestrator:</span>
              <span className="text-emerald-700 font-bold">ACTIVE (0ms)</span>
            </div>
            <div className="flex justify-between items-center">
              <span>L2 Triage Loops:</span>
              <span className="text-sky-700 font-bold">READY (NEWS2)</span>
            </div>
            <div className="flex justify-between items-center">
              <span>L3 Gemini 3.5:</span>
              <span className="text-purple-700 font-bold">CONNECTED</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-3 border-t border-slate-200 flex justify-center">
          <span className="flex h-2.5 w-2.5 relative" title="AI Agent Pipeline: Active">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
        </div>
      )}
    </aside>
  );
}
