import { Link } from 'react-router-dom';
import { Star, ShoppingCart } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Product } from '@/services/productService';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const discountPercent = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100
  );

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

      <CardFooter>
        <Link to={`/product/${product.id}`} className="w-full">
          <Button className="w-full gap-2">
            <ShoppingCart className="w-4 h-4" />
            Thêm vào giỏ
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};
