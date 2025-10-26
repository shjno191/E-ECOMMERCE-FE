import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings,
  Home,
  BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    href: '/admin',
  },
  {
    title: 'Sản Phẩm',
    icon: Package,
    href: '/admin/products',
  },
  {
    title: 'Đơn Hàng',
    icon: ShoppingCart,
    href: '/admin/orders',
  },
  {
    title: 'Khách Hàng',
    icon: Users,
    href: '/admin/customers',
  },
  {
    title: 'Thống Kê',
    icon: BarChart3,
    href: '/admin/analytics',
  },
  {
    title: 'Cài Đặt',
    icon: Settings,
    href: '/admin/settings',
  },
];

export const AdminSidebar = () => {
  const location = useLocation();

  return (
    <aside className="w-64 bg-background border-r flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b">
        <Link to="/admin" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <Home className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-bold text-lg">ShopVN</h2>
            <p className="text-xs text-muted-foreground">Admin Panel</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.title}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t">
        <Link
          to="/"
          className="flex items-center gap-2 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <Home className="w-5 h-5" />
          <span className="font-medium">Về Trang Chủ</span>
        </Link>
      </div>
    </aside>
  );
};
