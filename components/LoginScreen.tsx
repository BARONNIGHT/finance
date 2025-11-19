import React, { useState } from 'react';
import { User, loginUser, registerUser } from '../services/storageService';
import { Wallet, ArrowRight, UserPlus, LogIn, Lock, User as UserIcon, type LucideIcon } from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (user: User) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate network delay for better UX feel
    await new Promise(resolve => setTimeout(resolve, 800));

    if (isRegister) {
      const result = registerUser({
        username: formData.username,
        password: formData.password,
        name: formData.name
      });

      if (result.success) {
        // Auto login after register
        const loginResult = loginUser(formData.username, formData.password);
        if (loginResult.success && loginResult.user) {
          onLoginSuccess(loginResult.user);
        }
      } else {
        setError(result.message);
      }
    } else {
      const result = loginUser(formData.username, formData.password);
      if (result.success && result.user) {
        onLoginSuccess(result.user);
      } else {
        setError(result.message);
      }
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-emerald-50 p-8 text-center border-b border-emerald-100">
          <div className="bg-emerald-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-200 transform rotate-3">
            <Wallet className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Selamat Datang di FINPRO</h1>
          <p className="text-emerald-600 text-sm mt-1">Kelola keuangan harianmu dengan cerdas.</p>
        </div>

        {/* Form */}
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100 flex items-center gap-2 animate-pulse">
                <span>⚠️</span> {error}
              </div>
            )}

            {isRegister && (
               <InputGroup 
                  icon={UserIcon} 
                  type="text" 
                  placeholder="Nama Lengkap" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
               />
            )}

            <InputGroup 
              icon={UserIcon} 
              type="text" 
              placeholder="Username" 
              value={formData.username}
              onChange={e => setFormData({...formData, username: e.target.value.toLowerCase().replace(/\s/g, '')})}
            />

            <InputGroup 
              icon={Lock} 
              type="password" 
              placeholder="Password" 
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
            />

            <button
              type="submit"
              disabled={isLoading || !formData.username || !formData.password}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-xl font-bold shadow-lg shadow-emerald-200 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="animate-pulse">Memproses...</span>
              ) : (
                <>
                  {isRegister ? 'Daftar Akun' : 'Masuk Aplikasi'}
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              {isRegister ? 'Sudah punya akun?' : 'Belum punya akun?'}
              <button
                onClick={() => {
                  setIsRegister(!isRegister);
                  setError('');
                  setFormData({ username: '', password: '', name: '' });
                }}
                className="ml-2 font-bold text-emerald-600 hover:underline focus:outline-none"
              >
                {isRegister ? 'Login disini' : 'Daftar sekarang'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const InputGroup = ({ icon: Icon, ...props }: { icon: LucideIcon } & React.InputHTMLAttributes<HTMLInputElement>) => (
  <div className="relative group">
    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors">
      <Icon size={20} />
    </div>
    <input
      {...props}
      className="w-full bg-gray-50 border border-gray-100 text-gray-800 text-sm rounded-xl pl-12 pr-4 py-4 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
    />
  </div>
);

export default LoginScreen;
