import { useState } from 'react';
import { Link } from 'react-router-dom';
import SiteHeader from '../components/layout/SiteHeader';
import SiteFooter from '../components/layout/SiteFooter';
import {
  Shield, Key, Cpu, Zap, Code, Terminal, CheckCircle2,
  ExternalLink, Lock, Server, Sparkles, ArrowRight,
  ChevronDown, ChevronUp, Copy, Check, MessageSquare,
  Activity, CloudDownload, RefreshCw, CheckCircle, Database,
  Layers, Users, HelpCircle, ShieldCheck
} from 'lucide-react';

export default function LandingPage() {
  const [codeTab, setCodeTab] = useState('cpp');
  const [isAnnual, setIsAnnual] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);

  const snippets = {
    cpp: `#include "KeyAuth.hpp"

// Initialize Corexis KeyAuth in C++ with zero dependencies
Corexis::KeyAuthApp app(
    "MyApplication",
    "OWNER_ID_HERE",
    "APP_SECRET_HERE",
    "1.0",
    "http://localhost:5000/api/1.3/"
);

if (!app.init()) {
    std::cout << "Initialization failed!" << std::endl;
    return 1;
}

// Authenticate via license key with automatic HWID lock
if (app.license("COREXIS-XXXXXX-XXXXXX")) {
    std::cout << "[+] Logged in successfully!" << std::endl;
    // Execute protected application logic
}`,
    csharp: `using Corexis;

// Initialize Corexis KeyAuth in C# (.NET)
var app = new KeyAuthApp(
    "MyApplication",
    "OWNER_ID_HERE",
    "APP_SECRET_HERE",
    "1.0",
    "http://localhost:5000/api/1.3/"
);

await app.InitAsync();

// Fast asynchronous authentication
bool ok = await app.LicenseAsync("COREXIS-XXXXXX-XXXXXX");
if (ok) {
    Console.WriteLine($"Welcome, {app.User.Username}!");
    // Execute protected code
}`,
    python: `from corexis_keyauth import CorexisAuth

# Initialize Corexis KeyAuth in Python with HMAC-SHA256 verification
auth = CorexisAuth(
    name="MyApplication",
    ownerid="OWNER_ID_HERE",
    version="1.0",
    api_url="http://localhost:5000/api/1.3/"
)
auth.app_secret = "APP_SECRET_HERE"

if auth.init():
    if auth.license("COREXIS-XXXXXX-XXXXXX"):
        print(f"[+] Authenticated! Expiry: {auth.user_data['subscriptions']}")`,
    rust: `// Corexis KeyAuth in Rust
use corexis_keyauth::KeyAuthApp;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let mut app = KeyAuthApp::new("MyApplication", "OWNER_ID", "SECRET", "1.0");
    app.init().await?;

    if app.license("COREXIS-XXXXXX-XXXXXX").await? {
        println!("[+] License valid! Welcome.");
    }
    Ok(())
}`,
    php: `<?php
require_once 'CorexisKeyAuth.php';

$app = new KeyAuthApp("MyApplication", "OWNER_ID", "SECRET", "1.0");
$app->init();

if ($app->license("COREXIS-XXXXXX-XXXXXX")) {
    echo "Access granted. Subscription valid!";
}
?>`,
    js: `import { KeyAuth } from 'corexis-keyauth';

const app = new KeyAuth({
  name: 'MyApplication',
  ownerId: 'OWNER_ID_HERE',
  version: '1.0'
});

await app.init();
const session = await app.license('COREXIS-XXXXXX-XXXXXX');
console.log('Logged in as:', session.username);`
  };

  const copyCodeToClipboard = () => {
    navigator.clipboard.writeText(snippets[codeTab]);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const faqs = [
    {
      q: 'What is Corexis KeyAuth?',
      a: 'Corexis KeyAuth is an open-source, enterprise-ready software licensing and authentication system. It allows developers to prevent unauthorized distribution, manage user subscriptions, lock licenses to specific computers (HWID), stream encrypted memory payloads, and automate license generation with Discord bots.'
    },
    {
      q: 'How does Hardware ID (HWID) locking work?',
      a: 'When a user logs in for the first time, our SDK securely fingerprints their hardware (motherboard, drive serial, and CPU hash). The license is immediately bound to that machine, preventing the key from being shared with other people.'
    },
    {
      q: 'Can users bypass or spoof responses with HTTP proxies like Fiddler?',
      a: 'No. Every single API response sent by the Corexis server is cryptographically signed using HMAC-SHA256 with your Application Secret. The client SDK verifies the cryptographic signature before trusting the response. If a user tampers with the JSON payload, the signature fails and the app terminates.'
    },
    {
      q: 'Is Corexis KeyAuth 100% compatible with KeyAuth 1.3 endpoints?',
      a: 'Yes! Corexis KeyAuth implements the identical KeyAuth 1.3 protocol (/api/1.3/). Existing KeyAuth SDKs, loaders, and codebases in C++, C#, Python, Rust, and PHP connect seamlessly.'
    },
    {
      q: 'Can I integrate KeyAuth with my Discord server or shop (Sellix / Shoppy)?',
      a: 'Yes. Corexis includes a dedicated Seller API (/api/seller/) and a pre-configured Discord Bot with slash commands (/generate, /ban, /resethwid, /stats) for instant automated key delivery upon customer purchase.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#09090d] text-gray-100 font-sans selection:bg-blue-600 selection:text-white">
      <SiteHeader />

      {/* Hero Section matching KeyAuth's homepage banner */}
      <section className="relative pt-20 pb-20 px-6 overflow-hidden">
        {/* Glow Spheres */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[550px] h-[550px] bg-blue-600/15 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[350px] h-[350px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          {/* Top Tagline Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-semibold shadow-inner">
            <Sparkles size={13} className="text-blue-400" />
            Open source authentication system with cloud-hosting plans also
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight leading-[1.1]">
            Protect your software with <br />
            <span className="bg-gradient-to-r to-blue-600 from-sky-400 bg-clip-text text-transparent">
              industry-leading authentication
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-gray-400 leading-relaxed font-normal">
            Stop digital piracy, lock licenses to unique hardware (HWID), securely stream cloud payloads into memory, and manage subscribers seamlessly with our high-performance SDKs.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs tracking-wide shadow-xl shadow-blue-600/30 transition-all hover:scale-[1.02]"
            >
              Get Started Free <ArrowRight size={15} />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-custom-back hover:bg-[#1a1a1a] border border-[#1a1a1a] text-gray-200 font-bold text-xs tracking-wide transition-all"
            >
              Open Dashboard
            </Link>
            <a
              href="https://keyauthdocs.apidog.io/"
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-6 py-3 rounded-xl bg-custom-back hover:bg-custom-back border border-[#1a1a1a] text-gray-300 font-bold text-xs transition-all"
            >
              View Docs <ExternalLink size={13} />
            </a>
          </div>
        </div>

        {/* Live Interactive Code Preview Box */}
        <div id="sdk" className="max-w-4xl mx-auto mt-16 relative z-10">
          <div className="bg-custom-back border border-[#1a1a1a] rounded-2xl shadow-2xl overflow-hidden ring-1 ring-blue-500/20">
            {/* Window Topbar */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#09090d] border-b border-[#1a1a1a]">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                <span className="text-xs font-mono text-gray-400 ml-2 hidden sm:inline">corexis-auth-client</span>
              </div>

              {/* Language Switcher Tabs */}
              <div className="flex gap-1 overflow-x-auto scrollbar-none">
                {[
                  { id: 'cpp', label: 'C++' },
                  { id: 'csharp', label: 'C#' },
                  { id: 'python', label: 'Python' },
                  { id: 'rust', label: 'Rust' },
                  { id: 'php', label: 'PHP' },
                  { id: 'js', label: 'JavaScript' }
                ].map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => setCodeTab(id)}
                    className={`text-xs font-bold px-3 py-1 rounded-md transition-all ${
                      codeTab === id
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-400 hover:text-white hover:bg-custom-back'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Code Block Container */}
            <div className="relative">
              <pre className="p-6 text-xs sm:text-sm font-mono text-blue-300 bg-[#09090d] overflow-x-auto leading-relaxed max-h-[380px]">
                {snippets[codeTab]}
              </pre>

              <button
                onClick={copyCodeToClipboard}
                className="absolute top-4 right-4 bg-custom-back hover:bg-[#182336] text-gray-300 hover:text-white px-3 py-1.5 rounded-lg border border-[#1a1a1a] text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md"
              >
                {copiedCode ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                {copiedCode ? 'Copied!' : 'Copy Code'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Banner */}
      <section className="border-y border-[#1a1a1a] bg-[#09090d] py-12 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <p className="text-3xl sm:text-4xl font-black text-white">100,000+</p>
            <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-semibold">Active Developers</p>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-black text-blue-400">10M+</p>
            <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-semibold">Authentications</p>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-black text-emerald-400">99.99%</p>
            <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-semibold">Cloud Uptime</p>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-black text-blue-400">256-bit</p>
            <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-semibold">HMAC Anti-Tamper</p>
          </div>
        </div>
      </section>

      {/* Features Grid matching KeyAuth's features */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto space-y-16">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Built For Software Creators</span>
          <h2 className="text-3xl sm:text-4xl font-black text-white">Everything You Need to Protect & Scale</h2>
          <p className="text-sm text-gray-400">
            A battle-tested software security platform designed to defeat bypasses, automate licensing, and boost your sales.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Feature 1 */}
          <div className="bg-custom-back border border-[#1a1a1a] p-6 rounded-2xl space-y-3 hover:border-blue-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Cpu size={20} />
            </div>
            <h3 className="text-base font-bold text-white">Hardware ID (HWID) Lock</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Automatically locks licenses to your user's specific PC components. Completely prevents account sharing and leaking.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-custom-back border border-[#1a1a1a] p-6 rounded-2xl space-y-3 hover:border-blue-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <ShieldCheck size={20} />
            </div>
            <h3 className="text-base font-bold text-white">Anti-Tamper HMAC Signatures</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Every server response is cryptographically signed with HMAC-SHA256 using your secret key. Fiddler and proxy spoofing fail instantly.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-custom-back border border-[#1a1a1a] p-6 rounded-2xl space-y-3 hover:border-blue-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CloudDownload size={20} />
            </div>
            <h3 className="text-base font-bold text-white">Cloud Encrypted Binaries</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Stream executable payloads directly into RAM or deliver encrypted files over HTTPS only to validly licensed users.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-custom-back border border-[#1a1a1a] p-6 rounded-2xl space-y-3 hover:border-blue-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Zap size={20} />
            </div>
            <h3 className="text-base font-bold text-white">Discord & Telegram Bots</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Manage your software from Discord. Generate keys, reset HWIDs, and ban cheaters using modern slash commands.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="bg-custom-back border border-[#1a1a1a] p-6 rounded-2xl space-y-3 hover:border-blue-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Database size={20} />
            </div>
            <h3 className="text-base font-bold text-white">Cloud Variables</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Store global configs, server IPs, and sensitive URLs in the cloud. Update your app settings without recompiling code.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="bg-custom-back border border-[#1a1a1a] p-6 rounded-2xl space-y-3 hover:border-blue-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <Lock size={20} />
            </div>
            <h3 className="text-base font-bold text-white">Blacklist & Fraud Prevention</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Ban malicious users by IP address, VPN range, or hardware fingerprint to permanently stop bad actors from accessing your apps.
            </p>
          </div>

          {/* Feature 7 */}
          <div className="bg-custom-back border border-[#1a1a1a] p-6 rounded-2xl space-y-3 hover:border-blue-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <MessageSquare size={20} />
            </div>
            <h3 className="text-base font-bold text-white">In-App Live Chatrooms</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Built-in live chat allowing running game clients and desktop applications to communicate with the admin in real-time.
            </p>
          </div>

          {/* Feature 8 */}
          <div className="bg-custom-back border border-[#1a1a1a] p-6 rounded-2xl space-y-3 hover:border-blue-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Users size={20} />
            </div>
            <h3 className="text-base font-bold text-white">Customer Web Panel</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Provide a professional portal where your clients can check their remaining subscription time, reset HWID, and download updates.
            </p>
          </div>
        </div>
      </section>

      {/* 3-Step "How It Works" Section */}
      <section className="py-20 px-6 bg-[#09090d] border-y border-[#1a1a1a]">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-3xl font-black text-white">Get Protected in 3 Easy Steps</h2>
            <p className="text-xs text-gray-400">No complex server setup required. Start protecting your builds in minutes.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-custom-back border border-[#1a1a1a] p-6 rounded-2xl relative space-y-3">
              <span className="w-8 h-8 rounded-lg bg-blue-600 font-bold text-white flex items-center justify-center text-sm">1</span>
              <h3 className="text-base font-bold text-white">Create Application</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Log into your Corexis dashboard and create a new application to generate your unique App Secret and Seller Key.
              </p>
            </div>

            <div className="bg-custom-back border border-[#1a1a1a] p-6 rounded-2xl relative space-y-3">
              <span className="w-8 h-8 rounded-lg bg-blue-600 font-bold text-white flex items-center justify-center text-sm">2</span>
              <h3 className="text-base font-bold text-white">Embed the SDK</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Add our lightweight C++, C#, or Python wrapper into your software with just 5 lines of code.
              </p>
            </div>

            <div className="bg-custom-back border border-[#1a1a1a] p-6 rounded-2xl relative space-y-3">
              <span className="w-8 h-8 rounded-lg bg-emerald-600 font-bold text-white flex items-center justify-center text-sm">3</span>
              <h3 className="text-base font-bold text-white">Issue Licenses & Monetize</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Generate license keys with custom masks, connect your Discord bot or Sellix store, and enjoy automated revenue.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Plans Section matching KeyAuth (Tester, Developer, Seller) */}
      <section id="pricing" className="py-24 px-6 max-w-6xl mx-auto space-y-12">
        <div className="text-center max-w-xl mx-auto space-y-4">
          <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Flexible Cloud Plans</span>
          <h2 className="text-3xl sm:text-4xl font-black text-white">Simple, Transparent Pricing</h2>
          <p className="text-xs text-gray-400">Choose the plan that fits your application size. Upgrade or cancel anytime.</p>

          {/* Monthly / Annually Switch */}
          <div className="inline-flex items-center gap-3 bg-custom-back border border-[#1a1a1a] p-1.5 rounded-xl">
            <button
              onClick={() => setIsAnnual(false)}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                !isAnnual ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                isAnnual ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
              }`}
            >
              Annual Billing
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full font-bold">
                Save 50%
              </span>
            </button>
          </div>
        </div>

        {/* 3 Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {/* Tester Plan */}
          <div className="bg-custom-back border border-[#1a1a1a] rounded-2xl p-7 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-white">Tester</h3>
                <p className="text-xs text-gray-400 mt-1">Best for small projects and initial testing</p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-white">$0</span>
                <span className="text-xs text-gray-400">/ forever</span>
              </div>

              <ul className="space-y-2.5 text-xs text-gray-300 pt-2 border-t border-[#1a1a1a]">
                <li className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-blue-400 flex-shrink-0" />
                  <span><strong>1</strong> Application</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-blue-400 flex-shrink-0" />
                  <span><strong>10</strong> Users per App</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-blue-400 flex-shrink-0" />
                  <span>Hardware ID (HWID) Protection</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-blue-400 flex-shrink-0" />
                  <span>KeyAuth 1.3 Client Protocol</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-blue-400 flex-shrink-0" />
                  <span>Community Discord Support</span>
                </li>
              </ul>
            </div>

            <Link
              to="/register"
              className="w-full text-center py-2.5 rounded-xl bg-custom-back hover:bg-[#1a1a1a] text-white font-bold text-xs border border-[#223048] transition-all"
            >
              Get Started Free
            </Link>
          </div>

          {/* Developer Plan */}
          <div className="bg-custom-back border border-[#1a1a1a] rounded-2xl p-7 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-white">Developer</h3>
                <p className="text-xs text-gray-400 mt-1">For active developers and growing tools</p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-white">{isAnnual ? '$14.99' : '$2.99'}</span>
                <span className="text-xs text-gray-400">{isAnnual ? '/ year' : '/ month'}</span>
              </div>

              <ul className="space-y-2.5 text-xs text-gray-300 pt-2 border-t border-[#1a1a1a]">
                <li className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-blue-400 flex-shrink-0" />
                  <span><strong>Up to 8</strong> Applications</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-blue-400 flex-shrink-0" />
                  <span><strong>10,000</strong> Users per App</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-blue-400 flex-shrink-0" />
                  <span>Encrypted File & Variable Management</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-blue-400 flex-shrink-0" />
                  <span>IP & HWID Blacklisting</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-blue-400 flex-shrink-0" />
                  <span>Real-time Discord Webhook Alerts</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-blue-400 flex-shrink-0" />
                  <span>Team Management & Role Delegation</span>
                </li>
              </ul>
            </div>

            <Link
              to="/register"
              className="w-full text-center py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/25 transition-all"
            >
              Choose Developer
            </Link>
          </div>

          {/* Seller Plan (Flagship / Most Popular) */}
          <div className="bg-[#0d1424] border-2 border-blue-500 rounded-2xl p-7 flex flex-col justify-between space-y-6 shadow-2xl shadow-blue-500/15 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-blue-500 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-md">
              Most Popular
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-white">Seller</h3>
                <p className="text-xs text-gray-400 mt-1">For serious software vendors & merchants</p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-blue-400">{isAnnual ? '$24.99' : '$4.99'}</span>
                <span className="text-xs text-gray-400">{isAnnual ? '/ year' : '/ month'}</span>
              </div>

              <ul className="space-y-2.5 text-xs text-gray-300 pt-2 border-t border-[#1a1a1a]">
                <li className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-emerald-400 flex-shrink-0" />
                  <span><strong>Unlimited</strong> Applications</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-emerald-400 flex-shrink-0" />
                  <span><strong>Unlimited</strong> Users & Licenses</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-emerald-400 flex-shrink-0" />
                  <span>Automated Discord & Telegram Bot</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-emerald-400 flex-shrink-0" />
                  <span>Full Seller API (Shoppy / Sellix Ready)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-emerald-400 flex-shrink-0" />
                  <span>Custom Customer Web Portal</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-emerald-400 flex-shrink-0" />
                  <span>In-App Live Chatrooms</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-emerald-400 flex-shrink-0" />
                  <span>24/7 Priority VIP Support</span>
                </li>
              </ul>
            </div>

            <Link
              to="/register"
              className="w-full text-center py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-500 hover:to-blue-500 text-white font-black text-xs shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02]"
            >
              Get Seller Access
            </Link>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions (FAQ) Accordion */}
      <section id="faq" className="py-20 px-6 max-w-4xl mx-auto space-y-10">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Common Questions</span>
          <h2 className="text-3xl font-black text-white">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((f, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div
                key={idx}
                className="bg-custom-back border border-[#1a1a1a] rounded-xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between text-xs sm:text-sm font-bold text-white hover:text-blue-400 transition-colors"
                >
                  <span>{f.q}</span>
                  {isOpen ? <ChevronUp size={16} className="text-blue-400 flex-shrink-0" /> : <ChevronDown size={16} className="text-gray-500 flex-shrink-0" />}
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-xs text-gray-400 leading-relaxed border-t border-[#1a1a1a] pt-3">
                    {f.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto bg-gradient-to-tr from-blue-950 via-[#0e1628] to-[#121212] border border-blue-500/30 rounded-3xl p-10 sm:p-14 text-center space-y-6 shadow-2xl shadow-blue-600/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Ready to secure your software?
          </h2>
          <p className="max-w-xl mx-auto text-xs sm:text-sm text-gray-300">
            Join thousands of developers protecting their applications and monetizing their builds today with Corexis KeyAuth.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to="/register"
              className="w-full sm:w-auto px-7 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xl shadow-blue-600/30 transition-all hover:scale-105"
            >
              Create Free Account
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-7 py-3 rounded-xl bg-custom-back hover:bg-[#1a1a1a] border border-[#1a1a1a] text-gray-200 font-bold text-xs transition-all"
            >
              Sign In to Dashboard
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
