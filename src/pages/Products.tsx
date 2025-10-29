import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductCard } from '@/components/ProductCard';
import { Pagination } from '@/components/Pagination';
import { HeroSlider } from '@/components/HeroSlider';
import * as productService from '@/services/productService';
import type { Product } from '@/services/productService';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

const ITEMS_PER_PAGE = 12;

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const categoryParam = searchParams.get('category') || 'all';
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam);
  const [currentPage, setCurrentPage] = useState(1);

  // Sync selectedCategory with URL params
  useEffect(() => {
    setSelectedCategory(categoryParam);
  }, [categoryParam]);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      setCurrentPage(1);
      try {
        // Request first page from backend
        let res;
        if (searchQuery) {
          res = await productService.searchProducts(searchQuery, 1, ITEMS_PER_PAGE);
        } else if (selectedCategory === 'all') {
          res = await productService.getProducts({ page: 1, limit: ITEMS_PER_PAGE });
        } else {
          res = await productService.getProductsByCategory(selectedCategory, 1, ITEMS_PER_PAGE);
        }

        const data = res.products;
        setProducts(data);
        setFilteredProducts(data);
        if (res.pagination) {
          setTotalPages(res.pagination.totalPages);
        } else {
          setTotalPages(Math.max(1, Math.ceil(data.length / ITEMS_PER_PAGE)));
        }
      } catch (error) {
        console.error('Error loading products:', error);
        toast.error('Không thể tải sản phẩm. Vui lòng thử lại sau.');
        setProducts([]);
        setFilteredProducts([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [selectedCategory, searchQuery]);

  const categories = ['all', 'Áo', 'Quần', 'Giày', 'Phụ kiện'];

  // Handle category change and update URL
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    if (category === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', category);
    }
    setSearchParams(searchParams);
  };

  // When backend provides pagination, products is already paginated
  const paginatedProducts = products;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Load new page from backend
    (async () => {
      setLoading(true);
      try {
        let res;
        if (searchQuery) {
          res = await productService.searchProducts(searchQuery, page, ITEMS_PER_PAGE);
        } else if (selectedCategory === 'all') {
          res = await productService.getProducts({ page, limit: ITEMS_PER_PAGE });
        } else {
          res = await productService.getProductsByCategory(selectedCategory, page, ITEMS_PER_PAGE);
        }

        const data = res.products;
        setProducts(data);
        setFilteredProducts(data);
        if (res.pagination) setTotalPages(res.pagination.totalPages);
      } catch (error) {
        console.error('Error loading page:', error);
        toast.error('Không thể tải trang. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    })();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Show slider only when not searching */}
      {!searchQuery ? (
        <HeroSlider />
      ) : (
        <section className="bg-gradient-hero text-primary-foreground py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Kết quả tìm kiếm: "{searchQuery}"
            </h1>
            <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto">
              Tìm thấy {products.length} sản phẩm
            </p>
          </div>
        </section>
      )}

      {/* Filters */}
      <div id="products-section" className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold">Sản Phẩm</h2>
            <p className="text-muted-foreground">
              Tìm thấy {products.length} sản phẩm
            </p>
          </div>

          {!searchQuery && (
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  onClick={() => handleCategoryChange(category)}
                >
                  {category === 'all' ? 'Tất cả' : category}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-square w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-muted-foreground">
              Không tìm thấy sản phẩm nào
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {paginatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination Component */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Products;
