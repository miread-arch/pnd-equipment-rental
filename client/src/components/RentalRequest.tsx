import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Package } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface Item {
  itemId: string;
  category: string;
  name: string;
  model?: string;
  serialNumber?: string;
  status: string;
}

interface RentalRequestProps {
  availableItems: Item[];
  onSubmitRequest: (request: any) => void;
}

export default function RentalRequest({ availableItems, onSubmitRequest }: RentalRequestProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedItem, setSelectedItem] = useState<string>("");
  const [expectedReturnDate, setExpectedReturnDate] = useState<Date>();
  const [note, setNote] = useState("");

  const categories = ["Router", "Switch", "Wireless", "트랜시버", "소모품"];
  const filteredItems = availableItems.filter(item => 
    !selectedCategory || item.category === selectedCategory
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItem && expectedReturnDate) {
      const item = availableItems.find(i => i.itemId === selectedItem);
      onSubmitRequest({
        itemId: selectedItem,
        itemName: item?.name,
        category: item?.category,
        expectedReturnDate: expectedReturnDate.toISOString(),
        note,
      });
      
      // Reset form
      setSelectedCategory("");
      setSelectedItem("");
      setExpectedReturnDate(undefined);
      setNote("");
    }
  };

  const selectedItemDetails = availableItems.find(item => item.itemId === selectedItem);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">대여 신청</h2>
        <p className="text-muted-foreground">필요한 IT 장비를 신청하세요</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>대여 신청서</CardTitle>
            <CardDescription>장비 선택 및 반납 예정일을 입력하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="category">카테고리 *</Label>
                <Select 
                  value={selectedCategory || undefined} 
                  onValueChange={(value) => {
                    setSelectedCategory(value);
                    setSelectedItem(""); // Reset item selection when category changes
                  }}
                  required
                >
                  <SelectTrigger data-testid="select-request-category">
                    <SelectValue placeholder="카테고리 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedCategory && (
                <div className="space-y-2">
                  <Label htmlFor="item">물품 선택 *</Label>
                  <Select 
                    value={selectedItem || undefined} 
                    onValueChange={setSelectedItem}
                    required
                  >
                    <SelectTrigger data-testid="select-request-item">
                      <SelectValue placeholder="물품 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredItems.filter(item => item.itemId && item.itemId.trim() !== '').map((item) => (
                        <SelectItem key={item.itemId} value={item.itemId}>
                          <div className="flex items-center gap-2">
                            <span>{item.name}</span>
                            {item.model && (
                              <span className="text-muted-foreground">({item.model})</span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="return-date">반납 예정일 *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                      data-testid="button-select-date"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {expectedReturnDate ? format(expectedReturnDate, "yyyy년 M월 d일") : "날짜 선택"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={expectedReturnDate}
                      onSelect={setExpectedReturnDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="note">사용 목적 / 비고</Label>
                <Textarea
                  id="note"
                  data-testid="input-request-note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="사용 목적이나 특별한 요청사항을 입력하세요"
                  rows={4}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full"
                data-testid="button-submit-request"
                disabled={!selectedItem || !expectedReturnDate}
              >
                대여 신청
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {selectedItemDetails && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  선택된 물품 정보
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">카테고리</Label>
                    <p className="font-medium">{selectedItemDetails.category}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">상태</Label>
                    <Badge variant="default" className="ml-2">
                      {selectedItemDetails.status}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm text-muted-foreground">품명</Label>
                  <p className="font-medium">{selectedItemDetails.name}</p>
                </div>
                
                {selectedItemDetails.model && (
                  <div>
                    <Label className="text-sm text-muted-foreground">모델번호</Label>
                    <p className="font-medium">{selectedItemDetails.model}</p>
                  </div>
                )}
                
                {selectedItemDetails.serialNumber && (
                  <div>
                    <Label className="text-sm text-muted-foreground">시리얼넘버</Label>
                    <p className="font-mono text-sm">{selectedItemDetails.serialNumber}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>대여 승인 절차</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium flex-shrink-0">1</div>
                  <div>
                    <p className="font-medium">대여 신청</p>
                    <p className="text-sm text-muted-foreground">원하는 장비와 기간을 선택하여 신청</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium flex-shrink-0">2</div>
                  <div>
                    <p className="font-medium">관리자 승인</p>
                    <p className="text-sm text-muted-foreground">
                      일반 장비: 관리 담당자 승인 필요<br/>
                      소모품: 상품운용팀 승인 필요
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium flex-shrink-0">3</div>
                  <div>
                    <p className="font-medium">대여 완료</p>
                    <p className="text-sm text-muted-foreground">승인 후 장비 수령 및 사용</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-1">반납 알림</p>
                <p className="text-xs text-muted-foreground">
                  반납 예정일 하루 전 이메일 알림이 발송됩니다.<br/>
                  연체 시 2일마다 반납 독촉 메일이 발송되니 주의하세요.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}