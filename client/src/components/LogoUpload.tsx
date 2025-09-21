import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import PNDLogo from "./PNDLogo";

export default function LogoUpload() {
  const [currentLogo, setCurrentLogo] = useState<string | null>(() => {
    return localStorage.getItem('company-logo');
  });
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "지원하지 않는 파일 형식",
        description: "JPG, PNG, SVG 파일만 업로드 가능합니다.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "파일 크기 초과",
        description: "5MB 이하의 파일만 업로드 가능합니다.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      
      // For SVG files, store directly
      if (file.type === 'image/svg+xml') {
        localStorage.setItem('company-logo', result);
        setCurrentLogo(result);
        setIsUploading(false);
        toast({
          title: "로고 업로드 완료",
          description: "새 로고가 적용되었습니다.",
        });
        return;
      }

      // For image files, resize to maintain aspect ratio with high quality
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          setIsUploading(false);
          toast({
            title: "업로드 실패",
            description: "이미지 처리 중 오류가 발생했습니다.",
            variant: "destructive",
          });
          return;
        }

        // Calculate dimensions to maintain aspect ratio - use higher resolution for quality
        const maxSize = 200; // Higher resolution for better quality scaling
        const ratio = Math.min(maxSize / img.width, maxSize / img.height);
        const width = img.width * ratio;
        const height = img.height * ratio;

        canvas.width = maxSize;
        canvas.height = maxSize;
        
        // Enable high-quality image rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // Clear canvas with transparent background
        ctx.clearRect(0, 0, maxSize, maxSize);
        
        // Center the image
        const x = (maxSize - width) / 2;
        const y = (maxSize - height) / 2;
        
        ctx.drawImage(img, x, y, width, height);
        
        const resizedDataUrl = canvas.toDataURL('image/png', 1.0); // Maximum quality
        localStorage.setItem('company-logo', resizedDataUrl);
        setCurrentLogo(resizedDataUrl);
        setIsUploading(false);
        
        toast({
          title: "로고 업로드 완료",
          description: "새 로고가 적용되었습니다.",
        });
        
        // Trigger a custom event to notify other components
        window.dispatchEvent(new CustomEvent('logo-updated'));
      };
      
      img.src = result;
    };
    
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    localStorage.removeItem('company-logo');
    setCurrentLogo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast({
      title: "로고 제거 완료",
      description: "기본 PND 로고로 복원되었습니다.",
    });
    
    // Trigger a custom event to notify other components
    window.dispatchEvent(new CustomEvent('logo-updated'));
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>회사 로고 관리</CardTitle>
        <CardDescription>
          시스템 전체에 표시될 회사 로고를 설정합니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <Label className="text-sm text-muted-foreground mb-2 block">현재 로고</Label>
            <PNDLogo size={60} />
          </div>
          
          <div className="flex-1 space-y-4">
            <div>
              <Label htmlFor="logo-upload">로고 파일 업로드</Label>
              <div className="mt-2 flex gap-2">
                <Input
                  ref={fileInputRef}
                  id="logo-upload"
                  type="file"
                  accept=".jpg,.jpeg,.png,.svg"
                  onChange={handleFileSelect}
                  className="hidden"
                  data-testid="input-logo-upload"
                />
                <Button 
                  onClick={handleUploadClick}
                  disabled={isUploading}
                  data-testid="button-upload-logo"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isUploading ? "업로드 중..." : "파일 선택"}
                </Button>
                
                {currentLogo && (
                  <Button 
                    variant="outline"
                    onClick={handleRemoveLogo}
                    data-testid="button-remove-logo"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    기본값 복원
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                지원 형식: JPG, PNG, SVG (최대 5MB)
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">로고 가이드라인</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• 파일 크기: 5MB 이하</li>
            <li>• 고해상도 이미지 권장 (벡터 또는 300dpi 이상)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}