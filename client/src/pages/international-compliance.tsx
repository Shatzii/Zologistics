import { RegionSelector } from "@/components/region-selector";

export default function InternationalCompliancePage() {
  return (
    <div className="min-h-screen bg-background driver-theme">
      <div className="p-6 bg-background">
        <RegionSelector />
      </div>
    </div>
  );
}