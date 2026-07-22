import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginPage: React.FC = () => {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login({ username: data.email, password: data.password });
      navigate('/dashboard');
    } catch (err) {
      // Error handled in AuthContext Toast
    }
  };

  return (
    <div
      className="p-6 md:p-8 rounded-2xl w-full"
      style={{
        background: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(196,212,201,0.8)',
        boxShadow: '0 4px 32px rgba(74,99,85,0.12), 0 1px 0 rgba(255,255,255,0.8)'
      }}
    >
      <div className="mb-6 text-center lg:text-left">
        <h2 className="text-xl font-bold text-obsidian-text-primary">Sign in to NEXORA</h2>
        <p className="text-xs text-obsidian-text-secondary mt-1">
          Enter your executive credentials to access the platform.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email Field */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-obsidian-text-secondary block">Email Address</label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3 top-3 text-obsidian-text-muted" />
            <input
              type="email"
              {...register('email')}
              placeholder="user@nexora-epc.com"
              className="w-full pl-9 pr-4 py-2 text-xs rounded-obsidian glass-input"
            />
          </div>
          {errors.email && (
            <span className="text-[11px] text-obsidian-danger font-medium">{errors.email.message}</span>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-xs font-medium text-obsidian-text-secondary block">Password</label>
            <a href="#forgot" className="text-[11px] text-obsidian-emerald hover:underline">
              Forgot password?
            </a>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3 top-3 text-obsidian-text-muted" />
            <input
              type={showPassword ? 'text' : 'password'}
              {...register('password')}
              placeholder="••••••••"
              className="w-full pl-9 pr-10 py-2 text-xs rounded-obsidian glass-input"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-obsidian-text-muted hover:text-obsidian-text-primary"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <span className="text-[11px] text-obsidian-danger font-medium">{errors.password.message}</span>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 px-4 font-bold text-xs rounded-xl text-white flex items-center justify-center space-x-2 mt-6 disabled:opacity-50 transition-all"
          style={{
            background: 'linear-gradient(135deg, #4A8A6A, #5A9178)',
            boxShadow: '0 0 16px rgba(74,138,106,0.3)'
          }}
        >
          {isLoading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center border-t border-obsidian-border/50 pt-4">
        <p className="text-xs text-obsidian-text-muted">
          Don't have an account?{' '}
          <Link to="/register" className="text-obsidian-emerald font-semibold hover:underline">
            Create an Account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
