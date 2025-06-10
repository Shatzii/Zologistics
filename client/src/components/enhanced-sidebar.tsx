import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  LayoutDashboard, 
  Truck, 
  Users, 
  MessageSquare, 
  BarChart3, 
  FileText, 
  Settings,
  ChevronLeft,
  Bell,
  Search,
  Heart,
  Shield
} from "lucide-react";

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    badge: null
  },
  {
    name: "Load Board",
    href: "/loads",
    icon: Truck,
    badge: "3"
  },
  {
    name: "Drivers",
    href: "/drivers",
    icon: Users,
    badge: null
  },
  {
    name: "Negotiations",
    href: "/negotiations",
    icon: MessageSquare,
    badge: "2"
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: BarChart3,
    badge: null
  },
  {
    name: "Reports",
    href: "/reports",
    icon: FileText,
    badge: null
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
    badge: null
  },
  {
    name: "Driver Wellness",
    href: "/wellness",
    icon: Heart,
    badge: "NEW"
  },
  {
    name: "Driver Solutions",
    href: "/driver-solutions",
    icon: Shield,
    badge: "5"
  }
];

interface EnhancedSidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export function EnhancedSidebar({ collapsed = false, onToggle }: EnhancedSidebarProps) {
  const [location] = useLocation();

  return (
    <div className={cn(
      "flex flex-col h-screen bg-card border-r transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        {!collapsed && (
          <div>
            <h2 className="text-lg font-semibold">TruckDispatch</h2>
            <p className="text-xs text-muted-foreground">AI-Powered Logistics</p>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className={cn(
            "h-4 w-4 transition-transform",
            collapsed && "rotate-180"
          )} />
        </Button>
      </div>

      {/* Search */}
      {!collapsed && (
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder="Quick search..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3">
        <div className="space-y-1 py-2">
          {navigation.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start h-10",
                    collapsed && "px-2",
                    isActive && "bg-primary/10 text-primary border-primary/20"
                  )}
                >
                  <Icon className={cn("h-4 w-4", !collapsed && "mr-3")} />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left">{item.name}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="ml-auto h-5 text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </>
                  )}
                </Button>
              </Link>
            );
          })}
        </div>
      </ScrollArea>

      {/* Bottom Actions */}
      <div className="border-t p-3 space-y-2">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "w-full justify-start",
            collapsed && "px-2"
          )}
        >
          <Bell className={cn("h-4 w-4", !collapsed && "mr-3")} />
          {!collapsed && "Notifications"}
          {!collapsed && (
            <Badge variant="destructive" className="ml-auto h-5 text-xs">
              2
            </Badge>
          )}
        </Button>
        
        {!collapsed && (
          <div className="text-xs text-muted-foreground px-3 py-2">
            <div>System Status: Online</div>
            <div>Last Sync: 2 min ago</div>
          </div>
        )}
      </div>
    </div>
  );
}