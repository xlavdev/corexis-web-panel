import { Link } from 'react-router-dom';
import { Shield, Lock, ArrowRight, Terminal, UserCheck } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-[#07070a] text-white flex flex-col justify-between overflow-hidden selection:bg-blue-600 selection:text-white">
      {/* Background Ambient Glows & Grid */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-blue-600/15 rounded-full blur-[140px]" />
        <div className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-[550px] h-[350px] bg-indigo-600/10 rounded-full blur-[130px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40" />
      </div>

      {/* Top Bar Minimal Navigation */}
      <header className="relative z-10 w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-500/20 border border-blue-400/30">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-wider uppercase text-white">COREXIS</span>
            <span className="ml-2 text-xs font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              PRIVATE
            </span>
          </div>
        </div>

        <Link
          to="/login"
          className="text-xs font-medium px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 transition-all flex items-center gap-1.5"
        >
          <Lock className="w-3.5 h-3.5" />
          Operator Login
        </Link>
      </header>

      {/* Center Hero Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-xl text-center">
          {/* Status Indicator */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono mb-8 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            SYSTEM ONLINE // PRIVATE INSTANCE
          </div>

          {/* Welcome Message */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-4">
            Welcome back, <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">sir.</span>
          </h1>

          <p className="text-zinc-400 text-sm sm:text-base max-w-md mx-auto mb-10 leading-relaxed font-normal">
            Private KeyAuth Licensing &amp; Authentication Architecture. All VIP features, variables, and sessions unlocked.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-xl shadow-blue-600/25 border border-blue-400/30 flex items-center justify-center gap-2.5 transition-all transform hover:-translate-y-0.5 active:translate-y-0 group"
            >
              <span>Login to Dashboard</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              to="/register"
              className="w-full sm:w-auto px-6 py-4 rounded-xl bg-[#13131a] hover:bg-[#1a1a24] text-zinc-300 hover:text-white font-medium text-sm border border-white/10 flex items-center justify-center gap-2 transition-all"
            >
              <UserCheck className="w-4 h-4 text-zinc-400" />
              <span>Create Account</span>
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-14 pt-8 border-t border-white/5 grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Engine</div>
              <div className="text-sm font-semibold text-zinc-200 mt-1">KeyAuth 1.3</div>
            </div>
            <div>
              <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Database</div>
              <div className="text-sm font-semibold text-emerald-400 mt-1">Supabase DB</div>
            </div>
            <div>
              <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider">License Tier</div>
              <div className="text-sm font-semibold text-blue-400 mt-1">Free VIP Lifetime</div>
            </div>
          </div>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="relative z-10 w-full max-w-6xl mx-auto px-6 py-6 text-center text-xs text-zinc-600 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-white/5">
        <div className="flex items-center gap-2 font-mono">
          <Terminal className="w-3.5 h-3.5 text-zinc-500" />
          <span>COREXIS PRIVATE AUTHENTICATION</span>
        </div>
        <div>
          <span>Restricted Access &bull; Authorized Personnel Only</span>
        </div>
      </footer>
    </div>
  );
}
