
import React, { useState } from 'react';
import { Factory, Mail, Lock, LogIn, AlertCircle, Loader2, Info, Sparkles } from 'lucide-react';
import { apiService } from '../services/api';
import { User } from '../types';
import { MOCK_USERS } from '../constants';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await apiService.login(email, password);
      if (result.user) {
        onLogin(result.user);
      } else {
        setError(result.error || 'Falha na autenticação.');
      }
    } catch (err: any) {
      setError('Erro de conexão. Verifique se o banco de dados está configurado corretamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    // Entra com o primeiro usuário do Mock (Administrador)
    const demoUser = MOCK_USERS[0];
    localStorage.setItem('tp_session_v1', JSON.stringify(demoUser));
    onLogin(demoUser);
  };

  const isCorsError = error?.includes('CORS');

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorative Blobs */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-[440px] relative z-10">
        <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden border border-slate-100">
          <div className="p-10 md:p-12">
            <div className="flex flex-col items-center mb-10">
              <div className="bg-blue-600 p-4 rounded-[22px] shadow-xl shadow-blue-200 mb-6 rotate-3">
                <Factory className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tighter">TECNOPERFIL</h1>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] mt-1">Gestão Industrial 4.0</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">E-mail Corporativo</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all placeholder:text-slate-200"
                    placeholder="admin@tecnoperfil.com.br"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Senha Industrial</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all placeholder:text-slate-200"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {error && (
                <div className={`p-4 rounded-2xl flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 border ${
                  isCorsError ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}>
                  <div className="flex items-start gap-3">
                    {isCorsError ? <Info className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                    <p className="text-[11px] font-bold leading-tight">{error}</p>
                  </div>
                </div>
              )}

              <div className="space-y-3 pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-slate-900 hover:bg-black text-white font-black py-4 rounded-2xl shadow-xl shadow-slate-200 transition-all active:scale-[0.98] flex items-center justify-center gap-3 group disabled:opacity-70"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span className="text-xs uppercase tracking-widest">Acessar Sistema</span>
                      <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>

                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                  <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest"><span className="bg-white px-2 text-slate-300">ou</span></div>
                </div>

                <button
                  type="button"
                  onClick={handleDemoLogin}
                  className="w-full bg-blue-50 hover:bg-blue-100 text-blue-600 font-black py-4 rounded-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 border border-blue-100"
                >
                  <Sparkles className="w-4 h-4" />
                  <span className="text-xs uppercase tracking-widest">Modo de Demonstração</span>
                </button>
              </div>
            </form>
          </div>
          <div className="bg-slate-50 p-6 text-center border-t border-slate-100">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">TecnoPerfil Alumínio & Perfis Ltda</p>
          </div>
        </div>
        
        <p className="mt-8 text-center text-slate-500 text-[10px] font-black uppercase tracking-widest opacity-40">
          Industrial Ecosystem v1.2.0 • 2024
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
