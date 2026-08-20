export type UserRole = 'admin' | 'employee';

export type EmploymentStatus = 
  | 'Active' 
  | 'Probation' 
  | 'Confirmed' 
  | 'On Leave' 
  | 'Suspended' 
  | 'Resigned' 
  | 'Terminated' 
  | 'Inactive';

export type ProbationStatus = 
  | 'Probation' 
  | 'Probation Ending Soon' 
  | 'Probation Completed' 
  | 'Probation Cleared' 
  | 'Probation Extended';

export type AttendanceStatus = 
  | 'Present' 
  | 'Late' 
  | 'Half Day' 
  | 'On Leave' 
  | 'Absent' 
  | 'Holiday' 
  | 'Weekend';

export type BreakCategory = 
  | 'Lunch / Dinner Break' 
  | 'Tea / Coffee Break' 
  | 'Workstation Rest' 
  | 'Emergency / Outside';

export type DeductionType = 
  | 'Late Arrival Deduction' 
  | 'Unpaid Leave' 
  | 'Policy Violation' 
  | 'Advance Salary' 
  | 'Tax / Statutory' 
  | 'Other Approved Deduction';

export type BonusStatus = 'Approved' | 'Pending' | 'Under Review' | 'Adjusted';

export interface User {
  id: string;
  username: string;
  password: string; // Specific password assigned/managed by HR Admin
  role: UserRole;
  employeeId: string;
  email: string;
  avatar?: string;
  fullName: string;
  lastLogin?: string;
  accountStatus?: 'Active' | 'Suspended' | 'Locked';
  assignedBy?: string;
  passwordUpdatedAt?: string;
  mustChangePassword?: boolean;
}

export interface BreakRecord {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm:ss
  endTime: string | null; // HH:mm:ss
  durationMinutes: number;
  category: BreakCategory;
  reason?: string;
  flaggedExcessive: boolean; // Flagged if exceeds max policy duration (e.g. > 45 mins)
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  checkInTime: string | null; // HH:mm:ss
  checkOutTime: string | null; // HH:mm:ss
  breaks: BreakRecord[];
  totalBreakMinutes: number;
  totalWorkingMinutes: number; // (checkOut - checkIn) - totalBreakMinutes
  isLate: boolean;
  lateMinutes: number;
  isEarlyDeparture: boolean;
  earlyDepartureMinutes: number;
  overtimeMinutes: number;
  status: AttendanceStatus;
  notes?: string;
}

export interface KPIRecord {
  id: string;
  employeeId: string;
  month: string; // "August 2026"
  year: number;
  kpiScore: number; // e.g. 94 (percentage)
  claimsProcessed?: number;
  accuracyRate?: number; // e.g. 99.2%
  performanceRemarks: string;
  bonusAmount: number; // e.g. 15000 RS
  bonusStatus: BonusStatus;
  bonusReason: string;
  reviewedBy: string;
  reviewedDate: string;
}

export interface SalaryDeduction {
  id: string;
  employeeId: string;
  month: string; // "August 2026"
  amount: number; // in RS
  deductionType: DeductionType;
  date: string; // YYYY-MM-DD
  reason: string; // Crucial transparency
  remarks?: string;
  status: 'Applied' | 'Waived' | 'Pending';
  addedBy: string;
}

export interface SalaryRecord {
  id: string;
  employeeId: string;
  month: string; // "August 2026"
  year: number;
  baseSalary: number; // in RS
  bonus: number; // in RS
  otherEarnings: number; // Overtime, allowances, shift differential
  otherEarningsBreakdown?: { label: string; amount: number }[];
  grossSalary: number; // base + bonus + other
  deductions: SalaryDeduction[];
  totalDeductions: number;
  netSalary: number; // gross - deductions
  currency: string; // 'RS' or 'PKR'
  effectiveDate: string;
  paymentFrequency: 'Monthly' | 'Bi-Weekly';
  paymentStatus: 'Paid' | 'Processing' | 'Generated';
  paidDate?: string;
  remarks?: string;
}

export interface Payslip {
  id: string;
  payslipNumber: string; // e.g. "RMD-PAY-2026-08-1001"
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  designation: string;
  department: string;
  dateOfJoining: string;
  salaryMonth: string;
  year: number;
  baseSalary: number;
  bonus: number;
  otherEarnings: number;
  grossSalary: number;
  deductionsList: {
    type: string;
    amount: number;
    reason: string;
  }[];
  totalDeductions: number;
  netSalary: number;
  currency: string;
  paymentDate: string;
  authorizedBy: string;
  generatedAt: string;
  notes?: string;
}

export interface Employee {
  id: string; // "EMP-1001"
  userId: string;
  // Personal Info
  fullName: string;
  profilePhoto: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Other';
  email: string;
  phone: string;
  address: string;
  emergencyContact: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
  
  // Employment Info
  designation: string;
  department: string;
  dateOfJoining: string; // YYYY-MM-DD
  employmentStatus: EmploymentStatus;
  employmentType: 'Full-time' | 'Contract' | 'Night Shift - US Timing' | 'Hybrid';
  reportingManager: string;
  workLocation: string; // "Karachi RCM Operations Center / Houston HQ Support"
  shiftTiming: string; // "06:00 PM - 03:00 AM PKT (US EST Shift)"
  
  // Probation Info (3 months rule)
  probationEndDate: string; // Date of Joining + 3 Months
  probationStatus: ProbationStatus;
  probationRemarks?: string;
  probationReviewedBy?: string;
  
  // Compensation Info
  monthlySalary: number; // in RS
  currentBonus: number;
  currentDeductions: number;
  salaryEffectiveDate: string;
  paymentFrequency: 'Monthly';
  bankAccountNumber?: string;
  bankName?: string;
  
  accountStatus: 'Active' | 'Inactive' | 'Suspended';
}

export interface AttendancePolicy {
  id: string;
  name: string;
  standardDailyHours: number; // 9 hours
  requiredDailyMinutes: number; // 540 min
  breakAllowanceMinutes: number; // 60 min total
  maxSingleBreakMinutes: number; // 45 min
  lateArrivalThresholdMinutes: number; // 15 min grace period
  earlyDepartureThresholdMinutes: number; // 30 min
  overtimeRules: {
    minimumMinutesForOvertime: number; // 60 min
    rateMultiplier: number; // 1.5x
  };
  workingDays: string[]; // ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  gracePeriodMinutes: number;
  weekendRules: string;
  holidayRules: string;
  shiftType: string;
  lastUpdated: string;
  updatedBy: string;
}

export interface NotificationItem {
  id: string;
  targetUserId: string; // Specific userId or 'all'
  title: string;
  message: string;
  type: 'salary' | 'payslip' | 'bonus' | 'deduction' | 'announcement' | 'probation' | 'attendance';
  read: boolean;
  createdAt: string;
  linkTab?: string;
}

export interface AuditLogItem {
  id: string;
  action: string;
  adminName: string;
  adminId: string;
  affectedEmployeeName: string;
  affectedEmployeeId: string;
  details: string;
  timestamp: string;
  category: 'Salary' | 'Bonus' | 'Deduction' | 'Employee' | 'Attendance' | 'Policy' | 'Payslip' | 'Probation' | 'Authentication';
}

export interface Department {
  id: string;
  name: string;
  code: string;
  lead: string;
  employeeCount: number;
  description: string;
}

export interface Designation {
  id: string;
  title: string;
  departmentId: string;
  departmentName: string;
  level: string;
  baseSalaryRange: string;
}

export interface CompanyTask {
  id: string;
  title: string;
  category: string;
  timeSlot?: string;
  dueDate?: string;
  completed: boolean;
  assignedTo?: string;
  createdAt: string;
  photoUrl?: string;
}
