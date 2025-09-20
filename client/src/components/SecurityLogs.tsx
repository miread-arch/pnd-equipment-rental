import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Trash2, 
  RefreshCw, 
  Download,
  AlertTriangle,
  Activity
} from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { SecurityLogger, SecurityLogEntry } from "../utils/securityLogger";
import { useToast } from "@/hooks/use-toast";

export default function SecurityLogs() {
  const [logs, setLogs] = useState<SecurityLogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<SecurityLogEntry[]>([]);
  const [filterAction, setFilterAction] = useState<string>("all");
  const [stats, setStats] = useState({
    totalAttempts: 0,
    blockedIPs: 0,
    recentFailures: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const loadLogs = () => {
    setIsLoading(true);
    try {
      const securityLogs = SecurityLogger.getSecurityLogs();
      const logStats = SecurityLogger.getAttemptStats();
      
      setLogs(securityLogs);
      setStats(logStats);
      applyFilters(securityLogs, filterAction);
    } catch (error) {
      console.error('Error loading security logs:', error);
      toast({
        title: "로그 로딩 실패",
        description: "보안 로그를 불러오는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = (allLogs: SecurityLogEntry[], action: string) => {
    let filtered = allLogs;
    
    if (action !== "all") {
      filtered = allLogs.filter(log => log.action === action);
    }
    
    setFilteredLogs(filtered);
  };

  const handleFilterChange = (action: string) => {
    setFilterAction(action);
    applyFilters(logs, action);
  };

  const handleClearLogs = () => {
    if (window.confirm("모든 보안 로그를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
      SecurityLogger.clearLogs();
      setLogs([]);
      setFilteredLogs([]);
      setStats({ totalAttempts: 0, blockedIPs: 0, recentFailures: 0 });
      
      toast({
        title: "로그 삭제 완료",
        description: "모든 보안 로그가 삭제되었습니다.",
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
      link.download = `security_logs_${format(new Date(), "yyyy-MM-dd_HH-mm-ss")}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "로그 내보내기 완료",
        description: "보안 로그가 JSON 파일로 저장되었습니다.",
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

  const getActionIcon = (action: SecurityLogEntry['action']) => {
    switch (action) {
      case 'login_success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'login_failure':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'login_blocked':
        return <Shield className="h-4 w-4 text-orange-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActionBadgeVariant = (action: SecurityLogEntry['action']): "default" | "secondary" | "destructive" | "outline" => {
    switch (action) {
      case 'login_success':
        return "default";
      case 'login_failure':
        return "destructive";
      case 'login_blocked':
        return "secondary";
      default:
        return "outline";
    }
  };

  const getActionText = (action: SecurityLogEntry['action']) => {
    switch (action) {
      case 'login_success':
        return "로그인 성공";
      case 'login_failure':
        return "로그인 실패";
      case 'login_blocked':
        return "로그인 차단";
      default:
        return action;
    }
  };

  useEffect(() => {
    loadLogs();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadLogs, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">총 로그인 시도</p>
                <p className="text-2xl font-semibold">{stats.totalAttempts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                <Shield className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">차단된 IP</p>
                <p className="text-2xl font-semibold">{stats.blockedIPs}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">최근 1시간 실패</p>
                <p className="text-2xl font-semibold">{stats.recentFailures}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Security Logs Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                보안 로그
              </CardTitle>
              <CardDescription>
                로그인 시도 기록 및 보안 이벤트 {filteredLogs.length}건
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
            <Select value={filterAction} onValueChange={handleFilterChange}>
              <SelectTrigger className="w-48" data-testid="select-filter-action">
                <SelectValue placeholder="전체 액션" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 액션</SelectItem>
                <SelectItem value="login_success">로그인 성공</SelectItem>
                <SelectItem value="login_failure">로그인 실패</SelectItem>
                <SelectItem value="login_blocked">로그인 차단</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredLogs.length === 0 ? (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                보안 로그가 없습니다. 로그인 시도가 발생하면 여기에 기록됩니다.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>시간</TableHead>
                    <TableHead>IP 주소</TableHead>
                    <TableHead>사용자 ID</TableHead>
                    <TableHead>부서</TableHead>
                    <TableHead>액션</TableHead>
                    <TableHead>상세 정보</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-sm">
                        {format(log.timestamp, "yyyy-MM-dd HH:mm:ss", { locale: ko })}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {log.ipAddress}
                      </TableCell>
                      <TableCell className="font-medium">
                        {log.daouId}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {log.department}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={getActionBadgeVariant(log.action)}
                          className="flex items-center gap-1 w-fit"
                          data-testid={`badge-action-${log.id}`}
                        >
                          {getActionIcon(log.action)}
                          {getActionText(log.action)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-xs">
                        {log.reason && (
                          <span className="block truncate" title={log.reason}>
                            {log.reason}
                          </span>
                        )}
                        {log.sessionId && (
                          <span className="text-xs font-mono opacity-70">
                            세션: {log.sessionId}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Information */}
      <Card>
        <CardHeader>
          <CardTitle>보안 정책</CardTitle>
          <CardDescription>
            현재 적용 중인 보안 정책 및 제한 사항
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">로그인 제한 정책</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• 최대 실패 횟수: 3회</li>
                <li>• 차단 시간: 5분</li>
                <li>• IP 기반 차단</li>
                <li>• 실시간 모니터링</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">로그 보관 정책</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• 최대 보관 건수: 1,000건</li>
                <li>• 자동 정리: 오래된 로그 삭제</li>
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