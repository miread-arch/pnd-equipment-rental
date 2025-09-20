import Header from '../Header';

export default function HeaderExample() {
  const mockUser = {
    name: "홍길동",
    department: "상품운용팀",
    role: "admin"
  };

  const handleLogout = () => {
    console.log('Logout clicked');
  };

  return <Header user={mockUser} onLogout={handleLogout} />;
}