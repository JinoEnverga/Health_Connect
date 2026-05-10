// src/pages/Register.jsx  ← REPLACE your existing file
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MdLocalHospital, MdPerson, MdEmail, MdLock, MdVisibility, MdVisibilityOff, MdCheckCircle } from 'react-icons/md';

export default function Register() {
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [showPw, setShowPw]   = useState(false);
  const [errors, setErrors]   = useState({});
  const [success, setSuccess] = useState(false);
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!form.fullName.trim())  e.fullName = 'Full name is required.';
    if (!form.email.trim())     e.email    = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email.';
    if (!form.password)         e.password = 'Password is required.';
    else if (form.password.length < 6) e.password = 'Password must be at least 6 characters.';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match.';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    const res = await register(form);
    if (res.success) {
      // Supabase may send a confirmation email — show a message first
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 1500);
    } else {
      setErrors({ general: res.message });
    }
  };

  const set = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    setErrors(er => ({ ...er, [field]: '', general: '' }));
  };

  const passwordStrength = () => {
    if (!form.password) return 0;
    let s = 0;
    if (form.password.length >= 6)  s++;
    if (form.password.length >= 10) s++;
    if (/[A-Z]/.test(form.password)) s++;
    if (/[0-9]/.test(form.password)) s++;
    return s;
  };
  const strength = passwordStrength();
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength];
  const strengthColor = ['', 'bg-red-400', 'bg-amber-400', 'bg-teal-400', 'bg-green-500'][strength];

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-primary-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MdCheckCircle className="text-green-500 text-5xl" />
          </div>
          <h2 className="text-2xl font-display font-bold text-slate-800 mb-2">Account Created!</h2>
          <p className="text-slate-500 text-sm">Redirecting you to your dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-primary-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-teal-100 rounded-full blur-3xl opacity-40" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-primary-100 rounded-full blur-3xl opacity-40" />
      </div>

      <div className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-600 rounded-2xl shadow-lg mb-4">
            <MdLocalHospital className="text-white text-3xl" />
          </div>
          <h1 className="text-3xl font-display font-bold text-slate-800">HealthConnect</h1>
          <p className="text-slate-500 mt-1 text-base">Create your patient account</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
          <h2 className="text-2xl font-display font-bold text-slate-800 mb-1">Get started</h2>
          <p className="text-slate-500 mb-6 text-sm">Fill in your details to create an account</p>

          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-4 text-sm flex items-center gap-2">
              <span>⚠</span> {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="label">Full Name</label>
              <div className="relative">
                <MdPerson className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
                <input type="text" value={form.fullName} onChange={set('fullName')}
                  placeholder="Juan dela Cruz" className={`input-field pl-11 ${errors.fullName ? 'border-red-400' : ''}`} />
              </div>
              {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <MdEmail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
                <input type="email" value={form.email} onChange={set('email')}
                  placeholder="juan@email.com" className={`input-field pl-11 ${errors.email ? 'border-red-400' : ''}`} />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <MdLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
                <input type={showPw ? 'text' : 'password'} value={form.password} onChange={set('password')}
                  placeholder="At least 6 characters" className={`input-field pl-11 pr-11 ${errors.password ? 'border-red-400' : ''}`} />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPw ? <MdVisibilityOff className="text-xl" /> : <MdVisibility className="text-xl" />}
                </button>
              </div>
              {form.password && (
                <div className="mt-2">
                  <div className="flex gap-1">
                    {[1,2,3,4].map(i => (
                      <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= strength ? strengthColor : 'bg-slate-200'}`} />
                    ))}
                  </div>
                  <p className={`text-xs mt-1 font-medium ${strength <= 1 ? 'text-red-500' : strength === 2 ? 'text-amber-500' : 'text-green-600'}`}>
                    {strengthLabel}
                  </p>
                </div>
              )}
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="label">Confirm Password</label>
              <div className="relative">
                <MdLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
                <input type="password" value={form.confirmPassword} onChange={set('confirmPassword')}
                  placeholder="Re-enter your password" className={`input-field pl-11 ${errors.confirmPassword ? 'border-red-400' : ''}`} />
                {form.confirmPassword && form.password === form.confirmPassword && (
                  <MdCheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500 text-xl" />
                )}
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>

            <div className="flex items-start gap-2 pt-1">
              <input type="checkbox" id="terms" className="w-4 h-4 mt-0.5 rounded text-primary-600" defaultChecked />
              <label htmlFor="terms" className="text-xs text-slate-500 cursor-pointer">
                I agree to the <span className="text-primary-600 font-semibold">Terms of Service</span> and{' '}
                <span className="text-primary-600 font-semibold">Privacy Policy</span>
              </label>
            </div>

            <button type="submit" disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2">
              {isLoading ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Creating account…
                </>
              ) : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
