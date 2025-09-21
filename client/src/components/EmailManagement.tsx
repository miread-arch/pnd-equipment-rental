import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Mail, Eye, Settings, Calendar, AlertTriangle, CheckCircle, XCircle, Clock } from "lucide-react";
import { format } from "date-fns";

interface EmailLog {
  timestamp: string;
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
  sent: boolean;
  error?: string;
}

interface EmailConfig {
  enabled: boolean;
  host: string;
  port: string;
  from: string;
  userConfigured: boolean;
  passwordConfigured: boolean;
}

interface EmailTemplate {
  subject: string;
  text: string;
  html: string;
}

export default function EmailManagement() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [previewType, setPreviewType] = useState<string>("rentalRequest");
  const [previewData, setPreviewData] = useState({
    userName: "홍길동",
    itemName: "HUAWEI AR6120",
    expectedReturnDate: new Date().toISOString().split('T')[0],
    reason: "재고 부족",
    daysLeft: "3",
    daysOverdue: "2"
  });

  // Fetch email logs
  const { data: emailLogs = [], refetch: refetchLogs } = useQuery<EmailLog[]>({
    queryKey: ["/api/emails/logs", selectedDate],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/emails/logs?date=${selectedDate}`);
      return response.json();
    }
  });

  // Fetch email configuration
  const { data: emailConfig } = useQuery<EmailConfig>({
    queryKey: ["/api/emails/config"],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/emails/config');
      return response.json();
    }
  });

  // Fetch return reminders
  const [reminderDays, setReminderDays] = useState("3");
  const { data: returnReminders = [], refetch: refetchReminders } = useQuery({
    queryKey: ["/api/emails/return-reminders", reminderDays],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/emails/return-reminders?days=${reminderDays}`);
      return response.json();
    }
  });

  // Fetch overdue rentals
  const { data: overdueRentals = [], refetch: refetchOverdue } = useQuery({
    queryKey: ["/api/emails/overdue-rentals"],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/emails/overdue-rentals');
      return response.json();
    }
  });

  // Email preview mutation
  const previewMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/emails/preview', {
        type: previewType,
        ...data
      });
      return response.json();
    }
  });

  // Send return reminder emails mutation
  const sendReminderMutation = useMutation({
    mutationFn: async (rentalIds: string[]) => {
      const response = await apiRequest('POST', '/api/emails/send-return-reminders', { rentalIds });
      return response.json();
    },
    onSuccess: () => {
      refetchReminders();
      refetchLogs();
    }
  });

  // Send overdue reminder emails mutation
  const sendOverdueMutation = useMutation({
    mutationFn: async (rentalIds: string[]) => {
      const response = await apiRequest('POST', '/api/emails/send-overdue-reminders', { rentalIds });
      return response.json();
    },
    onSuccess: () => {
      refetchOverdue();
      refetchLogs();
    }
  });

  const handlePreview = () => {
    const previewPayload = {
      userName: previewData.userName,
      itemName: previewData.itemName,
      expectedReturnDate: previewData.expectedReturnDate,
      reason: previewData.reason,
      daysLeft: parseInt(previewData.daysLeft),
      daysOverdue: parseInt(previewData.daysOverdue)
    };
    previewMutation.mutate(previewPayload);
  };

  const getStatusIcon = (log: EmailLog) => {
    if (log.sent) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else if (log.error) {
      return <XCircle className="h-4 w-4 text-red-500" />;
    } else {
      return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusText = (log: EmailLog) => {
    if (log.sent) return "전송완료";
    if (log.error) return "전송실패";
    return "대기중";
  };

  const getStatusVariant = (log: EmailLog): "default" | "secondary" | "destructive" => {
    if (log.sent) return "default";
    if (log.error) return "destructive";
    return "secondary";
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">이메일 관리</h2>
        <p className="text-muted-foreground">시스템 이메일 발송 현황 및 설정 관리</p>
      </div>

      <Tabs defaultValue="logs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="logs" data-testid="tab-email-logs">
            <Mail className="h-4 w-4 mr-2" />
            이메일 로그
          </TabsTrigger>
          <TabsTrigger value="preview" data-testid="tab-email-preview">
            <Eye className="h-4 w-4 mr-2" />
            메시지 미리보기
          </TabsTrigger>
          <TabsTrigger value="reminders" data-testid="tab-return-reminders">
            <AlertTriangle className="h-4 w-4 mr-2" />
            반납 알림
          </TabsTrigger>
          <TabsTrigger value="config" data-testid="tab-email-config">
            <Settings className="h-4 w-4 mr-2" />
            설정 현황
          </TabsTrigger>
        </TabsList>

        {/* Email Logs Tab */}
        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                이메일 발송 로그
              </CardTitle>
              <CardDescription>
                일자별 이메일 발송 내역을 확인할 수 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Label htmlFor="date-select">조회 일자:</Label>
                  <Input
                    id="date-select"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-48"
                    data-testid="input-log-date"
                  />
                </div>
                <Button onClick={() => refetchLogs()} data-testid="button-refresh-logs">
                  새로고침
                </Button>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>시간</TableHead>
                      <TableHead>수신자</TableHead>
                      <TableHead>제목</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead className="text-right">상세</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {emailLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          선택한 날짜에 이메일 로그가 없습니다.
                        </TableCell>
                      </TableRow>
                    ) : (
                      emailLogs.map((log, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            {format(new Date(log.timestamp), "HH:mm:ss")}
                          </TableCell>
                          <TableCell>{log.to}</TableCell>
                          <TableCell className="max-w-xs truncate">{log.subject}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={getStatusVariant(log)}
                              className="flex items-center gap-1 w-fit"
                            >
                              {getStatusIcon(log)}
                              {getStatusText(log)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  data-testid={`button-view-email-${index}`}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>이메일 상세 내용</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label>수신자:</Label>
                                      <p className="text-sm">{log.to}</p>
                                    </div>
                                    <div>
                                      <Label>발신자:</Label>
                                      <p className="text-sm">{log.from}</p>
                                    </div>
                                    <div>
                                      <Label>제목:</Label>
                                      <p className="text-sm">{log.subject}</p>
                                    </div>
                                    <div>
                                      <Label>전송 시간:</Label>
                                      <p className="text-sm">{format(new Date(log.timestamp), "yyyy-MM-dd HH:mm:ss")}</p>
                                    </div>
                                  </div>
                                  
                                  {log.error && (
                                    <div className="bg-destructive/10 p-3 rounded-md">
                                      <Label className="text-destructive">오류 메시지:</Label>
                                      <p className="text-sm text-destructive">{log.error}</p>
                                    </div>
                                  )}
                                  
                                  {log.html ? (
                                    <div>
                                      <Label>HTML 내용:</Label>
                                      <div 
                                        className="border p-4 rounded-md bg-white max-h-96 overflow-y-auto"
                                        dangerouslySetInnerHTML={{ __html: log.html }}
                                      />
                                    </div>
                                  ) : (
                                    <div>
                                      <Label>텍스트 내용:</Label>
                                      <div className="border p-4 rounded-md bg-gray-50 max-h-96 overflow-y-auto">
                                        <pre className="whitespace-pre-wrap text-sm">{log.text}</pre>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Preview Tab */}
        <TabsContent value="preview">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>이메일 미리보기 생성</CardTitle>
                <CardDescription>
                  각 이메일 템플릿의 미리보기를 생성할 수 있습니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="preview-type">이메일 유형</Label>
                  <Select value={previewType} onValueChange={setPreviewType}>
                    <SelectTrigger data-testid="select-preview-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rentalRequest">대여 신청 알림</SelectItem>
                      <SelectItem value="rentalApproved">대여 승인 알림</SelectItem>
                      <SelectItem value="rentalRejected">대여 반려 알림</SelectItem>
                      <SelectItem value="returnReminder">반납 예정 알림</SelectItem>
                      <SelectItem value="overdue">반납 연체 알림</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="user-name">사용자명</Label>
                    <Input
                      id="user-name"
                      value={previewData.userName}
                      onChange={(e) => setPreviewData(prev => ({ ...prev, userName: e.target.value }))}
                      data-testid="input-preview-username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="item-name">물품명</Label>
                    <Input
                      id="item-name"
                      value={previewData.itemName}
                      onChange={(e) => setPreviewData(prev => ({ ...prev, itemName: e.target.value }))}
                      data-testid="input-preview-itemname"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="return-date">반납예정일</Label>
                  <Input
                    id="return-date"
                    type="date"
                    value={previewData.expectedReturnDate}
                    onChange={(e) => setPreviewData(prev => ({ ...prev, expectedReturnDate: e.target.value }))}
                    data-testid="input-preview-returndate"
                  />
                </div>

                {previewType === 'rentalRejected' && (
                  <div className="space-y-2">
                    <Label htmlFor="reason">반려 사유</Label>
                    <Textarea
                      id="reason"
                      value={previewData.reason}
                      onChange={(e) => setPreviewData(prev => ({ ...prev, reason: e.target.value }))}
                      data-testid="input-preview-reason"
                    />
                  </div>
                )}

                {previewType === 'returnReminder' && (
                  <div className="space-y-2">
                    <Label htmlFor="days-left">남은 일수</Label>
                    <Input
                      id="days-left"
                      type="number"
                      value={previewData.daysLeft}
                      onChange={(e) => setPreviewData(prev => ({ ...prev, daysLeft: e.target.value }))}
                      data-testid="input-preview-daysleft"
                    />
                  </div>
                )}

                {previewType === 'overdue' && (
                  <div className="space-y-2">
                    <Label htmlFor="days-overdue">연체 일수</Label>
                    <Input
                      id="days-overdue"
                      type="number"
                      value={previewData.daysOverdue}
                      onChange={(e) => setPreviewData(prev => ({ ...prev, daysOverdue: e.target.value }))}
                      data-testid="input-preview-daysoverdue"
                    />
                  </div>
                )}

                <Button 
                  onClick={handlePreview} 
                  disabled={previewMutation.isPending}
                  className="w-full"
                  data-testid="button-generate-preview"
                >
                  {previewMutation.isPending ? "생성 중..." : "미리보기 생성"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>미리보기 결과</CardTitle>
                <CardDescription>
                  생성된 이메일 템플릿의 미리보기입니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {previewMutation.data ? (
                  <div className="space-y-4">
                    <div>
                      <Label>제목:</Label>
                      <p className="text-sm font-medium p-2 bg-gray-50 rounded">{previewMutation.data.subject}</p>
                    </div>
                    <div>
                      <Label>HTML 미리보기:</Label>
                      <div 
                        className="border p-4 rounded-md bg-white max-h-96 overflow-y-auto"
                        dangerouslySetInnerHTML={{ __html: previewMutation.data.html }}
                      />
                    </div>
                    <div>
                      <Label>텍스트 버전:</Label>
                      <div className="border p-4 rounded-md bg-gray-50 max-h-32 overflow-y-auto">
                        <pre className="whitespace-pre-wrap text-xs">{previewMutation.data.text}</pre>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    미리보기를 생성하려면 좌측에서 설정 후 "미리보기 생성" 버튼을 클릭하세요.
                  </div>
                )}
                
                {previewMutation.error && (
                  <div className="bg-destructive/10 p-3 rounded-md">
                    <p className="text-sm text-destructive">미리보기 생성 중 오류가 발생했습니다.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Return Reminders Tab */}
        <TabsContent value="reminders">
          <div className="space-y-6">
            {/* Return Reminders Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  반납 예정 알림
                </CardTitle>
                <CardDescription>
                  반납 예정일이 다가온 대여에 대해 알림을 발송할 수 있습니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Label htmlFor="reminder-days">알림 발송 기준:</Label>
                    <Select value={reminderDays} onValueChange={setReminderDays}>
                      <SelectTrigger className="w-48" data-testid="select-reminder-days">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1일 전</SelectItem>
                        <SelectItem value="2">2일 전</SelectItem>
                        <SelectItem value="3">3일 전</SelectItem>
                        <SelectItem value="5">5일 전</SelectItem>
                        <SelectItem value="7">7일 전</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={() => refetchReminders()} variant="outline" data-testid="button-refresh-reminders">
                      새로고침
                    </Button>
                  </div>

                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">
                            <input type="checkbox" className="rounded" />
                          </TableHead>
                          <TableHead>사용자</TableHead>
                          <TableHead>물품명</TableHead>
                          <TableHead>반납예정일</TableHead>
                          <TableHead>남은 일수</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {returnReminders.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                              반납 예정인 대여가 없습니다.
                            </TableCell>
                          </TableRow>
                        ) : (
                          returnReminders.map((reminder: any, index: number) => (
                            <TableRow key={reminder.rental.rentalId}>
                              <TableCell>
                                <input 
                                  type="checkbox" 
                                  className="rounded"
                                  data-testid={`checkbox-reminder-${index}`}
                                />
                              </TableCell>
                              <TableCell>{reminder.user?.name || '-'}</TableCell>
                              <TableCell>{reminder.item?.name || '-'}</TableCell>
                              <TableCell>
                                {format(new Date(reminder.rental.expectedReturnDate), "yyyy-MM-dd")}
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  variant={reminder.daysLeft <= 1 ? "destructive" : "secondary"}
                                  data-testid={`badge-days-left-${index}`}
                                >
                                  {reminder.daysLeft}일 남음
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {returnReminders.length > 0 && (
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => {
                          const allIds = returnReminders.map((r: any) => r.rental.rentalId);
                          sendReminderMutation.mutate(allIds);
                        }}
                        disabled={sendReminderMutation.isPending}
                        data-testid="button-send-all-reminders"
                      >
                        {sendReminderMutation.isPending ? "발송 중..." : "전체 알림 발송"}
                      </Button>
                      <Button variant="outline" data-testid="button-send-selected-reminders">
                        선택 항목 발송
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Overdue Rentals Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  연체 대여 알림
                </CardTitle>
                <CardDescription>
                  반납 기한이 지난 대여에 대해 연체 알림을 발송할 수 있습니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Button onClick={() => refetchOverdue()} variant="outline" data-testid="button-refresh-overdue">
                      새로고침
                    </Button>
                  </div>

                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">
                            <input type="checkbox" className="rounded" />
                          </TableHead>
                          <TableHead>사용자</TableHead>
                          <TableHead>물품명</TableHead>
                          <TableHead>반납예정일</TableHead>
                          <TableHead>연체 일수</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {overdueRentals.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                              <div className="flex items-center justify-center gap-2">
                                <CheckCircle className="h-5 w-5 text-green-500" />
                                연체된 대여가 없습니다.
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          overdueRentals.map((overdue: any, index: number) => (
                            <TableRow key={overdue.rental.rentalId} className="bg-red-50">
                              <TableCell>
                                <input 
                                  type="checkbox" 
                                  className="rounded"
                                  data-testid={`checkbox-overdue-${index}`}
                                />
                              </TableCell>
                              <TableCell>{overdue.user?.name || '-'}</TableCell>
                              <TableCell>{overdue.item?.name || '-'}</TableCell>
                              <TableCell>
                                {format(new Date(overdue.rental.expectedReturnDate), "yyyy-MM-dd")}
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  variant="destructive"
                                  data-testid={`badge-days-overdue-${index}`}
                                >
                                  {overdue.daysOverdue}일 연체
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {overdueRentals.length > 0 && (
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => {
                          const allIds = overdueRentals.map((r: any) => r.rental.rentalId);
                          sendOverdueMutation.mutate(allIds);
                        }}
                        disabled={sendOverdueMutation.isPending}
                        variant="destructive"
                        data-testid="button-send-all-overdue"
                      >
                        {sendOverdueMutation.isPending ? "발송 중..." : "전체 연체 알림 발송"}
                      </Button>
                      <Button variant="outline" data-testid="button-send-selected-overdue">
                        선택 항목 발송
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Email Configuration Tab */}
        <TabsContent value="config">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                이메일 설정 현황
              </CardTitle>
              <CardDescription>
                현재 이메일 시스템 설정 상태를 확인할 수 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {emailConfig ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Badge variant={emailConfig.enabled ? "default" : "secondary"}>
                          {emailConfig.enabled ? "활성화" : "비활성화"}
                        </Badge>
                        <span className="font-medium">이메일 발송 상태</span>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>SMTP 서버:</Label>
                        <p className="text-sm">{emailConfig.host}:{emailConfig.port}</p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>발신 주소:</Label>
                        <p className="text-sm">{emailConfig.from}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>계정 설정 상태:</Label>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {emailConfig.userConfigured ? 
                              <CheckCircle className="h-4 w-4 text-green-500" /> : 
                              <XCircle className="h-4 w-4 text-red-500" />
                            }
                            <span className="text-sm">SMTP 계정 {emailConfig.userConfigured ? "설정됨" : "설정 필요"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {emailConfig.passwordConfigured ? 
                              <CheckCircle className="h-4 w-4 text-green-500" /> : 
                              <XCircle className="h-4 w-4 text-red-500" />
                            }
                            <span className="text-sm">SMTP 암호 {emailConfig.passwordConfigured ? "설정됨" : "설정 필요"}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-md">
                    <h4 className="font-medium text-blue-900 mb-2">환경 변수 설정 안내</h4>
                    <div className="text-sm text-blue-800 space-y-1">
                      <p><code>EMAIL_ENABLED=true</code> - 이메일 발송 활성화</p>
                      <p><code>SMTP_HOST=outbound.daouoffice.com</code> - SMTP 서버</p>
                      <p><code>SMTP_PORT=465</code> - SMTP 포트</p>
                      <p><code>SMTP_USER=noreply@pndinc.co.kr</code> - SMTP 계정</p>
                      <p><code>SMTP_PASSWORD=your_password</code> - SMTP 암호</p>
                      <p><code>EMAIL_FROM=noreply@pndinc.co.kr</code> - 발신 주소</p>
                    </div>
                  </div>

                  {!emailConfig.enabled && (
                    <div className="bg-yellow-50 p-4 rounded-md">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <span className="font-medium text-yellow-800">이메일 발송이 비활성화되어 있습니다</span>
                      </div>
                      <p className="text-sm text-yellow-700 mt-1">
                        현재 모든 이메일은 로그 파일에만 기록되며 실제로 발송되지 않습니다.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  설정 정보를 불러오는 중입니다...
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}