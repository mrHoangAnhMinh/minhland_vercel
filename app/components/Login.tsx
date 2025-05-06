'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  sendEmailVerification,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { toast, ToastContainer } from 'react-toastify';

const googleProvider = new GoogleAuthProvider();

interface LoginProps {
  setUser: (user: any) => void;
}

export default function Login({ setUser }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSignUpMode, setIsSignUpMode] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (currentUser && !currentUser.emailVerified && !isSignUpMode) {
        toast.info('Vui lòng xác minh email của bạn để tiếp tục.', {
          position: 'top-right',
          autoClose: 5000,
        });
      }
    });
    return () => unsubscribe();
  }, [isSignUpMode, setUser]);

  const handleEmailLogin = async () => {
    try {
      if (!email || !password) {
        toast.error('Vui lòng nhập email và mật khẩu', {
          position: 'top-right',
          autoClose: 3000,
        });
        return;
      }

      const result = await signInWithEmailAndPassword(auth, email, password);
      if (!result.user.emailVerified) {
        toast.info('Vui lòng xác minh email của bạn để tiếp tục.', {
          position: 'top-right',
          autoClose: 5000,
        });
        await auth.signOut();
        setUser(null);
        return;
      }
      setUser(result.user);
      setEmail('');
      setPassword('');
      toast.success('Đăng nhập thành công!', {
        position: 'top-right',
        autoClose: 3000,
      });
    } catch (err: any) {
      let errorMessage = 'Lỗi đăng nhập. Vui lòng thử lại.';
      switch (err.code) {
        case 'auth/invalid-email':
          errorMessage = 'Email không hợp lệ.';
          break;
        case 'auth/user-not-found':
          errorMessage = 'Email không tồn tại.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Mật khẩu không đúng.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Quá nhiều lần thử đăng nhập. Vui lòng thử lại sau.';
          break;
        default:
          errorMessage = err.message || 'Lỗi không xác định.';
      }
      toast.error(errorMessage, {
        position: 'top-right',
        autoClose: 3000,
      });
    }
  };

  const handleSignUp = async () => {
    try {
      if (!email || !password || !name || !phoneNumber) {
        toast.error('Vui lòng nhập đầy đủ thông tin: tên, email, số điện thoại và mật khẩu', {
          position: 'top-right',
          autoClose: 3000,
        });
        return;
      }
      if (password.length < 6) {
        toast.error('Mật khẩu phải có ít nhất 6 ký tự', {
          position: 'top-right',
          autoClose: 3000,
        });
        return;
      }
      const phoneRegex = /^[0-9]{10,11}$/;
      if (!phoneRegex.test(phoneNumber)) {
        toast.error('Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại 10-11 chữ số.', {
          position: 'top-right',
          autoClose: 3000,
        });
        return;
      }

      const result = await createUserWithEmailAndPassword(auth, email, password);
      const user = result.user;

      // Dữ liệu user sẽ lưu vào Firestore
      const userData = {
        uid: user.uid,
        displayName: name,
        email: email,
        phoneNumber: phoneNumber,
        createdAt: new Date().toISOString(),
      };
      console.log('Saving user to Firestore:', userData);

      // Lưu thông tin người dùng vào Firestore
      await setDoc(doc(db, 'users', user.uid), userData);
      console.log('User saved to Firestore successfully:', user.uid);

      await updateProfile(user, { displayName: name });
      await sendEmailVerification(user);
      toast.success('Đăng ký thành công! Vui lòng kiểm tra email để xác minh.', {
        position: 'top-right',
        autoClose: 5000,
      });
      setEmail('');
      setPassword('');
      setName('');
      setPhoneNumber('');
      setIsSignUpMode(false);
    } catch (err: any) {
      console.error('Error during sign up:', err);
      let errorMessage = 'Lỗi đăng ký. Vui lòng thử lại.';
      switch (err.code) {
        case 'auth/invalid-email':
          errorMessage = 'Email không hợp lệ.';
          break;
        case 'auth/email-already-in-use':
          errorMessage = 'Email đã được sử dụng.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Mật khẩu quá yếu. Vui lòng chọn mật khẩu mạnh hơn.';
          break;
        default:
          errorMessage = err.message || 'Lỗi không xác định.';
      }
      toast.error(errorMessage, {
        position: 'top-right',
        autoClose: 3000,
      });
    }
  };

  const handlePasswordReset = async () => {
    try {
      if (!email) {
        toast.error('Vui lòng nhập email để đặt lại mật khẩu', {
          position: 'top-right',
          autoClose: 3000,
        });
        return;
      }

      await sendPasswordResetEmail(auth, email);
      toast.success('Email đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư.', {
        position: 'top-right',
        autoClose: 5000,
      });
    } catch (err: any) {
      let errorMessage = 'Lỗi gửi email đặt lại mật khẩu.';
      switch (err.code) {
        case 'auth/invalid-email':
          errorMessage = 'Email không hợp lệ.';
          break;
        case 'auth/user-not-found':
          errorMessage = 'Email không tồn tại.';
          break;
        default:
          errorMessage = err.message || 'Lỗi không xác định.';
      }
      toast.error(errorMessage, {
        position: 'top-right',
        autoClose: 3000,
      });
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setUser(result.user);
      toast.success('Đăng nhập với Google thành công!', {
        position: 'top-right',
        autoClose: 3000,
      });
    } catch (err: any) {
      toast.error(err.message || 'Lỗi không xác định.', {
        position: 'top-right',
        autoClose: 3000,
      });
    }
  };

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      setUser(null);
      toast.success('Đăng xuất thành công!', {
        position: 'top-right',
        autoClose: 3000,
      });
    } catch (err: any) {
      toast.error(err.message || 'Lỗi không xác định.', {
        position: 'top-right',
        autoClose: 3000,
      });
    }
  };

  const handleResendVerification = async () => {
    if (auth.currentUser) {
      try {
        await sendEmailVerification(auth.currentUser);
        toast.success('Email xác minh đã được gửi lại. Vui lòng kiểm tra hộp thư.', {
          position: 'top-right',
          autoClose: 5000,
        });
      } catch (err: any) {
        toast.error(err.message || 'Lỗi gửi email xác minh.', {
          position: 'top-right',
          autoClose: 3000,
        });
      }
    }
  };

  return (
    <div className="column max-w-md mx-auto mt-8">
      <ToastContainer />
      {auth.currentUser ? (
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Đăng nhập thành công!</h2>
          <p>
            Xin chào, {auth.currentUser.displayName || auth.currentUser.email} (
            {auth.currentUser.email})
          </p>
          {!auth.currentUser.emailVerified && (
            <p className="mt-2">
              Email của bạn chưa được xác minh.{' '}
              <button
                onClick={handleResendVerification}
                className="text-blue-600 hover:underline"
              >
                Gửi lại email xác minh
              </button>
            </p>
          )}
          <Button
            onClick={handleSignOut}
            className="mt-4 bg-red-600 hover:bg-red-700 text-white"
          >
            Đăng xuất
          </Button>
        </div>
      ) : (
        <>
          <h2 className="text-2xl font-bold mb-6">
            {isSignUpMode ? 'Đăng ký' : 'Đăng nhập'}
          </h2>
          <div className="space-y-4">
            {isSignUpMode && (
              <>
                <div>
                  <Label htmlFor="name">Tên người dùng</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nhập tên của bạn"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="phoneNumber">Số điện thoại</Label>
                  <Input
                    id="phoneNumber"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Nhập số điện thoại (VD: 0901234567)"
                    className="mt-1"
                  />
                </div>
              </>
            )}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="test@minhland.com"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mật khẩu"
                className="mt-1"
              />
            </div>
            {!isSignUpMode && (
              <div className="text-right">
                <button
                  onClick={handlePasswordReset}
                  className="text-blue-600 hover:underline"
                >
                  Quên mật khẩu?
                </button>
              </div>
            )}
            <Button
              onClick={isSignUpMode ? handleSignUp : handleEmailLogin}
              className="w-full bg-green-700 hover:bg-green-800 text-white"
            >
              {isSignUpMode ? 'Đăng ký' : 'Đăng nhập bằng Email'}
            </Button>
            {!isSignUpMode && (
              <Button
                onClick={handleGoogleLogin}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Đăng nhập với Google
              </Button>
            )}
            <p className="text-center">
              {isSignUpMode ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'}{' '}
              <button
                onClick={() => setIsSignUpMode(!isSignUpMode)}
                className="text-blue-600 hover:underline cursor-pointer"
              >
                {isSignUpMode ? 'Đăng nhập' : 'Đăng ký'}
              </button>
            </p>
          </div>
        </>
      )}
    </div>
  );
}