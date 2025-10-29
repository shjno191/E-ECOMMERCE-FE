import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  RefreshCw,
} from 'lucide-react';
import { getAllOrders, type Order } from '@/services/orderService';
import { getProducts } from '@/services/productService';
import { useAuthStore } from '@/store/useAuthStore';

export default function AdminAnalytics() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuthStore();

  const loadData = async () => {
    setLoading(true);
    try {
      if (!token) {
        console.error('No auth token available');
        return;
      }

      const { orders: ordersData } = await getAllOrders(token, {});
      setOrders(ordersData);

      const { products: productsData } = await getProducts({});
      setProducts(productsData);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  // Calculate metrics
  const getMetrics = () => {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const thisMonthOrders = orders.filter((o) => new Date(o.createdAt) >= thisMonth);
    const lastMonthOrders = orders.filter(
      (o) => new Date(o.createdAt) >= lastMonth && new Date(o.createdAt) < thisMonth
    );

    const thisMonthRevenue = thisMonthOrders.reduce((sum, o) => sum + o.total, 0);
    const lastMonthRevenue = lastMonthOrders.reduce((sum, o) => sum + o.total, 0);

    const revenueGrowth =
      lastMonthRevenue > 0 ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;
    const ordersGrowth =
      lastMonthOrders.length > 0
        ? ((thisMonthOrders.length - lastMonthOrders.length) / lastMonthOrders.length) * 100
        : 0;

    return {
      totalRevenue: orders.reduce((sum, o) => sum + o.total, 0),
      thisMonthRevenue,
      revenueGrowth,
      totalOrders: orders.length,
      thisMonthOrders: thisMonthOrders.length,
      ordersGrowth,
      totalProducts: products.length,
      totalCustomers: new Set(orders.map((o) => o.customerInfo.email)).size,
      avgOrderValue: orders.length > 0 ? orders.reduce((sum, o) => sum + o.total, 0) / orders.length : 0,
    };
  };

  // Top selling products
  const getTopProducts = () => {
    const productSales = new Map<string | number, { name: string; quantity: number; revenue: number }>();

    orders.forEach((order) => {
      order.items.forEach((item) => {
        const existing = productSales.get(item.productId);
        if (existing) {
          existing.quantity += item.quantity;
          existing.revenue += item.price * item.quantity;
        } else {
          productSales.set(item.productId, {
            name: item.productName,
            quantity: item.quantity,
            revenue: item.price * item.quantity,
          });
        }
      });
    });

    return Array.from(productSales.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  };

  // Order status distribution
  const getStatusDistribution = () => {
    return {
      pending: orders.filter((o) => o.status === 'pending').length,
      processing: orders.filter((o) => o.status === 'processing').length,
      shipped: orders.filter((o) => o.status === 'shipped').length,
      delivered: orders.filter((o) => o.status === 'delivered').length,
      cancelled: orders.filter((o) => o.status === 'cancelled').length,
    };
  };

  // Revenue by payment method (thay thế cho revenue by category vì OrderItem không có category)
  const getRevenueByPaymentMethod = () => {
    const paymentRevenue = new Map<string, number>();

    orders.forEach((order) => {
      const method = order.paymentMethod;
      paymentRevenue.set(method, (paymentRevenue.get(method) || 0) + order.total);
    });

    const methodNames: Record<string, string> = {
      momo: 'MoMo',
      zalopay: 'ZaloPay',
      cash: 'Tiền mặt',
    };

    return Array.from(paymentRevenue.entries())
      .map(([method, revenue]) => ({ 
        category: methodNames[method] || method, 
        revenue 
      }))
      .sort((a, b) => b.revenue - a.revenue);
  };

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

  const metrics = getMetrics();
  const topProducts = getTopProducts();
  const statusDistribution = getStatusDistribution();
  const paymentRevenue = getRevenueByPaymentMethod();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Tổng quan kinh doanh</p>
        </div>
        <Button onClick={loadData} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Làm mới
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Doanh thu tháng này
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(metrics.thisMonthRevenue)}</div>
            <div className="flex items-center gap-1 mt-2">
              {metrics.revenueGrowth >= 0 ? (
                <TrendingUp className="w-4 h-4 text-green-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-600" />
              )}
              <span
                className={`text-sm font-medium ${
                  metrics.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {metrics.revenueGrowth >= 0 ? '+' : ''}
                {metrics.revenueGrowth.toFixed(1)}%
              </span>
              <span className="text-xs text-muted-foreground">vs tháng trước</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              Đơn hàng tháng này
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.thisMonthOrders}</div>
            <div className="flex items-center gap-1 mt-2">
              {metrics.ordersGrowth >= 0 ? (
                <TrendingUp className="w-4 h-4 text-green-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-600" />
              )}
              <span
                className={`text-sm font-medium ${
                  metrics.ordersGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {metrics.ordersGrowth >= 0 ? '+' : ''}
                {metrics.ordersGrowth.toFixed(1)}%
              </span>
              <span className="text-xs text-muted-foreground">vs tháng trước</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Package className="w-4 h-4" />
              Giá trị TB/đơn
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(metrics.avgOrderValue)}</div>
            <p className="text-xs text-muted-foreground mt-2">Trung bình tất cả đơn hàng</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4" />
              Tổng khách hàng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalCustomers}</div>
            <p className="text-xs text-muted-foreground mt-2">Khách hàng duy nhất</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top 5 Sản Phẩm Bán Chạy</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sản phẩm</TableHead>
                  <TableHead className="text-center">Đã bán</TableHead>
                  <TableHead className="text-right">Doanh thu</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topProducts.map((product, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="w-6 h-6 flex items-center justify-center p-0">
                          {index + 1}
                        </Badge>
                        <span className="font-medium">{product.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">{product.quantity}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatPrice(product.revenue)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Order Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Phân Bố Trạng Thái Đơn Hàng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Chờ xử lý</span>
                  <span className="font-medium">{statusDistribution.pending} đơn</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full"
                    style={{
                      width: `${(statusDistribution.pending / metrics.totalOrders) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Đang xử lý</span>
                  <span className="font-medium">{statusDistribution.processing} đơn</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-orange-500 h-2 rounded-full"
                    style={{
                      width: `${(statusDistribution.processing / metrics.totalOrders) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Đang giao</span>
                  <span className="font-medium">{statusDistribution.shipped} đơn</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-purple-500 h-2 rounded-full"
                    style={{
                      width: `${(statusDistribution.shipped / metrics.totalOrders) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Đã giao</span>
                  <span className="font-medium">{statusDistribution.delivered} đơn</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{
                      width: `${(statusDistribution.delivered / metrics.totalOrders) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Đã hủy</span>
                  <span className="font-medium">{statusDistribution.cancelled} đơn</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full"
                    style={{
                      width: `${(statusDistribution.cancelled / metrics.totalOrders) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Revenue by Category */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Doanh Thu Theo Phương Thức Thanh Toán</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Phương thức</TableHead>
                  <TableHead className="text-right">Doanh thu</TableHead>
                  <TableHead className="text-right">% Tổng</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentRevenue.map((cat, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${
                          index === 0 ? 'bg-blue-500' :
                          index === 1 ? 'bg-green-500' :
                          index === 2 ? 'bg-purple-500' :
                          index === 3 ? 'bg-orange-500' :
                          'bg-gray-500'
                        }`}></div>
                        <span className="font-medium">{cat.category}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatPrice(cat.revenue)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="secondary">
                        {((cat.revenue / metrics.totalRevenue) * 100).toFixed(1)}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
