import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, Shield, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { UserRole } from '../../types/auth';

const registerSchema = z.object({
  full_name: z.string().min(2, 'Full name is required'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['ADMIN', 'PROJECT_MANAGER', 'PROCUREMENT', 'ENGINEER', 'VIEWER']),
});

type RegisterFormData = z.infer<typeof registerSchema>;

const RegisterPage: React.FC = () => {
  const { register: registerAuth, isLoading } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      full_name: '',
      email: '',
      password: '',
      role: 'PROJECT_MANAGER',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerAuth(data);
      navigate('/dashboard');
    } catch (err) {
      // Error handled in AuthContext Toast
    }
  };

  return (
    <div className="glass-card p-6 md:p-8 rounded-obsidian border border-obsidian-border/80 shadow-glass w-full">
      <div className="mb-6 text-center lg:text-left">
        <h2 className="text-xl font-bold text-obsidian-text-primary">Create Obsidian Account</h2>
        <p className="text-xs text-obsidian-text-secondary mt-1">
          Register to access the EPC Decision Support System.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
        {/* Full Name */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-obsidian-text-secondary block">Full Name</label>
          <div className="relative">
            <UserIcon className="w-4 h-4 absolute left-3 top-3 text-obsidian-text-muted" />
            <input
              type="text"
              {...register('full_name')}
              placeholder="Rajesh Sarraf"
              className="w-full pl-9 pr-4 py-2 text-xs rounded-obsidian glass-input"
            />
          </div>
          {errors.full_name && (
            <span className="text-[11px] text-obsidian-danger font-medium">{errors.full_name.message}</span>
          )}
        </div>

        {/* Email */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-obsidian-text-secondary block">Work Email</label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3 top-3 text-obsidian-text-muted" />
            <input
              type="email"
              {...register('email')}
              placeholder="sarraf@nexora-epc.com"
              className="w-full pl-9 pr-4 py-2 text-xs rounded-obsidian glass-input"
            />
          </div>
          {errors.email && (
            <span className="text-[11px] text-obsidian-danger font-medium">{errors.email.message}</span>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-obsidian-text-secondary block">Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3 top-3 text-obsidian-text-muted" />
            <input
              type="password"
              {...register('password')}
              placeholder="••••••••"
              className="w-full pl-9 pr-4 py-2 text-xs rounded-obsidian glass-input"
            />
          </div>
          {errors.password && (
            <span className="text-[11px] text-obsidian-danger font-medium">{errors.password.message}</span>
          )}
        </div>

        {/* Role Selector */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-obsidian-text-secondary block">Platform Role</label>
          <div className="relative">
            <Shield className="w-4 h-4 absolute left-3 top-3 text-obsidian-text-muted" />
            <select
              {...register('role')}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-obsidian glass-input bg-obsidian-surface text-obsidian-text-primary"
            >
              <option value="PROJECT_MANAGER" className="bg-[#171717] text-[#F8F8F8]">Project Manager (Full Access)</option>
              <option value="PROCUREMENT" className="bg-[#171717] text-[#F8F8F8]">Procurement Specialist</option>
              <option value="ENGINEER" className="bg-[#171717] text-[#F8F8F8]">Specification Engineer</option>
              <option value="ADMIN" className="bg-[#171717] text-[#F8F8F8]">System Administrator</option>
              <option value="VIEWER" className="bg-[#171717] text-[#F8F8F8]">Viewer (Read-Only)</option>
            </select>
          </div>
          {errors.role && (
            <span className="text-[11px] text-obsidian-danger font-medium">{errors.role.message}</span>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 px-4 bg-gradient-to-r from-obsidian-emerald to-obsidian-ai text-[#0D0D0D] font-bold text-xs rounded-obsidian shadow-emerald-glow hover:opacity-95 transition-all flex items-center justify-center space-x-2 mt-5 disabled:opacity-50"
        >
          {isLoading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <>
              <span>Create Account</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-5 text-center border-t border-obsidian-border/50 pt-4">
        <p className="text-xs text-obsidian-text-muted">
          Already have an account?{' '}
          <Link to="/login" className="text-obsidian-emerald font-semibold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
