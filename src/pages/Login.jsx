import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAppContext } from '../context/AppContext';
import {
  Shield, User, Lock, Eye, EyeOff, ArrowRight,
  AlertCircle, Volume2, VolumeX, Sparkles, Terminal, Activity
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════════════════
   Synthesized Web Audio SFX Engine (Zero Asset Loading, Zero Latency)
   ═══════════════════════════════════════════════════════════════════════════ */
let audioCtx = null;

const getAudioContext = () => {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
};

const playTone = (freq, { type = 'sine', duration = 0.08, gain = 0.04, ramp = null } = {}) => {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const now = ctx.currentTime;

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (ramp) {
      osc.frequency.exponentialRampToValueAtTime(ramp, now + duration);
    }

    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.linearRampToValueAtTime(gain, now + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.02);
  } catch {}
};

const sfx = {
  hover: () => playTone(1200, { type: 'sine', duration: 0.04, gain: 0.015 }),
  type: () => playTone(800 + Math.random() * 400, { type: 'triangle', duration: 0.025, gain: 0.02 }),
  focus: () => playTone(440, { type: 'sine', duration: 0.09, gain: 0.02, ramp: 660 }),
  click: () => playTone(980, { type: 'sine', duration: 0.06, gain: 0.03, ramp: 490 }),
  success: () => {
    playTone(523.25, { type: 'sine', duration: 0.15, gain: 0.04 });
    setTimeout(() => playTone(659.25, { type: 'sine', duration: 0.18, gain: 0.04 }), 70);
    setTimeout(() => playTone(783.99, { type: 'sine', duration: 0.25, gain: 0.05 }), 140);
  },
  error: () => {
    playTone(220, { type: 'sawtooth', duration: 0.14, gain: 0.04, ramp: 140 });
  }
};

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { fetchApps } = useAppContext();

  const [form, setForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem('cx_sfx') !== 'false';
  });

  const canvasRef = useRef(null);
  const cardRef = useRef(null);
  const userRef = useRef(null);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    localStorage.setItem('cx_sfx', String(next));
    if (next) sfx.click();
  };

  const triggerSfx = useCallback((action) => {
    if (soundEnabled && sfx[action]) {
      sfx[action]();
    }
  }, [soundEnabled]);

  /* ── Interactive Particle Mesh Background ─────────────────────────────── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const onResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);

    const particles = [];
    const count = Math.min(65, Math.floor((width * height) / 18000));
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: Math.random() * 1.6 + 0.8,
        alpha: Math.random() * 0.4 + 0.2
      });
    }

    let mouse = { x: width / 2, y: height / 2, active: false };
    const onMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };
    window.addEventListener('mousemove', onMouseMove);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Particle physics & rendering
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Subtle pull to mouse
        if (mouse.active) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 180) {
            p.x += (dx / dist) * 0.35;
            p.y += (dy / dist) * 0.35;
          }
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(96, 165, 250, ${p.alpha})`;
        ctx.fill();

        // Connect nearby nodes
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 110) {
            const alpha = (1 - dist / 110) * 0.18;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(147, 197, 253, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, []);

  /* ── 3D Spotlight Tilt Effect on Card ─────────────────────────────────── */
  const onCardMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current.style.setProperty('--mouse-x', `${x}px`);
    cardRef.current.style.setProperty('--mouse-y', `${y}px`);
  };

  const setField = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    triggerSfx('type');
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!form.username.trim() || !form.password) {
      triggerSfx('error');
      setError('Please provide both username and password.');
      return;
    }

    triggerSfx('click');
    setError('');
    setLoading(true);

    try {
      await login(form.username.trim(), form.password);
      if (fetchApps) {
        await fetchApps();
      }
      triggerSfx('success');
      navigate('/app/manage-apps');
    } catch (err) {
      triggerSfx('error');
      setError(err.response?.data?.message || err.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#07070a] text-white flex flex-col justify-between overflow-hidden selection:bg-blue-600 selection:text-white">
      {/* Interactive Particle Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-0 opacity-70"
      />

      {/* Ambient Radial Lights */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-blue-600/15 rounded-full blur-[140px]" />
        <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[500px] h-[350px] bg-indigo-600/10 rounded-full blur-[130px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#07070a_90%)]" />
      </div>

      {/* Top Navbar */}
      <header className="relative z-10 w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link
          to="/"
          onMouseEnter={() => triggerSfx('hover')}
          className="flex items-center gap-3 group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25 border border-blue-400/30 group-hover:scale-105 group-hover:shadow-blue-500/40 transition-all duration-300">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-wider uppercase text-white">COREXIS</span>
            <span className="ml-2 text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30">
              PRIVATE
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          {/* Audio Toggle */}
          <button
            type="button"
            onClick={toggleSound}
            aria-label={soundEnabled ? 'Mute SFX' : 'Enable SFX'}
            title={soundEnabled ? 'Mute Sound FX' : 'Enable Sound FX'}
            className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white flex items-center justify-center transition-all"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-blue-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-zinc-500" />
            )}
          </button>

          <Link
            to="/"
            onMouseEnter={() => triggerSfx('hover')}
            className="text-xs font-medium px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 transition-all flex items-center gap-1.5"
          >
            Home
          </Link>
        </div>
      </header>

      {/* Centered Login Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-[420px]">
          {/* Card Container with Dynamic Spotlight */}
          <div
            ref={cardRef}
            onMouseMove={onCardMouseMove}
            className="group relative bg-[#0c0c12]/90 backdrop-blur-2xl border border-white/10 hover:border-blue-500/30 rounded-3xl p-7 sm:p-9 shadow-2xl shadow-black/90 transition-all duration-500 overflow-hidden"
          >
            {/* Dynamic Cursor Spotlight Overlay */}
            <div
              className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"
              style={{
                background:
                  'radial-gradient(400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(59, 130, 246, 0.12), transparent 70%)'
              }}
            />

            {/* Glowing Accent Rim */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-[1px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-60" />

            {/* Card Header */}
            <div className="text-center mb-7 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] font-mono mb-4 animate-pulse">
                <Activity className="w-3.5 h-3.5" />
                <span>OPERATOR ACCESS // v1.3</span>
              </div>

              <h1 className="text-3xl font-extrabold text-white tracking-tight">
                Welcome <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">Back</span>
              </h1>
              <p className="text-zinc-400 text-xs sm:text-sm mt-1.5 font-normal">
                Authenticate to initialize secure control panel
              </p>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2.5 animate-in fade-in slide-in-from-top-1 duration-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
              {/* Username Input */}
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5" htmlFor="log-user">
                  Username
                </label>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500 group-focus-within/input:text-blue-400 transition-colors">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    ref={userRef}
                    id="log-user"
                    type="text"
                    autoComplete="username"
                    required
                    placeholder="Enter your username"
                    value={form.username}
                    onChange={setField('username')}
                    onFocus={() => triggerSfx('focus')}
                    className="w-full pl-10 pr-4 py-3 bg-[#13131c] border border-white/10 group-focus-within/input:border-blue-500/60 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-zinc-400" htmlFor="log-pass">
                    Password
                  </label>
                </div>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500 group-focus-within/input:text-blue-400 transition-colors">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="log-pass"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={setField('password')}
                    onFocus={() => triggerSfx('focus')}
                    className="w-full pl-10 pr-11 py-3 bg-[#13131c] border border-white/10 group-focus-within/input:border-blue-500/60 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setShowPassword(!showPassword);
                      triggerSfx('click');
                    }}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-500 hover:text-zinc-200 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Sign In CTA Button */}
              <button
                type="submit"
                disabled={loading}
                onMouseEnter={() => triggerSfx('hover')}
                className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-xl shadow-blue-600/30 border border-blue-400/30 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed group/btn"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Verifying session...</span>
                  </>
                ) : (
                  <>
                    <span>Enter Console</span>
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6 z-10">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/5" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-[#0c0c12] text-zinc-500">or</span>
              </div>
            </div>

            {/* Register Link */}
            <div className="text-center relative z-10">
              <Link
                to="/register"
                onMouseEnter={() => triggerSfx('hover')}
                onClick={() => triggerSfx('click')}
                className="inline-flex items-center justify-center w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white font-medium text-xs border border-white/10 hover:border-white/20 transition-all"
              >
                Register New Operator Account
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-6xl mx-auto px-6 py-6 text-center text-xs text-zinc-600 flex items-center justify-between border-t border-white/5">
        <div className="flex items-center gap-2 font-mono">
          <Terminal className="w-3.5 h-3.5 text-zinc-500" />
          <span>COREXIS ENCRYPTED ARCHITECTURE</span>
        </div>
        <div className="text-zinc-500 font-mono">
          <span>SUPABASE POSTGRES // 100% UNLOCKED</span>
        </div>
      </footer>
    </div>
  );
}
