import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
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
  CompanyTask,
  ShiftTimingConfig,
  ShiftSeason,
  AttendanceStatus,
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
  INITIAL_COMPANY_TASKS,
} from '../data/mockData';
import {
  evaluateCheckIn,
  calculateWorkingHours,
  DEFAULT_SHIFT_CONFIG,
  parseTimeToMinutes,
  formatMinutesTo12Hour,
} from '../utils/shiftUtils';
import {
  getLiveDateStr,
  getLiveTimeStr,
  getLiveMonthStr,
  getLiveMonthName,
  formatDateTimeStamp,
} from '../utils/dateUtils';
import {
  fetchCloudState,
  pushCloudState,
  subscribeToLocalTabSync,
  CloudPayload,
} from '../services/cloudSync';

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
  companyTasks: CompanyTask[];

  // Cloud Sync & Persistence
  cloudSyncStatus: 'synced' | 'syncing' | 'offline';
  lastCloudSyncTime: string;
  forceCloudSync: () => Promise<void>;
  exportDatabaseJSON: () => string;
  importDatabaseJSON: (jsonString: string) => { success: boolean; error?: string };
  
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
  updateCurrentUserProfile: (profile: Partial<User>) => void;
  quickSwitchUser: (userId: string) => void;
  logout: () => void;

  // Authorization helper
  canAccessEmployeeData: (targetEmployeeId: string) => boolean;

  // Attendance & Breaks
  checkIn: (employeeId?: string, customTime?: string, customDate?: string) => void;
  startBreak: (category: BreakCategory, reason?: string, employeeId?: string) => void;
  endBreak: (employeeId?: string) => void;
  checkOut: (employeeId?: string) => void;
  getActiveBreak: (employeeId: string) => { startTime: string; category: BreakCategory; elapsedMinutes: number } | null;
  getTodayAttendance: (employeeId: string) => AttendanceRecord | undefined;
  recordManualAttendance: (record: Partial<AttendanceRecord> & { employeeId: string; date: string }) => void;
  deleteAttendanceRecord: (recordId: string) => void;
  updateShiftTiming: (newShiftConfig: Partial<ShiftTimingConfig>) => void;
  recalculateAllAttendance: () => void;

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
  removeDeduction: (deductionId: string) => void;
  adjustSalary: (employeeId: string, baseSalary: number, bonus: number, otherEarnings: number, month?: string) => void;
  generatePayslip: (employeeId: string, month: string, year?: number, slipType?: 'Salary' | 'Bonus') => Payslip | null;
  generateBothSlips: (employeeId: string, month: string, year?: number) => { salarySlip: Payslip | null; bonusSlip: Payslip | null };
  updatePolicy: (newPolicy: AttendancePolicy) => void;
  sendAnnouncement: (title: string, message: string) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  resetToDefaults: () => void;

  // Tasks Management
  addCompanyTask: (task: { title: string; category?: string; timeSlot?: string; dueDate?: string; assignedTo?: string; photoUrl?: string }) => void;
  toggleCompanyTask: (id: string) => void;
  deleteCompanyTask: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'rhinomds_portal_v5_live_user_data';

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
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_ATTENDANCE_POLICY,
          ...parsed,
          shiftConfig: parsed.shiftConfig
            ? { ...DEFAULT_SHIFT_CONFIG, ...parsed.shiftConfig }
            : DEFAULT_SHIFT_CONFIG,
        };
      } catch (e) {
        // use default
      }
    }
    return DEFAULT_ATTENDANCE_POLICY;
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

  const [companyTasks, setCompanyTasks] = useState<CompanyTask[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_tasks');
    return saved ? JSON.parse(saved) : INITIAL_COMPANY_TASKS;
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedEmployeeForDetail, setSelectedEmployeeForDetail] = useState<Employee | null>(null);
  const [selectedPayslipForModal, setSelectedPayslipForModal] = useState<Payslip | null>(null);

  // Cloud Sync Status Tracking
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'synced' | 'syncing' | 'offline'>('synced');
  const [lastCloudSyncTime, setLastCloudSyncTime] = useState<string>(() => formatDateTimeStamp());
  const isInitialCloudLoadDone = useRef(false);
  const cloudPushTimeoutRef = useRef<any>(null);

  // Cross-tab real-time sync listener
  useEffect(() => {
    const unsubscribe = subscribeToLocalTabSync((payload) => {
      if (payload) {
        if (payload.allEmployees) setAllEmployees(payload.allEmployees);
        if (payload.attendanceRecords) setAttendanceRecords(payload.attendanceRecords);
        if (payload.kpiRecords) setKpiRecords(payload.kpiRecords);
        if (payload.salaryRecords) setSalaryRecords(payload.salaryRecords);
        if (payload.deductions) setDeductions(payload.deductions);
        if (payload.payslips) setPayslips(payload.payslips);
        if (payload.policy) setPolicy(payload.policy);
        if (payload.notifications) setNotifications(payload.notifications);
        if (payload.auditLogs) setAuditLogs(payload.auditLogs);
        if (payload.companyTasks) setCompanyTasks(payload.companyTasks);
        setLastCloudSyncTime(formatDateTimeStamp());
      }
    });
    return () => unsubscribe();
  }, []);

  // Initial cloud state hydration
  useEffect(() => {
    const hydrateFromCloud = async () => {
      setCloudSyncStatus('syncing');
      const cloudData = await fetchCloudState();
      if (cloudData && cloudData.allEmployees && cloudData.allEmployees.length > 0) {
        setAllEmployees(cloudData.allEmployees);
        if (cloudData.allUsers) setAllUsers(cloudData.allUsers);
        if (cloudData.attendanceRecords) setAttendanceRecords(cloudData.attendanceRecords);
        if (cloudData.kpiRecords) setKpiRecords(cloudData.kpiRecords);
        if (cloudData.salaryRecords) setSalaryRecords(cloudData.salaryRecords);
        if (cloudData.deductions) setDeductions(cloudData.deductions);
        if (cloudData.payslips) setPayslips(cloudData.payslips);
        if (cloudData.policy) setPolicy(cloudData.policy);
        if (cloudData.notifications) setNotifications(cloudData.notifications);
        if (cloudData.auditLogs) setAuditLogs(cloudData.auditLogs);
        if (cloudData.departments) setDepartments(cloudData.departments);
        if (cloudData.designations) setDesignations(cloudData.designations);
        if (cloudData.companyTasks) setCompanyTasks(cloudData.companyTasks);
        setLastCloudSyncTime(formatDateTimeStamp());
        setCloudSyncStatus('synced');
      } else {
        setCloudSyncStatus('synced');
      }
      isInitialCloudLoadDone.current = true;
    };

    hydrateFromCloud();

    // Periodic remote cloud pull (every 15s) so other devices get live updates
    const pollInterval = setInterval(async () => {
      if (document.visibilityState === 'visible') {
        const remoteData = await fetchCloudState();
        if (remoteData && remoteData.timestamp) {
          // If remote has newer data
          if (remoteData.allEmployees) setAllEmployees(remoteData.allEmployees);
          if (remoteData.attendanceRecords) setAttendanceRecords(remoteData.attendanceRecords);
          if (remoteData.kpiRecords) setKpiRecords(remoteData.kpiRecords);
          if (remoteData.salaryRecords) setSalaryRecords(remoteData.salaryRecords);
          if (remoteData.deductions) setDeductions(remoteData.deductions);
          if (remoteData.payslips) setPayslips(remoteData.payslips);
          if (remoteData.notifications) setNotifications(remoteData.notifications);
          if (remoteData.companyTasks) setCompanyTasks(remoteData.companyTasks);
          setLastCloudSyncTime(formatDateTimeStamp());
        }
      }
    }, 15000);

    return () => clearInterval(pollInterval);
  }, []);

  // Sync to local storage & auto push to cloud
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
    localStorage.setItem(STORAGE_KEY + '_tasks', JSON.stringify(companyTasks));

    // Debounced push to cloud repository for multi-user real-time sync
    if (isInitialCloudLoadDone.current) {
      if (cloudPushTimeoutRef.current) clearTimeout(cloudPushTimeoutRef.current);
      setCloudSyncStatus('syncing');
      cloudPushTimeoutRef.current = setTimeout(async () => {
        const payload: CloudPayload = {
          version: 5,
          timestamp: Date.now(),
          lastUpdatedBy: currentUser?.fullName || 'HR Admin',
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
          companyTasks,
        };
        const ok = await pushCloudState(payload);
        setCloudSyncStatus(ok ? 'synced' : 'offline');
        if (ok) setLastCloudSyncTime(formatDateTimeStamp());
      }, 1200);
    }
  }, [allEmployees, attendanceRecords, kpiRecords, salaryRecords, deductions, payslips, policy, notifications, auditLogs, companyTasks]);

  // Force manual cloud sync
  const forceCloudSync = async () => {
    setCloudSyncStatus('syncing');
    const payload: CloudPayload = {
      version: 5,
      timestamp: Date.now(),
      lastUpdatedBy: currentUser?.fullName || 'HR Admin',
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
      companyTasks,
    };
    const ok = await pushCloudState(payload);
    setCloudSyncStatus(ok ? 'synced' : 'offline');
    setLastCloudSyncTime(formatDateTimeStamp());
  };

  // Export full JSON database for backup
  const exportDatabaseJSON = (): string => {
    const payload: CloudPayload = {
      version: 5,
      timestamp: Date.now(),
      lastUpdatedBy: currentUser?.fullName || 'HR Admin',
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
      companyTasks,
    };
    return JSON.stringify(payload, null, 2);
  };

  // Import and restore full JSON database
  const importDatabaseJSON = (jsonString: string): { success: boolean; error?: string } => {
    try {
      const data = JSON.parse(jsonString);
      if (!data || !Array.isArray(data.allEmployees)) {
        return { success: false, error: 'Invalid database backup JSON format.' };
      }
      if (data.allUsers) setAllUsers(data.allUsers);
      if (data.allEmployees) setAllEmployees(data.allEmployees);
      if (data.attendanceRecords) setAttendanceRecords(data.attendanceRecords);
      if (data.kpiRecords) setKpiRecords(data.kpiRecords);
      if (data.salaryRecords) setSalaryRecords(data.salaryRecords);
      if (data.deductions) setDeductions(data.deductions);
      if (data.payslips) setPayslips(data.payslips);
      if (data.policy) setPolicy(data.policy);
      if (data.notifications) setNotifications(data.notifications);
      if (data.auditLogs) setAuditLogs(data.auditLogs);
      if (data.companyTasks) setCompanyTasks(data.companyTasks);
      forceCloudSync();
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to parse JSON backup.' };
    }
  };

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

  const updateCurrentUserProfile = (profile: Partial<User>) => {
    if (!currentUser) return;
    const updatedUser: User = {
      ...currentUser,
      ...profile,
    };
    setCurrentUser(updatedUser);
    setAllUsers(prev => prev.map(u => (u.id === currentUser.id ? updatedUser : u)));

    // If employee profile exists, sync photo / name if updated
    if (profile.fullName || profile.avatar) {
      setAllEmployees(prev =>
        prev.map(e =>
          e.userId === currentUser.id || e.id === currentUser.employeeId
            ? {
                ...e,
                ...(profile.fullName ? { fullName: profile.fullName } : {}),
                ...(profile.avatar ? { profilePhoto: profile.avatar } : {}),
              }
            : e
        )
      );
    }
  };

  const addCompanyTask = (task: {
    title: string;
    category?: string;
    timeSlot?: string;
    dueDate?: string;
    assignedTo?: string;
    photoUrl?: string;
  }) => {
    const newTask: CompanyTask = {
      id: `TSK-${Date.now()}`,
      title: task.title.trim(),
      category: task.category || 'Operations',
      timeSlot: task.timeSlot || 'Live Schedule',
      dueDate: task.dueDate || 'Today',
      completed: false,
      assignedTo: task.assignedTo || currentUser?.fullName || 'Admin',
      createdAt: new Date().toISOString(),
      photoUrl: task.photoUrl,
    };
    setCompanyTasks(prev => [newTask, ...prev]);
  };

  const toggleCompanyTask = (id: string) => {
    setCompanyTasks(prev =>
      prev.map(t => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const deleteCompanyTask = (id: string) => {
    setCompanyTasks(prev => prev.filter(t => t.id !== id));
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

  // Helper to get formatted current live date/time
  const getTodayDateStr = () => getLiveDateStr();
  const getCurrentTimeStr = () => getLiveTimeStr();

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
  const checkIn = (employeeId?: string, customTime?: string, customDate?: string) => {
    const targetEmpId = employeeId || currentEmployee?.id;
    if (!targetEmpId) return;

    const today = customDate || getTodayDateStr();
    const timeNow = customTime || getCurrentTimeStr();
    const existing = attendanceRecords.find(a => a.employeeId === targetEmpId && a.date === today);

    if (existing && existing.checkInTime) {
      return; // Already checked in
    }

    const currentShift = policy.shiftConfig || DEFAULT_SHIFT_CONFIG;
    const evaluation = evaluateCheckIn(timeNow, currentShift, policy.gracePeriodMinutes);

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
      isLate: evaluation.isLate,
      lateMinutes: evaluation.lateMinutes,
      isEarlyDeparture: false,
      earlyDepartureMinutes: 0,
      overtimeMinutes: 0,
      status: evaluation.status,
      notes: evaluation.notes,
    };

    setAttendanceRecords(prev => [newRecord, ...prev.filter(a => !(a.employeeId === targetEmpId && a.date === today))]);

    // Push notification
    const newNotif: NotificationItem = {
      id: `NOTIF-${Date.now()}`,
      targetUserId: emp?.userId || 'all',
      title: evaluation.isLate ? 'Late Shift Check-In Recorded' : 'Shift Check-In Confirmed',
      message: evaluation.isLate
        ? `Checked in at ${evaluation.checkIn12h} PKT (+${evaluation.lateMinutes} mins late against ${evaluation.shiftExpectedStart12h} PKT shift). Please ensure timely arrival.`
        : `Checked in successfully on time at ${evaluation.checkIn12h} PKT. Have a productive shift!`,
      type: 'attendance',
      read: false,
      createdAt: `${today} ${timeNow} PKT`,
      linkTab: 'attendance',
    };
    setNotifications(prev => [newNotif, ...prev]);

    if (evaluation.isLate) {
      logAudit(
        'Late Arrival Logged',
        emp?.fullName || targetEmpId,
        targetEmpId,
        `Punched in at ${evaluation.checkIn12h} PKT (+${evaluation.lateMinutes} mins late against ${evaluation.shiftExpectedStart12h} shift start, grace: ${policy.gracePeriodMinutes}m).`,
        'Attendance'
      );
    }
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
    const currentShift = policy.shiftConfig || DEFAULT_SHIFT_CONFIG;
    const { totalWorkingMinutes, overtimeMinutes, isEarlyDeparture, earlyDepartureMinutes } = calculateWorkingHours(
      att.checkInTime,
      timeNow,
      totalBreakMin,
      currentShift
    );

    const updatedAtt: AttendanceRecord = {
      ...att,
      checkOutTime: timeNow,
      breaks: updatedBreaks,
      totalBreakMinutes: totalBreakMin,
      totalWorkingMinutes: Math.max(0, totalWorkingMinutes),
      isEarlyDeparture,
      earlyDepartureMinutes,
      overtimeMinutes,
      notes: isEarlyDeparture
        ? `Shift check-out recorded with early departure (-${earlyDepartureMinutes}m).`
        : 'Shift check-out recorded successfully.',
    };

    setAttendanceRecords(prev => prev.map(a => (a.id === att.id ? updatedAtt : a)));
  };

  // Admin Manual Attendance Recording / Correction
  const recordManualAttendance = (recordData: Partial<AttendanceRecord> & { employeeId: string; date: string }) => {
    const currentShift = policy.shiftConfig || DEFAULT_SHIFT_CONFIG;
    const checkInTime = recordData.checkInTime ? recordData.checkInTime.trim() : null;
    const checkOutTime = recordData.checkOutTime ? recordData.checkOutTime.trim() : null;
    const breaks = recordData.breaks || [];
    const totalBreakMinutes = recordData.totalBreakMinutes ?? breaks.reduce((acc, b) => acc + (b.durationMinutes || 0), 0);

    let isLate = recordData.isLate ?? false;
    let lateMinutes = recordData.lateMinutes ?? 0;
    let status: AttendanceStatus = recordData.status || 'Present';
    let notes = recordData.notes || '';

    if (checkInTime) {
      const evalResult = evaluateCheckIn(checkInTime, currentShift, policy.gracePeriodMinutes);
      isLate = evalResult.isLate;
      lateMinutes = evalResult.lateMinutes;
      status = evalResult.status;
      if (!notes) {
        notes = evalResult.notes;
      }
    } else {
      status = recordData.status || 'Absent';
    }

    const { totalWorkingMinutes, overtimeMinutes, isEarlyDeparture, earlyDepartureMinutes } = calculateWorkingHours(
      checkInTime,
      checkOutTime,
      totalBreakMinutes,
      currentShift
    );

    const targetEmpId = recordData.employeeId;
    const targetDate = recordData.date;
    const existing = attendanceRecords.find(a => a.employeeId === targetEmpId && a.date === targetDate);
    const recordId = recordData.id || existing?.id || `ATT-${targetDate}-${targetEmpId}`;

    const newRecord: AttendanceRecord = {
      id: recordId,
      employeeId: targetEmpId,
      date: targetDate,
      checkInTime,
      checkOutTime,
      breaks,
      totalBreakMinutes,
      totalWorkingMinutes: recordData.totalWorkingMinutes ?? totalWorkingMinutes,
      isLate,
      lateMinutes,
      isEarlyDeparture: recordData.isEarlyDeparture ?? isEarlyDeparture,
      earlyDepartureMinutes: recordData.earlyDepartureMinutes ?? earlyDepartureMinutes,
      overtimeMinutes: recordData.overtimeMinutes ?? overtimeMinutes,
      status,
      notes: notes || 'Attendance record saved by Admin.',
    };

    setAttendanceRecords(prev => [newRecord, ...prev.filter(a => a.id !== recordId && !(a.employeeId === targetEmpId && a.date === targetDate))]);

    const emp = allEmployees.find(e => e.id === targetEmpId);
    logAudit(
      'Attendance Record Saved',
      emp?.fullName || targetEmpId,
      targetEmpId,
      `Date: ${targetDate}, Check-In: ${checkInTime || '--'}, Check-Out: ${checkOutTime || '--'}, Status: ${status}, Late: ${isLate ? `+${lateMinutes}m` : 'No'}`,
      'Attendance'
    );
  };

  const deleteAttendanceRecord = (recordId: string) => {
    const record = attendanceRecords.find(a => a.id === recordId);
    setAttendanceRecords(prev => prev.filter(a => a.id !== recordId));
    if (record) {
      const emp = allEmployees.find(e => e.id === record.employeeId);
      logAudit(
        'Attendance Record Removed',
        emp?.fullName || record.employeeId,
        record.employeeId,
        `Attendance record for date ${record.date} deleted by Admin.`,
        'Attendance'
      );
    }
  };

  // Shift & Seasonal Timing Management (e.g. Winter Timing, Summer Timing, Custom Shift)
  const updateShiftTiming = (newShiftConfig: Partial<ShiftTimingConfig>) => {
    const currentShift = policy.shiftConfig || DEFAULT_SHIFT_CONFIG;
    const mergedShift: ShiftTimingConfig = {
      ...currentShift,
      ...newShiftConfig,
    };

    const start12h = formatMinutesTo12Hour(parseTimeToMinutes(mergedShift.startTime));
    const end12h = formatMinutesTo12Hour(parseTimeToMinutes(mergedShift.endTime));
    const seasonLabel =
      mergedShift.season === 'Winter'
        ? 'Winter Timing'
        : mergedShift.season === 'Summer'
        ? 'Summer Timing'
        : mergedShift.season === 'Custom'
        ? 'Custom Shift'
        : 'Regular Shift';

    const shiftTypeDescription = `${mergedShift.shiftName} [${seasonLabel}: ${start12h} - ${end12h} PKT]`;

    const updatedPolicy: AttendancePolicy = {
      ...policy,
      shiftType: shiftTypeDescription,
      gracePeriodMinutes: mergedShift.gracePeriodMinutes || policy.gracePeriodMinutes,
      lateArrivalThresholdMinutes: mergedShift.gracePeriodMinutes || policy.lateArrivalThresholdMinutes,
      shiftConfig: mergedShift,
      lastUpdated: new Date().toISOString().split('T')[0],
      updatedBy: currentUser?.fullName || 'Admin',
    };

    setPolicy(updatedPolicy);

    // Sync all employee profiles with new shift timings
    setAllEmployees(prev =>
      prev.map(emp => ({
        ...emp,
        shiftTiming: `${start12h} - ${end12h} PKT (${seasonLabel})`,
      }))
    );

    // Re-evaluate existing attendance records with check-ins against new shift
    setAttendanceRecords(prev =>
      prev.map(record => {
        if (!record.checkInTime) return record;
        const evalRes = evaluateCheckIn(record.checkInTime, mergedShift, mergedShift.gracePeriodMinutes);
        const { totalWorkingMinutes, overtimeMinutes, isEarlyDeparture, earlyDepartureMinutes } = calculateWorkingHours(
          record.checkInTime,
          record.checkOutTime,
          record.totalBreakMinutes,
          mergedShift
        );
        return {
          ...record,
          isLate: evalRes.isLate,
          lateMinutes: evalRes.lateMinutes,
          status: evalRes.status,
          notes: evalRes.notes,
          totalWorkingMinutes: record.checkOutTime ? totalWorkingMinutes : record.totalWorkingMinutes,
          overtimeMinutes: record.checkOutTime ? overtimeMinutes : record.overtimeMinutes,
          isEarlyDeparture: record.checkOutTime ? isEarlyDeparture : record.isEarlyDeparture,
          earlyDepartureMinutes: record.checkOutTime ? earlyDepartureMinutes : record.earlyDepartureMinutes,
        };
      })
    );

    logAudit(
      'Company Shift & Seasonal Timing Updated',
      'All Workforce & Organization Roster',
      'ORG',
      `Shift updated to ${seasonLabel} (${start12h} to ${end12h} PKT, Grace: ${mergedShift.gracePeriodMinutes}m). System attendance re-evaluated.`,
      'Policy'
    );

    const announcementNotif: NotificationItem = {
      id: `NOTIF-${Date.now()}`,
      targetUserId: 'all',
      title: `Company Shift Timing Updated (${seasonLabel})`,
      message: `Rhinomds shift timing is now officially set to ${start12h} – ${end12h} PKT (${seasonLabel}). Grace period: ${mergedShift.gracePeriodMinutes} minutes.`,
      type: 'announcement',
      read: false,
      createdAt: `${getTodayDateStr()} ${getCurrentTimeStr()} PKT`,
      linkTab: 'attendance',
    };
    setNotifications(prev => [announcementNotif, ...prev]);
  };

  const recalculateAllAttendance = () => {
    const currentShift = policy.shiftConfig || DEFAULT_SHIFT_CONFIG;
    setAttendanceRecords(prev =>
      prev.map(record => {
        if (!record.checkInTime) return record;
        const evalRes = evaluateCheckIn(record.checkInTime, currentShift, policy.gracePeriodMinutes);
        const { totalWorkingMinutes, overtimeMinutes, isEarlyDeparture, earlyDepartureMinutes } = calculateWorkingHours(
          record.checkInTime,
          record.checkOutTime,
          record.totalBreakMinutes,
          currentShift
        );
        return {
          ...record,
          isLate: evalRes.isLate,
          lateMinutes: evalRes.lateMinutes,
          status: evalRes.status,
          notes: evalRes.notes,
          totalWorkingMinutes: record.checkOutTime ? totalWorkingMinutes : record.totalWorkingMinutes,
          overtimeMinutes: record.checkOutTime ? overtimeMinutes : record.overtimeMinutes,
          isEarlyDeparture: record.checkOutTime ? isEarlyDeparture : record.isEarlyDeparture,
          earlyDepartureMinutes: record.checkOutTime ? earlyDepartureMinutes : record.earlyDepartureMinutes,
        };
      })
    );
  };

  // Helper: Strict 3-Month Auto-Probation Evaluation from Date of Joining
  const calculateAutoProbation = (
    dateOfJoiningStr?: string,
    customStatus?: ProbationStatus
  ): {
    probationEndDate: string;
    probationStatus: ProbationStatus;
    employmentStatus: EmploymentStatus;
    probationRemarks: string;
  } => {
    const today = new Date();
    const joinDate = dateOfJoiningStr ? new Date(dateOfJoiningStr) : new Date();
    const probationEnd = new Date(joinDate);
    probationEnd.setMonth(probationEnd.getMonth() + 3);
    const probationEndDateStr = probationEnd.toISOString().split('T')[0];

    const todayTime = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const endTime = new Date(probationEnd.getFullYear(), probationEnd.getMonth(), probationEnd.getDate()).getTime();

    const isPastThreeMonths = todayTime >= endTime;

    if (isPastThreeMonths) {
      return {
        probationEndDate: probationEndDateStr,
        probationStatus: 'Probation Cleared',
        employmentStatus: 'Confirmed',
        probationRemarks: `3-Month probation period completed (${probationEndDateStr}). Auto-cleared and permanently confirmed.`,
      };
    } else {
      const activeStatus: ProbationStatus = customStatus === 'Probation Extended' ? 'Probation Extended' : 'Probation';
      return {
        probationEndDate: probationEndDateStr,
        probationStatus: activeStatus,
        employmentStatus: 'Probation',
        probationRemarks: `Under 3-Month mandatory probation period (Evaluation completion date: ${probationEndDateStr}).`,
      };
    }
  };

  // Auto-sync probation on mount or workforce changes
  useEffect(() => {
    setAllEmployees(prev => {
      let changed = false;
      const updated = prev.map(emp => {
        const prob = calculateAutoProbation(emp.dateOfJoining, emp.probationStatus);
        if (prob.probationStatus === 'Probation Cleared' && emp.probationStatus !== 'Probation Cleared') {
          changed = true;
          return {
            ...emp,
            probationEndDate: prob.probationEndDate,
            probationStatus: prob.probationStatus,
            employmentStatus: prob.employmentStatus,
            probationRemarks: prob.probationRemarks,
          };
        }
        return emp;
      });
      return changed ? updated : prev;
    });
  }, []);

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
    
    // Auto-calculate probation end date & status: Date of Joining + 3 Months (Strict 3-Month Rule)
    const joinDate = empData.dateOfJoining || new Date().toISOString().split('T')[0];
    const probationInfo = calculateAutoProbation(joinDate, empData.probationStatus);

    const newEmployee: Employee = {
      id: newEmpId,
      userId: newUserId,
      fullName: empData.fullName || 'New Employee',
      profilePhoto: empData.profilePhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=90',
      dateOfBirth: empData.dateOfBirth || '',
      gender: empData.gender || 'Male',
      email: empData.email || `${empData.fullName?.toLowerCase().replace(/\s+/g, '.') || 'emp'}@rhinomds.com`,
      phone: empData.phone || '',
      address: empData.address || '',
      emergencyContact: empData.emergencyContact || '',
      emergencyContactPhone: empData.emergencyContactPhone || '',
      emergencyContactRelation: empData.emergencyContactRelation || '',
      designation: empData.designation || 'Medical Billing Specialist',
      department: empData.department || 'Medical Billing',
      dateOfJoining: joinDate,
      employmentStatus: probationInfo.employmentStatus,
      employmentType: empData.employmentType || 'Night Shift - US Timing',
      reportingManager: empData.reportingManager || '',
      workLocation: empData.workLocation || 'Karachi Operations Center',
      shiftTiming: empData.shiftTiming || policy.shiftType || '06:00 PM - 03:00 AM PKT',
      probationEndDate: probationInfo.probationEndDate,
      probationStatus: probationInfo.probationStatus,
      probationRemarks: probationInfo.probationRemarks,
      monthlySalary: initialSalary,
      currentBonus: 0,
      currentDeductions: 0,
      salaryEffectiveDate: joinDate,
      paymentFrequency: 'Monthly',
      bankAccountNumber: empData.bankAccountNumber || '',
      bankName: empData.bankName || '',
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
    const currentLiveMonth = getLiveMonthName(getLiveMonthStr());
    const currentLiveYear = new Date().getFullYear();
    const newSalaryRec: SalaryRecord = {
      id: `SAL-${Date.now()}-${newIdNum}`,
      employeeId: newEmpId,
      month: currentLiveMonth,
      year: currentLiveYear,
      baseSalary: initialSalary,
      bonus: 0,
      otherEarnings: 0,
      grossSalary: initialSalary,
      deductions: [],
      totalDeductions: 0,
      netSalary: initialSalary,
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
      `New employee enrolled in ${newEmployee.department}. Base Salary: ${initialSalary} RS. 3-Month Probation (${probationInfo.probationStatus}) ends on ${probationInfo.probationEndDate}.`,
      'Employee'
    );
  };

  const updateEmployee = (emp: Employee) => {
    if (currentUser?.role !== 'admin') return;

    // Re-evaluate 3-month probation on update
    const prob = calculateAutoProbation(emp.dateOfJoining, emp.probationStatus);
    const updatedEmp: Employee = {
      ...emp,
      probationEndDate: prob.probationEndDate,
      probationStatus: prob.probationStatus,
      employmentStatus: prob.employmentStatus,
    };

    setAllEmployees(prev => prev.map(e => (e.id === emp.id ? updatedEmp : e)));
    
    // Sync user fullName and email and avatar
    setAllUsers(prev => prev.map(u => (u.employeeId === emp.id ? { ...u, fullName: emp.fullName, email: emp.email, avatar: emp.profilePhoto } : u)));

    // Sync salary records baseSalary
    setSalaryRecords(prev => prev.map(s => {
      if (s.employeeId === emp.id && s.month === 'August 2026') {
        const gross = emp.monthlySalary + (s.bonus || 0) + (s.otherEarnings || 0);
        return {
          ...s,
          baseSalary: emp.monthlySalary,
          grossSalary: gross,
          netSalary: gross - (s.totalDeductions || 0),
        };
      }
      return s;
    }));

    logAudit(
      'Employee Updated',
      emp.fullName,
      emp.id,
      `Updated profile parameters (Designation: ${emp.designation}, Department: ${emp.department}, Status: ${updatedEmp.employmentStatus}, Probation: ${updatedEmp.probationStatus}).`,
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

    const hrPts = Math.min(3, Math.max(0, kpiData.hrPoints !== undefined ? kpiData.hrPoints : 3));
    const prodPts = Math.min(7, Math.max(0, kpiData.productivityPoints !== undefined ? kpiData.productivityPoints : 7));
    const totPts = Number((hrPts + prodPts).toFixed(1));
    const scorePct = Math.round((totPts / 10) * 100);

    const id = `KPI-2026-08-${kpiData.employeeId}`;
    const newKpi: KPIRecord = {
      ...kpiData,
      id,
      hrPoints: hrPts,
      productivityPoints: prodPts,
      totalPoints: totPts,
      kpiScore: scorePct,
      disbursementCycle: 'Mid-Month (15th)',
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
        title: `KPI Bonus Approved: ${totPts}/10 Points (${kpiData.month})`,
        message: `KPI Points: ${totPts}/10 (HR: ${hrPts}/3 + Productivity: ${prodPts}/7 = ${scorePct}%). Mid-Month Bonus: ${kpiData.bonusAmount.toLocaleString()} RS. Status: ${kpiData.bonusStatus}.`,
        type: 'bonus',
        read: false,
        createdAt: `2026-08-20 ${getCurrentTimeStr()} PKT`,
        linkTab: 'kpi',
      };
      setNotifications(prev => [notif, ...prev]);
    }

    logAudit(
      'KPI & Bonus Appraised (10-Point Model)',
      emp?.fullName || kpiData.employeeId,
      kpiData.employeeId,
      `Month: ${kpiData.month}. Points: ${totPts}/10 (HR: ${hrPts}/3, Productivity: ${prodPts}/7 - ${scorePct}%). Bonus: ${kpiData.bonusAmount} RS (Disbursed Mid-Month 15th).`,
      'Bonus'
    );
  };

  const addDeduction = (deductionData: Omit<SalaryDeduction, 'id'>) => {
    if (currentUser?.role !== 'admin') return;

    const emp = allEmployees.find(e => e.id === deductionData.employeeId);
    const newDeduction: SalaryDeduction = {
      ...deductionData,
      id: `DED-${Date.now()}`,
      deductionCategory: deductionData.deductionCategory || 'Salary',
      status: deductionData.status || 'Applied',
      addedBy: currentUser?.fullName || 'HR Admin',
      date: deductionData.date || '2026-08-20',
    };

    const updatedDeductions = [newDeduction, ...deductions];
    setDeductions(updatedDeductions);

    // Recalculate employee currentDeductions
    const empMonthDeds = updatedDeductions.filter(d => d.employeeId === deductionData.employeeId && d.month === deductionData.month && d.status === 'Applied');
    const totalEmpDeds = empMonthDeds.reduce((sum, d) => sum + d.amount, 0);

    setAllEmployees(prev => prev.map(e => e.id === deductionData.employeeId ? { ...e, currentDeductions: totalEmpDeds } : e));

    // Update or create salary record for that employee & month
    setSalaryRecords(prev => {
      const exists = prev.some(s => s.employeeId === deductionData.employeeId && s.month === deductionData.month);
      if (exists) {
        return prev.map(s => {
          if (s.employeeId === deductionData.employeeId && s.month === deductionData.month) {
            const updatedDedsList = [...s.deductions.filter(d => d.id !== newDeduction.id), newDeduction];
            const totalDeds = updatedDedsList.reduce((acc, d) => acc + (d.status === 'Applied' ? d.amount : 0), 0);
            return {
              ...s,
              deductions: updatedDedsList,
              totalDeductions: totalDeds,
              netSalary: s.grossSalary - totalDeds,
            };
          }
          return s;
        });
      } else if (emp) {
        const gross = emp.monthlySalary + (emp.currentBonus || 0) + 5000;
        const totalDeds = newDeduction.amount;
        const newSal: SalaryRecord = {
          id: `SAL-${Date.now()}`,
          employeeId: emp.id,
          month: deductionData.month,
          year: 2026,
          baseSalary: emp.monthlySalary,
          bonus: emp.currentBonus || 0,
          otherEarnings: 5000,
          grossSalary: gross,
          deductions: [newDeduction],
          totalDeductions: totalDeds,
          netSalary: gross - totalDeds,
          currency: 'RS',
          effectiveDate: emp.dateOfJoining,
          paymentFrequency: 'Monthly',
          paymentStatus: 'Processing',
        };
        return [newSal, ...prev];
      }
      return prev;
    });

    // Real-time sync with payslips
    setPayslips(prev => prev.map(p => {
      if (p.employeeId === deductionData.employeeId && p.salaryMonth === deductionData.month) {
        const isApplicable = (p.slipType === 'Bonus' && newDeduction.deductionCategory === 'Bonus') ||
          (p.slipType === 'Salary' && newDeduction.deductionCategory !== 'Bonus');
        
        if (!isApplicable) return p;

        const updatedDedsList = [
          ...p.deductionsList,
          {
            type: newDeduction.deductionType,
            amount: newDeduction.amount,
            reason: newDeduction.reason,
          },
        ];
        const totalDeds = updatedDedsList.reduce((acc, d) => acc + d.amount, 0);
        return {
          ...p,
          deductionsList: updatedDedsList,
          totalDeductions: totalDeds,
          netSalary: p.grossSalary - totalDeds,
        };
      }
      return p;
    }));

    if (emp) {
      const notif: NotificationItem = {
        id: `NOTIF-${Date.now()}`,
        targetUserId: emp.userId,
        title: `${newDeduction.deductionCategory} Deduction: ${deductionData.deductionType}`,
        message: `Amount: ${deductionData.amount.toLocaleString()} RS (${newDeduction.deductionCategory} Cycle). Reason: ${deductionData.reason}.`,
        type: 'deduction',
        read: false,
        createdAt: `2026-08-20 ${getCurrentTimeStr()} PKT`,
        linkTab: 'salary',
      };
      setNotifications(prev => [notif, ...prev]);
    }

    logAudit(
      'Salary Deduction Added & Integrated',
      emp?.fullName || deductionData.employeeId,
      deductionData.employeeId,
      `Category: ${newDeduction.deductionCategory}, Type: ${deductionData.deductionType}, Amount: ${deductionData.amount} RS. Reason: ${deductionData.reason}.`,
      'Deduction'
    );
  };

  const removeDeduction = (deductionId: string) => {
    if (currentUser?.role !== 'admin') return;

    const target = deductions.find(d => d.id === deductionId);
    if (!target) return;

    const updatedDeductions = deductions.filter(d => d.id !== deductionId);
    setDeductions(updatedDeductions);

    // Recalculate employee currentDeductions
    const empMonthDeds = updatedDeductions.filter(d => d.employeeId === target.employeeId && d.month === target.month && d.status === 'Applied');
    const totalEmpDeds = empMonthDeds.reduce((sum, d) => sum + d.amount, 0);

    setAllEmployees(prev => prev.map(e => e.id === target.employeeId ? { ...e, currentDeductions: totalEmpDeds } : e));

    // Recalculate salary records
    setSalaryRecords(prev => prev.map(s => {
      if (s.employeeId === target.employeeId && s.month === target.month) {
        const remainingDeds = s.deductions.filter(d => d.id !== deductionId);
        const totalDeds = remainingDeds.reduce((acc, d) => acc + (d.status === 'Applied' ? d.amount : 0), 0);
        return {
          ...s,
          deductions: remainingDeds,
          totalDeductions: totalDeds,
          netSalary: s.grossSalary - totalDeds,
        };
      }
      return s;
    }));

    // Recalculate payslips
    setPayslips(prev => prev.map(p => {
      if (p.employeeId === target.employeeId && p.salaryMonth === target.month) {
        const updatedList = p.deductionsList.filter(d => !(d.type === target.deductionType && d.amount === target.amount && d.reason === target.reason));
        const totalDeds = updatedList.reduce((acc, d) => acc + d.amount, 0);
        return {
          ...p,
          deductionsList: updatedList,
          totalDeductions: totalDeds,
          netSalary: p.grossSalary - totalDeds,
        };
      }
      return p;
    }));

    const emp = allEmployees.find(e => e.id === target.employeeId);
    logAudit(
      'Deduction Removed',
      emp?.fullName || target.employeeId,
      target.employeeId,
      `Removed deduction of ${target.amount} RS (${target.deductionType}) for ${target.month}. Reason was: ${target.reason}`,
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

  const generatePayslip = (
    employeeId: string,
    month: string,
    year: number = 2026,
    slipType: 'Salary' | 'Bonus' = 'Salary'
  ): Payslip | null => {
    if (currentUser?.role !== 'admin') return null;

    const emp = allEmployees.find(e => e.id === employeeId);
    if (!emp) return null;

    const sal = salaryRecords.find(s => s.employeeId === employeeId && s.month === month);
    const kpi = kpiRecords.find(k => k.employeeId === employeeId && k.month === month);

    const base = sal ? sal.baseSalary : emp.monthlySalary;
    const bonusVal = kpi ? kpi.bonusAmount : (sal ? sal.bonus : emp.currentBonus);
    const other = sal ? sal.otherEarnings : 5000;

    let newPayslip: Payslip;

    if (slipType === 'Salary') {
      // Month-Start Base Salary Slip (Disbursed 1st - 5th of Month)
      const salaryDeds = deductions.filter(
        d => d.employeeId === employeeId && d.month === month && d.status === 'Applied' && d.deductionCategory !== 'Bonus'
      );
      const totalSalaryDeds = salaryDeds.reduce((acc, d) => acc + d.amount, 0);
      const gross = base + other;
      const net = gross - totalSalaryDeds;
      const payslipNum = `RMD-SAL-${year}-${month.split(' ')[0].substring(0, 3).toUpperCase()}-${employeeId.replace('EMP-', '')}`;

      newPayslip = {
        id: `PS-SAL-${Date.now()}-${employeeId}`,
        payslipNumber: payslipNum,
        slipType: 'Salary',
        disbursementCycle: 'Month-Start (1st-5th)',
        employeeId,
        employeeName: emp.fullName,
        employeeCode: emp.id,
        designation: emp.designation,
        department: emp.department,
        dateOfJoining: emp.dateOfJoining,
        salaryMonth: month,
        year,
        baseSalary: base,
        otherEarnings: other,
        bonus: 0, // Bonus processed separately in mid-month
        grossSalary: gross,
        deductionsList: salaryDeds.map(d => ({
          type: d.deductionType,
          amount: d.amount,
          reason: d.reason,
        })),
        totalDeductions: totalSalaryDeds,
        netSalary: net,
        currency: 'RS',
        paymentDate: `${year}-${String(new Date().getMonth() + 1).padStart(2, '0')}-01`,
        authorizedBy: `${currentUser.fullName} (Director of HR & Finance)`,
        generatedAt: formatDateTimeStamp(),
        notes: `Official Rhinomds Monthly Base Salary Advice (Processed Month-Start). Bank: ${emp.bankName || 'Meezan Bank'} (A/C: ${emp.bankAccountNumber || 'PK92SCBL...'})`,
      };
    } else {
      // Mid-Month Performance & KPI Bonus Slip (Disbursed 15th of Month)
      const bonusDeds = deductions.filter(
        d => d.employeeId === employeeId && d.month === month && d.status === 'Applied' && d.deductionCategory === 'Bonus'
      );
      const totalBonusDeds = bonusDeds.reduce((acc, d) => acc + d.amount, 0);
      const gross = bonusVal;
      const net = gross - totalBonusDeds;
      const payslipNum = `RMD-BONUS-${year}-${month.split(' ')[0].substring(0, 3).toUpperCase()}-${employeeId.replace('EMP-', '')}`;

      const hrPts = kpi?.hrPoints ?? 3;
      const prodPts = kpi?.productivityPoints ?? 7;
      const totPts = kpi?.totalPoints ?? (hrPts + prodPts);
      const scorePct = kpi?.kpiScore ?? Math.round((totPts / 10) * 100);

      newPayslip = {
        id: `PS-BON-${Date.now()}-${employeeId}`,
        payslipNumber: payslipNum,
        slipType: 'Bonus',
        disbursementCycle: 'Mid-Month (15th)',
        employeeId,
        employeeName: emp.fullName,
        employeeCode: emp.id,
        designation: emp.designation,
        department: emp.department,
        dateOfJoining: emp.dateOfJoining,
        salaryMonth: month,
        year,
        baseSalary: 0,
        otherEarnings: 0,
        bonus: bonusVal,
        hrPoints: hrPts,
        productivityPoints: prodPts,
        totalPoints: totPts,
        kpiPercentage: scorePct,
        bonusReason: kpi?.bonusReason || 'Monthly KPI Milestone & Performance Incentive',
        grossSalary: gross,
        deductionsList: bonusDeds.map(d => ({
          type: d.deductionType,
          amount: d.amount,
          reason: d.reason,
        })),
        totalDeductions: totalBonusDeds,
        netSalary: net,
        currency: 'RS',
        paymentDate: `${year}-${String(new Date().getMonth() + 1).padStart(2, '0')}-15`,
        authorizedBy: `${currentUser.fullName} (Director of HR & Operations)`,
        generatedAt: formatDateTimeStamp(),
        notes: `Official Rhinomds Performance Bonus Advice (10-Point KPI Model: 3 HR + 7 Productivity). Disbursed Mid-Month.`,
      };
    }

    setPayslips(prev => [
      newPayslip,
      ...prev.filter(p => !(p.employeeId === employeeId && p.salaryMonth === month && p.slipType === slipType))
    ]);

    // Send notification
    const notif: NotificationItem = {
      id: `NOTIF-${Date.now()}`,
      targetUserId: emp.userId,
      title: `${slipType === 'Salary' ? 'Monthly Salary Slip' : 'KPI Bonus Slip'} Available: ${month}`,
      message: `Your official ${slipType === 'Salary' ? 'base salary' : 'KPI performance bonus'} advice for ${month} (${newPayslip.disbursementCycle}) is ready. Net amount: ${newPayslip.netSalary.toLocaleString()} RS.`,
      type: slipType === 'Salary' ? 'payslip' : 'bonus',
      read: false,
      createdAt: formatDateTimeStamp(),
      linkTab: 'payslips',
    };
    setNotifications(prev => [notif, ...prev]);

    logAudit(
      `${slipType} Slip Issued (${newPayslip.disbursementCycle})`,
      emp.fullName,
      employeeId,
      `Issued ${slipType} slip #${newPayslip.payslipNumber} for ${month}. Net: ${newPayslip.netSalary} RS.`,
      'Payslip'
    );

    return newPayslip;
  };

  const generateBothSlips = (employeeId: string, month: string, year?: number) => {
    const defaultYear = year || new Date().getFullYear();
    const salSlip = generatePayslip(employeeId, month, defaultYear, 'Salary');
    const bonSlip = generatePayslip(employeeId, month, defaultYear, 'Bonus');
    return { salarySlip: salSlip, bonusSlip: bonSlip };
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
      createdAt: formatDateTimeStamp(),
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
    forceCloudSync();
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
        companyTasks,
        cloudSyncStatus,
        lastCloudSyncTime,
        forceCloudSync,
        exportDatabaseJSON,
        importDatabaseJSON,
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
        updateCurrentUserProfile,
        quickSwitchUser,
        logout,
        canAccessEmployeeData,
        checkIn,
        startBreak,
        endBreak,
        checkOut,
        getActiveBreak,
        getTodayAttendance,
        recordManualAttendance,
        deleteAttendanceRecord,
        updateShiftTiming,
        recalculateAllAttendance,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        updateProbationStatus,
        addOrUpdateKPI,
        addDeduction,
        removeDeduction,
        adjustSalary,
        generatePayslip,
        generateBothSlips,
        updatePolicy,
        sendAnnouncement,
        markNotificationAsRead,
        markAllNotificationsRead,
        resetToDefaults,
        addCompanyTask,
        toggleCompanyTask,
        deleteCompanyTask,
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
