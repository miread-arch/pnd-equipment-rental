import { useState } from "react";
import { Route, Switch, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import LoginForm from "./LoginForm";
import Header from "./Header";
import AppSidebar from "./Sidebar";
import Dashboard from "./Dashboard";
import ItemManagement from "./ItemManagement";
import RentalRequest from "./RentalRequest";
import RentalList from "./RentalList";
import SystemSettings from "./SystemSettings";
import EmailManagement from "./EmailManagement";
import type { RentalWithDetails, Item, InsertItem } from "@shared/schema";

interface User {
  daouId: string;
  name: string;
  department: string;
  role: string;
}

export default function AppLayout() {
  const [user, setUser] = useState<User | null>(null);
  const [location] = useLocation();

  const { toast } = useToast();

  // Fetch all items
  const { data: allItems = [] } = useQuery<Item[]>({
    queryKey: ["/api/items"],
    enabled: !!user
  });

  // Fetch available items for rental request
  const { data: availableItems = [] } = useQuery<Item[]>({
    queryKey: ["/api/items/available"],
    enabled: !!user
  });

  // Fetch all rental data
  const { data: allRentals = [] } = useQuery<RentalWithDetails[]>({
    queryKey: ["/api/rentals"],
    enabled: !!user
  });

  // Fetch user-specific rental data
  const { data: userRentals = [] } = useQuery<RentalWithDetails[]>({
    queryKey: ["/api/rentals/user", user?.daouId],
    enabled: !!user?.daouId
  });

  const handleLogin = (daouId: string, name: string, department: string) => {
    const role = department === "상품운용팀" ? "admin" : "user";
    setUser({ daouId, name, department, role });
  };

  const handleLogout = () => {
    setUser(null);
  };

  // Item management mutations
  const addItemMutation = useMutation({
    mutationFn: async (item: Omit<InsertItem, 'createdBy'>) => {
      const response = await apiRequest('POST', '/api/items', item);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/items/available"] });
      toast({ title: "물품이 성공적으로 등록되었습니다." });
    },
    onError: (error: any) => {
      toast({ 
        title: "물품 등록 실패", 
        description: error.message || "물품 등록 중 오류가 발생했습니다.",
        variant: "destructive" 
      });
    }
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({ itemId, updates }: { itemId: string; updates: Partial<Item> }) => {
      const response = await apiRequest('PUT', `/api/items/${itemId}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/items/available"] });
      toast({ title: "물품 정보가 성공적으로 수정되었습니다." });
    },
    onError: (error: any) => {
      toast({ 
        title: "물품 수정 실패", 
        description: error.message || "물품 수정 중 오류가 발생했습니다.",
        variant: "destructive" 
      });
    }
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      await apiRequest('DELETE', `/api/items/${itemId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/items/available"] });
      toast({ title: "물품이 성공적으로 삭제되었습니다." });
    },
    onError: (error: any) => {
      toast({ 
        title: "물품 삭제 실패", 
        description: error.message || "물품 삭제 중 오류가 발생했습니다.",
        variant: "destructive" 
      });
    }
  });

  // Rental request mutation
  const submitRentalMutation = useMutation({
    mutationFn: async (request: { itemId: string; expectedReturnDate: Date; userId: string }) => {
      const response = await apiRequest('POST', '/api/rentals', request);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rentals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/rentals/user", user?.daouId] });
      toast({ title: "대여 신청이 성공적으로 제출되었습니다." });
    },
    onError: (error: any) => {
      toast({ 
        title: "대여 신청 실패", 
        description: error.message || "대여 신청 중 오류가 발생했습니다.",
        variant: "destructive" 
      });
    }
  });

  // Rental status update mutation
  const updateRentalStatusMutation = useMutation({
    mutationFn: async ({ rentalId, status }: { rentalId: string; status: string }) => {
      const response = await apiRequest('PUT', `/api/rentals/${rentalId}`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rentals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/rentals/user", user?.daouId] });
      toast({ title: "대여 상태가 성공적으로 업데이트되었습니다." });
    },
    onError: (error: any) => {
      toast({ 
        title: "상태 업데이트 실패", 
        description: error.message || "상태 업데이트 중 오류가 발생했습니다.",
        variant: "destructive" 
      });
    }
  });

  // Handler functions
  const handleAddItem = (item: Partial<Item>) => {
    addItemMutation.mutate(item as Omit<InsertItem, 'createdBy'>);
  };

  const handleUpdateItem = (itemId: string, updates: Partial<Item>) => {
    updateItemMutation.mutate({ itemId, updates });
  };

  const handleDeleteItem = (itemId: string) => {
    deleteItemMutation.mutate(itemId);
  };

  const handleSubmitRequest = (request: { itemId: string; expectedReturnDate: Date }) => {
    if (!user?.daouId) {
      toast({ title: "로그인이 필요합니다.", variant: "destructive" });
      return;
    }
    submitRentalMutation.mutate({ ...request, userId: user.daouId });
  };

  const handleUpdateRentalStatus = (rentalId: string, status: string) => {
    updateRentalStatusMutation.mutate({ rentalId, status });
  };


  const dashboardStats = {
    totalItems: allItems.length,
    availableItems: availableItems.length,
    myActiveRentals: userRentals.filter(r => ["승인", "대여중"].includes(r.status)).length,
    pendingApprovals: allRentals.filter(r => r.status === "신청중").length,
    overdueRentals: allRentals.filter(r => 
      r.status === "대여중" && new Date() > r.expectedReturnDate
    ).length,
  };

  if (!user) {
    return <LoginForm onLogin={handleLogin} />;
  }

  const style = {
    "--sidebar-width": "20rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar userRole={user.role} />
        <div className="flex flex-col flex-1">
          <Header user={user} onLogout={handleLogout} />
          <main className="flex-1 overflow-hidden">
            <div className="h-full overflow-y-auto p-6">
              <Switch>
                <Route path="/dashboard">
                  <Dashboard stats={dashboardStats} userRole={user.role} />
                </Route>
                
                <Route path="/rental-request">
                  <RentalRequest 
                    availableItems={availableItems}
                    onSubmitRequest={handleSubmitRequest}
                  />
                </Route>
                
                <Route path="/my-rentals">
                  <RentalList 
                    rentals={userRentals}
                    showAllUsers={false}
                  />
                </Route>
                
                <Route path="/all-rentals">
                  <RentalList 
                    rentals={allRentals}
                    showAllUsers={true}
                    onUpdateStatus={user.role === "admin" ? handleUpdateRentalStatus : undefined}
                  />
                </Route>
                
                {user.role === "admin" && (
                  <Route path="/items">
                    <ItemManagement 
                      items={allItems}
                      onAddItem={handleAddItem}
                      onUpdateItem={handleUpdateItem}
                      onDeleteItem={handleDeleteItem}
                    />
                  </Route>
                )}
                
                {user.role === "admin" && (
                  <Route path="/approvals">
                    <RentalList 
                      rentals={allRentals.filter(r => r.status === "신청중")}
                      showAllUsers={true}
                      onUpdateStatus={handleUpdateRentalStatus}
                    />
                  </Route>
                )}
                
                {user.role === "admin" && (
                  <Route path="/users">
                    <div className="space-y-6">
                      <h2 className="text-2xl font-semibold">사용자 관리</h2>
                      <p className="text-muted-foreground">사용자 관리 기능은 개발 중입니다.</p>
                    </div>
                  </Route>
                )}
                
                {user.role === "admin" && (
                  <Route path="/settings">
                    <SystemSettings />
                  </Route>
                )}
                
                {user.role === "admin" && (
                  <Route path="/emails">
                    <EmailManagement />
                  </Route>
                )}
                
                <Route>
                  <Dashboard stats={dashboardStats} userRole={user.role} />
                </Route>
              </Switch>
            </div>
          </main>
        </div>
      </div>
      <Toaster />
    </SidebarProvider>
  );
}