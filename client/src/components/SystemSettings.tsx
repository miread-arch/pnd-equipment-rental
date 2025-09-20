import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Image, Mail, Users } from "lucide-react";
import LogoUpload from "./LogoUpload";

export default function SystemSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">시스템 설정</h2>
        <p className="text-muted-foreground">시스템 환경 설정 및 관리 기능</p>
      </div>

      <Tabs defaultValue="logo" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="logo" className="flex items-center gap-2">
            <Image className="h-4 w-4" />
            로고 설정
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            이메일 설정
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            사용자 설정
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            시스템 설정
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="logo" className="space-y-6">
          <LogoUpload />
        </TabsContent>
        
        <TabsContent value="email" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>이메일 알림 설정</CardTitle>
              <CardDescription>
                대여 승인, 반납 알림, 연체 독촉 등의 이메일 설정을 관리합니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">이메일 설정 기능은 개발 중입니다.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>사용자 권한 관리</CardTitle>
              <CardDescription>
                부서별 권한 설정 및 사용자 관리 기능입니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">관리자 권한</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• 상품운용팀</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">사용자 권한</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• 전략사업본부</li>
                      <li>• 기술1팀</li>
                      <li>• 기술2팀</li>
                      <li>• 기술3팀</li>
                    </ul>
                  </div>
                </div>
                <p className="text-muted-foreground">상세 사용자 관리 기능은 개발 중입니다.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>시스템 환경설정</CardTitle>
              <CardDescription>
                데이터베이스, 로그, 백업 등의 시스템 설정을 관리합니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">시스템 환경설정 기능은 개발 중입니다.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}