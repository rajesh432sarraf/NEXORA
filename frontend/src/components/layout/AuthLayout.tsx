import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sparkles, ShieldCheck, Activity } from 'lucide-react';

const AuthLayout: React.FC = () => {
  return (
    <div
      className="min-h-screen text-obsidian-text-primary flex items-center justify-center p-4 md:p-8 relative overflow-hidden"
      style={{ background: '#EBF0EC' }}
    >
      {/* Dot-weave background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(90,145,120,0.12) 1px, transparent 1px)',
          backgroundSize: '28px 28px'
        }}
      />

      {/* Diagonal cloth panels — sage & mint */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Left: pale mint diagonal */}
        <div
          className="absolute"
          style={{
            top: '-20%', left: '-15%',
            width: '55%', height: '140%',
            background: 'linear-gradient(145deg, rgba(203,216,210,0.7) 0%, rgba(181,206,196,0.35) 45%, transparent 70%)',
            transform: 'skewX(-8deg)',
            animation: 'platePulse 10s ease-in-out infinite alternate'
          }}
        />
        {/* Right: medium sage diagonal */}
        <div
          className="absolute"
          style={{
            top: '-20%', right: '-15%',
            width: '50%', height: '140%',
            background: 'linear-gradient(225deg, rgba(90,145,120,0.22) 0%, rgba(74,138,106,0.12) 45%, transparent 70%)',
            transform: 'skewX(8deg)',
            animation: 'platePulse 12s ease-in-out infinite alternate-reverse'
          }}
        />
        {/* Soft center vignette */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 50%, rgba(235,240,236,0.5) 100%)'
          }}
        />
      </div>

      <div className="w-full max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center relative z-10">
        {/* Left Branding */}
        <div className="hidden lg:flex flex-col space-y-7 pr-6">
          <div className="flex items-center justify-center w-[360px] h-[110px] mb-6">
            <img
              src="/logo.png?v=8"
              alt="NEXORA Logo"
              className="w-full h-full object-contain transition-all duration-300 hover:scale-105"
            />
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight leading-snug">
            <span className="text-obsidian-text-primary">AI-Driven Decision</span>
            <br />
            <span
              style={{
                background: 'linear-gradient(135deg, #2D6B4A, #5A9178, #7DAF95)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              Support for EPC Projects
            </span>
          </h1>

          <p className="text-sm text-obsidian-text-secondary leading-relaxed">
            Unify project specifications, vendor proposals, compliance evaluation, and procurement risk intelligence into one intelligent command center.
          </p>

          <div className="space-y-3 pt-4" style={{ borderTop: '1px solid rgba(196,212,201,0.8)' }}>
            {[
              { icon: <Sparkles className="w-4 h-4" />, text: 'Gemini RAG & Vector Document Search', bg: 'rgba(90,145,120,0.12)', border: 'rgba(90,145,120,0.3)', color: '#2D6B4A' },
              { icon: <ShieldCheck className="w-4 h-4" />, text: 'Role-Based Access & JWT Security', bg: 'rgba(74,138,106,0.1)', border: 'rgba(74,138,106,0.28)', color: '#2D6B4A' },
              { icon: <Activity className="w-4 h-4" />, text: 'Real-Time EPC Procurement Analytics', bg: 'rgba(203,216,210,0.5)', border: 'rgba(90,145,120,0.3)', color: '#4A8A6A' },
            ].map((feat, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div
                  className="p-2 rounded-xl flex-shrink-0"
                  style={{ background: feat.bg, border: `1px solid ${feat.border}`, color: feat.color }}
                >
                  {feat.icon}
                </div>
                <span className="text-xs text-obsidian-text-secondary">{feat.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Form */}
        <div className="w-full">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
