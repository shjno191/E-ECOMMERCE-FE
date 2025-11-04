import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useState } from 'react';

export const AdminLayout = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
      <AdminSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header - More Compact */}
        <header className="bg-background border-b sticky top-0 z-10 shadow-sm">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold truncate">{getPageTitle()}</h1>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground hidden sm:block">
                  <span className="font-semibold text-foreground">{user?.username}</span>
                </span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleLogout}
                  className="gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Đăng xuất</span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content - More Compact Padding */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
