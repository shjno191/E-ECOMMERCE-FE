import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Package, Truck, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { api, type Order } from '@/services/api';
import { Skeleton } from '@/components/ui/skeleton';

const OrderTracking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrder = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const data = await api.getOrderById(id);
        setOrder(data || null);
      } catch (error) {
        console.error('Error loading order:', error);
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-64 mb-8" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Không tìm thấy đơn hàng</h1>
        <Button onClick={() => navigate('/')}>Về trang chủ</Button>
      </div>
    );
  }

  const statusConfig = {
    pending: {
      icon: Clock,
      label: 'Chờ xác nhận',
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    processing: {
      icon: Package,
      label: 'Đang xử lý',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    shipped: {
      icon: Truck,
      label: 'Đang giao',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    delivered: {
      icon: CheckCircle,
      label: 'Đã giao',
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    cancelled: {
      icon: XCircle,
      label: 'Đã hủy',
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
  };

  const currentStatus = statusConfig[order.status];
  const StatusIcon = currentStatus.icon;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Chi tiết đơn hàng</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Order Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle>Trạng thái đơn hàng</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${currentStatus.bgColor}`}>
                    <StatusIcon className={`w-8 h-8 ${currentStatus.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{currentStatus.label}</p>
                    <p className="text-sm text-muted-foreground">
                      Mã đơn hàng: {order.id}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Ngày đặt: {new Date(order.createdAt).toLocaleString('vi-VN')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Info */}
            <Card>
              <CardHeader>
                <CardTitle>Thông tin người nhận</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Họ tên:</p>
                  <p className="font-semibold">{order.customerInfo.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Số điện thoại:</p>
                  <p className="font-semibold">{order.customerInfo.phone}</p>
                </div>
                {order.customerInfo.email && (
                  <div>
                    <p className="text-sm text-muted-foreground">Email:</p>
                    <p className="font-semibold">{order.customerInfo.email}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Địa chỉ:</p>
                  <p className="font-semibold">{order.customerInfo.address}</p>
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Sản phẩm đã đặt</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.items.map((item) => (
                  <div
                    key={`${item.product.id}-${item.selectedColor}-${item.selectedSize}`}
                    className="flex gap-4 pb-4 border-b last:border-0"
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <p className="font-semibold">{item.product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.selectedColor} - {item.selectedSize}
                      </p>
                      <p className="text-sm">Số lượng: {item.quantity}</p>
                      <p className="text-primary font-bold">
                        {item.product.price.toLocaleString('vi-VN')}đ
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Tổng đơn hàng</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tạm tính:</span>
                    <span className="font-semibold">
                      {order.total.toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phí vận chuyển:</span>
                    <span className="font-semibold text-success">Miễn phí</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="font-bold">Tổng cộng:</span>
                    <span className="font-bold text-primary text-lg">
                      {order.total.toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2">
                    Phương thức thanh toán:
                  </p>
                  <Badge variant="outline">
                    {order.paymentMethod === 'momo' ? 'MoMo' : 'ZaloPay'}
                  </Badge>
                </div>

                <Button className="w-full" onClick={() => navigate('/')}>
                  Tiếp tục mua sắm
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
