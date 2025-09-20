import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  ClipboardList, 
  Users, 
  Shield, 
  Trash2, 
  RefreshCw, 
  Download,
  User,
  Clock
} from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { SimpleLogger, AccessLogEntry } from "../utils/simpleLogger";
import { useToast } from "@/hooks/use-toast";

export default function AccessLogs() {
  const [logs, setLogs] = useState<AccessLogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AccessLogEntry[]>([]);
  const [filterRole, setFilterRole] = useState<string>("all");
  const [stats, setStats] = useState({
    totalLogins: 0,
    adminLogins: 0,
    userLogins: 0,
    todayLogins: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const loadLogs = () => {
    setIsLoading(true);
    try {
      const accessLogs = SimpleLogger.getAccessLogs();
      const logStats = SimpleLogger.getStats();
      
      setLogs(accessLogs);
      setStats(logStats);
      applyFilters(accessLogs, filterRole);
    } catch (error) {
      console.error('Error loading access logs:', error);
      toast({
        title: "로그 로딩 실패",
        description: "접근 로그를 불러오는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = (allLogs: AccessLogEntry[], role: string) => {
    let filtered = allLogs;
    
    if (role !== "all") {
      filtered = allLogs.filter(log => log.role === role);
    }
    
    setFilteredLogs(filtered);
  };

  const handleFilterChange = (role: string) => {
    setFilterRole(role);
    applyFilters(logs, role);
  };

  const handleClearLogs = () => {
    if (window.confirm("모든 접근 로그를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
      SimpleLogger.clearLogs();
      setLogs([]);
      setFilteredLogs([]);
      setStats({ totalLogins: 0, adminLogins: 0, userLogins: 0, todayLogins: 0 });
      
      toast({
        title: "로그 삭제 완료",
        description: "모든 접근 로그가 삭제되었습니다.",
      });
    }
  };

  const handleExportLogs = () => {
    try {
      const dataStr = JSON.stringify(filteredLogs, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement("a");
      link.href = url;
      link.download = `access_logs_${format(new Date(), "yyyy-MM-dd_HH-mm-ss")}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "로그 내보내기 완료",
        description: "접근 로그가 JSON 파일로 저장되었습니다.",
      });
    } catch (error) {
      console.error('Error exporting logs:', error);
      toast({
        title: "내보내기 실패",
        description: "로그 파일 생성 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const getRoleIcon = (role: 'admin' | 'user') => {
    return role === 'admin' ? 
      <Shield className="h-4 w-4 text-blue-600" /> : 
      <User className="h-4 w-4 text-green-600" />;
  };

  const getRoleBadgeVariant = (role: 'admin' | 'user'): "default" | "secondary" => {
    return role === 'admin' ? "default" : "secondary";
  };

  const getRoleText = (role: 'admin' | 'user') => {
    return role === 'admin' ? "관리자" : "사용자";
  };

  useEffect(() => {
    loadLogs();
    
    // Auto-refresh every 60 seconds for simple logs
    const interval = setInterval(loadLogs, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <ClipboardList className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">총 접속</p>
                <p className="text-2xl font-semibold">{stats.totalLogins}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">관리자 접속</p>
                <p className="text-2xl font-semibold">{stats.adminLogins}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">사용자 접속</p>
                <p className="text-2xl font-semibold">{stats.userLogins}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">오늘 접속</p>
                <p className="text-2xl font-semibold">{stats.todayLogins}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Access Logs Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                접근 기록
              </CardTitle>
              <CardDescription>
                시스템 접근 기록 {filteredLogs.length}건
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={loadLogs}
                disabled={isLoading}
                data-testid="button-refresh-logs"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                새로고침
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportLogs}
                disabled={filteredLogs.length === 0}
                data-testid="button-export-logs"
              >
                <Download className="h-4 w-4 mr-2" />
                내보내기
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleClearLogs}
                disabled={logs.length === 0}
                data-testid="button-clear-logs"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                전체 삭제
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-4">
            <Select value={filterRole} onValueChange={handleFilterChange}>
              <SelectTrigger className="w-48" data-testid="select-filter-role">
                <SelectValue placeholder="전체 역할" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 역할</SelectItem>
                <SelectItem value="admin">관리자</SelectItem>
                <SelectItem value="user">사용자</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredLogs.length === 0 ? (
            <Alert>
              <ClipboardList className="h-4 w-4" />
              <AlertDescription>
                접근 기록이 없습니다. 사용자가 로그인하면 여기에 기록됩니다.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>접속 시간</TableHead>
                    <TableHead>사용자 ID</TableHead>
                    <TableHead>이름</TableHead>
                    <TableHead>부서</TableHead>
                    <TableHead>역할</TableHead>
                    <TableHead>세션 ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-sm">
                        {format(log.timestamp, "yyyy-MM-dd HH:mm:ss", { locale: ko })}
                      </TableCell>
                      <TableCell className="font-medium">
                        {log.daouId}
                      </TableCell>
                      <TableCell>
                        {log.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {log.department}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={getRoleBadgeVariant(log.role)}
                          className="flex items-center gap-1 w-fit"
                          data-testid={`badge-role-${log.id}`}
                        >
                          {getRoleIcon(log.role)}
                          {getRoleText(log.role)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {log.sessionId}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Simple Information */}
      <Card>
        <CardHeader>
          <CardTitle>시스템 정보</CardTitle>
          <CardDescription>
            접근 기록 관리 및 시스템 운영 정보
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">접근 기록</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• 성공한 로그인만 기록</li>
                <li>• 접속 시간 및 사용자 정보</li>
                <li>• 관리자/사용자 구분</li>
                <li>• 세션 ID로 추적 가능</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">데이터 관리</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• 최대 보관 건수: 500건</li>
                <li>• 자동 정리: 오래된 기록 삭제</li>
                <li>• 로컬 저장소 사용</li>
                <li>• JSON 형식 내보내기 가능</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}