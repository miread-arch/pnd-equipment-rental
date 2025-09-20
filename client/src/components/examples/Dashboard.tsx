import Dashboard from '../Dashboard';

export default function DashboardExample() {
  const mockStats = {
    totalItems: 135,
    availableItems: 79,
    myActiveRentals: 3,
    pendingApprovals: 8,
    overdueRentals: 2,
  };

  return <Dashboard stats={mockStats} userRole="admin" />;
}