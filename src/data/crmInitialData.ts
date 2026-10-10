import {
  Branch, Team, Department, Doctor, Agent, User,
  Purpose, PurposeField, CallRecord, CallbackQueueItem,
  QualityReviewItem, InAppAlert, Patient, SLARule
} from '../types/crm';

export const BRAND = {
  primary: '#0B6E99',
  secondary: '#14A5C9',
  accent: '#1ABC9C',
  warning: '#F59E0B',
  danger: '#DC2626',
  success: '#27AE60',
  quality: '#9B59B6',
  teamlead: '#3498DB',
  dark: '#1C2833',
  light: '#F1F5F9',
  white: '#FFFFFF',
};

export const LOGOS = {
  jeddah: 'https://lh3.googleusercontent.com/d/1uAqFUmWH7DOaQOZl4EEYM0xujIQm0HGo',
  mahayel: 'https://lh3.googleusercontent.com/d/13DHCBHJUdzqTUtcOYB-Iiqpn8u-YlDoe',
};

export const INITIAL_BRANCHES: Branch[] = [
  {
    code: 'JED',
    nameAr: 'فرع جدة',
    nameEn: 'Jeddah Branch',
    city: 'جدة',
    region: 'مكة المكرمة',
    phone: '+966126000000',
    email: 'jeddah@experts-care.com',
    logoUrl: LOGOS.jeddah,
    active: true
  },
  {
    code: 'MAH',
    nameAr: 'فرع محايل عسير',
    nameEn: 'Mahayel Asir Branch',
    city: 'محايل عسير',
    region: 'عسير',
    phone: '+966172000000',
    email: 'mahayel@experts-care.com',
    logoUrl: LOGOS.mahayel,
    active: true
  }
];

export const INITIAL_TEAMS: Team[] = [
  {
    code: 'Jeddah-A',
    nameAr: 'فريق جدة',
    nameEn: 'Jeddah Team',
    location: 'جدة',
    servesBranches: ['JED'],
    supervisorId: 'SUP001',
    active: true,
    notes: 'يخدم فرع جدة'
  },
  {
    code: 'Mahayel-A',
    nameAr: 'فريق محايل عسير',
    nameEn: 'Mahayel Team',
    location: 'محايل',
    servesBranches: ['MAH'],
    supervisorId: 'SUP001',
    active: true,
    notes: 'يخدم فرع محايل'
  },
  {
    code: 'Cairo-A',
    nameAr: 'فريق القاهرة',
    nameEn: 'Cairo Team',
    location: 'القاهرة',
    servesBranches: ['JED', 'MAH'],
    supervisorId: 'SUP001',
    active: true,
    notes: 'يخدم الفرعين معاً'
  }
];

export const INITIAL_DEPARTMENTS: Department[] = [
  { code: 'OPH', nameAr: 'عيون', nameEn: 'Ophthalmology', branchCode: 'JED', specialty: 'Ophthalmology', active: true },
  { code: 'INT', nameAr: 'باطنية', nameEn: 'Internal Medicine', branchCode: 'JED', specialty: 'Internal Medicine', active: true },
  { code: 'DER', nameAr: 'جلدية', nameEn: 'Dermatology', branchCode: 'JED', specialty: 'Dermatology', active: true },
  { code: 'OBG', nameAr: 'نساء وولادة', nameEn: 'OB-GYN', branchCode: 'JED', specialty: 'OB-GYN', active: true },
  { code: 'ENT', nameAr: 'أنف وأذن وحنجرة', nameEn: 'ENT', branchCode: 'JED', specialty: 'ENT', active: true },
  { code: 'DEN', nameAr: 'أسنان', nameEn: 'Dentistry', branchCode: 'JED', specialty: 'Dentistry', active: true },
  { code: 'GIT', nameAr: 'جهاز هضمي', nameEn: 'GIT', branchCode: 'JED', specialty: 'GIT', active: true },
  { code: 'SUR', nameAr: 'جراحة عامة', nameEn: 'General Surgery', branchCode: 'JED', specialty: 'General Surgery', active: true },
  { code: 'LAS', nameAr: 'ليزر', nameEn: 'Laser', branchCode: 'JED', specialty: 'Laser', active: true },
  { code: 'URO', nameAr: 'مسالك بولية', nameEn: 'Urology', branchCode: 'JED', specialty: 'Urology', active: true },
  { code: 'EMR', nameAr: 'طوارئ', nameEn: 'Emergency', branchCode: 'JED', specialty: 'Emergency', active: true },
  { code: 'CAR', nameAr: 'قلب', nameEn: 'Cardiology', branchCode: 'JED', specialty: 'Cardiology', active: true },
  { code: 'NEU', nameAr: 'مخ وأعصاب', nameEn: 'Neurology', branchCode: 'JED', specialty: 'Neurology', active: true },
  { code: 'NEP', nameAr: 'كلى', nameEn: 'Nephrology', branchCode: 'JED', specialty: 'Nephrology', active: true },

  { code: 'OPH', nameAr: 'عيون', nameEn: 'Ophthalmology', branchCode: 'MAH', specialty: 'Ophthalmology', active: true },
  { code: 'INT', nameAr: 'باطنية', nameEn: 'Internal Medicine', branchCode: 'MAH', specialty: 'Internal Medicine', active: true },
  { code: 'DER', nameAr: 'جلدية', nameEn: 'Dermatology', branchCode: 'MAH', specialty: 'Dermatology', active: true },
  { code: 'OBG', nameAr: 'نساء وولادة', nameEn: 'OB-GYN', branchCode: 'MAH', specialty: 'OB-GYN', active: true },
  { code: 'ENT', nameAr: 'أنف وأذن وحنجرة', nameEn: 'ENT', branchCode: 'MAH', specialty: 'ENT', active: true },
  { code: 'DEN', nameAr: 'أسنان', nameEn: 'Dentistry', branchCode: 'MAH', specialty: 'Dentistry', active: true },
  { code: 'SUR', nameAr: 'جراحة عامة', nameEn: 'General Surgery', branchCode: 'MAH', specialty: 'General Surgery', active: true },
  { code: 'EMR', nameAr: 'طوارئ', nameEn: 'Emergency', branchCode: 'MAH', specialty: 'Emergency', active: true },
];

export const INITIAL_DOCTORS: Doctor[] = [
  // JED doctors
  { id: 'D0001', nameAr: 'د. محمد زهران', nameEn: 'Dr. Mohammed Zahran', branchCode: 'JED', deptCode: 'ENT', specialty: 'استشاري أنف وأذن وحنجرة أطفال', language: 'AR/EN', gender: 'M', active: true },
  { id: 'D0002', nameAr: 'د. محمد الشنبري', nameEn: 'Dr. Mohammed Alshanbari', branchCode: 'JED', deptCode: 'ENT', specialty: 'استشاري جراحة أنف وأذن', language: 'AR/EN', gender: 'M', active: true },
  { id: 'D0003', nameAr: 'د. دلال الشربتلي', nameEn: 'Dr. Dalal Alsharibtly', branchCode: 'JED', deptCode: 'ENT', specialty: 'استشاري جراحة أنف وأذن', language: 'AR/EN', gender: 'F', active: true },
  { id: 'D0004', nameAr: 'د. علاء المنان', nameEn: 'Dr. Alaa Almanan', branchCode: 'JED', deptCode: 'ENT', specialty: 'استشاري جراحة أنف وأذن', language: 'AR/EN', gender: 'M', active: true },
  { id: 'D0005', nameAr: 'د. محمد سامي السيد', nameEn: 'Dr. Mohammed Sami Elsayed', branchCode: 'JED', deptCode: 'ENT', specialty: 'أخصائي أنف وأذن', language: 'AR/EN', gender: 'M', active: true },
  { id: 'D0006', nameAr: 'د. فؤاد عبدالجبار', nameEn: 'Dr. Fouad Abduljabbar', branchCode: 'JED', deptCode: 'DEN', specialty: 'استشاري علاج جذور', language: 'AR/EN', gender: 'M', active: true },
  { id: 'D0007', nameAr: 'د. عمرو سلام', nameEn: 'Dr. Amr Salam', branchCode: 'JED', deptCode: 'DEN', specialty: 'استشاري لثة وزراعة', language: 'AR/EN', gender: 'M', active: true },
  { id: 'D0008', nameAr: 'د. عبدالله القثمي', nameEn: 'Dr. Abdullah Alquthami', branchCode: 'JED', deptCode: 'DEN', specialty: 'استشاري لثة وزراعة', language: 'AR/EN', gender: 'M', active: true },
  { id: 'D0009', nameAr: 'د. محمد الحارثي', nameEn: 'Dr. Mohammed Alharthi', branchCode: 'JED', deptCode: 'DEN', specialty: 'استشاري آلام الوجه والمفصل', language: 'AR/EN', gender: 'M', active: true },
  { id: 'D0010', nameAr: 'د. نبيل عون', nameEn: 'Dr. Nabil Aoun', branchCode: 'JED', deptCode: 'DEN', specialty: 'أخصائي تقويم', language: 'AR/EN', gender: 'M', active: true },
  { id: 'D0011', nameAr: 'د. أيمن نوح', nameEn: 'Dr. Ayman Nooh', branchCode: 'JED', deptCode: 'DEN', specialty: 'استشاري أسنان أطفال', language: 'AR/EN', gender: 'M', active: true },
  { id: 'D0012', nameAr: 'د. ثابت الحسامي', nameEn: 'Dr. Thabet Alhasami', branchCode: 'JED', deptCode: 'DEN', specialty: 'استشاري جذور', language: 'AR/EN', gender: 'M', active: true },
  { id: 'D0013', nameAr: 'د. هند سعيد', nameEn: 'Dr. Hind Saeed', branchCode: 'JED', deptCode: 'DEN', specialty: 'طبيب أسنان عام', language: 'AR/EN', gender: 'F', active: true },
  { id: 'D0014', nameAr: 'د. هالة محمد', nameEn: 'Dr. Hala Mohammed', branchCode: 'JED', deptCode: 'DEN', specialty: 'طبيب أسنان عام', language: 'AR/EN', gender: 'F', active: true },
  { id: 'D0015', nameAr: 'د. هنادي الوافي', nameEn: 'Dr. Hanadi Alwafi', branchCode: 'JED', deptCode: 'DEN', specialty: 'استشاري أسنان أطفال', language: 'AR/EN', gender: 'F', active: true },
  { id: 'D0016', nameAr: 'د. لؤي حريري', nameEn: 'Dr. Loay Hariri', branchCode: 'JED', deptCode: 'DEN', specialty: 'نائب أول جذور', language: 'AR/EN', gender: 'M', active: true },
  { id: 'D0017', nameAr: 'د. علي الخيري', nameEn: 'Dr. Ali Alkhairy', branchCode: 'JED', deptCode: 'OPH', specialty: 'استشاري عيون وقرنية', language: 'AR/EN', gender: 'M', active: true },
  { id: 'D0018', nameAr: 'د. علي الشهري', nameEn: 'Dr. Ali Alshehri', branchCode: 'JED', deptCode: 'OPH', specialty: 'استشاري عيون وقرنية', language: 'AR/EN', gender: 'M', active: true },
  { id: 'D0019', nameAr: 'د. سعيد الغامدي', nameEn: 'Dr. Saeed Alghamdi', branchCode: 'JED', deptCode: 'OPH', specialty: 'استشاري عيون وقرنية', language: 'AR/EN', gender: 'M', active: true },
  { id: 'D0020', nameAr: 'د. ياسر المزروعي', nameEn: 'Dr. Yasser Almazrouei', branchCode: 'JED', deptCode: 'OPH', specialty: 'استشاري عيون وقناة دمعية', language: 'AR/EN', gender: 'M', active: true },
  { id: 'D0021', nameAr: 'د. مهند القرشي', nameEn: 'Dr. Mohannad Alqurashi', branchCode: 'JED', deptCode: 'OPH', specialty: 'استشاري عيون وجلوكوما', language: 'AR/EN', gender: 'M', active: true },
  { id: 'D0022', nameAr: 'د. إنعام دانيش', nameEn: 'Dr. Inaam Danish', branchCode: 'JED', deptCode: 'OPH', specialty: 'استشاري عيون - حول', language: 'AR/EN', gender: 'F', active: true },
  { id: 'D0023', nameAr: 'د. يحيى الشهراني', nameEn: 'Dr. Yahya Alshahrani', branchCode: 'JED', deptCode: 'OPH', specialty: 'استشاري عيون - شبكية', language: 'AR/EN', gender: 'M', active: true },
  { id: 'D0024', nameAr: 'د. أحمد الحربي', nameEn: 'Dr. Ahmed Alharbi', branchCode: 'JED', deptCode: 'GIT', specialty: 'استشاري باطنة وجهاز هضمي', language: 'AR/EN', gender: 'M', active: true },
  { id: 'D0025', nameAr: 'د. محمد الزهراني', nameEn: 'Dr. Mohammed Alzahrani', branchCode: 'JED', deptCode: 'GIT', specialty: 'استشاري جهاز هضمي ومناظير', language: 'AR/EN', gender: 'M', active: true },
  { id: 'D0026', nameAr: 'د. ثامر الغامدي', nameEn: 'Dr. Thamer Alghamdi', branchCode: 'JED', deptCode: 'SUR', specialty: 'استشاري جراحة عامة', language: 'AR/EN', gender: 'M', active: true },
  { id: 'D0027', nameAr: 'د. فهد الشهري', nameEn: 'Dr. Fahd Alshehri', branchCode: 'JED', deptCode: 'INT', specialty: 'استشاري سكري وغدد', language: 'AR/EN', gender: 'M', active: true },
  { id: 'D0028', nameAr: 'د. صفاء علام', nameEn: 'Dr. Safaa Allam', branchCode: 'JED', deptCode: 'INT', specialty: 'أخصائية باطنة سكري وغدد', language: 'AR/EN', gender: 'F', active: true },
  { id: 'D0029', nameAr: 'د. همام مندورة', nameEn: 'Dr. Hammam Mandourah', branchCode: 'JED', deptCode: 'URO', specialty: 'استشاري مسالك', language: 'AR/EN', gender: 'M', active: true },
  { id: 'D0030', nameAr: 'د. يحيى العرقبي', nameEn: 'Dr. Yahya Alarqabi', branchCode: 'JED', deptCode: 'DER', specialty: 'استشاري جلدية وتجميل', language: 'AR/EN', gender: 'M', active: true },
  { id: 'D0031', nameAr: 'د. ياسر فادن', nameEn: 'Dr. Yasser Faden', branchCode: 'JED', deptCode: 'OBG', specialty: 'استشاري نساء وولادة', language: 'AR/EN', gender: 'M', active: true },
  { id: 'D0032', nameAr: 'د. العنود الجهني', nameEn: 'Dr. Alanoud Aljohani', branchCode: 'JED', deptCode: 'EMR', specialty: 'طبيب عام طوارئ', language: 'AR/EN', gender: 'F', active: true },

  // MAH doctors
  { id: 'D0033', nameAr: 'د. مروة عبدالله', nameEn: 'Dr. Marwa Abdullah', branchCode: 'MAH', deptCode: 'DEN', specialty: 'أسنان', language: 'AR', gender: 'F', active: true },
  { id: 'D0034', nameAr: 'د. ياسر النجار', nameEn: 'Dr. Yasser Alnajjar', branchCode: 'MAH', deptCode: 'DEN', specialty: 'أسنان', language: 'AR', gender: 'M', active: true },
  { id: 'D0035', nameAr: 'د. محمد مصطفى', nameEn: 'Dr. Mohammed Mostafa', branchCode: 'MAH', deptCode: 'OPH', specialty: 'عيون', language: 'AR', gender: 'M', active: true },
  { id: 'D0036', nameAr: 'د. هالة عثمان', nameEn: 'Dr. Hala Othman', branchCode: 'MAH', deptCode: 'OPH', specialty: 'عيون', language: 'AR', gender: 'F', active: true },
  { id: 'D0037', nameAr: 'د. علي الشيبا', nameEn: 'Dr. Ali Alshiba', branchCode: 'MAH', deptCode: 'SUR', specialty: 'جراحة عامة', language: 'AR', gender: 'M', active: true },
  { id: 'D0038', nameAr: 'د. دينا سعد', nameEn: 'Dr. Dina Saad', branchCode: 'MAH', deptCode: 'INT', specialty: 'سكري وغدد', language: 'AR', gender: 'F', active: true },
  { id: 'D0039', nameAr: 'د. خالد عويضة', nameEn: 'Dr. Khaled Aweidah', branchCode: 'MAH', deptCode: 'INT', specialty: 'باطنة', language: 'AR', gender: 'M', active: true },
  { id: 'D0040', nameAr: 'د. فاطمة الزهراء', nameEn: 'Dr. Fatima Alzahra', branchCode: 'MAH', deptCode: 'OBG', specialty: 'نساء وولادة', language: 'AR', gender: 'F', active: true },
  { id: 'D0041', nameAr: 'د. أمنية', nameEn: 'Dr. Omnia', branchCode: 'MAH', deptCode: 'EMR', specialty: 'طوارئ', language: 'AR', gender: 'F', active: true },
  { id: 'D0042', nameAr: 'د. أحمد هويجب', nameEn: 'Dr. Ahmed Howeijeb', branchCode: 'MAH', deptCode: 'EMR', specialty: 'طوارئ', language: 'AR', gender: 'M', active: true }
];

export const INITIAL_AGENTS: Agent[] = [
  { id: 'A001', name: 'رغد عمر', teamCode: 'Jeddah-A', supervisorId: 'SUP001', targetDaily: 40, email: 'raghad@experts-care.com', active: true },
  { id: 'A002', name: 'شوق عادل', teamCode: 'Jeddah-A', supervisorId: 'SUP001', targetDaily: 40, email: 'shawq@experts-care.com', active: true },
  { id: 'A003', name: 'رنا حسين', teamCode: 'Jeddah-A', supervisorId: 'SUP001', targetDaily: 40, email: 'rana.hussien@experts-care.com', active: true },
  { id: 'A004', name: 'مثيله', teamCode: 'Mahayel-A', supervisorId: 'SUP001', targetDaily: 40, email: 'mathayel@experts-care.com', active: true },
  { id: 'A005', name: 'عائشه', teamCode: 'Mahayel-A', supervisorId: 'SUP001', targetDaily: 40, email: 'aisha@experts-care.com', active: true },
  { id: 'A006', name: 'صالحه احمد', teamCode: 'Cairo-A', supervisorId: 'SUP001', targetDaily: 40, email: 'saleha.ahmed@experts-care.com', active: true },
  { id: 'A007', name: 'رضوي عادل', teamCode: 'Cairo-A', supervisorId: 'SUP001', targetDaily: 40, email: 'radwa.adel@experts-care.com', active: true },
  { id: 'A008', name: 'مي ايمن', teamCode: 'Cairo-A', supervisorId: 'SUP001', targetDaily: 40, email: 'mai.ayman@experts-care.com', active: true },
  { id: 'A009', name: 'كريم اشرف', teamCode: 'Cairo-A', supervisorId: 'SUP001', targetDaily: 40, email: 'kareem.ashraf@experts-care.com', active: true },
  { id: 'A010', name: 'عبد الرحمن محمد', teamCode: 'Cairo-A', supervisorId: 'SUP001', targetDaily: 40, email: 'abdelrahman.mohamed@experts-care.com', active: true },
  { id: 'A011', name: 'جني عبد السميع', teamCode: 'Cairo-A', supervisorId: 'SUP001', targetDaily: 40, email: 'jana.abdelsamie@experts-care.com', active: true },
  { id: 'A012', name: 'احمد سراج', teamCode: 'Cairo-A', supervisorId: 'SUP001', targetDaily: 40, email: 'ahmed.serag@experts-care.com', active: true },
];

export const INITIAL_USERS: User[] = [
  {
    email: 'mohamed.asem@experts-care.com',
    name: 'محمد عاصم',
    pin: '1987',
    role: 'admin',
    branch: 'All',
    team: 'All',
    active: true,
    lastLogin: '2026-10-10T08:30:00Z',
    canEditCalls: true
  },
  {
    email: 'raghad@experts-care.com',
    name: 'رغد عمر',
    pin: '1234',
    role: 'agent',
    branch: 'JED',
    team: 'Jeddah-A',
    active: true,
    lastLogin: '2026-10-10T09:00:00Z',
    canEditCalls: true
  },
  {
    email: 'kareem.ashraf@experts-care.com',
    name: 'كريم اشرف',
    pin: '1234',
    role: 'agent-quality',
    branch: 'All',
    team: 'Cairo-A',
    active: true,
    lastLogin: '2026-10-10T08:45:00Z',
    canEditCalls: true
  },
  {
    email: 'mathayel@experts-care.com',
    name: 'مثيله',
    pin: '1234',
    role: 'team-lead',
    branch: 'MAH',
    team: 'Mahayel-A',
    active: true,
    lastLogin: '2026-10-10T08:15:00Z',
    canEditCalls: true
  },
  {
    email: 'quality@experts-care.com',
    name: 'مشرف الجودة الطبية',
    pin: '5555',
    role: 'quality',
    branch: 'All',
    team: 'All',
    active: true,
    lastLogin: '2026-10-10T07:30:00Z',
    canEditCalls: true
  }
];

export const INITIAL_FINANCIAL: string[] = [
  'Cash patient (نقدي)',
  'جمعية البر بدوقة',
  'جمعيه ابتسم',
  'جمعيه العلاج الامن',
  'جمعيه زمزم',
  'جمعيه يبصرون للعيون',
  'EMC - Mahayel',
  'Orel',
  'Rama (Alhamraa)',
  'ابو داود',
  'المركز الدولي للعناية بالسكري',
  'التأمين الصحي - بوبا',
  'التأمين الصحي - التعاونية',
  'شركة الجلد الذهبي الطبية',
  'عيادات رام',
  'مركز ابصار لطب العيون',
  'مستشفى الملك فهد',
  'وقف الشفاء الصحي'
];

export const INITIAL_PURPOSES: Purpose[] = [
  { code: 'PUR01', name: 'حجز موعد', nameEn: 'Appointment Booking', category: 'Booking', requiresDetails: true, active: true },
  { code: 'PUR02', name: 'استفسار', nameEn: 'Inquiry', category: 'General', requiresDetails: false, active: true },
  { code: 'PUR03', name: 'شكوى', nameEn: 'Complaint', category: 'Complaint', requiresDetails: true, active: true },
  { code: 'PUR04', name: 'طلب إعادة اتصال', nameEn: 'Callback Request', category: 'Callback', requiresDetails: true, active: true },
  { code: 'PUR05', name: 'تأكيد حجز', nameEn: 'Booking Confirmation', category: 'Booking', requiresDetails: false, active: true },
  { code: 'PUR06', name: 'إلغاء حجز', nameEn: 'Booking Cancellation', category: 'Booking', requiresDetails: true, active: true },
  { code: 'PUR07', name: 'متابعة', nameEn: 'Follow Up', category: 'FollowUp', requiresDetails: false, active: true },
  { code: 'PUR08', name: 'حالة عاجلة', nameEn: 'Urgent Case', category: 'Urgent', requiresDetails: true, active: true },
  { code: 'PUR09', name: 'استشارة طبية', nameEn: 'Medical Consultation', category: 'General', requiresDetails: false, active: true },
  { code: 'PUR10', name: 'نتائج تحاليل', nameEn: 'Lab Results', category: 'General', requiresDetails: false, active: true },
];

export const INITIAL_PURPOSE_FIELDS: PurposeField[] = [
  { purposeCode: 'PUR01', fieldKey: 'appointmentDate', fieldLabelAr: 'تاريخ الموعد', fieldLabelEn: 'Appointment Date', fieldType: 'date', isRequired: true, order: 1 },
  { purposeCode: 'PUR01', fieldKey: 'appointmentTime', fieldLabelAr: 'فترة الموعد', fieldLabelEn: 'Appointment Slot', fieldType: 'select', isRequired: true, options: ['صباحي (09:00 - 13:00)', 'مسائي (17:00 - 21:00)'], order: 2 },
  { purposeCode: 'PUR01', fieldKey: 'visitType', fieldLabelAr: 'نوع الزيارة', fieldLabelEn: 'Visit Type', fieldType: 'select', isRequired: true, options: ['كشف جديد', 'إعادة كشف / مراجعة'], order: 3 },

  { purposeCode: 'PUR03', fieldKey: 'complaintType', fieldLabelAr: 'نوع الشكوى', fieldLabelEn: 'Complaint Type', fieldType: 'select', isRequired: true, options: ['تأخير الانتظار', 'تعامل الطبيب أو الكادر', 'الخدمة التمريضية', 'الفواتير والأسعار', 'أخرى'], order: 1 },
  { purposeCode: 'PUR03', fieldKey: 'complaintDetails', fieldLabelAr: 'تفاصيل الشكوى', fieldLabelEn: 'Complaint Details', fieldType: 'text', isRequired: true, order: 2 },

  { purposeCode: 'PUR04', fieldKey: 'callbackDate', fieldLabelAr: 'تاريخ إعادة الاتصال', fieldLabelEn: 'Callback Date', fieldType: 'date', isRequired: true, order: 1 },
  { purposeCode: 'PUR04', fieldKey: 'callbackTime', fieldLabelAr: 'وقت الاتصال المفضل', fieldLabelEn: 'Callback Time', fieldType: 'select', isRequired: false, options: ['صباحاً (10:00)', 'ظهراً (14:00)', 'مساءً (18:00)'], order: 2 },

  { purposeCode: 'PUR06', fieldKey: 'cancelReason', fieldLabelAr: 'سبب إلغاء الحجز', fieldLabelEn: 'Cancellation Reason', fieldType: 'text', isRequired: true, order: 1 },

  { purposeCode: 'PUR08', fieldKey: 'urgencyLevel', fieldLabelAr: 'درجة الاستعجال', fieldLabelEn: 'Urgency Level', fieldType: 'select', isRequired: true, options: ['حرج جداً (طوارئ فورية)', 'عاجل (خلال ساعات)', 'متوسط'], order: 1 },
  { purposeCode: 'PUR08', fieldKey: 'urgentDetails', fieldLabelAr: 'الأعراض والحالة', fieldLabelEn: 'Symptoms & Condition', fieldType: 'text', isRequired: true, order: 2 },
];

export const INITIAL_SLA_RULES: SLARule[] = [
  { code: 'SLA01', metric: 'سرعة الرد على المكالمات', targetValue: '30', targetUnit: 'ثانية', description: 'الرد الفوري على الخطوط الواردة', active: true },
  { code: 'SLA02', metric: 'متوسط مدة المكالمة', targetValue: '5', targetUnit: 'دقيقة', description: 'تقديم الخدمة الكاملة بكفاءة', active: true },
  { code: 'SLA03', metric: 'معالجة الشكاوى', targetValue: '24', targetUnit: 'ساعة', description: 'الوقت الأقصى لحل وإغلاق شكوى المريض', active: true },
  { code: 'SLA04', metric: 'تأكيد الحجز', targetValue: '2', targetUnit: 'ساعة', description: 'الوقت الأقصى لتأكيد الحجز مع المريض', active: true },
  { code: 'SLA05', metric: 'إعادة الاتصال', targetValue: '4', targetUnit: 'ساعة', description: 'الوقت الأقصى للرد على طلبات Callback', active: true },
];

export const INITIAL_CALLS: CallRecord[] = [
  {
    referenceNumber: 'CRM-20261010-0915-0001',
    timestamp: '2026-10-10T09:15:00Z',
    callDate: '2026-10-10',
    callTime: '09:15',
    callType: 'Inbound',
    patientName: 'عبدالله بن سعد القرني',
    mobile: '0551234567',
    branch: 'JED',
    team: 'Jeddah-A',
    agent: 'رغد عمر',
    agentEmail: 'raghad@experts-care.com',
    financial: 'Cash patient (نقدي)',
    department: 'OPH',
    doctor: 'د. علي الخيري',
    purpose: 'حجز موعد',
    status: 'Completed',
    result: 'Booked',
    duration: 4,
    satisfaction: 5,
    notes: 'تم حجز موعد كشف قرنية يوم الأحد القادم صباحاً. المريض مرتاح جداً ومبسوط من الخدمة.',
    followup: 'لا / No',
    isNoShow: false,
    isPending: false,
    isCallback: false,
    purposeDetails: {
      appointmentDate: '2026-10-12',
      appointmentTime: 'صباحي (09:00 - 13:00)',
      visitType: 'كشف جديد'
    },
    sentiment: 'Positive',
    sentimentScore: 0.85,
    submittedBy: 'raghad@experts-care.com',
    qualityRating: 5,
    qualityComment: 'مكالمة ممتازة، استقبال مهني واحترافي وشرح دقيق لموقع العيادة.',
    qualityBy: 'مشرف الجودة الطبية'
  },
  {
    referenceNumber: 'CRM-20261010-0930-0002',
    timestamp: '2026-10-10T09:30:00Z',
    callDate: '2026-10-10',
    callTime: '09:30',
    callType: 'Inbound',
    patientName: 'سارة خالد الشهري',
    mobile: '0509876543',
    branch: 'MAH',
    team: 'Mahayel-A',
    agent: 'مثيله',
    agentEmail: 'mathayel@experts-care.com',
    financial: 'التأمين الصحي - بوبا',
    department: 'DEN',
    doctor: 'د. مروة عبدالله',
    purpose: 'شكوى',
    status: 'Pending',
    result: 'Complaint',
    duration: 8,
    satisfaction: 2,
    notes: 'المريضة تشكو من تأخر موعدها لأكثر من 45 دقيقة بالأمس، وتريد مراجعة فورية.',
    followup: 'نعم / Yes',
    followupDate: '2026-10-11',
    isNoShow: false,
    isPending: true,
    isCallback: true,
    purposeDetails: {
      complaintType: 'تأخير الانتظار',
      complaintDetails: 'انتظرت بالعيادة 45 دقيقة بدون إبلاغ من الاستقبال.'
    },
    sentiment: 'Negative',
    sentimentScore: -0.65,
    submittedBy: 'mathayel@experts-care.com'
  },
  {
    referenceNumber: 'CRM-20261010-0945-0003',
    timestamp: '2026-10-10T09:45:00Z',
    callDate: '2026-10-10',
    callTime: '09:45',
    callType: 'Outbound-Lead',
    patientName: 'فهد إبراهيم الغامدي',
    mobile: '0543322110',
    branch: 'JED',
    team: 'Cairo-A',
    agent: 'كريم اشرف',
    agentEmail: 'kareem.ashraf@experts-care.com',
    financial: 'Cash patient (نقدي)',
    department: 'DEN',
    doctor: 'د. عمرو سلام',
    purpose: 'تأكيد حجز',
    status: 'Completed',
    result: 'Confirmed',
    duration: 3,
    satisfaction: 4,
    notes: 'تم التواصل لتأكيد جلسة زراعة الأسنان، المريض أكد الحضور غداً الساعة 6 مساءً.',
    followup: 'لا / No',
    isNoShow: false,
    isPending: false,
    sentiment: 'Positive',
    sentimentScore: 0.6,
    submittedBy: 'kareem.ashraf@experts-care.com'
  },
  {
    referenceNumber: 'CRM-20261010-1010-0004',
    timestamp: '2026-10-10T10:10:00Z',
    callDate: '2026-10-10',
    callTime: '10:10',
    callType: 'Inbound',
    patientName: 'نورة منصور العتيبي',
    mobile: '0567788990',
    branch: 'JED',
    team: 'Jeddah-A',
    agent: 'شوق عادل',
    agentEmail: 'shawq@experts-care.com',
    financial: 'التأمين الصحي - التعاونية',
    department: 'ENT',
    doctor: 'د. محمد زهران',
    purpose: 'حالة عاجلة',
    status: 'Completed',
    result: 'Booked',
    duration: 6,
    satisfaction: 5,
    notes: 'طفل يعاني من نزيف بالأنف وألم حاد، تم التنسيق مع العيادة لدخول فوري اليوم.',
    followup: 'نعم / Yes',
    followupDate: '2026-10-11',
    isNoShow: false,
    isPending: false,
    purposeDetails: {
      urgencyLevel: 'عاجل (خلال ساعات)',
      urgentDetails: 'نزيف متكرر وصعوبة تنفس لدى طفل 6 سنوات'
    },
    sentiment: 'Positive',
    sentimentScore: 0.5,
    submittedBy: 'shawq@experts-care.com',
    qualityRating: 5,
    qualityComment: 'تعامل سريع وممتاز مع الحالة الحرجة وتوجيه سليم للطوارئ.',
    qualityBy: 'محمد عاصم'
  },
  {
    referenceNumber: 'CRM-20261010-1035-0005',
    timestamp: '2026-10-10T10:35:00Z',
    callDate: '2026-10-10',
    callTime: '10:35',
    callType: 'Inbound',
    patientName: 'محمد ناصر العسيري',
    mobile: '0531122445',
    branch: 'MAH',
    team: 'Cairo-A',
    agent: 'احمد سراج',
    agentEmail: 'ahmed.serag@experts-care.com',
    financial: 'Cash patient (نقدي)',
    department: 'SUR',
    doctor: 'د. علي الشيبا',
    purpose: 'طلب إعادة اتصال',
    status: 'Pending',
    result: 'AwaitingReply',
    duration: 3,
    notes: 'يطلب معاودة الاتصال لمعرفة مواعيد مناظير الجهاز الهضمي والعمليات البسيطة.',
    followup: 'نعم / Yes',
    followupDate: '2026-10-10',
    isNoShow: false,
    isPending: true,
    isCallback: true,
    purposeDetails: {
      callbackDate: '2026-10-10',
      callbackTime: 'مساءً (18:00)'
    },
    sentiment: 'Neutral',
    sentimentScore: 0.1,
    submittedBy: 'ahmed.serag@experts-care.com'
  }
];

export const INITIAL_CALLBACKS: CallbackQueueItem[] = [
  {
    callbackId: 'CB001',
    createdAt: '2026-10-10T09:30:00Z',
    dueDate: '2026-10-10',
    dueTime: '12:00',
    patient: 'سارة خالد الشهري',
    mobile: '0509876543',
    agent: 'مثيله',
    agentEmail: 'mathayel@experts-care.com',
    branch: 'MAH',
    team: 'Mahayel-A',
    purpose: 'شكوى - متابعة تأخير الانتظار',
    priority: 'high',
    referenceNumber: 'CRM-20261010-0930-0002',
    status: 'pending',
    notes: 'متابعة مع المدير الطبي لحل شكوى تأخير الكشف.',
    postponedCount: 0
  },
  {
    callbackId: 'CB002',
    createdAt: '2026-10-10T10:35:00Z',
    dueDate: '2026-10-10',
    dueTime: '18:00',
    patient: 'محمد ناصر العسيري',
    mobile: '0531122445',
    agent: 'احمد سراج',
    agentEmail: 'ahmed.serag@experts-care.com',
    branch: 'MAH',
    team: 'Cairo-A',
    purpose: 'طلب إعادة اتصال - استفسار عن مواعيد الجراحة',
    priority: 'normal',
    referenceNumber: 'CRM-20261010-1035-0005',
    status: 'pending',
    notes: 'إعادة الاتصال بالمساء لتزويد المريض بجدول مواعيد د. علي الشيبا.',
    postponedCount: 0
  },
  {
    callbackId: 'CB003',
    createdAt: '2026-10-09T14:00:00Z',
    dueDate: '2026-10-09',
    dueTime: '16:00',
    patient: 'تركي بن عبدالعزيز الزهراني',
    mobile: '0555544332',
    agent: 'رغد عمر',
    agentEmail: 'raghad@experts-care.com',
    branch: 'JED',
    team: 'Jeddah-A',
    purpose: 'استفسار عن نتائج تحاليل الغدد',
    priority: 'high',
    referenceNumber: 'CRM-20261009-1400-0089',
    status: 'pending',
    notes: 'تأخر الرد على المريض بخصوص النتائج - متأخر عن الموعد!',
    postponedCount: 1
  }
];

export const INITIAL_QUALITY_REVIEWS: QualityReviewItem[] = [
  {
    reviewId: 'QR001',
    createdAt: '2026-10-10T10:00:00Z',
    referenceNumber: 'CRM-20261010-0915-0001',
    agent: 'رغد عمر',
    agentEmail: 'raghad@experts-care.com',
    branch: 'JED',
    team: 'Jeddah-A',
    callDuration: 4,
    qualityRating: 5,
    qualityComment: 'أداء متميز في الترحيب وشرح مواعيد د. علي الخيري والتأكيد على تعليمات فحص قاع العين.',
    qualityBy: 'مشرف الجودة الطبية',
    qualityByEmail: 'quality@experts-care.com',
    status: 'closed',
    agentReply: 'شكراً جزيلاً لحضرتك، دائماً نسعى لتقديم الأفضل للمرضى.',
    agentReplyAt: '2026-10-10T10:20:00Z',
    repliedBy: 'رغد عمر',
    commentType: 'quality'
  },
  {
    reviewId: 'TL001',
    createdAt: '2026-10-10T10:45:00Z',
    referenceNumber: 'CRM-20261010-1010-0004',
    agent: 'شوق عادل',
    agentEmail: 'shawq@experts-care.com',
    branch: 'JED',
    team: 'Jeddah-A',
    callDuration: 6,
    qualityRating: 5,
    qualityComment: 'تصرف سريع وممتاز جداً، حرصتي على طمأنة الأم وتوجيه الحالة فوراً لعيادة د. زهران.',
    qualityBy: 'محمد عاصم',
    qualityByEmail: 'mohamed.asem@experts-care.com',
    status: 'open',
    commentType: 'teamlead'
  }
];

export const INITIAL_PATIENTS: Patient[] = [
  {
    patientId: 'P0001',
    mobile: '0551234567',
    name: 'عبدالله بن سعد القرني',
    lastVisit: '2026-10-10T09:15:00Z',
    lastDoctor: 'د. علي الخيري',
    lastBranch: 'JED',
    visitCount: 6,
    notes: 'مريض دائم بعيادات العيون وجراحة القرنية. VIP',
    createdAt: '2024-03-15T10:00:00Z',
    hasComplaints: false
  },
  {
    patientId: 'P0002',
    mobile: '0509876543',
    name: 'سارة خالد الشهري',
    lastVisit: '2026-10-10T09:30:00Z',
    lastDoctor: 'د. مروة عبدالله',
    lastBranch: 'MAH',
    visitCount: 3,
    notes: 'لديها شكوى سابقة عن وقت الانتظار. يرجى الاهتمام والمتابعة الدقيقة.',
    createdAt: '2025-01-20T12:00:00Z',
    hasComplaints: true
  },
  {
    patientId: 'P0003',
    mobile: '0543322110',
    name: 'فهد إبراهيم الغامدي',
    lastVisit: '2026-10-10T09:45:00Z',
    lastDoctor: 'د. عمرو سلام',
    lastBranch: 'JED',
    visitCount: 4,
    notes: 'متابع لحالات زراعة الأسنان واللثة.',
    createdAt: '2024-08-11T11:00:00Z',
    hasComplaints: false
  },
  {
    patientId: 'P0004',
    mobile: '0567788990',
    name: 'نورة منصور العتيبي',
    lastVisit: '2026-10-10T10:10:00Z',
    lastDoctor: 'د. محمد زهران',
    lastBranch: 'JED',
    visitCount: 2,
    notes: 'مراجعة أطفال الأنف والأذن والحنجرة.',
    createdAt: '2026-02-14T09:30:00Z',
    hasComplaints: false
  },
  {
    patientId: 'P0005',
    mobile: '0531122445',
    name: 'محمد ناصر العسيري',
    lastVisit: '2026-10-10T10:35:00Z',
    lastDoctor: 'د. علي الشيبا',
    lastBranch: 'MAH',
    visitCount: 5,
    notes: 'متابع جراحة عامة ومناظير جهاز هضمي. VIP',
    createdAt: '2024-06-01T08:00:00Z',
    hasComplaints: false
  },
  {
    patientId: 'P0006',
    mobile: '0555544332',
    name: 'تركي بن عبدالعزيز الزهراني',
    lastVisit: '2026-10-09T14:00:00Z',
    lastDoctor: 'د. فهد الشهري',
    lastBranch: 'JED',
    visitCount: 7,
    notes: 'متابع سكري وغدد صماء وباطنية. VIP مع شكوى سابقة لتأخر التحاليل.',
    createdAt: '2023-11-19T10:00:00Z',
    hasComplaints: true
  },
  {
    patientId: 'P0007',
    mobile: '0501122334',
    name: 'منى بنت سالم الدوسري',
    lastVisit: '2026-10-08T16:20:00Z',
    lastDoctor: 'د. دلال الشربتلي',
    lastBranch: 'JED',
    visitCount: 2,
    notes: 'متابعة حساسية الأنف والجيوب الأنفية.',
    createdAt: '2026-05-12T11:00:00Z',
    hasComplaints: false
  },
  {
    patientId: 'P0008',
    mobile: '0569988776',
    name: 'خالد بن يحيى عسيري',
    lastVisit: '2026-10-07T11:15:00Z',
    lastDoctor: 'د. ياسر النجار',
    lastBranch: 'MAH',
    visitCount: 1,
    notes: 'مريض جديد كشف أسنان وحشو تجميلي.',
    createdAt: '2026-10-07T11:15:00Z',
    hasComplaints: false
  },
  {
    patientId: 'P0009',
    mobile: '0547788991',
    name: 'ريم عبدالعزيز المالكي',
    lastVisit: '2026-10-05T18:40:00Z',
    lastDoctor: 'د. يحيى العرقبي',
    lastBranch: 'JED',
    visitCount: 8,
    notes: 'مريضة جلدية وليزر مستمرة. VIP',
    createdAt: '2023-09-01T09:00:00Z',
    hasComplaints: false
  },
  {
    patientId: 'P0010',
    mobile: '0533344556',
    name: 'سلطان بن حمد القحطاني',
    lastVisit: '2026-10-04T12:30:00Z',
    lastDoctor: 'د. خالد عويضة',
    lastBranch: 'MAH',
    visitCount: 3,
    notes: 'متابع باطنية وفحوصات دورية.',
    createdAt: '2025-04-10T14:00:00Z',
    hasComplaints: false
  }
];

export const INITIAL_ALERTS: InAppAlert[] = [
  {
    alertId: 'AL001',
    createdAt: '2026-10-10T09:30:00Z',
    recipientEmail: 'mathayel@experts-care.com',
    recipientName: 'مثيله',
    alertType: 'callback_due',
    title: '📞 Callback مستحق الآن',
    message: 'حان موعد الاتصال بالمريضة سارة خالد الشهري (شكوى تأخير).',
    referenceNumber: 'CRM-20261010-0930-0002',
    callbackId: 'CB001',
    priority: 'high',
    isRead: false
  },
  {
    alertId: 'AL002',
    createdAt: '2026-10-10T10:00:00Z',
    recipientEmail: 'raghad@experts-care.com',
    recipientName: 'رغد عمر',
    alertType: 'quality_comment',
    title: '⭐ تعليق كواليتي جديد (5 نجوم)',
    message: 'تم إضافة تقييم إيجابي على مكالمتك CRM-20261010-0915-0001 بواسطة مشرف الجودة.',
    referenceNumber: 'CRM-20261010-0915-0001',
    qualityReviewId: 'QR001',
    priority: 'normal',
    isRead: false
  },
  {
    alertId: 'AL003',
    createdAt: '2026-10-09T18:00:00Z',
    recipientEmail: 'raghad@experts-care.com',
    recipientName: 'رغد عمر',
    alertType: 'sla_breach',
    title: '⏰ تنبيه تجاوز SLA',
    message: 'حالة تركي الزهراني تجاوزت المدة المحددة لـ Callback (أكثر من 4 ساعات).',
    referenceNumber: 'CRM-20261009-1400-0089',
    callbackId: 'CB003',
    priority: 'high',
    isRead: false
  }
];
