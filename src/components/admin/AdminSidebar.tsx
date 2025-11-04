import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings,
  Home,
  BarChart3,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

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
  // {
  //   title: 'Khách Hàng',
  //   icon: Users,
  //   href: '/admin/customers',
  // },
  // {
  //   title: 'Thống Kê',
  //   icon: BarChart3,
  //   href: '/admin/analytics',
  // },
  // {
  //   title: 'Cài Đặt',
  //   icon: Settings,
  //   href: '/admin/settings',
  // },
];

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export const AdminSidebar = ({ collapsed, onToggle }: AdminSidebarProps) => {
  const location = useLocation();

  return (
    <aside className={cn(
      'bg-background border-r flex flex-col transition-all duration-300 relative',
      collapsed ? 'w-20' : 'w-64'
    )}>
      {/* Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggle}
        className="absolute -right-3 top-6 z-20 w-6 h-6 rounded-full border bg-background shadow-md hover:bg-muted"
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </Button>

      {/* Logo */}
      <div className={cn('p-6 border-b', collapsed && 'px-3')}>
        <Link to="/admin" className={cn('flex items-center gap-2', collapsed && 'justify-center')}>
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center flex-shrink-0">
            <Home className="w-5 h-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div>
              <h2 className="font-bold text-lg">ShopVN</h2>
              <p className="text-xs text-muted-foreground">Admin Panel</p>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className={cn('flex-1 p-4 space-y-1', collapsed && 'px-2')}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                collapsed ? 'justify-center px-2' : '',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
              title={collapsed ? item.title : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="font-medium">{item.title}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className={cn('p-4 border-t', collapsed && 'px-2')}>
        <Link
          to="/"
          className={cn(
            'flex items-center gap-2 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors',
            collapsed && 'justify-center px-2'
          )}
          title={collapsed ? 'Về Trang Chủ' : undefined}
        >
          <Home className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="font-medium">Về Trang Chủ</span>}
        </Link>
      </div>
    </aside>
  );
};
