import { Link } from 'react-router-dom';
import { Package, Clock, Truck, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import * as orderService from '@/services/orderService';
import { useOrderStore } from '@/store/useOrderStore';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';
import { useState } from 'react';

const Orders = () => {
  const orders = useOrderStore((state) => state.orders);
  const isLoading = useOrderStore((state) => state.isLoading);
  const setLoading = useOrderStore((state) => state.setLoading);
  const setOrders = useOrderStore((state) => state.setOrders);
  const { token, isAuthenticated } = useAuthStore();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Orders are already loaded by useInitializeData hook in App.tsx
  // No automatic loading here to avoid duplicate API calls

  // Manual refresh function for user-initiated refresh
  const handleRefresh = async () => {
    if (!isAuthenticated || !token) {
      toast.error('Vui lòng đăng nhập để tải đơn hàng');
      return;
    }

    setIsRefreshing(true);
    setLoading(true);
    try {
      const { orders: data } = await orderService.getUserOrders(token);
      setOrders(data.reverse()); // Newest first
      toast.success('Đã cập nhật danh sách đơn hàng');
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const statusConfig = {
    pending: {
      icon: Clock,
      label: 'Chờ xác nhận',
      variant: 'default' as const,
      color: 'bg-yellow-500 text-white',
    },
    processing: {
      icon: Package,
      label: 'Đang xử lý',
      variant: 'default' as const,
      color: 'bg-orange-500 text-white',
    },
    shipped: {
      icon: Truck,
      label: 'Đang giao',
      variant: 'default' as const,
      color: 'bg-purple-500 text-white',
    },
    delivered: {
      icon: CheckCircle,
      label: 'Đã giao',
      variant: 'default' as const,
      color: 'bg-green-500 text-white',
    },
    cancelled: {
      icon: XCircle,
      label: 'Đã hủy',
      variant: 'destructive' as const,
      color: 'bg-red-500 text-white',
    },
  };

  if (!isLoading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center py-20">
          <Package className="w-24 h-24 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Chưa có đơn hàng nào</h2>
          <p className="text-muted-foreground mb-6">
            Bạn chưa có đơn hàng nào. Hãy đặt hàng ngay!
          </p>
          <Link to="/">
            <Button size="lg">Mua sắm ngay</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Đơn hàng của tôi</h1>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
        </div>

        <div className="space-y-4">
          {orders.map((order) => {
            const status = statusConfig[order.status];
            const StatusIcon = status.icon;

            return (
              <Card key={order.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <StatusIcon className="w-5 h-5" />
                        <Badge className={status.color}>{status.label}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Mã đơn: {order.id}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Ngày đặt: {new Date(order.createdAt).toLocaleString('vi-VN')}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">
                        {order.total.toLocaleString('vi-VN')}đ
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {order.items.length} sản phẩm
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 overflow-x-auto pb-2">
                    {order.items.slice(0, 4).map((item, idx) => (
                      <img
                        key={`${item.productId}-${idx}`}
                        src={item.productImage || '/placeholder.svg'}
                        alt={item.productName}
                        className="w-20 h-20 object-cover rounded-lg flex-shrink-0 bg-muted"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder.svg';
                        }}
                      />
                    ))}
                    {order.items.length > 4 && (
                      <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-semibold">
                          +{order.items.length - 4}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Link to={`/order/${order.id}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        Xem chi tiết
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Orders;
