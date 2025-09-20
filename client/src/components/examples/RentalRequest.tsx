import RentalRequest from '../RentalRequest';

export default function RentalRequestExample() {
  // //todo: remove mock functionality
  const mockItems = [
    {
      itemId: "1",
      category: "Router",
      name: "HUAWEI AR6120",
      model: "AR6120-S", 
      serialNumber: "2210012345678",
      status: "대여가능"
    },
    {
      itemId: "2",
      category: "Switch", 
      name: "Cisco Catalyst 2960",
      model: "WS-C2960-24TT-L",
      serialNumber: "FOC1234567A",
      status: "대여가능"
    },
    {
      itemId: "3",
      category: "소모품",
      name: "LC-LC 광점퍼코드",
      model: "3M",
      serialNumber: "",
      status: "대여가능"
    },
    {
      itemId: "4",
      category: "Wireless",
      name: "Cisco Aironet 2802I",
      model: "AIR-AP2802I-K9",
      serialNumber: "FCW1234567B",
      status: "대여가능"
    }
  ];

  const handleSubmitRequest = (request: any) => {
    console.log('Rental request submitted:', request);
  };

  return (
    <RentalRequest 
      availableItems={mockItems}
      onSubmitRequest={handleSubmitRequest}
    />
  );
}