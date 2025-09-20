import RentalList from '../RentalList';

export default function RentalListExample() {
  // //todo: remove mock functionality
  const mockRentals = [
    {
      rentalId: "1",
      itemName: "HUAWEI AR6120",
      category: "Router",
      userName: "김철수",
      department: "기술본부",
      status: "대여중",
      createdAt: new Date(2024, 0, 15),
      expectedReturnDate: new Date(2024, 0, 25),
      note: "프로젝트 테스트용"
    },
    {
      rentalId: "2", 
      itemName: "LC-LC 광점퍼코드",
      category: "소모품",
      userName: "이영희",
      department: "상품운용팀",
      status: "신청중",
      createdAt: new Date(2024, 0, 20),
      expectedReturnDate: new Date(2024, 0, 30),
      note: "고객사 설치용"
    },
    {
      rentalId: "3",
      itemName: "Cisco Catalyst 2960", 
      category: "Switch",
      userName: "박민수",
      department: "기술본부",
      status: "반납완료",
      createdAt: new Date(2024, 0, 10),
      expectedReturnDate: new Date(2024, 0, 20),
      actualReturnDate: new Date(2024, 0, 19),
      note: "네트워크 구성 테스트"
    },
    {
      rentalId: "4",
      itemName: "Cisco Aironet 2802I",
      category: "Wireless", 
      userName: "정수진",
      department: "기술본부",
      status: "대여중",
      createdAt: new Date(2024, 0, 5),
      expectedReturnDate: new Date(2024, 0, 15), // Overdue
      note: "무선 환경 테스트"
    }
  ];

  const handleUpdateStatus = (rentalId: string, status: string) => {
    console.log('Update rental status:', rentalId, status);
  };

  return (
    <RentalList 
      rentals={mockRentals}
      showAllUsers={true}
      onUpdateStatus={handleUpdateStatus}
    />
  );
}