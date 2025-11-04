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
import * as categoryService from '@/services/categoryService';
import type { Category, SubCategory } from '@/services/categoryService';
import { useAuthStore } from '@/store/useAuthStore';
import { Pagination } from '@/components/Pagination';

export default function AdminProducts() {
  const { token } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredSubCategories, setFilteredSubCategories] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 6;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    image: '',
    categoryId: '',
    subCategoryId: '',
    stock: '',
    colors: '',
    sizes: '',
  });

  const loadCategories = async () => {
    try {
      const cats = await categoryService.getCategories();
      setCategories(cats.filter(c => c.isActive));
    } catch (error) {
      console.error('Error loading categories:', error);
      toast.error('Không thể tải danh mục');
    }
  };

  const loadSubCategories = async (categoryId: number) => {
    try {
      const subs = await categoryService.getSubCategories(categoryId);
      setFilteredSubCategories(subs.filter(s => s.isActive));
    } catch (error) {
      console.error('Error loading subcategories:', error);
      toast.error('Không thể tải danh mục con');
      setFilteredSubCategories([]);
    }
  };

  const loadProducts = async (page: number = currentPage) => {
    setLoading(true);
    try {
      const res = await productService.getProducts({ page, limit: itemsPerPage });
      console.log('Products loaded:', res.products);
      console.log('First product category:', res.products[0]?.category);
      setProducts(res.products);
      setTotalPages(res.pagination?.totalPages || 1);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Không thể tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
    loadProducts(1);
  }, []);

  useEffect(() => {
    // Load subcategories when category changes
    if (formData.categoryId) {
      const categoryId = parseInt(formData.categoryId);
      if (!isNaN(categoryId)) {
        loadSubCategories(categoryId);
      }
    } else {
      // Clear subcategories when no category is selected
      setFilteredSubCategories([]);
    }
  }, [formData.categoryId]);

  const handlePageChange = (page: number) => {
    loadProducts(page);
  };

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      
      // Set form data - useEffect will automatically load subcategories based on categoryId
      setFormData({
        name: product.name,
        price: product.price.toString(),
        description: product.description,
        image: product.image,
        categoryId: '', // Will be set after we determine it
        subCategoryId: product.subCategoryId?.toString() || '',
        stock: product.stock.toString(),
        colors: product.colors?.join(', ') || '',
        sizes: product.sizes?.join(', ') || '',
      });
      
      // If product has subCategoryId, find its category from the full subcategories list
      if (product.subCategoryId && product.subCategoryName) {
        // We'll need to load all subcategories first to find the categoryId
        categoryService.getSubCategories().then(allSubs => {
          const subCat = allSubs.find(s => s.id === product.subCategoryId);
          if (subCat && subCat.categoryId) {
            // Update categoryId - this will trigger useEffect to load subcategories
            setFormData(prev => ({
              ...prev,
              categoryId: subCat.categoryId.toString(),
            }));
          }
        }).catch(error => {
          console.error('Error finding product category:', error);
        });
      }
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        price: '',
        description: '',
        image: '',
        categoryId: '',
        subCategoryId: '',
        stock: '',
        colors: '',
        sizes: '',
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
      categoryId: '',
      subCategoryId: '',
      stock: '',
      colors: '',
      sizes: '',
    });
  };

  const handleSaveProduct = async () => {
    // Validation
    if (!formData.name || !formData.price || !formData.subCategoryId || !formData.image) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    const price = parseFloat(formData.price);
    const stock = parseInt(formData.stock) || 0;
    const subCategoryId = parseInt(formData.subCategoryId);
    
    // Parse colors and sizes from comma-separated strings
    const colors = formData.colors
      ? formData.colors.split(',').map(c => c.trim()).filter(c => c.length > 0)
      : [];
    const sizes = formData.sizes
      ? formData.sizes.split(',').map(s => s.trim()).filter(s => s.length > 0)
      : [];

    if (price <= 0) {
      toast.error('Giá sản phẩm phải lớn hơn 0');
      return;
    }

    if (isNaN(subCategoryId)) {
      toast.error('Vui lòng chọn danh mục con');
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
          originalPrice: price * 1.3,
          description: formData.description,
          image: formData.image,
          subCategoryId: subCategoryId,
          stock,
          colors,
          sizes,
        }, token);
        toast.success('Cập nhật sản phẩm thành công');
      } else {
        // Add new product via API
        if (!token) {
          toast.error('Vui lòng đăng nhập lại');
          return;
        }
        
        // Find the selected category name for the category property
        const selectedCategory = categories.find(cat => cat.id.toString() === formData.categoryId);
        const categoryName = selectedCategory ? selectedCategory.name : '';

        const newProduct = {
          name: formData.name,
          price,
          originalPrice: price * 1.3,
          description: formData.description,
          image: formData.image,
          category: categoryName,
          subCategoryId: subCategoryId,
          stock,
          reviews: 0,
          colors: colors.length > 0 ? colors : ['Đen', 'Trắng'],
          sizes: sizes.length > 0 ? sizes : ['S', 'M', 'L', 'XL'],
        };
        
        console.log('Creating product with data:', newProduct);
        await productService.createProduct(newProduct, token);
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
      {/* Products Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Danh Sách Sản Phẩm</CardTitle>
            <div className="flex gap-2">
              <Button onClick={() => loadProducts()} variant="outline" size="sm">
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
                      <span className="text-yellow-500">★</span> {(product.rating || 0).toFixed(1)}
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

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
                <Label htmlFor="stock">Tồn kho</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="categoryId">
                  Danh mục <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => setFormData({ ...formData, categoryId: value, subCategoryId: '' })}
                >
                  <SelectTrigger id="categoryId">
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="subCategoryId">
                  Danh mục con <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.subCategoryId}
                  onValueChange={(value) => setFormData({ ...formData, subCategoryId: value })}
                  disabled={!formData.categoryId}
                >
                  <SelectTrigger id="subCategoryId">
                    <SelectValue placeholder="Chọn danh mục con" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredSubCategories.map((subCat) => (
                      <SelectItem key={subCat.id} value={subCat.id.toString()}>
                        {subCat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="colors">Màu sắc</Label>
                <Input
                  id="colors"
                  value={formData.colors}
                  onChange={(e) => setFormData({ ...formData, colors: e.target.value })}
                  placeholder="Đen, Trắng, Xanh"
                />
                <p className="text-xs text-muted-foreground">Phân tách bằng dấu phẩy</p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="sizes">Kích thước</Label>
                <Input
                  id="sizes"
                  value={formData.sizes}
                  onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
                  placeholder="S, M, L, XL"
                />
                <p className="text-xs text-muted-foreground">Phân tách bằng dấu phẩy</p>
              </div>
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
