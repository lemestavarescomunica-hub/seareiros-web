'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { CookingPot, Heart, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showSenha, setShowSenha] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !senha) { toast.error('Preencha todos os campos.'); return; }
    setIsLoading(true);
    try {
      const result = await signIn('credentials', { email, senha, redirect: false });
      if (result?.error) {
        toast.error('Email ou senha incorretos.');
      } else {
        toast.success('Bem-vinda! 🙏');
        router.push('/dashboard');
      }
    } catch {
      toast.error('Erro ao conectar. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm animate-in">
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-24 h-24 rounded-full bg-primary flex items-center justify-center mb-4 shadow-card-md">
            <CookingPot size={44} className="text-white" />
            <Heart size={16} className="absolute bottom-3 right-3 text-accent fill-accent" />
          </div>
          <h1 className="text-3xl font-bold text-primary">Seareiros</h1>
          <p className="text-text-secondary text-sm mt-1">Gestão da Cozinha</p>
          <p className="text-text-secondary text-xs mt-1 text-center">Grupo Espírita Seareiros do Bem</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-surface rounded-card shadow-card p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-1.5">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-border rounded-xl text-text-primary bg-background focus:ring-2 focus:ring-primary focus:border-primary outline-none transition text-sm"
                placeholder="seu@email.com" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-1.5">Senha</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
              <input type={showSenha ? 'text' : 'password'} value={senha} onChange={e => setSenha(e.target.value)}
                className="w-full pl-9 pr-10 py-2.5 border border-border rounded-xl text-text-primary bg-background focus:ring-2 focus:ring-primary focus:border-primary outline-none transition text-sm"
                placeholder="••••••" />
              <button type="button" onClick={() => setShowSenha(!showSenha)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition">
                {showSenha ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={isLoading}
            className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl transition-colors disabled:opacity-60 mt-2">
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
