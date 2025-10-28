import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Pencil, Trash2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import * as productService from '@/services/productService';
import type { Product } from '@/services/productService';
import { useAuthStore } from '@/store/useAuthStore';

const categories = ['Áo', 'Quần', 'Váy', 'Giày', 'Phụ kiện'];

export default function AdminProducts() {
  const { token } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    image: '',
    category: '',
    stock: '',
    rating: '5',
  });

  const loadProducts = async () => {
    setLoading(true);
    try {
      const productsData = await productService.getProducts();
      setProducts(productsData);
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Không thể tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        price: product.price.toString(),
        description: product.description,
        image: product.image,
        category: product.category,
        stock: product.stock.toString(),
        rating: product.rating.toString(),
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        price: '',
        description: '',
        image: '',
        category: '',
        stock: '',
        rating: '5',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingProduct(null);
    setFormData({
      name: '',
      price: '',
      description: '',
      image: '',
      category: '',
      stock: '',
      rating: '5',
    });
  };

  const handleSaveProduct = async () => {
    // Validation
    if (!formData.name || !formData.price || !formData.category || !formData.image) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    const price = parseFloat(formData.price);
    const stock = parseInt(formData.stock) || 0;
    const rating = parseFloat(formData.rating) || 5;

    if (price <= 0) {
      toast.error('Giá sản phẩm phải lớn hơn 0');
      return;
    }

    try {
      if (editingProduct) {
        // Update existing product via API
        if (!token) {
          toast.error('Vui lòng đăng nhập lại');
          return;
        }
        await productService.updateProduct(editingProduct.id, {
          name: formData.name,
          price,
          description: formData.description,
          image: formData.image,
          category: formData.category,
          stock,
          rating,
        }, token);
        toast.success('Cập nhật sản phẩm thành công');
      } else {
        // Add new product via API
        if (!token) {
          toast.error('Vui lòng đăng nhập lại');
          return;
        }
        await productService.createProduct({
          name: formData.name,
          price,
          originalPrice: price * 1.3, // Set original price 30% higher
          description: formData.description,
          image: formData.image,
          category: formData.category,
          stock,
          rating,
          reviews: 0,
          colors: ['Đen', 'Trắng'],
          sizes: ['S', 'M', 'L', 'XL'],
        }, token);
        toast.success('Thêm sản phẩm thành công');
      }

      await loadProducts(); // Reload products
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Không thể lưu sản phẩm');
    }
  };

  const handleDeleteProduct = async () => {
    if (!deletingProduct || !token) return;

    try {
      await productService.deleteProduct(deletingProduct.id, token);
      await loadProducts(); // Reload products
      setDeleteDialogOpen(false);
      setDeletingProduct(null);
      toast.success('Xóa sản phẩm thành công');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Không thể xóa sản phẩm');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const getStats = () => {
    return {
      total: products.length,
      inStock: products.filter((p) => p.stock > 0).length,
      outOfStock: products.filter((p) => p.stock === 0).length,
      totalValue: products.reduce((sum, p) => sum + p.price * p.stock, 0),
    };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
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
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tổng sản phẩm
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Còn hàng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.inStock}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Hết hàng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.outOfStock}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Giá trị kho
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(stats.totalValue)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Danh Sách Sản Phẩm</CardTitle>
            <div className="flex gap-2">
              <Button onClick={loadProducts} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Làm mới
              </Button>
              <Button onClick={() => handleOpenDialog()} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Thêm sản phẩm
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">Chưa có sản phẩm nào</p>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="w-4 h-4 mr-2" />
                Thêm sản phẩm đầu tiên
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Ảnh</TableHead>
                  <TableHead>Tên sản phẩm</TableHead>
                  <TableHead>Danh mục</TableHead>
                  <TableHead>Giá</TableHead>
                  <TableHead className="text-center">Tồn kho</TableHead>
                  <TableHead className="text-center">Đánh giá</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {product.description}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{product.category}</Badge>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {formatPrice(product.price)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={product.stock > 0 ? 'default' : 'destructive'}
                        className={product.stock > 0 ? 'bg-green-500' : ''}
                      >
                        {product.stock}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-yellow-500">★</span> {product.rating.toFixed(1)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDialog(product)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setDeletingProduct(product);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
            </DialogTitle>
            <DialogDescription>
              Điền thông tin sản phẩm vào form bên dưới
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">
                Tên sản phẩm <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nhập tên sản phẩm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price">
                  Giá <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="category">
                  Danh mục <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="stock">Tồn kho</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  placeholder="0"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="rating">Đánh giá</Label>
                <Input
                  id="rating"
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                  placeholder="5.0"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="image">
                URL Ảnh <span className="text-red-500">*</span>
              </Label>
              <Input
                id="image"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
              {formData.image && (
                <img
                  src={formData.image}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-lg mt-2"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Nhập mô tả sản phẩm"
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Hủy
            </Button>
            <Button onClick={handleSaveProduct}>
              {editingProduct ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa sản phẩm "{deletingProduct?.name}"? Hành động này không
              thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setDeletingProduct(null);
              }}
            >
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDeleteProduct}>
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
