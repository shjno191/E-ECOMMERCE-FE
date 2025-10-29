import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Database, Trash2, Download, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function DataManager() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const handleClearLocalStorage = async () => {
    setLoading(true);
    try {
      localStorage.clear();
      toast({
        title: 'Đã xóa localStorage',
        description: 'Tất cả dữ liệu local đã được xóa. Vui lòng đăng nhập lại.',
      });
      setTimeout(() => {
        window.location.href = '/auth';
      }, 1000);
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa dữ liệu local',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = () => {
    try {
      const data = {
        authToken: localStorage.getItem('authToken') || null,
        cartItems: JSON.parse(localStorage.getItem('cart-storage') || '{"state":{"items":[]}}'),
        timestamp: new Date().toISOString(),
      };

      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `local-backup-${new Date().toISOString().split('T')[0]}.json`;
      link.click();

      toast({
        title: 'Đã xuất dữ liệu local',
        description: 'Dữ liệu local (token, giỏ hàng) đã được tải xuống',
      });
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể xuất dữ liệu',
        variant: 'destructive',
      });
    }
  };

  const getDataStats = () => {
    const cartStorage = localStorage.getItem('cart-storage') || '{"state":{"items":[]}}';
    const cart = JSON.parse(cartStorage);
    return {
      cartItems: cart.state?.items?.length || 0,
      authToken: localStorage.getItem('authToken') ? 'Có' : 'Không',
      dataSize: new Blob([cartStorage]).size,
    };
  };

  const stats = getDataStats();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          Quản Lý Dữ Liệu Local
        </CardTitle>
        <CardDescription>
          Quản lý dữ liệu được lưu trữ trong localStorage (giỏ hàng, auth token)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Hệ thống đã migrate sang Backend API</AlertTitle>
          <AlertDescription>
            Dữ liệu sản phẩm và đơn hàng giờ được quản lý trên server backend.
            Component này chỉ quản lý dữ liệu local (auth token, giỏ hàng).
          </AlertDescription>
        </Alert>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold">{stats.cartItems}</div>
            <div className="text-sm text-muted-foreground">Giỏ hàng</div>
          </div>
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-sm font-bold">{stats.authToken}</div>
            <div className="text-sm text-muted-foreground">Auth Token</div>
          </div>
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold">{(stats.dataSize / 1024).toFixed(1)} KB</div>
            <div className="text-sm text-muted-foreground">Dung lượng</div>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Xuất dữ liệu local</h4>
              <p className="text-sm text-muted-foreground">Tải xuống backup của auth token và giỏ hàng</p>
            </div>
            <Button onClick={handleExportData} disabled={loading} variant="outline">
              <Download className="w-4 h-4 mr-2" />Xuất
            </Button>
          </div>
          <div className="flex items-center justify-between p-4 border rounded-lg bg-red-50 border-red-200">
            <div>
              <h4 className="font-medium text-red-700">Xóa localStorage</h4>
              <p className="text-sm text-red-600">Xóa tất cả dữ liệu local và đăng xuất</p>
            </div>
            <Button onClick={handleClearLocalStorage} disabled={loading} variant="destructive">
              <Trash2 className="w-4 h-4 mr-2" />Xóa tất cả
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2 justify-center">
          <Badge variant="outline">
            <Database className="w-3 h-3 mr-1" />Dữ liệu sản phẩm & đơn hàng trên Backend Server
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
