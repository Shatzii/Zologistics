import { Button } from "@/components/ui/button";
import { Moon, Sun, Truck, Database } from "lucide-react";
import { useTheme } from "./theme-provider";
import { useQuery } from "@tanstack/react-query";

export function NavigationHeader() {
  const { theme, setTheme } = useTheme();

  const { data: systemStatus } = useQuery({
    queryKey: ["/api/system-status"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Truck className="text-blue-600 text-2xl" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">AI Dispatch</h1>
            </div>
          </div>

          {/* Real-time Status Bar */}
          <div className="hidden md:flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full pulse-success"></div>
              <span className="text-sm text-gray-600 dark:text-gray-300">System Online</span>
            </div>
            <div className="flex items-center space-x-2">
              <Database className="text-blue-500 w-4 h-4" />
              <span className="text-sm font-mono text-gray-600 dark:text-gray-300">
                Last Update: {systemStatus?.lastUpdate ? new Date(systemStatus.lastUpdate).toLocaleTimeString() : 'Loading...'}
              </span>
            </div>
          </div>

          {/* User Menu and Theme Toggle */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                JD
              </div>
              <span className="hidden sm:block text-sm font-medium">John Dispatcher</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
