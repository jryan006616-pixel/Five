import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User,
  UserRole,
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
  BreakCategory,
  ProbationStatus,
  EmploymentStatus,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_EMPLOYEES,
  INITIAL_ATTENDANCE_RECORDS,
  INITIAL_KPI_RECORDS,
  INITIAL_DEDUCTIONS,
  INITIAL_SALARY_RECORDS,
  INITIAL_PAYSLIPS,
  DEFAULT_ATTENDANCE_POLICY,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_DEPARTMENTS,
  INITIAL_DESIGNATIONS,
} from '../data/mockData';

interface AppContextType {
  currentUser: User | null;
  currentEmployee: Employee | null;
  allUsers: User[];
  allEmployees: Employee[];
  attendanceRecords: AttendanceRecord[];
  kpiRecords: KPIRecord[];
  salaryRecords: SalaryRecord[];
  deductions: SalaryDeduction[];
  payslips: Payslip[];
  policy: AttendancePolicy;
  notifications: NotificationItem[];
  auditLogs: AuditLogItem[];
  departments: Department[];
  designations: Designation[];
  
  // Navigation & View
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedEmployeeForDetail: Employee | null;
  setSelectedEmployeeForDetail: (emp: Employee | null) => void;
  selectedPayslipForModal: Payslip | null;
  setSelectedPayslipForModal: (ps: Payslip | null) => void;

  // Authentication & Switcher
  login: (username: string, pass: string) => { success: boolean; error?: string };
  adminUpdateUserCredentials: (
    userId: string,
    newUsername: string,
    newPassword: string,
    role: UserRole,
    accountStatus?: 'Active' | 'Suspended' | 'Locked'
  ) => void;
  adminResetPassword: (userId: string, customPassword?: string) => string;
  adminCreateUserAccount: (
    employeeId: string,
    username: string,
    password: string,
    role: UserRole
  ) => User;
  updateOwnPassword: (currentPass: string, newPass: string) => { success: boolean; error?: string };
  quickSwitchUser: (userId: string) => void;
  logout: () => void;

  // Authorization helper
  canAccessEmployeeData: (targetEmployeeId: string) => boolean;

  // Attendance & Breaks
  checkIn: (employeeId?: string) => void;
  startBreak: (category: BreakCategory, reason?: string, employeeId?: string) => void;
  endBreak: (employeeId?: string) => void;
  checkOut: (employeeId?: string) => void;
  getActiveBreak: (employeeId: string) => { startTime: string; category: BreakCategory; elapsedMinutes: number } | null;
  getTodayAttendance: (employeeId: string) => AttendanceRecord | undefined;

  // Admin Actions
  addEmployee: (
    emp: Partial<Employee>,
    initialSalary?: number,
    customCredentials?: { username?: string; password?: string; role?: UserRole }
  ) => void;
  updateEmployee: (emp: Employee) => void;
  deleteEmployee: (employeeId: string) => void;
  updateProbationStatus: (employeeId: string, status: ProbationStatus, remarks?: string) => void;
  addOrUpdateKPI: (kpi: Omit<KPIRecord, 'id'>) => void;
  addDeduction: (deduction: Omit<SalaryDeduction, 'id'>) => void;
  adjustSalary: (employeeId: string, baseSalary: number, bonus: number, otherEarnings: number, month?: string) => void;
  generatePayslip: (employeeId: string, month: string, year: number) => Payslip | null;
  updatePolicy: (newPolicy: AttendancePolicy) => void;
  sendAnnouncement: (title: string, message: string) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  resetToDefaults: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'rhinomds_portal_v4_clean_production';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize state with persistence
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* use default */ }
    }
    return INITIAL_USERS[0]; // Default to Admin for full administrative access
  });

  const [allUsers, setAllUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [allEmployees, setAllEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_employees');
    return saved ? JSON.parse(saved) : INITIAL_EMPLOYEES;
  });

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_attendance');
    return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE_RECORDS;
  });

  const [kpiRecords, setKpiRecords] = useState<KPIRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_kpi');
    return saved ? JSON.parse(saved) : INITIAL_KPI_RECORDS;
  });

  const [salaryRecords, setSalaryRecords] = useState<SalaryRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_salaries');
    return saved ? JSON.parse(saved) : INITIAL_SALARY_RECORDS;
  });

  const [deductions, setDeductions] = useState<SalaryDeduction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_deductions');
    return saved ? JSON.parse(saved) : INITIAL_DEDUCTIONS;
  });

  const [payslips, setPayslips] = useState<Payslip[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_payslips');
    return saved ? JSON.parse(saved) : INITIAL_PAYSLIPS;
  });

  const [policy, setPolicy] = useState<AttendancePolicy>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_policy');
    return saved ? JSON.parse(saved) : DEFAULT_ATTENDANCE_POLICY;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_audit');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [departments, setDepartments] = useState<Department[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_depts');
    return saved ? JSON.parse(saved) : INITIAL_DEPARTMENTS;
  });

  const [designations, setDesignations] = useState<Designation[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_designations');
    return saved ? JSON.parse(saved) : INITIAL_DESIGNATIONS;
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedEmployeeForDetail, setSelectedEmployeeForDetail] = useState<Employee | null>(null);
  const [selectedPayslipForModal, setSelectedPayslipForModal] = useState<Payslip | null>(null);

  // Sync to local storage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEY + '_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEY + '_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_employees', JSON.stringify(allEmployees));
    localStorage.setItem(STORAGE_KEY + '_attendance', JSON.stringify(attendanceRecords));
    localStorage.setItem(STORAGE_KEY + '_kpi', JSON.stringify(kpiRecords));
    localStorage.setItem(STORAGE_KEY + '_salaries', JSON.stringify(salaryRecords));
    localStorage.setItem(STORAGE_KEY + '_deductions', JSON.stringify(deductions));
    localStorage.setItem(STORAGE_KEY + '_payslips', JSON.stringify(payslips));
    localStorage.setItem(STORAGE_KEY + '_policy', JSON.stringify(policy));
    localStorage.setItem(STORAGE_KEY + '_notifications', JSON.stringify(notifications));
    localStorage.setItem(STORAGE_KEY + '_audit', JSON.stringify(auditLogs));
  }, [allEmployees, attendanceRecords, kpiRecords, salaryRecords, deductions, payslips, policy, notifications, auditLogs]);

  // Current Employee object derived from current authenticated user
  const currentEmployee = currentUser 
    ? allEmployees.find(e => e.id === currentUser.employeeId || e.userId === currentUser.id) || null
    : null;

  // Authorization helper
  const canAccessEmployeeData = (targetEmployeeId: string): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    return currentUser.employeeId === targetEmployeeId;
  };

  // Helper to add audit log
  const logAudit = (action: string, affectedName: string, affectedId: string, details: string, category: AuditLogItem['category']) => {
    const adminName = currentUser ? currentUser.fullName : 'System Engine';
    const adminId = currentUser ? currentUser.employeeId : 'SYS';
    const newLog: AuditLogItem = {
      id: `AUD-${Date.now()}`,
      action,
      adminName,
      adminId,
      affectedEmployeeName: affectedName,
      affectedEmployeeId: affectedId,
      details,
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }) + ' PKT (Live)',
      category,
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Auth methods
  const login = (identifier: string, pass: string): { success: boolean; error?: string } => {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = pass.trim();

    // Match by username, email, or employeeId
    const user = allUsers.find(
      u =>
        u.username.toLowerCase() === cleanId ||
        u.email.toLowerCase() === cleanId ||
        u.employeeId.toLowerCase() === cleanId
    );

    if (!user) {
      return {
        success: false,
        error: `No registered account found matching "${identifier}". Check your username/email or contact HR Admin.`,
      };
    }

    if (user.accountStatus === 'Suspended' || user.accountStatus === 'Locked') {
      return {
        success: false,
        error: `This account is currently ${user.accountStatus.toLowerCase()} by HR Admin. Please contact HR.`,
      };
    }

    // Verify Password against Admin-assigned password
    if (user.password !== cleanPass) {
      return {
        success: false,
        error: `Incorrect password for @${user.username}. Password is case-sensitive and assigned by HR Admin.`,
      };
    }

    const updatedUser: User = {
      ...user,
      lastLogin: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' PKT',
    };

    setCurrentUser(updatedUser);
    setAllUsers(prev => prev.map(u => (u.id === user.id ? updatedUser : u)));
    setActiveTab('dashboard');
    return { success: true };
  };

  // Admin Credential Management (Admin assigns/manages usernames and passwords for all users)
  const adminUpdateUserCredentials = (
    userId: string,
    newUsername: string,
    newPassword: string,
    role: UserRole,
    accountStatus: 'Active' | 'Suspended' | 'Locked' = 'Active'
  ) => {
    if (currentUser?.role !== 'admin') return;

    const targetUser = allUsers.find(u => u.id === userId);
    if (!targetUser) return;

    const updatedUser: User = {
      ...targetUser,
      username: newUsername.trim(),
      password: newPassword.trim(),
      role,
      accountStatus,
      assignedBy: `${currentUser.fullName} (HR Admin)`,
      passwordUpdatedAt: new Date().toISOString().split('T')[0],
    };

    setAllUsers(prev => prev.map(u => (u.id === userId ? updatedUser : u)));

    // If updating currently logged in user
    if (currentUser.id === userId) {
      setCurrentUser(updatedUser);
    }

    logAudit(
      'Credentials Updated by Admin',
      targetUser.fullName,
      targetUser.employeeId,
      `HR Admin updated login credentials (Username: @${newUsername}, Role: ${role}, Status: ${accountStatus}, Password reset executed).`,
      'Authentication'
    );
  };

  const adminResetPassword = (userId: string, customPassword?: string): string => {
    if (currentUser?.role !== 'admin') return '';

    const targetUser = allUsers.find(u => u.id === userId);
    if (!targetUser) return '';

    const newPass = customPassword || `Rhino@${Math.floor(1000 + Math.random() * 9000)}`;
    const updatedUser: User = {
      ...targetUser,
      password: newPass,
      assignedBy: `${currentUser.fullName} (HR Admin)`,
      passwordUpdatedAt: new Date().toISOString().split('T')[0],
      mustChangePassword: false,
    };

    setAllUsers(prev => prev.map(u => (u.id === userId ? updatedUser : u)));

    logAudit(
      'Password Reset by Admin',
      targetUser.fullName,
      targetUser.employeeId,
      `HR Admin reset user password for @${targetUser.username}.`,
      'Authentication'
    );

    return newPass;
  };

  const adminCreateUserAccount = (
    employeeId: string,
    username: string,
    password: string,
    role: UserRole
  ): User => {
    const emp = allEmployees.find(e => e.id === employeeId);
    const newUserId = `USR-${employeeId}`;
    const newUser: User = {
      id: newUserId,
      username: username.trim() || `emp.${employeeId.toLowerCase()}`,
      password: password.trim() || `Rhino@${Math.floor(1000 + Math.random() * 9000)}`,
      role,
      employeeId,
      email: emp?.email || `${username}@rhinomds.com`,
      fullName: emp?.fullName || 'Employee Account',
      avatar: emp?.profilePhoto,
      accountStatus: 'Active',
      assignedBy: `${currentUser?.fullName || 'HR Admin'}`,
      passwordUpdatedAt: new Date().toISOString().split('T')[0],
    };

    setAllUsers(prev => {
      const filtered = prev.filter(u => u.employeeId !== employeeId);
      return [...filtered, newUser];
    });

    logAudit(
      'User Account Created',
      newUser.fullName,
      employeeId,
      `HR Admin created sign-in credentials (Username: @${newUser.username}, Role: ${role}).`,
      'Authentication'
    );

    return newUser;
  };

  const updateOwnPassword = (currentPass: string, newPass: string): { success: boolean; error?: string } => {
    if (!currentUser) return { success: false, error: 'Not logged in' };

    const user = allUsers.find(u => u.id === currentUser.id);
    if (!user) return { success: false, error: 'User record not found' };

    if (user.password !== currentPass.trim()) {
      return { success: false, error: 'Current password does not match.' };
    }

    if (newPass.trim().length < 5) {
      return { success: false, error: 'New password must be at least 5 characters long.' };
    }

    const updatedUser: User = {
      ...user,
      password: newPass.trim(),
      passwordUpdatedAt: new Date().toISOString().split('T')[0],
    };

    setCurrentUser(updatedUser);
    setAllUsers(prev => prev.map(u => (u.id === user.id ? updatedUser : u)));

    logAudit(
      'User Changed Password',
      user.fullName,
      user.employeeId,
      `User updated their personal account password.`,
      'Authentication'
    );

    return { success: true };
  };

  const quickSwitchUser = (userId: string) => {
    const user = allUsers.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
      setActiveTab('dashboard');
      setSelectedEmployeeForDetail(null);
    }
  };

  const logout = () => {
    setCurrentUser(null);
  };

  // Helper to get formatted current date/time
  const getTodayDateStr = () => '2026-08-20'; // Current mock application date
  const getCurrentTimeStr = () => {
    const d = new Date();
    return d.toTimeString().split(' ')[0]; // "HH:MM:SS"
  };

  const getTodayAttendance = (employeeId: string): AttendanceRecord | undefined => {
    const today = getTodayDateStr();
    return attendanceRecords.find(a => a.employeeId === employeeId && a.date === today);
  };

  const getActiveBreak = (employeeId: string) => {
    const att = getTodayAttendance(employeeId);
    if (!att || !att.breaks) return null;
    const openBreak = att.breaks.find(b => b.endTime === null);
    if (!openBreak) return null;
    return {
      startTime: openBreak.startTime,
      category: openBreak.category,
      elapsedMinutes: Math.max(1, openBreak.durationMinutes || 5),
    };
  };

  // Live Attendance Operations
  const checkIn = (employeeId?: string) => {
    const targetEmpId = employeeId || currentEmployee?.id;
    if (!targetEmpId) return;

    const today = getTodayDateStr();
    const timeNow = getCurrentTimeStr();
    const existing = attendanceRecords.find(a => a.employeeId === targetEmpId && a.date === today);

    if (existing && existing.checkInTime) {
      return; // Already checked in
    }

    const emp = allEmployees.find(e => e.id === targetEmpId);
    const newRecord: AttendanceRecord = {
      id: `ATT-${today}-${targetEmpId}`,
      employeeId: targetEmpId,
      date: today,
      checkInTime: timeNow,
      checkOutTime: null,
      breaks: [],
      totalBreakMinutes: 0,
      totalWorkingMinutes: 0,
      isLate: false,
      lateMinutes: 0,
      isEarlyDeparture: false,
      earlyDepartureMinutes: 0,
      overtimeMinutes: 0,
      status: 'Present',
      notes: 'Checked in at workstation on schedule.',
    };

    setAttendanceRecords(prev => [newRecord, ...prev.filter(a => !(a.employeeId === targetEmpId && a.date === today))]);

    // Push notification
    const newNotif: NotificationItem = {
      id: `NOTIF-${Date.now()}`,
      targetUserId: emp?.userId || 'all',
      title: 'Shift Check-In Confirmed',
      message: `Checked in successfully at ${timeNow}. Have a productive shift!`,
      type: 'attendance',
      read: false,
      createdAt: `${today} ${timeNow} PKT`,
      linkTab: 'attendance',
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const startBreak = (category: BreakCategory, reason?: string, employeeId?: string) => {
    const targetEmpId = employeeId || currentEmployee?.id;
    if (!targetEmpId) return;

    const today = getTodayDateStr();
    const timeNow = getCurrentTimeStr();
    const att = attendanceRecords.find(a => a.employeeId === targetEmpId && a.date === today);

    if (!att || !att.checkInTime || att.checkOutTime) return;

    // Check if a break is already open
    const openBreak = att.breaks.find(b => b.endTime === null);
    if (openBreak) return;

    const newBreak = {
      id: `BRK-${today}-${targetEmpId}-${att.breaks.length + 1}`,
      employeeId: targetEmpId,
      date: today,
      startTime: timeNow,
      endTime: null,
      durationMinutes: 0,
      category,
      reason: reason || `${category} started`,
      flaggedExcessive: false,
    };

    const updatedAtt: AttendanceRecord = {
      ...att,
      breaks: [...att.breaks, newBreak],
    };

    setAttendanceRecords(prev => prev.map(a => (a.id === att.id ? updatedAtt : a)));
  };

  const endBreak = (employeeId?: string) => {
    const targetEmpId = employeeId || currentEmployee?.id;
    if (!targetEmpId) return;

    const today = getTodayDateStr();
    const timeNow = getCurrentTimeStr();
    const att = attendanceRecords.find(a => a.employeeId === targetEmpId && a.date === today);

    if (!att || !att.breaks) return;

    const openBreakIdx = att.breaks.findIndex(b => b.endTime === null);
    if (openBreakIdx === -1) return;

    const openBreak = att.breaks[openBreakIdx];
    // Calculate duration in minutes (assume approx 25-45 mins if live)
    const duration = Math.floor(Math.random() * 20) + 25; // 25-45 mins simulated
    const flagged = duration > policy.maxSingleBreakMinutes;

    const closedBreak = {
      ...openBreak,
      endTime: timeNow,
      durationMinutes: duration,
      flaggedExcessive: flagged,
    };

    const updatedBreaks = [...att.breaks];
    updatedBreaks[openBreakIdx] = closedBreak;

    const totalBreakMin = updatedBreaks.reduce((acc, b) => acc + (b.durationMinutes || 0), 0);

    const updatedAtt: AttendanceRecord = {
      ...att,
      breaks: updatedBreaks,
      totalBreakMinutes: totalBreakMin,
    };

    setAttendanceRecords(prev => prev.map(a => (a.id === att.id ? updatedAtt : a)));

    if (flagged) {
      logAudit(
        'Excessive Break Flagged',
        allEmployees.find(e => e.id === targetEmpId)?.fullName || targetEmpId,
        targetEmpId,
        `Break duration (${duration} mins) exceeded max single break policy limit (${policy.maxSingleBreakMinutes} mins).`,
        'Attendance'
      );
    }
  };

  const checkOut = (employeeId?: string) => {
    const targetEmpId = employeeId || currentEmployee?.id;
    if (!targetEmpId) return;

    const today = getTodayDateStr();
    const timeNow = getCurrentTimeStr();
    const att = attendanceRecords.find(a => a.employeeId === targetEmpId && a.date === today);

    if (!att || !att.checkInTime || att.checkOutTime) return;

    // End any open break first
    let updatedBreaks = [...att.breaks];
    const openBreakIdx = updatedBreaks.findIndex(b => b.endTime === null);
    if (openBreakIdx !== -1) {
      updatedBreaks[openBreakIdx] = {
        ...updatedBreaks[openBreakIdx],
        endTime: timeNow,
        durationMinutes: 30,
      };
    }

    const totalBreakMin = updatedBreaks.reduce((acc, b) => acc + (b.durationMinutes || 0), 0);
    const calculatedWorkMinutes = Math.max(300, 540 - totalBreakMin); // ~8 hours

    const updatedAtt: AttendanceRecord = {
      ...att,
      checkOutTime: timeNow,
      breaks: updatedBreaks,
      totalBreakMinutes: totalBreakMin,
      totalWorkingMinutes: calculatedWorkMinutes,
      overtimeMinutes: calculatedWorkMinutes > 480 ? calculatedWorkMinutes - 480 : 0,
      notes: 'Shift check-out recorded successfully.',
    };

    setAttendanceRecords(prev => prev.map(a => (a.id === att.id ? updatedAtt : a)));
  };

  // Admin Actions
  const addEmployee = (
    empData: Partial<Employee>,
    initialSalary: number = 90000,
    customCredentials?: { username?: string; password?: string; role?: UserRole }
  ) => {
    if (currentUser?.role !== 'admin') return;

    const newIdNum = allEmployees.length + 1001;
    const newEmpId = `EMP-${newIdNum}`;
    const newUserId = `USR-${newEmpId}`;
    
    // Auto-calculate probation end date: Date of Joining + 3 Months (Mandatory Rule)
    const joinDate = empData.dateOfJoining || '2026-08-20';
    const jDate = new Date(joinDate);
    jDate.setMonth(jDate.getMonth() + 3);
    const probationEndDateStr = jDate.toISOString().split('T')[0];

    const newEmployee: Employee = {
      id: newEmpId,
      userId: newUserId,
      fullName: empData.fullName || 'New Employee',
      profilePhoto: empData.profilePhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
      dateOfBirth: empData.dateOfBirth || '1998-01-01',
      gender: empData.gender || 'Male',
      email: empData.email || `${empData.fullName?.toLowerCase().replace(/\s+/g, '.') || 'emp'}@rhinomds.com`,
      phone: empData.phone || '+92 (300) 000-0000',
      address: empData.address || 'Karachi, Pakistan',
      emergencyContact: empData.emergencyContact || 'Family Member',
      emergencyContactPhone: empData.emergencyContactPhone || '+92 (300) 000-0001',
      emergencyContactRelation: empData.emergencyContactRelation || 'Guardian',
      designation: empData.designation || 'Medical Billing Officer',
      department: empData.department || 'Medical Billing',
      dateOfJoining: joinDate,
      employmentStatus: 'Probation',
      employmentType: empData.employmentType || 'Night Shift - US Timing',
      reportingManager: empData.reportingManager || 'Kamran Haider (RCM Team Lead)',
      workLocation: empData.workLocation || 'Karachi RCM Operations Center',
      shiftTiming: empData.shiftTiming || '06:00 PM - 03:00 AM PKT (US EST Shift)',
      probationEndDate: probationEndDateStr,
      probationStatus: 'Probation',
      probationRemarks: '3-Month initial probation started on joining date.',
      monthlySalary: initialSalary,
      currentBonus: 0,
      currentDeductions: 0,
      salaryEffectiveDate: joinDate,
      paymentFrequency: 'Monthly',
      bankAccountNumber: empData.bankAccountNumber || 'PK00BANK0000000000000000',
      bankName: empData.bankName || 'Meezan Bank Limited',
      accountStatus: 'Active',
    };

    const assignedUsername =
      customCredentials?.username?.trim() ||
      empData.fullName?.toLowerCase().replace(/\s+/g, '.') ||
      `emp.${newIdNum}`;

    const assignedPassword =
      customCredentials?.password?.trim() ||
      `Rhino@${Math.floor(1000 + Math.random() * 9000)}`;

    const assignedRole: UserRole = customCredentials?.role || 'employee';

    const newUser: User = {
      id: newUserId,
      username: assignedUsername,
      password: assignedPassword,
      role: assignedRole,
      employeeId: newEmpId,
      email: newEmployee.email,
      fullName: newEmployee.fullName,
      avatar: newEmployee.profilePhoto,
      accountStatus: 'Active',
      assignedBy: `${currentUser.fullName} (HR Admin)`,
      passwordUpdatedAt: new Date().toISOString().split('T')[0],
    };

    setAllEmployees(prev => [newEmployee, ...prev]);
    setAllUsers(prev => [newUser, ...prev]);

    // Create Initial Salary Record
    const newSalaryRec: SalaryRecord = {
      id: `SAL-2026-08-${newIdNum}`,
      employeeId: newEmpId,
      month: 'August 2026',
      year: 2026,
      baseSalary: initialSalary,
      bonus: 0,
      otherEarnings: 4000,
      grossSalary: initialSalary + 4000,
      deductions: [],
      totalDeductions: 0,
      netSalary: initialSalary + 4000,
      currency: 'RS',
      effectiveDate: joinDate,
      paymentFrequency: 'Monthly',
      paymentStatus: 'Processing',
    };
    setSalaryRecords(prev => [newSalaryRec, ...prev]);

    logAudit(
      'Employee Added',
      newEmployee.fullName,
      newEmpId,
      `New employee enrolled in ${newEmployee.department}. Base Salary: ${initialSalary} RS. 3-Month Probation ends on ${probationEndDateStr}.`,
      'Employee'
    );
  };

  const updateEmployee = (emp: Employee) => {
    if (currentUser?.role !== 'admin') return;

    setAllEmployees(prev => prev.map(e => (e.id === emp.id ? emp : e)));
    
    // Sync user fullName and email
    setAllUsers(prev => prev.map(u => (u.employeeId === emp.id ? { ...u, fullName: emp.fullName, email: emp.email } : u)));

    logAudit(
      'Employee Updated',
      emp.fullName,
      emp.id,
      `Updated profile parameters (Designation: ${emp.designation}, Department: ${emp.department}, Status: ${emp.employmentStatus}).`,
      'Employee'
    );
  };

  const deleteEmployee = (employeeId: string) => {
    if (currentUser?.role !== 'admin') return;
    const target = allEmployees.find(e => e.id === employeeId);
    if (!target) return;

    setAllEmployees(prev => prev.filter(e => e.id !== employeeId));
    setAllUsers(prev => prev.filter(u => u.employeeId !== employeeId));

    logAudit(
      'Employee Deactivated / Removed',
      target.fullName,
      employeeId,
      `Removed employee record from enterprise roster.`,
      'Employee'
    );
  };

  const updateProbationStatus = (employeeId: string, status: ProbationStatus, remarks?: string) => {
    if (currentUser?.role !== 'admin') return;
    const target = allEmployees.find(e => e.id === employeeId);
    if (!target) return;

    const employmentStatus: EmploymentStatus = status === 'Probation Cleared' ? 'Confirmed' : 'Probation';

    const updatedEmp: Employee = {
      ...target,
      probationStatus: status,
      employmentStatus,
      probationRemarks: remarks || `Probation status updated to ${status} by HR Admin.`,
      probationReviewedBy: currentUser.fullName,
    };

    setAllEmployees(prev => prev.map(e => (e.id === employeeId ? updatedEmp : e)));

    // Send notification to employee
    const notif: NotificationItem = {
      id: `NOTIF-${Date.now()}`,
      targetUserId: target.userId,
      title: `Probation Status Update: ${status}`,
      message: `HR Management has updated your probation status to "${status}". ${remarks ? 'Note: ' + remarks : ''}`,
      type: 'probation',
      read: false,
      createdAt: `2026-08-20 ${getCurrentTimeStr()} PKT`,
      linkTab: 'profile',
    };
    setNotifications(prev => [notif, ...prev]);

    logAudit(
      'Probation Status Modified',
      target.fullName,
      employeeId,
      `Decision: ${status}. Employment status set to ${employmentStatus}. Remarks: ${remarks || 'None'}`,
      'Probation'
    );
  };

  const addOrUpdateKPI = (kpiData: Omit<KPIRecord, 'id'>) => {
    if (currentUser?.role !== 'admin') return;

    const id = `KPI-2026-08-${kpiData.employeeId}`;
    const newKpi: KPIRecord = {
      ...kpiData,
      id,
    };

    setKpiRecords(prev => [newKpi, ...prev.filter(k => !(k.employeeId === kpiData.employeeId && k.month === kpiData.month))]);

    // Update corresponding salary record bonus
    setSalaryRecords(prev => prev.map(s => {
      if (s.employeeId === kpiData.employeeId && s.month === kpiData.month) {
        const gross = s.baseSalary + kpiData.bonusAmount + s.otherEarnings;
        return {
          ...s,
          bonus: kpiData.bonusAmount,
          grossSalary: gross,
          netSalary: gross - s.totalDeductions,
        };
      }
      return s;
    }));

    // Update employee currentBonus
    setAllEmployees(prev => prev.map(e => e.id === kpiData.employeeId ? { ...e, currentBonus: kpiData.bonusAmount } : e));

    const emp = allEmployees.find(e => e.id === kpiData.employeeId);
    if (emp) {
      const notif: NotificationItem = {
        id: `NOTIF-${Date.now()}`,
        targetUserId: emp.userId,
        title: `KPI & Performance Bonus Approved (${kpiData.month})`,
        message: `KPI Score: ${kpiData.kpiScore}%. Approved Performance Bonus: ${kpiData.bonusAmount.toLocaleString()} RS. Status: ${kpiData.bonusStatus}.`,
        type: 'bonus',
        read: false,
        createdAt: `2026-08-20 ${getCurrentTimeStr()} PKT`,
        linkTab: 'kpi',
      };
      setNotifications(prev => [notif, ...prev]);
    }

    logAudit(
      'KPI & Bonus Updated',
      emp?.fullName || kpiData.employeeId,
      kpiData.employeeId,
      `Month: ${kpiData.month}. KPI Score: ${kpiData.kpiScore}%, Bonus: ${kpiData.bonusAmount} RS. Reason: ${kpiData.bonusReason}`,
      'Bonus'
    );
  };

  const addDeduction = (deductionData: Omit<SalaryDeduction, 'id'>) => {
    if (currentUser?.role !== 'admin') return;

    const newDeduction: SalaryDeduction = {
      ...deductionData,
      id: `DED-${Date.now()}`,
    };

    setDeductions(prev => [newDeduction, ...prev]);

    // Update salary record deductions list
    setSalaryRecords(prev => prev.map(s => {
      if (s.employeeId === deductionData.employeeId && s.month === deductionData.month) {
        const updatedDeds = [...s.deductions, newDeduction];
        const totalDeds = updatedDeds.reduce((acc, d) => acc + (d.status === 'Applied' ? d.amount : 0), 0);
        return {
          ...s,
          deductions: updatedDeds,
          totalDeductions: totalDeds,
          netSalary: s.grossSalary - totalDeds,
        };
      }
      return s;
    }));

    const emp = allEmployees.find(e => e.id === deductionData.employeeId);
    if (emp) {
      const notif: NotificationItem = {
        id: `NOTIF-${Date.now()}`,
        targetUserId: emp.userId,
        title: `Salary Deduction Logged: ${deductionData.deductionType}`,
        message: `Amount: ${deductionData.amount.toLocaleString()} RS. Reason: ${deductionData.reason}.`,
        type: 'deduction',
        read: false,
        createdAt: `2026-08-20 ${getCurrentTimeStr()} PKT`,
        linkTab: 'salary',
      };
      setNotifications(prev => [notif, ...prev]);
    }

    logAudit(
      'Salary Deduction Added',
      emp?.fullName || deductionData.employeeId,
      deductionData.employeeId,
      `Type: ${deductionData.deductionType}, Amount: ${deductionData.amount} RS. Reason: ${deductionData.reason}`,
      'Deduction'
    );
  };

  const adjustSalary = (employeeId: string, baseSalary: number, bonus: number, otherEarnings: number, month: string = 'August 2026') => {
    if (currentUser?.role !== 'admin') return;

    const emp = allEmployees.find(e => e.id === employeeId);
    if (!emp) return;

    setSalaryRecords(prev => prev.map(s => {
      if (s.employeeId === employeeId && s.month === month) {
        const gross = baseSalary + bonus + otherEarnings;
        return {
          ...s,
          baseSalary,
          bonus,
          otherEarnings,
          grossSalary: gross,
          netSalary: gross - s.totalDeductions,
        };
      }
      return s;
    }));

    setAllEmployees(prev => prev.map(e => (e.id === employeeId ? { ...e, monthlySalary: baseSalary, currentBonus: bonus } : e)));

    logAudit(
      'Salary Adjusted',
      emp.fullName,
      employeeId,
      `Updated Base Salary: ${baseSalary} RS, Bonus: ${bonus} RS, Other: ${otherEarnings} RS for ${month}.`,
      'Salary'
    );
  };

  const generatePayslip = (employeeId: string, month: string, year: number): Payslip | null => {
    if (currentUser?.role !== 'admin') return null;

    const emp = allEmployees.find(e => e.id === employeeId);
    if (!emp) return null;

    const sal = salaryRecords.find(s => s.employeeId === employeeId && s.month === month);
    const base = sal ? sal.baseSalary : emp.monthlySalary;
    const bonus = sal ? sal.bonus : emp.currentBonus;
    const other = sal ? sal.otherEarnings : 5000;
    const gross = base + bonus + other;

    const relevantDeductions = deductions.filter(d => d.employeeId === employeeId && d.month === month && d.status === 'Applied');
    const totalDeds = relevantDeductions.reduce((acc, d) => acc + d.amount, 0);
    const net = gross - totalDeds;

    const payslipNum = `RMD-PAY-${year}-${month.split(' ')[0].substring(0, 3).toUpperCase()}-${employeeId.replace('EMP-', '')}`;

    const newPayslip: Payslip = {
      id: `PS-${Date.now()}`,
      payslipNumber: payslipNum,
      employeeId,
      employeeName: emp.fullName,
      employeeCode: emp.id,
      designation: emp.designation,
      department: emp.department,
      dateOfJoining: emp.dateOfJoining,
      salaryMonth: month,
      year,
      baseSalary: base,
      bonus,
      otherEarnings: other,
      grossSalary: gross,
      deductionsList: relevantDeductions.map(d => ({
        type: d.deductionType,
        amount: d.amount,
        reason: d.reason,
      })),
      totalDeductions: totalDeds,
      netSalary: net,
      currency: 'RS',
      paymentDate: `2026-09-01`,
      authorizedBy: `${currentUser.fullName} (Director of HR & Finance)`,
      generatedAt: `2026-08-20 ${getCurrentTimeStr()} PKT`,
      notes: `Official Rhinomds electronic disbursement advice. Bank: ${emp.bankName || 'Meezan Bank'} (A/C: ${emp.bankAccountNumber || 'PK92SCBL...'})`,
    };

    setPayslips(prev => [newPayslip, ...prev.filter(p => !(p.employeeId === employeeId && p.salaryMonth === month))]);

    // Send notification
    const notif: NotificationItem = {
      id: `NOTIF-${Date.now()}`,
      targetUserId: emp.userId,
      title: `Payslip Available: ${month}`,
      message: `Your official salary slip for ${month} has been generated. Net payable: ${net.toLocaleString()} RS.`,
      type: 'payslip',
      read: false,
      createdAt: `2026-08-20 ${getCurrentTimeStr()} PKT`,
      linkTab: 'payslips',
    };
    setNotifications(prev => [notif, ...prev]);

    logAudit(
      'Payslip Generated',
      emp.fullName,
      employeeId,
      `Generated Payslip #${payslipNum} for ${month}. Net Salary: ${net} RS.`,
      'Payslip'
    );

    return newPayslip;
  };

  const updatePolicy = (newPolicy: AttendancePolicy) => {
    if (currentUser?.role !== 'admin') return;

    setPolicy(newPolicy);
    logAudit(
      'Attendance Policy Updated',
      'All Staff',
      'ALL',
      `Updated shift hours (${newPolicy.standardDailyHours}h), break allowance (${newPolicy.breakAllowanceMinutes}m), grace period (${newPolicy.gracePeriodMinutes}m).`,
      'Policy'
    );
  };

  const sendAnnouncement = (title: string, message: string) => {
    if (currentUser?.role !== 'admin') return;

    const notif: NotificationItem = {
      id: `NOTIF-${Date.now()}`,
      targetUserId: 'all',
      title,
      message,
      type: 'announcement',
      read: false,
      createdAt: `2026-08-20 ${getCurrentTimeStr()} PKT`,
    };

    setNotifications(prev => [notif, ...prev]);
    logAudit('Company Announcement Broadcast', 'All Employees', 'ALL', `Broadcast: "${title}"`, 'Policy');
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const resetToDefaults = () => {
    localStorage.clear();
    setAllUsers(INITIAL_USERS);
    setAllEmployees(INITIAL_EMPLOYEES);
    setAttendanceRecords(INITIAL_ATTENDANCE_RECORDS);
    setKpiRecords(INITIAL_KPI_RECORDS);
    setSalaryRecords(INITIAL_SALARY_RECORDS);
    setDeductions(INITIAL_DEDUCTIONS);
    setPayslips(INITIAL_PAYSLIPS);
    setPolicy(DEFAULT_ATTENDANCE_POLICY);
    setNotifications(INITIAL_NOTIFICATIONS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setCurrentUser(INITIAL_USERS[0]);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        currentEmployee,
        allUsers,
        allEmployees,
        attendanceRecords,
        kpiRecords,
        salaryRecords,
        deductions,
        payslips,
        policy,
        notifications,
        auditLogs,
        departments,
        designations,
        activeTab,
        setActiveTab,
        selectedEmployeeForDetail,
        setSelectedEmployeeForDetail,
        selectedPayslipForModal,
        setSelectedPayslipForModal,
        login,
        adminUpdateUserCredentials,
        adminResetPassword,
        adminCreateUserAccount,
        updateOwnPassword,
        quickSwitchUser,
        logout,
        canAccessEmployeeData,
        checkIn,
        startBreak,
        endBreak,
        checkOut,
        getActiveBreak,
        getTodayAttendance,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        updateProbationStatus,
        addOrUpdateKPI,
        addDeduction,
        adjustSalary,
        generatePayslip,
        updatePolicy,
        sendAnnouncement,
        markNotificationAsRead,
        markAllNotificationsRead,
        resetToDefaults,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
