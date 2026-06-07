import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Shield, Lock, Search, CheckCircle2, ArrowRight, Fingerprint,
  FileText, Zap, Eye, Scale, Layers, ChevronRight
} from 'lucide-react';
import { MARKETING, BSA_FRAME } from '@/content/legalCopy';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-white/20 selection:text-white overflow-hidden">
      {/* Global Ambient Glow */}
      <div className="ambient-glow"></div>

      {/* Floating Minimal Navbar */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-3rem)] max-w-5xl rounded-full apple-glass px-6 transition-all duration-500">
        <div className="flex justify-between h-14 items-center">
          <div className="flex items-center gap-2 group">
            <Shield className="h-6 w-6 text-white group-hover:scale-105 transition-transform" />
            <span className="font-semibold text-lg tracking-tight text-white">ProofStamp</span>
          </div>
          <div className="flex items-center gap-4 text-sm font-medium">
            <Link to="/verify" className="text-white/50 hover:text-white transition-colors hidden sm:block">Verify</Link>
            <Button size="sm" className="bg-white hover:bg-white/90 text-black rounded-full px-6 h-9 font-semibold transition-transform hover:scale-105" asChild>
              <Link to="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-48 pb-32 lg:pt-64 lg:pb-48 overflow-hidden flex flex-col items-center justify-center min-h-[95vh] text-center z-10 px-6 animate-fade-up">
        <div className="max-w-6xl mx-auto w-full">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold mb-10 border border-white/10 bg-white/5 text-white/80 backdrop-blur-md shadow-2xl shadow-white/5">
            <Scale className="h-4 w-4" />
            {MARKETING.heroBadge}
          </div>

          {/* Headline */}
          <h1 className="text-6xl sm:text-8xl lg:text-[10rem] font-semibold tracking-tighter text-white mb-8 leading-[0.9] drop-shadow-2xl">
            Unbreakable <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/90 to-white/50">
              Evidence.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl sm:text-3xl text-white/50 max-w-3xl mx-auto leading-snug mb-14 font-medium tracking-tight">
            If you didn't stamp it, you can't prove you made it. Secure your intellectual property with cryptographically binding, zero-knowledge proofs.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
            <Button size="lg" className="h-16 px-10 text-xl bg-white text-black hover:bg-white/90 w-full sm:w-auto font-semibold rounded-[2rem] shadow-2xl transition-transform hover:scale-105 flex items-center justify-center" asChild>
              <Link to="/login">
                Start Protecting
                <ArrowRight className="h-6 w-6 ml-3" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-16 px-10 text-xl w-full sm:w-auto border-white/10 text-white hover:bg-white/10 bg-white/[0.02] rounded-[2rem] backdrop-blur-md transition-colors flex items-center justify-center" asChild>
              <Link to="/verify">
                <Search className="h-5 w-5 mr-3 text-white/50" />
                Verify Identity
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Core Workflow Section - Bento Grid */}
      <section className="py-40 relative z-10 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24 max-w-4xl mx-auto">
            <h2 className="text-5xl md:text-7xl font-semibold tracking-tighter text-white mb-6 leading-tight">Defensible proof.</h2>
            <p className="text-2xl text-white/50 font-medium tracking-tight leading-relaxed">From raw upload to a court-admissible evidence package in seconds. No crypto wallets required.</p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                icon: Layers,
                title: 'Upload & Hash',
                desc: 'Client-side SHA-256 fingerprinting guarantees zero-knowledge. Your file never leaves your device unencrypted.',
              },
              {
                step: '02',
                icon: Shield,
                title: 'Cryptographic Stamp',
                desc: 'Your RSA signature is bound to an independent RFC 3161 timestamp and an invisible DWT-DCT watermark.',
              },
              {
                step: '03',
                icon: FileText,
                title: 'Legal Admissibility',
                desc: `Instantly download a ${BSA_FRAME.shortLabel} and ${MARKETING.counselPacketName} ready for DMCA takedowns.`,
              },
            ].map((item) => (
              <div key={item.step} className="p-12 rounded-[3rem] apple-glass-panel apple-shadow relative group flex flex-col items-start text-left hover:-translate-y-2 transition-all duration-500">
                <div className="h-16 w-16 rounded-[1.5rem] bg-white/[0.05] border border-white/10 flex items-center justify-center mb-16 group-hover:bg-white group-hover:text-black transition-all duration-500 shadow-inner">
                  <item.icon className="h-8 w-8 text-white/80 group-hover:text-black transition-colors" />
                </div>
                <div className="mt-auto w-full">
                  <div className="text-xs font-bold text-white/30 uppercase tracking-widest mb-3">Step {item.step}</div>
                  <h3 className="text-3xl font-semibold tracking-tight text-white mb-4 leading-tight">{item.title}</h3>
                  <p className="text-white/50 leading-relaxed text-lg font-medium">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Layers - Visual Split */}
      <section className="py-40 relative z-10 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <div className="order-2 lg:order-1 relative">
              <div className="w-full aspect-square rounded-[4rem] apple-glass-panel border border-white/10 flex items-center justify-center overflow-hidden apple-shadow">
                {/* Decorative animated elements */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08)_0,transparent_60%)] animate-pulse" />
                <div className="absolute w-[400px] h-[400px] border border-white/10 rounded-full animate-[spin_60s_linear_infinite]" />
                <div className="absolute w-[300px] h-[300px] border border-white/20 rounded-full animate-[spin_40s_linear_infinite_reverse]" />
                <div className="absolute w-[200px] h-[200px] bg-white/5 rounded-full backdrop-blur-xl border border-white/10 flex items-center justify-center shadow-2xl">
                  <Lock className="h-20 w-20 text-white" />
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-5xl lg:text-7xl font-semibold tracking-tighter text-white mb-8 leading-tight">Multi-layered forensic architecture.</h2>
              <p className="text-2xl text-white/50 mb-16 font-medium tracking-tight leading-relaxed">We combine traditional cryptography, legal frameworks, and advanced steganography into one seamless engine.</p>
              
              <div className="space-y-10">
                {[
                  { icon: Fingerprint, title: 'SHA-256 Hashing', desc: 'Immutable byte-level fingerprinting of your original file.' },
                  { icon: Lock, title: 'RSA-2048 Signatures', desc: 'Cryptographically binds the file hash to your verified identity.' },
                  { icon: Scale, title: 'RFC 3161 Timestamping', desc: 'Independent, mathematically verifiable time witness.' },
                  { icon: Eye, title: 'DWT-DCT Watermarking', desc: 'Invisible, resilient watermarks embedded directly into image pixels.' },
                ].map((item) => (
                  <div key={item.title} className="flex gap-6 group">
                    <div className="mt-1 h-12 w-12 rounded-[1rem] bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-white/10 transition-colors">
                      <item.icon className="h-6 w-6 text-white/80" />
                    </div>
                    <div>
                      <h4 className="text-2xl font-semibold text-white mb-2 tracking-tight">{item.title}</h4>
                      <p className="text-white/50 leading-relaxed font-medium text-lg">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Section - Minimalist Cards */}
      <section className="py-40 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-5xl lg:text-7xl font-semibold tracking-tighter text-white">Why ProofStamp.</h2>
            <p className="text-2xl text-white/50 mt-6 font-medium tracking-tight">Real legal infrastructure, zero crypto hype.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-8">
            {[
              { vs: 'Blockchain & NFTs', win: 'No gas fees, no wallets. Private by default. Real legal evidence, not just a ledger entry.' },
              { vs: '"Emailing Yourself"', win: 'Cryptographically secure RFC timestamps and RSA signatures. Emails are legally flimsy.' },
              { vs: 'Visible Watermarks', win: 'Invisible DWT-DCT watermarks survive cropping, compression, and filters cleanly.' },
              { vs: 'Copyright Office', win: 'Get instant evidence today. Register later when you need maximum statutory damages.' },
            ].map((item) => (
               <div key={item.vs} className="p-12 rounded-[3rem] apple-glass-panel border border-white/10 hover:-translate-y-1 transition-transform duration-300">
                 <div className="flex items-center gap-4 mb-6">
                   <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20">
                     <CheckCircle2 className="h-5 w-5 text-green-400" />
                   </div>
                   <h4 className="text-2xl font-semibold tracking-tight text-white">vs {item.vs}</h4>
                 </div>
                 <p className="text-white/60 leading-relaxed font-medium text-lg">{item.win}</p>
               </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-40 relative px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(255,255,255,0.05)_0,transparent_60%)]" />
        <div className="relative max-w-4xl mx-auto text-center z-10">
          <div className="mx-auto h-24 w-24 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center mb-10 shadow-2xl">
            <Zap className="h-10 w-10 text-white animate-pulse" />
          </div>
          <h2 className="text-6xl lg:text-[7rem] font-semibold tracking-tighter text-white mb-8 leading-[0.9]">Secure your legacy.</h2>
          <p className="text-2xl text-white/50 mb-16 font-medium tracking-tight max-w-2xl mx-auto leading-relaxed">
            Full legal proof on every stamp. Set up your identity in 30 seconds.
          </p>
          <Button size="lg" className="h-16 px-12 text-xl bg-white text-black hover:bg-white/90 font-semibold rounded-full shadow-2xl transition-transform hover:scale-105 flex items-center justify-center mx-auto" asChild>
            <Link to="/login">
              Start Stamping Now
              <ChevronRight className="h-6 w-6 ml-2" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Ultra-minimal Footer */}
      <footer className="border-t border-white/[0.05] py-16 px-6 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
              <Shield className="h-4 w-4 text-white/60" />
            </div>
            <span className="font-semibold tracking-tight text-white/60 text-lg">ProofStamp</span>
          </div>
          <div className="flex flex-wrap justify-center gap-10 text-base font-medium text-white/40">
            <Link to="/verify" className="hover:text-white transition-colors">Verify</Link>
            <Link to="/legal-guide" className="hover:text-white transition-colors">Legal</Link>
            <Link to="/register-copyright" className="hover:text-white transition-colors">Copyright</Link>
            <Link to="/login" className="hover:text-white transition-colors">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
