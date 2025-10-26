import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Lock, User } from 'lucide-react';

export default function Auth() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      // Redirect to the page user was trying to access, or home
      const from = (location.state as any)?.from || '/';
      navigate(from);
    }
  }, [isAuthenticated, navigate, location]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast.error('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    setLoading(true);
    
    const success = login(username, password);
    
    if (success) {
      toast.success('Đăng nhập thành công!');
      // Redirect to the page user was trying to access, or home
      const from = (location.state as any)?.from || '/';
      navigate(from);
    } else {
      toast.error('Tên đăng nhập hoặc mật khẩu không đúng');
    }
    
    setLoading(false);
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center p-4'>
      <Card className='w-full max-w-md'>
        <CardHeader className='space-y-1 text-center'>
          <CardTitle className='text-3xl font-bold'>Đăng nhập</CardTitle>
          <CardDescription>
            Nhập thông tin đăng nhập để tiếp tục
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='username'>Tên đăng nhập</Label>
              <div className='relative'>
                <User className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
                <Input
                  id='username'
                  type='text'
                  placeholder='Tên đăng nhập'
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className='pl-10'
                  disabled={loading}
                />
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='password'>Mật khẩu</Label>
              <div className='relative'>
                <Lock className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
                <Input
                  id='password'
                  type='password'
                  placeholder='Mật khẩu'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className='pl-10'
                  disabled={loading}
                />
              </div>
            </div>

            <Button
              type='submit'
              className='w-full'
              disabled={loading}
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Button>
          </form>

          <div className='mt-6 p-4 bg-muted rounded-lg'>
            <p className='text-sm font-semibold mb-2'>Tài khoản demo:</p>
            <div className='space-y-1 text-sm text-muted-foreground'>
              <p>• Admin: <span className='font-mono'>admin / admin</span></p>
              <p>• User: <span className='font-mono'>user / user</span></p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
