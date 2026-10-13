import React, { useState } from 'react';
import { AuthUser, UserRole } from '../types/kas';
import { 
  User, 
  Lock, 
  KeyRound, 
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';

interface LoginPageProps {
  onLogin: (user: AuthUser) => void;
}

const PRESET_ACCOUNTS = {
  admin: {
    username: 'admin',
    userObj: {
      id: 'usr_admin',
      username: 'admin',
      nama: 'Administrator Kas',
      role: 'admin' as UserRole,
      email: 'admin@bukukas.local'
    }
  },
  user: {
    username: 'user',
    userObj: {
      id: 'usr_staff',
      username: 'user',
      nama: 'Petugas / User Input',
      role: 'user' as UserRole,
      email: 'user@bukukas.local'
    }
  }
};

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanUsername || !cleanPassword) {
      setErrorMessage('Silakan isi username dan password.');
      return;
    }

    if (
      cleanUsername === 'admin' ||
      cleanUsername === 'administrator'
    ) {
      onLogin(PRESET_ACCOUNTS.admin.userObj);
      return;
    }

    if (
      cleanUsername === 'user' ||
      cleanUsername === 'operator' || 
      cleanUsername === 'petugas'
    ) {
      onLogin(PRESET_ACCOUNTS.user.userObj);
      return;
    }

    // Default fallback allow any with chosen role hint or generic user
    if (cleanUsername.includes('admin')) {
      onLogin({
        id: `usr_${Date.now()}`,
        username: cleanUsername,
        nama: `Admin (${cleanUsername})`,
        role: 'admin'
      });
      return;
    }

    // Allow user login
    onLogin({
      id: `usr_${Date.now()}`,
      username: cleanUsername,
      nama: `User (${cleanUsername})`,
      role: 'user'
    });
  };

  return (
    <div className="min-h-screen bg-[#2B323A] flex flex-col justify-center py-10 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        
        {/* Brand Logo */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white p-2.5 shadow-xl shadow-emerald-950/40 mb-4 border border-emerald-500/20">
          <img 
            src="/pwa-512x512.png" 
            onError={(e) => { e.currentTarget.src = '/PWA-512.png'; }}
            alt="Google Sheet Icon" 
            className="w-full h-full object-contain" 
          />
        </div>
        
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Buku Kas Google Sheet
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Sistem Pembukuan Terhubung Google Sheets & Apps Script
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-2xl rounded-2xl border border-slate-200 sm:px-10">
          
          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin atau user"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full bg-[#348fe2] hover:bg-[#2c7ec9] active:scale-[0.99] text-white py-3 px-4 rounded-xl font-bold text-sm shadow-md shadow-sky-600/20 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <KeyRound className="w-4 h-4" />
                <span>Masuk ke Aplikasi Kas</span>
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};
