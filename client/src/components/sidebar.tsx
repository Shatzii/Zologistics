import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  LayoutDashboard, 
  List, 
  Users, 
  Handshake, 
  TrendingUp, 
  Settings,
  Bot,
  Activity
} from "lucide-react";
import { Link, useLocation } from "wouter";

export function Sidebar() {
  const [location] = useLocation();

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/" },
    { icon: List, label: "Load Board", href: "/loads" },
    { icon: Users, label: "Drivers", href: "/drivers" },
    { icon: Handshake, label: "Rate Negotiation", href: "/negotiations" },
    { icon: TrendingUp, label: "Analytics", href: "/analytics" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-gray-900 shadow-sm border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
      <nav className="p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? "default" : "ghost"}
                className={`w-full justify-start ${
                  isActive 
                    ? "bg-blue-600 text-white hover:bg-blue-700" 
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <Icon className="mr-3 h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* AI Status Panel */}
      <div className="p-4 mt-8">
        <Card className="trucking-gradient text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Bot className="w-5 h-5" />
              <span className="font-medium">AI Engine</span>
            </div>
            <div className="text-sm opacity-90 space-y-1">
              <div className="flex justify-between">
                <span>GPT-4o</span>
                <div className="flex items-center space-x-1">
                  <Activity className="w-3 h-3" />
                  <span className="text-green-200">Active</span>
                </div>
              </div>
              <div className="flex justify-between">
                <span>Processed:</span>
                <span className="font-mono">247 loads</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </aside>
  );
}
