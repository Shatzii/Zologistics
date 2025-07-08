import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
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
  Shield,
  Globe,
  Handshake,
  Database,
  Ghost,
  MapPin,
  Smartphone,
  Mic,
  Brain,
  Zap,
  CreditCard,
  UserCheck,
  Activity,
  Wrench,
  Languages,
  DollarSign,
  TrendingUp,
  Navigation,
  Coins,
  Target,
  Route,
  ShieldCheck,
  Star,
  Gift,
  Repeat,
  Calculator,
  MonitorSpeaker,
  Building2,
  Package,
  Plane,
  Ship,
  Upload,
  Users2,
  Bot
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
    name: "Enhanced Drivers",
    href: "/enhanced-drivers",
    icon: Users,
    badge: "New"
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
  }
];

const mobileAppsSection = [
  {
    name: "Mobile Driver App",
    href: "/mobile-app",
    icon: Smartphone,
    badge: "LIVE"
  },
  {
    name: "Customer Portal",
    href: "/customer-portal", 
    icon: Users,
    badge: "LIVE"
  }
];

const aiSection = [
  {
    name: "Voice Assistant",
    href: "/voice-assistant",
    icon: Mic,
    badge: "AI"
  },
  {
    name: "Load Optimization",
    href: "/load-probability",
    icon: Brain,
    badge: "AI"
  },
  {
    name: "AI Load Board",
    href: "/ai-load-board",
    icon: Zap,
    badge: "AI"
  }
];

// Payment & Admin Section
const paymentSection = [
  {
    name: "Admin Panel",
    href: "/admin",
    icon: Shield,
    badge: "ADMIN"
  },
  {
    name: "Payment Plans",
    href: "/payments",
    icon: CreditCard,
    badge: "STRIPE"
  },
  {
    name: "Payment Processing",
    href: "/payment-processing",
    icon: DollarSign,
    badge: "LIVE"
  }
];

// Advanced Analytics Section
const analyticsSection = [
  {
    name: "Enhanced Analytics",
    href: "/enhanced-analytics",
    icon: TrendingUp,
    badge: "AI"
  },
  {
    name: "Predictive Maintenance",
    href: "/predictive-maintenance",
    icon: Wrench,
    badge: "IOT"
  },
  {
    name: "Compliance Monitoring",
    href: "/compliance-monitoring",
    icon: ShieldCheck,
    badge: "AUTO"
  },
  {
    name: "Driver Performance",
    href: "/enhanced-drivers",
    icon: Users2,
    badge: "METRICS"
  }
];

// Driver-Focused Section
const driverSection = [
  {
    name: "Driver Wellness",
    href: "/enhanced-wellness",
    icon: Heart,
    badge: "ACTIVE"
  },
  {
    name: "Driver Route Optimizer",
    href: "/driver-earnings",
    icon: Route,
    badge: "AI"
  },
  {
    name: "Referral System",
    href: "/referral-dashboard",
    icon: Gift,
    badge: "VIRAL"
  },
  {
    name: "Load Board Optimizer",
    href: "/load-board-optimizer",
    icon: Target,
    badge: "SMART"
  },
  {
    name: "Backhaul Optimizer",
    href: "/backhaul-optimizer",
    icon: Repeat,
    badge: "AI"
  }
];

// International & Global Section
const globalSection = [
  {
    name: "International Compliance",
    href: "/international-compliance",
    icon: Globe,
    badge: "GLOBAL"
  },
  {
    name: "Multi-Language Support",
    href: "/multi-language",
    icon: Languages,
    badge: "5 LANGS"
  },
  {
    name: "International Regions",
    href: "/international-regions",
    icon: Globe,
    badge: "8 REGIONS"
  },
  {
    name: "International Load Boards",
    href: "/international-load-boards",
    icon: Globe,
    badge: "11 BOARDS"
  },
  {
    name: "Global Expansion",
    href: "/global-expansion",
    icon: Globe,
    badge: "NEW"
  }
];

// Revenue & Business Section
const revenueSection = [
  {
    name: "Ghost Loads",
    href: "/ghost-loads",
    icon: Ghost,
    badge: "$1.2B"
  },
  {
    name: "Earnings Simulator",
    href: "/earnings-simulator",
    icon: Calculator,
    badge: "LIVE"
  },
  {
    name: "Global Valuation",
    href: "/global-valuation",
    icon: Coins,
    badge: "$246B"
  },
  {
    name: "Multi-Modal Logistics",
    href: "/multi-modal",
    icon: Package,
    badge: "$29.85B"
  }
];

// Tech & Innovation Section
const innovationSection = [
  {
    name: "Revolutionary Features",
    href: "/revolutionary-features",
    icon: Star,
    badge: "NEXT-GEN"
  },
  {
    name: "Self-Hosted AI",
    href: "/self-hosted-ai",
    icon: Bot,
    badge: "LOCAL"
  },
  {
    name: "Advanced Compliance",
    href: "/advanced-compliance",
    icon: ShieldCheck,
    badge: "AUTO"
  },
  {
    name: "Collaborative Network",
    href: "/collaborative-network",
    icon: Handshake,
    badge: "LIVE"
  },
  {
    name: "Web3 Blockchain",
    href: "/web3-blockchain",
    icon: Coins,
    badge: "BLOCKCHAIN"
  }
];

// Operations Section
const operationsSection = [
  {
    name: "Live GPS Tracking",
    href: "/live-tracking",
    icon: MapPin,
    badge: "LIVE"
  },
  {
    name: "Load Board Management",
    href: "/load-board-management",
    icon: Database,
    badge: "17+"
  },
  {
    name: "Production Dashboard",
    href: "/production-dashboard",
    icon: MonitorSpeaker,
    badge: "PROD"
  },
  {
    name: "Direct Shipper",
    href: "/direct-shipper-dashboard",
    icon: Building2,
    badge: "DIRECT"
  },
  {
    name: "Feature Completion",
    href: "/feature-completion",
    icon: Star,
    badge: "100%"
  }
];

// Specialized Transportation
const specializedSection = [
  {
    name: "Air Freight",
    href: "/multi-modal",
    icon: Plane,
    badge: "$3.65B"
  },
  {
    name: "Sea Freight",
    href: "/multi-modal",
    icon: Ship,
    badge: "$5.7B"
  },
  {
    name: "Multi-Vehicle Brokerage",
    href: "/multi-vehicle-brokerage",
    icon: Truck,
    badge: "FLEET"
  },
  {
    name: "Carrier Solutions",
    href: "/carrier-solutions",
    icon: Building2,
    badge: "B2B"
  },
  {
    name: "Open Source ELD",
    href: "/open-source-eld",
    icon: Upload,
    badge: "FREE"
  }
];

interface EnhancedSidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export function EnhancedSidebar({ collapsed = false, onToggle }: EnhancedSidebarProps) {
  const [location] = useLocation();
  const { t } = useLanguage();

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
          {/* Core Navigation */}
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

          {!collapsed && <Separator className="my-3" />}
          
          {/* Payment & Admin Section */}
          {!collapsed && <p className="text-xs font-medium text-muted-foreground px-3 pb-2">Payment & Admin</p>}
          {paymentSection.map((item) => {
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

          {!collapsed && <Separator className="my-3" />}
          
          {/* AI & Mobile Apps */}
          {!collapsed && <p className="text-xs font-medium text-muted-foreground px-3 pb-2">AI & Mobile</p>}
          {[...aiSection, ...mobileAppsSection].map((item) => {
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

          {!collapsed && <Separator className="my-3" />}
          
          {/* Analytics Section */}
          {!collapsed && <p className="text-xs font-medium text-muted-foreground px-3 pb-2">Advanced Analytics</p>}
          {analyticsSection.map((item) => {
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

          {!collapsed && <Separator className="my-3" />}
          
          {/* Driver-Focused Section */}
          {!collapsed && <p className="text-xs font-medium text-muted-foreground px-3 pb-2">Driver Tools</p>}
          {driverSection.map((item) => {
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

          {!collapsed && <Separator className="my-3" />}
          
          {/* Global Operations */}
          {!collapsed && <p className="text-xs font-medium text-muted-foreground px-3 pb-2">Global Operations</p>}
          {globalSection.map((item) => {
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

          {!collapsed && <Separator className="my-3" />}
          
          {/* Revenue & Business */}
          {!collapsed && <p className="text-xs font-medium text-muted-foreground px-3 pb-2">Revenue Streams</p>}
          {revenueSection.map((item) => {
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

          {!collapsed && <Separator className="my-3" />}
          
          {/* Innovation & Tech */}
          {!collapsed && <p className="text-xs font-medium text-muted-foreground px-3 pb-2">Innovation</p>}
          {innovationSection.map((item) => {
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

          {!collapsed && <Separator className="my-3" />}
          
          {/* Operations */}
          {!collapsed && <p className="text-xs font-medium text-muted-foreground px-3 pb-2">Operations</p>}
          {operationsSection.map((item) => {
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

          {!collapsed && <Separator className="my-3" />}
          
          {/* Specialized Transportation */}
          {!collapsed && <p className="text-xs font-medium text-muted-foreground px-3 pb-2">Specialized Transport</p>}
          {specializedSection.map((item) => {
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