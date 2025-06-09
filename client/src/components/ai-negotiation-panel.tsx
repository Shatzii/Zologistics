import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Bot, Clock, DollarSign } from "lucide-react";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function AIRateNegotiationPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [minRateIncrease, setMinRateIncrease] = useState([8]);
  const [aggressiveness, setAggressiveness] = useState("balanced");
  const [autoNegotiate, setAutoNegotiate] = useState(false);

  const { data: negotiations } = useQuery({
    queryKey: ["/api/negotiations"],
    refetchInterval: 30000,
  });

  const { data: loads } = useQuery({
    queryKey: ["/api/loads"],
  });

  const negotiateMutation = useMutation({
    mutationFn: (loadId: number) => apiRequest("POST", "/api/negotiate-rate", { loadId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/negotiations"] });
      toast({
        title: "AI Negotiation Started",
        description: "Rate analysis is in progress",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to start negotiation",
        variant: "destructive",
      });
    },
  });

  // Get the most recent active negotiation
  const activeNegotiation = negotiations?.find((n: any) => n.status === 'in_progress');
  const associatedLoad = activeNegotiation && loads?.find((l: any) => l.id === activeNegotiation.loadId);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>AI Rate Negotiation</CardTitle>
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <Bot className="w-4 h-4 text-blue-500" />
            <span>Powered by GPT-4o</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Current Negotiation */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 dark:text-white">Active Negotiation</h4>
            {activeNegotiation && associatedLoad ? (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Load #{associatedLoad.externalId}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {associatedLoad.origin} → {associatedLoad.destination}
                    </p>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-600/20 dark:text-yellow-400">
                    <Clock className="w-3 h-3 mr-1" />
                    In Progress
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Initial Rate:</span>
                    <span className="font-mono text-gray-900 dark:text-white">
                      ${activeNegotiation.originalRate} (${associatedLoad.ratePerMile}/mi)
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">AI Suggested:</span>
                    <span className="font-mono text-green-600 dark:text-green-400">
                      ${activeNegotiation.suggestedRate} 
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Market Rate:</span>
                    <span className="font-mono text-gray-900 dark:text-white">
                      ${(parseFloat(associatedLoad.ratePerMile) * 1.05).toFixed(2)}/mi
                    </span>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">AI Analysis:</p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {activeNegotiation.aiAnalysis || "Analysis in progress..."}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center">
                <p className="text-gray-500 dark:text-gray-400">No active negotiations</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  Start a negotiation from the load board
                </p>
              </div>
            )}
          </div>

          {/* Negotiation Controls */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 dark:text-white">Negotiation Settings</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Minimum Rate Increase
                </label>
                <div className="flex items-center space-x-2">
                  <Slider
                    value={minRateIncrease}
                    onValueChange={setMinRateIncrease}
                    max={20}
                    min={0}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-sm font-mono text-gray-900 dark:text-white w-8">
                    {minRateIncrease[0]}%
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Negotiation Aggressiveness
                </label>
                <Select value={aggressiveness} onValueChange={setAggressiveness}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="conservative">Conservative</SelectItem>
                    <SelectItem value="balanced">Balanced</SelectItem>
                    <SelectItem value="aggressive">Aggressive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="auto-negotiate"
                  checked={autoNegotiate}
                  onCheckedChange={setAutoNegotiate}
                />
                <label
                  htmlFor="auto-negotiate"
                  className="text-sm text-gray-700 dark:text-gray-300"
                >
                  Enable auto-negotiation for matches >90%
                </label>
              </div>

              <div className="pt-4 space-y-2">
                <Button
                  className="w-full"
                  onClick={() => {
                    // For demo, negotiate on the first available load
                    const availableLoad = loads?.find((l: any) => l.status === 'available');
                    if (availableLoad) {
                      negotiateMutation.mutate(availableLoad.id);
                    } else {
                      toast({
                        title: "No loads available",
                        description: "Add some loads to start negotiation",
                        variant: "destructive",
                      });
                    }
                  }}
                  disabled={negotiateMutation.isPending}
                >
                  <Bot className="w-4 h-4 mr-2" />
                  Start AI Negotiation
                </Button>
                <Button variant="outline" className="w-full">
                  View Negotiation History
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
