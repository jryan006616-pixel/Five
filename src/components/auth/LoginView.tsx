import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RhinomdsLogo } from '../common/RhinomdsLogo';
import {
  ShieldCheck,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Stethoscope,
  Shield,
  HelpCircle,
  Copy,
  Check,
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const { allUsers, login } = useApp();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('Admin@123');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCheatSheet, setShowCheatSheet] = useState(true);
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    setTimeout(() => {
      const res = login(username, password);
      if (!res.success) {
        setErrorMsg(res.error || 'Invalid credentials. Please verify username and password.');
      }
      setIsLoading(false);
    }, 350);
  };

  const handleSelectDemoCredentials = (uUsername: string, uPassword: string) => {
    setUsername(uUsername);
    setPassword(uPassword || '');
    setErrorMsg('');
  };

  const handleCopyCredentials = (uUsername: string, uPassword: string, id: string) => {
    navigator.clipboard.writeText(`Username: ${uUsername} | Password: ${uPassword}`);
    setCopiedAccount(id);
    setTimeout(() => setCopiedAccount(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Futuristic Background Ambient Glows & Tech Grid */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-sky-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b10_1px,transparent_1px),linear-gradient(to_bottom,#1e293b10_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center mb-5">
          <RhinomdsLogo size="lg" />
        </div>
        <h2 className="text-center text-2xl font-bold font-['Space_Grotesk'] text-white tracking-tight">
          Enterprise Employee Portal
        </h2>
        <p className="mt-1 text-center text-xs text-slate-400">
          Medical Billing & Revenue Cycle Management Workforce
        </p>
      </div>

      <div className="mt-7 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-[#0f172a]/95 backdrop-blur-xl py-7 px-6 sm:px-8 shadow-2xl rounded-3xl border border-slate-800">
          
          <form className="space-y-4" onSubmit={handleLogin}>
            {errorMsg && (
              <div className="flex items-start gap-2.5 p-3 text-xs text-red-300 bg-red-950/70 border border-red-800/80 rounded-xl animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1 leading-relaxed">
                  <p className="font-semibold text-red-200">Authentication Failed</p>
                  <p className="text-[11px] text-red-300/90">{errorMsg}</p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Username, Email, or Employee ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="e.g. admin.sarah or tariq.mahmood or EMP-1001"
                  className="block w-full pl-9 pr-3 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-colors font-mono"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Password
                </label>
                <span className="text-[10px] text-cyan-400/80">
                  Admin-Assigned
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your assigned password"
                  className="block w-full pl-9 pr-10 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-colors font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500"
                />
                <span>Remember session</span>
              </label>
              <button
                type="button"
                onClick={() => setErrorMsg('Passwords are set and managed by HR Admin (Sarah Jenkins). Please view the credentials directory below or contact HR.')}
                className="text-cyan-400 text-[11px] hover:underline cursor-pointer"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 shadow-lg shadow-cyan-600/30 transition-all cursor-pointer disabled:opacity-50 mt-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In with Credentials</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Admin Assigned User Credentials Reference Directory */}
          <div className="mt-6 pt-5 border-t border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
                <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  Admin-Assigned User Passwords
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCheatSheet(!showCheatSheet)}
                className="text-[10px] text-cyan-400 hover:text-cyan-300 font-semibold"
              >
                {showCheatSheet ? 'Hide Directory' : 'Show Directory'}
              </button>
            </div>

            {showCheatSheet && (
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {allUsers.map(u => (
                  <div
                    key={u.id}
                    className="p-2 rounded-xl bg-slate-900/80 border border-slate-800/90 hover:border-cyan-700/60 transition-all flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={u.avatar}
                        alt={u.fullName}
                        className="w-7 h-7 rounded-lg object-cover border border-slate-700 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="font-bold text-slate-200 truncate text-[11px]">{u.fullName}</p>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                              u.role === 'admin'
                                ? 'bg-amber-950 text-amber-400 border border-amber-800'
                                : 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                            }`}
                          >
                            {u.role === 'admin' ? 'Admin' : 'Staff'}
                          </span>
                        </div>
                        <p className="text-[10px] font-mono text-slate-400 truncate">
                          User: <strong className="text-cyan-300">@{u.username}</strong> • Pass: <strong className="text-emerald-400">{u.password}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      <button
                        type="button"
                        onClick={() => handleCopyCredentials(u.username, u.password || '', u.id)}
                        className="p-1 text-slate-500 hover:text-cyan-400 rounded-md hover:bg-slate-800"
                        title="Copy credentials"
                      >
                        {copiedAccount === u.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSelectDemoCredentials(u.username, u.password || '')}
                        className="px-2 py-1 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 font-bold text-[10px] cursor-pointer"
                      >
                        Autofill
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* HIPAA & Enterprise Compliance Footer */}
          <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-center gap-2 text-[10px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>HIPAA Compliant • Admin Governed User Authentication</span>
          </div>
        </div>
      </div>
    </div>
  );
};
