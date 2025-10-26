import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Store,
  CreditCard,
  Truck,
  Mail,
  Receipt,
  Bell,
  Save,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import DataManager from '@/components/admin/DataManager';

interface StoreSettings {
  // Store Info
  storeName: string;
  storeDescription: string;
  contactEmail: string;
  contactPhone: string;
  storeAddress: string;

  // Payment Settings
  enableCOD: boolean;
  enableBankTransfer: boolean;
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;

  // Shipping Settings
  freeShippingThreshold: number;
  standardShippingFee: number;
  expressShippingFee: number;

  // Tax Settings
  enableTax: boolean;
  taxRate: number;

  // Email Settings
  enableOrderEmails: boolean;
  enablePromotionalEmails: boolean;
  emailSignature: string;

  // Notification Settings
  enableLowStockAlert: boolean;
  lowStockThreshold: number;
  enableNewOrderAlert: boolean;
}

const defaultSettings: StoreSettings = {
  storeName: 'E-Commerce Store',
  storeDescription: 'Cửa hàng thương mại điện tử',
  contactEmail: 'contact@store.com',
  contactPhone: '0123456789',
  storeAddress: 'Địa chỉ cửa hàng',
  enableCOD: true,
  enableBankTransfer: true,
  bankName: 'Ngân hàng A',
  bankAccountNumber: '1234567890',
  bankAccountName: 'NGUYEN VAN A',
  freeShippingThreshold: 500000,
  standardShippingFee: 30000,
  expressShippingFee: 50000,
  enableTax: false,
  taxRate: 10,
  enableOrderEmails: true,
  enablePromotionalEmails: false,
  emailSignature: 'Cảm ơn bạn đã mua sắm tại cửa hàng chúng tôi!',
  enableLowStockAlert: true,
  lowStockThreshold: 10,
  enableNewOrderAlert: true,
};

export default function AdminSettings() {
  const [settings, setSettings] = useState<StoreSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    try {
      const savedSettings = localStorage.getItem('storeSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    try {
      localStorage.setItem('storeSettings', JSON.stringify(settings));
      toast({
        title: 'Đã lưu cài đặt',
        description: 'Cài đặt của bạn đã được cập nhật thành công',
      });
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể lưu cài đặt',
        variant: 'destructive',
      });
    }
  };

  const updateSetting = (key: keyof StoreSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
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
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-muted rounded w-40"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="h-10 bg-muted rounded"></div>
              <div className="h-10 bg-muted rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Quản lý cấu hình cửa hàng</p>
        </div>
        <Button onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />
          Lưu thay đổi
        </Button>
      </div>

      {/* Store Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="w-5 h-5" />
            Thông Tin Cửa Hàng
          </CardTitle>
          <CardDescription>Thông tin cơ bản về cửa hàng của bạn</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="storeName">Tên cửa hàng</Label>
              <Input
                id="storeName"
                value={settings.storeName}
                onChange={(e) => updateSetting('storeName', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Email liên hệ</Label>
              <Input
                id="contactEmail"
                type="email"
                value={settings.contactEmail}
                onChange={(e) => updateSetting('contactEmail', e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contactPhone">Số điện thoại</Label>
              <Input
                id="contactPhone"
                value={settings.contactPhone}
                onChange={(e) => updateSetting('contactPhone', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="storeAddress">Địa chỉ</Label>
              <Input
                id="storeAddress"
                value={settings.storeAddress}
                onChange={(e) => updateSetting('storeAddress', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="storeDescription">Mô tả cửa hàng</Label>
            <Textarea
              id="storeDescription"
              value={settings.storeDescription}
              onChange={(e) => updateSetting('storeDescription', e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Payment Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Phương Thức Thanh Toán
          </CardTitle>
          <CardDescription>Cấu hình các phương thức thanh toán</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Thanh toán khi nhận hàng (COD)</Label>
              <p className="text-sm text-muted-foreground">Cho phép khách hàng thanh toán khi nhận hàng</p>
            </div>
            <Switch
              checked={settings.enableCOD}
              onCheckedChange={(checked) => updateSetting('enableCOD', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Chuyển khoản ngân hàng</Label>
              <p className="text-sm text-muted-foreground">Cho phép thanh toán qua chuyển khoản</p>
            </div>
            <Switch
              checked={settings.enableBankTransfer}
              onCheckedChange={(checked) => updateSetting('enableBankTransfer', checked)}
            />
          </div>

          {settings.enableBankTransfer && (
            <div className="ml-6 p-4 border rounded-lg space-y-4 bg-muted/50">
              <div className="space-y-2">
                <Label htmlFor="bankName">Tên ngân hàng</Label>
                <Input
                  id="bankName"
                  value={settings.bankName}
                  onChange={(e) => updateSetting('bankName', e.target.value)}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="bankAccountNumber">Số tài khoản</Label>
                  <Input
                    id="bankAccountNumber"
                    value={settings.bankAccountNumber}
                    onChange={(e) => updateSetting('bankAccountNumber', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bankAccountName">Tên chủ tài khoản</Label>
                  <Input
                    id="bankAccountName"
                    value={settings.bankAccountName}
                    onChange={(e) => updateSetting('bankAccountName', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Shipping Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5" />
            Cài Đặt Vận Chuyển
          </CardTitle>
          <CardDescription>Cấu hình phí và chính sách vận chuyển</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="freeShippingThreshold">Miễn phí vận chuyển với đơn từ</Label>
            <div className="flex items-center gap-2">
              <Input
                id="freeShippingThreshold"
                type="number"
                value={settings.freeShippingThreshold}
                onChange={(e) => updateSetting('freeShippingThreshold', parseFloat(e.target.value))}
              />
              <Badge variant="secondary">{formatPrice(settings.freeShippingThreshold)}</Badge>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="standardShippingFee">Phí vận chuyển tiêu chuẩn</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="standardShippingFee"
                  type="number"
                  value={settings.standardShippingFee}
                  onChange={(e) => updateSetting('standardShippingFee', parseFloat(e.target.value))}
                />
                <Badge variant="outline">{formatPrice(settings.standardShippingFee)}</Badge>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="expressShippingFee">Phí vận chuyển nhanh</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="expressShippingFee"
                  type="number"
                  value={settings.expressShippingFee}
                  onChange={(e) => updateSetting('expressShippingFee', parseFloat(e.target.value))}
                />
                <Badge variant="outline">{formatPrice(settings.expressShippingFee)}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tax Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            Cài Đặt Thuế
          </CardTitle>
          <CardDescription>Cấu hình thuế và phí bổ sung</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Áp dụng thuế</Label>
              <p className="text-sm text-muted-foreground">Tự động thêm thuế vào giá sản phẩm</p>
            </div>
            <Switch
              checked={settings.enableTax}
              onCheckedChange={(checked) => updateSetting('enableTax', checked)}
            />
          </div>

          {settings.enableTax && (
            <div className="space-y-2">
              <Label htmlFor="taxRate">Thuế suất (%)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="taxRate"
                  type="number"
                  value={settings.taxRate}
                  onChange={(e) => updateSetting('taxRate', parseFloat(e.target.value))}
                  max={100}
                  min={0}
                />
                <Badge variant="secondary">{settings.taxRate}%</Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Email Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Cài Đặt Email
          </CardTitle>
          <CardDescription>Cấu hình email tự động gửi cho khách hàng</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email xác nhận đơn hàng</Label>
              <p className="text-sm text-muted-foreground">Gửi email khi có đơn hàng mới</p>
            </div>
            <Switch
              checked={settings.enableOrderEmails}
              onCheckedChange={(checked) => updateSetting('enableOrderEmails', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email khuyến mãi</Label>
              <p className="text-sm text-muted-foreground">Gửi email về chương trình khuyến mãi</p>
            </div>
            <Switch
              checked={settings.enablePromotionalEmails}
              onCheckedChange={(checked) => updateSetting('enablePromotionalEmails', checked)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="emailSignature">Chữ ký email</Label>
            <Textarea
              id="emailSignature"
              value={settings.emailSignature}
              onChange={(e) => updateSetting('emailSignature', e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Cài Đặt Thông Báo
          </CardTitle>
          <CardDescription>Cấu hình thông báo cho quản trị viên</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Cảnh báo sản phẩm sắp hết hàng</Label>
              <p className="text-sm text-muted-foreground">Nhận thông báo khi sản phẩm sắp hết</p>
            </div>
            <Switch
              checked={settings.enableLowStockAlert}
              onCheckedChange={(checked) => updateSetting('enableLowStockAlert', checked)}
            />
          </div>

          {settings.enableLowStockAlert && (
            <div className="space-y-2">
              <Label htmlFor="lowStockThreshold">Ngưỡng cảnh báo tồn kho</Label>
              <Input
                id="lowStockThreshold"
                type="number"
                value={settings.lowStockThreshold}
                onChange={(e) => updateSetting('lowStockThreshold', parseInt(e.target.value))}
                min={1}
              />
            </div>
          )}

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Thông báo đơn hàng mới</Label>
              <p className="text-sm text-muted-foreground">Nhận thông báo khi có đơn hàng mới</p>
            </div>
            <Switch
              checked={settings.enableNewOrderAlert}
              onCheckedChange={(checked) => updateSetting('enableNewOrderAlert', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <DataManager />

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} size="lg">
          <Save className="w-4 h-4 mr-2" />
          Lưu tất cả thay đổi
        </Button>
      </div>
    </div>
  );
}
