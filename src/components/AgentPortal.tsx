import React, { useState, useMemo } from 'react';
import { useCRM } from '../context/CRMContext';
import { CallRecord, CallbackQueueItem, Patient } from '../types/crm';
import {
  Phone, UserCheck, Clock, Calendar, CheckCircle2, AlertCircle,
  RotateCw, ArrowRightLeft, FileEdit, Star, MessageSquare, AlertTriangle,
  Send, Sparkles, User, Award, ShieldAlert, History, Search,
  Copy, Check, ExternalLink, MessageCircle, SlidersHorizontal, Hash,
  ArrowUpDown, UserPlus, PhoneForwarded, Eye, X, Filter
} from 'lucide-react';

export const AgentPortal: React.FC = () => {
  const {
    currentUser, branches, departments, doctors, agents,
    purposes, purposeFields, financial, calls, callbacks,
    qualityReviews, patients, submitCall, updateCall, closeCall,
    transferCall, completeCallback, snoozeCallback, postponeCallback,
    replyToReview, getPatientQuickInfo, searchPatientsAdvanced,
    addManualCallback, editHistory
  } = useCRM();

  const [activeTab, setActiveTab] = useState<'newCall' | 'patientSearch' | 'myCalls' | 'pending' | 'callbacks' | 'quality' | 'myStats'>('newCall');

  // Advanced Search & Filter in Patient Directory
  const [patientSearchQuery, setPatientSearchQuery] = useState('');
  const [patientBranchFilter, setPatientBranchFilter] = useState('ALL');
  const [patientCategoryFilter, setPatientCategoryFilter] = useState<'all' | 'vip' | 'complaints' | 'new'>('all');
  const [patientDoctorFilter, setPatientDoctorFilter] = useState('ALL');
  const [patientSortBy, setPatientSortBy] = useState<'recent' | 'visits' | 'name' | 'id'>('recent');
  const [selectedPatientTimeline, setSelectedPatientTimeline] = useState<Patient | null>(null);
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

  // Quick Auto-fill search in New Call form
  const [quickSearchInput, setQuickSearchInput] = useState('');
  const [showQuickDropdown, setShowQuickDropdown] = useState(false);

  // Form State
  const [formData, setFormData] = useState<{
    branch: string;
    agent: string;
    callDate: string;
    callTime: string;
    callType: 'Inbound' | 'Outbound' | 'Outbound-Lead' | 'NoShow';
    patientName: string;
    mobile: string;
    financial: string;
    department: string;
    doctor: string;
    purpose: string;
    status: 'Completed' | 'Pending' | 'NoAnswer' | 'Cancelled';
    result: 'Booked' | 'Confirmed' | 'Inquiry' | 'Complaint' | 'AwaitingReply' | 'CancelBooking' | 'FollowUp';
    duration: number;
    satisfaction: number;
    notes: string;
    followup: 'نعم / Yes' | 'لا / No';
    followupDate: string;
    purposeDetails: Record<string, string>;
  }>({
    branch: currentUser.branch && currentUser.branch !== 'All' ? currentUser.branch : 'JED',
    agent: currentUser.name,
    callDate: new Date().toISOString().split('T')[0],
    callTime: `${('0' + new Date().getHours()).slice(-2)}:${('0' + new Date().getMinutes()).slice(-2)}`,
    callType: 'Inbound',
    patientName: '',
    mobile: '',
    financial: 'Cash patient (نقدي)',
    department: 'OPH',
    doctor: '',
    purpose: 'حجز موعد',
    status: 'Completed',
    result: 'Booked',
    duration: 4,
    satisfaction: 5,
    notes: '',
    followup: 'لا / No',
    followupDate: '',
    purposeDetails: {
      appointmentDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      appointmentTime: 'صباحي (09:00 - 13:00)',
      visitType: 'كشف جديد'
    }
  });

  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [editingCall, setEditingCall] = useState<CallRecord | null>(null);
  const [editNote, setEditNote] = useState('');
  const [transferringCall, setTransferringCall] = useState<CallRecord | null>(null);
  const [targetAgent, setTargetAgent] = useState('');
  const [transferReason, setTransferReason] = useState('');
  const [historyModalRef, setHistoryModalRef] = useState<string | null>(null);
  const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [customPostponeId, setCustomPostponeId] = useState<string | null>(null);
  const [postponeDate, setPostponeDate] = useState('');
  const [postponeTime, setPostponeTime] = useState('11:00');

  // Realtime Patient Quick Info on mobile input
  const patientInfo = useMemo(() => {
    if (formData.mobile.length >= 8) {
      return getPatientQuickInfo(formData.mobile);
    }
    return null;
  }, [formData.mobile, getPatientQuickInfo]);

  // Advanced search calculation in Patient Directory
  const filteredPatients = useMemo(() => {
    return searchPatientsAdvanced(patientSearchQuery, {
      branch: patientBranchFilter,
      category: patientCategoryFilter === 'all' ? undefined : patientCategoryFilter,
      doctor: patientDoctorFilter,
      sortBy: patientSortBy
    });
  }, [searchPatientsAdvanced, patientSearchQuery, patientBranchFilter, patientCategoryFilter, patientDoctorFilter, patientSortBy]);

  // Quick live suggestions in New Call form
  const quickSearchMatches = useMemo(() => {
    if (!quickSearchInput.trim() || quickSearchInput.trim().length < 2) return [];
    return searchPatientsAdvanced(quickSearchInput).slice(0, 5);
  }, [searchPatientsAdvanced, quickSearchInput]);

  const handleSelectPatientForForm = (p: Patient) => {
    setFormData(prev => ({
      ...prev,
      patientName: p.name,
      mobile: p.mobile,
      branch: p.lastBranch || prev.branch,
      doctor: p.lastDoctor || prev.doctor
    }));
    setQuickSearchInput('');
    setShowQuickDropdown(false);
  };

  const handleLogCallForPatient = (p: Patient) => {
    handleSelectPatientForForm(p);
    setActiveTab('newCall');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCopyPhone = (phone: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedPhone(phone);
    setTimeout(() => setCopiedPhone(null), 2000);
  };

  // Doctors filtered by branch & department
  const availableDoctors = useMemo(() => {
    return doctors.filter(d => d.branchCode === formData.branch && d.deptCode === formData.department);
  }, [doctors, formData.branch, formData.department]);

  // Agents filtered by branch
  const availableAgents = useMemo(() => {
    return agents;
  }, [agents]);

  // Dynamic fields for currently chosen purpose
  const currentPurposeObj = purposes.find(p => p.name === formData.purpose);
  const currentFields = useMemo(() => {
    if (!currentPurposeObj) return [];
    return purposeFields.filter(f => f.purposeCode === currentPurposeObj.code);
  }, [purposeFields, currentPurposeObj]);

  // Filtered views
  const myCallsList = calls.filter(c => currentUser.role === 'admin' || c.agent === currentUser.name || currentUser.role === 'manager');
  const myPendingList = myCallsList.filter(c => c.isPending);
  const myCallbacksList = callbacks.filter(cb => cb.status === 'pending' && (currentUser.role === 'admin' || cb.agent === currentUser.name || currentUser.role === 'manager'));
  const myReviewsList = qualityReviews.filter(r => currentUser.role === 'admin' || r.agent === currentUser.name || currentUser.role === 'manager');

  // Stats for the agent
  const todayCalls = myCallsList.filter(c => c.callDate === new Date().toISOString().split('T')[0]);
  const completedToday = todayCalls.filter(c => c.status === 'Completed').length;
  const bookedToday = todayCalls.filter(c => c.result === 'Booked' || c.result === 'Confirmed').length;
  const complaintsToday = todayCalls.filter(c => c.result === 'Complaint').length;

  const handlePurposeChange = (purposeName: string) => {
    const obj = purposes.find(p => p.name === purposeName);
    const initialDetails: Record<string, string> = {};
    if (obj) {
      const fields = purposeFields.filter(f => f.purposeCode === obj.code);
      fields.forEach(f => {
        if (f.fieldType === 'date') initialDetails[f.fieldKey] = new Date().toISOString().split('T')[0];
        else if (f.fieldType === 'select' && f.options?.length) initialDetails[f.fieldKey] = f.options[0];
        else initialDetails[f.fieldKey] = '';
      });
    }

    setFormData(prev => ({
      ...prev,
      purpose: purposeName,
      purposeDetails: initialDetails,
      followup: purposeName.includes('إعادة اتصال') ? 'نعم / Yes' : prev.followup
    }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patientName || !formData.mobile) {
      alert('يرجى إدخال اسم المريض ورقم الجوال');
      return;
    }

    const res = submitCall(formData);
    if (res.success) {
      setSubmitSuccess(res.referenceNumber);
      // Reset form
      setFormData(prev => ({
        ...prev,
        patientName: '',
        mobile: '',
        notes: '',
        followup: 'لا / No',
        duration: 4
      }));
    }
  };

  return (
    <div className="space-y-6">

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab('newCall')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === 'newCall'
              ? 'bg-[#0B6E99] text-white shadow-xs'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <Phone className="w-4 h-4" />
          <span>تسجيل مكالمة جديدة</span>
        </button>

        <button
          onClick={() => setActiveTab('patientSearch')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === 'patientSearch'
              ? 'bg-[#0B6E99] text-white shadow-xs'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <Search className="w-4 h-4 text-sky-500" />
          <span>بحث وسجل المرضى ({patients.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('myCalls')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === 'myCalls'
              ? 'bg-[#0B6E99] text-white shadow-xs'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>مكالماتي ({myCallsList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('pending')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === 'pending'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <Clock className="w-4 h-4 text-amber-500" />
          <span>المعلقة ({myPendingList.length})</span>
          {myPendingList.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[11px] font-extrabold flex items-center justify-center">
              {myPendingList.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('callbacks')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === 'callbacks'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <RotateCw className="w-4 h-4 text-purple-500" />
          <span>قائمة Callbacks ({myCallbacksList.length})</span>
          {myCallbacksList.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-purple-500 text-white text-[11px] font-extrabold flex items-center justify-center">
              {myCallbacksList.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('quality')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === 'quality'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <Star className="w-4 h-4 text-indigo-500" />
          <span>مراجعات الجودة ({myReviewsList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('myStats')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === 'myStats'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <Award className="w-4 h-4 text-teal-500" />
          <span>إحصائياتي اليومية</span>
        </button>
      </div>

      {/* TAB: NEW CALL LOG */}
      {activeTab === 'newCall' && (
        <div className="space-y-6">

          {/* Success Banner */}
          {submitSuccess && (
            <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-5 flex items-center justify-between text-emerald-900 shadow-sm animate-in fade-in">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xl">
                  ✓
                </div>
                <div>
                  <h3 className="font-extrabold text-base">تم تسجيل المكالمة بنجاح وحفظها في السجل الموحد!</h3>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    الرقم المرجعي المولد: <span className="font-mono font-bold text-sm bg-white px-2 py-0.5 rounded border border-emerald-300">{submitSuccess}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSubmitSuccess(null)}
                className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-emerald-700"
              >
                تسجيل أخرى
              </button>
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="space-y-6">
            
            {/* Section 1: Patient Information & Instant Lookup */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2 text-slate-800 font-bold">
                  <User className="w-5 h-5 text-[#0B6E99]" />
                  <span className="text-base">1. بيانات المريض والبحث الفوري (Patient Quick Lookup)</span>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('patientSearch')}
                  className="text-xs font-bold text-[#0B6E99] hover:text-[#0B6E99]/80 flex items-center gap-1.5 bg-[#0B6E99]/10 px-3 py-1.5 rounded-xl border border-[#0B6E99]/20"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>فتح محرك البحث المتقدم وسجل المرضى ↗</span>
                </button>
              </div>

              {/* Quick Patient Search & Auto-Fill Bar */}
              <div className="relative p-3.5 bg-gradient-to-r from-sky-50 via-indigo-50/50 to-slate-50 border border-sky-200/80 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-[#0B6E99] flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5" />
                    <span>البحث السريع والتعبئة التلقائية برقم الجوال، الاسم، أو رقم الملف الطبي:</span>
                  </span>
                  <span className="text-[11px] text-slate-400">
                    جرب البحث بـ: <span className="font-mono text-slate-600 font-bold">P0001</span> أو <span className="font-mono text-slate-600 font-bold">0551234567</span> أو <span className="font-bold text-slate-600">القرني</span>
                  </span>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={quickSearchInput}
                    onChange={e => {
                      setQuickSearchInput(e.target.value);
                      setShowQuickDropdown(true);
                    }}
                    onFocus={() => setShowQuickDropdown(true)}
                    placeholder="اكتب رقم الجوال، اسم المريض، أو رقم الملف الطبي للبحث الفوري..."
                    className="w-full px-4 py-2.5 pl-8 rounded-xl border border-sky-300 bg-white text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B6E99]"
                  />
                  {quickSearchInput && (
                    <button
                      type="button"
                      onClick={() => setQuickSearchInput('')}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}

                  {/* Suggestions Popover Dropdown */}
                  {showQuickDropdown && quickSearchMatches.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-30 max-h-60 overflow-y-auto divide-y divide-slate-100">
                      {quickSearchMatches.map(m => (
                        <div
                          key={m.patientId}
                          onClick={() => handleSelectPatientForForm(m)}
                          className="p-3 hover:bg-sky-50/80 cursor-pointer flex items-center justify-between text-xs transition-colors"
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[10px] bg-slate-100 border border-slate-200 text-[#0B6E99] font-extrabold px-1.5 py-0.5 rounded">
                                {m.patientId}
                              </span>
                              <strong className="text-slate-900 text-xs">{m.name}</strong>
                              {m.visitCount >= 4 && (
                                <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                                  👑 VIP
                                </span>
                              )}
                              {m.hasComplaints && (
                                <span className="bg-rose-100 text-rose-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                                  ⚠️ شكوى سابقة
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-3">
                              <span dir="ltr" className="font-mono">📱 {m.mobile}</span>
                              <span>🏥 آخر فرع: {m.lastBranch === 'JED' ? 'جدة' : 'محايل'}</span>
                              {m.lastDoctor && <span>👨‍⚕️ {m.lastDoctor}</span>}
                              <span>📊 زيارات: {m.visitCount}</span>
                            </div>
                          </div>
                          <span className="text-[11px] font-extrabold text-[#0B6E99] bg-[#0B6E99]/10 px-2.5 py-1 rounded-lg">
                            اختيار وتعبئة ↵
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    رقم الجوال * <span className="text-slate-400 font-normal">(أو رقم الهاتف المعتمد)</span>
                  </label>
                  <input
                    type="tel"
                    required
                    dir="ltr"
                    value={formData.mobile}
                    onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                    placeholder="05XXXXXXXX"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0B6E99] font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">اسم المريض *</label>
                  <input
                    type="text"
                    required
                    value={formData.patientName}
                    onChange={e => setFormData({ ...formData, patientName: e.target.value })}
                    placeholder="الاسم الثلاثي أو الثنائي للمريض"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0B6E99] text-sm"
                  />
                </div>
              </div>

              {/* Patient Quick Card - Realtime badge */}
              {patientInfo && patientInfo.found && patientInfo.patient && (
                <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs ${
                  patientInfo.patient.hasComplaints
                    ? 'bg-rose-50 border-rose-200 text-rose-900'
                    : (patientInfo.patient.visitCount >= 4 ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-blue-50 border-blue-200 text-blue-900')
                }`}>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 font-bold text-sm">
                      <span className="font-mono text-xs bg-white/80 border border-slate-300 text-slate-800 px-2 py-0.5 rounded font-extrabold">
                        رقم الملف: {patientInfo.patient.patientId}
                      </span>
                      <span>👤 {patientInfo.patient.name}</span>
                      {patientInfo.patient.visitCount >= 4 && (
                        <span className="bg-amber-500 text-white font-extrabold px-2 py-0.5 rounded-full text-[10px]">
                          👑 مريض دائم (VIP)
                        </span>
                      )}
                      {patientInfo.patient.hasComplaints && (
                        <span className="bg-rose-600 text-white font-extrabold px-2 py-0.5 rounded-full text-[10px] flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> تنبيه شكوى سابقة
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-4 text-[11px] text-slate-600">
                      <span>📊 عدد الزيارات السابقة: <strong className="text-slate-900">{patientInfo.patient.visitCount}</strong></span>
                      <span>🏥 آخر فرع: <strong className="text-slate-900">{patientInfo.patient.lastBranch === 'JED' ? 'فرع جدة' : 'فرع محايل'}</strong></span>
                      <span>👨‍⚕️ آخر طبيب: <strong className="text-slate-900">{patientInfo.patient.lastDoctor || '---'}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedPatientTimeline(patientInfo.patient!)}
                      className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-lg font-bold text-xs flex items-center gap-1 shadow-2xs"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#0B6E99]" />
                      <span>السجل الكامل للمريض</span>
                    </button>
                  </div>
                </div>
              )}
                  {patientInfo.patient.notes && (
                    <div className="text-[11px] italic bg-white/70 px-3 py-1.5 rounded-lg border border-slate-200/50">
                      ملاحظة سابقة: {patientInfo.patient.notes}
                    </div>
                  )}
                </div>
              )}

              {patientInfo && patientInfo.isNew && formData.mobile.length >= 9 && (
                <div className="p-3 bg-slate-50 border border-slate-200 text-slate-600 rounded-xl text-xs flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                  <span>مريض جديد لم يسبق له التسجيل من قبل، سيتم تسجيله تلقائياً في السجل الموحد.</span>
                </div>
              )}
            </div>

            {/* Section 2: Call Context & Logistics */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-slate-800 font-bold border-b border-slate-100 pb-3">
                <Clock className="w-5 h-5 text-[#0B6E99]" />
                <span className="text-base">2. تفاصيل المكالمة واللوجستيات</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الفرع *</label>
                  <select
                    value={formData.branch}
                    onChange={e => setFormData({ ...formData, branch: e.target.value, doctor: '' })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold"
                  >
                    {branches.map(b => (
                      <option key={b.code} value={b.code}>{b.nameAr}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الموظف المسجل *</label>
                  <select
                    value={formData.agent}
                    onChange={e => setFormData({ ...formData, agent: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm"
                  >
                    {availableAgents.map(a => (
                      <option key={a.id} value={a.name}>{a.name} ({a.teamCode})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">نوع المكالمة *</label>
                  <select
                    value={formData.callType}
                    onChange={e => setFormData({ ...formData, callType: e.target.value as any })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold"
                  >
                    <option value="Inbound">واردة (Inbound)</option>
                    <option value="Outbound">صادرة (Outbound)</option>
                    <option value="Outbound-Lead">صادرة - ليدز (Outbound-Lead)</option>
                    <option value="NoShow">لم تحضر (NoShow)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">مدة المكالمة (بالدقائق)</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={formData.duration}
                    onChange={e => setFormData({ ...formData, duration: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-center"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Medical Department & Doctor */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-slate-800 font-bold border-b border-slate-100 pb-3">
                <Calendar className="w-5 h-5 text-[#0B6E99]" />
                <span className="text-base">3. القسم الطبي، الطبيب، والفئة المالية</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">القسم الطبي *</label>
                  <select
                    value={formData.department}
                    onChange={e => setFormData({ ...formData, department: e.target.value, doctor: '' })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold"
                  >
                    {departments.filter(d => d.branchCode === formData.branch).map(d => (
                      <option key={`${d.branchCode}-${d.code}`} value={d.code}>{d.nameAr} ({d.nameEn})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الطبيب المعالج *</label>
                  <select
                    value={formData.doctor}
                    onChange={e => setFormData({ ...formData, doctor: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm"
                  >
                    <option value="">-- اختر الطبيب --</option>
                    {availableDoctors.map(doc => (
                      <option key={doc.id} value={doc.nameAr}>
                        {doc.nameAr} - {doc.specialty}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الفئة المالية / التأمين</label>
                  <select
                    value={formData.financial}
                    onChange={e => setFormData({ ...formData, financial: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm"
                  >
                    {financial.map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Section 4: Call Reason & Dynamic Custom Fields */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-slate-800 font-bold border-b border-slate-100 pb-3">
                <FileEdit className="w-5 h-5 text-[#0B6E99]" />
                <span className="text-base">4. سبب الاتصال والحقول المخصصة (Dynamic Purpose Fields)</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">سبب الاتصال *</label>
                <select
                  value={formData.purpose}
                  onChange={e => handlePurposeChange(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-bold text-[#0B6E99]"
                >
                  {purposes.map(p => (
                    <option key={p.code} value={p.name}>{p.name} ({p.nameEn})</option>
                  ))}
                </select>
              </div>

              {/* Dynamic Sub-Fields */}
              {currentFields.length > 0 && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div className="font-bold text-xs text-slate-600">حقول إضافية مطلوبة لسبب ({formData.purpose}):</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentFields.map(field => (
                      <div key={field.fieldKey}>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          {field.fieldLabelAr} {field.isRequired && '*'}
                        </label>
                        {field.fieldType === 'select' ? (
                          <select
                            value={formData.purposeDetails[field.fieldKey] || ''}
                            onChange={e => setFormData({
                              ...formData,
                              purposeDetails: { ...formData.purposeDetails, [field.fieldKey]: e.target.value }
                            })}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs"
                          >
                            {field.options?.map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        ) : field.fieldType === 'date' ? (
                          <input
                            type="date"
                            value={formData.purposeDetails[field.fieldKey] || ''}
                            onChange={e => setFormData({
                              ...formData,
                              purposeDetails: { ...formData.purposeDetails, [field.fieldKey]: e.target.value }
                            })}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs"
                          />
                        ) : (
                          <input
                            type="text"
                            value={formData.purposeDetails[field.fieldKey] || ''}
                            onChange={e => setFormData({
                              ...formData,
                              purposeDetails: { ...formData.purposeDetails, [field.fieldKey]: e.target.value }
                            })}
                            placeholder={field.fieldLabelAr}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Section 5: Call Result & Follow-up */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-slate-800 font-bold border-b border-slate-100 pb-3">
                <CheckCircle2 className="w-5 h-5 text-[#0B6E99]" />
                <span className="text-base">5. النتيجة، التقييم، والمتابعة</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">حالة المكالمة *</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold"
                  >
                    <option value="Completed">مكتملة (Completed)</option>
                    <option value="Pending">معلقة (Pending)</option>
                    <option value="NoAnswer">لم يرد (NoAnswer)</option>
                    <option value="Cancelled">ملغاة (Cancelled)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">النتيجة النهائية *</label>
                  <select
                    value={formData.result}
                    onChange={e => setFormData({ ...formData, result: e.target.value as any })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold"
                  >
                    <option value="Booked">تم الحجز (Booked)</option>
                    <option value="Confirmed">تأكيد حجز (Confirmed)</option>
                    <option value="Inquiry">استفسار (Inquiry)</option>
                    <option value="Complaint">شكوى (Complaint)</option>
                    <option value="AwaitingReply">انتظار رد (AwaitingReply)</option>
                    <option value="CancelBooking">إلغاء حجز (CancelBooking)</option>
                    <option value="FollowUp">متابعة (FollowUp)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">تقييم رضا المريض</label>
                  <select
                    value={formData.satisfaction}
                    onChange={e => setFormData({ ...formData, satisfaction: parseInt(e.target.value) || 5 })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm"
                  >
                    <option value="5">⭐⭐⭐⭐⭐ ممتاز (5)</option>
                    <option value="4">⭐⭐⭐⭐ جيد جداً (4)</option>
                    <option value="3">⭐⭐⭐ جيد (3)</option>
                    <option value="2">⭐⭐ مقبول (2)</option>
                    <option value="1">⭐ ضعيف (1)</option>
                  </select>
                </div>
              </div>

              {/* Followup & Callback Toggle */}
              <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-amber-900">هل تحتاج المكالمة إلى متابعة أو إعادة اتصال؟</span>
                  <div className="flex items-center gap-3">
                    <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-700">
                      <input
                        type="radio"
                        name="followup"
                        checked={formData.followup === 'نعم / Yes'}
                        onChange={() => setFormData({ ...formData, followup: 'نعم / Yes' })}
                      />
                      <span>نعم (إضافة لقائمة المتابعة)</span>
                    </label>
                    <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-700">
                      <input
                        type="radio"
                        name="followup"
                        checked={formData.followup === 'لا / No'}
                        onChange={() => setFormData({ ...formData, followup: 'لا / No' })}
                      />
                      <span>لا</span>
                    </label>
                  </div>
                </div>

                {formData.followup === 'نعم / Yes' && (
                  <div className="pt-2 border-t border-amber-200/60 flex items-center gap-3">
                    <label className="text-xs font-bold text-amber-800">تاريخ المتابعة المطلوب:</label>
                    <input
                      type="date"
                      value={formData.followupDate}
                      onChange={e => setFormData({ ...formData, followupDate: e.target.value })}
                      className="px-3 py-1.5 rounded-lg border border-amber-300 bg-white text-xs font-mono font-bold"
                    />
                    <span className="text-[11px] text-amber-700">
                      سيتم إدراج هذه الحالة فوراً في قائمة الـ Callbacks وسيتم تنبيهك عند حلول الموعد.
                    </span>
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ملاحظات المكالمة</label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="اكتب تفاصيل المكالمة، رغبات المريض، أو أي ملاحظات سريرية وتنظيمية..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B6E99]"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="submit"
                className="px-8 py-3.5 bg-gradient-to-r from-[#0B6E99] to-[#14A5C9] text-white rounded-xl font-extrabold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>حفظ المكالمة في النظام (Save Call Record)</span>
              </button>
            </div>

          </form>
        </div>
      )}

      {/* TAB: ADVANCED PATIENT SEARCH & DIRECTORY */}
      {activeTab === 'patientSearch' && (
        <div className="space-y-6">

          {/* Directory Header with Summary Stats */}
          <div className="bg-gradient-to-r from-[#0B6E99] to-[#14A5C9] text-white p-6 rounded-3xl shadow-sm space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white">
                  <Search className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-extrabold">دليل ومحرك البحث المتقدم في سجل المرضى</h2>
                    <span className="bg-white/20 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full font-mono">
                      Patient MRN Directory
                    </span>
                  </div>
                  <p className="text-xs text-white/90 mt-0.5">
                    ابحث برقم الجوال، اسم المريض، أو رقم الملف الطبي (Medical File ID) مع تصفية متعددة المستويات
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      patientName: '',
                      mobile: ''
                    }));
                    setActiveTab('newCall');
                  }}
                  className="px-4 py-2 bg-white text-[#0B6E99] hover:bg-white/90 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-sm cursor-pointer transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>تسجيل مريض ومكالمة جديدة</span>
                </button>
              </div>
            </div>

            {/* Quick Stat Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-white/20 text-xs">
              <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl">
                <span className="text-white/80 block text-[11px]">إجمالي المرضى المسجلين:</span>
                <strong className="text-lg font-extrabold">{patients.length}</strong>
              </div>
              <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl">
                <span className="text-white/80 block text-[11px]">مرضى دائمين (VIP):</span>
                <strong className="text-lg font-extrabold">{patients.filter(p => (p.visitCount || 0) >= 4).length}</strong>
              </div>
              <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl">
                <span className="text-white/80 block text-[11px]">ملفات بها شكاوى سابقة:</span>
                <strong className="text-lg font-extrabold text-amber-200">{patients.filter(p => p.hasComplaints).length}</strong>
              </div>
              <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl">
                <span className="text-white/80 block text-[11px]">النتائج المطابقة للبحث:</span>
                <strong className="text-lg font-extrabold text-emerald-200">{filteredPatients.length}</strong>
              </div>
            </div>
          </div>

          {/* Advanced Search & Filtering Toolbar */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            
            {/* Primary Search Bar */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                البحث السريع (رقم الجوال، اسم المريض، أو رقم الملف الطبي):
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={patientSearchQuery}
                  onChange={e => setPatientSearchQuery(e.target.value)}
                  placeholder="مثال: P0001، 0551234567، عبدالله بن سعد، القرني..."
                  className="w-full px-4 py-3 pl-10 rounded-xl border-2 border-slate-200 focus:border-[#0B6E99] focus:outline-none text-sm text-slate-900 placeholder-slate-400 font-medium"
                />
                <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                {patientSearchQuery && (
                  <button
                    onClick={() => setPatientSearchQuery('')}
                    className="absolute left-10 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Filter Dropdowns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-600 mb-1">الفرع الطبي:</label>
                <select
                  value={patientBranchFilter}
                  onChange={e => setPatientBranchFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800"
                >
                  <option value="ALL">كل الفروع (JED & MAH)</option>
                  {branches.map(b => (
                    <option key={b.code} value={b.code}>{b.nameAr} ({b.nameEn})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">تصنيف المريض:</label>
                <select
                  value={patientCategoryFilter}
                  onChange={e => setPatientCategoryFilter(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800"
                >
                  <option value="all">جميع الحالات والتصنيفات</option>
                  <option value="vip">👑 مرضى VIP (4+ زيارات)</option>
                  <option value="complaints">⚠️ مرضى لديهم شكاوى سابقة</option>
                  <option value="new">🆕 مرضى جدد (1-2 زيارة)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">الطبيب السابق:</label>
                <select
                  value={patientDoctorFilter}
                  onChange={e => setPatientDoctorFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800"
                >
                  <option value="ALL">جميع الأطباء المعالجين</option>
                  {doctors.slice(0, 25).map(d => (
                    <option key={d.id} value={d.nameAr}>{d.nameAr} ({d.specialty})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">ترتيب النتائج حسب:</label>
                <select
                  value={patientSortBy}
                  onChange={e => setPatientSortBy(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800"
                >
                  <option value="recent">🕒 أحدث زيارة</option>
                  <option value="visits">📊 الأكثر زيارة (الولاء)</option>
                  <option value="name">🔤 أبجدياً بالاسم</option>
                  <option value="id">🏷️ برقم الملف الطبي (ID)</option>
                </select>
              </div>
            </div>

            {/* Quick Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
              <span className="text-slate-400 font-bold text-[11px] flex items-center gap-1">
                <Filter className="w-3 h-3" />
                فلاتر سريعة:
              </span>

              <button
                type="button"
                onClick={() => setPatientCategoryFilter(patientCategoryFilter === 'vip' ? 'all' : 'vip')}
                className={`px-3 py-1 rounded-full font-bold transition-colors ${
                  patientCategoryFilter === 'vip' ? 'bg-amber-500 text-white shadow-2xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                👑 مرضى VIP
              </button>

              <button
                type="button"
                onClick={() => setPatientCategoryFilter(patientCategoryFilter === 'complaints' ? 'all' : 'complaints')}
                className={`px-3 py-1 rounded-full font-bold transition-colors ${
                  patientCategoryFilter === 'complaints' ? 'bg-rose-600 text-white shadow-2xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                ⚠️ شكاوى سابقة
              </button>

              <button
                type="button"
                onClick={() => setPatientBranchFilter(patientBranchFilter === 'JED' ? 'ALL' : 'JED')}
                className={`px-3 py-1 rounded-full font-bold transition-colors ${
                  patientBranchFilter === 'JED' ? 'bg-[#0B6E99] text-white shadow-2xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                🏥 فرع جدة
              </button>

              <button
                type="button"
                onClick={() => setPatientBranchFilter(patientBranchFilter === 'MAH' ? 'ALL' : 'MAH')}
                className={`px-3 py-1 rounded-full font-bold transition-colors ${
                  patientBranchFilter === 'MAH' ? 'bg-teal-600 text-white shadow-2xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                🏥 فرع محايل
              </button>

              {(patientSearchQuery || patientBranchFilter !== 'ALL' || patientCategoryFilter !== 'all' || patientDoctorFilter !== 'ALL') && (
                <button
                  type="button"
                  onClick={() => {
                    setPatientSearchQuery('');
                    setPatientBranchFilter('ALL');
                    setPatientCategoryFilter('all');
                    setPatientDoctorFilter('ALL');
                    setPatientSortBy('recent');
                  }}
                  className="px-3 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-full font-bold text-[11px] mr-auto transition-colors"
                >
                  ✕ مسح كافة الفلاتر
                </button>
              )}
            </div>
          </div>

          {/* Results Summary Bar */}
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>
              عرض <strong className="text-slate-900">{filteredPatients.length}</strong> من إجمالي <strong>{patients.length}</strong> مريض مسجل
            </span>
            {patientSearchQuery && (
              <span>
                نتائج البحث عن: "<strong className="text-[#0B6E99]">{patientSearchQuery}</strong>"
              </span>
            )}
          </div>

          {/* Patient Cards Grid */}
          {filteredPatients.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 text-slate-400 space-y-3">
              <Search className="w-12 h-12 text-slate-300 mx-auto" />
              <div className="font-extrabold text-slate-700 text-base">لم يتم العثور على أي ملفات مطابقة للبحث</div>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                تأكد من كتابة رقم الجوال الصحيح، أو تحقق من رقم الملف الطبي، أو يمكنك تسجيل مريض جديد مباشرة بالضغط على الزر أدناه.
              </p>
              <button
                type="button"
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    patientName: isNaN(Number(patientSearchQuery)) ? patientSearchQuery : '',
                    mobile: !isNaN(Number(patientSearchQuery)) ? patientSearchQuery : ''
                  }));
                  setActiveTab('newCall');
                }}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#0B6E99] text-white rounded-xl text-xs font-extrabold shadow-sm hover:bg-[#0B6E99]/90 transition-all cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>تسجيل مريض جديد بهذه البيانات</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPatients.map(patient => {
                const isVip = (patient.visitCount || 0) >= 4;
                const hasComplaint = !!patient.hasComplaints;
                const whatsappUrl = `https://wa.me/966${normalizeMobile(patient.mobile)}?text=${encodeURIComponent(`مرحباً ${patient.name}، معك مركز خدمة عملاء مجموعة إكسبرتس كير الطبية.`)}`;

                return (
                  <div
                    key={patient.patientId}
                    className={`bg-white rounded-2xl border p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 ${
                      hasComplaint
                        ? 'border-rose-200 border-r-4 border-r-rose-500'
                        : isVip
                          ? 'border-amber-200 border-r-4 border-r-amber-500'
                          : 'border-slate-200 hover:border-[#0B6E99]/40'
                    }`}
                  >
                    {/* Header */}
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[11px] bg-slate-100 border border-slate-200 text-[#0B6E99] font-extrabold px-2 py-0.5 rounded-md">
                              {patient.patientId}
                            </span>
                            {isVip && (
                              <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                                👑 VIP
                              </span>
                            )}
                            {hasComplaint && (
                              <span className="bg-rose-100 text-rose-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" /> شكوى سابقة
                              </span>
                            )}
                          </div>
                          <h4 className="font-extrabold text-sm text-slate-900 mt-1.5">{patient.name}</h4>
                        </div>

                        <span className="text-xs bg-slate-100 text-slate-700 font-extrabold px-2.5 py-1 rounded-xl whitespace-nowrap">
                          {patient.visitCount} زيارات
                        </span>
                      </div>

                      {/* Phone with copy and WhatsApp */}
                      <div className="flex items-center gap-2 text-xs pt-1">
                        <span className="font-mono font-bold text-slate-700 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 flex-1 text-center" dir="ltr">
                          {patient.mobile}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleCopyPhone(patient.mobile)}
                          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors border border-slate-200 cursor-pointer"
                          title="نسخ رقم الجوال"
                        >
                          {copiedPhone === patient.mobile ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>

                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-colors border border-emerald-200"
                          title="مراسلة عبر واتساب"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>

                    {/* Metadata Details */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-slate-600">
                        <span>🏥 آخر فرع مزار:</span>
                        <strong className="text-slate-800">{patient.lastBranch === 'JED' ? 'فرع جدة' : 'فرع محايل'}</strong>
                      </div>
                      <div className="flex items-center justify-between text-slate-600">
                        <span>👨‍⚕️ آخر طبيب:</span>
                        <strong className="text-slate-800">{patient.lastDoctor || '---'}</strong>
                      </div>
                      <div className="flex items-center justify-between text-slate-600">
                        <span>🕒 تاريخ آخر زيارة:</span>
                        <strong className="text-slate-800">
                          {patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString('ar-SA') : '---'}
                        </strong>
                      </div>
                      {patient.notes && (
                        <div className="pt-1.5 border-t border-slate-200/60 text-[11px] text-slate-500 italic line-clamp-2">
                          📝 {patient.notes}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-1 border-t border-slate-100 text-xs">
                      <button
                        type="button"
                        onClick={() => handleLogCallForPatient(patient)}
                        className="flex-1 py-2 bg-[#0B6E99] hover:bg-[#0B6E99]/90 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>تسجيل مكالمة</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedPatientTimeline(patient)}
                        className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        title="عرض التاريخ والسجل الكامل"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-600" />
                        <span>السجل</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB: MY CALLS */}
      {activeTab === 'myCalls' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">سجل مكالماتي المسجلة</h3>
              <p className="text-xs text-slate-500">يمكنك تعديل أي مكالمة مع توثيق سجل الفروقات والتعديلات</p>
            </div>
            <span className="text-xs font-bold bg-slate-100 px-3 py-1 rounded-full text-slate-700">
              إجمالي مكالماتك: {myCallsList.length}
            </span>
          </div>

          <div className="space-y-3">
            {myCallsList.map(call => (
              <div
                key={call.referenceNumber}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-[#0B6E99]/40 transition-all space-y-3"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-extrabold text-[#0B6E99] bg-[#0B6E99]/10 px-2.5 py-1 rounded-md">
                      {call.referenceNumber}
                    </span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      call.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {call.status === 'Completed' ? 'مكتملة' : 'معلقة'}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {call.callDate} • {call.callTime}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setEditingCall(call)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1"
                    >
                      <FileEdit className="w-3.5 h-3.5" />
                      <span>تعديل</span>
                    </button>
                    {call.isPending && (
                      <>
                        <button
                          onClick={() => setTransferringCall(call)}
                          className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-xs font-bold flex items-center gap-1"
                        >
                          <ArrowRightLeft className="w-3.5 h-3.5" />
                          <span>تحويل</span>
                        </button>
                        <button
                          onClick={() => closeCall(call.referenceNumber)}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>إغلاق</span>
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setHistoryModalRef(call.referenceNumber)}
                      className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-lg text-xs font-bold flex items-center gap-1"
                      title="سجل التعديلات"
                    >
                      <History className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                  <div>👤 المريض: <strong className="text-slate-900">{call.patientName}</strong></div>
                  <div>📱 الجوال: <strong className="text-slate-900 font-mono" dir="ltr">{call.mobile}</strong></div>
                  <div>🎯 السبب: <strong className="text-[#0B6E99]">{call.purpose}</strong></div>
                  <div>👨‍⚕️ الطبيب: <strong className="text-slate-900">{call.doctor || '---'}</strong></div>
                </div>

                {call.notes && (
                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    📝 {call.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: PENDING CALLS */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-700" />
              <div>
                <h3 className="font-extrabold text-amber-900 text-sm">المكالمات المعلقة وتتطلب إجراءً</h3>
                <p className="text-xs text-amber-700">هذه الحالات لم تكتمل بعد، يرجى متابعتها وإغلاقها أو تحويلها لتجنب خرق SLA.</p>
              </div>
            </div>
            <span className="font-bold text-sm bg-amber-200 text-amber-900 px-3 py-1 rounded-full">
              {myPendingList.length} معلقة
            </span>
          </div>

          <div className="space-y-3">
            {myPendingList.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2 opacity-60" />
                <p className="font-bold text-sm">رائع! لا توجد مكالمات معلقة حالياً، جميع المهام منجزة.</p>
              </div>
            ) : (
              myPendingList.map(call => (
                <div key={call.referenceNumber} className="bg-white p-5 rounded-2xl border-r-4 border-r-amber-500 border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="font-mono text-xs font-bold text-[#0B6E99]">{call.referenceNumber}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => closeCall(call.referenceNumber)}
                        className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700"
                      >
                        إغلاق وحل المشكلة
                      </button>
                      <button
                        onClick={() => setTransferringCall(call)}
                        className="px-3 py-1 bg-purple-600 text-white rounded-lg text-xs font-bold hover:bg-purple-700"
                      >
                        تحويل لموظف آخر
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div>👤 المريض: <strong>{call.patientName}</strong></div>
                    <div>📱 الجوال: <strong dir="ltr">{call.mobile}</strong></div>
                    <div>🎯 السبب: <strong>{call.purpose}</strong></div>
                  </div>
                  <p className="text-xs text-slate-600 bg-amber-50/50 p-2 rounded-lg">
                    {call.notes || 'لا توجد ملاحظات إضافية'}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB: CALLBACKS QUEUE */}
      {activeTab === 'callbacks' && (
        <div className="space-y-4">
          <div className="bg-purple-50 border border-purple-200 p-4 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RotateCw className="w-5 h-5 text-purple-700" />
              <div>
                <h3 className="font-extrabold text-purple-900 text-sm">قائمة إعادة الاتصال (Callback Queue)</h3>
                <p className="text-xs text-purple-700">مواعيد اتصال المرضى المجدولة مع إمكانية التأجيل الذكي (Snooze)</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {myCallbacksList.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400">
                <CheckCircle2 className="w-12 h-12 text-purple-500 mx-auto mb-2 opacity-60" />
                <p className="font-bold text-sm">لا توجد مواعيد إعادة اتصال مستحقة حالياً.</p>
              </div>
            ) : (
              myCallbacksList.map(cb => (
                <div
                  key={cb.callbackId}
                  className={`bg-white p-5 rounded-2xl border shadow-xs space-y-3 ${
                    cb.priority === 'high' ? 'border-r-4 border-r-rose-500 border-slate-200' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        cb.priority === 'high' ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {cb.priority === 'high' ? 'عاجل جداً' : 'عادي'}
                      </span>
                      <span className="text-xs font-bold text-slate-800">👤 {cb.patient}</span>
                      <span className="text-xs font-mono text-slate-500" dir="ltr">{cb.mobile}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => completeCallback(cb.callbackId)}
                        className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700"
                      >
                        تم الاتصال
                      </button>

                      {/* Snooze Presets */}
                      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
                        <button
                          onClick={() => snoozeCallback(cb.callbackId, '1h')}
                          className="px-2 py-0.5 hover:bg-white rounded font-bold text-slate-600"
                          title="تأجيل لساعة واحدة"
                        >
                          +1س
                        </button>
                        <button
                          onClick={() => snoozeCallback(cb.callbackId, '4h')}
                          className="px-2 py-0.5 hover:bg-white rounded font-bold text-slate-600"
                          title="تأجيل لـ 4 ساعات"
                        >
                          +4س
                        </button>
                        <button
                          onClick={() => snoozeCallback(cb.callbackId, '1d')}
                          className="px-2 py-0.5 hover:bg-white rounded font-bold text-slate-600"
                          title="تأجيل للغد"
                        >
                          +يوم
                        </button>
                      </div>

                      <button
                        onClick={() => {
                          setCustomPostponeId(cb.callbackId);
                          setPostponeDate(cb.dueDate);
                        }}
                        className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-bold"
                      >
                        تأجيل مخصص
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <span>📅 موعد الاتصال: <strong className="text-slate-800">{cb.dueDate}</strong> الساعة <strong className="text-slate-800">{cb.dueTime}</strong></span>
                    <span>🎯 السبب: <strong className="text-[#0B6E99]">{cb.purpose}</strong></span>
                    <span>🏥 الفرع: <strong className="text-slate-800">{cb.branch === 'JED' ? 'جدة' : 'محايل'}</strong></span>
                    {cb.postponedCount > 0 && (
                      <span className="text-amber-600 font-bold">⚠️ تم تأجيلها {cb.postponedCount} مرة</span>
                    )}
                  </div>

                  {cb.notes && (
                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      📝 {cb.notes}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB: QUALITY REVIEWS */}
      {activeTab === 'quality' && (
        <div className="space-y-4">
          <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-indigo-700" />
              <div>
                <h3 className="font-extrabold text-indigo-900 text-sm">مراجعات الجودة وتقييمات المشرفين</h3>
                <p className="text-xs text-indigo-700">تقييمات المكالمات من فريق الكواليتي ومشرفي الفريق مع إمكانية الرد المباشر</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {myReviewsList.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400">
                <Star className="w-12 h-12 text-indigo-400 mx-auto mb-2 opacity-50" />
                <p className="font-bold text-sm">لا توجد تقييمات جودة مسجلة حتى الآن.</p>
              </div>
            ) : (
              myReviewsList.map(rev => (
                <div key={rev.reviewId} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        rev.commentType === 'teamlead' ? 'bg-sky-100 text-sky-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {rev.commentType === 'teamlead' ? 'مشرف الفريق (Team Lead)' : 'قسم الجودة (Quality)'}
                      </span>
                      <span className="font-mono text-xs font-bold text-[#0B6E99]">{rev.referenceNumber}</span>
                    </div>

                    <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i}>{i < rev.qualityRating ? '⭐' : '☆'}</span>
                      ))}
                      <span className="text-xs text-slate-500 mr-1">({rev.qualityRating}/5)</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-800 font-medium bg-slate-50 p-3 rounded-xl border border-slate-100">
                    💬 {rev.qualityComment}
                  </p>

                  <div className="text-[11px] text-slate-400 flex items-center justify-between">
                    <span>بواسطة: {rev.qualityBy} • {new Date(rev.createdAt).toLocaleDateString('ar-SA')}</span>
                    {rev.agentReply ? (
                      <span className="text-emerald-600 font-bold">✓ تم الرد</span>
                    ) : (
                      <button
                        onClick={() => {
                          setReplyingReviewId(rev.reviewId);
                          setReplyText('');
                        }}
                        className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>كتابة رد للمشرف</span>
                      </button>
                    )}
                  </div>

                  {rev.agentReply && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900">
                      <div className="font-bold text-[11px] text-emerald-700 mb-1">ردك:</div>
                      <p>{rev.agentReply}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB: MY STATS */}
      {activeTab === 'myStats' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-[#0B6E99] to-[#14A5C9] text-white p-6 rounded-2xl shadow-sm">
            <h2 className="text-lg font-extrabold">مرحباً بك يا {currentUser.name} 👏</h2>
            <p className="text-xs text-white/90 mt-1">هنا ملخص أداء مكالماتك اليوم وإحصائيات إنجاز المهام</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs text-center">
              <div className="text-xs text-slate-500 font-bold mb-1">مكالمات اليوم</div>
              <div className="text-3xl font-extrabold text-[#0B6E99]">{todayCalls.length}</div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs text-center">
              <div className="text-xs text-slate-500 font-bold mb-1">مكتملة</div>
              <div className="text-3xl font-extrabold text-emerald-600">{completedToday}</div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs text-center">
              <div className="text-xs text-slate-500 font-bold mb-1">حجوزات مؤكدة</div>
              <div className="text-3xl font-extrabold text-teal-600">{bookedToday}</div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs text-center">
              <div className="text-xs text-slate-500 font-bold mb-1">شكاوى واردة</div>
              <div className="text-3xl font-extrabold text-rose-600">{complaintsToday}</div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT CALL */}
      {editingCall && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="font-extrabold text-base text-slate-900">
                تعديل المكالمة: <span className="font-mono text-[#0B6E99]">{editingCall.referenceNumber}</span>
              </div>
              <button onClick={() => setEditingCall(null)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">الحالة</label>
                <select
                  value={editingCall.status}
                  onChange={e => setEditingCall({ ...editingCall, status: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                >
                  <option value="Completed">مكتملة</option>
                  <option value="Pending">معلقة</option>
                  <option value="NoAnswer">لم يرد</option>
                  <option value="Cancelled">ملغاة</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">النتيجة</label>
                <select
                  value={editingCall.result}
                  onChange={e => setEditingCall({ ...editingCall, result: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                >
                  <option value="Booked">تم الحجز</option>
                  <option value="Confirmed">تأكيد حجز</option>
                  <option value="Inquiry">استفسار</option>
                  <option value="Complaint">شكوى</option>
                  <option value="AwaitingReply">انتظار رد</option>
                  <option value="Closed">مغلقة نهائياً</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">الملاحظات</label>
                <textarea
                  rows={3}
                  value={editingCall.notes}
                  onChange={e => setEditingCall({ ...editingCall, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">سبب أو توضيح التعديل (لتوثيقه في السجل)</label>
                <input
                  type="text"
                  value={editNote}
                  onChange={e => setEditNote(e.target.value)}
                  placeholder="مثال: تم التأكد من وصول تقرير التحليل وتعديل الحالة..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setEditingCall(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => {
                  updateCall(editingCall.referenceNumber, editingCall, editNote);
                  setEditingCall(null);
                }}
                className="px-4 py-2 bg-[#0B6E99] text-white rounded-xl text-xs font-bold"
              >
                حفظ التعديلات
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: TRANSFER CALL */}
      {transferringCall && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="font-extrabold text-base text-slate-900">
                تحويل المكالمة المعلقة
              </div>
              <button onClick={() => setTransferringCall(null)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600">
                المكالمة: <strong className="font-mono text-[#0B6E99]">{transferringCall.referenceNumber}</strong>
                <br />المريض: <strong>{transferringCall.patientName}</strong>
              </p>

              <div>
                <label className="block font-bold text-slate-700 mb-1">اختر الموظف المستلم:</label>
                <select
                  value={targetAgent}
                  onChange={e => setTargetAgent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="">-- اختر موظفاً --</option>
                  {agents.map(a => (
                    <option key={a.id} value={a.name}>{a.name} ({a.teamCode})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">سبب التحويل:</label>
                <input
                  type="text"
                  value={transferReason}
                  onChange={e => setTransferReason(e.target.value)}
                  placeholder="مثال: انتهاء فترة الدوام / مراجعة إدارية خاصة"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setTransferringCall(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold"
              >
                إلغاء
              </button>
              <button
                type="button"
                disabled={!targetAgent}
                onClick={() => {
                  transferCall(transferringCall.referenceNumber, targetAgent, transferReason);
                  setTransferringCall(null);
                }}
                className="px-4 py-2 bg-purple-600 disabled:opacity-50 text-white rounded-xl text-xs font-bold"
              >
                تأكيد التحويل
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT HISTORY */}
      {historyModalRef && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="font-extrabold text-base text-slate-900 flex items-center gap-1.5">
                <History className="w-4 h-4 text-[#0B6E99]" />
                <span>سجل التعديلات السابقة: {historyModalRef}</span>
              </div>
              <button onClick={() => setHistoryModalRef(null)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">✕</button>
            </div>

            <div className="space-y-3">
              {editHistory.filter(h => h.referenceNumber === historyModalRef).length === 0 ? (
                <p className="text-center text-slate-400 py-6 text-xs">لم يطرأ أي تعديل سابق على هذه المكالمة.</p>
              ) : (
                editHistory.filter(h => h.referenceNumber === historyModalRef).map(h => (
                  <div key={h.editId} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                    <div className="flex items-center justify-between text-slate-400 text-[10px]">
                      <span>{new Date(h.editedAt).toLocaleString('ar-SA')}</span>
                      <span>بواسطة: {h.editedByName} ({h.editedByRole})</span>
                    </div>
                    <div className="font-bold text-slate-800">الحقل: {h.fieldLabelAr}</div>
                    <div className="flex items-center gap-2 text-slate-600 text-[11px]">
                      <span className="line-through text-rose-600">{h.oldValue || '(فارغ)'}</span>
                      <span>←</span>
                      <span className="text-emerald-700 font-bold">{h.newValue || '(فارغ)'}</span>
                    </div>
                    {h.note && <div className="text-[10px] text-slate-500 italic">ملاحظة: {h.note}</div>}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: REPLY TO QUALITY REVIEW */}
      {replyingReviewId && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="font-extrabold text-base text-slate-900">
                الرد على تقييم المشرف
              </div>
              <button onClick={() => setReplyingReviewId(null)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <label className="block font-bold text-slate-700 mb-1">اكتب تعليقك أو إيضاحك للمشرف:</label>
              <textarea
                rows={4}
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder="اكتب ردك هنا..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setReplyingReviewId(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold"
              >
                إلغاء
              </button>
              <button
                type="button"
                disabled={!replyText.trim()}
                onClick={() => {
                  replyToReview(replyingReviewId, replyText);
                  setReplyingReviewId(null);
                }}
                className="px-4 py-2 bg-indigo-600 disabled:opacity-50 text-white rounded-xl text-xs font-bold"
              >
                إرسال الرد
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CUSTOM POSTPONE CALLBACK */}
      {customPostponeId && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="font-extrabold text-base text-slate-900">
                تأجيل Callback لموعد مخصص
              </div>
              <button onClick={() => setCustomPostponeId(null)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">التاريخ الجديد:</label>
                <input
                  type="date"
                  value={postponeDate}
                  onChange={e => setPostponeDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">الوقت الجديد:</label>
                <input
                  type="time"
                  value={postponeTime}
                  onChange={e => setPostponeTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setCustomPostponeId(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => {
                  postponeCallback(customPostponeId, postponeDate, postponeTime);
                  setCustomPostponeId(null);
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold"
              >
                تأكيد التأجيل
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PATIENT DOSSIER & COMPLETE CALL TIMELINE */}
      {selectedPatientTimeline && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-start justify-between border-b pb-4 gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs bg-[#0B6E99]/10 text-[#0B6E99] font-extrabold px-2.5 py-1 rounded-md border border-[#0B6E99]/20">
                    رقم الملف الطبي: {selectedPatientTimeline.patientId}
                  </span>
                  {(selectedPatientTimeline.visitCount || 0) >= 4 && (
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                      👑 VIP مريض دائم
                    </span>
                  )}
                  {selectedPatientTimeline.hasComplaints && (
                    <span className="bg-rose-100 text-rose-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> تنبيه شكوى سابقة
                    </span>
                  )}
                </div>
                <h3 className="font-extrabold text-base text-slate-900 mt-2">{selectedPatientTimeline.name}</h3>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                  <span dir="ltr" className="font-mono font-bold text-slate-700">📱 {selectedPatientTimeline.mobile}</span>
                  <span>• إجمالي الزيارات: <strong>{selectedPatientTimeline.visitCount}</strong></span>
                  <span>• آخر فرع: <strong>{selectedPatientTimeline.lastBranch === 'JED' ? 'فرع جدة' : 'فرع محايل'}</strong></span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedPatientTimeline(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xl p-1"
              >
                ✕
              </button>
            </div>

            {/* Quick Actions Bar */}
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs flex-wrap gap-2">
              <span className="text-slate-600 font-semibold">
                آخر طبيب تمت مراجعته: <strong className="text-slate-900">{selectedPatientTimeline.lastDoctor || '---'}</strong>
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const p = selectedPatientTimeline;
                    setSelectedPatientTimeline(null);
                    handleLogCallForPatient(p);
                  }}
                  className="px-4 py-2 bg-[#0B6E99] hover:bg-[#0B6E99]/90 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>تسجيل مكالمة جديدة لهذا المريض</span>
                </button>
              </div>
            </div>

            {/* History of logged calls for this patient */}
            <div className="space-y-3">
              <div className="font-extrabold text-xs text-slate-700 flex items-center gap-1.5">
                <History className="w-4 h-4 text-[#0B6E99]" />
                <span>سجل المكالمات والاستشارات السابقة لهذا المريض:</span>
              </div>

              {(() => {
                const patientCalls = calls.filter(c =>
                  c.patientName === selectedPatientTimeline.name ||
                  c.mobile.replace(/\D/g, '').includes(selectedPatientTimeline.mobile.replace(/\D/g, '')) ||
                  selectedPatientTimeline.mobile.replace(/\D/g, '').includes(c.mobile.replace(/\D/g, ''))
                );

                if (patientCalls.length === 0) {
                  return (
                    <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                      لا توجد مكالمات مسجلة سابقة في السجل الحالي.
                    </div>
                  );
                }

                return (
                  <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                    {patientCalls.map(c => (
                      <div key={c.referenceNumber} className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-2 text-xs shadow-2xs">
                        <div className="flex items-center justify-between flex-wrap gap-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[11px] font-extrabold text-[#0B6E99]">{c.referenceNumber}</span>
                            <span className="text-[10px] text-slate-400">{c.callDate} {c.callTime}</span>
                          </div>
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                            c.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {c.status} • {c.result}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-slate-600 text-[11px]">
                          <div>🎯 السبب: <strong className="text-slate-900">{c.purpose}</strong></div>
                          <div>👨‍⚕️ الطبيب: <strong className="text-slate-900">{c.doctor || '---'}</strong></div>
                          <div>💼 الموظف: <strong className="text-slate-900">{c.agent}</strong></div>
                        </div>

                        {c.notes && (
                          <div className="p-2 bg-slate-50 rounded-lg text-slate-700 text-[11px]">
                            📝 {c.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            <div className="flex justify-end pt-2 border-t">
              <button
                type="button"
                onClick={() => setSelectedPatientTimeline(null)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                إغلاق النافذة
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
