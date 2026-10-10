export interface Branch {
  code: string;
  nameAr: string;
  nameEn: string;
  city: string;
  region: string;
  phone?: string;
  whatsApp?: string;
  email: string;
  addressAr?: string;
  addressEn?: string;
  logoUrl?: string;
  active: boolean;
}

export interface Team {
  code: string;
  nameAr: string;
  nameEn: string;
  location: string;
  servesBranches: string[];
  supervisorId: string;
  active: boolean;
  notes?: string;
}

export interface Department {
  code: string;
  nameAr: string;
  nameEn: string;
  branchCode: string;
  specialty: string;
  active: boolean;
}

export interface Doctor {
  id: string;
  nameAr: string;
  nameEn: string;
  branchCode: string;
  deptCode: string;
  specialty: string;
  language: string;
  gender: string;
  consultationFee?: number | string;
  active: boolean;
  notes?: string;
}

export interface Agent {
  id: string;
  name: string;
  teamCode: string;
  supervisorId: string;
  targetDaily: number;
  email: string;
  phone?: string;
  active: boolean;
  notes?: string;
}

export interface User {
  email: string;
  name: string;
  pin: string;
  role: 'admin' | 'manager' | 'supervisor' | 'agent' | 'viewer' | 'quality' | 'agent-quality' | 'team-lead';
  branch: string;
  team: string;
  active: boolean;
  lastLogin?: string;
  canEditCalls: boolean;
}

export interface Purpose {
  code: string;
  name: string;
  nameEn: string;
  category: string;
  requiresDetails: boolean;
  active: boolean;
}

export interface PurposeField {
  purposeCode: string;
  fieldKey: string;
  fieldLabelAr: string;
  fieldLabelEn: string;
  fieldType: 'text' | 'date' | 'select' | 'number';
  isRequired: boolean;
  options?: string[];
  order: number;
}

export interface CallRecord {
  referenceNumber: string;
  timestamp: string;
  callDate: string;
  callTime: string;
  callType: 'Inbound' | 'Outbound' | 'Outbound-Lead' | 'NoShow';
  patientName: string;
  mobile: string;
  branch: string;
  team: string;
  agent: string;
  agentEmail?: string;
  financial: string;
  department: string;
  doctor: string;
  purpose: string;
  status: 'Completed' | 'Pending' | 'NoAnswer' | 'Cancelled';
  result: 'Booked' | 'Confirmed' | 'Inquiry' | 'Complaint' | 'AwaitingReply' | 'CancelBooking' | 'FollowUp' | 'Closed';
  duration: number; // minutes
  satisfaction?: number; // 1-5
  notes?: string;
  followup?: string;
  followupDate?: string;
  isNoShow?: boolean;
  isPending?: boolean;
  isCallback?: boolean;
  purposeDetails?: Record<string, string>;
  sentiment?: 'Positive' | 'Neutral' | 'Negative' | 'Mixed';
  sentimentScore?: number;
  qualityRating?: number;
  qualityComment?: string;
  qualityBy?: string;
  qualityAt?: string;
  qualityAgentReply?: string;
  qualityAgentReplyAt?: string;
  submittedBy?: string;
  updatedAt?: string;
}

export interface EditHistoryEntry {
  editId: string;
  editedAt: string;
  referenceNumber: string;
  editedBy: string;
  editedByName: string;
  editedByRole: string;
  fieldChanged: string;
  fieldLabelAr: string;
  oldValue: string;
  newValue: string;
  note?: string;
  branch?: string;
  agent?: string;
}

export interface CallbackQueueItem {
  callbackId: string;
  createdAt: string;
  dueDate: string;
  dueTime: string;
  patient: string;
  mobile: string;
  agent: string;
  agentEmail?: string;
  branch: string;
  team: string;
  purpose: string;
  priority: 'normal' | 'high';
  referenceNumber: string;
  status: 'pending' | 'completed' | 'cancelled';
  notes?: string;
  completedAt?: string;
  completedBy?: string;
  postponedCount: number;
}

export interface QualityReviewItem {
  reviewId: string;
  createdAt: string;
  referenceNumber: string;
  agent: string;
  agentEmail?: string;
  branch: string;
  team: string;
  callDuration?: string | number;
  qualityRating: number;
  qualityComment: string;
  qualityBy: string;
  qualityByEmail?: string;
  status: 'open' | 'closed';
  agentReply?: string;
  agentReplyAt?: string;
  repliedBy?: string;
  commentType: 'quality' | 'teamlead';
}

export interface InAppAlert {
  alertId: string;
  createdAt: string;
  recipientEmail: string;
  recipientName: string;
  alertType: 'callback_due' | 'callback_overdue' | 'quality_comment' | 'quality_reply' | 'teamlead_comment' | 'teamlead_reply' | 'sla_breach' | 'system';
  title: string;
  message: string;
  referenceNumber?: string;
  callbackId?: string;
  qualityReviewId?: string;
  priority: 'normal' | 'high';
  isRead: boolean;
}

export interface Patient {
  patientId: string;
  mobile: string;
  name: string;
  lastVisit?: string;
  lastDoctor?: string;
  lastBranch?: string;
  visitCount: number;
  notes?: string;
  createdAt?: string;
  hasComplaints?: boolean;
}

export interface SLARule {
  code: string;
  metric: string;
  targetValue: string;
  targetUnit: string;
  description: string;
  active: boolean;
}
