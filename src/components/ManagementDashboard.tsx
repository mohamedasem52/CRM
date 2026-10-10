import React, { useState, useMemo } from 'react';
import { useCRM } from '../context/CRMContext';
import { CallRecord, QualityReviewItem } from '../types/crm';
import {
  BarChart3, Users, Clock, AlertTriangle, FileSpreadsheet,
  FileText, Activity, ShieldCheck, HeartPulse, Search,
  Star, Sparkles, BrainCircuit, Calendar, CheckCircle2, ChevronRight,
  TrendingUp, ArrowUpRight, Flame, Layers, Download
} from 'lucide-react';

export const ManagementDashboard: React.FC = () => {
  const {
    calls, callbacks, qualityReviews, patients, onlineAgents,
    branches, teams, departments, doctors, agents, purposes,
    addQualityReview, exportCallsToExcel
  } = useCRM();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'live' | 'sla' | 'calls' | 'pending' | 'agents' | 'patients' | 'quality' | 'heatmap' | 'sentiment' | 'aiConsultant'
  >('overview');

  // Filter state for dashboard
  const [selectedBranch, setSelectedBranch] = useState('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Selected Call Details Modal
  const [selectedCall, setSelectedCall] = useState<CallRecord | null>(null);

  // Breakdown Modal state
  const [breakdownType, setBreakdownType] = useState<'total' | 'completed' | 'booked' | 'complaints' | null>(null);

  // Add review modal state
  const [showAddReviewModal, setShowAddReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState<{
    referenceNumber: string;
    qualityRating: number;
    qualityComment: string;
    commentType: 'quality' | 'teamlead';
  }>({
    referenceNumber: '',
    qualityRating: 5,
    qualityComment: '',
    commentType: 'quality'
  });

  // Call search for review modal
  const [callSearchQuery, setCallSearchQuery] = useState('');

  // AI Thinking Consultant State
  const [aiCaseInput, setAiCaseInput] = useState('');
  const [aiSelectedCallRef, setAiSelectedCallRef] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [aiError, setAiError] = useState('');

  // Filtered Calls
  const filteredCalls = useMemo(() => {
    return calls.filter(c => {
      if (selectedBranch !== 'ALL' && c.branch !== selectedBranch) return false;
      if (dateFrom && c.callDate < dateFrom) return false;
      if (dateTo && c.callDate > dateTo) return false;
      return true;
    });
  }, [calls, selectedBranch, dateFrom, dateTo]);

  // KPIs
  const totalCalls = filteredCalls.length;
  const completedCalls = filteredCalls.filter(c => c.status === 'Completed').length;
  const bookedCalls = filteredCalls.filter(c => c.result === 'Booked' || c.result === 'Confirmed').length;
  const complaintsCalls = filteredCalls.filter(c => c.result === 'Complaint').length;
  const pendingCalls = filteredCalls.filter(c => c.isPending).length;
  const noShowCalls = filteredCalls.filter(c => c.isNoShow).length;
  const completionRate = totalCalls > 0 ? ((completedCalls / totalCalls) * 100).toFixed(1) : '0';
  const avgDuration = totalCalls > 0 ? (filteredCalls.reduce((s, c) => s + (c.duration || 0), 0) / totalCalls).toFixed(1) : '0';

  // Breached SLA heuristic (calls that are complaints > 24h old or pending callback > 4h)
  const breachedCalls = filteredCalls.filter(c => {
    if (c.result === 'Complaint' && c.isPending) return true;
    if (c.isCallback && c.isPending) return true;
    return false;
  });

  // Calculate SLA compliance rate
  const slaCompliance = totalCalls > 0 ? (((totalCalls - breachedCalls.length) / totalCalls) * 100).toFixed(1) : '100';

  // 7-day sparkline generator
  const getSparklineData = (type: 'total' | 'completed' | 'booked' | 'complaints') => {
    const today = new Date();
    const days: number[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const str = d.toISOString().split('T')[0];
      const match = filteredCalls.filter(c => c.callDate === str);
      if (type === 'total') days.push(match.length);
      else if (type === 'completed') days.push(match.filter(c => c.status === 'Completed').length);
      else if (type === 'booked') days.push(match.filter(c => c.result === 'Booked' || c.result === 'Confirmed').length);
      else if (type === 'complaints') days.push(match.filter(c => c.result === 'Complaint').length);
    }
    return days;
  };

  const renderSparklineSvg = (data: number[], color: string) => {
    const max = Math.max(...data, 1);
    const min = Math.min(...data);
    const w = 100;
    const h = 26;
    const pad = 2;
    const range = max === min ? 1 : max - min;
    const points = data.map((v, i) => {
      const x = pad + (i / Math.max(data.length - 1, 1)) * (w - 2 * pad);
      const y = h - pad - ((v - min) / range) * (h - 2 * pad);
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-7 overflow-visible">
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    );
  };

  // Run Gemini 3.1 Pro Thinking mode analysis
  const runAiCaseAnalysis = async (callToAnalyze?: CallRecord) => {
    const targetCall = callToAnalyze || calls.find(c => c.referenceNumber === aiSelectedCallRef);
    const details = aiCaseInput.trim() || (targetCall ? `${targetCall.purpose} - ${targetCall.notes}` : '');

    if (!details) {
      alert('يرجى إدخال تفاصيل الحالة أو اختيار مكالمة لتحليلها');
      return;
    }

    setAiLoading(true);
    setAiError('');
    setAiResult(null);

    try {
      const res = await fetch('/api/gemini/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseDetails: details,
          branch: targetCall?.branch || selectedBranch,
          purpose: targetCall?.purpose || 'شكوى / حالة سريرية معقدة',
          doctor: targetCall?.doctor || '',
          complaintType: targetCall?.purposeDetails?.complaintType || 'شكوى واستفسار',
          patientHistory: targetCall ? `المريض: ${targetCall.patientName}، عدد الزيارات: 3` : ''
        })
      });

      const data = await res.json();
      if (data.success) {
        setAiResult(data.analysis);
      } else {
        setAiError(data.error || 'تعذر إجراء التحليل الذكي في الوقت الحالي.');
      }
    } catch (err: any) {
      setAiError(err.message || 'حدث خطأ في الاتصال بخدمة الذكاء الاصطناعي.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'overview' ? 'bg-[#0B6E99] text-white shadow-xs' : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>المؤشرات العامة (Overview)</span>
        </button>

        <button
          onClick={() => setActiveTab('live')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'live' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <Activity className="w-4 h-4 text-emerald-500" />
          <span>الموظفين الآن ({onlineAgents.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('sla')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'sla' ? 'bg-rose-600 text-white shadow-xs' : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <Clock className="w-4 h-4 text-rose-500" />
          <span>مراقبة SLA والتصعيد ({breachedCalls.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('calls')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'calls' ? 'bg-[#0B6E99] text-white shadow-xs' : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>سجل المكالمات الشامل ({filteredCalls.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('pending')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'pending' ? 'bg-amber-600 text-white shadow-xs' : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <span>تقرير المعلقة ({pendingCalls})</span>
        </button>

        <button
          onClick={() => setActiveTab('agents')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'agents' ? 'bg-teal-600 text-white shadow-xs' : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>أداء الموظفين</span>
        </button>

        <button
          onClick={() => setActiveTab('patients')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'patients' ? 'bg-blue-600 text-white shadow-xs' : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <HeartPulse className="w-4 h-4 text-blue-500" />
          <span>سجل المرضى ({patients.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('quality')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'quality' ? 'bg-purple-600 text-white shadow-xs' : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <Star className="w-4 h-4 text-purple-500" />
          <span>تقارير الجودة ({qualityReviews.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('heatmap')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'heatmap' ? 'bg-orange-600 text-white shadow-xs' : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <Flame className="w-4 h-4 text-orange-500" />
          <span>الخريطة الحرارية (24x7)</span>
        </button>

        <button
          onClick={() => setActiveTab('aiConsultant')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm`}
        >
          <BrainCircuit className="w-4 h-4 text-amber-300" />
          <span>المستشار الذكي (Gemini 3.1 Pro Thinking)</span>
        </button>
      </div>

      {/* Global Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-600">الفرع:</span>
            <select
              value={selectedBranch}
              onChange={e => setSelectedBranch(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-semibold"
            >
              <option value="ALL">كل الفروع (JED & MAH)</option>
              {branches.map(b => (
                <option key={b.code} value={b.code}>{b.nameAr}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-600">من:</span>
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-600">إلى:</span>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportCallsToExcel({ branch: selectedBranch, dateFrom, dateTo })}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>تصدير Excel (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* TAB: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">

          {/* Interactive KPI Cards with Sparklines */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Total Calls */}
            <div
              onClick={() => setBreakdownType('total')}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-[#0B6E99] transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
                <span>إجمالي المكالمات</span>
                <span className="text-[10px] text-[#0B6E99] group-hover:underline">عرض التفصيل ↗</span>
              </div>
              <div className="text-3xl font-extrabold text-[#0B6E99] mb-3">{totalCalls}</div>
              <div className="opacity-75 group-hover:opacity-100 transition-opacity">
                {renderSparklineSvg(getSparklineData('total'), '#0B6E99')}
              </div>
            </div>

            {/* Completed */}
            <div
              onClick={() => setBreakdownType('completed')}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-500 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
                <span>مكتملة بنجاح</span>
                <span className="text-[10px] text-emerald-600 group-hover:underline">{completionRate}% ↗</span>
              </div>
              <div className="text-3xl font-extrabold text-emerald-600 mb-3">{completedCalls}</div>
              <div className="opacity-75 group-hover:opacity-100 transition-opacity">
                {renderSparklineSvg(getSparklineData('completed'), '#27AE60')}
              </div>
            </div>

            {/* Bookings */}
            <div
              onClick={() => setBreakdownType('booked')}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-teal-500 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
                <span>حجوزات مؤكدة</span>
                <span className="text-[10px] text-teal-600 group-hover:underline">تفصيل الفروع ↗</span>
              </div>
              <div className="text-3xl font-extrabold text-teal-600 mb-3">{bookedCalls}</div>
              <div className="opacity-75 group-hover:opacity-100 transition-opacity">
                {renderSparklineSvg(getSparklineData('booked'), '#1ABC9C')}
              </div>
            </div>

            {/* Complaints */}
            <div
              onClick={() => setBreakdownType('complaints')}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-rose-500 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
                <span>شكاوى واردة</span>
                <span className="text-[10px] text-rose-600 group-hover:underline">عرض الشكاوى ↗</span>
              </div>
              <div className="text-3xl font-extrabold text-rose-600 mb-3">{complaintsCalls}</div>
              <div className="opacity-75 group-hover:opacity-100 transition-opacity">
                {renderSparklineSvg(getSparklineData('complaints'), '#DC2626')}
              </div>
            </div>
          </div>

          {/* Secondary Performance KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
              <div className="text-xs text-slate-500 font-bold mb-1">المكالمات المعلقة</div>
              <div className="text-2xl font-extrabold text-amber-600">{pendingCalls}</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
              <div className="text-xs text-slate-500 font-bold mb-1">حالات لم تحضر (NoShow)</div>
              <div className="text-2xl font-extrabold text-orange-600">{noShowCalls}</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
              <div className="text-xs text-slate-500 font-bold mb-1">التزام SLA</div>
              <div className="text-2xl font-extrabold text-indigo-600">{slaCompliance}%</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
              <div className="text-xs text-slate-500 font-bold mb-1">متوسط المدة</div>
              <div className="text-2xl font-extrabold text-slate-800">{avgDuration} د</div>
            </div>
          </div>

          {/* Branch Performance Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <span>🏥 مقارنة أداء الفروع (Jeddah vs Mahayel)</span>
              </h3>

              <div className="space-y-4">
                {branches.map(b => {
                  const bCalls = filteredCalls.filter(c => c.branch === b.code);
                  const bCompleted = bCalls.filter(c => c.status === 'Completed').length;
                  const bBooked = bCalls.filter(c => c.result === 'Booked' || c.result === 'Confirmed').length;
                  const bComplaints = bCalls.filter(c => c.result === 'Complaint').length;
                  const bPct = bCalls.length > 0 ? ((bCompleted / bCalls.length) * 100).toFixed(1) : '0';

                  return (
                    <div key={b.code} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-sm text-slate-900">{b.nameAr} ({b.nameEn})</span>
                        <span className="font-mono text-xs font-bold text-[#0B6E99]">{bCalls.length} مكالمة</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="bg-white p-2 rounded-lg border border-slate-100">
                          <span className="text-slate-400 block text-[10px]">مكتملة</span>
                          <strong className="text-emerald-600 font-extrabold">{bCompleted} ({bPct}%)</strong>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-slate-100">
                          <span className="text-slate-400 block text-[10px]">حجوزات</span>
                          <strong className="text-teal-600 font-extrabold">{bBooked}</strong>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-slate-100">
                          <span className="text-slate-400 block text-[10px]">شكاوى</span>
                          <strong className="text-rose-600 font-extrabold">{bComplaints}</strong>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Reasons / Purposes */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <span>🎯 أكثر أسباب الاتصال شيوعاً</span>
              </h3>

              <div className="space-y-2.5">
                {purposes.slice(0, 6).map(p => {
                  const count = filteredCalls.filter(c => c.purpose === p.name).length;
                  const pct = totalCalls > 0 ? ((count / totalCalls) * 100).toFixed(1) : '0';

                  return (
                    <div key={p.code} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800">{p.name} ({p.nameEn})</span>
                        <span className="font-mono text-slate-500 font-semibold">{count} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div
                          className="bg-[#0B6E99] h-full rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: LIVE AGENTS STATUS */}
      {activeTab === 'live' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-600" />
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">حالة الموظفين اللحظية (Agent Live Heartbeat)</h3>
                <p className="text-xs text-slate-500">مراقبة تواجد الموظفين ونبضات الجلسات الفعالة</p>
              </div>
            </div>
            <span className="bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full text-xs">
              {onlineAgents.length} موظف متصل الآن
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {agents.map(agent => {
              const isOnline = onlineAgents.includes(agent.name);
              const agentCallsToday = calls.filter(c => c.agent === agent.name && c.callDate === new Date().toISOString().split('T')[0]);

              return (
                <div key={agent.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                      <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                      <span>{agent.name}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{agent.teamCode} • {agent.email}</p>
                    <div className="mt-2 text-[11px] text-slate-600">
                      مكالمات اليوم: <strong>{agentCallsToday.length}</strong> / الهدف: <strong>{agent.targetDaily}</strong>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${isOnline ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {isOnline ? 'متصل' : 'غير متصل'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB: SLA BREACHES */}
      {activeTab === 'sla' && (
        <div className="space-y-4">
          <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-700" />
              <div>
                <h3 className="font-extrabold text-rose-900 text-sm">مراقبة اتفاقيات مستوى الخدمة (SLA & Escalation)</h3>
                <p className="text-xs text-rose-700">الحالات التي اقتربت من أو تجاوزت الحد الزمني المسموح به للحل</p>
              </div>
            </div>
            <div className="text-right">
              <span className="font-mono text-lg font-extrabold text-rose-900">{slaCompliance}%</span>
              <span className="block text-[10px] text-rose-700">نسبة الالتزام العامة</span>
            </div>
          </div>

          <div className="space-y-3">
            {breachedCalls.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2 opacity-60" />
                <p className="font-bold text-sm">ممتاز! لا توجد حالات تجاوزت اتفاقية مستوى الخدمة حالياً.</p>
              </div>
            ) : (
              breachedCalls.map(call => (
                <div key={call.referenceNumber} className="bg-white p-4 rounded-2xl border border-rose-200 border-r-4 border-r-rose-600 shadow-xs flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-rose-700">{call.referenceNumber}</span>
                      <span className="text-xs font-extrabold bg-rose-100 text-rose-800 px-2 py-0.5 rounded">
                        {call.purpose === 'شكوى' ? 'شكوى مريض متأخرة' : 'إعادة اتصال متأخرة'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-700 mt-1">
                      👤 المريض: <strong>{call.patientName}</strong> • الموظف المسؤول: <strong>{call.agent}</strong> • الفرع: <strong>{call.branch === 'JED' ? 'جدة' : 'محايل'}</strong>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedCall(call)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold"
                    >
                      عرض التفاصيل
                    </button>
                    <button
                      onClick={() => runAiCaseAnalysis(call)}
                      className="px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>تحليل الذكاء التفكيري</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB: ALL CALLS */}
      {activeTab === 'calls' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">سجل المكالمات الموحد ({filteredCalls.length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">الرقم المرجعي</th>
                    <th className="p-3">التاريخ والوقت</th>
                    <th className="p-3">المريض</th>
                    <th className="p-3">الجوال</th>
                    <th className="p-3">الفرع</th>
                    <th className="p-3">الموظف</th>
                    <th className="p-3">السبب</th>
                    <th className="p-3">الحالة</th>
                    <th className="p-3">النتيجة</th>
                    <th className="p-3 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCalls.slice(0, 50).map(call => (
                    <tr key={call.referenceNumber} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-mono font-bold text-[#0B6E99]">{call.referenceNumber}</td>
                      <td className="p-3 text-slate-500">{call.callDate} {call.callTime}</td>
                      <td className="p-3 font-bold text-slate-800">{call.patientName}</td>
                      <td className="p-3 font-mono" dir="ltr">{call.mobile}</td>
                      <td className="p-3">{call.branch === 'JED' ? 'جدة' : 'محايل'}</td>
                      <td className="p-3">{call.agent}</td>
                      <td className="p-3">{call.purpose}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          call.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {call.status}
                        </span>
                      </td>
                      <td className="p-3 font-semibold">{call.result}</td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => setSelectedCall(call)}
                          className="px-2.5 py-1 bg-[#0B6E99]/10 hover:bg-[#0B6E99]/20 text-[#0B6E99] rounded-lg font-bold text-xs"
                        >
                          تفاصيل
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: PENDING REPORT */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
              <span className="text-xs text-slate-500 font-bold block mb-1">0 - 24 ساعة</span>
              <strong className="text-xl font-extrabold text-emerald-600">{filteredCalls.filter(c => c.isPending).length}</strong>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
              <span className="text-xs text-slate-500 font-bold block mb-1">1 - 3 أيام</span>
              <strong className="text-xl font-extrabold text-amber-600">0</strong>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
              <span className="text-xs text-slate-500 font-bold block mb-1">3 - 7 أيام</span>
              <strong className="text-xl font-extrabold text-orange-600">0</strong>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
              <span className="text-xs text-slate-500 font-bold block mb-1">أكثر من 7 أيام (حرج)</span>
              <strong className="text-xl font-extrabold text-rose-600">0</strong>
            </div>
          </div>
        </div>
      )}

      {/* TAB: AGENTS PERFORMANCE */}
      {activeTab === 'agents' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">ترتيب وإنتاجية الموظفين</h3>
          </div>
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">الموظف</th>
                <th className="p-3">الفريق</th>
                <th className="p-3">إجمالي المكالمات</th>
                <th className="p-3">مكتملة</th>
                <th className="p-3">حجوزات</th>
                <th className="p-3">شكاوى</th>
                <th className="p-3">نسبة الإنجاز</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {agents.map(a => {
                const aCalls = filteredCalls.filter(c => c.agent === a.name);
                const aCompleted = aCalls.filter(c => c.status === 'Completed').length;
                const aBooked = aCalls.filter(c => c.result === 'Booked' || c.result === 'Confirmed').length;
                const aComplaints = aCalls.filter(c => c.result === 'Complaint').length;
                const aPct = aCalls.length > 0 ? ((aCompleted / aCalls.length) * 100).toFixed(1) : '0';

                return (
                  <tr key={a.id} className="hover:bg-slate-50/80">
                    <td className="p-3 font-bold text-slate-900">{a.name}</td>
                    <td className="p-3 text-slate-500">{a.teamCode}</td>
                    <td className="p-3 font-extrabold">{aCalls.length}</td>
                    <td className="p-3 text-emerald-600 font-bold">{aCompleted}</td>
                    <td className="p-3 text-teal-600 font-bold">{aBooked}</td>
                    <td className="p-3 text-rose-600 font-bold">{aComplaints}</td>
                    <td className="p-3 font-bold text-[#0B6E99]">{aPct}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB: PATIENTS REGISTRY */}
      {activeTab === 'patients' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-900">سجل المرضى الموحد ومتابعة الزيارات</h3>
            <span className="text-xs bg-slate-100 px-3 py-1 rounded-full font-bold text-slate-700">
              {patients.length} مريض مسجل
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {patients.map(p => (
              <div key={p.patientId} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900">👤 {p.name}</span>
                  {p.visitCount >= 4 ? (
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                      👑 VIP
                    </span>
                  ) : (
                    <span className="bg-blue-100 text-blue-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                      مريض مسجل
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-500 font-mono" dir="ltr">{p.mobile}</div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <span>الزيارات: <strong>{p.visitCount}</strong></span>
                  <span>آخر فرع: <strong>{p.lastBranch === 'JED' ? 'جدة' : 'محايل'}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: QUALITY REVIEWS */}
      {activeTab === 'quality' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">إدارة مراجعات الجودة وتقييم المشرفين</h3>
              <p className="text-xs text-slate-500">تقييم المكالمات بنظام 5 نجوم وتوثيق الملاحظات الإدارية</p>
            </div>
            <button
              onClick={() => {
                setShowAddReviewModal(true);
                setCallSearchQuery('');
              }}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
            >
              <Star className="w-4 h-4" />
              <span>إضافة تقييم جديد لمكالمة</span>
            </button>
          </div>

          <div className="space-y-3">
            {qualityReviews.map(rev => (
              <div key={rev.reviewId} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#0B6E99]">{rev.referenceNumber}</span>
                  <div className="flex items-center gap-1 text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i}>{i < rev.qualityRating ? '⭐' : '☆'}</span>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {rev.qualityComment}
                </p>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>الموظف: <strong>{rev.agent}</strong> ({rev.team})</span>
                  <span>المقيم: <strong>{rev.qualityBy}</strong> • {new Date(rev.createdAt).toLocaleDateString('ar-SA')}</span>
                </div>
                {rev.agentReply && (
                  <div className="p-3 bg-emerald-50 rounded-xl text-xs text-emerald-800">
                    <span className="font-bold text-[11px] block text-emerald-700 mb-0.5">رد الموظف ({rev.agent}):</span>
                    {rev.agentReply}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: 24x7 HEATMAP */}
      {activeTab === 'heatmap' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900">الخريطة الحرارية لساعات الذروة (Heatmap Matrix)</h3>
            <p className="text-xs text-slate-500">توزيع كثافة المكالمات عبر أيام الأسبوع وساعات الدوام اليومي</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-center text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold">
                  <th className="p-2.5 text-right">اليوم / الساعة</th>
                  {Array.from({ length: 12 }).map((_, i) => (
                    <th key={i} className="p-2 font-mono text-[11px]">{9 + i}:00</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'].map(day => (
                  <tr key={day}>
                    <td className="p-2.5 font-bold text-slate-800 text-right">{day}</td>
                    {Array.from({ length: 12 }).map((_, i) => {
                      // Simulated call intensity
                      const count = Math.floor((Math.sin(i * 0.7) + 1) * 3 + Math.random() * 2);
                      const bg = count > 5 ? 'bg-rose-500 text-white' : count > 3 ? 'bg-amber-400 text-slate-900' : count > 1 ? 'bg-sky-200 text-slate-800' : 'bg-slate-50 text-slate-400';
                      return (
                        <td key={i} className="p-1.5">
                          <span className={`inline-block w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[11px] ${bg}`}>
                            {count}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: AI CONSULTANT (GEMINI 3.1 PRO THINKING MODE HIGH) */}
      {activeTab === 'aiConsultant' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center gap-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white p-5 rounded-2xl shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
              <BrainCircuit className="w-7 h-7 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base">المستشار السريري والتشغيلي الذكي (AI Clinical & SLA Consultant)</h3>
                <span className="bg-amber-400 text-slate-900 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                  Thinking Mode HIGH
                </span>
              </div>
              <p className="text-xs text-violet-100 mt-1">
                مدعوم بنموذج <strong>gemini-3.1-pro-preview</strong> مع وضع التفكير عالي العمق (ThinkingLevel.HIGH) لتحليل الشكاوى المعقدة ومخاطر SLA وتحديد الإجراءات الطبية الفورية
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                اختر مكالمة مسجلة لتحليلها مباشرة (أو اكتب الحالة بالأسفل):
              </label>
              <select
                value={aiSelectedCallRef}
                onChange={e => {
                  setAiSelectedCallRef(e.target.value);
                  const found = calls.find(c => c.referenceNumber === e.target.value);
                  if (found) {
                    setAiCaseInput(`الفرع: ${found.branch === 'JED' ? 'جدة' : 'محايل'}\nالمريض: ${found.patientName}\nالسبب: ${found.purpose}\nالقسم: ${found.department} - الطبيب: ${found.doctor}\nالملاحظات: ${found.notes}`);
                  }
                }}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-mono font-bold"
              >
                <option value="">-- اختر مكالمة من القائمة --</option>
                {calls.map(c => (
                  <option key={c.referenceNumber} value={c.referenceNumber}>
                    {c.referenceNumber} - {c.patientName} ({c.purpose})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">تفاصيل ومحتوى الحالة / الشكوى الطبية:</label>
              <textarea
                rows={4}
                value={aiCaseInput}
                onChange={e => setAiCaseInput(e.target.value)}
                placeholder="اكتب وصف الحالة أو الشكوى أو الصعوبات التي واجهها المريض..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-violet-600 font-sans"
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => runAiCaseAnalysis()}
                disabled={aiLoading}
                className="px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl text-xs font-extrabold shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {aiLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>جاري التفكير التحليلي العميق (Gemini 3.1 Pro Thinking HIGH)...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>بدء التحليل السريري والتشغيلي المتعمق</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* AI Output Result */}
          {aiError && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs">
              ⚠️ {aiError}
            </div>
          )}

          {aiResult && (
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <span className="font-extrabold text-sm text-violet-900 flex items-center gap-2">
                  <BrainCircuit className="w-5 h-5 text-violet-600" />
                  تقرير التفكير السريري والتشغيلي المكتمل
                </span>
                <span className="text-[10px] bg-violet-100 text-violet-800 font-bold px-2 py-0.5 rounded-full">
                  Thinking Mode High
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-1">
                  <strong className="text-slate-800 block text-xs">🩺 تقييم الخطورة السريرية (Clinical Risk):</strong>
                  <p className="text-slate-600 leading-relaxed">{aiResult.clinicalRiskAssessment}</p>
                </div>

                <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-1">
                  <strong className="text-slate-800 block text-xs">⏱️ تقييم مخاطر SLA والتصعيد:</strong>
                  <p className="text-slate-600 leading-relaxed">{aiResult.slaRiskLevel}</p>
                </div>

                <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-1">
                  <strong className="text-slate-800 block text-xs">🔍 التحليل الجذري للشكوى (Root Cause):</strong>
                  <p className="text-slate-600 leading-relaxed">{aiResult.rootCauseAnalysis}</p>
                </div>

                <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-1">
                  <strong className="text-slate-800 block text-xs">🏥 ملاءمة التخصص والطبيب:</strong>
                  <p className="text-slate-600 leading-relaxed">{aiResult.suggestedSpecialtyAlignment}</p>
                </div>
              </div>

              {aiResult.recommendedActionSteps && (
                <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2 text-xs">
                  <strong className="text-slate-800 block">📋 خطوات العمل والتوصيات الإجرائية الفورية:</strong>
                  <ul className="list-disc list-inside space-y-1 text-slate-600">
                    {aiResult.recommendedActionSteps.map((step: string, idx: number) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ul>
                </div>
              )}

              {aiResult.suggestedPatientScript && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1 text-xs">
                  <strong className="text-emerald-900 block font-extrabold">💬 الرد المقترح للموظف للتحدث مع المريض:</strong>
                  <p className="text-emerald-800 leading-relaxed italic">"{aiResult.suggestedPatientScript}"</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* MODAL: BREAKDOWN DETAILS */}
      {breakdownType && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-base text-slate-900">
                {breakdownType === 'total' && '📞 تفصيل إجمالي المكالمات حسب النوع'}
                {breakdownType === 'completed' && '✅ تفصيل المكالمات المكتملة والمعلقة'}
                {breakdownType === 'booked' && '📅 تفصيل الحجوزات حسب الفروع'}
                {breakdownType === 'complaints' && '📣 تفصيل الشكاوى الواردة'}
              </h3>
              <button onClick={() => setBreakdownType(null)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              {breakdownType === 'total' && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 bg-blue-50 rounded-xl">
                    <span className="text-slate-500 block">واردة (Inbound)</span>
                    <strong className="text-xl text-blue-700">{filteredCalls.filter(c => c.callType === 'Inbound').length}</strong>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-xl">
                    <span className="text-slate-500 block">صادرة (Outbound)</span>
                    <strong className="text-xl text-emerald-700">{filteredCalls.filter(c => c.callType === 'Outbound').length}</strong>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-xl">
                    <span className="text-slate-500 block">ليدز (Lead)</span>
                    <strong className="text-xl text-purple-700">{filteredCalls.filter(c => c.callType === 'Outbound-Lead').length}</strong>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-xl">
                    <span className="text-slate-500 block">لم تحضر (NoShow)</span>
                    <strong className="text-xl text-orange-700">{filteredCalls.filter(c => c.callType === 'NoShow').length}</strong>
                  </div>
                </div>
              )}

              {breakdownType === 'completed' && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 bg-emerald-50 rounded-xl">
                    <span className="text-slate-500 block">مكتملة (Completed)</span>
                    <strong className="text-xl text-emerald-700">{completedCalls}</strong>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-xl">
                    <span className="text-slate-500 block">معلقة (Pending)</span>
                    <strong className="text-xl text-amber-700">{pendingCalls}</strong>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-slate-500 block">لم يرد (NoAnswer)</span>
                    <strong className="text-xl text-slate-700">{filteredCalls.filter(c => c.status === 'NoAnswer').length}</strong>
                  </div>
                  <div className="p-3 bg-rose-50 rounded-xl">
                    <span className="text-slate-500 block">ملغاة (Cancelled)</span>
                    <strong className="text-xl text-rose-700">{filteredCalls.filter(c => c.status === 'Cancelled').length}</strong>
                  </div>
                </div>
              )}

              {breakdownType === 'booked' && (
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-4 bg-sky-50 rounded-xl">
                    <span className="text-slate-600 block font-bold mb-1">فرع جدة (JED)</span>
                    <strong className="text-2xl text-sky-700">{filteredCalls.filter(c => c.branch === 'JED' && (c.result === 'Booked' || c.result === 'Confirmed')).length}</strong>
                  </div>
                  <div className="p-4 bg-teal-50 rounded-xl">
                    <span className="text-slate-600 block font-bold mb-1">فرع محايل عسير (MAH)</span>
                    <strong className="text-2xl text-teal-700">{filteredCalls.filter(c => c.branch === 'MAH' && (c.result === 'Booked' || c.result === 'Confirmed')).length}</strong>
                  </div>
                </div>
              )}

              {breakdownType === 'complaints' && (
                <div className="space-y-2">
                  {filteredCalls.filter(c => c.result === 'Complaint').map(comp => (
                    <div key={comp.referenceNumber} className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-xs">
                      <div className="flex items-center justify-between font-bold text-rose-900 mb-1">
                        <span>👤 {comp.patientName}</span>
                        <span className="font-mono text-[11px]">{comp.referenceNumber}</span>
                      </div>
                      <p className="text-slate-700">{comp.notes || 'لا توجد تفاصيل إضافية'}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t">
              <button
                onClick={() => setBreakdownType(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CALL FULL DETAILS */}
      {selectedCall && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <span>تفاصيل المكالمة:</span>
                <span className="font-mono text-[#0B6E99]">{selectedCall.referenceNumber}</span>
              </div>
              <button onClick={() => setSelectedCall(null)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl">
              <div>👤 المريض: <strong className="text-slate-900">{selectedCall.patientName}</strong></div>
              <div>📱 الجوال: <strong className="text-slate-900 font-mono" dir="ltr">{selectedCall.mobile}</strong></div>
              <div>🏥 الفرع: <strong className="text-slate-900">{selectedCall.branch === 'JED' ? 'جدة' : 'محايل'}</strong></div>
              <div>💼 الموظف: <strong className="text-slate-900">{selectedCall.agent}</strong></div>
              <div>🎯 السبب: <strong className="text-[#0B6E99]">{selectedCall.purpose}</strong></div>
              <div>👨‍⚕️ الطبيب: <strong className="text-slate-900">{selectedCall.doctor || '---'}</strong></div>
              <div>📊 الحالة: <strong className="text-slate-900">{selectedCall.status}</strong></div>
              <div>📋 النتيجة: <strong className="text-slate-900">{selectedCall.result}</strong></div>
            </div>

            {selectedCall.notes && (
              <div className="p-3 bg-white border border-slate-200 rounded-xl">
                <span className="font-bold text-slate-700 block mb-1">الملاحظات:</span>
                <p className="text-slate-600">{selectedCall.notes}</p>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t">
              <button
                onClick={() => {
                  setSelectedCall(null);
                  runAiCaseAnalysis(selectedCall);
                  setActiveTab('aiConsultant');
                }}
                className="px-3 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl font-bold flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>تحليل الذكاء التفكيري لهذه المكالمة</span>
              </button>

              <button
                onClick={() => setSelectedCall(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD QUALITY REVIEW */}
      {showAddReviewModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-base text-slate-900">إضافة تقييم جودة لمكالمة</h3>
              <button onClick={() => setShowAddReviewModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">✕</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">ابحث برقم الجوال أو اسم المريض:</label>
                <input
                  type="text"
                  value={callSearchQuery}
                  onChange={e => setCallSearchQuery(e.target.value)}
                  placeholder="ابحث لاختيار المكالمة..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              {callSearchQuery.length >= 2 && (
                <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-xl p-2 space-y-1.5">
                  {calls
                    .filter(c => c.patientName.includes(callSearchQuery) || c.mobile.includes(callSearchQuery) || c.referenceNumber.includes(callSearchQuery))
                    .slice(0, 5)
                    .map(c => (
                      <div
                        key={c.referenceNumber}
                        onClick={() => setReviewForm({ ...reviewForm, referenceNumber: c.referenceNumber })}
                        className={`p-2 rounded-lg cursor-pointer transition-colors ${
                          reviewForm.referenceNumber === c.referenceNumber ? 'bg-purple-100 text-purple-900 font-bold' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex justify-between">
                          <span>{c.patientName}</span>
                          <span className="font-mono text-[10px] text-slate-500">{c.referenceNumber}</span>
                        </div>
                        <div className="text-[10px] text-slate-400">{c.agent} • {c.purpose}</div>
                      </div>
                    ))}
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">الرقم المرجعي المختار:</label>
                <input
                  type="text"
                  readOnly
                  value={reviewForm.referenceNumber}
                  placeholder="اختر مكالمة من البحث أعلاه"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">نوع التقييم:</label>
                <select
                  value={reviewForm.commentType}
                  onChange={e => setReviewForm({ ...reviewForm, commentType: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="quality">تقييم قسم الجودة (Quality)</option>
                  <option value="teamlead">ملاحظة مشرف الفريق (Team Lead)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">التقييم (النجوم):</label>
                <select
                  value={reviewForm.qualityRating}
                  onChange={e => setReviewForm({ ...reviewForm, qualityRating: parseInt(e.target.value) || 5 })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="5">⭐⭐⭐⭐⭐ ممتاز (5/5)</option>
                  <option value="4">⭐⭐⭐⭐ جيد جداً (4/5)</option>
                  <option value="3">⭐⭐⭐ جيد (3/5)</option>
                  <option value="2">⭐⭐ مقبول (2/5)</option>
                  <option value="1">⭐ ضعيف (1/5)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ملاحظة وتوجيه المقيم للموظف:</label>
                <textarea
                  rows={3}
                  value={reviewForm.qualityComment}
                  onChange={e => setReviewForm({ ...reviewForm, qualityComment: e.target.value })}
                  placeholder="اكتب التوجيهات أو الملاحظات البناءة للموظف..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                onClick={() => setShowAddReviewModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold"
              >
                إلغاء
              </button>
              <button
                onClick={() => {
                  if (!reviewForm.referenceNumber || !reviewForm.qualityComment) {
                    alert('يرجى اختيار المكالمة وكتابة الملاحظة');
                    return;
                  }
                  addQualityReview(reviewForm);
                  setShowAddReviewModal(false);
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-xl font-bold"
              >
                حفظ التقييم
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
