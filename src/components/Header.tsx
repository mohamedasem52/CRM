import React, { useState } from 'react';
import { useCRM } from '../context/CRMContext';
import { User } from '../types/crm';
import {
  PhoneCall, LayoutDashboard, Code, Bell, UserCheck,
  ChevronDown, CheckCheck, Clock, Star, AlertTriangle,
  RefreshCw, LogOut, CheckCircle2, Hospital
} from 'lucide-react';

interface HeaderProps {
  currentView: 'agent' | 'dashboard' | 'gas';
  setCurrentView: (view: 'agent' | 'dashboard' | 'gas') => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, setCurrentView }) => {
  const {
    currentUser, users, switchUser, alerts, markAlertRead,
    markAllAlertsRead, onlineAgents
  } = useCRM();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);

  const unreadAlerts = alerts.filter(a => !a.isRead);

  const getRoleLabel = (role: User['role']) => {
    switch (role) {
      case 'admin': return 'مدير النظام (Admin)';
      case 'manager': return 'مدير (Manager)';
      case 'supervisor': return 'مشرف (Supervisor)';
      case 'quality': return 'كواليتي (Quality)';
      case 'agent-quality': return 'موظف - كواليتي';
      case 'team-lead': return 'مشرف فريق (Team Lead)';
      case 'agent': return 'موظف خدمة عملاء (Agent)';
      case 'viewer': return 'مشاهد (Viewer)';
      default: return role;
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">

          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0B6E99] to-[#14A5C9] flex items-center justify-center text-white shadow-sm font-bold text-xl">
              <Hospital className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-slate-900 tracking-tight">مجموعة إكسبرتس كير الطبية</span>
                <span className="bg-[#0B6E99]/10 text-[#0B6E99] font-bold text-[11px] px-2 py-0.5 rounded-full border border-[#0B6E99]/20">
                  CRM v27
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Experts-Care Medical Group • نظام إدارة ومتابعة المرضى المتكامل
              </p>
            </div>
          </div>

          {/* Navigation Mode Buttons */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setCurrentView('agent')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                currentView === 'agent'
                  ? 'bg-white text-[#0B6E99] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>تسجيل المكالمات</span>
            </button>

            <button
              onClick={() => setCurrentView('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                currentView === 'dashboard'
                  ? 'bg-white text-[#0B6E99] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>لوحة التحكم الإدارية</span>
            </button>

            <button
              onClick={() => setCurrentView('gas')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                currentView === 'gas'
                  ? 'bg-white text-[#0B6E99] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="عرض وتصدير ملفات Google Apps Script الأصلية"
            >
              <Code className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-700">أكواد Google Script</span>
            </button>
          </div>

          {/* User Controls & Alerts */}
          <div className="flex items-center gap-2">
            
            {/* Live Agents Pulse Pill */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{onlineAgents.length} متصلين الآن</span>
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifs(!showNotifs)}
                className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                title="التنبيهات الفورية"
              >
                <Bell className="w-5 h-5" />
                {unreadAlerts.length > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-rose-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-bounce">
                    {unreadAlerts.length}
                  </span>
                )}
              </button>

              {/* Notification Panel */}
              {showNotifs && (
                <div className="absolute left-0 sm:right-auto sm:left-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50">
                  <div className="bg-gradient-to-r from-[#0B6E99] to-[#14A5C9] text-white p-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4" />
                      <span className="font-bold text-sm">التنبيهات الفورية ({unreadAlerts.length})</span>
                    </div>
                    {unreadAlerts.length > 0 && (
                      <button
                        onClick={markAllAlertsRead}
                        className="text-xs bg-white/20 hover:bg-white/30 text-white px-2 py-0.5 rounded-md flex items-center gap-1"
                      >
                        <CheckCheck className="w-3 h-3" />
                        <span>قراءة الكل</span>
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {alerts.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 text-xs">
                        لا توجد تنبيهات جديدة حالياً
                      </div>
                    ) : (
                      alerts.slice(0, 15).map(alert => (
                        <div
                          key={alert.alertId}
                          onClick={() => markAlertRead(alert.alertId)}
                          className={`p-3 transition-colors cursor-pointer text-xs ${
                            alert.isRead ? 'bg-white hover:bg-slate-50' : 'bg-amber-50/70 border-r-4 border-amber-500'
                          }`}
                        >
                          <div className="flex items-center justify-between font-bold text-slate-800 mb-1">
                            <span className="flex items-center gap-1">
                              {alert.alertType.includes('quality') && <Star className="w-3.5 h-3.5 text-purple-600" />}
                              {alert.alertType.includes('callback') && <Clock className="w-3.5 h-3.5 text-amber-600" />}
                              {alert.alertType.includes('sla') && <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />}
                              <span>{alert.title}</span>
                            </span>
                            <span className="text-[10px] text-slate-400 font-normal">
                              {new Date(alert.createdAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-slate-600 text-[11px] leading-relaxed">{alert.message}</p>
                          {alert.referenceNumber && (
                            <span className="inline-block mt-1 font-mono text-[10px] text-[#0B6E99] font-bold">
                              {alert.referenceNumber}
                            </span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-xs transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-[#0B6E99] text-white flex items-center justify-center font-bold text-[11px]">
                  {currentUser.name.slice(0, 1)}
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-800 leading-tight">{currentUser.name}</div>
                  <div className="text-[10px] text-slate-500 font-medium">{getRoleLabel(currentUser.role)}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showUserMenu && (
                <div className="absolute left-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 p-2">
                  <div className="p-2 border-b border-slate-100 text-xs">
                    <div className="font-bold text-slate-700 mb-1">تبديل المستخدم (للتجربة السريعة):</div>
                    <p className="text-[11px] text-slate-400">يمكنك التبديل بين مختلف الأدوار لاختبار كافة الصلاحيات</p>
                  </div>

                  <div className="max-h-60 overflow-y-auto py-1 divide-y divide-slate-50">
                    {users.map(u => (
                      <button
                        key={u.email}
                        onClick={() => {
                          switchUser(u);
                          setShowUserMenu(false);
                        }}
                        className={`w-full text-right px-3 py-2 text-xs flex items-center justify-between rounded-lg transition-colors ${
                          currentUser.email === u.email ? 'bg-[#0B6E99]/10 text-[#0B6E99] font-bold' : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div>
                          <div className="font-semibold">{u.name}</div>
                          <div className="text-[10px] text-slate-400">{getRoleLabel(u.role)} • فرع {u.branch || 'الكل'}</div>
                        </div>
                        {currentUser.email === u.email && (
                          <CheckCircle2 className="w-4 h-4 text-[#0B6E99]" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
