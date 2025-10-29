import { Wallet, CreditCard, Banknote } from 'lucide-react';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-b from-gray-900 to-gray-950 text-gray-300">
      {/* Payment Methods */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center gap-6">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Wallet className="w-6 h-6 text-primary" />
              <h3 className="font-bold text-white text-xl">Phương thức thanh toán</h3>
            </div>
            <p className="text-sm text-gray-400 max-w-md">
              Hỗ trợ đa dạng phương thức thanh toán, nhanh chóng và an toàn
            </p>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-6 mt-4">
            {/* MoMo */}
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl blur opacity-30 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative bg-white rounded-xl px-6 py-4 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-pink-600" />
                  <span className="text-pink-600 font-bold text-lg">MoMo</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Ví điện tử</p>
              </div>
            </div>

            {/* ZaloPay */}
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl blur opacity-30 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative bg-white rounded-xl px-6 py-4 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-blue-600" />
                  <span className="text-blue-600 font-bold text-lg">ZaloPay</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Ví điện tử</p>
              </div>
            </div>

            {/* COD */}
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl blur opacity-30 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative bg-white rounded-xl px-6 py-4 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center gap-2">
                  <Banknote className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700 font-bold text-lg">COD</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Thanh toán khi nhận hàng</p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="w-full max-w-md h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent mt-6"></div>

          {/* Additional Info */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              ✓ Giao dịch an toàn
            </span>
            <span className="text-gray-700">•</span>
            <span className="flex items-center gap-1">
              ✓ Bảo mật thông tin
            </span>
            <span className="text-gray-700">•</span>
            <span className="flex items-center gap-1">
              ✓ Hỗ trợ 24/7
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-400">
              © {currentYear} <span className="font-semibold text-primary">E-Commerce</span>. All rights reserved.
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
