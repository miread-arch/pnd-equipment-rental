import { useState } from "react";
import { Route, Switch, useLocation } from "wouter";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";
import LoginForm from "./LoginForm";
import Header from "./Header";
import AppSidebar from "./Sidebar";
import Dashboard from "./Dashboard";
import ItemManagement from "./ItemManagement";
import RentalRequest from "./RentalRequest";
import RentalList from "./RentalList";

interface User {
  daouId: string;
  name: string;
  department: string;
  role: string;
}

export default function AppLayout() {
  const [user, setUser] = useState<User | null>(null);
  const [location] = useLocation();

  // //todo: remove mock functionality
  const [mockItems] = useState([
    {
      itemId: "1",
      category: "Router",
      name: "HUAWEI AR6120",
      model: "AR6120-S",
      serialNumber: "2210012345678",
      status: "대여가능",
      note: "신규 입고"
    },
    {
      itemId: "2", 
      category: "Switch",
      name: "Cisco Catalyst 2960",
      model: "WS-C2960-24TT-L",
      serialNumber: "FOC1234567A",
      status: "대여불가",
      note: "점검 중"
    },
    {
      itemId: "3",
      category: "소모품",
      name: "LC-LC 광점퍼코드",
      model: "3M",
      serialNumber: "",
      status: "대여가능",
      note: "재고 20개"
    },
    {
      itemId: "4",
      category: "Wireless",
      name: "Cisco Aironet 2802I",
      model: "AIR-AP2802I-K9",
      serialNumber: "FCW1234567B",
      status: "대여가능"
    }
  ]);

  const [mockRentals] = useState([
    {
      rentalId: "1",
      itemName: "HUAWEI AR6120",
      category: "Router",
      userName: "김철수",
      department: "기술본부",
      status: "대여중",
      createdAt: new Date(2024, 0, 15),
      expectedReturnDate: new Date(2024, 0, 25),
      note: "프로젝트 테스트용"
    },
    {
      rentalId: "2", 
      itemName: "LC-LC 광점퍼코드",
      category: "소모품",
      userName: "이영희",
      department: "상품운용팀",
      status: "신청중",
      createdAt: new Date(2024, 0, 20),
      expectedReturnDate: new Date(2024, 0, 30),
      note: "고객사 설치용"
    },
    {
      rentalId: "3",
      itemName: "Cisco Catalyst 2960", 
      category: "Switch",
      userName: "박민수",
      department: "기술본부",
      status: "반납완료",
      createdAt: new Date(2024, 0, 10),
      expectedReturnDate: new Date(2024, 0, 20),
      actualReturnDate: new Date(2024, 0, 19),
      note: "네트워크 구성 테스트"
    },
    {
      rentalId: "4",
      itemName: "Cisco Aironet 2802I",
      category: "Wireless", 
      userName: "정수진",
      department: "기술본부",
      status: "대여중",
      createdAt: new Date(2024, 0, 5),
      expectedReturnDate: new Date(2024, 0, 15), // Overdue
      note: "무선 환경 테스트"
    }
  ]);

  const handleLogin = (daouId: string, name: string, department: string) => {
    const role = department === "상품운용팀" ? "admin" : "user";
    setUser({ daouId, name, department, role });
  };

  const handleLogout = () => {
    setUser(null);
  };

  const handleAddItem = (item: any) => {
    console.log('Add item:', item);
  };

  const handleUpdateItem = (itemId: string, updates: any) => {
    console.log('Update item:', itemId, updates);
  };

  const handleDeleteItem = (itemId: string) => {
    console.log('Delete item:', itemId);
  };

  const handleSubmitRequest = (request: any) => {
    console.log('Rental request submitted:', request);
  };

  const handleUpdateRentalStatus = (rentalId: string, status: string) => {
    console.log('Update rental status:', rentalId, status);
  };

  const availableItems = mockItems.filter(item => item.status === "대여가능");
  const userRentals = user ? mockRentals.filter(rental => rental.userName === user.name) : [];

  const dashboardStats = {
    totalItems: mockItems.length,
    availableItems: availableItems.length,
    myActiveRentals: userRentals.filter(r => ["승인", "대여중"].includes(r.status)).length,
    pendingApprovals: mockRentals.filter(r => r.status === "신청중").length,
    overdueRentals: mockRentals.filter(r => 
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
                    rentals={mockRentals}
                    showAllUsers={true}
                    onUpdateStatus={user.role === "admin" ? handleUpdateRentalStatus : undefined}
                  />
                </Route>
                
                {user.role === "admin" && (
                  <Route path="/items">
                    <ItemManagement 
                      items={mockItems}
                      onAddItem={handleAddItem}
                      onUpdateItem={handleUpdateItem}
                      onDeleteItem={handleDeleteItem}
                    />
                  </Route>
                )}
                
                {user.role === "admin" && (
                  <Route path="/approvals">
                    <RentalList 
                      rentals={mockRentals.filter(r => r.status === "신청중")}
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
                    <div className="space-y-6">
                      <h2 className="text-2xl font-semibold">시스템 설정</h2>
                      <p className="text-muted-foreground">시스템 설정 기능은 개발 중입니다.</p>
                    </div>
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