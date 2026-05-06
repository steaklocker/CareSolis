import React from 'react';
import { createBrowserRouter } from 'react-router';
import { ProtectedRoute } from './components/ProtectedRoute';
import Root from './Root';

// Import pages directly (not lazy) to avoid hook issues
import Dashboard from './pages/Dashboard';
import EscalationSettings from './pages/EscalationSettings';
import RoutineStability from './pages/RoutineStability';
import DeviceHealthPage from './pages/DeviceHealthPage';
import EscalationLog from './pages/EscalationLog';
import NotificationHistory from './pages/NotificationHistory';
import SystemsInfrastructure from './pages/SystemsInfrastructure';
import CareCoordination from './pages/CareCoordination';
import HouseholdVault from './pages/HouseholdVault';
import Solis from './pages/Solis';
import Simulation from './pages/Simulation';
import DeviceSimulator from './pages/DeviceSimulator';
import TestingChecklist from './pages/TestingChecklist';
import Integrations from './pages/Integrations';
import RecipientHome from './pages/RecipientHome';
import MedicationManager from './pages/MedicationManager';
import MedicationMaintenance from './pages/MedicationMaintenance';
import DataRecovery from './pages/DataRecovery';
import CareGiverManual from './pages/CareGiverManual';
import ProviderManual from './pages/ProviderManual';
import Login from './pages/Login';
import ContactAdmin from './pages/ContactAdmin';
import PatientProfile from './pages/PatientProfile';
import CalendarView from './pages/CalendarView';
import CareMessaging from './pages/CareMessaging';
import VideoCallCenter from './pages/VideoCallCenter';
import MedicationHub from './pages/MedicationHub';
import DoseEventVerification from './pages/DoseEventVerification';
import ClinicalOperations from './pages/ClinicalOperations';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import SystemMonitoring from './pages/SystemMonitoring';
import SystemSettings from './pages/SystemSettings';
import AccessAndPermissions from './pages/AccessAndPermissions';
import SecurityCenter from './pages/SecurityCenter';
import TwoFactorAuth from './pages/TwoFactorAuth';
import DataGovernance from './pages/DataGovernance';
import RegulatoryCompliance from './pages/RegulatoryCompliance';
import LegalDisclaimers from './pages/LegalDisclaimers';
import HelpCenter from './pages/HelpCenter';
import SetupWizard from './pages/SetupWizard';
import DeviceSetupGuideWithDownload from './pages/DeviceSetupGuideWithDownload';
import TestingTools from './pages/TestingTools';
import DiagnosticTest from './pages/DiagnosticTest';
import PatientDeviceDashboard from './pages/PatientDeviceDashboard';
import NotificationSettings from './pages/NotificationSettings';

// Error fallback component
function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-50 mb-4">404 - Page Not Found</h1>
        <p className="text-slate-400 mb-6">The page you're looking for doesn't exist.</p>
        <a href="/" className="text-emerald-500 hover:text-emerald-400">Go back to Dashboard</a>
      </div>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      { index: true, element: <Dashboard /> },
      
      // ADMIN-ONLY: Escalation configuration
      { 
        path: "escalation", 
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <EscalationSettings />
          </ProtectedRoute>
        ) 
      },
      
      { path: "routine", element: <RoutineStability /> },
      { path: "device", element: <DeviceHealthPage /> },
      { path: "log", element: <EscalationLog /> },
      { path: "notifications", element: <NotificationHistory /> },
      { path: "notification-settings", element: <NotificationSettings /> },

      // ADMIN-ONLY: Systems infrastructure (technical)
      { 
        path: "systems", 
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <SystemsInfrastructure />
          </ProtectedRoute>
        ) 
      },
      
      { path: "care-circle", element: <CareCoordination /> },
      { path: "household-vault", element: <HouseholdVault /> },
      
      // ADMIN-ONLY: Solis (AI assistant - technical)
      { 
        path: "solis", 
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <Solis />
          </ProtectedRoute>
        ) 
      },
      
      // ADMIN-ONLY: Testing & simulation tools
      { 
        path: "simulation", 
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <Simulation />
          </ProtectedRoute>
        ) 
      },
      { 
        path: "device-simulator", 
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <DeviceSimulator />
          </ProtectedRoute>
        ) 
      },
      { 
        path: "testing-checklist", 
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <TestingChecklist />
          </ProtectedRoute>
        ) 
      },
      
      // ADMIN-ONLY: Integrations (webhook configuration)
      { 
        path: "integrations", 
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <Integrations />
          </ProtectedRoute>
        ) 
      },
      
      { path: "recipient", element: <RecipientHome /> },
      { path: "medications", element: <MedicationManager /> },
      
      // ADMIN-ONLY: Medication Maintenance (edit schedules, blister packs)
      { 
        path: "medication-maintenance", 
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <MedicationMaintenance />
          </ProtectedRoute>
        ) 
      },
      
      // ADMIN-ONLY: Data Recovery (technical)
      {
        path: "data-recovery",
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <DataRecovery />
          </ProtectedRoute>
        )
      },

      { path: "manual", element: <CareGiverManual /> },
      
      // ADMIN-ONLY: Provider Manual (clinical documentation)
      { 
        path: "provider-manual", 
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <ProviderManual />
          </ProtectedRoute>
        ) 
      },
      
      { path: "contact-admin", element: <ContactAdmin /> },
      { path: "login", element: <Login /> },
      { path: "patient-profile", element: <PatientProfile /> },
      { path: "calendar", element: <CalendarView /> },
      { path: "care-messaging", element: <CareMessaging /> },
      { path: "video-calls", element: <VideoCallCenter /> },
      
      // ADMIN-ONLY: Medication Hub (includes Schedule Settings tab)
      { 
        path: "medication-hub", 
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <MedicationHub />
          </ProtectedRoute>
        ) 
      },
      
      { path: "dose-event-verification", element: <DoseEventVerification /> },
      
      // ADMIN-ONLY ROUTES
      { 
        path: "clinical-operations", 
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <ClinicalOperations />
          </ProtectedRoute>
        ) 
      },
      { 
        path: "analytics", 
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <AnalyticsDashboard />
          </ProtectedRoute>
        ) 
      },
      { 
        path: "system-monitoring", 
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <SystemMonitoring />
          </ProtectedRoute>
        ) 
      },
      { 
        path: "system-settings", 
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <SystemSettings />
          </ProtectedRoute>
        ) 
      },
      { 
        path: "access-and-permissions", 
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <AccessAndPermissions />
          </ProtectedRoute>
        ) 
      },
      { 
        path: "security-center", 
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <SecurityCenter />
          </ProtectedRoute>
        ) 
      },
      { 
        path: "two-factor-auth", 
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <TwoFactorAuth />
          </ProtectedRoute>
        ) 
      },
      { 
        path: "data-governance", 
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <DataGovernance />
          </ProtectedRoute>
        ) 
      },
      { 
        path: "regulatory-compliance", 
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <RegulatoryCompliance />
          </ProtectedRoute>
        ) 
      },
      { 
        path: "legal-disclaimers", 
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <LegalDisclaimers />
          </ProtectedRoute>
        ) 
      },
      
      { path: "help-center", element: <HelpCenter /> },
      
      // ADMIN-ONLY: Setup Wizard (initial configuration)
      { 
        path: "setup-wizard", 
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <SetupWizard />
          </ProtectedRoute>
        ) 
      },
      { 
        path: "patient-onboarding-protocol", 
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <SetupWizard />
          </ProtectedRoute>
        ) 
      },
      
      { path: "device-setup-guide", element: <DeviceSetupGuideWithDownload /> },
      
      // ADMIN-ONLY: Testing tools
      { 
        path: "testing-tools", 
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <TestingTools />
          </ProtectedRoute>
        ) 
      },
      { 
        path: "diagnostic-test", 
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <DiagnosticTest />
          </ProtectedRoute>
        ) 
      },
      
      { path: "patient-device-dashboard", element: <PatientDeviceDashboard /> },
      
      // Legacy route aliases for backward compatibility
      { path: "care", element: <CareCoordination /> },
      { path: "vault", element: <HouseholdVault /> },
    ],
  },
  { path: "*", element: <NotFound /> },
]);

console.log('✅ Router initialized - RBAC route protection active');