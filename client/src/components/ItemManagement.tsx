import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Package } from "lucide-react";

interface Item {
  itemId: string;
  category: string;
  name: string;
  model?: string;
  serialNumber?: string;
  status: string;
  note?: string;
}

interface ItemManagementProps {
  items: Item[];
  onAddItem: (item: Partial<Item>) => void;
  onUpdateItem: (itemId: string, updates: Partial<Item>) => void;
  onDeleteItem: (itemId: string) => void;
}

export default function ItemManagement({ items, onAddItem, onUpdateItem, onDeleteItem }: ItemManagementProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  
  const [formData, setFormData] = useState({
    category: "",
    name: "",
    model: "",
    serialNumber: "",
    status: "대여가능",
    note: "",
  });

  const categories = ["Router", "Switch", "Wireless", "트랜시버", "소모품"];
  const statuses = ["대여가능", "대여불가"];

  const filteredItems = items.filter(item => {
    const matchesCategory = !filterCategory || item.category === filterCategory;
    const matchesSearch = !searchTerm || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      onUpdateItem(editingItem.itemId, formData);
      setEditingItem(null);
    } else {
      onAddItem(formData);
      setShowAddDialog(false);
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      category: "",
      name: "",
      model: "",
      serialNumber: "",
      status: "대여가능",
      note: "",
    });
  };

  const handleEdit = (item: Item) => {
    setEditingItem(item);
    setFormData({
      category: item.category,
      name: item.name,
      model: item.model || "",
      serialNumber: item.serialNumber || "",
      status: item.status,
      note: item.note || "",
    });
  };

  const isSerialRequired = formData.category && formData.category !== "소모품";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">물품 관리</h2>
          <p className="text-muted-foreground">IT 장비 등록 및 관리</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-item">
              <Plus className="h-4 w-4 mr-2" />
              물품 등록
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>새 물품 등록</DialogTitle>
                <DialogDescription>새로운 IT 장비를 시스템에 등록합니다.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="category">카테고리 *</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => setFormData({...formData, category: value})}
                    required
                  >
                    <SelectTrigger data-testid="select-category">
                      <SelectValue placeholder="카테고리 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="name">품명 *</Label>
                  <Input
                    id="name"
                    data-testid="input-name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="예: HUAWEI AR6120"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="model">모델번호</Label>
                  <Input
                    id="model"
                    data-testid="input-model"
                    value={formData.model}
                    onChange={(e) => setFormData({...formData, model: e.target.value})}
                    placeholder="모델번호 입력"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="serialNumber">
                    시리얼넘버 {isSerialRequired && "*"}
                  </Label>
                  <Input
                    id="serialNumber"
                    data-testid="input-serial"
                    value={formData.serialNumber}
                    onChange={(e) => setFormData({...formData, serialNumber: e.target.value})}
                    placeholder={isSerialRequired ? "시리얼넘버 입력 (필수)" : "시리얼넘버 입력 (선택)"}
                    required={!!isSerialRequired}
                  />
                  {formData.category === "소모품" && (
                    <p className="text-xs text-muted-foreground">소모품은 시리얼넘버가 필요하지 않습니다.</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="status">상태</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => setFormData({...formData, status: value})}
                  >
                    <SelectTrigger data-testid="select-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map((status) => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="note">비고</Label>
                  <Textarea
                    id="note"
                    data-testid="input-note"
                    value={formData.note}
                    onChange={(e) => setFormData({...formData, note: e.target.value})}
                    placeholder="추가 정보나 특이사항 입력"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                  취소
                </Button>
                <Button type="submit" data-testid="button-submit-item">
                  등록
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            물품 목록
          </CardTitle>
          <CardDescription>등록된 IT 장비 목록을 확인하고 관리할 수 있습니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <Input
                placeholder="물품명, 모델, 시리얼 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="input-search"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-48" data-testid="select-filter-category">
                <SelectValue placeholder="전체 카테고리" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">전체 카테고리</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>카테고리</TableHead>
                  <TableHead>품명</TableHead>
                  <TableHead>모델</TableHead>
                  <TableHead>시리얼넘버</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>비고</TableHead>
                  <TableHead className="text-right">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.itemId}>
                    <TableCell>
                      <Badge variant="outline">{item.category}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.model || "-"}</TableCell>
                    <TableCell>{item.serialNumber || "-"}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={item.status === "대여가능" ? "default" : "secondary"}
                        data-testid={`badge-status-${item.itemId}`}
                      >
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.note || "-"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEdit(item)}
                          data-testid={`button-edit-${item.itemId}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => onDeleteItem(item.itemId)}
                          data-testid={`button-delete-${item.itemId}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>물품 수정</DialogTitle>
              <DialogDescription>물품 정보를 수정합니다.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {/* Same form fields as add dialog */}
              <div className="space-y-2">
                <Label htmlFor="edit-category">카테고리 *</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData({...formData, category: value})}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="카테고리 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-name">품명 *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="예: HUAWEI AR6120"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-model">모델번호</Label>
                <Input
                  id="edit-model"
                  value={formData.model}
                  onChange={(e) => setFormData({...formData, model: e.target.value})}
                  placeholder="모델번호 입력"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-serialNumber">
                  시리얼넘버 {isSerialRequired && "*"}
                </Label>
                <Input
                  id="edit-serialNumber"
                  value={formData.serialNumber}
                  onChange={(e) => setFormData({...formData, serialNumber: e.target.value})}
                  placeholder={isSerialRequired ? "시리얼넘버 입력 (필수)" : "시리얼넘버 입력 (선택)"}
                  required={!!isSerialRequired}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-status">상태</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => setFormData({...formData, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((status) => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-note">비고</Label>
                <Textarea
                  id="edit-note"
                  value={formData.note}
                  onChange={(e) => setFormData({...formData, note: e.target.value})}
                  placeholder="추가 정보나 특이사항 입력"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditingItem(null)}>
                취소
              </Button>
              <Button type="submit">
                수정
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}