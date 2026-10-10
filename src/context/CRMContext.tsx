import React, { createContext, useContext, useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import {
  CallRecord, CallbackQueueItem, QualityReviewItem, InAppAlert,
  Patient, EditHistoryEntry, User, Branch, Team, Department, Doctor,
  Agent, Purpose, PurposeField, SLARule
} from '../types/crm';
import {
  INITIAL_BRANCHES, INITIAL_TEAMS, INITIAL_DEPARTMENTS, INITIAL_DOCTORS,
  INITIAL_AGENTS, INITIAL_USERS, INITIAL_FINANCIAL, INITIAL_PURPOSES,
  INITIAL_PURPOSE_FIELDS, INITIAL_SLA_RULES, INITIAL_CALLS,
  INITIAL_CALLBACKS, INITIAL_QUALITY_REVIEWS, INITIAL_PATIENTS,
  INITIAL_ALERTS
} from '../data/crmInitialData';

interface CRMContextType {
  currentUser: User;
  users: User[];
  branches: Branch[];
  teams: Team[];
  departments: Department[];
  doctors: Doctor[];
  agents: Agent[];
  purposes: Purpose[];
  purposeFields: PurposeField[];
  financial: string[];
  slaRules: SLARule[];

  calls: CallRecord[];
  callbacks: CallbackQueueItem[];
  qualityReviews: QualityReviewItem[];
  patients: Patient[];
  alerts: InAppAlert[];
  editHistory: EditHistoryEntry[];
  onlineAgents: string[];

  // Authentication & session
  login: (email: string, pin: string) => { success: boolean; message: string };
  logout: () => void;
  switchUser: (user: User) => void;

  // Actions
  submitCall: (data: Partial<CallRecord>) => { success: boolean; referenceNumber: string; message: string };
  updateCall: (referenceNumber: string, changes: Partial<CallRecord>, note?: string) => { success: boolean; message: string };
  closeCall: (referenceNumber: string) => { success: boolean; message: string };
  transferCall: (referenceNumber: string, toAgentName: string, reason?: string) => { success: boolean; message: string };

  // Callbacks
  completeCallback: (callbackId: string) => void;
  snoozeCallback: (callbackId: string, preset: '1h' | '4h' | '1d' | '1w') => void;
  postponeCallback: (callbackId: string, newDate: string, newTime: string) => void;
  addManualCallback: (data: Partial<CallbackQueueItem>) => void;

  // Quality & Reviews
  addQualityReview: (review: { referenceNumber: string; qualityRating: number; qualityComment: string; commentType: 'quality' | 'teamlead' }) => { success: boolean; message: string };
  replyToReview: (reviewId: string, replyText: string) => void;

  // Alerts
  markAlertRead: (alertId: string) => void;
  markAllAlertsRead: () => void;

  // Patient Quick Info & Advanced Search
  getPatientQuickInfo: (query: string) => { found: boolean; isNew: boolean; patient?: Patient };
  searchPatientsAdvanced: (
    query: string,
    filters?: { branch?: string; category?: string; doctor?: string; sortBy?: 'visits' | 'recent' | 'name' | 'id' }
  ) => Patient[];

  // Data helpers
  exportCallsToExcel: (filters?: { branch?: string; dateFrom?: string; dateTo?: string }) => void;
  exportCallsToCSV: (filters?: { branch?: string; dateFrom?: string; dateTo?: string }) => void;
  resetToInitialData: () => void;
}

const CRMContext = createContext<CRMContextType | null>(null);

const STORAGE_KEYS = {
  CALLS: 'crm_v27_calls',
  CALLBACKS: 'crm_v27_callbacks',
  REVIEWS: 'crm_v27_reviews',
  PATIENTS: 'crm_v27_patients',
  ALERTS: 'crm_v27_alerts',
  EDIT_HISTORY: 'crm_v27_edit_history',
  CURRENT_USER: 'crm_v27_current_user',
  USERS: 'crm_v27_users'
};

const normalizeMobile = (raw: string) => {
  return raw.replace(/\D/g, '').replace(/^(00966|966|0)/, '');
};

const formatTimeNow = () => {
  const d = new Date();
  return `${('0' + d.getHours()).slice(-2)}:${('0' + d.getMinutes()).slice(-2)}`;
};

const formatDateNow = () => {
  const d = new Date();
  return `${d.getFullYear()}-${('0' + (d.getMonth() + 1)).slice(-2)}-${('0' + d.getDate()).slice(-2)}`;
};

export const CRMProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_USERS[0]; // Admin by default
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_USERS;
  });

  const [calls, setCalls] = useState<CallRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CALLS);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_CALLS;
  });

  const [callbacks, setCallbacks] = useState<CallbackQueueItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CALLBACKS);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_CALLBACKS;
  });

  const [qualityReviews, setQualityReviews] = useState<QualityReviewItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.REVIEWS);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_QUALITY_REVIEWS;
  });

  const [patients, setPatients] = useState<Patient[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PATIENTS);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_PATIENTS;
  });

  const [alerts, setAlerts] = useState<InAppAlert[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ALERTS);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_ALERTS;
  });

  const [editHistory, setEditHistory] = useState<EditHistoryEntry[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EDIT_HISTORY);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return [];
  });

  // Simulated live online agents list with automatic heartbeat
  const [onlineAgents, setOnlineAgents] = useState<string[]>([
    'رغد عمر', 'شوق عادل', 'كريم اشرف', 'مثيله', 'محمد عاصم'
  ]);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CALLS, JSON.stringify(calls));
  }, [calls]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CALLBACKS, JSON.stringify(callbacks));
  }, [callbacks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(qualityReviews));
  }, [qualityReviews]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients));
  }, [patients]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts));
  }, [alerts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EDIT_HISTORY, JSON.stringify(editHistory));
  }, [editHistory]);

  // Play audio chime when a high-priority alert is triggered
  const playChime = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {}
  };

  const login = (email: string, pin: string) => {
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!found) {
      return { success: false, message: 'البريد الإلكتروني غير مسجل بالنظام.' };
    }
    if (found.pin !== pin) {
      return { success: false, message: 'رمز PIN غير صحيح.' };
    }
    if (!found.active) {
      return { success: false, message: 'هذا الحساب موقوف حالياً. تواصل مع الإدارة.' };
    }
    setCurrentUser(found);
    return { success: true, message: 'تم تسجيل الدخول بنجاح.' };
  };

  const logout = () => {
    // switch to viewer or reset
    setCurrentUser(INITIAL_USERS[0]);
  };

  const switchUser = (user: User) => {
    setCurrentUser(user);
    if (!onlineAgents.includes(user.name)) {
      setOnlineAgents(prev => [...prev, user.name]);
    }
  };

  const normalizeArabic = (str: string) => {
    return str
      .trim()
      .toLowerCase()
      .replace(/[أإآ]/g, 'ا')
      .replace(/[ى]/g, 'ي')
      .replace(/[ة]/g, 'ه')
      .replace(/[\s\-_]/g, '');
  };

  const getPatientQuickInfo = (query: string) => {
    const raw = query.trim();
    if (!raw) return { found: false, isNew: true };

    const cleanDigits = normalizeMobile(raw);
    const norm = normalizeArabic(raw);
    const upperId = raw.toUpperCase().replace(/\s/g, '');

    const found = patients.find(p => {
      // 1. Match by Medical File ID / Patient ID (e.g., P0001, P0002)
      if (p.patientId.toUpperCase() === upperId || p.patientId.toUpperCase().includes(upperId)) {
        return true;
      }
      // 2. Match by mobile digits
      if (cleanDigits.length >= 7) {
        const pClean = normalizeMobile(p.mobile);
        if (pClean.includes(cleanDigits) || cleanDigits.includes(pClean)) {
          return true;
        }
      }
      // 3. Match by name
      if (raw.length >= 3 && normalizeArabic(p.name).includes(norm)) {
        return true;
      }
      return false;
    });

    if (!found) {
      return { found: false, isNew: true };
    }
    return { found: true, isNew: false, patient: found };
  };

  const searchPatientsAdvanced = (
    query: string,
    filters?: { branch?: string; category?: string; doctor?: string; sortBy?: 'visits' | 'recent' | 'name' | 'id' }
  ) => {
    const raw = (query || '').trim();
    const cleanDigits = normalizeMobile(raw);
    const norm = normalizeArabic(raw);
    const upperQuery = raw.toUpperCase();

    let list = patients.filter(p => {
      // Branch filter
      if (filters?.branch && filters.branch !== 'ALL' && p.lastBranch !== filters.branch) {
        return false;
      }

      // Doctor filter
      if (filters?.doctor && filters.doctor !== 'ALL' && p.lastDoctor !== filters.doctor) {
        return false;
      }

      // Category filter
      if (filters?.category) {
        if (filters.category === 'vip' && (p.visitCount || 0) < 4) return false;
        if (filters.category === 'complaints' && !p.hasComplaints) return false;
        if (filters.category === 'new' && (p.visitCount || 0) > 2) return false;
      }

      // If no query string, pass filter
      if (!raw) return true;

      // 1. Check Medical File ID
      if (p.patientId.toUpperCase().includes(upperQuery)) return true;

      // 2. Check Mobile
      if (cleanDigits.length >= 3) {
        const pClean = normalizeMobile(p.mobile);
        if (pClean.includes(cleanDigits) || p.mobile.includes(raw)) return true;
      }

      // 3. Check Name
      if (normalizeArabic(p.name).includes(norm) || p.name.toLowerCase().includes(raw.toLowerCase())) return true;

      return false;
    });

    // Sorting
    const sortBy = filters?.sortBy || 'recent';
    list.sort((a, b) => {
      if (sortBy === 'visits') {
        return (b.visitCount || 0) - (a.visitCount || 0);
      }
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name, 'ar');
      }
      if (sortBy === 'id') {
        return a.patientId.localeCompare(b.patientId);
      }
      // 'recent' by default
      const da = a.lastVisit ? new Date(a.lastVisit).getTime() : 0;
      const db = b.lastVisit ? new Date(b.lastVisit).getTime() : 0;
      return db - da;
    });

    return list;
  };

  const submitCall = (data: Partial<CallRecord>) => {
    const now = new Date();
    const dayStr = `${now.getFullYear()}${('0' + (now.getMonth() + 1)).slice(-2)}${('0' + now.getDate()).slice(-2)}`;
    const timeStr = `${('0' + now.getHours()).slice(-2)}${('0' + now.getMinutes()).slice(-2)}`;
    const randSeq = Math.floor(1000 + Math.random() * 9000);
    const refNum = `CRM-${dayStr}-${timeStr}-${randSeq}`;

    const isPending = data.status === 'Pending' || data.result === 'AwaitingReply';
    const isNoShow = data.callType === 'NoShow';
    const isCallback = (data.purpose?.includes('إعادة اتصال') || data.followup === 'نعم / Yes');

    // Sentiment heuristic based on arabic keywords
    const noteText = data.notes || '';
    let sentiment: 'Positive' | 'Neutral' | 'Negative' | 'Mixed' = 'Neutral';
    let sentimentScore = 0;
    if (noteText.includes('شكرا') || noteText.includes('ممتاز') || noteText.includes('مبسوط') || noteText.includes('راضي') || data.satisfaction === 5) {
      sentiment = 'Positive';
      sentimentScore = 0.8;
    } else if (noteText.includes('شكوى') || noteText.includes('تأخير') || noteText.includes('سيء') || noteText.includes('غاضب') || data.satisfaction === 1 || data.satisfaction === 2) {
      sentiment = 'Negative';
      sentimentScore = -0.7;
    }

    const newCall: CallRecord = {
      referenceNumber: refNum,
      timestamp: now.toISOString(),
      callDate: data.callDate || formatDateNow(),
      callTime: data.callTime || formatTimeNow(),
      callType: data.callType || 'Inbound',
      patientName: data.patientName || 'مريض غير مسجل',
      mobile: data.mobile || '',
      branch: data.branch || currentUser.branch || 'JED',
      team: data.team || currentUser.team || 'Jeddah-A',
      agent: data.agent || currentUser.name,
      agentEmail: data.agentEmail || currentUser.email,
      financial: data.financial || 'Cash patient (نقدي)',
      department: data.department || 'OPH',
      doctor: data.doctor || '',
      purpose: data.purpose || 'استفسار',
      status: data.status || 'Completed',
      result: data.result || 'Inquiry',
      duration: data.duration || 3,
      satisfaction: data.satisfaction || 4,
      notes: data.notes || '',
      followup: data.followup || 'لا / No',
      followupDate: data.followupDate,
      isNoShow,
      isPending,
      isCallback,
      purposeDetails: data.purposeDetails || {},
      sentiment,
      sentimentScore,
      submittedBy: currentUser.email,
    };

    setCalls(prev => [newCall, ...prev]);

    // Upsert Patient registry
    setPatients(prev => {
      const clean = normalizeMobile(newCall.mobile);
      const existingIdx = prev.findIndex(p => normalizeMobile(p.mobile) === clean);
      if (existingIdx > -1) {
        const copy = [...prev];
        const existing = copy[existingIdx];
        copy[existingIdx] = {
          ...existing,
          name: newCall.patientName,
          lastVisit: now.toISOString(),
          lastDoctor: newCall.doctor || existing.lastDoctor,
          lastBranch: newCall.branch || existing.lastBranch,
          visitCount: (existing.visitCount || 0) + 1,
          hasComplaints: existing.hasComplaints || (newCall.purpose === 'شكوى' || newCall.result === 'Complaint')
        };
        return copy;
      } else {
        const newP: Patient = {
          patientId: `P${Math.floor(1000 + Math.random() * 9000)}`,
          name: newCall.patientName,
          mobile: newCall.mobile,
          lastVisit: now.toISOString(),
          lastDoctor: newCall.doctor,
          lastBranch: newCall.branch,
          visitCount: 1,
          createdAt: now.toISOString(),
          hasComplaints: (newCall.purpose === 'شكوى' || newCall.result === 'Complaint')
        };
        return [newP, ...prev];
      }
    });

    // Auto add to callback queue if needed
    if (isCallback) {
      const newCallback: CallbackQueueItem = {
        callbackId: `CB${Math.floor(1000 + Math.random() * 9000)}`,
        createdAt: now.toISOString(),
        dueDate: data.followupDate || formatDateNow(),
        dueTime: '11:00',
        patient: newCall.patientName,
        mobile: newCall.mobile,
        agent: newCall.agent,
        agentEmail: newCall.agentEmail,
        branch: newCall.branch,
        team: newCall.team,
        purpose: newCall.purpose,
        priority: newCall.purpose === 'شكوى' || newCall.purpose === 'حالة عاجلة' ? 'high' : 'normal',
        referenceNumber: refNum,
        status: 'pending',
        notes: newCall.notes,
        postponedCount: 0
      };
      setCallbacks(prev => [newCallback, ...prev]);

      // Create in-app alert
      const newAlert: InAppAlert = {
        alertId: `AL${Date.now()}`,
        createdAt: now.toISOString(),
        recipientEmail: newCall.agentEmail || currentUser.email,
        recipientName: newCall.agent,
        alertType: 'callback_due',
        title: '📞 تم جدولة موعد اتصال جديد',
        message: `تم جدولة إعادة اتصال للمريض ${newCall.patientName} بتاريخ ${newCallback.dueDate}`,
        referenceNumber: refNum,
        callbackId: newCallback.callbackId,
        priority: newCallback.priority,
        isRead: false
      };
      setAlerts(prev => [newAlert, ...prev]);
      playChime();
    }

    return { success: true, referenceNumber: refNum, message: 'تم تسجيل المكالمة بنجاح.' };
  };

  const updateCall = (referenceNumber: string, changes: Partial<CallRecord>, note?: string) => {
    const existing = calls.find(c => c.referenceNumber === referenceNumber);
    if (!existing) {
      return { success: false, message: 'المكالمة غير موجودة.' };
    }

    const historyItems: EditHistoryEntry[] = [];
    const now = new Date().toISOString();

    const trackedKeys: Array<{ key: keyof CallRecord; label: string }> = [
      { key: 'status', label: 'الحالة' },
      { key: 'result', label: 'النتيجة' },
      { key: 'purpose', label: 'سبب الاتصال' },
      { key: 'notes', label: 'الملاحظات' },
      { key: 'department', label: 'القسم' },
      { key: 'doctor', label: 'الطبيب' },
      { key: 'duration', label: 'المدة' },
      { key: 'satisfaction', label: 'تقييم الرضا' },
      { key: 'followup', label: 'المتابعة' },
      { key: 'followupDate', label: 'تاريخ المتابعة' },
      { key: 'patientName', label: 'اسم المريض' },
      { key: 'mobile', label: 'رقم الجوال' }
    ];

    trackedKeys.forEach(t => {
      const oldVal = String(existing[t.key] ?? '');
      const newVal = String(changes[t.key] ?? '');
      if (changes[t.key] !== undefined && oldVal !== newVal) {
        historyItems.push({
          editId: `ED${Math.floor(10000 + Math.random() * 90000)}`,
          editedAt: now,
          referenceNumber,
          editedBy: currentUser.email,
          editedByName: currentUser.name,
          editedByRole: currentUser.role,
          fieldChanged: String(t.key),
          fieldLabelAr: t.label,
          oldValue: oldVal,
          newValue: newVal,
          note: note || '',
          branch: existing.branch,
          agent: existing.agent
        });
      }
    });

    if (historyItems.length > 0) {
      setEditHistory(prev => [...historyItems, ...prev]);
    }

    setCalls(prev => prev.map(c => {
      if (c.referenceNumber === referenceNumber) {
        return {
          ...c,
          ...changes,
          isPending: changes.status === 'Pending' || changes.result === 'AwaitingReply',
          updatedAt: now
        };
      }
      return c;
    }));

    return { success: true, message: `تم تحديث المكالمة وتوثيق ${historyItems.length} تعديل.` };
  };

  const closeCall = (referenceNumber: string) => {
    return updateCall(referenceNumber, { status: 'Completed', result: 'Closed' }, 'إغلاق سريع للمكالمة');
  };

  const transferCall = (referenceNumber: string, toAgentName: string, reason?: string) => {
    const toAgent = INITIAL_AGENTS.find(a => a.name === toAgentName);
    return updateCall(referenceNumber, {
      agent: toAgentName,
      agentEmail: toAgent?.email || '',
      team: toAgent?.teamCode || ''
    }, `تحويل المكالمة إلى ${toAgentName} | السبب: ${reason || 'تحويل روتيني'}`);
  };

  const completeCallback = (callbackId: string) => {
    setCallbacks(prev => prev.map(cb => {
      if (cb.callbackId === callbackId) {
        return {
          ...cb,
          status: 'completed',
          completedAt: new Date().toISOString(),
          completedBy: currentUser.name
        };
      }
      return cb;
    }));
  };

  const snoozeCallback = (callbackId: string, preset: '1h' | '4h' | '1d' | '1w') => {
    const target = new Date();
    if (preset === '1h') target.setHours(target.getHours() + 1);
    else if (preset === '4h') target.setHours(target.getHours() + 4);
    else if (preset === '1d') target.setDate(target.getDate() + 1);
    else if (preset === '1w') target.setDate(target.getDate() + 7);

    const pad = (n: number) => ('0' + n).slice(-2);
    const newDate = `${target.getFullYear()}-${pad(target.getMonth() + 1)}-${pad(target.getDate())}`;
    const newTime = `${pad(target.getHours())}:${pad(target.getMinutes())}`;

    postponeCallback(callbackId, newDate, newTime);
  };

  const postponeCallback = (callbackId: string, newDate: string, newTime: string) => {
    setCallbacks(prev => prev.map(cb => {
      if (cb.callbackId === callbackId) {
        return {
          ...cb,
          dueDate: newDate,
          dueTime: newTime,
          postponedCount: (cb.postponedCount || 0) + 1
        };
      }
      return cb;
    }));
  };

  const addManualCallback = (data: Partial<CallbackQueueItem>) => {
    const newCb: CallbackQueueItem = {
      callbackId: `CB${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      dueDate: data.dueDate || formatDateNow(),
      dueTime: data.dueTime || '10:00',
      patient: data.patient || '',
      mobile: data.mobile || '',
      agent: data.agent || currentUser.name,
      agentEmail: data.agentEmail || currentUser.email,
      branch: data.branch || currentUser.branch || 'JED',
      team: data.team || currentUser.team || 'Jeddah-A',
      purpose: data.purpose || 'متابعة خاصة',
      priority: data.priority || 'normal',
      referenceNumber: data.referenceNumber || `CRM-MANUAL-${Date.now()}`,
      status: 'pending',
      notes: data.notes || '',
      postponedCount: 0
    };
    setCallbacks(prev => [newCb, ...prev]);
  };

  const addQualityReview = (review: { referenceNumber: string; qualityRating: number; qualityComment: string; commentType: 'quality' | 'teamlead' }) => {
    const call = calls.find(c => c.referenceNumber === review.referenceNumber);
    if (!call) return { success: false, message: 'المكالمة غير موجودة.' };

    const newRev: QualityReviewItem = {
      reviewId: review.commentType === 'teamlead' ? `TL${Math.floor(1000 + Math.random() * 9000)}` : `QR${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      referenceNumber: review.referenceNumber,
      agent: call.agent,
      agentEmail: call.agentEmail,
      branch: call.branch,
      team: call.team,
      callDuration: call.duration,
      qualityRating: review.qualityRating,
      qualityComment: review.qualityComment,
      qualityBy: currentUser.name,
      qualityByEmail: currentUser.email,
      status: 'open',
      commentType: review.commentType
    };

    setQualityReviews(prev => [newRev, ...prev]);

    // Update the call record with quality fields
    updateCall(review.referenceNumber, {
      qualityRating: review.qualityRating,
      qualityComment: review.qualityComment,
      qualityBy: currentUser.name,
      qualityAt: newRev.createdAt
    });

    // Alert the agent
    if (call.agentEmail) {
      const alert: InAppAlert = {
        alertId: `AL${Date.now()}`,
        createdAt: newRev.createdAt,
        recipientEmail: call.agentEmail,
        recipientName: call.agent,
        alertType: review.commentType === 'teamlead' ? 'teamlead_comment' : 'quality_comment',
        title: review.commentType === 'teamlead' ? '💬 تعليق جديد من مشرف الفريق' : '⭐ تقييم جودة جديد',
        message: `تم إضافة تعليق على مكالمتك (${review.referenceNumber}): ${review.qualityComment.slice(0, 80)}...`,
        referenceNumber: review.referenceNumber,
        qualityReviewId: newRev.reviewId,
        priority: 'normal',
        isRead: false
      };
      setAlerts(prev => [alert, ...prev]);
      playChime();
    }

    return { success: true, message: 'تم حفظ التقييم بنجاح وإشعار الموظف.' };
  };

  const replyToReview = (reviewId: string, replyText: string) => {
    setQualityReviews(prev => prev.map(r => {
      if (r.reviewId === reviewId) {
        return {
          ...r,
          agentReply: replyText,
          agentReplyAt: new Date().toISOString(),
          repliedBy: currentUser.name,
          status: 'closed'
        };
      }
      return r;
    }));
  };

  const markAlertRead = (alertId: string) => {
    setAlerts(prev => prev.map(a => a.alertId === alertId ? { ...a, isRead: true } : a));
  };

  const markAllAlertsRead = () => {
    setAlerts(prev => prev.map(a => ({ ...a, isRead: true })));
  };

  const exportCallsToExcel = (filters?: { branch?: string; dateFrom?: string; dateTo?: string }) => {
    let filtered = calls;
    if (filters?.branch && filters.branch !== 'ALL') {
      filtered = filtered.filter(c => c.branch === filters.branch);
    }
    if (filters?.dateFrom) {
      filtered = filtered.filter(c => c.callDate >= filters.dateFrom!);
    }
    if (filters?.dateTo) {
      filtered = filtered.filter(c => c.callDate <= filters.dateTo!);
    }

    const dataForSheet = filtered.map(c => ({
      'الرقم المرجعي': c.referenceNumber,
      'تاريخ المكالمة': c.callDate,
      'وقت المكالمة': c.callTime,
      'الفرع': c.branch === 'JED' ? 'فرع جدة' : 'فرع محايل عسير',
      'الموظف': c.agent,
      'نوع المكالمة': c.callType,
      'اسم المريض': c.patientName,
      'رقم الجوال': c.mobile,
      'القسم': c.department,
      'الطبيب': c.doctor,
      'سبب الاتصال': c.purpose,
      'الحالة': c.status,
      'النتيجة': c.result,
      'المدة (دقيقة)': c.duration,
      'تقييم الرضا': c.satisfaction,
      'الملاحظات': c.notes,
      'متابعة مطلوبة': c.followup
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataForSheet);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'سجل المكالمات');
    XLSX.writeFile(workbook, `ExpertsCare_Calls_${formatDateNow()}.xlsx`);
  };

  const exportCallsToCSV = (filters?: { branch?: string; dateFrom?: string; dateTo?: string }) => {
    exportCallsToExcel(filters); // Uses full Excel xlsx directly
  };

  const resetToInitialData = () => {
    setCalls(INITIAL_CALLS);
    setCallbacks(INITIAL_CALLBACKS);
    setQualityReviews(INITIAL_QUALITY_REVIEWS);
    setPatients(INITIAL_PATIENTS);
    setAlerts(INITIAL_ALERTS);
    setEditHistory([]);
    localStorage.clear();
  };

  return (
    <CRMContext.Provider value={{
      currentUser,
      users,
      branches: INITIAL_BRANCHES,
      teams: INITIAL_TEAMS,
      departments: INITIAL_DEPARTMENTS,
      doctors: INITIAL_DOCTORS,
      agents: INITIAL_AGENTS,
      purposes: INITIAL_PURPOSES,
      purposeFields: INITIAL_PURPOSE_FIELDS,
      financial: INITIAL_FINANCIAL,
      slaRules: INITIAL_SLA_RULES,

      calls,
      callbacks,
      qualityReviews,
      patients,
      alerts,
      editHistory,
      onlineAgents,

      login,
      logout,
      switchUser,

      submitCall,
      updateCall,
      closeCall,
      transferCall,

      completeCallback,
      snoozeCallback,
      postponeCallback,
      addManualCallback,

      addQualityReview,
      replyToReview,

      markAlertRead,
      markAllAlertsRead,
      getPatientQuickInfo,
      searchPatientsAdvanced,

      exportCallsToExcel,
      exportCallsToCSV,
      resetToInitialData
    }}>
      {children}
    </CRMContext.Provider>
  );
};

export const useCRM = () => {
  const context = useContext(CRMContext);
  if (!context) {
    throw new Error('useCRM must be used within a CRMProvider');
  }
  return context;
};
