import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to products page
    navigate('/products');
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <div className="mb-4 animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <h1 className="mb-4 text-4xl font-bold">Đang tải dữ liệu...</h1>
        <p className="text-xl text-muted-foreground">Khởi tạo dữ liệu mẫu cho hệ thống</p>
      </div>
    </div>
  );
};

export default Index;
