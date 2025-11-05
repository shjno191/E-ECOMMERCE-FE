import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, ShoppingCart, Users, DollarSign } from 'lucide-react';
import { getAllOrders } from '@/services/orderService';
import { getProducts } from '@/services/productService';
import { useAuthStore } from '@/store/useAuthStore';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalRevenue: 0,
    pendingOrders: 0,
  });
  const { token } = useAuthStore();

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      try {
        if (!token) {
          console.error('No auth token available');
          return;
        }

        // Load data from backend
        const { products } = await getProducts({});
        const { orders } = await getAllOrders(token, {});

        const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
        const pendingOrders = orders.filter(o => o.status === 'pending').length;
        
        // Count unique customers by userId
        const uniqueCustomers = new Set(orders.map(o => o.userId)).size;

        setStats({
          totalProducts: products.length,
          totalOrders: orders.length,
          totalCustomers: uniqueCustomers,
          totalRevenue,
          pendingOrders,
        });
      } catch (error) {
        console.error('Error loading dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [token]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-20"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-12"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const dashboardStats = [
    // {
    //   title: 'Tổng Sản Phẩm',
    //   value: stats.totalProducts.toString(),
    //   icon: Package,
    //   color: 'text-blue-600',
    //   bgColor: 'bg-blue-100',
    // },
    // {
    //   title: 'Tổng Đơn Hàng',
    //   value: stats.totalOrders.toString(),
    //   icon: ShoppingCart,
    //   color: 'text-green-600',
    //   bgColor: 'bg-green-100',
    //   badge: stats.pendingOrders > 0 ? `${stats.pendingOrders} chờ xử lý` : null,
    // },
    // {
    //   title: 'Khách Hàng',
    //   value: stats.totalCustomers.toString(),
    //   icon: Users,
    //   color: 'text-purple-600',
    //   bgColor: 'bg-purple-100',
    // },
    // {
    //   title: 'Tổng Doanh Thu',
    //   value: formatPrice(stats.totalRevenue),
    //   icon: DollarSign,
    //   color: 'text-orange-600',
    //   bgColor: 'bg-orange-100',
    // },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {dashboardStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                {stat.badge && (
                  <Badge variant="secondary" className="mt-2">
                    {stat.badge}
                  </Badge>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Info Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Thông Tin Hệ Thống</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phiên bản:</span>
              <span className="font-medium">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Dữ liệu:</span>
              <Badge className="bg-blue-500">API Thực</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Trạng thái:</span>
              <Badge className="bg-green-500">Hoạt động</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Thống Kê Nhanh</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Đơn chờ xử lý:</span>
              <Badge variant="secondary">{stats.pendingOrders}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Giá trị TB/đơn:</span>
              <span className="font-medium">
                {stats.totalOrders > 0 
                  ? formatPrice(stats.totalRevenue / stats.totalOrders)
                  : '0 ₫'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
