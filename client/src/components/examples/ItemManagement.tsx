import ItemManagement from '../ItemManagement';

export default function ItemManagementExample() {
  // //todo: remove mock functionality
  const mockItems = [
    {
      itemId: "1",
      category: "Router",
      name: "HUAWEI AR6120",
      model: "AR6120-S",
      serialNumber: "2210012345678",
      status: "대여가능",
      note: "신규 입고"
    },
    {
      itemId: "2", 
      category: "Switch",
      name: "Cisco Catalyst 2960",
      model: "WS-C2960-24TT-L",
      serialNumber: "FOC1234567A",
      status: "대여불가",
      note: "점검 중"
    },
    {
      itemId: "3",
      category: "소모품",
      name: "LC-LC 광점퍼코드",
      model: "3M",
      serialNumber: "",
      status: "대여가능",
      note: "재고 20개"
    }
  ];

  const handleAddItem = (item: any) => {
    console.log('Add item:', item);
  };

  const handleUpdateItem = (itemId: string, updates: any) => {
    console.log('Update item:', itemId, updates);
  };

  const handleDeleteItem = (itemId: string) => {
    console.log('Delete item:', itemId);
  };

  return (
    <ItemManagement 
      items={mockItems}
      onAddItem={handleAddItem}
      onUpdateItem={handleUpdateItem}
      onDeleteItem={handleDeleteItem}
    />
  );
}