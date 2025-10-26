import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Database, RefreshCw, Trash2, Download, Upload } from 'lucide-react';
import { initializeMockData, generateMockOrders } from '@/utils/mockData';
import { api } from '@/services/api';

export default function DataManager() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleResetProducts = async () => {
    setLoading(true);
    try {
      localStorage.removeItem('products');
      await api.initializeProducts();
      toast({
        title: 'Đã reset sản phẩm',
        description: 'Dữ liệu sản phẩm đã được khôi phục từ file JSON',
      });
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể reset sản phẩm',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateMockOrders = async () => {
    setLoading(true);
    try {
      localStorage.removeItem('orders');
      await generateMockOrders();
      toast({
        title: 'Đã tạo đơn hàng mẫu',
        description: '20 đơn hàng mẫu đã được tạo thành công',
      });
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể tạo đơn hàng mẫu',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetAll = async () => {
    setLoading(true);
    try {
      localStorage.clear();
      await initializeMockData();
      toast({
        title: 'Đã reset toàn bộ dữ liệu',
        description: 'Tất cả dữ liệu đã được khôi phục về mặc định',
      });
      // Reload page after 1 second
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể reset dữ liệu',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = () => {
    try {
      const data = {
        products: JSON.parse(localStorage.getItem('products') || '[]'),
        orders: JSON.parse(localStorage.getItem('orders') || '[]'),
        settings: JSON.parse(localStorage.getItem('storeSettings') || '{}'),
      };

      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `backup-${new Date().toISOString().split('T')[0]}.json`;
      link.click();

      toast({
        title: 'Đã xuất dữ liệu',
        description: 'File backup đã được tải xuống',
      });
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể xuất dữ liệu',
        variant: 'destructive',
      });
    }
  };

  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const data = JSON.parse(text);

        if (data.products) localStorage.setItem('products', JSON.stringify(data.products));
        if (data.orders) localStorage.setItem('orders', JSON.stringify(data.orders));
        if (data.settings) localStorage.setItem('storeSettings', JSON.stringify(data.settings));

        toast({
          title: 'Đã nhập dữ liệu',
          description: 'Dữ liệu đã được khôi phục từ backup',
        });

        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } catch (error) {
        toast({
          title: 'Lỗi',
          description: 'File backup không hợp lệ',
          variant: 'destructive',
        });
      }
    };
    input.click();
  };

  const getDataStats = () => {
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    return {
      products: products.length,
      orders: orders.length,
      dataSize: new Blob([JSON.stringify({ products, orders })]).size,
    };
  };

  const stats = getDataStats();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          Quản Lý Dữ Liệu
        </CardTitle>
        <CardDescription>
          Reset, sao lưu và khôi phục dữ liệu hệ thống
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold">{stats.products}</div>
            <div className="text-sm text-muted-foreground">Sản phẩm</div>
          </div>
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold">{stats.orders}</div>
            <div className="text-sm text-muted-foreground">Đơn hàng</div>
          </div>
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold">
              {(stats.dataSize / 1024).toFixed(1)} KB
            </div>
            <div className="text-sm text-muted-foreground">Dung lượng</div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Reset sản phẩm</h4>
              <p className="text-sm text-muted-foreground">
                Khôi phục dữ liệu sản phẩm từ file JSON gốc
              </p>
            </div>
            <Button
              onClick={handleResetProducts}
              disabled={loading}
              variant="outline"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Tạo đơn hàng mẫu</h4>
              <p className="text-sm text-muted-foreground">
                Tạo 20 đơn hàng mẫu với dữ liệu ngẫu nhiên
              </p>
            </div>
            <Button
              onClick={handleGenerateMockOrders}
              disabled={loading}
              variant="outline"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Tạo mới
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Xuất dữ liệu</h4>
              <p className="text-sm text-muted-foreground">
                Tải xuống file backup toàn bộ dữ liệu
              </p>
            </div>
            <Button
              onClick={handleExportData}
              disabled={loading}
              variant="outline"
            >
              <Download className="w-4 h-4 mr-2" />
              Xuất
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Nhập dữ liệu</h4>
              <p className="text-sm text-muted-foreground">
                Khôi phục dữ liệu từ file backup
              </p>
            </div>
            <Button
              onClick={handleImportData}
              disabled={loading}
              variant="outline"
            >
              <Upload className="w-4 h-4 mr-2" />
              Nhập
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg bg-red-50 border-red-200">
            <div>
              <h4 className="font-medium text-red-700">Reset toàn bộ</h4>
              <p className="text-sm text-red-600">
                Xóa tất cả và khôi phục về dữ liệu mặc định
              </p>
            </div>
            <Button
              onClick={handleResetAll}
              disabled={loading}
              variant="destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Reset tất cả
            </Button>
          </div>
        </div>

        {/* Info Badge */}
        <div className="flex items-center gap-2 justify-center">
          <Badge variant="outline">
            <Database className="w-3 h-3 mr-1" />
            Dữ liệu được lưu trong LocalStorage
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
