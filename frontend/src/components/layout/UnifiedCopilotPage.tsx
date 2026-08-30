'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { api } from '../../utils/apiClient';
import { soundEffects } from '../../utils/soundEffects';
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
  ChevronRight,
  Zap,
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';

interface UnifiedCopilotPageProps {
  role: 'hospital_staff' | 'government_authority';
}

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

export function UnifiedCopilotPage({ role }: UnifiedCopilotPageProps) {
  const {
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

  const searchParams = useSearchParams();
  const searchTab = searchParams.get('tab');
  const searchListen = searchParams.get('listen') === 'true';

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

  // --- Deep link ---
  useEffect(() => {
    if (searchTab === 'notifications') setFeedReadStatus('unread');
    if (searchListen) handleStartListening();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTab, searchListen]);

  // Auto-scroll message list only — NOT the whole page
  useEffect(() => {
    if (msgListRef.current) {
      msgListRef.current.scrollTop = msgListRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  // --- Notification assembly ---
  const getNotificationItems = (): NotificationItem[] => {
    const items: NotificationItem[] = [];

    const targetAlerts = role === 'hospital_staff'
      ? alerts.filter((a) => a.assignedHospitalId === activeHospitalId)
      : alerts;
    targetAlerts.forEach((a) => {
      const isUnread = a.status === 'pending_ack' && !readState[a.id];
      items.push({
        id: a.id,
        type: 'alert',
        title: `Emergency Intake: ${a.trackingNumber}`,
        description: `NEWS2 ${a.news2Score} · ${a.news2RiskBand.toUpperCase()} · RR ${a.vitals.respiratoryRate} · SpO2 ${a.vitals.spo2}% · ${a.chiefComplaint}`,
        timestamp: a.timestamp,
        epoch: a.createdAt || Date.now(),
        urgency: a.severity === 'critical' ? 'critical' : a.severity === 'moderate' ? 'high' : 'medium',
        isUnread,
        rawItem: a,
      });
    });

    const targetIssues = role === 'hospital_staff'
      ? issues.filter((i) => i.hospital_id === activeHospitalId)
      : issues;
    targetIssues.forEach((i) => {
      const isUnread = i.status !== 'resolved' && !readState[i.id];
      items.push({
        id: i.id,
        type: 'issue',
        title: `Facility Issue · ${i.category.toUpperCase()}`,
        description: `${i.title} — ${i.description}. Reported by ${i.reported_by} @ ${i.hospital_name}.`,
        timestamp: new Date(i.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        epoch: new Date(i.created_at).getTime(),
        urgency: i.severity === 'critical' ? 'critical' : i.severity === 'high' ? 'high' : i.severity === 'moderate' ? 'medium' : 'low',
        isUnread,
        rawItem: i,
      });
    });

    const targetInv = role === 'hospital_staff'
      ? inventory.filter((i) => i.hospital_id === activeHospitalId)
      : inventory;
    targetInv.forEach((i) => {
      if (i.is_low_stock) {
        const isUnread = !readState[i.id];
        items.push({
          id: i.id,
          type: 'inventory',
          title: `Low-Stock: ${i.item_name}`,
          description: `${i.current_stock} ${i.unit} remaining (threshold ${i.minimum_threshold} ${i.unit}). Updated ${i.last_updated}.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          epoch: Date.now() - 10000,
          urgency: 'high',
          isUnread,
          rawItem: i,
        });
      }
    });

    const targetRequests = role === 'hospital_staff'
      ? donorRequests.filter((r) => r.hospitalId === activeHospitalId)
      : donorRequests;
    targetRequests.forEach((r) => {
      const isUnread = r.status === 'open' && !readState[r.id];
      items.push({
        id: r.id,
        type: 'request',
        title: `STAT Request: ${r.bloodGroupNeeded || r.organNeeded} Needed`,
        description: `${r.unitsRequested} units · ${r.hospitalName} · ${r.urgency.replace('_', ' ')} · ${r.clinicalIndication}`,
        timestamp: new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        epoch: r.createdAt,
        urgency: r.urgency === 'STAT_CRITICAL' ? 'critical' : r.urgency === 'URGENT' ? 'high' : 'medium',
        isUnread,
        rawItem: r,
      });
    });

    return items.sort((a, b) => b.epoch - a.epoch);
  };

  const allFeedItems = getNotificationItems();
  const filteredFeedItems = allFeedItems.filter((item) => {
    if (feedType !== 'all' && item.type !== feedType) return false;
    if (feedUrgency === 'critical' && item.urgency !== 'critical') return false;
    if (feedUrgency === 'high_moderate' && !['high', 'medium'].includes(item.urgency)) return false;
    if (feedUrgency === 'low_mild' && item.urgency !== 'low') return false;
    if (feedReadStatus === 'unread' && !item.isUnread) return false;
    if (feedReadStatus === 'read' && item.isUnread) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return item.title.toLowerCase().includes(q) || item.description.toLowerCase().includes(q);
    }
    return true;
  });

  const unreadCount = allFeedItems.filter((i) => i.isUnread).length;

  // --- Actions ---
  const handleMarkAsRead = (id: string) => {
    soundEffects.playTelemetryPing();
    setReadState((prev) => ({ ...prev, [id]: true }));
  };
  const handleAcknowledgeAlert = async (id: string) => {
    soundEffects.playAcknowledgeChime();
    await acknowledgeAlert(id);
    handleMarkAsRead(id);
  };
  const handleResolveIssue = async (id: string) => {
    soundEffects.playAcknowledgeChime();
    await resolveIssue(id);
    handleMarkAsRead(id);
  };

  // --- AI Copilot ---
  const handleSendMessage = async (customPrompt?: string) => {
    const query = (customPrompt || input).trim();
    if (!query || isThinking) return;

    const userMsgId = `usr-${Date.now()}`;
    const userMsg = {
      id: userMsgId,
      role: 'user' as const,
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setTranscribedText('');
    setVoiceConfirmed(false);
    setIsThinking(true);

    const aiMsgId = `ai-${Date.now()}`;
    setMessages((prev) => [...prev, {
      id: aiMsgId,
      role: 'assistant' as const,
      text: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isStreaming: true,
    }]);

    try {
      const apiMessages = updatedMessages.map((m) => ({ role: m.role, content: m.text }));
      const contextPayload = {
        role,
        facility_name: currentHospital?.name || 'Director Command',
        title: currentUser?.title || 'Emergency Operations',
      };
      await api.streamChat(apiMessages, contextPayload, (token) => {
        setMessages((prev) =>
          prev.map((msg) => msg.id === aiMsgId ? { ...msg, text: msg.text + token } : msg)
        );
      });
      setMessages((prev) =>
        prev.map((msg) => msg.id === aiMsgId ? { ...msg, isStreaming: false } : msg)
      );
    } catch (e: any) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMsgId
            ? { ...msg, text: `⚠️ **API Error:** ${e.message || e}`, isStreaming: false }
            : msg
        )
      );
    } finally {
      setIsThinking(false);
    }
  };

  // --- Voice ---
  const handleStartListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Web Speech API is not supported in this browser.');
      return;
    }
    if (isListening) { recognitionRef.current?.stop(); setIsListening(false); return; }
    soundEffects.playTelemetryPing();
    setIsListening(true);
    setVoiceConfirmed(false);
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = 'en-US';
    rec.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      setTranscribedText(text);
      setInput(text);
      setVoiceConfirmed(true);
      setIsListening(false);
      soundEffects.playAcknowledgeChime();
    };
    rec.onerror = () => setIsListening(false);
    rec.onend = () => setIsListening(false);
    recognitionRef.current = rec;
    rec.start();
  };

  // Urgency config
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

  // SUGGESTION CHIPS differ by role
  const suggestions = role === 'hospital_staff'
    ? ['Summarize active emergencies', 'Any low-stock alerts?', 'List unresolved facility issues']
    : ['Regional incident overview', 'Hospital compliance rates', 'Which facilities are under strain?'];

  return (
    // The overall container: side-by-side columns, full available height, no own scroll
    <div className="flex flex-col lg:flex-row gap-5 min-w-0" style={{ height: 'calc(100vh - 10rem)' }}>

      {/* ══════════════════════════════════════════════════════════════
          LEFT COLUMN — LIVE NOTIFICATIONS FEED
          Visual language: clinical, red-banded urgency, row-list, passive
      ════════════════════════════════════════════════════════════════ */}
      <div className="w-full lg:w-[40%] xl:w-[38%] flex flex-col min-w-0 min-h-0 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-[#0b1120] shadow-sm">

        {/* Header — distinct red/emergency treatment */}
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
              <p className="text-[10px] text-red-100 font-mono mt-0.5">Live dispatcher feed · emergency events</p>
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
              className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-[#0d1424] border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-400 placeholder:text-slate-400 font-mono transition-all"
            />
          </div>
          <div className="flex gap-1.5 flex-wrap font-mono text-[9px] font-bold">
            {([
              ['all', 'All Types', feedType, setFeedType],
              ['alert', 'SOS', feedType, setFeedType],
              ['issue', 'Issues', feedType, setFeedType],
              ['inventory', 'Stock', feedType, setFeedType],
              ['request', 'Requests', feedType, setFeedType],
            ] as [string, string, string, (v: any) => void][]).map(([val, label, cur, setter]) => (
              <button
                key={val}
                onClick={() => setter(val)}
                className={`px-2.5 py-1 rounded-md border transition-colors ${cur === val ? 'bg-red-600 text-white border-red-600' : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-red-400 hover:text-red-600'}`}
              >
                {label}
              </button>
            ))}
            <div className="ml-auto flex gap-1.5">
              {(['all', 'unread', 'read'] as const).map((val) => (
                <button
                  key={val}
                  onClick={() => setFeedReadStatus(val)}
                  className={`px-2.5 py-1 rounded-md border transition-colors ${feedReadStatus === val ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-800 border-slate-800 dark:border-white' : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'}`}
                >
                  {val === 'all' ? 'All' : val === 'unread' ? 'Unread' : 'Read'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Scrollable event rows — clearly a LIST, not a chat */}
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
                  className={`flex gap-0 group transition-colors ${item.isUnread ? 'bg-white dark:bg-[#0d1424]' : 'bg-slate-50/60 dark:bg-[#080c17]/60 opacity-75'} hover:bg-slate-50 dark:hover:bg-[#111827]`}
                >
                  {/* Urgency color bar (left rail) */}
                  <div className={`w-1 shrink-0 ${uc.bar} rounded-l`} />

                  <div className="flex-1 px-4 py-3 space-y-2 min-w-0">
                    {/* Row header */}
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="shrink-0">{typeIcon[item.type]}</div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate flex-1">{item.title}</span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {item.isUnread && <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />}
                        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${uc.badge}`}>{uc.label}</span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug font-sans pr-1">{item.description}</p>

                    {/* Footer: time + actions */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1 text-[9px] font-mono text-slate-400">
                        <Clock className="w-2.5 h-2.5" />{item.timestamp}
                      </span>
                      <div className="flex gap-1.5 font-mono text-[9px] font-bold">
                        {item.type === 'alert' && item.rawItem.status === 'pending_ack' && (
                          <button
                            onClick={() => handleAcknowledgeAlert(item.id)}
                            className="px-2 py-1 bg-red-600 hover:bg-red-500 text-white rounded-md"
                          >
                            ACK SOS
                          </button>
                        )}
                        {item.type === 'issue' && item.rawItem.status !== 'resolved' && (
                          <button
                            onClick={() => handleResolveIssue(item.id)}
                            className="px-2 py-1 bg-amber-500 hover:bg-amber-400 text-white rounded-md"
                          >
                            RESOLVE
                          </button>
                        )}
                        {item.isUnread && (
                          <button
                            onClick={() => handleMarkAsRead(item.id)}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-md"
                          >
                            MARK READ
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
          RIGHT COLUMN — AI COPILOT CHAT
          Visual language: AI/purple brand, chat bubbles, pinned input
          CRITICAL: uses flex-col with flex-1 min-h-0 so ONLY the
          message list scrolls — input bar is always visible at bottom
      ════════════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 rounded-2xl border border-indigo-200 dark:border-indigo-800/50 overflow-hidden bg-white dark:bg-[#0b1120] shadow-sm shadow-indigo-500/5">

        {/* Header — distinct AI/indigo treatment */}
        <div className="shrink-0 bg-gradient-to-r from-indigo-700 to-purple-700 px-5 py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center border border-white/30 shadow-inner">
              <Bot className="w-5 h-5 text-white" />
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

        {/* ── Message list — THIS is the scrollable region, flex-1 min-h-0 */}
        <div
          ref={msgListRef}
          className="flex-1 min-h-0 overflow-y-auto px-5 py-4 space-y-4 bg-slate-50/40 dark:bg-[#090e1a]"
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0 mt-0.5 ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white'
              }`}>
                {msg.role === 'user' ? '👤' : '🤖'}
              </div>

              {/* Bubble */}
              <div className={`max-w-[78%] flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`px-4 py-3 rounded-2xl text-xs leading-relaxed break-words ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-600/20'
                    : 'bg-white dark:bg-[#111827] text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700/60 rounded-tl-none shadow-sm'
                }`}>
                  {msg.text || (
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" />
                      <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce delay-100" />
                      <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce delay-200" />
                    </span>
                  )}
                  {msg.isStreaming && <span className="inline-block w-1.5 h-3 bg-current animate-pulse ml-0.5 opacity-80" />}
                </div>
                <span className={`text-[9px] font-mono px-1 ${msg.role === 'user' ? 'text-slate-400' : 'text-slate-400'}`}>
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ))}

          {/* Thinking indicator */}
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
                analysing telemetry...
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* ── Suggestion chips — shrink-0, never scrolls away */}
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

        {/* ── Input bar — PINNED at bottom, shrink-0, NEVER scrolled away */}
        <div className="shrink-0 px-4 pb-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 bg-white dark:bg-[#0d1220]">
          {/* Voice confirmation banner */}
          {voiceConfirmed && (
            <div className="mb-2.5 flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 text-[10px] font-mono text-indigo-700 dark:text-indigo-300">
              <span className="truncate">🎤 Transcribed: &ldquo;{transcribedText}&rdquo; — confirm or edit below</span>
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
              className="flex-1 min-w-0 px-4 py-3 bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-700 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 placeholder:text-slate-400 text-slate-900 dark:text-white transition-all"
            />

            {/* Voice button */}
            <button
              type="button"
              onClick={handleStartListening}
              className={`p-3 rounded-xl border shrink-0 transition-all ${
                isListening
                  ? 'bg-red-600 border-red-600 text-white animate-pulse'
                  : 'bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 border-slate-200 dark:border-slate-700 hover:border-indigo-400 text-slate-500 dark:text-slate-400 hover:text-indigo-600'
              }`}
              title="Voice input"
            >
              {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </button>

            {/* Send button */}
            <button
              type="submit"
              disabled={!input.trim() || isThinking || isListening}
              className="p-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl shadow-md shadow-indigo-600/25 shrink-0 transition-colors"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
