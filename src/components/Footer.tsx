import { Banknote, Building2, Shield, Headphones, Truck } from 'lucide-react';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-b from-gray-900 to-gray-950 text-gray-300">
      {/* Services & Payment */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Payment Methods */}
          <div className="space-y-4">
            <h3 className="font-bold text-white text-lg flex items-center gap-2">
              <Banknote className="w-5 h-5 text-primary" />
              Phương thức thanh toán
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors">
                <Building2 className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-white">Chuyển khoản ngân hàng</p>
                  <p className="text-sm text-gray-400">Thanh toán qua QR Code</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors">
                <Banknote className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-white">Tiền mặt (COD)</p>
                  <p className="text-sm text-gray-400">Thanh toán khi nhận hàng</p>
                </div>
              </div>
            </div>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="font-bold text-white text-lg flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Dịch vụ của chúng tôi
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-800/50">
                <Truck className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-white">Giao hàng toàn quốc</p>
                  <p className="text-sm text-gray-400">Nhanh chóng và an toàn</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-800/50">
                <Headphones className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-white">Hỗ trợ 24/7</p>
                  <p className="text-sm text-gray-400">Luôn sẵn sàng phục vụ</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-400">
              © {currentYear} <span className="font-semibold text-primary">ShopVN</span>. All rights reserved.
            </p>
            <p className="text-xs text-gray-500">
              Made with ❤️ in Vietnam
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
