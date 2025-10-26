import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin, Youtube } from 'lucide-react';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-white text-xl font-bold mb-4">E-Commerce</h3>
            <p className="text-sm leading-relaxed">
              Cửa hàng thời trang trực tuyến hàng đầu Việt Nam. Chúng tôi cam kết mang đến những sản phẩm chất lượng cao với giá cả hợp lý.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a 
                href="https://youtube.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
                aria-label="Youtube"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white text-lg font-semibold mb-4">Liên Kết Nhanh</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="hover:text-primary transition-colors text-sm">
                  Trang Chủ
                </Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-primary transition-colors text-sm">
                  Sản Phẩm
                </Link>
              </li>
              <li>
                <Link to="/products?category=Áo" className="hover:text-primary transition-colors text-sm">
                  Áo
                </Link>
              </li>
              <li>
                <Link to="/products?category=Quần" className="hover:text-primary transition-colors text-sm">
                  Quần
                </Link>
              </li>
              <li>
                <Link to="/products?category=Giày" className="hover:text-primary transition-colors text-sm">
                  Giày
                </Link>
              </li>
              <li>
                <Link to="/products?category=Phụ kiện" className="hover:text-primary transition-colors text-sm">
                  Phụ Kiện
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-white text-lg font-semibold mb-4">Hỗ Trợ Khách Hàng</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/orders" className="hover:text-primary transition-colors text-sm">
                  Đơn Hàng Của Tôi
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-primary transition-colors text-sm">
                  Giỏ Hàng
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors text-sm">
                  Chính Sách Đổi Trả
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors text-sm">
                  Hướng Dẫn Mua Hàng
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors text-sm">
                  Phương Thức Thanh Toán
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors text-sm">
                  Câu Hỏi Thường Gặp
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white text-lg font-semibold mb-4">Liên Hệ</h4>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm">
                  123 Đường ABC, Quận 1, TP. Hồ Chí Minh, Việt Nam
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                <a href="tel:+84123456789" className="text-sm hover:text-primary transition-colors">
                  (+84) 123 456 789
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                <a href="mailto:support@ecommerce.vn" className="text-sm hover:text-primary transition-colors">
                  support@ecommerce.vn
                </a>
              </li>
            </ul>
            <div className="mt-4">
              <p className="text-sm font-semibold text-white mb-2">Giờ làm việc:</p>
              <p className="text-sm">Thứ 2 - Thứ 7: 8:00 - 22:00</p>
              <p className="text-sm">Chủ Nhật: 9:00 - 21:00</p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-center md:text-left">
              <span className="font-semibold text-white">Phương thức thanh toán:</span>
              <div className="flex items-center gap-3 mt-2 justify-center md:justify-start">
                <div className="bg-white rounded px-3 py-1.5">
                  <span className="text-pink-600 font-bold text-sm">MoMo</span>
                </div>
                <div className="bg-white rounded px-3 py-1.5">
                  <span className="text-blue-600 font-bold text-sm">ZaloPay</span>
                </div>
                <div className="bg-white rounded px-3 py-1.5">
                  <span className="text-gray-700 font-semibold text-sm">COD</span>
                </div>
              </div>
            </div>
            <div className="text-sm text-center md:text-right">
              <p className="text-white font-semibold mb-1">Chứng nhận:</p>
              <p className="text-xs">Đã đăng ký Bộ Công Thương</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <p className="text-center md:text-left">
              © {currentYear} E-Commerce. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-primary transition-colors">
                Điều Khoản Sử Dụng
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                Chính Sách Bảo Mật
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                Sitemap
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
