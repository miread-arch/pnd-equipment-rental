import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, ClipboardList, Clock, AlertTriangle } from "lucide-react";

interface DashboardStats {
  totalItems: number;
  availableItems: number;
  myActiveRentals: number;
  pendingApprovals: number;
  overdueRentals: number;
}

interface DashboardProps {
  stats: DashboardStats;
  userRole: string;
}

export default function Dashboard({ stats, userRole }: DashboardProps) {
  const isAdmin = userRole === 'admin';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">대시보드</h2>
        <p className="text-muted-foreground">IT 장비 대여 현황 개요</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">전체 물품</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-total-items">
              {stats.totalItems}
            </div>
            <p className="text-xs text-muted-foreground">
              사용가능: {stats.availableItems}개
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">내 대여 현황</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-my-rentals">
              {stats.myActiveRentals}
            </div>
            <p className="text-xs text-muted-foreground">
              활성 대여 건
            </p>
          </CardContent>
        </Card>

        {isAdmin && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">승인 대기</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="stat-pending-approvals">
                  {stats.pendingApprovals}
                </div>
                <p className="text-xs text-muted-foreground">
                  승인 필요
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">연체 현황</CardTitle>
                <AlertTriangle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive" data-testid="stat-overdue-rentals">
                  {stats.overdueRentals}
                </div>
                <p className="text-xs text-muted-foreground">
                  반납 연체
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>최근 대여 내역</CardTitle>
            <CardDescription>최근 5건의 대여 기록</CardDescription>
          </CardHeader>
          <CardContent>
            {/* //todo: remove mock functionality */}
            <div className="space-y-3">
              {[
                { item: "HUAWEI AR6120", status: "대여중", date: "2024-01-15" },
                { item: "LC-LC 광점퍼코드", status: "반납완료", date: "2024-01-14" },
                { item: "Cisco Switch 2960", status: "승인", date: "2024-01-13" },
              ].map((rental, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium">{rental.item}</p>
                    <p className="text-sm text-muted-foreground">{rental.date}</p>
                  </div>
                  <Badge 
                    variant={rental.status === "대여중" ? "default" : 
                            rental.status === "반납완료" ? "secondary" : "outline"}
                    data-testid={`badge-status-${index}`}
                  >
                    {rental.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>카테고리별 현황</CardTitle>
            <CardDescription>물품 카테고리별 분포</CardDescription>
          </CardHeader>
          <CardContent>
            {/* //todo: remove mock functionality */}
            <div className="space-y-3">
              {[
                { category: "Router", total: 15, available: 8 },
                { category: "Switch", total: 22, available: 12 },
                { category: "Wireless", total: 18, available: 9 },
                { category: "트랜시버", total: 35, available: 20 },
                { category: "소모품", total: 45, available: 30 },
              ].map((cat, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="font-medium">{cat.category}</span>
                  <div className="text-right">
                    <span className="text-sm font-medium">{cat.available}/{cat.total}</span>
                    <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${(cat.available / cat.total) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}