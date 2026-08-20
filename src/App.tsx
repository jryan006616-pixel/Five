import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { HeaderNavbar } from './components/common/HeaderNavbar';
import { Sidebar } from './components/common/Sidebar';
import { PayslipModal } from './components/common/PayslipModal';
import { LoginView } from './components/auth/LoginView';

// Employee Views
import { EmployeeDashboard } from './components/employee/EmployeeDashboard';
import { EmployeeProfile } from './components/employee/EmployeeProfile';
import { EmployeeAttendance } from './components/employee/EmployeeAttendance';
import { EmployeeBreaks } from './components/employee/EmployeeBreaks';
import { EmployeeKPIBonus } from './components/employee/EmployeeKPIBonus';
import { EmployeeSalary } from './components/employee/EmployeeSalary';
import { EmployeePayslips } from './components/employee/EmployeePayslips';
import { CompanyPolicies } from './components/employee/CompanyPolicies';

// Admin Views
import { AdminDashboard } from './components/admin/AdminDashboard';
import { EmployeeManagement } from './components/admin/EmployeeManagement';
import { AdminProbationTracker } from './components/admin/AdminProbationTracker';
import { AdminAttendance } from './components/admin/AdminAttendance';
import { AdminKPIBonus } from './components/admin/AdminKPIBonus';
import { AdminSalaryDeductions } from './components/admin/AdminSalaryDeductions';
import { AdminPayslips } from './components/admin/AdminPayslips';
import { AdminPolicies } from './components/admin/AdminPolicies';
import { AdminDepartments } from './components/admin/AdminDepartments';
import { AdminReports } from './components/admin/AdminReports';
import { AdminAuditLogs } from './components/admin/AdminAuditLogs';
import { AdminUserCredentials } from './components/admin/AdminUserCredentials';

const PortalMain: React.FC = () => {
  const {
    currentUser,
    activeTab,
    selectedPayslipForModal,
    setSelectedPayslipForModal,
  } = useApp();

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  if (!currentUser) {
    return <LoginView />;
  }

  // Render view corresponding to activeTab
  const renderContent = () => {
    switch (activeTab) {
      // Employee Tabs
      case 'dashboard':
        return currentUser.role === 'admin' ? <AdminDashboard /> : <EmployeeDashboard />;
      case 'profile':
        return <EmployeeProfile />;
      case 'attendance':
        return <EmployeeAttendance />;
      case 'breaks':
        return <EmployeeBreaks />;
      case 'kpi':
        return <EmployeeKPIBonus />;
      case 'salary':
        return <EmployeeSalary />;
      case 'payslips':
        return <EmployeePayslips />;
      case 'policies':
        return <CompanyPolicies />;

      // Admin Tabs
      case 'admin-dashboard':
        return <AdminDashboard />;
      case 'admin-employees':
        return <EmployeeManagement />;
      case 'admin-users':
        return <AdminUserCredentials />;
      case 'admin-probation':
        return <AdminProbationTracker />;
      case 'admin-attendance':
        return <AdminAttendance />;
      case 'admin-kpi':
        return <AdminKPIBonus />;
      case 'admin-salary':
        return <AdminSalaryDeductions />;
      case 'admin-payslips':
        return <AdminPayslips />;
      case 'admin-policies':
        return <AdminPolicies />;
      case 'admin-departments':
        return <AdminDepartments />;
      case 'admin-reports':
        return <AdminReports />;
      case 'admin-audit':
        return <AdminAuditLogs />;

      default:
        return currentUser.role === 'admin' ? <AdminDashboard /> : <EmployeeDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-[#121316] text-[#141619] flex selection:bg-[#d6f932] selection:text-black">
      {/* Sidebar Navigation */}
      <Sidebar
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main App Canvas Container */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#eae8e3] lg:rounded-l-[2.5rem] overflow-hidden border-l border-[#26282e]/80 shadow-2xl">
        {/* Top Header Navbar */}
        <HeaderNavbar onMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />

        {/* Dynamic Main Workspace View */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto w-full overflow-y-auto custom-scrollbar">
          {renderContent()}
        </main>
      </div>

      {/* Payslip Modal Renderer */}
      <PayslipModal
        payslip={selectedPayslipForModal}
        onClose={() => setSelectedPayslipForModal(null)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <PortalMain />
    </AppProvider>
  );
}
