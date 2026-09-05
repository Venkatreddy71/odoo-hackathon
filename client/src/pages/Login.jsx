import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Calculator, Lock, Mail, ArrowRight, ShieldCheck, Eye, EyeOff, User, UserPlus, LogIn } from 'lucide-react';

export default function Login() {
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      addToast(`Welcome back, ${user.email}`, 'success');
      navigate('/');
    } catch (err) {
      addToast(err.response?.data?.message || 'Login failed. Please check credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const setDemoCredentials = (roleEmail, rolePass) => {
    setEmail(roleEmail);
    setPassword(rolePass);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Dynamic Background Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Brand Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-xl shadow-indigo-500/30 mb-4 ring-1 ring-white/20">
            <Calculator className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            PeoplePay<span className="text-indigo-400">360</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">Integrated HR & Payroll Management System</p>
        </div>

        {/* Card Container */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-8 shadow-2xl backdrop-blur-xl space-y-6">
          {/* SIGN IN FORM */}

          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@peoplepay360.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 transition focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4 text-indigo-400" /> : <Eye className="w-4 h-4 text-slate-400" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold rounded-xl text-xs transition shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  Sign In to PeoplePay360 <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="bg-indigo-950/30 border border-indigo-800/40 rounded-xl p-3 text-[11px] text-slate-400 flex items-start gap-2">
            <Mail className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <span>
              <strong>Note:</strong> Employee accounts and login credentials are issued by HR Administrators via email dispatch. Contact your HR manager if you haven't received your credentials.
            </span>
          </div>


          {/* Quick Demo Credentials Assistant */}
          <div className="pt-4 border-t border-slate-800">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-400" /> Quick Demo Role Logins
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setDemoCredentials('admin@peoplepay360.com', 'admin123')}
                className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 text-left transition"
              >
                <div className="font-semibold text-indigo-400">Admin</div>
                <div className="text-[10px] text-slate-400">admin@peoplepay360.com</div>
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials('hr@peoplepay360.com', 'hr123')}
                className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 text-left transition"
              >
                <div className="font-semibold text-emerald-400">HR Manager</div>
                <div className="text-[10px] text-slate-400">hr@peoplepay360.com</div>
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials('payroll@peoplepay360.com', 'payroll123')}
                className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 text-left transition"
              >
                <div className="font-semibold text-amber-400">Payroll User</div>
                <div className="text-[10px] text-slate-400">payroll@peoplepay360.com</div>
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials('arav@peoplepay360.com', 'employee123')}
                className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 text-left transition"
              >
                <div className="font-semibold text-purple-400">Arav (Employee)</div>
                <div className="text-[10px] text-slate-400">arav@peoplepay360.com</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
