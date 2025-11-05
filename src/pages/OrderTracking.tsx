import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Package, Truck, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useOrderStore } from '@/store/useOrderStore';
import { useAuthStore } from '@/store/useAuthStore';
import * as orderService from '@/services/orderService';
import { toast } from 'sonner';
import type { Order } from '@/services/orderService';

const OrderTracking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const getOrderById = useOrderStore((state) => state.getOrderById);
  const isInitialized = useOrderStore((state) => state.isInitialized);
  const setLoading = useOrderStore((state) => state.setLoading);
  const addOrder = useOrderStore((state) => state.addOrder);
  const { token, isAuthenticated } = useAuthStore();
  
  // Local state for loading and order data
  const [isLoadingLocal, setIsLoadingLocal] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    const loadOrder = async () => {
      if (!id) return;

      if (!isAuthenticated || !token) {
        toast.error('Vui lòng đăng nhập để xem đơn hàng');
        navigate('/auth');
        return;
      }

      // Wait for initial orders load from useInitializeData
      // Only fetch if store is initialized and order is not found
      const orderFromStore = getOrderById(id);
      
      console.log('🔍 OrderTracking check:', {
        orderId: id,
        orderInStore: !!orderFromStore,
        isInitialized,
        hasFetched,
      });
      
      if (orderFromStore) {
        console.log('✅ Order found in store, no API call needed');
        setOrder(orderFromStore);
        return;
      }

      // If store is not initialized yet, wait for it
      // This prevents fetching before useInitializeData completes
      if (!isInitialized) {
        console.log('⏳ Waiting for initial orders load...');
        return;
      }

      // If order not in store after initialization, fetch it
      if (!hasFetched) {
        console.log('📡 Order not in store after initialization, fetching from API...');
        setHasFetched(true);
        setIsLoadingLocal(true);
        setLoading(true);
        try {
          const fetchedOrder = await orderService.getOrderById(id, token);
          if (fetchedOrder) {
            setOrder(fetchedOrder);
            // Add to store for future use
            addOrder(fetchedOrder);
            console.log('✅ Order fetched and added to store');
          } else {
            toast.error('Không tìm thấy đơn hàng');
          }
        } catch (error) {
          console.error('Error loading order:', error);
          toast.error('Không thể tải thông tin đơn hàng');
        } finally {
          setIsLoadingLocal(false);
          setLoading(false);
        }
      }
    };

    loadOrder();
    // Depend on isInitialized to re-check after initial load completes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, token, isAuthenticated, isInitialized]);

  if (isLoadingLocal) {
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
    completed: {
      icon: CheckCircle,
      label: 'Hoàn thành',
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
                    key={`${item.productId}-${item.selectedColor}-${item.selectedSize}`}
                    className="flex gap-4 pb-4 border-b last:border-0"
                  >
                    <img
                      src={item.productImage || '/placeholder.svg'}
                      alt={item.productName}
                      className="w-20 h-20 object-cover rounded-lg bg-muted"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder.svg';
                      }}
                    />
                    <div className="flex-1">
                      <p className="font-semibold">{item.productName}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.selectedColor} - {item.selectedSize}
                      </p>
                      <p className="text-sm">Số lượng: {item.quantity}</p>
                      <p className="text-primary font-bold">
                        {item.price.toLocaleString('vi-VN')}đ
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
                    {order.paymentMethod === 'cash' ? 'Tiền mặt - COD' : 'Chuyển khoản ngân hàng'}
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
