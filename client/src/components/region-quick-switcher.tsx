import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Globe, MapPin, CheckCircle } from "lucide-react";

interface QuickRegion {
  id: string;
  name: string;
  shortName: string;
  flag: string;
  status: 'active' | 'available' | 'inactive';
  operations: number;
  compliance: number;
}

const quickRegions: QuickRegion[] = [
  {
    id: 'eastern_europe',
    name: 'Eastern Europe',
    shortName: 'EE',
    flag: '🇪🇺',
    status: 'active',
    operations: 847,
    compliance: 96
  },
  {
    id: 'central_mexico',
    name: 'Central Mexico',
    shortName: 'MX',
    flag: '🇲🇽',
    status: 'available',
    operations: 623,
    compliance: 94
  },
  {
    id: 'united_states',
    name: 'United States',
    shortName: 'US',
    flag: '🇺🇸',
    status: 'available',
    operations: 1456,
    compliance: 98
  },
  {
    id: 'germany',
    name: 'Germany',
    shortName: 'DE',
    flag: '🇩🇪',
    status: 'available',
    operations: 756,
    compliance: 97
  }
];

interface RegionQuickSwitcherProps {
  currentRegion?: string;
  onRegionChange?: (regionId: string) => void;
  compact?: boolean;
}

export function RegionQuickSwitcher({ 
  currentRegion = 'eastern_europe', 
  onRegionChange,
  compact = false 
}: RegionQuickSwitcherProps) {
  const [switchingTo, setSwitchingTo] = useState<string | null>(null);

  const handleRegionSwitch = async (regionId: string) => {
    if (regionId === currentRegion) return;
    
    setSwitchingTo(regionId);
    
    try {
      // API call to switch regions
      const response = await fetch(`/api/international-compliance/switch-region/${regionId}`, {
        method: 'POST',
      });
      
      if (response.ok) {
        onRegionChange?.(regionId);
      }
    } catch (error) {
      console.error('Failed to switch region:', error);
    } finally {
      setSwitchingTo(null);
    }
  };

  const getStatusColor = (region: QuickRegion) => {
    if (region.id === currentRegion) return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20';
    if (region.status === 'active') return 'border-green-500 bg-green-50 dark:bg-green-900/20';
    return 'border-gray-200 bg-white dark:bg-gray-800';
  };

  const getStatusIcon = (region: QuickRegion) => {
    if (region.id === currentRegion) return <CheckCircle className="w-3 h-3 text-blue-500" />;
    if (region.status === 'active') return <MapPin className="w-3 h-3 text-green-500" />;
    return <Globe className="w-3 h-3 text-gray-400" />;
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">Region:</span>
        <div className="flex gap-1">
          {quickRegions.map((region) => (
            <Button
              key={region.id}
              variant={region.id === currentRegion ? "default" : "outline"}
              size="sm"
              onClick={() => handleRegionSwitch(region.id)}
              disabled={switchingTo === region.id}
              className="h-8 px-3"
            >
              <span className="mr-1">{region.flag}</span>
              <span className="font-medium">{region.shortName}</span>
              {region.id === currentRegion && (
                <CheckCircle className="w-3 h-3 ml-1" />
              )}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <Card className="driver-card">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-500" />
            <h3 className="font-medium driver-text-emphasis">Quick Region Switch</h3>
          </div>
          <Badge variant="outline" className="text-xs">
            {quickRegions.length} Regions Available
          </Badge>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickRegions.map((region) => (
            <div
              key={region.id}
              className={cn(
                "p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md",
                getStatusColor(region),
                switchingTo === region.id && "opacity-50 cursor-not-allowed"
              )}
              onClick={() => handleRegionSwitch(region.id)}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg">{region.flag}</span>
                {getStatusIcon(region)}
              </div>
              
              <div className="space-y-1">
                <h4 className="font-medium text-sm driver-text-emphasis">
                  {region.name}
                </h4>
                
                <div className="flex justify-between text-xs">
                  <span className="driver-text-secondary">Routes:</span>
                  <span className="driver-text-emphasis font-medium">
                    {region.operations}
                  </span>
                </div>
                
                <div className="flex justify-between text-xs">
                  <span className="driver-text-secondary">Compliance:</span>
                  <span className={cn(
                    "font-medium",
                    region.compliance >= 95 ? "text-green-600" : 
                    region.compliance >= 90 ? "text-yellow-600" : "text-red-600"
                  )}>
                    {region.compliance}%
                  </span>
                </div>
              </div>
              
              {region.id === currentRegion && (
                <Badge className="w-full mt-2 bg-blue-500 text-white text-xs">
                  Active Region
                </Badge>
              )}
              
              {switchingTo === region.id && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-black/80 rounded-lg">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t">
          <div className="flex items-center justify-between text-xs driver-text-secondary">
            <span>Current: {quickRegions.find(r => r.id === currentRegion)?.name}</span>
            <span>Click any region to switch</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}