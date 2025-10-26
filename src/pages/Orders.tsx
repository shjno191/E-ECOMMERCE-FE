import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Clock, Truck, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { api, type Order } from '@/services/api';

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      try {
        const data = await api.getAllOrders();
        setOrders(data.reverse()); // Newest first
      } catch (error) {
        console.error('Error loading orders:', error);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  const statusConfig = {
    pending: {
      icon: Clock,
      label: 'Chờ xác nhận',
      variant: 'default' as const,
    },
    processing: {
      icon: Package,
      label: 'Đang xử lý',
      variant: 'default' as const,
    },
    shipped: {
      icon: Truck,
      label: 'Đang giao',
      variant: 'default' as const,
    },
    delivered: {
      icon: CheckCircle,
      label: 'Đã giao',
      variant: 'default' as const,
    },
    cancelled: {
      icon: XCircle,
      label: 'Đã hủy',
      variant: 'destructive' as const,
    },
  };

  if (!loading && orders.length === 0) {
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
        <h1 className="text-3xl font-bold mb-8">Đơn hàng của tôi</h1>

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
                        <Badge variant={status.variant}>{status.label}</Badge>
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
                    {order.items.slice(0, 4).map((item) => (
                      <img
                        key={`${item.product.id}-${item.selectedColor}-${item.selectedSize}`}
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
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
