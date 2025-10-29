import { Link } from 'react-router-dom';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Payment Methods */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center gap-4">
          <div className="text-center">
            <span className="font-semibold text-white text-lg">Phương thức thanh toán</span>
            <div className="flex items-center gap-4 mt-3">
              <div className="bg-white rounded-lg px-4 py-2 shadow-sm">
                <span className="text-pink-600 font-bold text-base">MoMo</span>
              </div>
              <div className="bg-white rounded-lg px-4 py-2 shadow-sm">
                <span className="text-blue-600 font-bold text-base">ZaloPay</span>
              </div>
              <div className="bg-white rounded-lg px-4 py-2 shadow-sm">
                <span className="text-gray-700 font-semibold text-base">COD</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <p className="text-center text-sm">
            © {currentYear} E-Commerce. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
