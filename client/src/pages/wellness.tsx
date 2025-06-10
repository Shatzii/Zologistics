import { PersonalizedWellnessDashboard } from "@/components/personalized-wellness-dashboard";

export default function WellnessPage() {
  return (
    <div className="min-h-screen bg-background driver-theme">
      <div className="p-6 bg-background">
        <PersonalizedWellnessDashboard />
      </div>
    </div>
  );
}