import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { ROUTES, isValidRoute } from "@/config/routes";

// Import all page components
import Dashboard from "@/pages/dashboard";
import LoadsPage from "@/pages/loads";
import DriversPage from "@/pages/drivers";
import NegotiationsPage from "@/pages/negotiations";
import AnalyticsPage from "@/pages/analytics";
import ReportsPage from "@/pages/reports";
import SettingsPage from "@/pages/settings";
import NotFound from "@/pages/not-found";
import { Sidebar } from "@/components/sidebar";
import { NavigationHeader } from "@/components/navigation-header";

function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const isMobile = location.startsWith('/mobile');
  
  if (isMobile) {
    return <div className="min-h-screen bg-background">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <NavigationHeader />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

function Router() {
  const [location] = useLocation();
  
  // Redirect invalid routes to 404
  if (!isValidRoute(location) && location !== '/404') {
    return <Route path="*" component={NotFound} />;
  }

  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/loads" component={LoadsPage} />
        <Route path="/drivers" component={DriversPage} />
        <Route path="/negotiations" component={NegotiationsPage} />
        <Route path="/analytics" component={AnalyticsPage} />
        <Route path="/reports" component={ReportsPage} />
        <Route path="/settings" component={SettingsPage} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
