import React, { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { EnhancedSidebar } from "@/components/enhanced-sidebar";
import { QuickCommandPalette } from "@/components/quick-command-palette";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { LanguageToggle } from "@/components/LanguageToggle";
import { ConfidentialityPopup } from "@/components/ConfidentialityPopup";

// Import available page components
import Dashboard from "@/pages/dashboard";
import LoadsPage from "@/pages/loads";
import DriversPage from "@/pages/drivers";
import NegotiationsPage from "@/pages/negotiations";
import AnalyticsPage from "@/pages/analytics";
import ReportsPage from "@/pages/reports";
import SettingsPage from "@/pages/settings";
import NotFound from "@/pages/not-found";
import { DriverWellnessDashboard } from "@/components/driver-wellness-dashboard";
import { DriverPainPointSolutions } from "@/components/driver-pain-point-solutions";
import EnhancedDriversPage from "@/pages/enhanced-drivers";
import WellnessPage from "@/pages/wellness";
import RevolutionaryFeaturesPage from "@/pages/revolutionary-features";
import SelfHostedAIPage from "@/pages/self-hosted-ai";
import InternationalCompliancePage from "@/pages/international-compliance";
import AdvancedCompliancePage from "@/pages/advanced-compliance";
import InternationalRegionsPage from "@/pages/international-regions";
import CollaborativeNetworkPage from "@/pages/collaborative-network";
import MultiVehicleBrokeragePage from "@/pages/multi-vehicle-brokerage";
import ProductionDashboardPage from "@/pages/production-dashboard";
import LoadSourcesIntegrationPage from "@/pages/load-sources-integration";
import DriverMarketingPage from "@/pages/driver-marketing";
import DriverLoadsDashboardPage from "@/pages/driver-loads-dashboard";
import Web3BlockchainDashboard from "@/pages/web3-blockchain-dashboard";
import GhostLoads from "@/pages/ghost-loads";
import ReferralDashboard from "@/pages/referral-dashboard";
import LoadBoardOptimizer from "@/pages/load-board-optimizer";
import BackhaulOptimizer from "@/pages/backhaul-optimizer";
import InternationalLoadBoards from "@/pages/international-load-boards";
import GlobalValuationDashboard from "@/pages/global-valuation-dashboard";
import EarningsSimulator from "@/pages/earnings-simulator";
import DriverEarningsSimulator from "@/pages/driver-earnings-simulator";
import LiveTrackingDashboard from "@/pages/live-tracking-dashboard";
import DirectShipperDashboard from "@/pages/direct-shipper-dashboard";
import LoadBoardManagement from "@/pages/load-board-management";
import EnhancedWellnessDashboard from "@/pages/enhanced-wellness-dashboard";
import DeploymentDashboard from "@/pages/deployment-dashboard";
import MobileDriverApp from "@/pages/mobile-driver-app";
import CustomerPortal from "@/pages/customer-portal";
import PlatformImprovements from "@/pages/platform-improvements";
import VoiceAssistant from "@/pages/voice-assistant";
import PaymentProcessingDashboard from "@/pages/payment-processing-dashboard";
import EnhancedAnalyticsDashboard from "@/pages/enhanced-analytics-dashboard";
import PredictiveMaintenanceDashboard from "@/pages/predictive-maintenance-dashboard";
import MultiLanguageDashboard from "@/pages/multi-language-dashboard";
import ComplianceMonitoringDashboard from "@/pages/compliance-monitoring-dashboard";
import CreateDriverPage from "@/pages/create-driver";
import FeaturesDashboard from "@/pages/features-dashboard";
import LoadProbabilityDashboard from "@/pages/load-probability-dashboard";
import LoadBoardDashboard from "@/pages/LoadBoardDashboard";
import CarrierRegistrationDashboard from "@/pages/carrier-registration-dashboard";
import OpenSourceELDDashboard from "@/pages/open-source-eld-dashboard";
import CarrierSolutionsDashboard from "@/pages/carrier-solutions-dashboard";
import FeatureCompletionDashboard from "@/pages/feature-completion-dashboard";
import MultiModalLogistics from "@/pages/multi-modal-logistics";
import AdminPanel from "@/pages/admin";
import PaymentsPage from "@/pages/payments";
import SecretsConfig from "@/pages/secrets-config";
import BusinessLanding from "@/pages/business-landing";
import InvestorOverview from "@/pages/investor-overview";
import AcquisitionOverview from "@/pages/acquisition-overview";
import Demo from "@/pages/demo";
import AdminLogin from "@/pages/admin-login";
import AdminTwoFactorSettings from "@/pages/admin-2fa-settings";
import { useAdminAuth } from "@/hooks/useAdminAuth";

function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [location] = useLocation();
  
  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
      if (e.key === 'Escape') {
        setCommandPaletteOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Check if current route is mobile
  const isMobile = location.startsWith('/mobile');
  
  if (isMobile) {
    return <div className="min-h-screen bg-background">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-background flex driver-theme">
      <EnhancedSidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      <div className="flex-1 flex flex-col bg-background">
        {/* Language Toggle Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3 flex justify-end">
          <LanguageToggle />
        </div>
        <main className="flex-1 overflow-auto bg-background">
          {children}
        </main>
      </div>
      <QuickCommandPalette 
        open={commandPaletteOpen} 
        onOpenChange={setCommandPaletteOpen} 
      />
    </div>
  );
}

function Router() {
  const [showConfidentialityPopup, setShowConfidentialityPopup] = useState(false);
  const [location] = useLocation();
  const { isAuthenticated, isLoading } = useAdminAuth();
  
  // Check for NDA acceptance on mount
  useEffect(() => {
    const hasAccepted = localStorage.getItem('truckflowNdaAccepted') === 'true';
    if (!hasAccepted) {
      setShowConfidentialityPopup(true);
    }
  }, []);

  const handlePopupAccept = () => {
    setShowConfidentialityPopup(false);
  };

  // Business landing pages (no sidebar/layout)
  const isBusinessPage = location === '/' || location === '/investor-overview' || location === '/acquisition-overview' || location === '/demo' || location === '/admin-login';

  return (
    <>
      {isBusinessPage ? (
        <Switch>
          <Route path="/" component={BusinessLanding} />
          <Route path="/investor-overview" component={InvestorOverview} />
          <Route path="/acquisition-overview" component={AcquisitionOverview} />
          <Route path="/demo" component={Demo} />
          <Route path="/admin-login" component={AdminLogin} />
        </Switch>
      ) : (
        isAuthenticated ? (
        <AppLayout>
          <Switch>
            <Route path="/platform" component={Dashboard} />
          <Route path="/loads" component={LoadsPage} />
          <Route path="/drivers" component={DriversPage} />
          <Route path="/enhanced-drivers" component={EnhancedDriversPage} />
          <Route path="/negotiations" component={NegotiationsPage} />
          <Route path="/analytics" component={AnalyticsPage} />
          <Route path="/reports" component={ReportsPage} />
          <Route path="/settings" component={SettingsPage} />
          <Route path="/wellness" component={DriverWellnessDashboard} />
          <Route path="/personalized-wellness" component={WellnessPage} />
          <Route path="/revolutionary-features" component={RevolutionaryFeaturesPage} />
          <Route path="/self-hosted-ai" component={SelfHostedAIPage} />
          <Route path="/international-compliance" component={InternationalCompliancePage} />
          <Route path="/advanced-compliance" component={AdvancedCompliancePage} />
          <Route path="/international-regions" component={InternationalRegionsPage} />
          <Route path="/collaborative-network" component={CollaborativeNetworkPage} />
          <Route path="/multi-vehicle-brokerage" component={MultiVehicleBrokeragePage} />
          <Route path="/production-dashboard" component={ProductionDashboardPage} />
          <Route path="/load-sources" component={LoadSourcesIntegrationPage} />
          <Route path="/driver-marketing" component={DriverMarketingPage} />
          <Route path="/driver-loads" component={DriverLoadsDashboardPage} />
          <Route path="/web3-blockchain" component={Web3BlockchainDashboard} />
          <Route path="/ghost-loads" component={GhostLoads} />
          <Route path="/driver-solutions" component={DriverPainPointSolutions} />
          <Route path="/referral-dashboard" component={ReferralDashboard} />
          <Route path="/load-board-optimizer" component={LoadBoardOptimizer} />
          <Route path="/backhaul-optimizer" component={BackhaulOptimizer} />
          <Route path="/international-load-boards" component={InternationalLoadBoards} />
          <Route path="/global-valuation" component={GlobalValuationDashboard} />
          <Route path="/earnings-simulator" component={EarningsSimulator} />
          <Route path="/driver-earnings" component={DriverEarningsSimulator} />
          <Route path="/live-tracking" component={LiveTrackingDashboard} />
          <Route path="/direct-shipper-dashboard" component={DirectShipperDashboard} />
          <Route path="/load-board-management" component={LoadBoardManagement} />
          <Route path="/enhanced-wellness" component={EnhancedWellnessDashboard} />
          <Route path="/deployment" component={DeploymentDashboard} />
          <Route path="/mobile-app" component={MobileDriverApp} />
          <Route path="/customer-portal" component={CustomerPortal} />
          <Route path="/improvements" component={PlatformImprovements} />
          <Route path="/voice-assistant" component={VoiceAssistant} />
          <Route path="/payment-processing" component={PaymentProcessingDashboard} />
          <Route path="/enhanced-analytics" component={EnhancedAnalyticsDashboard} />
          <Route path="/predictive-maintenance" component={PredictiveMaintenanceDashboard} />
          <Route path="/multi-language" component={MultiLanguageDashboard} />
          <Route path="/compliance-monitoring" component={ComplianceMonitoringDashboard} />
          <Route path="/drivers/create" component={CreateDriverPage} />
          <Route path="/features" component={FeaturesDashboard} />
          <Route path="/load-probability" component={LoadProbabilityDashboard} />
          <Route path="/ai-load-board" component={LoadBoardDashboard} />
          <Route path="/carrier-registration" component={CarrierRegistrationDashboard} />
          <Route path="/open-source-eld" component={OpenSourceELDDashboard} />
          <Route path="/carrier-solutions" component={CarrierSolutionsDashboard} />
          <Route path="/feature-completion" component={FeatureCompletionDashboard} />
          <Route path="/multi-modal" component={MultiModalLogistics} />
          <Route path="/global-expansion" component={() => {
            const GlobalExpansion = React.lazy(() => import("./pages/global-expansion"));
            return <GlobalExpansion />;
          }} />
          <Route path="/admin" component={AdminPanel} />
          <Route path="/admin-2fa-settings" component={AdminTwoFactorSettings} />
          <Route path="/secrets-config" component={SecretsConfig} />
          <Route path="/payments" component={PaymentsPage} />
          <Route component={NotFound} />
        </Switch>
        </AppLayout>
        ) : (
          <AdminLogin />
        )
      )}
      
      {showConfidentialityPopup && (
        <ConfidentialityPopup onAccept={handlePopupAccept} />
      )}
    </>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <TooltipProvider>
            <div className="driver-theme min-h-screen">
              <Toaster />
              <Router />
            </div>
          </TooltipProvider>
        </LanguageProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
