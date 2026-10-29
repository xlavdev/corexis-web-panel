import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAppContext } from '../context/AppContext';
import { ROOM_HTML, LAMP_BODY_HTML, CAPSULE_HTML } from './loginScene';
import './Login.css';

/* ═══════════════════════════════════════════════════════════════════════════
   Sound engine – everything is synthesised with the Web Audio API,
   so there are no extra audio files to ship (only /background-music.m4a).
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
    noiseBuf = c.createBuffer(1, Math.floor(c.sampleRate * 0.6), c.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  return noiseBuf;
};

/** Pitched blip with optional glide. */
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

/** Filtered noise burst – mechanical clicks, whooshes. */
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
  g.gain.linearRampToValueAtTime(gain, t + Math.min(0.006, dur / 3));
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(f);
  f.connect(g);
  g.connect(master);
  s.start(t, Math.random() * 0.2);
  s.stop(t + dur + 0.02);
};

let lastHover = 0;
const sfx = {
  hover() {
    const n = performance.now();
    if (n - lastHover < 70) return;
    lastHover = n;
    tone(1560, { dur: 0.035, type: 'triangle', gain: 0.014 });
  },
  key() {
    burst({ freq: 2800 + Math.random() * 1400, q: 3, dur: 0.02, gain: 0.07 });
  },
  focus() {
    tone(520, { dur: 0.11, gain: 0.03, to: 780 });
  },
  tick() {
    burst({ freq: 3400, q: 3, dur: 0.025, gain: 0.1 });
    tone(940, { dur: 0.05, type: 'triangle', gain: 0.025 });
  },
  click() {
    tone(880, { dur: 0.06, type: 'triangle', gain: 0.05 });
    tone(1320, { dur: 0.08, gain: 0.04, delay: 0.04 });
  },
  /* tug on the pull-string: ratchet click + soft thump */
  pull() {
    burst({ freq: 1900, q: 4, dur: 0.045, gain: 0.2 });
    burst({ freq: 2500, q: 4, dur: 0.035, gain: 0.14, delay: 0.05 });
    tone(130, { dur: 0.12, gain: 0.1, to: 60 });
  },
  /* relay clack → flickering mains hum → warm bulb swell */
  lampOn() {
    burst({ freq: 1100, q: 1.5, dur: 0.05, gain: 0.25 });
    tone(100, { dur: 0.55, type: 'sawtooth', gain: 0.014, attack: 0.02 });
    tone(200, { dur: 0.45, type: 'sine', gain: 0.03, attack: 0.02 });
    [0.03, 0.09, 0.15].forEach((d, i) =>
      tone(120, { dur: 0.04, type: 'square', gain: 0.012 + i * 0.004, delay: d })
    );
    tone(262, { dur: 0.7, gain: 0.03, delay: 0.1, to: 392, attack: 0.15 });
    tone(392, { dur: 0.8, gain: 0.02, delay: 0.14, to: 523, attack: 0.2 });
  },
  lampOff() {
    burst({ freq: 800, q: 1.5, dur: 0.06, gain: 0.22 });
    tone(320, { dur: 0.28, gain: 0.04, to: 80 });
  },
  /* card sliding in */
  whoosh() {
    burst({ freq: 380, to: 1900, q: 0.9, dur: 0.5, gain: 0.07, type: 'bandpass' });
  },
  error() {
    tone(220, { dur: 0.14, type: 'sawtooth', gain: 0.06 });
    tone(165, { dur: 0.18, type: 'sawtooth', gain: 0.05, delay: 0.1 });
  },
  success() {
    tone(523, { dur: 0.1, gain: 0.05 });
    tone(659, { dur: 0.1, gain: 0.05, delay: 0.08 });
    tone(784, { dur: 0.16, gain: 0.06, delay: 0.16 });
    tone(1047, { dur: 0.3, gain: 0.04, delay: 0.26 });
  }
};

/* ═══════════════════════════════════════════════════════════════════════════ */

const PULL_THRESHOLD = 22; // lamp-units you have to drag the string before it "clicks"
const PULL_MAX = 52;

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
  const [nudge, setNudge] = useState('');

  const [lit, setLit] = useState(false);
  const [warm, setWarm] = useState(true);
  const [pull, setPull] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [musicOn, setMusicOn] = useState(false);

  const litRef = useRef(false);
  const lampRef = useRef(null);
  const userRef = useRef(null);
  const audioRef = useRef(null);
  const drag = useRef({ active: false, startY: 0, moved: false, fired: false, uPx: 1 });
  const timers = useRef([]);

  const later = (fn, ms) => {
    const id = setTimeout(fn, ms);
    timers.current.push(id);
  };

  /* pre-rasterise the hidden layers for a frame so the first light-up is smooth */
  useEffect(() => {
    let r2;
    const r1 = requestAnimationFrame(() => {
      r2 = requestAnimationFrame(() => setWarm(false));
    });
    return () => {
      cancelAnimationFrame(r1);
      cancelAnimationFrame(r2);
    };
  }, []);

  /* page is a fixed full-screen stage – stop the body scrolling behind it */
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  /* background music */
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio('/background-music.m4a');
      audioRef.current.loop = true;
      audioRef.current.volume = 0.25;
    }
    const a = audioRef.current;
    if (musicOn) {
      a.play().catch(() => setMusicOn(false));
    } else {
      a.pause();
    }
  }, [musicOn]);

  useEffect(
    () => () => {
      if (audioRef.current) audioRef.current.pause();
    },
    []
  );

  /* ── lamp ─────────────────────────────────────────────────────────────── */
  const toggleLamp = useCallback(() => {
    const next = !litRef.current;
    litRef.current = next;
    setLit(next);
    sfx.pull();
    later(() => (next ? sfx.lampOn() : sfx.lampOff()), 70);
    if (next) {
      later(sfx.whoosh, 900);
      later(() => {
        if (window.matchMedia?.('(pointer: fine)').matches) {
          userRef.current?.focus({ preventScroll: true });
        }
      }, 1700);
    }
  }, []);

  const onPullDown = (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    const w = lampRef.current?.getBoundingClientRect().width || 258;
    drag.current = { active: true, startY: e.clientY, moved: false, fired: false, uPx: Math.max(w / 258, 0.5) };
    setDragging(true);
  };

  const onPullMove = (e) => {
    const d = drag.current;
    if (!d.active) return;
    const raw = e.clientY - d.startY;
    if (Math.abs(raw) > 4) d.moved = true;
    const dy = raw / d.uPx;
    const p = Math.max(0, Math.min(PULL_MAX, dy > PULL_THRESHOLD ? PULL_THRESHOLD + (dy - PULL_THRESHOLD) * 0.35 : dy));
    setPull(p);
    if (!d.fired && p >= PULL_THRESHOLD - 0.5) {
      d.fired = true;
      toggleLamp();
    }
  };

  const onPullUp = () => {
    const d = drag.current;
    if (!d.active) return;
    d.active = false;
    setDragging(false);
    if (!d.moved) {
      // simple tap / click → animate a little tug
      setPull(32);
      toggleLamp();
      later(() => setPull(0), 130);
    } else {
      setPull(0);
    }
  };

  // keyboard (Enter / Space) arrives as a click with detail === 0
  const onPullClick = (e) => {
    if (e.detail !== 0) return;
    setPull(32);
    toggleLamp();
    later(() => setPull(0), 130);
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!form.username.trim() || !form.password) {
      setNudge((n) => (n === 'a' ? 'b' : 'a'));
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
      navigate('/app/manage-apps');
    } catch (err) {
      fail(err.response?.data?.message || err.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  const filled = Boolean(form.username.trim() && form.password);
  const btnState = loading ? 'checking' : invalid ? 'invalid' : filled ? 'ready' : 'empty';
  const onState = lit ? 'true' : 'false';

  return (
    <div
      className="cx-root login-stage-module__ui45oq__stage"
      data-lit={lit ? 'true' : 'false'}
      data-warm={warm ? '' : undefined}
    >
      {/* ── room (wall, window, plant, pedestal) ── */}
      <div
        aria-hidden="true"
        className="lamp-room-module__GNaQXq__room"
        data-on={onState}
        dangerouslySetInnerHTML={{ __html: ROOM_HTML }}
      />

      <p className="login-stage-module__ui45oq__hint">
        <span aria-hidden="true" className="login-stage-module__ui45oq__hintDash" />
        Pull the string to toggle login
      </p>

      {/* ── lamp ── */}
      <div className="login-stage-module__ui45oq__lampSlot">
        <div ref={lampRef} className="lamp-module__tJZaYG__lamp" data-on={onState}>
          <span aria-hidden="true" className="lamp-module__tJZaYG__halo lamp-module__tJZaYG__lit" />
          <span aria-hidden="true" className="lamp-module__tJZaYG__cone lamp-module__tJZaYG__lit" />
          <span aria-hidden="true" className="lamp-module__tJZaYG__offStreak" />
          <span aria-hidden="true" className="lamp-module__tJZaYG__floorWash lamp-module__tJZaYG__lit" />
          <span aria-hidden="true" className="lamp-module__tJZaYG__pool lamp-module__tJZaYG__lit" />
          <span aria-hidden="true" className="lamp-module__tJZaYG__streak lamp-module__tJZaYG__lit" />
          <span aria-hidden="true" className="lamp-module__tJZaYG__streak2 lamp-module__tJZaYG__lit" />
          <svg
            aria-hidden="true"
            className="lamp-module__tJZaYG__body"
            viewBox="0 0 258 599"
            preserveAspectRatio="none"
            dangerouslySetInnerHTML={{ __html: LAMP_BODY_HTML }}
          />
          <span aria-hidden="true" className="lamp-module__tJZaYG__bloom lamp-module__tJZaYG__flick" />
          <span aria-hidden="true" className="lamp-module__tJZaYG__joint" />

          <button
            type="button"
            className="lamp-module__tJZaYG__pull"
            data-lamp-cord="true"
            data-dragging={dragging ? '' : undefined}
            aria-label="Lamp pull string"
            aria-expanded={lit}
            aria-controls="cx-card"
            onPointerDown={onPullDown}
            onPointerMove={onPullMove}
            onPointerUp={onPullUp}
            onPointerCancel={onPullUp}
            onClick={onPullClick}
            onMouseEnter={sfx.hover}
          >
            <span aria-hidden="true" className="lamp-module__tJZaYG__idle">
              <span className="lamp-module__tJZaYG__swing" style={{ transform: 'rotate(0deg)' }}>
                <span
                  className={`lamp-module__tJZaYG__cord${dragging ? '' : ' cx-cordRelease'}`}
                  style={{ transform: `scaleY(${1 + pull / 127})` }}
                >
                  <span className="lamp-module__tJZaYG__cordOff" />
                  <span className="lamp-module__tJZaYG__cordOn lamp-module__tJZaYG__lit" />
                </span>
                <span
                  className={`lamp-module__tJZaYG__capsule${dragging ? '' : ' cx-capRelease'}`}
                  style={{ transform: `translate3d(0, calc(${pull.toFixed(2)} * var(--u)), 0)` }}
                >
                  <span className="lamp-module__tJZaYG__capGlowOff" />
                  <span className="lamp-module__tJZaYG__capGlowOn lamp-module__tJZaYG__flash" />
                  <svg
                    className="lamp-module__tJZaYG__capsuleArt"
                    viewBox="0 0 22 60"
                    aria-hidden="true"
                    dangerouslySetInnerHTML={{ __html: CAPSULE_HTML }}
                  />
                  <span className="lamp-module__tJZaYG__ring" />
                </span>
              </span>
            </span>
          </button>
        </div>
      </div>

      {/* ── login card ── */}
      <div className="login-stage-module__ui45oq__cardLayer">
        <div id="cx-card" className="login-stage-module__ui45oq__cardSlot" aria-hidden={!lit}>
          <div className="login-stage-module__ui45oq__cardMotion">
            <div
              className="login-card-module__Y38zDW__card"
              data-open={lit ? '' : undefined}
              data-shake={shake || undefined}
            >
              <span aria-hidden="true" className="login-card-module__Y38zDW__halo" />
              <span aria-hidden="true" className="login-card-module__Y38zDW__pane">
                <span className="login-card-module__Y38zDW__glowFar" />
                <span className="login-card-module__Y38zDW__glowNear" />
              </span>
              <span aria-hidden="true" className="login-card-module__Y38zDW__rim" />

              <h1 className="cx-title login-card-module__Y38zDW__row" style={{ '--i': 0 }}>
                Welcome to <b>COREXIS</b>
              </h1>

              <p className="login-card-module__Y38zDW__row login-card-module__Y38zDW__subtitle" style={{ '--i': 1 }}>
                Sign in to continue your journey
              </p>

              {notice && (
                <div className="login-card-module__Y38zDW__notice" data-tone="error" role="alert">
                  {notice}
                </div>
              )}

              <form className="login-card-module__Y38zDW__form" autoComplete="on" noValidate onSubmit={handleSubmit}>
                <div className="login-card-module__Y38zDW__row login-card-module__Y38zDW__field" style={{ '--i': 2 }}>
                  <label htmlFor="logUsername" className="login-card-module__Y38zDW__srOnly">
                    Username
                  </label>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    className="login-card-module__Y38zDW__fieldIcon"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <input
                    ref={userRef}
                    id="logUsername"
                    name="username"
                    type="text"
                    autoComplete="username"
                    spellCheck={false}
                    placeholder="Username"
                    className="login-card-module__Y38zDW__input"
                    value={form.username}
                    onChange={setField('username')}
                    onFocus={sfx.focus}
                    onKeyDown={onKey}
                  />
                </div>

                <div className="login-card-module__Y38zDW__row login-card-module__Y38zDW__field" style={{ '--i': 3 }}>
                  <label htmlFor="logPassword" className="login-card-module__Y38zDW__srOnly">
                    Password
                  </label>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    className="login-card-module__Y38zDW__fieldIcon"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <input
                    id="logPassword"
                    name="password"
                    type={showPw ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Password"
                    className="login-card-module__Y38zDW__input login-card-module__Y38zDW__inputWithToggle"
                    value={form.password}
                    onChange={setField('password')}
                    onFocus={sfx.focus}
                    onKeyDown={onKey}
                  />
                  <button
                    type="button"
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                    aria-pressed={showPw}
                    title="Toggle password visibility"
                    className="login-card-module__Y38zDW__eye"
                    onMouseEnter={sfx.hover}
                    onClick={() => {
                      setShowPw((v) => !v);
                      sfx.tick();
                    }}
                  >
                    {showPw ? (
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>

                <div
                  className="login-card-module__Y38zDW__row login-card-module__Y38zDW__forgotRow"
                  style={{ '--i': 4 }}
                >
                  <button
                    type="button"
                    className="login-card-module__Y38zDW__forgot cx-forgot"
                    onMouseEnter={sfx.hover}
                    onClick={sfx.tick}
                  >
                    Forgot Password?
                  </button>
                </div>

                <div className="login-card-module__Y38zDW__row" style={{ '--i': 5 }}>
                  <button
                    type="submit"
                    className="login-card-module__Y38zDW__signIn"
                    data-state={btnState}
                    data-nudge={nudge || undefined}
                    aria-disabled={btnState === 'empty' || btnState === 'checking'}
                    aria-busy={loading}
                    onMouseEnter={btnState === 'ready' ? sfx.hover : undefined}
                  >
                    <span aria-hidden="true" className="login-card-module__Y38zDW__signInGlow" />
                    <span aria-hidden="true" className="login-card-module__Y38zDW__signInGlowRed" />
                    <span aria-hidden="true" className="login-card-module__Y38zDW__signInFill" />
                    <span aria-hidden="true" className="login-card-module__Y38zDW__signInRed" />
                    <span aria-hidden="true" className="login-card-module__Y38zDW__signInClip">
                      <span className="login-card-module__Y38zDW__signInShimmer" />
                    </span>
                    <span aria-hidden="true" className="login-card-module__Y38zDW__signInEdge" />
                    <span className="login-card-module__Y38zDW__signInLabel">
                      {loading ? 'Signing in…' : 'Sign in'}
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                        className="login-card-module__Y38zDW__signInArrow"
                      >
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </span>
                  </button>
                </div>
              </form>

              <div className="login-card-module__Y38zDW__row login-card-module__Y38zDW__divider" style={{ '--i': 6 }}>
                or
              </div>

              <div className="login-card-module__Y38zDW__row" style={{ '--i': 7 }}>
                <Link
                  to="/register"
                  className="login-card-module__Y38zDW__discord cx-register"
                  onMouseEnter={sfx.hover}
                  onClick={sfx.click}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    className="login-card-module__Y38zDW__discordLogo"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <line x1="19" y1="8" x2="19" y2="14" />
                    <line x1="22" y1="11" x2="16" y2="11" />
                  </svg>
                  <span className="login-card-module__Y38zDW__discordLabel">Create an account</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── music toggle ── */}
      <button
        type="button"
        className={`login-stage-module__ui45oq__music${musicOn ? ' cx-musicOn' : ''}`}
        aria-label="Background music"
        aria-pressed={musicOn}
        onMouseEnter={sfx.hover}
        onClick={() => {
          setMusicOn((v) => !v);
          sfx.tick();
        }}
      >
        <svg
          className="login-stage-module__ui45oq__musicIcon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
          {!musicOn && <line x1="1" y1="1" x2="23" y2="23" />}
        </svg>
      </button>
    </div>
  );
}