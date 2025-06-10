import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MessageSquare, TrendingUp, DollarSign, Target } from "lucide-react";
import { Link } from "wouter";
import type { Negotiation } from "@shared/schema";

export default function NegotiationsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: negotiations, isLoading } = useQuery<Negotiation[]>({
    queryKey: ["/api/negotiations"],
  });

  const filteredNegotiations = negotiations?.filter(negotiation => {
    const matchesSearch = negotiation.originalRate.includes(searchTerm) ||
                         negotiation.suggestedRate.includes(searchTerm);
    const matchesStatus = statusFilter === "all" || negotiation.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in_progress": return "bg-blue-100 text-blue-800";
      case "accepted": return "bg-green-100 text-green-800";
      case "rejected": return "bg-red-100 text-red-800";
      case "counter_offered": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const calculatePotentialSavings = (original: string, suggested: string) => {
    const originalAmount = parseFloat(original);
    const suggestedAmount = parseFloat(suggested);
    return suggestedAmount - originalAmount;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">AI Rate Negotiations</h1>
          <p className="text-muted-foreground">Optimize rates with intelligent negotiation</p>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search negotiations by rate..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="counter_offered">Counter Offered</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Negotiation Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Negotiations</p>
                <p className="text-2xl font-bold">{negotiations?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">
                  {negotiations?.length ? 
                    Math.round((negotiations.filter(n => n.status === 'accepted').length / negotiations.length) * 100) : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Improvement</p>
                <p className="text-2xl font-bold">
                  ${negotiations?.length ? 
                    Math.round(negotiations.reduce((acc, n) => 
                      acc + calculatePotentialSavings(n.originalRate, n.suggestedRate), 0) / negotiations.length) : 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold">
                  {negotiations?.filter(n => n.status === 'in_progress').length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Negotiations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNegotiations.map((negotiation) => {
          const potentialSavings = calculatePotentialSavings(negotiation.originalRate, negotiation.suggestedRate);
          const confidenceScore = negotiation.confidenceScore || 75;
          
          return (
            <Link key={negotiation.id} href={`/negotiations/${negotiation.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">Negotiation #{negotiation.id}</CardTitle>
                      <CardDescription>Load ID: {negotiation.loadId}</CardDescription>
                    </div>
                    <Badge className={getStatusColor(negotiation.status)}>
                      {negotiation.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Original Rate</p>
                        <p className="text-lg font-bold text-red-600">${negotiation.originalRate}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Suggested Rate</p>
                        <p className="text-lg font-bold text-green-600">${negotiation.suggestedRate}</p>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Potential Change</p>
                      <p className={`text-lg font-bold ${potentialSavings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {potentialSavings >= 0 ? '+' : ''}${potentialSavings.toFixed(2)}
                      </p>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-muted-foreground">AI Confidence</span>
                        <span className="text-sm font-medium">{confidenceScore}%</span>
                      </div>
                      <Progress value={confidenceScore} className="h-2" />
                    </div>

                    {negotiation.aiAnalysis && (
                      <div className="bg-muted p-3 rounded-md">
                        <p className="text-xs text-muted-foreground mb-1">AI Analysis</p>
                        <p className="text-sm line-clamp-2">{negotiation.aiAnalysis}</p>
                      </div>
                    )}

                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>Created: {new Date(negotiation.createdAt).toLocaleDateString()}</span>
                      {negotiation.autoNegotiated && (
                        <Badge variant="secondary" className="text-xs">Auto</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {filteredNegotiations.length === 0 && !isLoading && (
        <Card>
          <CardContent className="p-12 text-center">
            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No negotiations found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== "all" 
                ? "Try adjusting your search criteria or filters"
                : "Negotiations will appear here when loads are optimized"
              }
            </p>
            <Link href="/loads">
              <Button>
                <Target className="w-4 h-4 mr-2" />
                View Load Board
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}