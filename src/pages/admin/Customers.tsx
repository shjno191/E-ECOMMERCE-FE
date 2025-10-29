import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { RefreshCw, Search, ShoppingBag, User } from 'lucide-react';
import { toast } from 'sonner';
import { getAllOrders, type Order } from '@/services/orderService';
import { useAuthStore } from '@/store/useAuthStore';

interface CustomerStats {
  username: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  orders: Order[];
}

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<CustomerStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { token } = useAuthStore();

  const loadCustomers = async () => {
    setLoading(true);
    try {
      if (!token) {
        toast.error('Bạn cần đăng nhập');
        return;
      }

      const { orders: allOrders } = await getAllOrders(token, {});
      
      // Group orders by customer
      const customerMap = new Map<string, Order[]>();
      allOrders.forEach((order) => {
        const username = order.customerInfo.email?.split('@')[0] || order.customerInfo.phone;
        if (!customerMap.has(username)) {
          customerMap.set(username, []);
        }
        customerMap.get(username)!.push(order);
      });

      // Calculate stats for each customer
      const customerStats: CustomerStats[] = Array.from(customerMap.entries()).map(
        ([username, orders]) => {
          const sortedOrders = orders.sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          
          return {
            username,
            totalOrders: orders.length,
            totalSpent: orders.reduce((sum, order) => sum + order.total, 0),
            lastOrderDate: sortedOrders[0]?.createdAt || '',
            orders: sortedOrders,
          };
        }
      );

      // Sort by total spent descending
      customerStats.sort((a, b) => b.totalSpent - a.totalSpent);
      setCustomers(customerStats);
    } catch (error) {
      console.error('Error loading customers:', error);
      toast.error('Không thể tải danh sách khách hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [token]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const getStats = () => {
    return {
      totalCustomers: customers.length,
      totalOrders: customers.reduce((sum, c) => sum + c.totalOrders, 0),
      totalRevenue: customers.reduce((sum, c) => sum + c.totalSpent, 0),
      avgOrderValue:
        customers.reduce((sum, c) => sum + c.totalSpent, 0) /
        customers.reduce((sum, c) => sum + c.totalOrders, 0) || 0,
    };
  };

  const filteredCustomers = customers.filter((customer) =>
    customer.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = getStats();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
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

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tổng khách hàng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCustomers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tổng đơn hàng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tổng doanh thu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatPrice(stats.totalRevenue)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Giá trị TB/đơn
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatPrice(stats.avgOrderValue)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Danh Sách Khách Hàng</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm khách hàng..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              <Button onClick={loadCustomers} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Làm mới
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredCustomers.length === 0 ? (
            <div className="text-center py-12">
              <User className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? 'Không tìm thấy khách hàng' : 'Chưa có khách hàng nào'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Khách hàng</TableHead>
                  <TableHead className="text-center">Số đơn hàng</TableHead>
                  <TableHead>Tổng chi tiêu</TableHead>
                  <TableHead>Đơn gần nhất</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Hạng</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer, index) => {
                  const isVIP = customer.totalSpent > 5000000;
                  const isActive = customer.orders.some(
                    (o) =>
                      new Date().getTime() - new Date(o.createdAt).getTime() <
                      30 * 24 * 60 * 60 * 1000
                  ); // Active in last 30 days

                  return (
                    <TableRow key={customer.username}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                            {customer.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium">{customer.username}</p>
                            <p className="text-xs text-muted-foreground">
                              {customer.orders[0]?.customerInfo.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" className="font-semibold">
                          <ShoppingBag className="w-3 h-3 mr-1" />
                          {customer.totalOrders}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatPrice(customer.totalSpent)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(customer.lastOrderDate).toLocaleDateString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={isActive ? 'border-green-500 text-green-700' : ''}
                        >
                          {isActive ? '🟢 Hoạt động' : '⚪ Không hoạt động'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {isVIP ? (
                          <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                            👑 VIP
                          </Badge>
                        ) : index < 10 ? (
                          <Badge variant="secondary">⭐ Top 10</Badge>
                        ) : (
                          <Badge variant="outline">Thường</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
