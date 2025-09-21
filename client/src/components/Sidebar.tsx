import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { 
  LayoutDashboard, 
  Package, 
  ClipboardList, 
  History, 
  Users, 
  Settings,
  PlusCircle,
  CheckSquare,
  Mail
} from "lucide-react";

interface SidebarProps {
  userRole: string;
}

export default function AppSidebar({ userRole }: SidebarProps) {
  const [location] = useLocation();
  const isAdmin = userRole === 'admin';

  const mainMenuItems = [
    {
      title: "대시보드",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "대여 신청",
      url: "/rental-request",
      icon: PlusCircle,
    },
    {
      title: "내 대여 현황",
      url: "/my-rentals",
      icon: ClipboardList,
    },
    {
      title: "전체 대여 현황",
      url: "/all-rentals",
      icon: History,
    },
  ];

  const adminMenuItems = [
    {
      title: "물품 관리",
      url: "/items",
      icon: Package,
    },
    {
      title: "승인 처리",
      url: "/approvals",
      icon: CheckSquare,
    },
    {
      title: "이메일 관리",
      url: "/emails",
      icon: Mail,
    },
    {
      title: "사용자 관리",
      url: "/users",
      icon: Users,
    },
    {
      title: "시스템 설정",
      url: "/settings",
      icon: Settings,
    },
  ];

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>메인 메뉴</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    isActive={location === item.url}
                  >
                    <Link href={item.url} data-testid={`link-${item.url.slice(1)}`}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>관리자 메뉴</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminMenuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild
                      isActive={location === item.url}
                    >
                      <Link href={item.url} data-testid={`link-${item.url.slice(1)}`}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}