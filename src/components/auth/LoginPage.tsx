import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Flame, Lock, User as UserIcon, LogIn, Eye, EyeOff, ShieldCheck, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { loginAs } = useAuth();
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!username.trim()) {
      setErrorMsg('Por favor, informe seu nome de usuário.');
      return;
    }

    if (!password.trim()) {
      setErrorMsg('Por favor, informe a senha de acesso.');
      return;
    }

    const success = loginAs(username.trim(), password.trim());
    if (!success) {
      setErrorMsg('Usuário ou senha incorretos! Tente usuário: "joao" ou "fabio" e senha: "123"');
    }
  };

  return (
    <div className="min-h-screen bg-industrial-bg text-industrial-textPrimary flex flex-col justify-center items-center p-4 sm:p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-industrial-card via-industrial-bg to-black">
      
      {/* Container Card */}
      <div className="w-full max-w-md space-y-6 animate-scale-up">
        
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-industrial-accent to-blue-700 mx-auto flex items-center justify-center shadow-scada-glow">
            <Flame className="w-9 h-9 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white font-mono tracking-tight">
              AMENDOBENTO
            </h1>
            <p className="text-xs text-industrial-textSecondary mt-1">
              Controle Inteligente de Torra de Amendoim
            </p>
          </div>
        </div>

        {/* Login Form Box */}
        <div className="bg-industrial-card border border-industrial-border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="border-b border-industrial-border pb-4">
            <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
              <LogIn className="w-5 h-5 text-industrial-accent" />
              ACESSO AO SISTEMA
            </h2>
            <p className="text-xs text-industrial-textMuted mt-0.5">
              Informe seu usuário e senha de acesso
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Username Input */}
            <div>
              <label className="block text-xs font-bold text-industrial-textSecondary uppercase tracking-wider mb-2 flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-industrial-accent" />
                Nome de Usuário
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={e => {
                  setUsername(e.target.value);
                  setErrorMsg(null);
                }}
                placeholder="Digite seu usuário (ex: joao, fabio)"
                className="w-full bg-industrial-bg border border-industrial-border rounded-xl py-3.5 px-4 text-white text-sm focus:border-industrial-accent focus:outline-none transition-all"
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-bold text-industrial-textSecondary uppercase tracking-wider mb-2 flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-400" />
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value);
                    setErrorMsg(null);
                  }}
                  placeholder="Digite sua senha"
                  className="w-full bg-industrial-bg border border-industrial-border rounded-xl py-3.5 pl-4 pr-11 text-white text-sm font-mono focus:border-industrial-accent focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-industrial-textMuted hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Hint Box */}
            <div className="p-3 bg-industrial-bg/80 border border-industrial-border rounded-xl text-[11px] text-industrial-textMuted space-y-1 font-mono">
              <div>👤 <strong className="text-white">Operador:</strong> <code className="text-emerald-400 font-bold">joao</code> • Senha: <code className="text-emerald-400 font-bold">123</code></div>
              <div>👑 <strong className="text-white">Admin:</strong> <code className="text-blue-400 font-bold">fabio</code> • Senha: <code className="text-blue-400 font-bold">123</code></div>
            </div>

            {/* Error Message Alert */}
            {errorMsg && (
              <div className="p-3 bg-rose-950/80 border border-rose-600/60 rounded-xl text-xs text-rose-300 flex items-center gap-2 font-medium animate-fade-in">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full h-13 bg-gradient-to-r from-industrial-accent to-blue-600 hover:from-blue-600 hover:to-indigo-600 text-white font-extrabold rounded-xl shadow-scada-glow flex items-center justify-center gap-2 text-sm uppercase tracking-wider active:scale-98 transition-all"
            >
              <ShieldCheck className="w-5 h-5" />
              ENTRAR
            </button>

          </form>
        </div>

        {/* Footer info */}
        <div className="text-center text-xs text-industrial-textMuted font-mono">
          Indústria Amendobento S/A • Sistema de Inteligência Artificial
        </div>

      </div>
    </div>
  );
};
