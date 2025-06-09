import { NavigationHeader } from "@/components/navigation-header";
import { Sidebar } from "@/components/sidebar";
import { MetricsCards } from "@/components/metrics-cards";
import { LoadBoard } from "@/components/load-board";
import { DriverStatus } from "@/components/driver-status";
import { AIRateNegotiationPanel } from "@/components/ai-negotiation-panel";
import { SystemStatus } from "@/components/system-status";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <NavigationHeader />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Key Metrics Cards */}
            <MetricsCards />

            {/* Load Board and Driver Status Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <LoadBoard />
              <DriverStatus />
            </div>

            {/* AI Rate Negotiation Panel */}
            <AIRateNegotiationPanel />

            {/* System Status and Alerts */}
            <SystemStatus />
          </div>
        </main>
      </div>
    </div>
  );
}
