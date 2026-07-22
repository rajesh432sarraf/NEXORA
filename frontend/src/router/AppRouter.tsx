import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Layouts & Guards
import MainLayout from '../components/layout/MainLayout';
import AuthLayout from '../components/layout/AuthLayout';
import ProtectedRoute from '../components/guards/ProtectedRoute';
import LoadingSpinner from '../components/common/LoadingSpinner';

// Auth Pages
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';

// Error Pages
import NotFoundPage from '../pages/error/NotFoundPage';
import ServerErrorPage from '../pages/error/ServerErrorPage';
import UnauthorizedPage from '../pages/error/UnauthorizedPage';

// Lazy-Loaded Application Modules for Optimized Bundle Code-Splitting
const DashboardPage = lazy(() => import('../pages/dashboard/DashboardPage'));
const ProjectsPage = lazy(() => import('../pages/projects/ProjectsPage'));
const DocumentsPage = lazy(() => import('../pages/documents/DocumentsPage'));
const SearchPage = lazy(() => import('../pages/search/SearchPage'));
const CopilotPage = lazy(() => import('../pages/copilot/CopilotPage'));
const RFQsPage = lazy(() => import('../pages/procurement/RFQsPage'));
const PurchaseOrdersPage = lazy(() => import('../pages/procurement/PurchaseOrdersPage'));
const ProcurementItemsPage = lazy(() => import('../pages/procurement/ProcurementItemsPage'));
const TimelinePage = lazy(() => import('../pages/timeline/TimelinePage'));
const CompliancePage = lazy(() => import('../pages/compliance/CompliancePage'));
const VendorEvaluationPage = lazy(() => import('../pages/vendor-evaluation/VendorEvaluationPage'));
const RiskPage = lazy(() => import('../pages/risk/RiskPage'));
const ExecutiveInsightsPage = lazy(() => import('../pages/executive-insights/ExecutiveInsightsPage'));

// Suspense Fallback Container
const SuspenseFallback: React.FC = () => (
  <div className="w-full h-96 flex flex-col items-center justify-center space-y-4">
    <div className="p-4 rounded-full bg-obsidian-surface border border-obsidian-ai/30 shadow-ai-glow animate-pulse">
      <LoadingSpinner size="lg" />
    </div>
    <span className="text-xs font-mono tracking-widest text-obsidian-ai uppercase animate-pulse">
      Loading Module...
    </span>
  </div>
);

const PageMotionWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="w-full transition-all duration-300">
      {children}
    </div>
  );
};

const AppRouter: React.FC = () => {
  const location = useLocation();

  return (
    <Suspense fallback={<SuspenseFallback />}>
      <Routes>
        {/* Public Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<PageMotionWrapper><LoginPage /></PageMotionWrapper>} />
          <Route path="/auth/login" element={<PageMotionWrapper><LoginPage /></PageMotionWrapper>} />
          <Route path="/register" element={<PageMotionWrapper><RegisterPage /></PageMotionWrapper>} />
          <Route path="/auth/register" element={<PageMotionWrapper><RegisterPage /></PageMotionWrapper>} />
        </Route>

        {/* Protected Enterprise Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<PageMotionWrapper><DashboardPage /></PageMotionWrapper>} />
          <Route path="projects" element={<PageMotionWrapper><ProjectsPage /></PageMotionWrapper>} />
          <Route path="documents" element={<PageMotionWrapper><DocumentsPage /></PageMotionWrapper>} />
          <Route path="search" element={<PageMotionWrapper><SearchPage /></PageMotionWrapper>} />
          <Route path="copilot" element={<PageMotionWrapper><CopilotPage /></PageMotionWrapper>} />
          <Route path="rfqs" element={<PageMotionWrapper><RFQsPage /></PageMotionWrapper>} />
          <Route path="purchase-orders" element={<PageMotionWrapper><PurchaseOrdersPage /></PageMotionWrapper>} />
          <Route path="procurement" element={<PageMotionWrapper><ProcurementItemsPage /></PageMotionWrapper>} />
          <Route path="timeline" element={<PageMotionWrapper><TimelinePage /></PageMotionWrapper>} />
          <Route path="compliance" element={<PageMotionWrapper><CompliancePage /></PageMotionWrapper>} />
          <Route path="vendor-evaluation" element={<PageMotionWrapper><VendorEvaluationPage /></PageMotionWrapper>} />
          <Route path="risk" element={<PageMotionWrapper><RiskPage /></PageMotionWrapper>} />
          <Route path="executive-insights" element={<PageMotionWrapper><ExecutiveInsightsPage /></PageMotionWrapper>} />
        </Route>

        {/* Error Routes */}
        <Route path="/403" element={<UnauthorizedPage />} />
        <Route path="/500" element={<ServerErrorPage />} />
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRouter;
