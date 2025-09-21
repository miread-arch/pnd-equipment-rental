import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ClipboardList, Eye, Clock, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { RentalWithDetails } from "@shared/schema";

interface RentalListProps {
  rentals: RentalWithDetails[];
  showAllUsers?: boolean;
  onUpdateStatus?: (rentalId: string, status: string) => void;
}

export default function RentalList({ rentals, showAllUsers = false, onUpdateStatus }: RentalListProps) {
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [selectedRental, setSelectedRental] = useState<RentalWithDetails | null>(null);

  const statuses = ["신청중", "승인", "대여중", "반납완료", "거절"].filter(s => s && s.trim() !== '');
  const categories = Array.from(new Set(rentals.map(rental => rental.item?.category).filter(cat => cat && cat.trim() !== '')));

  const filteredRentals = rentals.filter(rental => {
    const matchesStatus = filterStatus === "all" || rental.status === filterStatus;
    const matchesCategory = filterCategory === "all" || rental.item?.category === filterCategory;
    return matchesStatus && matchesCategory;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "신청중": return <Clock className="h-4 w-4" />;
      case "승인": return <CheckCircle className="h-4 w-4" />;
      case "대여중": return <ClipboardList className="h-4 w-4" />;
      case "반납완료": return <CheckCircle className="h-4 w-4" />;
      case "거절": return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "신청중": return "outline";
      case "승인": return "default";
      case "대여중": return "default";
      case "반납완료": return "secondary";
      case "거절": return "destructive";
      default: return "outline";
    }
  };

  const isOverdue = (rental: RentalWithDetails) => {
    if (rental.status !== "대여중") return false;
    return new Date() > rental.expectedReturnDate;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">
          {showAllUsers ? "전체 대여 현황" : "내 대여 현황"}
        </h2>
        <p className="text-muted-foreground">
          {showAllUsers ? "모든 사용자의 대여 현황을 확인할 수 있습니다" : "내가 신청한 대여 목록입니다"}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            대여 목록
          </CardTitle>
          <CardDescription>
            총 {filteredRentals.length}건의 대여 기록
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48" data-testid="select-filter-status">
                <SelectValue placeholder="전체 상태" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 상태</SelectItem>
                {statuses.filter(status => status && status.trim() !== '').map((status) => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-48" data-testid="select-filter-category">
                <SelectValue placeholder="전체 카테고리" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 카테고리</SelectItem>
                {categories.filter(category => category && category.trim() !== '').map((category) => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>물품명</TableHead>
                  <TableHead>카테고리</TableHead>
                  {showAllUsers && <TableHead>신청자</TableHead>}
                  <TableHead>신청일</TableHead>
                  <TableHead>반납예정일</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead className="text-right">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRentals.map((rental) => (
                  <TableRow 
                    key={rental.rentalId}
                    className={isOverdue(rental) ? "bg-destructive/5" : ""}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {rental.item?.name || 'N/A'}
                        {isOverdue(rental) && (
                          <AlertTriangle className="h-4 w-4 text-destructive" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{rental.item?.category || 'N/A'}</Badge>
                    </TableCell>
                    {showAllUsers && (
                      <TableCell>
                        <div>
                          <p className="font-medium">{rental.user?.name || 'N/A'}</p>
                          <p className="text-sm text-muted-foreground">{rental.user?.department || 'N/A'}</p>
                        </div>
                      </TableCell>
                    )}
                    <TableCell>
                      {format(rental.createdAt, "yyyy-MM-dd")}
                    </TableCell>
                    <TableCell>
                      <div className={isOverdue(rental) ? "text-destructive font-medium" : ""}>
                        {format(rental.expectedReturnDate, "yyyy-MM-dd")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={getStatusVariant(rental.status)}
                        className="flex items-center gap-1 w-fit"
                        data-testid={`badge-status-${rental.rentalId}`}
                      >
                        {getStatusIcon(rental.status)}
                        {rental.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            size="icon" 
                            variant="ghost"
                            onClick={() => setSelectedRental(rental)}
                            data-testid={`button-view-${rental.rentalId}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>대여 상세 정보</DialogTitle>
                            <DialogDescription>
                              대여 #{rental.rentalId}의 상세 정보
                            </DialogDescription>
                          </DialogHeader>
                          
                          {selectedRental && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm text-muted-foreground">물품명</p>
                                  <p className="font-medium">{selectedRental.item?.name || 'N/A'}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">카테고리</p>
                                  <Badge variant="outline">{selectedRental.item?.category || 'N/A'}</Badge>
                                </div>
                              </div>
                              
                              {showAllUsers && (
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm text-muted-foreground">신청자</p>
                                    <p className="font-medium">{selectedRental.user?.name || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">부서</p>
                                    <p className="font-medium">{selectedRental.user?.department || 'N/A'}</p>
                                  </div>
                                </div>
                              )}
                              
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm text-muted-foreground">신청일</p>
                                  <p className="font-medium">
                                    {format(selectedRental.createdAt, "yyyy년 MM월 dd일")}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">반납예정일</p>
                                  <p className={`font-medium ${isOverdue(selectedRental) ? "text-destructive" : ""}`}>
                                    {format(selectedRental.expectedReturnDate, "yyyy년 MM월 dd일")}
                                    {isOverdue(selectedRental) && " (연체)"}
                                  </p>
                                </div>
                              </div>
                              
                              <div>
                                <p className="text-sm text-muted-foreground">현재 상태</p>
                                <Badge 
                                  variant={getStatusVariant(selectedRental.status)}
                                  className="flex items-center gap-1 w-fit mt-1"
                                >
                                  {getStatusIcon(selectedRental.status)}
                                  {selectedRental.status}
                                </Badge>
                              </div>
                              
                              {selectedRental.actualReturnDate && (
                                <div>
                                  <p className="text-sm text-muted-foreground">실제반납일</p>
                                  <p className="font-medium">
                                    {format(selectedRental.actualReturnDate, "yyyy년 MM월 dd일")}
                                  </p>
                                </div>
                              )}
                              
                              
                              {onUpdateStatus && selectedRental.status === "신청중" && (
                                <div className="flex gap-2 pt-4 border-t">
                                  <Button
                                    variant="default"
                                    onClick={() => onUpdateStatus(selectedRental.rentalId, "승인")}
                                    data-testid="button-approve"
                                  >
                                    승인
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    onClick={() => onUpdateStatus(selectedRental.rentalId, "거절")}
                                    data-testid="button-reject"
                                  >
                                    거절
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}