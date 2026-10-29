import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAppContext } from '../context/AppContext';
import './Login.css';

/* ═══════════════════════════════════════════════════════════════════════════
   Sound engine – 100% synthesised with the Web Audio API (no audio files,
   except the optional /background-music.m4a you already have).
   ═══════════════════════════════════════════════════════════════════════════ */
let ctx = null;
let master = null;
let noiseBuf = null;

const ac = () => {
  if (!ctx) {
    try {
      const C = window.AudioContext || window.webkitAudioContext;
      ctx = new C();
      master = ctx.createGain();
      master.gain.value = 0.9;
      master.connect(ctx.destination);
    } catch {
      ctx = null;
    }
  }
  if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
};

const getNoise = (c) => {
  if (!noiseBuf) {
    noiseBuf = c.createBuffer(1, Math.floor(c.sampleRate * 0.8), c.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  return noiseBuf;
};

const tone = (freq, { dur = 0.1, type = 'sine', gain = 0.05, delay = 0, to = null, attack = 0.004 } = {}) => {
  const c = ac();
  if (!c) return;
  const t = c.currentTime + delay;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(gain, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g);
  g.connect(master);
  o.start(t);
  o.stop(t + dur + 0.02);
};

const burst = ({ freq = 2400, to = null, q = 2, dur = 0.03, gain = 0.12, delay = 0, type = 'bandpass' } = {}) => {
  const c = ac();
  if (!c) return;
  const t = c.currentTime + delay;
  const s = c.createBufferSource();
  s.buffer = getNoise(c);
  const f = c.createBiquadFilter();
  f.type = type;
  f.Q.value = q;
  f.frequency.setValueAtTime(freq, t);
  if (to) f.frequency.exponentialRampToValueAtTime(to, t + dur);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(gain, t + Math.min(0.008, dur / 3));
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(f);
  f.connect(g);
  g.connect(master);
  s.start(t, Math.random() * 0.15);
  s.stop(t + dur + 0.02);
};

let lastHover = 0;
const sfx = {
  hover() {
    const n = performance.now();
    if (n - lastHover < 80) return;
    lastHover = n;
    tone(1760, { dur: 0.03, type: 'triangle', gain: 0.012 });
  },
  key() {
    burst({ freq: 3000 + Math.random() * 1500, q: 3, dur: 0.018, gain: 0.06 });
  },
  focus() {
    tone(560, { dur: 0.1, gain: 0.028, to: 840 });
  },
  tick() {
    burst({ freq: 3400, q: 3, dur: 0.025, gain: 0.1 });
    tone(960, { dur: 0.05, type: 'triangle', gain: 0.024 });
  },
  click() {
    tone(740, { dur: 0.06, type: 'square', gain: 0.025 });
    tone(1110, { dur: 0.09, gain: 0.04, delay: 0.045 });
  },

  /** Rising energy hum while the core is held. Returns a handle. */
  startCharge() {
    const c = ac();
    if (!c) return null;
    const t = c.currentTime;
    const o1 = c.createOscillator();
    const o2 = c.createOscillator();
    const f = c.createBiquadFilter();
    const g = c.createGain();
    o1.type = 'sawtooth';
    o2.type = 'sine';
    o1.frequency.value = 70;
    o2.frequency.value = 140;
    f.type = 'lowpass';
    f.frequency.value = 260;
    f.Q.value = 6;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.02, t + 0.06);
    o1.connect(f);
    o2.connect(f);
    f.connect(g);
    g.connect(master);
    o1.start(t);
    o2.start(t);
    let done = false;
    return {
      set(p) {
        if (done) return;
        const n = c.currentTime;
        o1.frequency.setTargetAtTime(70 + p * 360, n, 0.04);
        o2.frequency.setTargetAtTime(140 + p * 900, n, 0.04);
        f.frequency.setTargetAtTime(260 + p * 3600, n, 0.05);
        g.gain.setTargetAtTime(0.02 + p * 0.07, n, 0.05);
      },
      stop(fast = false) {
        if (done) return;
        done = true;
        const n = c.currentTime;
        g.gain.cancelScheduledValues(n);
        g.gain.setTargetAtTime(0.0001, n, fast ? 0.02 : 0.07);
        o1.stop(n + 0.4);
        o2.stop(n + 0.4);
      }
    };
  },
  /** charge released too early */
  fizzle() {
    tone(420, { dur: 0.22, type: 'sawtooth', gain: 0.03, to: 70 });
  },
  /** core ignites */
  ignite() {
    tone(150, { dur: 0.75, gain: 0.3, to: 36, attack: 0.006 });
    burst({ freq: 5200, to: 160, q: 0.7, dur: 0.7, gain: 0.2, type: 'lowpass' });
    burst({ freq: 900, to: 5200, q: 1.1, dur: 0.35, gain: 0.08, delay: 0.02 });
    [523, 784, 1047, 1568].forEach((f, i) => tone(f, { dur: 0.5, gain: 0.035, delay: 0.06 + i * 0.07 }));
  },
  /** terminal unfolding */
  unfold() {
    burst({ freq: 300, to: 2400, q: 0.8, dur: 0.6, gain: 0.06 });
    tone(330, { dur: 0.5, gain: 0.025, to: 660, attack: 0.1 });
  },
  /** sealing the terminal again */
  seal() {
    tone(660, { dur: 0.3, gain: 0.04, to: 110 });
    burst({ freq: 2200, to: 260, q: 0.9, dur: 0.35, gain: 0.07 });
  },
  error() {
    tone(210, { dur: 0.15, type: 'sawtooth', gain: 0.06 });
    tone(158, { dur: 0.2, type: 'sawtooth', gain: 0.05, delay: 0.1 });
  },
  success() {
    [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, { dur: 0.16 + i * 0.03, gain: 0.05, delay: i * 0.075 }));
  }
};

/* ═══════════════════════════════════════════════════════════════════════════ */

const HOLD_SECONDS = 1.15; // how long the core must be held
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export default function Login() {
  const { login } = useAuth();
  const { fetchApps } = useAppContext();
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [shake, setShake] = useState('');
  const [open, setOpen] = useState(false);
  const [charging, setCharging] = useState(false);
  const [boom, setBoom] = useState(0);
  const [musicOn, setMusicOn] = useState(false);

  const stageRef = useRef(null);
  const coreRef = useRef(null);
  const canvasRef = useRef(null);
  const userRef = useRef(null);
  const audioRef = useRef(null);
  const openRef = useRef(false);
  const chargeRef = useRef(0); // read by the particle loop
  const burstRef = useRef(false); // set when the core ignites
  const hold = useRef({ active: false, p: 0, raf: 0, last: 0, snd: null });
  const timers = useRef([]);

  const later = (fn, ms) => {
    const id = setTimeout(fn, ms);
    timers.current.push(id);
  };

  /* lock page scroll behind the fixed stage */
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
      cancelAnimationFrame(hold.current.raf);
      hold.current.snd?.stop(true);
    },
    []
  );

  /* background music (default off, same file you already use) */
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio('/background-music.m4a');
      audioRef.current.loop = true;
      audioRef.current.volume = 0.25;
    }
    const a = audioRef.current;
    if (musicOn) a.play().catch(() => setMusicOn(false));
    else a.pause();
  }, [musicOn]);

  useEffect(
    () => () => {
      if (audioRef.current) audioRef.current.pause();
    },
    []
  );

  /* ── particles ────────────────────────────────────────────────────────── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const g = canvas.getContext('2d');
    if (!g) return undefined;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    let w = 0;
    let h = 0;
    let dpr = 1;
    let raf = 0;
    let parts = [];

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round(Math.min(110, Math.max(40, (w * h) / 14000)));
      parts = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        r: Math.random() * 1.5 + 0.4,
        hue: Math.random() < 0.65 ? 190 : Math.random() < 0.5 ? 262 : 312,
        a: Math.random() * 0.5 + 0.25
      }));
    };

    const frame = () => {
      raf = requestAnimationFrame(frame);
      g.clearRect(0, 0, w, h);
      const r = coreRef.current?.getBoundingClientRect();
      const cx = r ? r.left + r.width / 2 : w / 2;
      const cy = r ? r.top + r.height / 2 : h / 2;
      const charge = chargeRef.current;
      const explode = burstRef.current;
      burstRef.current = false;
      g.globalCompositeOperation = 'lighter';

      for (const p of parts) {
        const dx = cx - p.x;
        const dy = cy - p.y;
        const d = Math.hypot(dx, dy) || 1;

        if (explode) {
          const k = (Math.random() * 9 + 3) / (d / 120 + 1);
          p.vx -= (dx / d) * k;
          p.vy -= (dy / d) * k;
        }
        if (charge > 0.01) {
          const pull = charge * charge * 0.9;
          p.vx += (dx / d) * pull * 0.09;
          p.vy += (dy / d) * pull * 0.09;
          // slight swirl
          p.vx += (-dy / d) * pull * 0.05;
          p.vy += (dx / d) * pull * 0.05;
        }

        p.vx *= 0.985;
        p.vy *= 0.985;
        // keep a tiny ambient drift alive
        p.vx += (Math.random() - 0.5) * 0.01;
        p.vy += (Math.random() - 0.5) * 0.01;
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;

        const speed = Math.hypot(p.vx, p.vy);
        g.fillStyle = `hsla(${p.hue}, 100%, 70%, ${Math.min(1, p.a + speed * 0.12)})`;
        g.beginPath();
        g.arc(p.x, p.y, p.r + Math.min(speed * 0.25, 1.6), 0, 6.2832);
        g.fill();
      }
    };

    resize();
    window.addEventListener('resize', resize);
    if (!reduce) raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  /* ── hold-to-ignite ───────────────────────────────────────────────────── */
  const setP = (p) => {
    stageRef.current?.style.setProperty('--p', p.toFixed(4));
    chargeRef.current = p;
  };

  const ignite = useCallback(() => {
    const h = hold.current;
    h.active = false;
    h.snd?.stop();
    h.snd = null;
    setCharging(false);
    openRef.current = true;
    setOpen(true);
    setBoom((b) => b + 1);
    burstRef.current = true;
    sfx.ignite();
    later(sfx.unfold, 380);
    navigator.vibrate?.([18, 40, 30]);
    later(() => {
      if (window.matchMedia?.('(pointer: fine)').matches) userRef.current?.focus({ preventScroll: true });
    }, 1300);
  }, []);

  const tick = useCallback(
    (t) => {
      const h = hold.current;
      const dt = Math.min(0.05, (t - h.last) / 1000);
      h.last = t;
      if (h.active) h.p = Math.min(1, h.p + dt / HOLD_SECONDS);
      else h.p = Math.max(0, h.p - dt * 2.4);

      setP(h.p);
      h.snd?.set(h.p);

      if (h.active && h.p >= 1) ignite();

      if (h.p > 0 || h.active) {
        h.raf = requestAnimationFrame(tick);
      } else {
        h.raf = 0;
      }
    },
    [ignite]
  );

  const beginHold = () => {
    const h = hold.current;
    if (openRef.current || h.active) return;
    h.active = true;
    h.last = performance.now();
    h.snd = sfx.startCharge();
    setCharging(true);
    navigator.vibrate?.(8);
    if (!h.raf) h.raf = requestAnimationFrame(tick);
  };

  const endHold = () => {
    const h = hold.current;
    if (!h.active) return;
    h.active = false;
    setCharging(false);
    if (h.snd) {
      h.snd.stop();
      h.snd = null;
    }
    if (h.p > 0.12) sfx.fizzle();
  };

  const seal = useCallback(() => {
    if (!openRef.current || loading) return;
    openRef.current = false;
    setOpen(false);
    setNotice('');
    setInvalid(false);
    sfx.seal();
  }, [loading]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') seal();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [seal]);

  const onCoreKeyDown = (e) => {
    if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
      e.preventDefault();
      beginHold();
    }
  };
  const onCoreKeyUp = (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      endHold();
    }
  };

  /* ── form ─────────────────────────────────────────────────────────────── */
  const setField = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    if (invalid) setInvalid(false);
    if (notice) setNotice('');
  };

  const onKey = (e) => {
    if (e.key.length === 1 || e.key === 'Backspace') sfx.key();
  };

  const fail = (msg) => {
    setNotice(msg);
    setInvalid(true);
    setShake((s) => (s === 'a' ? 'b' : 'a'));
    sfx.error();
    navigator.vibrate?.([40, 30, 40]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!form.username.trim() || !form.password) {
      fail('Enter your username and password.');
      return;
    }

    setNotice('');
    setInvalid(false);
    setLoading(true);
    sfx.click();
    try {
      await login(form.username, form.password);
      await fetchApps();
      sfx.success();
      setBoom((b) => b + 1);
      burstRef.current = true;
      await sleep(450);
      navigate('/app/manage-apps');
    } catch (err) {
      fail(err.response?.data?.message || err.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  const filled = Boolean(form.username.trim() && form.password);
  const btnState = loading ? 'checking' : invalid ? 'invalid' : filled ? 'ready' : 'empty';

  return (
    <div ref={stageRef} className="cx-stage" data-open={open ? 'true' : 'false'}>
      {/* ── backdrop ── */}
      <div className="cx-bg" aria-hidden="true">
        <div className="cx-aurora" />
        <div className="cx-grid" />
        <canvas ref={canvasRef} className="cx-particles" />
        <div className="cx-vignette" />
      </div>
      {boom > 0 && <div key={boom} className="cx-flash" aria-hidden="true" />}

      <div className="cx-tag">COREXIS // access terminal</div>

      <button
        type="button"
        className="cx-music"
        aria-label="Background music"
        aria-pressed={musicOn}
        onMouseEnter={sfx.hover}
        onClick={() => {
          setMusicOn((v) => !v);
          sfx.tick();
        }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
          {!musicOn && <line x1="1" y1="1" x2="23" y2="23" />}
        </svg>
      </button>

      <div className="cx-scroll">
        <div className="cx-center">
          {/* ── the core ── */}
          <button
            ref={coreRef}
            type="button"
            className="cx-core"
            aria-label={open ? 'Core active' : 'Hold to open sign in'}
            aria-expanded={open}
            aria-controls="cx-panel"
            tabIndex={open ? -1 : 0}
            onPointerDown={(e) => {
              if (e.button !== undefined && e.button !== 0) return;
              e.currentTarget.setPointerCapture?.(e.pointerId);
              beginHold();
            }}
            onPointerUp={endHold}
            onPointerCancel={endHold}
            onKeyDown={onCoreKeyDown}
            onKeyUp={onCoreKeyUp}
            onBlur={endHold}
            onContextMenu={(e) => e.preventDefault()}
            onMouseEnter={open ? undefined : sfx.hover}
          >
            <svg className="cx-core__prog" viewBox="0 0 120 120" aria-hidden="true">
              <defs>
                <linearGradient id="cx-grad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#5ee7ff" />
                  <stop offset="0.55" stopColor="#8b5cff" />
                  <stop offset="1" stopColor="#ff4fd8" />
                </linearGradient>
              </defs>
              <circle className="cx-core__track" cx="60" cy="60" r="56" />
              <circle className="cx-core__bar" cx="60" cy="60" r="56" />
            </svg>
            <span className="cx-core__ring" aria-hidden="true" />
            <span className="cx-core__ring cx-core__ring--b" aria-hidden="true" />
            <span className="cx-core__orb" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3v8" />
                <path d="M6.4 6.6a8 8 0 1 0 11.2 0" />
              </svg>
            </span>
          </button>

          <div className="cx-intro" aria-hidden={open}>
            <div>
              <h2 className="cx-wordmark">COREXIS</h2>
              <p className="cx-hint" data-charging={charging}>
                {charging ? 'Charging…' : 'Hold the core to enter'}
              </p>
            </div>
          </div>

          {/* ── terminal ── */}
          <div id="cx-panel" className="cx-panel" aria-hidden={!open}>
            <div className="cx-panel__clip">
              <div className="cx-card" data-shake={shake || undefined}>
                <div className="cx-card__body">
                  <header className="cx-head cx-in" style={{ '--i': 0 }}>
                    <span className="cx-brand">
                      <i /> COREXIS
                    </span>
                    <span className="cx-chip">Secure link</span>
                    <button
                      type="button"
                      className="cx-lock"
                      aria-label="Seal terminal"
                      title="Seal terminal (Esc)"
                      onMouseEnter={sfx.hover}
                      onClick={seal}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 6 6 18" />
                        <path d="m6 6 12 12" />
                      </svg>
                    </button>
                  </header>

                  <h1 className="cx-h1 cx-in" style={{ '--i': 1 }}>
                    Sign in
                  </h1>
                  <p className="cx-sub cx-in" style={{ '--i': 2 }}>
                    Authenticate to access your workspace.
                  </p>

                  {notice && (
                    <div className="cx-notice" role="alert">
                      {notice}
                    </div>
                  )}

                  <form autoComplete="on" noValidate onSubmit={handleSubmit}>
                    <div className="cx-field cx-in" style={{ '--i': 3 }}>
                      <input
                        ref={userRef}
                        id="cxUsername"
                        name="username"
                        type="text"
                        placeholder=" "
                        autoComplete="username"
                        spellCheck={false}
                        value={form.username}
                        onChange={setField('username')}
                        onFocus={sfx.focus}
                        onKeyDown={onKey}
                      />
                      <label htmlFor="cxUsername">Username</label>
                      <svg className="cx-field__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      <span className="cx-field__line" />
                    </div>

                    <div className="cx-field cx-in" style={{ '--i': 4 }}>
                      <input
                        id="cxPassword"
                        name="password"
                        type={showPw ? 'text' : 'password'}
                        placeholder=" "
                        autoComplete="current-password"
                        value={form.password}
                        onChange={setField('password')}
                        onFocus={sfx.focus}
                        onKeyDown={onKey}
                      />
                      <label htmlFor="cxPassword">Password</label>
                      <svg className="cx-field__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                      <button
                        type="button"
                        className="cx-eye"
                        aria-label={showPw ? 'Hide password' : 'Show password'}
                        aria-pressed={showPw}
                        onMouseEnter={sfx.hover}
                        onClick={() => {
                          setShowPw((v) => !v);
                          sfx.tick();
                        }}
                      >
                        {showPw ? (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                            <line x1="1" y1="1" x2="23" y2="23" />
                          </svg>
                        ) : (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        )}
                      </button>
                      <span className="cx-field__line" />
                    </div>

                    <div className="cx-forgot-row cx-in" style={{ '--i': 5 }}>
                      <button type="button" className="cx-forgot" onMouseEnter={sfx.hover} onClick={sfx.tick}>
                        Forgot password?
                      </button>
                    </div>

                    <div className="cx-in" style={{ '--i': 6 }}>
                      <button
                        type="submit"
                        className="cx-btn"
                        data-state={btnState}
                        aria-disabled={btnState === 'empty' || btnState === 'checking'}
                        aria-busy={loading}
                        onMouseEnter={btnState === 'ready' ? sfx.hover : undefined}
                      >
                        <span>{loading ? 'Authenticating…' : 'Authenticate'}</span>
                        {!loading && (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M5 12h14" />
                            <path d="m12 5 7 7-7 7" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </form>

                  <p className="cx-alt cx-in" style={{ '--i': 7 }}>
                    New to COREXIS?
                    <Link to="/register" onMouseEnter={sfx.hover} onClick={sfx.click}>
                      Create an account
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}