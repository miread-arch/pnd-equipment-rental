import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import PNDLogo from "./PNDLogo";

interface LoginFormProps {
  onLogin: (daouId: string, name: string, department: string) => void;
}

export default function LoginForm({ onLogin }: LoginFormProps) {
  const [daouId, setDaouId] = useState("");
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  
  // Default admin password
  const ADMIN_PASSWORD = "Huawei@123";
  
  // Check if current department requires password
  const requiresPassword = department === "상품운용팀";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Basic validation
    if (!daouId || !name || !department) {
      setError("모든 필수 필드를 입력해주세요.");
      return;
    }
    
    // Password validation for admin department
    if (requiresPassword) {
      if (!password) {
        setError("패스워드를 입력해주세요.");
        return;
      }
      if (password !== ADMIN_PASSWORD) {
        setError("패스워드가 올바르지 않습니다.");
        return;
      }
    }
    
    onLogin(daouId, name, department);
  };
  
  const handleDepartmentChange = (value: string) => {
    setDepartment(value);
    setPassword(""); // Clear password when department changes
    setError(""); // Clear any errors
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <PNDLogo size={60} />
          </div>
          <CardTitle className="text-2xl">(주)피앤디아이앤씨</CardTitle>
          <CardDescription>IT Equipment Rental Management System</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="daou-id">다우오피스 ID</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="daou-id"
                  data-testid="input-daou-id"
                  type="text"
                  placeholder="이메일의 @ 앞부분 입력"
                  value={daouId}
                  onChange={(e) => setDaouId(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name">이름</Label>
              <Input
                id="name"
                data-testid="input-name"
                type="text"
                placeholder="성명 입력"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="department">부서</Label>
              <Select value={department} onValueChange={handleDepartmentChange} required>
                <SelectTrigger data-testid="select-department">
                  <SelectValue placeholder="부서 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="상품운용팀">상품운용팀</SelectItem>
                  <SelectItem value="전략사업본부">전략사업본부</SelectItem>
                  <SelectItem value="기술1팀">기술1팀</SelectItem>
                  <SelectItem value="기술2팀">기술2팀</SelectItem>
                  <SelectItem value="기술3팀">기술3팀</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Conditional Password Field with Animation */}
            {requiresPassword && (
              <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    data-testid="input-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="패스워드를 입력하세요"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    data-testid="button-toggle-password"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
            )}
            
            {/* Error Message */}
            {error && (
              <Alert variant="destructive" className="animate-in slide-in-from-top-2 duration-300">
                <AlertDescription data-testid="text-error">{error}</AlertDescription>
              </Alert>
            )}
            
            <Button 
              type="submit" 
              className="w-full" 
              data-testid="button-login"
              disabled={!daouId || !name || !department || (requiresPassword && !password)}
            >
              로그인
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}