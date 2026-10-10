export interface GasFile {
  name: string;
  type: 'gs' | 'html' | 'json';
  description: string;
  code: string;
}

export const GAS_FILES_BUNDLE: GasFile[] = [
  {
    name: 'appsscript.json',
    type: 'json',
    description: 'Manifest file for Google Apps Script with timezone and OAuth scopes',
    code: `{
  "timeZone": "Africa/Cairo",
  "dependencies": {},
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8",
  "webapp": {
    "executeAs": "USER_ACCESSING",
    "access": "ANYONE"
  },
  "oauthScopes": [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/script.external_request",
    "https://www.googleapis.com/auth/script.scriptapp",
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/calendar",
    "https://www.googleapis.com/auth/script.send_mail"
  ]
}`
  },
  {
    name: 'CRM_Config_Master.gs',
    type: 'gs',
    description: 'إعدادات النظام الأساسية، الألوان، وبناء جميع الشيتات الـ 29 من الصفر',
    code: `// Experts-Care Medical Group CRM (v27)
// Master Configuration & Sheet Initializer
// See CRM_Config_Master in project setup...`
  },
  {
    name: 'CRM_Utils.gs',
    type: 'gs',
    description: 'الدوال المساعدة، التطهير والتخزين المؤقت، وتسجيل الفروقات وسجل التعديلات',
    code: `// CRM_Utils.gs --- Experts-Care Medical Group (v27)
// Cache / Settings / Timezone / Sanitizers / Diff logging`
  },
  {
    name: 'CRM_Security.gs',
    type: 'gs',
    description: 'أمن الجلسات، تشفير PIN (HMAC-SHA256)، فحص الصلاحيات وتقييد الفروع',
    code: `// CRM_Security.gs --- Experts-Care Medical Group (v27)
// Roles, HMAC PIN Hashing, Sessions, Permissions`
  },
  {
    name: 'CRM_DataLayer.gs',
    type: 'gs',
    description: 'طبقة البيانات، إثراء المكالمات، الحفظ والتعديل مع تاريخ التعديلات، والتحويل',
    code: `// CRM_DataLayer.gs --- Experts-Care Medical Group (v27)
// Enrichment, save, update, transfer, patients registry`
  },
  {
    name: 'CRM_SLA.gs',
    type: 'gs',
    description: 'مراقبة اتفاقيات مستوى الخدمة SLA وتصعيد الحالات وقائمة Callbacks وتأجيلها',
    code: `// CRM_SLA.gs --- Experts-Care Medical Group (v27)
// SLA Rules & Monitoring, Callback Queue, Snooze`
  },
  {
    name: 'CRM_Realtime.gs',
    type: 'gs',
    description: 'حالة الموظفين الحية (Live Status) ومراقبة مواعيد إعادة الاتصال الدقيقة',
    code: `// CRM_Realtime.gs --- Experts-Care Medical Group (v27)
// Heartbeat, Live Agents, Callback Due Notifications`
  },
  {
    name: 'CRM_Sentiment.gs',
    type: 'gs',
    description: 'تحليل مشاعر المرضى (AI Sentiment Analysis) بالكلمات المفتاحية والـ API',
    code: `// CRM_Sentiment.gs --- Experts-Care Medical Group (v27)
// Keyword & NL Sentiment Analysis Engine`
  },
  {
    name: 'CRM_Patients.gs',
    type: 'gs',
    description: 'ملفات المرضى الشاملة (Patient Timeline)، البحث، إحصائيات الزيارات السابقة',
    code: `// CRM_Patients.gs --- Experts-Care Medical Group (v27)
// Patient Timeline, Visit Registry, VIP tracking`
  },
  {
    name: 'CRM_Dashboard.gs',
    type: 'gs',
    description: 'لوحة القيادة، المؤشرات KPIs، الخريطة الحرارية، تقارير Excel اليومية والشهرية',
    code: `// CRM_Dashboard.gs --- Experts-Care Medical Group (v27)
// KPIs, Analytics, Daily Reports, Excel Export`
  },
  {
    name: 'CRM_Users.gs',
    type: 'gs',
    description: 'إدارة المستخدمين والصلاحيات وتغيير PIN وتصدير ملفات المستخدمين',
    code: `// CRM_Users.gs --- Experts-Care Medical Group (v27)
// User CRUD, Roles, PIN Management, CSV export`
  },
  {
    name: 'CRM_PDFReports.gs',
    type: 'gs',
    description: 'توليد تقارير PDF الرسمية مع ترويسة المجموعة وشعار الفروع',
    code: `// CRM_PDFReports.gs --- Experts-Care Medical Group (v27)
// PDF Report Generation via Google Docs & Drive`
  },
  {
    name: 'CRM_Backup.gs',
    type: 'gs',
    description: 'النسخ الاحتياطي التلقائي اليومي مع الاحتفاظ بآخر 30 نسخة في Google Drive',
    code: `// CRM_Backup.gs --- Experts-Care Medical Group (v27)
// Daily Master Sheet Drive Backups`
  },
  {
    name: 'CRM_Triggers.gs',
    type: 'gs',
    description: 'تثبيت جميع المشغلات الزمنية (Triggers) بضغطة زر واحدة installAllTriggers()',
    code: `// CRM_Triggers.gs --- Experts-Care Medical Group (v27)
// Unified Trigger Installer: SLA, Callbacks, Reports, Backup`
  },
  {
    name: 'CRM_WebApp.gs',
    type: 'gs',
    description: 'واجهة API لتطبيق الويب (doGet, submitForm, getPatientQuickInfo, وغيرها)',
    code: `// CRM_WebApp.gs --- Experts-Care Medical Group (v27)
// Web App routing and endpoints`
  },
  {
    name: 'index.html',
    type: 'html',
    description: 'واجهة بوابة الموظف لتسجيل المكالمات ومتابعة المهام وقائمة Callbacks',
    code: `<!-- Agent Call Logging Portal (index.html) -->`
  },
  {
    name: 'dashboard.html',
    type: 'html',
    description: 'لوحة التحكم الإدارية الكاملة للمشرفين والمدراء',
    code: `<!-- Management Dashboard (dashboard.html) -->`
  }
];
