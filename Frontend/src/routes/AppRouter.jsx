import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Common Fallback Component
import LoadingSpinner from '../components/common/LoadingSpinner';

// Layouts (Loaded eagerly for instant structure rendering)
import PublicLayout from '../layouts/PublicLayout';
import AuthLayout from '../layouts/AuthLayout';
import CandidateLayout from '../layouts/CandidateLayout';
import AdminLayout from '../layouts/AdminLayout';
import SupportLayout from '../layouts/SupportLayout';

// Route Guards
import ProtectedRoute from './ProtectedRoute';
import RoleBasedRoute from './RoleBasedRoute';

// Lazy-Loaded Public Pages
const HomePage = lazy(() => import('../pages/public/HomePage'));
const AboutPage = lazy(() => import('../pages/public/AboutPage'));
const HowItWorksPage = lazy(() => import('../pages/public/HowItWorksPage'));
const ContactPage = lazy(() => import('../pages/public/ContactPage'));
const PostJobPage = lazy(() => import('../pages/public/PostJobPage'));
const PaymentPage = lazy(() => import('../pages/public/PaymentPage'));
const PaymentCallbackPage = lazy(() => import('../pages/public/PaymentCallbackPage'));
const DesignSystemPage = lazy(() => import('../pages/public/DesignSystemPage'));
const DiscoverTalentPage = lazy(() => import('../pages/public/DiscoverTalentPage'));
const SavedTalentPage = lazy(() => import('../pages/admin/SavedTalentPage'));

// Lazy-Loaded Opportunities Pages
const OpportunitiesPage = lazy(() => import('../pages/opportunities/OpportunitiesPage'));
const OpportunityDetailsPage = lazy(() => import('../pages/opportunities/OpportunityDetailsPage'));

// Lazy-Loaded Auth Pages
const SignUpPage = lazy(() => import('../pages/auth/SignUpPage'));
const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const AdminLoginPage = lazy(() => import('../pages/auth/AdminLoginPage'));
const OperationsLoginPage = lazy(() => import('../pages/auth/OperationsLoginPage'));
const ForgotPasswordPage = lazy(() => import('../pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('../pages/auth/ResetPasswordPage'));
const EmailVerificationPage = lazy(() => import('../pages/auth/EmailVerificationPage'));

// Lazy-Loaded Candidate Pages
const CandidateDashboardPage = lazy(() => import('../pages/candidate/DashboardPage'));
const ProfileSetupPage = lazy(() => import('../pages/candidate/ProfileSetupPage'));
const MyProfilePage = lazy(() => import('../pages/candidate/MyProfilePage'));
const EditProfilePage = lazy(() => import('../pages/candidate/EditProfilePage'));
const SavedOpportunitiesPage = lazy(() => import('../pages/candidate/SavedOpportunitiesPage'));
const MyApplicationsPage = lazy(() => import('../pages/candidate/MyApplicationsPage'));
const ApplicationDetailsPage = lazy(() => import('../pages/candidate/ApplicationDetailsPage'));
const MessagesPage = lazy(() => import('../pages/candidate/MessagesPage'));
const NotificationsPage = lazy(() => import('../pages/candidate/NotificationsPage'));
const SettingsPage = lazy(() => import('../pages/candidate/SettingsPage'));
const PublicCandidateProfilePage = lazy(() => import('../pages/candidate/PublicCandidateProfilePage'));
const CandidateSupportPage = lazy(() => import('../pages/candidate/CandidateSupportPage'));
const CandidateTicketDetailsPage = lazy(() => import('../pages/candidate/CandidateTicketDetailsPage'));

// Lazy-Loaded Admin Pages
const AdminDashboardPage = lazy(() => import('../pages/admin/AdminDashboardPage'));
const CandidatesPage = lazy(() => import('../pages/admin/CandidatesPage'));
const CandidateDetailsPage = lazy(() => import('../pages/admin/CandidateDetailsPage'));
const AdminOpportunitiesPage = lazy(() => import('../pages/admin/AdminOpportunitiesPage'));
const CreateOpportunityPage = lazy(() => import('../pages/admin/CreateOpportunityPage'));
const EditOpportunityPage = lazy(() => import('../pages/admin/EditOpportunityPage'));
const RankedCandidatesPage = lazy(() => import('../pages/admin/RankedCandidatesPage'));
const AdminApplicationsPage = lazy(() => import('../pages/admin/AdminApplicationsPage'));
const AdminMessagesPage = lazy(() => import('../pages/admin/AdminMessagesPage'));
const AdminSettingsPage = lazy(() => import('../pages/admin/AdminSettingsPage'));
const RecruiterSupportPage = lazy(() => import('../pages/admin/RecruiterSupportPage'));
const RecruiterTicketDetailsPage = lazy(() => import('../pages/admin/RecruiterTicketDetailsPage'));
const OperationsSupportDashboardPage = lazy(() => import('../pages/admin/OperationsSupportDashboardPage'));
const UsersPage = lazy(() => import('../pages/admin/UsersPage'));
const CompaniesPage = lazy(() => import('../pages/admin/CompaniesPage'));
const PaymentsPage = lazy(() => import('../pages/admin/PaymentsPage'));
const VerificationsPage = lazy(() => import('../pages/admin/VerificationsPage'));
const AnalyticsPage = lazy(() => import('../pages/admin/AnalyticsPage'));
const RolesPermissionsPage = lazy(() => import('../pages/admin/RolesPermissionsPage'));
const ActivityLogsPage = lazy(() => import('../pages/admin/ActivityLogsPage'));
const AdminNotificationsPage = lazy(() => import('../pages/admin/AdminNotificationsPage'));
const NotificationsCMSPage = lazy(() => import('../pages/admin/NotificationsCMSPage'));
const ArtistsManagementPage = lazy(() => import('../pages/admin/ArtistsManagementPage'));

// Lazy-Loaded Support Portal Pages (PoLP Support Roles)
const SupportLoginPage = lazy(() => import('../pages/support/SupportLoginPage'));
const SupportDashboardPage = lazy(() => import('../pages/support/SupportDashboardPage'));
const SupportTicketsPage = lazy(() => import('../pages/support/SupportTicketsPage'));
const SupportTicketDetailPage = lazy(() => import('../pages/support/SupportTicketDetailPage'));
const SupportKnowledgeBasePage = lazy(() => import('../pages/support/SupportKnowledgeBasePage'));
const SupportHelpPage = lazy(() => import('../pages/support/SupportHelpPage'));
const SupportTeamPage = lazy(() => import('../pages/support/SupportTeamPage'));
const SupportTeamReportsPage = lazy(() => import('../pages/support/SupportTeamReportsPage'));
const SupportTeamSettingsPage = lazy(() => import('../pages/support/SupportTeamSettingsPage'));

// Lazy-Loaded Error Pages
const NotFoundPage = lazy(() => import('../pages/errors/NotFoundPage'));
const UnauthorizedPage = lazy(() => import('../pages/errors/UnauthorizedPage'));

const PageFallback = () => (
  <LoadingSpinner message="Loading..." className="min-h-[60vh]" />
);

const AppRouter = () => {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/opportunities" element={<OpportunitiesPage />} />
          <Route path="/casting-calls" element={<OpportunitiesPage />} />
          <Route path="/opportunities/:id" element={<OpportunityDetailsPage />} />
          <Route path="/casting-calls/:id" element={<OpportunityDetailsPage />} />
          <Route path="/post-job" element={<PostJobPage />} />
          <Route path="/announce-work" element={<PostJobPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/payment/callback" element={<PaymentCallbackPage />} />
          <Route path="/escrow-payment" element={<PaymentPage />} />
          <Route path="/design-system" element={<DesignSystemPage />} />
          <Route path="/talent" element={<Navigate to="/admin/talent" replace />} />
          <Route path="/discover-talent" element={<Navigate to="/admin/talent" replace />} />
          <Route
            path="/saved-talent"
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['recruiter', 'admin', 'super_admin']}>
                  <SavedTalentPage />
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          />
          <Route path="/talent/:id" element={<PublicCandidateProfilePage />} />
        </Route>

        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/recruiter/register" element={<SignUpPage />} />
          <Route path="/recruiter/login" element={<LoginPage />} />
          <Route path="/admin" element={<AdminLoginPage />} />
          <Route path="/admin/login" element={<Navigate to="/admin" replace />} />
          <Route path="/operations/login" element={<OperationsLoginPage />} />
          <Route path="/admin/operations/login" element={<Navigate to="/operations/login" replace />} />
          <Route path="/support/login" element={<SupportLoginPage />} />
          <Route path="/verify-email" element={<EmailVerificationPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Route>

        {/* Recruiter Route Aliases */}
        <Route path="/recruiter" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/recruiter/dashboard" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/recruiter/opportunities" element={<Navigate to="/admin/opportunities" replace />} />
        <Route path="/recruiter/applications" element={<Navigate to="/admin/applications" replace />} />
        <Route path="/recruiter/post-job" element={<Navigate to="/post-job" replace />} />
        <Route path="/recruiter/talent" element={<Navigate to="/admin/talent" replace />} />

        {/* Operations Route Aliases */}
        <Route path="/operations" element={<Navigate to="/admin/operations/support" replace />} />
        <Route path="/operations/support" element={<Navigate to="/admin/operations/support" replace />} />
        <Route path="/operations/dashboard" element={<Navigate to="/admin/operations/support" replace />} />

        {/* Candidate Routes */}
        <Route
          path="/candidate"
          element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['candidate', 'talent', 'user', 'admin', 'super_admin']}>
                <CandidateLayout />
              </RoleBasedRoute>
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<CandidateDashboardPage />} />
          <Route path="casting-calls" element={<OpportunitiesPage />} />
          <Route path="casting-calls/:id" element={<OpportunityDetailsPage />} />
          <Route path="opportunities" element={<OpportunitiesPage />} />
          <Route path="opportunities/:id" element={<OpportunityDetailsPage />} />
          <Route path="profile/setup" element={<ProfileSetupPage />} />
          <Route path="profile" element={<MyProfilePage />} />
          <Route path="profile/public" element={<PublicCandidateProfilePage />} />
          <Route path="profile/edit" element={<EditProfilePage />} />
          <Route path="saved-opportunities" element={<SavedOpportunitiesPage />} />
          <Route path="jobs" element={<MyApplicationsPage />} />
          <Route path="company-jobs" element={<MyApplicationsPage />} />
          <Route path="applications" element={<MyApplicationsPage />} />
          <Route path="applications/:id" element={<ApplicationDetailsPage />} />
          <Route path="messages" element={<MessagesPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="support" element={<CandidateSupportPage />} />
          <Route path="support/:id" element={<CandidateTicketDetailsPage />} />
        </Route>

        {/* Admin, Recruiter, Operations & Super Admin Routes (14 Dedicated Modules) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute redirectTo="/admin">
              <RoleBasedRoute allowedRoles={['super_admin', 'admin', 'recruiter', 'operations']}>
                <AdminLayout />
              </RoleBasedRoute>
            </ProtectedRoute>
          }
        >
          {/* Module 01: Overview */}
          <Route path="dashboard" element={<AdminDashboardPage />} />

          {/* Module 02: User Management */}
          <Route path="users" element={<UsersPage />} />

          {/* Module 03: Artists & Talent */}
          <Route path="artists" element={<ArtistsManagementPage />} />
          <Route path="talent" element={<ArtistsManagementPage />} />
          <Route path="discover-talent" element={<DiscoverTalentPage />} />
          <Route path="saved-talent" element={<SavedTalentPage />} />
          <Route path="candidates" element={<CandidatesPage />} />
          <Route path="candidates/:id" element={<CandidateDetailsPage />} />

          {/* Module 04: Production Companies */}
          <Route path="companies" element={<CompaniesPage />} />

          {/* Module 05: Casting Calls */}
          <Route path="casting-calls" element={<AdminOpportunitiesPage />} />
          <Route path="opportunities" element={<AdminOpportunitiesPage />} />
          <Route
            path="opportunities/create"
            element={
              <RoleBasedRoute requiredPermissions="opportunity:create">
                <CreateOpportunityPage />
              </RoleBasedRoute>
            }
          />
          <Route
            path="opportunities/:id/edit"
            element={
              <RoleBasedRoute requiredPermissions="opportunity:update">
                <EditOpportunityPage />
              </RoleBasedRoute>
            }
          />
          <Route path="opportunities/:id/candidates" element={<RankedCandidatesPage />} />
          <Route path="candidates/ranked" element={<RankedCandidatesPage />} />

          {/* Module 06: Application Management */}
          <Route path="applications" element={<AdminApplicationsPage />} />

          {/* Module 07: Payments & Transactions */}
          <Route path="payments" element={<PaymentsPage />} />

          {/* Module 08: Verification & Approvals */}
          <Route path="verifications" element={<VerificationsPage />} />

          {/* Module 09: Support Management */}
          <Route path="support" element={<OperationsSupportDashboardPage />} />
          <Route path="support/:id" element={<RecruiterTicketDetailsPage />} />
          <Route path="operations/support" element={<OperationsSupportDashboardPage />} />

          {/* Module 10: Notifications & CMS */}
          <Route path="notifications" element={<NotificationsCMSPage />} />
          <Route path="messages" element={<AdminMessagesPage />} />

          {/* Module 11: Analytics & Reports */}
          <Route path="analytics" element={<AnalyticsPage />} />

          {/* Module 12: Roles & Permissions */}
          <Route path="permissions" element={<RolesPermissionsPage />} />
          <Route path="roles" element={<RolesPermissionsPage />} />

          {/* Module 13: Activity Logs */}
          <Route path="activity-logs" element={<ActivityLogsPage />} />
          <Route path="audit-logs" element={<ActivityLogsPage />} />

          {/* Module 14: Platform Settings */}
          <Route path="settings" element={<AdminSettingsPage />} />
          <Route path="security" element={<AdminSettingsPage />} />
          <Route path="access-control" element={<Navigate to="/admin/permissions" replace />} />
        </Route>

        {/* Support Management System (PoLP Enforced) */}
        <Route
          path="/support"
          element={
            <ProtectedRoute redirectTo="/support/login">
              <RoleBasedRoute allowedRoles={['support_agent', 'support_lead', 'super_admin', 'admin', 'operations']}>
                <SupportLayout />
              </RoleBasedRoute>
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<SupportDashboardPage />} />
          <Route path="my-tickets" element={<SupportTicketsPage />} />
          <Route path="tickets" element={<SupportTicketsPage />} />
          <Route path="tickets/:id" element={<SupportTicketDetailPage />} />
          <Route path="assigned" element={<SupportTicketsPage />} />
          <Route path="escalations" element={<SupportTicketsPage />} />
          <Route path="knowledge-base" element={<SupportKnowledgeBasePage />} />
          <Route path="help" element={<SupportHelpPage />} />

          {/* Support Lead Only Routes */}
          <Route
            path="team"
            element={
              <RoleBasedRoute allowedRoles={['support_lead', 'super_admin', 'admin']}>
                <SupportTeamPage />
              </RoleBasedRoute>
            }
          />
          <Route
            path="team/reports"
            element={
              <RoleBasedRoute allowedRoles={['support_lead', 'super_admin', 'admin']}>
                <SupportTeamReportsPage />
              </RoleBasedRoute>
            }
          />
          <Route
            path="team/settings"
            element={
              <RoleBasedRoute allowedRoles={['support_lead', 'super_admin', 'admin']}>
                <SupportTeamSettingsPage />
              </RoleBasedRoute>
            }
          />
        </Route>

        {/* Error & Fallback Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default AppRouter;
