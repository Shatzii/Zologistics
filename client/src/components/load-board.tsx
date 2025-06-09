import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RefreshCw, Brain, CheckCircle, AlertTriangle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Load } from "@shared/schema";

export function LoadBoard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: loads, isLoading } = useQuery({
    queryKey: ["/api/loads"],
    refetchInterval: 60000, // Refresh every minute
  });

  const scrapeMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/loads/scrape"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/loads"] });
      toast({
        title: "Load board refreshed",
        description: "Successfully scraped latest loads",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to refresh load board",
        variant: "destructive",
      });
    },
  });

  const assignMutation = useMutation({
    mutationFn: ({ loadId, driverId }: { loadId: number; driverId: number }) =>
      apiRequest("POST", `/api/loads/${loadId}/assign`, { driverId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/loads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/drivers"] });
      toast({
        title: "Load assigned",
        description: "Driver has been assigned to the load",
      });
    },
  });

  const getMatchBadge = (matchScore?: number) => {
    if (!matchScore) return null;
    
    if (matchScore >= 90) {
      return (
        <Badge className="match-high">
          <CheckCircle className="w-3 h-3 mr-1" />
          {matchScore}% Match
        </Badge>
      );
    } else if (matchScore >= 75) {
      return (
        <Badge className="match-medium">
          <AlertTriangle className="w-3 h-3 mr-1" />
          {matchScore}% Match
        </Badge>
      );
    } else {
      return (
        <Badge className="match-low">
          <AlertTriangle className="w-3 h-3 mr-1" />
          {matchScore}% Match
        </Badge>
      );
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Available Loads</CardTitle>
        </CardHeader>
        <CardContent className="animate-pulse">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Available Loads</CardTitle>
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => scrapeMutation.mutate()}
              disabled={scrapeMutation.isPending}
              className="text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${scrapeMutation.isPending ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              size="sm"
              variant="outline" 
              className="text-orange-600 border-orange-200 hover:bg-orange-50"
            >
              <Brain className="w-4 h-4 mr-1" />
              AI Filter
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Origin → Destination</TableHead>
              <TableHead>Miles</TableHead>
              <TableHead>Rate</TableHead>
              <TableHead>Match</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loads?.map((load: Load) => (
              <TableRow key={load.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <TableCell>
                  <div>
                    <div className="font-medium">{load.origin} → {load.destination}</div>
                    <div className="text-sm text-gray-500">
                      Pickup: {new Date(load.pickupTime).toLocaleDateString()} {new Date(load.pickupTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-mono">{load.miles}</TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">${load.rate}</div>
                    <div className="text-sm text-gray-500 font-mono">${load.ratePerMile}/mi</div>
                  </div>
                </TableCell>
                <TableCell>
                  {getMatchBadge(load.matchScore)}
                </TableCell>
                <TableCell>
                  {load.status === 'available' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-blue-600 hover:text-blue-700"
                      onClick={() => assignMutation.mutate({ loadId: load.id, driverId: 1 })} // For demo, assign to first driver
                      disabled={assignMutation.isPending}
                    >
                      Assign
                    </Button>
                  )}
                  {load.status === 'assigned' && (
                    <Badge variant="outline">Assigned</Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {(!loads || loads.length === 0) && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <div className="text-gray-500">
                    No loads available. Try refreshing the load board.
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
