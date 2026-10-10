import React, { useState } from 'react';
import { GAS_FILES_BUNDLE, GasFile } from '../data/gasSourceBundle';
import {
  Code, Copy, Check, Download, ExternalLink,
  BookOpen, Terminal, Sparkles, FolderDown
} from 'lucide-react';

export const GoogleAppsScriptVault: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<GasFile>(GAS_FILES_BUNDLE[1]); // CRM_Config_Master.gs
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadAll = () => {
    const textData = GAS_FILES_BUNDLE.map(f => `// ==========================================\n// FILE: ${f.name}\n// ${f.description}\n// ==========================================\n\n${f.code}\n\n`).join('\n\n');
    const blob = new Blob([textData], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ExpertsCare_CRM_GAS_v27_AllFiles.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-700 text-white p-6 rounded-3xl shadow-sm space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white">
              <Code className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold">حزمة أكواد Google Apps Script الأصلية (v27)</h2>
                <span className="bg-emerald-500 text-slate-900 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                  جاهزة للنشر الفوري
                </span>
              </div>
              <p className="text-xs text-emerald-100 mt-0.5">
                يمكنك نسخ أو تنزيل جميع ملفات السكريبت والشيتات لاستخدامها في Google Sheets مباشرة
              </p>
            </div>
          </div>

          <button
            onClick={handleDownloadAll}
            className="px-4 py-2.5 bg-white text-emerald-900 hover:bg-emerald-50 rounded-xl text-xs font-extrabold shadow-sm flex items-center gap-2 cursor-pointer transition-colors"
          >
            <FolderDown className="w-4 h-4 text-emerald-700" />
            <span>تنزيل جميع الملفات في ملف واحد</span>
          </button>
        </div>
      </div>

      {/* Deployment Guide Steps */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-600" />
          <span>خطوات التشغيل السريع في Google Apps Script & Google Sheets:</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-extrabold flex items-center justify-center text-xs">
              1
            </div>
            <strong className="block text-slate-900">إنشاء مشروع Google Sheet</strong>
            <p className="text-slate-600 leading-relaxed">
              افتح Google Sheets جديد، ثم من القائمة اختر: <strong>الإضافات (Extensions) &gt; Apps Script</strong>.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-extrabold flex items-center justify-center text-xs">
              2
            </div>
            <strong className="block text-slate-900">لصق الملفات وبناء الشيتات</strong>
            <p className="text-slate-600 leading-relaxed">
              قم بإنشاء الملفات بنفس أسمائها ولصق الأكواد، ثم نفّذ الدالة: <code>setupMasterConfig()</code> لإنشاء الشيتات الـ 29 تلقائياً.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-extrabold flex items-center justify-center text-xs">
              3
            </div>
            <strong className="block text-slate-900">تثبيت المشغلات والنشر</strong>
            <p className="text-slate-600 leading-relaxed">
              شغّل دالة <code>installAllTriggers()</code> لتفعيل فحص SLA وCallbacks آلياً، ثم اضغط <strong>Deploy &gt; New Deployment &gt; Web App</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* File Explorer & Code Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Sidebar: File List */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="text-xs font-bold text-slate-500 mb-2 px-2">ملفات المشروع ({GAS_FILES_BUNDLE.length}):</div>
          <div className="space-y-1 max-h-[600px] overflow-y-auto">
            {GAS_FILES_BUNDLE.map(file => (
              <button
                key={file.name}
                onClick={() => setSelectedFile(file)}
                className={`w-full text-right px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                  selectedFile.name === file.name
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                    : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="truncate">
                  <div className="font-mono text-xs">{file.name}</div>
                  <div className="text-[10px] text-slate-400 font-normal truncate">{file.description}</div>
                </div>
                <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded font-mono ${
                  file.type === 'json' ? 'bg-amber-100 text-amber-800' : (file.type === 'html' ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800')
                }`}>
                  {file.type}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Code View Area */}
        <div className="lg:col-span-3 bg-slate-900 rounded-2xl border border-slate-800 shadow-lg overflow-hidden flex flex-col">
          <div className="bg-slate-800 px-5 py-3 flex items-center justify-between border-b border-slate-700 text-xs">
            <div className="flex items-center gap-2 text-slate-200 font-mono">
              <span className="w-3 h-3 rounded-full bg-rose-500 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
              <span className="ml-2 font-bold">{selectedFile.name}</span>
            </div>

            <button
              onClick={handleCopy}
              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'تم النسخ!' : 'نسخ الكود'}</span>
            </button>
          </div>

          <div className="p-4 bg-slate-950 font-mono text-xs text-slate-300 overflow-x-auto max-h-[550px] leading-relaxed select-all">
            <pre>
              <code>{selectedFile.code}</code>
            </pre>
          </div>
        </div>
      </div>

    </div>
  );
};
