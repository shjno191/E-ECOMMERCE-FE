import { useEffect, useState, Fragment } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getAllOrders, updateOrderStatus, type Order } from '@/services/orderService';
import { useAuthStore } from '@/store/useAuthStore';
import { RefreshCw, PackageCheck, PackageX, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const statusColors = {
  pending: 'bg-yellow-500',
  processing: 'bg-orange-500',
  shipped: 'bg-purple-500',
  delivered: 'bg-green-500',
  cancelled: 'bg-red-500',
};

const statusTextColors = {
  pending: 'text-yellow-700',
  processing: 'text-orange-700',
  shipped: 'text-purple-700',
  delivered: 'text-green-700',
  cancelled: 'text-red-700',
};

const statusLabels = {
  pending: 'Chờ xử lý',
  processing: 'Đang xử lý',
  shipped: 'Đang giao',
  delivered: 'Đã giao',
  cancelled: 'Đã hủy',
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const { token } = useAuthStore();

  const loadOrders = async () => {
    setLoading(true);
    try {
      if (!token) {
        toast.error('Bạn cần đăng nhập để xem đơn hàng');
        return;
      }

      // Load all orders from backend
      const { orders: allOrders } = await getAllOrders(token, {});
      
      // Sort by date descending
      const sortedOrders = allOrders.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setOrders(sortedOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [token]);

  const handleStatusChange = async (orderId: string | number, newStatus: Order['status']) => {
    // Admin KHÔNG BAO GIỜ được chuyển trực tiếp sang "delivered"
    if (newStatus === 'delivered') {
      toast.error('Admin không có quyền xác nhận hoàn thành đơn hàng. Chỉ khách hàng/shipper mới có thể xác nhận.');
      return;
    }

    const currentOrder = orders.find(o => o.id === orderId);
    if (!currentOrder) {
      toast.error('Không tìm thấy đơn hàng');
      return;
    }

    if (!token) {
      toast.error('Bạn cần đăng nhập');
      return;
    }

    setUpdatingOrderId(String(orderId));
    try {
      await updateOrderStatus(Number(orderId), newStatus, token);
      
      // Update local state
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      
      toast.success('Đã cập nhật trạng thái đơn hàng');
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Không thể cập nhật trạng thái');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleImageClick = (e: React.MouseEvent, imageUrl: string) => {
    e.stopPropagation();
    setZoomedImage(imageUrl);
  };

  const getTotalQuantity = (order: Order) => {
    return order.items.reduce((total, item) => total + item.quantity, 0);
  };

  const toggleOrderDetails = (orderId: string | number) => {
    const id = String(orderId);
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  const getAvailableStatuses = (currentStatus: Order['status']): Order['status'][] => {
    // Logic chuyển trạng thái hợp lý cho admin
    // Admin KHÔNG được phép chuyển sang "delivered" - chỉ khách hàng/shipper mới xác nhận được
    switch (currentStatus) {
      case 'pending':
        return ['pending', 'processing', 'cancelled'];
      case 'processing':
        return ['processing', 'shipped', 'cancelled'];
      case 'shipped':
        return ['shipped', 'cancelled']; // Admin CHỈ có thể hủy, KHÔNG thể chuyển sang delivered
      case 'delivered':
        return ['delivered']; // Không thể thay đổi khi đã giao
      case 'cancelled':
        return ['cancelled']; // Không thể thay đổi khi đã hủy
      default:
        return [currentStatus];
    }
  };

  const getStats = () => {
    return {
      total: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      processing: orders.filter(o => o.status === 'processing').length,
      shipped: orders.filter(o => o.status === 'shipped').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length,
    };
  };

  const stats = getStats();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Quản Lý Đơn Hàng</h2>
            <p className="text-muted-foreground">Đang tải dữ liệu...</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-5">
          {[...Array(5)].map((_, i) => (
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
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tổng đơn
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Chờ xử lý
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Đang xử lý
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.processing}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Đang giao
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.shipped}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Đã giao
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.delivered}</div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Danh Sách Đơn Hàng</CardTitle>
            <Button onClick={loadOrders} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Làm mới
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Chưa có đơn hàng nào</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead className="w-[100px]">Mã đơn</TableHead>
                  <TableHead>Sản phẩm</TableHead>
                  <TableHead className="w-[80px] text-center">SL</TableHead>
                  <TableHead>Khách hàng</TableHead>
                  <TableHead>Số điện thoại</TableHead>
                  <TableHead>Tổng tiền</TableHead>
                  <TableHead>Thanh toán</TableHead>
                  <TableHead>Ngày đặt</TableHead>
                  <TableHead>Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => {
                  const availableStatuses = getAvailableStatuses(order.status);
                  const isStatusLocked = order.status === 'delivered' || order.status === 'cancelled';
                  const rowClassName = order.status === 'cancelled' 
                    ? 'bg-red-50/50 opacity-75' 
                    : order.status === 'delivered' 
                    ? 'bg-green-50/50' 
                    : '';
                  const isExpanded = expandedOrderId === order.id;
                  
                  return (
                    <Fragment key={order.id}>
                      <TableRow className={rowClassName}>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => toggleOrderDetails(order.id)}
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          #{String(order.id).slice(0, 8)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex -space-x-2">
                              {order.items.slice(0, 3).map((item, idx) => (
                                <img
                                  key={idx}
                                  src={item.productImage}
                                  alt={item.productName}
                                  className="w-10 h-10 rounded-full border-2 border-background object-cover cursor-pointer hover:scale-110 transition-transform hover:z-10"
                                  onClick={(e) => handleImageClick(e, item.productImage)}
                                />
                              ))}
                            </div>
                            <div>
                              <p className="text-sm font-medium">
                                {order.items[0].productName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {order.items.length > 1 && `+${order.items.length - 1} sản phẩm khác`}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" className="font-semibold">
                          {getTotalQuantity(order)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{order.customerInfo.name}</p>
                          <p className="text-xs text-muted-foreground">{order.customerInfo.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{order.customerInfo.phone}</TableCell>
                      <TableCell className="font-semibold">
                        {formatPrice(order.total)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {order.paymentMethod === 'momo' && '💳 MoMo'}
                          {order.paymentMethod === 'zalopay' && '💳 ZaloPay'}
                          {order.paymentMethod === 'cash' && '💵 COD'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })}
                        <br />
                        <span className="text-xs">
                          {new Date(order.createdAt).toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Select
                            value={order.status}
                            onValueChange={(value) => 
                              handleStatusChange(order.id, value as Order['status'])
                            }
                            disabled={updatingOrderId === order.id || isStatusLocked}
                          >
                            <SelectTrigger className="w-[140px] border-none shadow-none hover:bg-muted/50 transition-colors">
                              <SelectValue>
                                <Badge className={`${statusColors[order.status]} text-white border-0`}>
                                  {statusLabels[order.status]}
                                </Badge>
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent className="min-w-[160px] p-1">
                              {availableStatuses.map((status) => (
                                <SelectItem 
                                  key={status} 
                                  value={status}
                                  className="cursor-pointer rounded-md my-0.5 focus:bg-transparent data-[highlighted]:bg-muted/80"
                                >
                                  <div className="flex items-center gap-2 py-1.5 px-2 rounded-md transition-all group">
                                    <div className="flex items-center gap-2 min-w-[120px]">
                                      <div className={`w-2 h-2 rounded-full ${statusColors[status]}`}></div>
                                      <span className="font-medium text-sm text-muted-foreground group-data-[highlighted]:text-foreground group-data-[highlighted]:font-semibold transition-all">
                                        {statusLabels[status]}
                                      </span>
                                    </div>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {order.status === 'delivered' && (
                            <div className="flex items-center gap-1 text-xs text-green-600">
                              <PackageCheck className="w-3 h-3" />
                              <span className="font-medium">Hoàn thành</span>
                            </div>
                          )}
                          {order.status === 'cancelled' && (
                            <div className="flex items-center gap-1 text-xs text-red-600">
                              <PackageX className="w-3 h-3" />
                              <span className="font-medium">Đã hủy bỏ</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>

                    {/* Expanded Details Row */}
                    {isExpanded && (
                      <TableRow key={`${order.id}-details`} className={rowClassName}>
                        <TableCell colSpan={10} className="bg-muted/30 p-0">
                          <div className="p-4 space-y-3">
                            <h4 className="font-semibold text-sm mb-3">Chi tiết sản phẩm:</h4>
                            <div className="grid gap-3">
                              {order.items.map((item, idx) => (
                                <div 
                                  key={idx} 
                                  className="flex items-center gap-4 bg-background p-3 rounded-lg border"
                                >
                                  <img 
                                    src={item.productImage} 
                                    alt={item.productName}
                                    className="w-16 h-16 rounded-lg object-cover cursor-pointer hover:scale-105 transition-transform"
                                    onClick={(e) => handleImageClick(e, item.productImage)}
                                  />
                                  <div className="flex-1">
                                    <p className="font-medium text-sm">{item.productName}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                      <Badge variant="outline" className="text-xs">
                                        Màu: {item.selectedColor}
                                      </Badge>
                                      <Badge variant="outline" className="text-xs">
                                        Size: {item.selectedSize}
                                      </Badge>
                                      <Badge variant="outline" className="text-xs">
                                        Số lượng: {item.quantity}
                                      </Badge>
                                      <span className="text-xs text-muted-foreground">
                                        {formatPrice(item.price)} / sản phẩm
                                      </span>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm font-semibold">
                                      {formatPrice(item.price * item.quantity)}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="flex justify-between items-center pt-3 border-t">
                              <div className="text-sm text-muted-foreground">
                                <p>Địa chỉ giao hàng: <span className="font-medium text-foreground">{order.customerInfo.address}</span></p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-muted-foreground">Tổng cộng</p>
                                <p className="text-xl font-bold text-primary">
                                  {formatPrice(order.total)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                    </Fragment>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Image Zoom Modal */}
      {zoomedImage && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setZoomedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={zoomedImage}
              alt="Product"
              className="w-full h-full object-contain rounded-lg"
            />
            <button
              onClick={() => setZoomedImage(null)}
              className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-full p-2 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
