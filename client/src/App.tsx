import { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { EnhancedSidebar } from "@/components/enhanced-sidebar";
import { QuickCommandPalette } from "@/components/quick-command-palette";

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
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
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
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <div className="driver-theme min-h-screen">
            <Toaster />
            <Router />
          </div>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
