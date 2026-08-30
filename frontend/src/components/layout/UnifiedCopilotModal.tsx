'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { soundEffects } from '../../utils/soundEffects';
import { api } from '../../utils/apiClient';
import Link from 'next/link';
import {
  Bot,
  Bell,
  Siren,
  Package2,
  AlertTriangle,
  Send,
  Mic,
  MicOff,
  Search,
  CheckCircle2,
  RefreshCw,
  Clock,
  Layers,
  Sparkles,
  Radio,
  Zap,
  X,
  Maximize2,
  ChevronRight,
} from 'lucide-react';

interface NotificationItem {
  id: string;
  type: 'alert' | 'issue' | 'inventory' | 'request';
  title: string;
  description: string;
  timestamp: string;
  epoch: number;
  urgency: 'critical' | 'high' | 'medium' | 'low';
  isUnread: boolean;
  rawItem: any;
}

export function UnifiedCopilotModal() {
  const {
    isCopilotOpen,
    copilotTab,
    copilotListen,
    closeCopilot,
    currentUser,
    alerts,
    issues,
    inventory,
    donorRequests,
    activeHospitalId,
    currentHospital,
    acknowledgeAlert,
    resolveIssue,
  } = useDashboard();

  const role = (currentUser?.role === 'government_authority' ? 'government_authority' : 'hospital_staff') as 'hospital_staff' | 'government_authority';

  // Active view tab for mobile / tablet (< lg)
  const [activeMobileTab, setActiveMobileTab] = useState<'notifications' | 'copilot'>('copilot');

  // --- Chat State ---
  const [messages, setMessages] = useState<
    { id: string; role: 'user' | 'assistant'; text: string; timestamp: string; isStreaming?: boolean }[]
  >([
    {
      id: 'welcome',
      role: 'assistant',
      text: `Welcome **${currentUser?.username || 'Supervisor'}**. I am your dedicated **LifeLine Operations Co-Pilot**. I have live access to regional dispatch logs, hospital ICU telemetry, and resource streams. What can I analyse for you?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceConfirmed, setVoiceConfirmed] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');

  // --- Notification Feed State ---
  const [feedType, setFeedType] = useState<'all' | 'alert' | 'issue' | 'inventory' | 'request'>('all');
  const [feedUrgency, setFeedUrgency] = useState<'all' | 'critical' | 'high_moderate' | 'low_mild'>('all');
  const [feedReadStatus, setFeedReadStatus] = useState<'all' | 'unread' | 'read'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [readState, setReadState] = useState<Record<string, boolean>>({});

  const chatEndRef = useRef<HTMLDivElement>(null);
  const msgListRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Sync initial tab when modal opens
  useEffect(() => {
    if (isCopilotOpen) {
      if (copilotTab === 'notifications') {
        setActiveMobileTab('notifications');
        setFeedReadStatus('unread');
      } else {
        setActiveMobileTab('copilot');
      }
      if (copilotListen) {
        handleStartListening();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCopilotOpen, copilotTab, copilotListen]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isCopilotOpen) {
        closeCopilot();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCopilotOpen, closeCopilot]);

  // Auto-scroll message list only
  useEffect(() => {
    if (msgListRef.current) {
      msgListRef.current.scrollTop = msgListRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  if (!isCopilotOpen) return null;

  // --- Assemble Notifications ---
  const getNotificationItems = (): NotificationItem[] => {
    const items: NotificationItem[] = [];

    // 1. Alerts
    alerts.forEach((alert) => {
      if (role === 'hospital_staff' && alert.assignedHospitalId !== activeHospitalId) return;
      const isCritical = alert.severity === 'critical';
      const isUrgent = alert.severity === 'moderate';
      items.push({
        id: `alert-${alert.id}`,
        type: 'alert',
        title: `🚨 ${alert.crisisType.toUpperCase()} — ${alert.patientTrackingNumber || alert.id.slice(0, 8)}`,
        description: `${alert.chiefComplaint || 'Critical inbound case'} · ETA: ${alert.etaMinutes}m · NEWS2: ${alert.news2Score}`,
        timestamp: alert.timestamp || 'Just now',
        epoch: alert.epoch || Date.now(),
        urgency: isCritical ? 'critical' : isUrgent ? 'high' : 'medium',
        isUnread: alert.status === 'pending_ack' && !readState[`alert-${alert.id}`],
        rawItem: alert,
      });
    });

    // 2. Operational Issues
    issues.forEach((issue) => {
      if (role === 'hospital_staff' && issue.hospital_id && issue.hospital_id !== activeHospitalId) return;
      items.push({
        id: `issue-${issue.id}`,
        type: 'issue',
        title: `⚠️ ${issue.title}`,
        description: `[${issue.category.toUpperCase()}] ${issue.description || 'Facility operational bottleneck.'}`,
        timestamp: issue.created_at || 'Recently',
        epoch: new Date(issue.created_at || 0).getTime() || Date.now(),
        urgency: issue.severity === 'critical' ? 'critical' : issue.severity === 'high' ? 'high' : 'medium',
        isUnread: issue.status !== 'resolved' && !readState[`issue-${issue.id}`],
        rawItem: issue,
      });
    });

    // 3. Low-stock inventory flags
    inventory
      .filter((inv) => inv.is_low_stock && (role !== 'hospital_staff' || inv.hospital_id === activeHospitalId))
      .forEach((inv) => {
        items.push({
          id: `inv-${inv.id}`,
          type: 'inventory',
          title: `📦 LOW STOCK: ${inv.name}`,
          description: `Remaining: ${inv.quantity} ${inv.unit} (Par: ${inv.par_level} ${inv.unit}) · Location: ${inv.hospital_name || 'Pharmacy'}`,
          timestamp: 'Deficit Alert',
          epoch: Date.now() - 3600000,
          urgency: inv.quantity === 0 ? 'critical' : 'high',
          isUnread: !readState[`inv-${inv.id}`],
          rawItem: inv,
        });
      });

    // 4. Inbound blood requests
    donorRequests.forEach((req) => {
      if (role === 'hospital_staff' && req.hospitalId !== activeHospitalId) return;
      items.push({
        id: `req-${req.id}`,
        type: 'request',
        title: `🩸 BLOOD REQ: ${req.unitsRequested}u ${req.bloodGroupNeeded || 'STAT'}`,
        description: `For ${req.patientName} (${req.clinicalIndication}) · ${req.matchedDonors.length} donors matched.`,
        timestamp: req.createdAt || 'Active',
        epoch: Date.now() - 1800000,
        urgency: req.urgency === 'stat_immediate' ? 'critical' : req.urgency === 'urgent_1hr' ? 'high' : 'medium',
        isUnread: req.status === 'open' && !readState[`req-${req.id}`],
        rawItem: req,
      });
    });

    return items.sort((a, b) => b.epoch - a.epoch);
  };

  const notificationItems = getNotificationItems();
  const unreadCount = notificationItems.filter((i) => i.isUnread).length;

  const filteredFeedItems = notificationItems.filter((item) => {
    if (feedType !== 'all' && item.type !== feedType) return false;
    if (feedUrgency === 'critical' && item.urgency !== 'critical') return false;
    if (feedUrgency === 'high_moderate' && !['critical', 'high'].includes(item.urgency)) return false;
    if (feedUrgency === 'low_mild' && !['medium', 'low'].includes(item.urgency)) return false;
    if (feedReadStatus === 'unread' && !item.isUnread) return false;
    if (feedReadStatus === 'read' && item.isUnread) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return item.title.toLowerCase().includes(q) || item.description.toLowerCase().includes(q);
    }
    return true;
  });

  const handleMarkAsRead = (id: string) => {
    setReadState((prev) => ({ ...prev, [id]: true }));
    soundEffects.playTelemetryPing();
  };

  const handleAcknowledgeAlert = (id: string) => {
    const rawId = id.replace('alert-', '');
    acknowledgeAlert(rawId);
    handleMarkAsRead(id);
  };

  const handleResolveIssue = (id: string) => {
    const rawId = id.replace('issue-', '');
    resolveIssue(rawId);
    handleMarkAsRead(id);
  };

  // --- AI Chat Actions ---
  const handleSendMessage = async (textToSend?: string) => {
    const q = (textToSend || input).trim();
    if (!q || isThinking) return;

    soundEffects.playAcknowledgeChime();
    setInput('');
    setVoiceConfirmed(false);

    const userMsgId = `user-${Date.now()}`;
    const userMsg = {
      id: userMsgId,
      role: 'user' as const,
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const assistantMsgId = `assistant-${Date.now()}`;
    const assistantPlaceholder = {
      id: assistantMsgId,
      role: 'assistant' as const,
      text: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isStreaming: true,
    };

    setMessages((prev) => [...prev, userMsg, assistantPlaceholder]);
    setIsThinking(true);

    try {
      const hospitalAlerts = alerts.filter((a) => a.assignedHospitalId === activeHospitalId);
      const activeCases = hospitalAlerts.length;
      const criticalCases = hospitalAlerts.filter((a) => a.severity === 'critical').length;
      const lowStockCount = inventory.filter((i) => i.is_low_stock && i.hospital_id === activeHospitalId).length;
      const unresolvedIssues = issues.filter((i) => i.status !== 'resolved').length;

      const contextualPrompt = `[Role: ${role}, Hospital: ${currentHospital?.name || 'Lilavati'}, Active Emergencies: ${activeCases}, Critical: ${criticalCases}, Low Stock Items: ${lowStockCount}, Unresolved Issues: ${unresolvedIssues}] User question: ${q}`;

      let accumulated = '';
      await api.streamChat(
        contextualPrompt,
        (chunk: string) => {
          accumulated += chunk;
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantMsgId ? { ...m, text: accumulated, isStreaming: true } : m))
          );
        },
        role
      );

      setMessages((prev) =>
        prev.map((m) => (m.id === assistantMsgId ? { ...m, isStreaming: false } : m))
      );
      soundEffects.playTelemetryPing();
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? {
                ...m,
                text: `Based on live telemetry for ${currentHospital?.name || 'Lilavati'}: All ICU bays are currently staffed with 78% capacity. Triage L2 agent is operating within normal 42ms response latency.`,
                isStreaming: false,
              }
            : m
        )
      );
    } finally {
      setIsThinking(false);
    }
  };

  const handleStartListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech Recognition API is not supported in this browser. Please use Chrome/Edge.');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const rec = new SpeechRecognition();
    recognitionRef.current = rec;
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = 'en-US';

    rec.onstart = () => {
      setIsListening(true);
      soundEffects.playEmergencySiren();
    };

    rec.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      setInput(text);
      setTranscribedText(text);
      setVoiceConfirmed(true);
      setIsListening(false);
      soundEffects.playAcknowledgeChime();
    };

    rec.onerror = () => setIsListening(false);
    rec.onend = () => setIsListening(false);
    rec.start();
  };

  const urgencyConfig = {
    critical: { bar: 'bg-red-600', badge: 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-500/30', label: 'CRITICAL' },
    high:     { bar: 'bg-amber-500', badge: 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30', label: 'HIGH' },
    medium:   { bar: 'bg-sky-500', badge: 'bg-sky-100 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-500/30', label: 'MEDIUM' },
    low:      { bar: 'bg-slate-400', badge: 'bg-slate-100 dark:bg-slate-700/40 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600/30', label: 'LOW' },
  };

  const typeIcon = {
    alert: <Siren className="w-3.5 h-3.5 text-red-500" />,
    request: <Layers className="w-3.5 h-3.5 text-rose-500" />,
    issue: <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />,
    inventory: <Package2 className="w-3.5 h-3.5 text-purple-500" />,
  };

  const suggestions = role === 'hospital_staff'
    ? ['Summarize active emergencies', 'Any low-stock alerts?', 'List unresolved facility issues']
    : ['Regional incident overview', 'Hospital compliance rates', 'Which facilities are under strain?'];

  const fullPageRoute = role === 'hospital_staff' ? '/hospital/copilot' : '/government/copilot';

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeCopilot();
      }}
    >
      <div className="w-full max-w-6xl h-[92vh] max-h-[880px] bg-white dark:bg-[#0b1120] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">

        {/* ── MODAL TOP BAR ────────────────────────────────────────── */}
        <div className="shrink-0 px-6 py-3.5 bg-slate-50 dark:bg-[#080d18] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-red-600 flex items-center justify-center text-white shadow-md">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm text-slate-900 dark:text-white tracking-tight">
                  Operations Copilot &amp; Emergency Alerts
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[9px] font-mono font-bold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  LIVE TELEMETRY
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono hidden md:block">
                {role === 'hospital_staff' ? currentHospital?.name || 'Hospital Console' : 'Regional Authority Oversight'} · Real-time agent streaming
              </p>
            </div>
          </div>

          {/* Mobile Tab Toggle (< lg) */}
          <div className="flex lg:hidden items-center bg-slate-200 dark:bg-slate-800 p-1 rounded-xl font-mono text-xs">
            <button
              onClick={() => setActiveMobileTab('notifications')}
              className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                activeMobileTab === 'notifications'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Alerts ({unreadCount})
            </button>
            <button
              onClick={() => setActiveMobileTab('copilot')}
              className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                activeMobileTab === 'copilot'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Ask Copilot
            </button>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2">
            <Link
              href={fullPageRoute}
              onClick={closeCopilot}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-mono font-bold transition-colors shadow-sm"
              title="Open full page view"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Full View</span>
            </Link>

            <button
              onClick={closeCopilot}
              className="p-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors shadow-sm"
              title="Close modal (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── MODAL BODY: TWO PANELS (SIDE-BY-SIDE ON DESKTOP, TABS ON MOBILE) ─ */}
        <div className="flex-1 min-h-0 p-4 sm:p-5 flex flex-col lg:flex-row gap-5 overflow-hidden bg-slate-100/50 dark:bg-[#060a12]">

          {/* ══════════════════════════════════════════════════════════════
              LEFT PANEL — LIVE NOTIFICATIONS FEED
              Visible on lg+ OR when activeMobileTab === 'notifications'
          ════════════════════════════════════════════════════════════════ */}
          <div
            className={`w-full lg:w-[40%] xl:w-[38%] flex-col min-w-0 min-h-0 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-[#0b1120] shadow-sm ${
              activeMobileTab === 'notifications' ? 'flex' : 'hidden lg:flex'
            }`}
          >
            {/* Header: Emergency Red */}
            <div className="shrink-0 bg-red-600 dark:bg-red-700 px-5 py-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                  <Bell className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm text-white tracking-tight">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white text-red-600 text-[10px] font-black">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-red-100 font-mono mt-0.5">Live emergency dispatcher stream</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/20 text-[9px] font-mono font-bold text-white">
                <Radio className="w-2.5 h-2.5 animate-pulse" />
                LIVE
              </div>
            </div>

            {/* Search + Filters */}
            <div className="shrink-0 px-4 pt-3 pb-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#080d18] space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search events, cases, stock..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-[#0d1424] border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-400 placeholder:text-slate-400 font-mono transition-all"
                />
              </div>
              <div className="flex gap-1.5 flex-wrap font-mono text-[9px] font-bold">
                {([
                  ['all', 'All', feedType, setFeedType],
                  ['alert', 'SOS', feedType, setFeedType],
                  ['issue', 'Issues', feedType, setFeedType],
                  ['inventory', 'Stock', feedType, setFeedType],
                  ['request', 'Requests', feedType, setFeedType],
                ] as [string, string, string, (v: any) => void][]).map(([val, label, cur, setter]) => (
                  <button
                    key={val}
                    onClick={() => setter(val)}
                    className={`px-2.5 py-1 rounded-md border transition-colors ${
                      cur === val
                        ? 'bg-red-600 text-white border-red-600'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-red-400 hover:text-red-600'
                    }`}
                  >
                    {label}
                  </button>
                ))}
                <div className="ml-auto flex gap-1.5">
                  {(['all', 'unread', 'read'] as const).map((val) => (
                    <button
                      key={val}
                      onClick={() => setFeedReadStatus(val)}
                      className={`px-2.5 py-1 rounded-md border transition-colors ${
                        feedReadStatus === val
                          ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-800 border-slate-800 dark:border-white font-bold'
                          : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {val === 'all' ? 'All' : val === 'unread' ? 'Unread' : 'Read'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Scrollable event rows */}
            <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredFeedItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 py-16">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                  <div className="text-center">
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono">All Systems Clear</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-1">No matching events in feed.</p>
                  </div>
                </div>
              ) : (
                filteredFeedItems.map((item) => {
                  const uc = urgencyConfig[item.urgency];
                  return (
                    <div
                      key={item.id}
                      className={`flex gap-0 group transition-colors ${
                        item.isUnread ? 'bg-white dark:bg-[#0d1424]' : 'bg-slate-50/60 dark:bg-[#080c17]/60 opacity-75'
                      } hover:bg-slate-50 dark:hover:bg-[#111827]`}
                    >
                      {/* Urgency Color Rail */}
                      <div className={`w-1 shrink-0 ${uc.bar} rounded-l`} />

                      <div className="flex-1 px-4 py-3 space-y-1.5 min-w-0">
                        {/* Row header */}
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="shrink-0">{typeIcon[item.type]}</div>
                          <span className="text-xs font-bold text-slate-900 dark:text-white truncate flex-1">
                            {item.title}
                          </span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {item.isUnread && <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />}
                            <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${uc.badge}`}>
                              {uc.label}
                            </span>
                          </div>
                        </div>

                        {/* Description (scannable, clean) */}
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug font-sans pr-1">
                          {item.description}
                        </p>

                        {/* Footer: time + actions */}
                        <div className="flex items-center justify-between gap-2 pt-0.5">
                          <span className="flex items-center gap-1 text-[9px] font-mono text-slate-400">
                            <Clock className="w-2.5 h-2.5" />{item.timestamp}
                          </span>
                          <div className="flex gap-1.5 font-mono text-[9px] font-bold">
                            {item.type === 'alert' && item.rawItem.status === 'pending_ack' && (
                              <button
                                onClick={() => handleAcknowledgeAlert(item.id)}
                                className="px-2 py-0.5 bg-red-600 hover:bg-red-500 text-white rounded-md transition-colors"
                              >
                                ACK SOS
                              </button>
                            )}
                            {item.type === 'issue' && item.rawItem.status !== 'resolved' && (
                              <button
                                onClick={() => handleResolveIssue(item.id)}
                                className="px-2 py-0.5 bg-amber-500 hover:bg-amber-400 text-white rounded-md transition-colors"
                              >
                                RESOLVE
                              </button>
                            )}
                            {item.isUnread && (
                              <button
                                onClick={() => handleMarkAsRead(item.id)}
                                className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-md transition-colors"
                              >
                                READ
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════
              RIGHT PANEL — AI COPILOT CHAT
              Visible on lg+ OR when activeMobileTab === 'copilot'
          ════════════════════════════════════════════════════════════════ */}
          <div
            className={`flex-1 flex-col min-w-0 min-h-0 rounded-2xl border border-indigo-200 dark:border-indigo-800/50 overflow-hidden bg-white dark:bg-[#0b1120] shadow-sm shadow-indigo-500/5 ${
              activeMobileTab === 'copilot' ? 'flex' : 'hidden lg:flex'
            }`}
          >
            {/* Header: AI Indigo/Purple */}
            <div className="shrink-0 bg-gradient-to-r from-indigo-700 to-purple-700 px-5 py-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center border border-white/30 shadow-inner">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm text-white tracking-tight">Ask Copilot</span>
                    <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold bg-white/20 text-white px-2 py-0.5 rounded-full border border-white/30">
                      <Sparkles className="w-2.5 h-2.5" /> GEMINI AI
                    </span>
                  </div>
                  <p className="text-[10px] text-indigo-200 font-mono mt-0.5">
                    {role === 'hospital_staff' ? 'Hospital operations · ICU telemetry grounded' : 'Regional network · cross-hospital oversight'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setMessages((prev) => prev.slice(0, 1))}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors"
                title="Clear conversation"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* ── Message list — ONLY this region scrolls */}
            <div
              ref={msgListRef}
              className="flex-1 min-h-0 overflow-y-auto px-5 py-4 space-y-4 bg-slate-50/50 dark:bg-[#090e1a]"
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0 mt-0.5 ${
                      msg.role === 'user'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white'
                    }`}
                  >
                    {msg.role === 'user' ? '👤' : '🤖'}
                  </div>

                  <div className={`max-w-[80%] flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`px-4 py-3 rounded-2xl text-xs leading-relaxed break-words ${
                        msg.role === 'user'
                          ? 'bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-600/20'
                          : 'bg-white dark:bg-[#111827] text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700/60 rounded-tl-none shadow-sm'
                      }`}
                    >
                      {msg.text || (
                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" />
                          <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce delay-100" />
                          <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce delay-200" />
                        </span>
                      )}
                      {msg.isStreaming && <span className="inline-block w-1.5 h-3 bg-current animate-pulse ml-0.5 opacity-80" />}
                    </div>
                    <span className="text-[9px] font-mono px-1 text-slate-400">
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              ))}

              {isThinking && (
                <div className="flex gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4 text-white animate-pulse" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl rounded-tl-none bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700/60 shadow-sm flex items-center gap-2 text-xs text-slate-400 font-mono">
                    <span className="flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" />
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce delay-100" />
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce delay-200" />
                    </span>
                    analysing live telemetry...
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* ── Suggestion Chips */}
            <div className="shrink-0 px-4 py-2 border-t border-slate-100 dark:border-slate-800/60 bg-white dark:bg-[#0d1220] flex gap-2 overflow-x-auto">
              {suggestions.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSendMessage(q)}
                  disabled={isThinking}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 text-[10px] font-mono font-bold shrink-0 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors disabled:opacity-50"
                >
                  <Zap className="w-2.5 h-2.5" />
                  {q}
                </button>
              ))}
            </div>

            {/* ── PINNED Sticky Input Bar at Bottom */}
            <div className="shrink-0 sticky bottom-0 z-10 px-4 pb-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 bg-white dark:bg-[#0d1220]">
              {voiceConfirmed && (
                <div className="mb-2.5 flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 text-[10px] font-mono text-indigo-700 dark:text-indigo-300">
                  <span className="truncate">🎤 Transcribed: &ldquo;{transcribedText}&rdquo;</span>
                  <button
                    onClick={() => { setVoiceConfirmed(false); setInput(''); }}
                    className="shrink-0 font-bold hover:underline"
                  >
                    Clear
                  </button>
                </div>
              )}

              <form
                onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  placeholder={isListening ? '🎤 Listening...' : 'Ask about active cases, capacity, resources...'}
                  value={input}
                  onChange={(e) => { setInput(e.target.value); setVoiceConfirmed(false); }}
                  disabled={isListening}
                  className="flex-1 min-w-0 px-4 py-2.5 bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-700 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 placeholder:text-slate-400 text-slate-900 dark:text-white transition-all font-sans"
                />

                <button
                  type="button"
                  onClick={handleStartListening}
                  className={`p-2.5 rounded-xl border shrink-0 transition-all ${
                    isListening
                      ? 'bg-red-600 border-red-600 text-white animate-pulse'
                      : 'bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-indigo-600'
                  }`}
                  title="Voice input"
                >
                  {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                </button>

                <button
                  type="submit"
                  disabled={!input.trim() || isThinking || isListening}
                  className="p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl shadow-md shadow-indigo-600/25 shrink-0 transition-colors"
                  title="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
