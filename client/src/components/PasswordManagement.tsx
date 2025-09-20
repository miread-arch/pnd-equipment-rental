import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, Eye, EyeOff, Shield, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function PasswordManagement() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  // Default admin password (in real app, this would come from secure storage)
  const ADMIN_PASSWORD = "Huawei@123";

  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    if (password.length < 8) {
      errors.push("비밀번호는 최소 8자 이상이어야 합니다");
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("대문자가 포함되어야 합니다");
    }
    if (!/[a-z]/.test(password)) {
      errors.push("소문자가 포함되어야 합니다");
    }
    if (!/[0-9]/.test(password)) {
      errors.push("숫자가 포함되어야 합니다");
    }
    if (!/[!@#$%^&*(),.?\":{}|<>]/.test(password)) {
      errors.push("특수문자가 포함되어야 합니다");
    }
    return errors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsUpdating(true);

    // Validate current password
    if (currentPassword !== ADMIN_PASSWORD) {
      setError("현재 비밀번호가 올바르지 않습니다.");
      setIsUpdating(false);
      return;
    }

    // Validate new password
    const passwordErrors = validatePassword(newPassword);
    if (passwordErrors.length > 0) {
      setError(passwordErrors.join(", "));
      setIsUpdating(false);
      return;
    }

    // Check password confirmation
    if (newPassword !== confirmPassword) {
      setError("새 비밀번호와 확인 비밀번호가 일치하지 않습니다.");
      setIsUpdating(false);
      return;
    }

    // Check if new password is different
    if (newPassword === currentPassword) {
      setError("새 비밀번호는 현재 비밀번호와 달라야 합니다.");
      setIsUpdating(false);
      return;
    }

    // Simulate password update (in real app, this would call an API)
    setTimeout(() => {
      // In a real application, you would save this to a secure backend
      localStorage.setItem('admin-password', newPassword);
      
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setIsUpdating(false);
      
      toast({
        title: "비밀번호 변경 완료",
        description: "관리자 비밀번호가 성공적으로 변경되었습니다.",
      });
    }, 1000);
  };

  const resetToDefault = () => {
    localStorage.removeItem('admin-password');
    toast({
      title: "기본 비밀번호 복원",
      description: "관리자 비밀번호가 기본값으로 복원되었습니다.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          관리자 비밀번호 관리
        </CardTitle>
        <CardDescription>
          상품운용팀 로그인에 사용되는 관리자 비밀번호를 변경할 수 있습니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>보안 주의사항:</strong> 비밀번호는 정기적으로 변경하고, 다른 사람과 공유하지 마세요.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Password */}
          <div className="space-y-2">
            <Label htmlFor="current-password">현재 비밀번호</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="current-password"
                data-testid="input-current-password"
                type={showCurrentPassword ? "text" : "password"}
                placeholder="현재 비밀번호를 입력하세요"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="pl-10 pr-10"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                data-testid="button-toggle-current-password"
              >
                {showCurrentPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <Label htmlFor="new-password">새 비밀번호</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="new-password"
                data-testid="input-new-password"
                type={showNewPassword ? "text" : "password"}
                placeholder="새 비밀번호를 입력하세요"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="pl-10 pr-10"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowNewPassword(!showNewPassword)}
                data-testid="button-toggle-new-password"
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirm-password">새 비밀번호 확인</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirm-password"
                data-testid="input-confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="새 비밀번호를 다시 입력하세요"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-10 pr-10"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                data-testid="button-toggle-confirm-password"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <Alert variant="destructive" className="animate-in slide-in-from-top-2 duration-300">
              <AlertDescription data-testid="text-password-error">{error}</AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <div className="flex gap-2">
            <Button
              type="submit"
              className="flex-1"
              disabled={isUpdating || !currentPassword || !newPassword || !confirmPassword}
              data-testid="button-change-password"
            >
              {isUpdating ? "변경 중..." : "비밀번호 변경"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={resetToDefault}
              data-testid="button-reset-password"
            >
              기본값 복원
            </Button>
          </div>
        </form>

        {/* Password Requirements */}
        <div className="p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">비밀번호 요구사항</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• 최소 8자 이상</li>
            <li>• 대문자, 소문자, 숫자, 특수문자 각각 1개 이상 포함</li>
            <li>• 현재 비밀번호와 달라야 함</li>
            <li>• 예시: MyPassword123!</li>
          </ul>
        </div>

        {/* Current Status */}
        <div className="p-4 border rounded-lg">
          <h4 className="font-medium mb-2">현재 설정</h4>
          <div className="text-sm text-muted-foreground">
            <p>• 기본 관리자 비밀번호: Huawei@123</p>
            <p>• 상품운용팀 로그인 시 비밀번호 입력 필수</p>
            <p>• 다른 부서는 비밀번호 입력 불필요</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}