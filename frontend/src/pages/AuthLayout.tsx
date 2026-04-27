import { type ReactNode } from 'react'
import React from 'react'
import { useNavigate } from 'react-router-dom'

export const authStyles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Syne:wght@700;800&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'DM Sans', sans-serif; background: #0a0a0f; color: #f0f0f5; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes pulse { 0%,100% { opacity: 0.3; transform: scale(1); } 50% { opacity: 0.6; transform: scale(1.08); } }
  .auth-input {
    width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px; padding: 14px 16px; font-size: 15px; color: #f0f0f5;
    font-family: 'DM Sans', sans-serif; outline: none; transition: all 0.2s;
  }
  .auth-input::placeholder { color: rgba(240,240,245,0.3); }
  .auth-input:focus { border-color: rgba(124,92,252,0.6); background: rgba(124,92,252,0.06); box-shadow: 0 0 0 3px rgba(124,92,252,0.12); }
  .auth-input.error { border-color: rgba(239,68,68,0.6); background: rgba(239,68,68,0.05); }
  .btn-primary {
    width: 100%; background: #7c5cfc; color: #fff; border: none; border-radius: 12px;
    padding: 15px; font-size: 16px; font-weight: 500; cursor: pointer; transition: all 0.2s;
    font-family: 'DM Sans', sans-serif; letter-spacing: 0.2px;
  }
  .btn-primary:hover:not(:disabled) { background: #9478fd; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(124,92,252,0.35); }
  .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
  .btn-google {
    width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px; padding: 14px; font-size: 15px; color: #f0f0f5; cursor: pointer;
    transition: all 0.2s; font-family: 'DM Sans', sans-serif; display: flex; align-items: center; justify-content: center; gap: 10px;
  }
  .btn-google:hover { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.2); }
  .auth-link { color: #a78bfa; text-decoration: none; font-weight: 500; transition: color 0.2s; }
  .auth-link:hover { color: #c4b5fd; }
  .error-box { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.25); border-radius: 10px; padding: 12px 14px; font-size: 14px; color: #fca5a5; }
  .success-box { background: rgba(52,211,153,0.1); border: 1px solid rgba(52,211,153,0.25); border-radius: 10px; padding: 12px 14px; font-size: 14px; color: #6ee7b7; }
  .divider { display: flex; align-items: center; gap: 12px; }
  .divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: rgba(255,255,255,0.08); }
  .label { display: block; font-size: 13px; font-weight: 500; color: rgba(240,240,245,0.6); margin-bottom: 8px; letter-spacing: 0.3px; }
  .otp-input {
    width: 52px; height: 58px; text-align: center; font-size: 22px; font-weight: 600;
    background: rgba(255,255,255,0.05); border: 1.5px solid rgba(255,255,255,0.1);
    border-radius: 12px; color: #f0f0f5; outline: none; transition: all 0.2s; font-family: 'DM Sans', sans-serif;
  }
  .otp-input:focus { border-color: rgba(124,92,252,0.7); background: rgba(124,92,252,0.08); box-shadow: 0 0 0 3px rgba(124,92,252,0.15); }
  .otp-input.filled { border-color: rgba(124,92,252,0.5); color: #a78bfa; }
`

export default function AuthLayout({ children, title, subtitle }: { children: ReactNode; title: string; subtitle: React.ReactNode }) {
  const navigate = useNavigate()
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0f', padding: '24px', position: 'relative', overflow: 'hidden' }}>
      <style>{authStyles}</style>
      <div style={{ position: 'absolute', top: '15%', left: '5%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(124,92,252,0.12) 0%, transparent 70%)', animation: 'pulse 7s ease infinite', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: 350, height: 350, background: 'radial-gradient(circle, rgba(192,132,252,0.08) 0%, transparent 70%)', animation: 'pulse 9s ease infinite 3s', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 440, animation: 'fadeUp 0.5s ease', position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div onClick={() => navigate('/')} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 28 }}>
            <div style={{ width: 36, height: 36, background: '#7c5cfc', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>✦</div>
            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 20, color: '#f0f0f5' }}>HabitTracker</span>
          </div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 800, letterSpacing: -0.5, margin: '0 0 8px', color: '#f0f0f5' }}>{title}</h1>
          <p style={{ fontSize: 15, color: 'rgba(240,240,245,0.45)', lineHeight: 1.6 }}>{subtitle}</p>
        </div>

        {/* Card */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: '36px 32px' }}>
          {children}
        </div>
      </div>
    </div>
  )
}