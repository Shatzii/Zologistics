import { SelfHostedAIDashboard } from "@/components/self-hosted-ai-dashboard";

export default function SelfHostedAIPage() {
  return (
    <div className="min-h-screen bg-background driver-theme">
      <div className="p-6 bg-background">
        <SelfHostedAIDashboard />
      </div>
    </div>
  );
}