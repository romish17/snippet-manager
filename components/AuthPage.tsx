import React, { useState } from 'react';
import { Shield, User, Mail, Lock, LogIn, UserPlus } from 'lucide-react';

interface AuthPageProps {
  onAuth: (token: string, user: any) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onAuth }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const body = isLogin
        ? { username, password }
        : { username, email, password };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Authentication failed');
        setLoading(false);
        return;
      }

      // Store token and user info
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Call parent callback
      onAuth(data.token, data.user);
    } catch (err) {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="w-full max-w-md">
        {/* Logo / Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4 shadow-lg shadow-primary/30">
            <Shield size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">DevSnippet Manager</h1>
          <p className="text-slate-400">Gérez vos snippets en toute sécurité</p>
        </div>

        {/* Auth Form */}
        <div className="bg-surface border border-slate-700 rounded-2xl p-8 shadow-2xl animate-fade-in">
          <div className="flex gap-2 mb-6 bg-slate-900 rounded-lg p-1">
            <button
              type="button"
              onClick={() => {
                setIsLogin(true);
                setError('');
              }}
              className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                isLogin
                  ? 'bg-primary text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Connexion
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLogin(false);
                setError('');
              }}
              className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                !isLogin
                  ? 'bg-primary text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Inscription
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Nom d'utilisateur
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="admin"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            {/* Email (Register only) */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="votre@email.com"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>
            )}

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Default Credentials Info (Login only) */}
            {isLogin && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-blue-400 text-xs">
                <strong>Compte par défaut:</strong> admin / admin
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-opacity-90 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              ) : (
                <>
                  {isLogin ? <LogIn size={20} /> : <UserPlus size={20} />}
                  {isLogin ? 'Se connecter' : "S'inscrire"}
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-500 text-sm mt-6">
          © 2026 DevSnippet Manager - Sécurisé avec JWT
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
