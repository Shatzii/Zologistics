import { AdvancedComplianceDashboard } from "@/components/advanced-compliance-dashboard";

export default function AdvancedCompliancePage() {
  return (
    <div className="min-h-screen bg-background driver-theme">
      <div className="p-6 bg-background">
        <AdvancedComplianceDashboard />
      </div>
    </div>
  );
}