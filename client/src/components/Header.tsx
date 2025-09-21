import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Bell, LogOut } from "lucide-react";
import PNDLogo from "./PNDLogo";

interface HeaderProps {
  user: {
    name: string;
    department: string;
    role: string;
  };
  onLogout: () => void;
}

export default function Header({ user, onLogout }: HeaderProps) {
  const isAdmin = user.role === 'admin';

  return (
    <header className="flex items-center justify-between p-4 border-b bg-card">
      <div className="flex items-center gap-4">
        <SidebarTrigger data-testid="button-sidebar-toggle" />
        <div className="flex items-center gap-4">
          <div className="hidden sm:block header-logo" style={{ flexShrink: 0 }}>
            <PNDLogo size={128} />
          </div>
          <div className="block sm:hidden header-logo" style={{ flexShrink: 0 }}>
            <PNDLogo size={96} />
          </div>
          <h1 className="font-medium force-header-text flex items-center">IT Equipment Rental</h1>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <Button size="icon" variant="ghost" data-testid="button-notifications">
          <Bell className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium" data-testid="text-username">{user.name}</p>
            <div className="flex items-center gap-2">
              <Badge variant={isAdmin ? "default" : "secondary"} data-testid="badge-role">
                {isAdmin ? "관리자" : "사용자"}
              </Badge>
              <span className="text-xs text-muted-foreground">{user.department}</span>
            </div>
          </div>
          <Avatar>
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <Button 
            size="icon" 
            variant="ghost" 
            onClick={onLogout}
            data-testid="button-logout"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}