import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Common Fallback Component
import LoadingSpinner from '../components/common/LoadingSpinner';

// Layouts (Loaded eagerly for instant structure rendering)
import PublicLayout from '../layouts/PublicLayout';
import AuthLayout from '../layouts/AuthLayout';
import CandidateLayout from '../layouts/CandidateLayout';
import AdminLayout from '../layouts/AdminLayout';

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
          <Route path="/talent" element={<DiscoverTalentPage />} />
          <Route path="/discover-talent" element={<DiscoverTalentPage />} />
          <Route path="/saved-talent" element={<SavedTalentPage />} />
          <Route path="/talent/:id" element={<PublicCandidateProfilePage />} />
        </Route>

        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/recruiter/register" element={<SignUpPage />} />
          <Route path="/recruiter/login" element={<LoginPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/operations/login" element={<OperationsLoginPage />} />
          <Route path="/admin/operations/login" element={<Navigate to="/operations/login" replace />} />
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
        <Route path="/recruiter/talent" element={<Navigate to="/talent" replace />} />

        {/* Operations Route Aliases */}
        <Route path="/operations" element={<Navigate to="/admin/operations/support" replace />} />
        <Route path="/operations/support" element={<Navigate to="/admin/operations/support" replace />} />
        <Route path="/operations/dashboard" element={<Navigate to="/admin/operations/support" replace />} />

        {/* Candidate Routes */}
        <Route
          path="/candidate"
          element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['candidate', 'admin']}>
                <CandidateLayout />
              </RoleBasedRoute>
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<CandidateDashboardPage />} />
          <Route path="profile/setup" element={<ProfileSetupPage />} />
          <Route path="profile" element={<MyProfilePage />} />
          <Route path="profile/public" element={<PublicCandidateProfilePage />} />
          <Route path="profile/edit" element={<EditProfilePage />} />
          <Route path="saved-opportunities" element={<SavedOpportunitiesPage />} />
          <Route path="applications" element={<MyApplicationsPage />} />
          <Route path="applications/:id" element={<ApplicationDetailsPage />} />
          <Route path="messages" element={<MessagesPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="support" element={<CandidateSupportPage />} />
          <Route path="support/:id" element={<CandidateTicketDetailsPage />} />
        </Route>

        {/* Admin, Recruiter & Operations Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['admin', 'recruiter', 'operations']}>
                <AdminLayout />
              </RoleBasedRoute>
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="saved-talent" element={<SavedTalentPage />} />
          <Route path="candidates" element={<CandidatesPage />} />
          <Route path="candidates/:id" element={<CandidateDetailsPage />} />
          <Route path="opportunities" element={<AdminOpportunitiesPage />} />
          <Route path="opportunities/create" element={<CreateOpportunityPage />} />
          <Route path="opportunities/:id/edit" element={<EditOpportunityPage />} />
          <Route path="opportunities/:id/candidates" element={<RankedCandidatesPage />} />
          <Route path="candidates/ranked" element={<RankedCandidatesPage />} />
          <Route path="applications" element={<AdminApplicationsPage />} />
          <Route path="messages" element={<AdminMessagesPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
          <Route path="support" element={<RecruiterSupportPage />} />
          <Route path="support/:id" element={<RecruiterTicketDetailsPage />} />
          <Route
            path="operations/support"
            element={
              <RoleBasedRoute allowedRoles={['admin', 'operations']}>
                <OperationsSupportDashboardPage />
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
