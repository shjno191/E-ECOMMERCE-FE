import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Package, Shield, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api, type Product } from '@/services/api';
import { useCartStore } from '@/store/useCartStore';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const addToCart = useCartStore((state) => state.addToCart);
  const imageRef = useRef<HTMLImageElement>(null);
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const data = await api.getProductById(id);
        if (data) {
          setProduct(data);
          setSelectedColor(data.colors[0]);
          setSelectedSize(data.sizes[0]);
        }
      } catch (error) {
        console.error('Error loading product:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product || !imageRef.current) return;

    setIsAnimating(true);

    // Get positions
    const imageRect = imageRef.current.getBoundingClientRect();
    const cartIcon = document.querySelector('[data-cart-icon]');
    
    if (cartIcon) {
      const cartRect = cartIcon.getBoundingClientRect();
      
      // Create flying image
      const flyingImg = document.createElement('img');
      flyingImg.src = product.image;
      flyingImg.style.cssText = `
        position: fixed;
        top: ${imageRect.top}px;
        left: ${imageRect.left}px;
        width: ${imageRect.width}px;
        height: ${imageRect.height}px;
        z-index: 9999;
        pointer-events: none;
        transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        border-radius: 8px;
        object-fit: cover;
      `;
      
      document.body.appendChild(flyingImg);
      
      // Trigger animation
      requestAnimationFrame(() => {
        flyingImg.style.top = `${cartRect.top}px`;
        flyingImg.style.left = `${cartRect.left}px`;
        flyingImg.style.width = '40px';
        flyingImg.style.height = '40px';
        flyingImg.style.opacity = '0';
      });
      
      // Clean up and add to cart
      setTimeout(() => {
        document.body.removeChild(flyingImg);
        setIsAnimating(false);
        
        addToCart(product, quantity, selectedColor, selectedSize);
        toast({
          title: 'Đã thêm vào giỏ hàng',
          description: `${product.name} - ${selectedColor} - ${selectedSize}`,
          duration: 500,
        });
      }, 800);
    } else {
      // Fallback if cart icon not found
      addToCart(product, quantity, selectedColor, selectedSize);
      setIsAnimating(false);
      toast({
        title: 'Đã thêm vào giỏ hàng',
        description: `${product.name} - ${selectedColor} - ${selectedSize}`,
        duration: 500,
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          <Skeleton className="aspect-square w-full" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Không tìm thấy sản phẩm</h1>
        <Button onClick={() => navigate('/')}>Về trang chủ</Button>
      </div>
    );
  }

  const discountPercent = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Button>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Image */}
          <div className="relative">
            <div className="aspect-square overflow-hidden rounded-lg shadow-xl">
              <img
                ref={imageRef}
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {discountPercent > 0 && (
              <Badge className="absolute top-4 right-4 bg-destructive text-lg px-3 py-1">
                -{discountPercent}%
              </Badge>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <Badge variant="outline" className="mb-2">
                {product.category}
              </Badge>
              <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
              
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 fill-warning text-warning" />
                  <span className="font-semibold">{product.rating}</span>
                </div>
                <span className="text-muted-foreground">
                  ({product.reviews} đánh giá)
                </span>
              </div>

              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-4xl font-bold text-primary">
                  {product.price.toLocaleString('vi-VN')}đ
                </span>
                {discountPercent > 0 && (
                  <span className="text-xl text-muted-foreground line-through">
                    {product.originalPrice.toLocaleString('vi-VN')}đ
                  </span>
                )}
              </div>

              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Color Selection */}
            <div>
              <label className="block font-semibold mb-2">Màu sắc:</label>
              <div className="flex gap-2 flex-wrap">
                {product.colors.map((color) => (
                  <Button
                    key={color}
                    variant={selectedColor === color ? 'default' : 'outline'}
                    onClick={() => setSelectedColor(color)}
                  >
                    {color}
                  </Button>
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div>
              <label className="block font-semibold mb-2">Kích thước:</label>
              <div className="flex gap-2 flex-wrap">
                {product.sizes.map((size) => (
                  <Button
                    key={size}
                    variant={selectedSize === size ? 'default' : 'outline'}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="block font-semibold mb-2">Số lượng:</label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  -
                </Button>
                <span className="w-12 text-center font-semibold">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                >
                  +
                </Button>
                <span className="text-sm text-muted-foreground ml-2">
                  Còn {product.stock} sản phẩm
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button
                size="lg"
                className="w-full gap-2"
                onClick={handleAddToCart}
                disabled={product.stock === 0 || isAnimating}
              >
                <ShoppingCart className="w-5 h-5" />
                {product.stock === 0 ? 'Hết hàng' : isAnimating ? 'Đang thêm...' : 'Thêm vào giỏ hàng'}
              </Button>
              
              <Button
                size="lg"
                variant="outline"
                className="w-full"
                onClick={() => {
                  handleAddToCart();
                  navigate('/cart');
                }}
                disabled={product.stock === 0}
              >
                Mua ngay
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4 pt-6 border-t">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                <span className="text-sm">Giao hàng nhanh</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                <span className="text-sm">Bảo hành chính hãng</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
