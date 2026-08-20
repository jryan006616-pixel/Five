import {
  User,
  Employee,
  AttendanceRecord,
  KPIRecord,
  SalaryRecord,
  SalaryDeduction,
  Payslip,
  AttendancePolicy,
  NotificationItem,
  AuditLogItem,
  Department,
  Designation,
  CompanyTask,
} from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'USR-ADMIN-01',
    username: 'admin',
    password: 'Admin@123',
    role: 'admin',
    employeeId: 'ADM-001',
    email: 'admin@rhinomds.com',
    fullName: 'System Administrator',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    lastLogin: '2026-08-20 09:00 PKT',
    accountStatus: 'Active',
    assignedBy: 'System Root',
    passwordUpdatedAt: '2026-08-20',
  }
];

export const INITIAL_EMPLOYEES: Employee[] = [];

export const INITIAL_DEPARTMENTS: Department[] = [
  {
    id: 'DEP-01',
    name: 'Medical Billing',
    code: 'MB',
    lead: 'Department Head',
    employeeCount: 0,
    description: 'Claim generation, charge entry, electronic submission to US payers & denial triage.',
  },
  {
    id: 'DEP-02',
    name: 'Medical Coding',
    code: 'MC',
    lead: 'Department Head',
    employeeCount: 0,
    description: 'ICD-10-CM, CPT-4, HCPCS Level II clinical coding audits & chart reviews.',
  },
  {
    id: 'DEP-03',
    name: 'Credentialing',
    code: 'CRD',
    lead: 'Department Head',
    employeeCount: 0,
    description: 'Provider enrollment with Medicare, Medicaid, and commercial healthcare insurance networks.',
  },
  {
    id: 'DEP-04',
    name: 'AR Follow-up',
    code: 'AR',
    lead: 'Department Head',
    employeeCount: 0,
    description: 'Payer follow-ups, appeals, unresolved aging claims > 60 days resolution.',
  },
  {
    id: 'DEP-05',
    name: 'Prior Authorization',
    code: 'PA',
    lead: 'Department Head',
    employeeCount: 0,
    description: 'Insurance pre-authorizations, medical necessity protocols, doctor-payer coordination.',
  },
  {
    id: 'DEP-06',
    name: 'Operations & QA',
    code: 'OPS',
    lead: 'Department Head',
    employeeCount: 0,
    description: 'Workflow optimization, HIPAA compliance audits, data analytics and client reporting.',
  },
  {
    id: 'DEP-07',
    name: 'HR & Admin',
    code: 'HR',
    lead: 'System Administrator',
    employeeCount: 0,
    description: 'Talent management, payroll disbursements, shift scheduling, and company policy governance.',
  },
  {
    id: 'DEP-08',
    name: 'IT Support & Security',
    code: 'IT',
    lead: 'Department Head',
    employeeCount: 0,
    description: 'HIPAA-compliant secure VPN infrastructure, EHR integration bridges, and cyber protection.',
  }
];

export const INITIAL_DESIGNATIONS: Designation[] = [
  { id: 'DES-01', title: 'Director of HR & Global Operations', departmentId: 'DEP-07', departmentName: 'HR & Admin', level: 'Executive', baseSalaryRange: '250,000 - 350,000 RS' },
  { id: 'DES-02', title: 'Senior Medical Billing Specialist', departmentId: 'DEP-01', departmentName: 'Medical Billing', level: 'Senior Tier II', baseSalaryRange: '110,000 - 150,000 RS' },
  { id: 'DES-03', title: 'Medical Billing Officer', departmentId: 'DEP-01', departmentName: 'Medical Billing', level: 'Junior Tier I', baseSalaryRange: '75,000 - 100,000 RS' },
  { id: 'DES-04', title: 'Certified Medical Coder (CPC)', departmentId: 'DEP-02', departmentName: 'Medical Coding', level: 'Mid Tier', baseSalaryRange: '90,000 - 130,000 RS' },
  { id: 'DES-05', title: 'Accounts Receivable (AR) Specialist', departmentId: 'DEP-04', departmentName: 'AR Follow-up', level: 'Mid Tier', baseSalaryRange: '80,000 - 110,000 RS' },
  { id: 'DES-06', title: 'Provider Credentialing Specialist', departmentId: 'DEP-03', departmentName: 'Credentialing', level: 'Mid Tier', baseSalaryRange: '95,000 - 125,000 RS' },
  { id: 'DES-07', title: 'Prior Authorization Officer', departmentId: 'DEP-05', departmentName: 'Prior Authorization', level: 'Mid Tier', baseSalaryRange: '85,000 - 115,000 RS' },
  { id: 'DES-08', title: 'Quality Assurance Auditor', departmentId: 'DEP-06', departmentName: 'Operations & QA', level: 'Senior Tier', baseSalaryRange: '120,000 - 160,000 RS' }
];

export const DEFAULT_ATTENDANCE_POLICY: AttendancePolicy = {
  id: 'POL-RMD-01',
  name: 'Rhinomds Enterprise RCM Attendance & Shift Policy',
  standardDailyHours: 9,
  requiredDailyMinutes: 480,
  breakAllowanceMinutes: 60,
  maxSingleBreakMinutes: 45,
  lateArrivalThresholdMinutes: 15,
  earlyDepartureThresholdMinutes: 30,
  overtimeRules: {
    minimumMinutesForOvertime: 60,
    rateMultiplier: 1.5,
  },
  workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  gracePeriodMinutes: 15,
  weekendRules: 'Standard US Billing Team Weekend: Saturday and Sunday off (US market sync). Emergency on-call roster applicable.',
  holidayRules: 'US Federal Holidays observed along with official Pakistan national holidays for offshore operations.',
  shiftType: 'US Night Shift (06:00 PM to 03:00 AM PKT / 08:00 AM to 05:00 PM EST)',
  lastUpdated: '2026-08-20',
  updatedBy: 'System Administrator',
};

export const INITIAL_ATTENDANCE_RECORDS: AttendanceRecord[] = [];

export const INITIAL_KPI_RECORDS: KPIRecord[] = [];

export const INITIAL_SALARY_RECORDS: SalaryRecord[] = [];

export const INITIAL_DEDUCTIONS: SalaryDeduction[] = [];

export const INITIAL_PAYSLIPS: Payslip[] = [];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'NOTIF-01',
    targetUserId: 'all',
    title: 'Portal Ready for Production Data',
    message: 'All demo accounts and mock figures have been cleared. You can now onboard employees, set up shifts, and configure custom payroll.',
    createdAt: '2026-08-20 09:00 PKT',
    read: false,
    type: 'announcement',
  }
];

export const INITIAL_AUDIT_LOGS: AuditLogItem[] = [
  {
    id: 'LOG-001',
    action: 'Demo Data Purged & System Initialized',
    adminName: 'System Administrator',
    adminId: 'ADM-001',
    affectedEmployeeName: 'Organization Master',
    affectedEmployeeId: 'ADM-001',
    details: 'System initialized with clean slate. Ready for custom workforce and company metrics.',
    timestamp: '2026-08-20 09:00 PKT',
    category: 'Authentication',
  }
];

export const INITIAL_COMPANY_TASKS: CompanyTask[] = [];
