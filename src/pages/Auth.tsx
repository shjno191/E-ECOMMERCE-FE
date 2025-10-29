import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Loader2, Phone, Lock, ArrowLeft } from 'lucide-react';

export default function Auth() {
  const navigate = useNavigate();
  const { login, register, isLoading } = useAuthStore();

  // Login form state
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Validate phone number (Vietnamese format)
  const validatePhone = (phone: string) => {
    const phoneRegex = /^(0|\+84)[0-9]{9}$/;
    return phoneRegex.test(phone);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!loginPhone || !loginPassword) {
      toast.error('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    if (!validatePhone(loginPhone)) {
      toast.error('Số điện thoại không hợp lệ');
      return;
    }

    const success = await login(loginPhone, loginPassword);

    if (success) {
      toast.success('Đăng nhập thành công!');
      navigate('/');
    } else {
      toast.error('Số điện thoại hoặc mật khẩu không đúng');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!registerPhone || !registerPassword) {
      toast.error('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    if (!validatePhone(registerPhone)) {
      toast.error('Số điện thoại không hợp lệ');
      return;
    }

    if (registerPassword.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    if (registerPassword !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }

    // Generate username from phone number
    const username = `User_${registerPhone.slice(-4)}`;

    const success = await register(registerPhone, registerPassword, username);

    if (success) {
      toast.success('Đăng ký thành công!');
      navigate('/');
    } else {
      toast.error('Số điện thoại đã được sử dụng');
    }
  };  return (
    <div className='min-h-screen bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center p-4'>
      <div className="w-full max-w-md space-y-4">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại
        </Button>

        <Card className='w-full'>
          <CardHeader className='space-y-1 text-center'>
            <CardTitle className='text-3xl font-bold'>Chào mừng!</CardTitle>
            <CardDescription>
              Đăng nhập hoặc tạo tài khoản mới
            </CardDescription>
          </CardHeader>
          <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Đăng nhập</TabsTrigger>
              <TabsTrigger value="register">Đăng ký</TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login">
              <form onSubmit={handleLogin} className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='login-phone'>Số điện thoại</Label>
                  <div className='relative'>
                    <Phone className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
                    <Input
                      id='login-phone'
                      type='tel'
                      placeholder='0901234567'
                      value={loginPhone}
                      onChange={(e) => setLoginPhone(e.target.value)}
                      className='pl-10'
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='login-password'>Mật khẩu</Label>
                  <div className='relative'>
                    <Lock className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
                    <Input
                      id='login-password'
                      type='password'
                      placeholder='••••••••'
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className='pl-10'
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                <Button
                  type='submit'
                  className='w-full'
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    'Đăng nhập'
                  )}
                </Button>
              </form>

              <div className='mt-6 p-4 bg-muted rounded-lg'>
                <p className='text-sm font-semibold mb-2'>Tài khoản demo:</p>
                <div className='space-y-1 text-sm text-muted-foreground'>
                  <p><strong>Admin:</strong> 0901234567 / admin</p>
                  <p><strong>User:</strong> 0912345678 / user</p>
                </div>
              </div>
            </TabsContent>

            {/* Register Tab */}
            <TabsContent value="register">
              <form onSubmit={handleRegister} className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='register-phone'>Số điện thoại <span className="text-red-500">*</span></Label>
                  <div className='relative'>
                    <Phone className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
                    <Input
                      id='register-phone'
                      type='tel'
                      placeholder='0901234567'
                      value={registerPhone}
                      onChange={(e) => setRegisterPhone(e.target.value)}
                      className='pl-10'
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='register-password'>Mật khẩu <span className="text-red-500">*</span></Label>
                  <div className='relative'>
                    <Lock className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
                    <Input
                      id='register-password'
                      type='password'
                      placeholder='••••••••'
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      className='pl-10'
                      disabled={isLoading}
                      required
                      minLength={6}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Ít nhất 6 ký tự
                  </p>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='confirm-password'>Xác nhận mật khẩu <span className="text-red-500">*</span></Label>
                  <div className='relative'>
                    <Lock className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
                    <Input
                      id='confirm-password'
                      type='password'
                      placeholder='••••••••'
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className='pl-10'
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                <Button
                  type='submit'
                  className='w-full'
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    'Đăng ký'
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
