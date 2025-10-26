import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export const AdminLayout = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  // Get page title based on current route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/admin/orders')) return 'Quản Lý Đơn Hàng';
    if (path.includes('/admin/products')) return 'Quản Lý Sản Phẩm';
    if (path.includes('/admin/customers')) return 'Quản Lý Khách Hàng';
    if (path.includes('/admin/analytics')) return 'Phân Tích & Báo Cáo';
    if (path.includes('/admin/settings')) return 'Cài Đặt';
    return 'Tổng Quan';
  };

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  // Check if user is admin
  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Sidebar */}
      <AdminSidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-background border-b sticky top-0 z-10">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">{getPageTitle()}</h1>
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  Xin chào, <span className="font-semibold text-foreground">{user?.username}</span>
                </span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleLogout}
                  className="gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Đăng xuất
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
