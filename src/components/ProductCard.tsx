import { Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Check } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Product } from '@/services/productService';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const navigate = useNavigate();
  const addToCart = useCartStore((state) => state.addToCart);
  const { isAuthenticated, token } = useAuthStore();
  const [isAdding, setIsAdding] = useState(false);
  
  const discountPercent = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100
  );

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Check if user is authenticated
    if (!isAuthenticated || !token) {
      toast.error('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng');
      navigate('/auth');
      return;
    }

    // Set loading state
    setIsAdding(true);

    // Get default color and size
    const defaultColor = product.colors?.[0] || 'Mặc định';
    const defaultSize = product.sizes?.[0] || 'Mặc định';

    try {
      // Add to cart with backend integration
      await addToCart(product, 1, defaultColor, defaultSize, token);

      toast.success(`Đã thêm "${product.name}" vào giỏ hàng`, {
        description: `${defaultColor} - ${defaultSize}`,
        action: {
          label: 'Xem giỏ hàng',
          onClick: () => navigate('/cart'),
        },
      });
    } catch (error: any) {
      // Handle token expired error
      if (error?.message?.includes('hết hạn') || error?.message?.includes('expired')) {
        toast.error('Phiên đăng nhập đã hết hạn', {
          description: 'Vui lòng đăng nhập lại',
        });
        // Redirect will be handled by apiClient
      } else {
        toast.error('Không thể thêm vào giỏ hàng', {
          description: error?.message || 'Vui lòng thử lại',
        });
      }
      console.error('Add to cart error:', error);
    } finally {
      // Reset loading state after animation
      setTimeout(() => {
        setIsAdding(false);
      }, 1000);
    }
  };

  return (
    <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300">
      <Link to={`/product/${product.id}`}>
        <div className="relative overflow-hidden aspect-square">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
          {discountPercent > 0 && (
            <Badge className="absolute top-3 right-3 bg-destructive">
              -{discountPercent}%
            </Badge>
          )}
          {product.stock < 10 && product.stock > 0 && (
            <Badge className="absolute top-3 left-3 bg-warning">
              Còn {product.stock}
            </Badge>
          )}
        </div>
      </Link>

      <CardContent className="pt-4">
        <Link to={`/product/${product.id}`}>
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        
        <div className="flex items-center gap-1 mb-2">
          <Star className="w-4 h-4 fill-warning text-warning" />
          <span className="text-sm font-medium">{product.rating}</span>
          <span className="text-sm text-muted-foreground">({product.reviews})</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-primary">
            {product.price.toLocaleString('vi-VN')}đ
          </span>
          {discountPercent > 0 && (
            <span className="text-sm text-muted-foreground line-through">
              {product.originalPrice.toLocaleString('vi-VN')}đ
            </span>
          )}
        </div>
      </CardContent>

      <CardFooter className="gap-2">
        <Button 
          onClick={handleAddToCart}
          className="flex-1 gap-2 relative overflow-hidden transition-all active:scale-95"
          disabled={isAdding}
        >
          {isAdding ? (
            <>
              <Check className="w-4 h-4 animate-in zoom-in duration-300" />
              Đã thêm
            </>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4 transition-transform group-hover:scale-110" />
              Thêm vào giỏ
            </>
          )}
          {isAdding && (
            <span className="absolute inset-0 bg-white/20 animate-pulse" />
          )}
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate(`/product/${product.id}`)}
          className="flex-1 transition-all hover:scale-105 active:scale-95"
        >
          Chi tiết
        </Button>
      </CardFooter>
    </Card>
  );
};
