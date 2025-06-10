import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Search, Truck, Users, MessageSquare, BarChart3, FileText, Settings, Plus } from "lucide-react";

interface Command {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  keywords: string[];
  group: string;
}

const commands: Command[] = [
  {
    id: "dashboard",
    title: "Dashboard",
    description: "View main dashboard overview",
    href: "/",
    icon: BarChart3,
    keywords: ["dashboard", "home", "overview"],
    group: "Navigation"
  },
  {
    id: "loads",
    title: "Load Board",
    description: "Manage and view all loads",
    href: "/loads",
    icon: Truck,
    keywords: ["loads", "freight", "shipments"],
    group: "Navigation"
  },
  {
    id: "create-load",
    title: "Create New Load",
    description: "Add a new load to the system",
    href: "/loads/create",
    icon: Plus,
    keywords: ["create", "new", "load", "add"],
    group: "Actions"
  },
  {
    id: "drivers",
    title: "Drivers",
    description: "Manage driver fleet",
    href: "/drivers",
    icon: Users,
    keywords: ["drivers", "fleet", "team"],
    group: "Navigation"
  },
  {
    id: "add-driver",
    title: "Add New Driver",
    description: "Register a new driver",
    href: "/drivers/create",
    icon: Plus,
    keywords: ["add", "driver", "new", "register"],
    group: "Actions"
  },
  {
    id: "negotiations",
    title: "Negotiations",
    description: "AI-powered rate negotiations",
    href: "/negotiations",
    icon: MessageSquare,
    keywords: ["negotiations", "rates", "ai"],
    group: "Navigation"
  }
];

interface QuickCommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickCommandPalette({ open, onOpenChange }: QuickCommandPaletteProps) {
  const [search, setSearch] = useState("");
  const [, setLocation] = useLocation();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filteredCommands = commands.filter(command =>
    command.title.toLowerCase().includes(search.toLowerCase()) ||
    command.description.toLowerCase().includes(search.toLowerCase()) ||
    command.keywords.some(keyword => keyword.toLowerCase().includes(search.toLowerCase()))
  );

  const groupedCommands = filteredCommands.reduce((groups, command) => {
    if (!groups[command.group]) {
      groups[command.group] = [];
    }
    groups[command.group].push(command);
    return groups;
  }, {} as Record<string, Command[]>);

  useEffect(() => {
    if (open) {
      setSearch("");
      setSelectedIndex(0);
    }
  }, [open]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;
      
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          handleSelect(filteredCommands[selectedIndex]);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, filteredCommands, selectedIndex]);

  const handleSelect = (command: Command) => {
    setLocation(command.href);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            Quick Command
          </DialogTitle>
        </DialogHeader>
        
        <div className="px-6 py-4">
          <Input
            placeholder="Search commands or navigate..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-0 shadow-none text-base focus-visible:ring-0"
            autoFocus
          />
        </div>

        <ScrollArea className="max-h-96">
          <div className="px-6 pb-6">
            {Object.entries(groupedCommands).map(([group, commands]) => (
              <div key={group} className="mb-6 last:mb-0">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                  {group}
                </div>
                <div className="space-y-1">
                  {commands.map((command, index) => {
                    const globalIndex = filteredCommands.indexOf(command);
                    const isSelected = globalIndex === selectedIndex;
                    const Icon = command.icon;
                    
                    return (
                      <div
                        key={command.id}
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                          isSelected 
                            ? "bg-primary text-primary-foreground" 
                            : "hover:bg-muted"
                        }`}
                        onClick={() => handleSelect(command)}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{command.title}</div>
                          <div className={`text-sm truncate ${
                            isSelected ? "text-primary-foreground/70" : "text-muted-foreground"
                          }`}>
                            {command.description}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          {command.keywords.slice(0, 2).map((keyword) => (
                            <Badge 
                              key={keyword} 
                              variant={isSelected ? "secondary" : "outline"}
                              className="text-xs"
                            >
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            
            {filteredCommands.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <div>No commands found</div>
                <div className="text-sm">Try searching for "loads", "drivers", or "create"</div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="px-6 py-3 border-t bg-muted/50 text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>Press ↑↓ to navigate, Enter to select, Esc to close</span>
            <span>Tip: Press Ctrl+K to open command palette</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}