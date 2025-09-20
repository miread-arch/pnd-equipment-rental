import AppSidebar from '../Sidebar';
import { SidebarProvider } from "@/components/ui/sidebar";

export default function SidebarExample() {
  const style = {
    "--sidebar-width": "20rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar userRole="admin" />
        <div className="flex-1 p-6 bg-background">
          <p className="text-muted-foreground">Sidebar content area</p>
        </div>
      </div>
    </SidebarProvider>
  );
}