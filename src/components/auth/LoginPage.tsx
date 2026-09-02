import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Flame, Lock, User as UserIcon, UserCheck, ShieldCheck, Eye, EyeOff, AlertCircle, LogIn } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { loginAs, users, authError, setAuthError } = useAuth();
  const [activeMode, setActiveMode] = useState<'operator' | 'admin'>('operator');

  // Operator selection state
  const operatorUsers = users.filter(u => u.role === 'operator');
  const [selectedOperatorId, setSelectedOperatorId] = useState<string>(operatorUsers[0]?.id || 'op-1');

  // Admin login state
  const [adminUsername, setAdminUsername] = useState<string>('fabio');
  const [adminPassword, setAdminPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const errorMsg = localError || authError;

  const handleOperatorLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setAuthError(null);
    if (!selectedOperatorId) {
      setLocalError('Por favor, selecione um operador.');
      return;
    }
    setIsLoading(true);
    try {
      const success = await loginAs(selectedOperatorId);
      if (!success) {
        setLocalError(authError || 'Operador não autorizado no banco de dados do Supabase.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setAuthError(null);

    if (!adminPassword.trim()) {
      setLocalError('Por favor, informe a senha de acesso do Administrador.');
      return;
    }

    setIsLoading(true);
    try {
      const success = await loginAs(adminUsername.trim() || 'fabio', adminPassword.trim());
      if (!success) {
        setLocalError(authError || 'Usuário não encontrado ou senha de administrador incorreta (Tabela Supabase).');
      }
    } finally {
      setIsLoading(false);
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

        {/* Mode Selector Switcher */}
        <div className="grid grid-cols-2 gap-2 bg-industrial-card p-1.5 rounded-2xl border border-industrial-border shadow-md">
          <button
            type="button"
            onClick={() => {
              setActiveMode('operator');
              setLocalError(null);
              setAuthError(null);
            }}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all ${activeMode === 'operator'
              ? 'bg-emerald-600 text-white shadow-lg'
              : 'text-industrial-textMuted hover:text-white hover:bg-industrial-bg'
              }`}
          >
            <UserCheck className="w-4 h-4" />
            Operador
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveMode('admin');
              setLocalError(null);
              setAuthError(null);
            }}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all ${activeMode === 'admin'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'text-industrial-textMuted hover:text-white hover:bg-industrial-bg'
              }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Admin / Supervisão
          </button>
        </div>

        {/* Form Box */}
        <div className="bg-industrial-card border border-industrial-border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">

          {/* OPERATOR LOGIN MODE */}
          {activeMode === 'operator' && (
            <form onSubmit={handleOperatorLogin} className="space-y-5">
              <div className="border-b border-industrial-border pb-4">
                <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-emerald-400" />
                  ACESSO DE OPERADOR
                </h2>
                <p className="text-xs text-industrial-textMuted mt-0.5">
                  Selecione qual operador você é para acessar o sistema
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-industrial-textSecondary uppercase tracking-wider mb-2 flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-emerald-400" />
                  Selecione o Operador
                </label>
                <select
                  value={selectedOperatorId}
                  onChange={e => {
                    setSelectedOperatorId(e.target.value);
                    setLocalError(null);
                    setAuthError(null);
                  }}
                  className="w-full bg-industrial-bg border border-industrial-border rounded-xl py-3.5 px-4 text-white text-sm font-semibold focus:border-emerald-500 focus:outline-none transition-all cursor-pointer"
                >
                  {operatorUsers.map(op => (
                    <option key={op.id} value={op.id} className="bg-industrial-card text-white py-2">
                      👷 {op.name} — {op.shift}
                    </option>
                  ))}
                </select>
              </div>

              {errorMsg && (
                <div className="p-3 bg-rose-950/80 border border-rose-600/60 rounded-xl text-xs text-rose-300 flex items-center gap-2 font-medium animate-fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-13 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-teal-600 hover:to-emerald-500 text-white font-extrabold rounded-xl shadow-scada-glow flex items-center justify-center gap-2 text-sm uppercase tracking-wider active:scale-98 transition-all disabled:opacity-50"
              >
                <LogIn className="w-5 h-5" />
                {isLoading ? 'ENTRANDO...' : 'ENTRAR NO SISTEMA'}
              </button>
            </form>
          )}

          {/* ADMIN LOGIN MODE */}
          {activeMode === 'admin' && (
            <form onSubmit={handleAdminLogin} className="space-y-5">
              <div className="border-b border-industrial-border pb-4">
                <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-blue-400" />
                  ACESSO DE ADMINISTRADOR
                </h2>
                <p className="text-xs text-industrial-textMuted mt-0.5">
                  Área restrita de gestão. Autenticação via banco de dados Supabase.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-industrial-textSecondary uppercase tracking-wider mb-2 flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-blue-400" />
                  Administrador
                </label>
                <input
                  type="text"
                  required
                  value={adminUsername}
                  onChange={e => {
                    setAdminUsername(e.target.value);
                    setLocalError(null);
                    setAuthError(null);
                  }}
                  placeholder="Nome do usuário admin (ex: fabio)"
                  className="w-full bg-industrial-bg border border-industrial-border rounded-xl py-3.5 px-4 text-white text-sm focus:border-blue-500 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-industrial-textSecondary uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-blue-400" />
                  Senha de Administrador
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={adminPassword}
                    onChange={e => {
                      setAdminPassword(e.target.value);
                      setLocalError(null);
                      setAuthError(null);
                    }}
                    placeholder="Digite sua senha"
                    className="w-full bg-industrial-bg border border-industrial-border rounded-xl py-3.5 pl-4 pr-11 text-white text-sm font-mono focus:border-blue-500 focus:outline-none transition-all"
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

              {errorMsg && (
                <div className="p-3 bg-rose-950/80 border border-rose-600/60 rounded-xl text-xs text-rose-300 flex items-center gap-2 font-medium animate-fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-13 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-indigo-600 hover:to-blue-500 text-white font-extrabold rounded-xl shadow-scada-glow flex items-center justify-center gap-2 text-sm uppercase tracking-wider active:scale-98 transition-all disabled:opacity-50"
              >
                <ShieldCheck className="w-5 h-5" />
                {isLoading ? 'AUTENTICANDO NO SUPABASE...' : 'ENTRAR COMO ADMIN'}
              </button>
            </form>
          )}

        </div>

        {/* Footer info */}
        <div className="text-center text-xs text-industrial-textMuted font-mono">
          Indústria Amendobento S/A • Sistema de Inteligência Artificial
        </div>

      </div>
    </div>
  );
};

