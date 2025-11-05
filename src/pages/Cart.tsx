import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';

const Cart = () => {
  const navigate = useNavigate();
  const { items, removeFromCart, updateQuantity, getTotalPrice } = useCartStore();
  const { token } = useAuthStore();
  const totalPrice = getTotalPrice();

  // Cart is already loaded by useInitializeData hook in App.tsx
  // No need to load again here

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center py-20">
          <ShoppingBag className="w-24 h-24 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Giỏ hàng trống</h2>
          <p className="text-muted-foreground mb-6">
            Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm
          </p>
          <Link to="/">
            <Button size="lg">Tiếp tục mua sắm</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Giỏ hàng của bạn</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={`${item.productId}-${item.selectedColor}-${item.selectedSize}`}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    
                    <div className="flex-1">
                      <Link
                        to={`/product/${item.productId}`}
                        className="font-semibold text-lg hover:text-primary transition-colors"
                      >
                        {item.name}
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        {item.selectedColor} - {item.selectedSize}
                      </p>
                      <p className="text-primary font-bold mt-2">
                        {item.price.toLocaleString('vi-VN')}đ
                      </p>
                    </div>

                    <div className="flex flex-col justify-between items-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={async () => {
                          try {
                            await removeFromCart(
                              item.productId,
                              item.selectedColor,
                              item.selectedSize,
                              token || undefined
                            );
                          } catch (error: any) {
                            if (error?.message?.includes('hết hạn') || error?.message?.includes('expired')) {
                              toast.error('Phiên đăng nhập đã hết hạn');
                            } else {
                              toast.error('Không thể xóa sản phẩm');
                            }
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={async () => {
                            try {
                              await updateQuantity(
                                item.productId,
                                item.selectedColor,
                                item.selectedSize,
                                item.quantity - 1,
                                token || undefined
                              );
                            } catch (error: any) {
                              const errorMsg = error?.message || '';
                              if (errorMsg.includes('hết hạn') || errorMsg.includes('expired')) {
                                toast.error('Phiên đăng nhập đã hết hạn');
                              } else if (errorMsg.includes('không đủ') || errorMsg.includes('Insufficient stock')) {
                                toast.error('Sản phẩm trong kho không đủ số lượng bạn yêu cầu');
                              } else {
                                toast.error('Không thể cập nhật số lượng');
                              }
                            }
                          }}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center font-semibold">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={async () => {
                            try {
                              await updateQuantity(
                                item.productId,
                                item.selectedColor,
                                item.selectedSize,
                                item.quantity + 1,
                                token || undefined
                              );
                            } catch (error: any) {
                              const errorMsg = error?.message || '';
                              if (errorMsg.includes('hết hạn') || errorMsg.includes('expired')) {
                                toast.error('Phiên đăng nhập đã hết hạn');
                              } else if (errorMsg.includes('không đủ') || errorMsg.includes('Insufficient stock')) {
                                toast.error('Sản phẩm trong kho không đủ số lượng bạn yêu cầu');
                              } else {
                                toast.error('Không thể cập nhật số lượng');
                              }
                            }
                          }}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardContent className="p-6 space-y-4">
                <h2 className="text-xl font-bold">Tóm tắt đơn hàng</h2>
                
                <div className="space-y-2">
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
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between text-lg">
                      <span className="font-bold">Tổng cộng:</span>
                      <span className="font-bold text-primary">
                        {totalPrice.toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  size="lg"
                  className="w-full"
                  onClick={() => navigate('/checkout')}
                >
                  Tiến hành thanh toán
                </Button>

                <Link to="/">
                  <Button variant="outline" className="w-full">
                    Tiếp tục mua sắm
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
