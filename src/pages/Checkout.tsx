import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useCartStore } from '@/store/useCartStore';
import { useOrderStore } from '@/store/useOrderStore';
import { useAuthStore } from '@/store/useAuthStore';
import * as orderService from '@/services/orderService';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const Checkout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const addOrder = useOrderStore((state) => state.addOrder);
  const { token, isAuthenticated } = useAuthStore();
  const totalPrice = getTotalPrice();

  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer'>('transfer');
  const [showQR, setShowQR] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomerInfo({
      ...customerInfo,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerInfo.name || !customerInfo.phone || !customerInfo.address) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng điền đầy đủ thông tin',
        variant: 'destructive',
      });
      return;
    }

    if (!isAuthenticated || !token) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng đăng nhập để đặt hàng',
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }

    setLoading(true);

    try {
      // Convert cart items to order items
      const orderItems = items.map(item => ({
        productId: item.productId,
        productName: item.name,
        productImage: item.image,
        price: item.price,
        quantity: item.quantity,
        selectedColor: item.selectedColor,
        selectedSize: item.selectedSize,
      }));

      const order = await orderService.createOrder({
        items: orderItems,
        total: totalPrice,
        paymentMethod,
        customerInfo,
      }, token);

      // Add order to store
      addOrder(order);

      setShowQR(true);

      // Simulate payment confirmation after 3 seconds
      setTimeout(async () => {
        try {
          await orderService.updateOrderStatus(order.id, 'processing', token);
          // Clear cart from backend and local store
          await clearCart(token);
          toast({
            title: 'Đặt hàng thành công!',
            description: `Mã đơn hàng: ${order.id}`,
          });
          navigate(`/order/${order.id}`);
        } catch (err) {
          console.error('Error updating order status:', err);
          // Still clear cart and navigate to order page even if status update fails
          await clearCart(token);
          navigate(`/order/${order.id}`);
        }
      }, 3000);
    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: 'Lỗi',
        description: 'Có lỗi xảy ra khi đặt hàng',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  // Auto-fill customer info on mount
  useEffect(() => {
    setCustomerInfo({
      name: 'Nguyễn Văn A',
      phone: '0123456789',
      email: 'abc@222.com',
      address: '123 Đường ABC, Phường XYZ, Quận 1, TP.HCM',
    });
  }, []);

  // Redirect to cart if no items
  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
    }
  }, [items.length, navigate]);

  // Early return after all hooks
  if (items.length === 0) {
    return null;
  }

  // Generate QR code content for bank transfer
  const qrContent = `https://img.vietqr.io/image/MB-0866188889-compact2.jpg?amount=${totalPrice}&addInfo=Thanh toan don hang ShopVN`;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Thanh toán</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin giao hàng</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Họ và tên *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={customerInfo.name}
                        onChange={handleInputChange}
                        placeholder="Nguyễn Văn A"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Số điện thoại *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={customerInfo.phone}
                        onChange={handleInputChange}
                        placeholder="0123456789"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={customerInfo.email}
                      onChange={handleInputChange}
                      placeholder="email@example.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="address">Địa chỉ giao hàng *</Label>
                    <Input
                      id="address"
                      name="address"
                      value={customerInfo.address}
                      onChange={handleInputChange}
                      placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                      required
                    />
                  </div>

                  <div className="pt-4">
                    <Label className="text-base font-semibold mb-4 block">
                      Phương thức thanh toán
                    </Label>
                    <RadioGroup
                      value={paymentMethod}
                      onValueChange={(value: 'cash' | 'transfer') =>
                        setPaymentMethod(value)
                      }
                    >
                      <div className="flex items-center space-x-2 p-4 border rounded-lg">
                        <RadioGroupItem value="transfer" id="transfer" />
                        <Label htmlFor="transfer" className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">Chuyển khoản</span>
                            <span className="text-sm text-muted-foreground">
                              Chuyển khoản ngân hàng
                            </span>
                          </div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 p-4 border rounded-lg">
                        <RadioGroupItem value="cash" id="cash" />
                        <Label htmlFor="cash" className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">Tiền mặt</span>
                            <span className="text-sm text-muted-foreground">
                              Thanh toán khi nhận hàng (COD)
                            </span>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {showQR && paymentMethod !== 'cash' ? (
                    <div className="p-6 bg-muted rounded-lg text-center">
                      <h3 className="font-semibold mb-4">
                        Quét mã QR để chuyển khoản
                      </h3>
                      <div className="flex justify-center mb-4">
                        <div className="bg-white p-4 rounded-lg">
                          <QRCodeSVG value={qrContent} size={200} />
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Quét mã QR bằng ứng dụng ngân hàng để chuyển khoản
                      </p>
                      <div className="flex items-center justify-center gap-2 text-primary">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Đang chờ thanh toán...</span>
                      </div>
                    </div>
                  ) : showQR && paymentMethod === 'cash' ? (
                    <div className="p-6 bg-muted rounded-lg text-center">
                      <h3 className="font-semibold mb-4">
                        Thanh toán khi nhận hàng
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Bạn sẽ thanh toán bằng tiền mặt khi nhận hàng
                      </p>
                      <p className="text-lg font-bold text-primary">
                        Tổng tiền: {totalPrice.toLocaleString('vi-VN')}đ
                      </p>
                    </div>
                  ) : (
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Đang xử lý...
                        </>
                      ) : (
                        'Đặt hàng'
                      )}
                    </Button>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Đơn hàng ({items.length} sản phẩm)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item) => (
                  <div
                    key={`${item.productId}-${item.selectedColor}-${item.selectedSize}`}
                    className="flex gap-3"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1 text-sm">
                      <p className="font-semibold line-clamp-1">
                        {item.name}
                      </p>
                      <p className="text-muted-foreground">
                        {item.selectedColor} - {item.selectedSize}
                      </p>
                      <p className="text-primary font-semibold">
                        {item.price.toLocaleString('vi-VN')}đ x {item.quantity}
                      </p>
                    </div>
                  </div>
                ))}

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tạm tính:</span>
                    <span className="font-semibold">
                      {totalPrice.toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phí vận chuyển:</span>
                    <span className="font-semibold text-success">Miễn phí</span>
                  </div>
                  <div className="flex justify-between text-lg pt-2 border-t">
                    <span className="font-bold">Tổng cộng:</span>
                    <span className="font-bold text-primary">
                      {totalPrice.toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
