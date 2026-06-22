import { useState, useEffect } from 'react';
import { Shield, Smartphone, KeyRound, Loader2, CheckCircle2, ArrowRight } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function MockAadhaarPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [step, setStep] = useState(1);
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  // Auto-format Aadhaar number (XXXX XXXX XXXX)
  const handleAadhaarChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 12) value = value.slice(0, 12);
    
    // Add spaces every 4 digits
    const formatted = value.replace(/(\d{4})/g, '$1 ').trim();
    setAadhaarNumber(formatted);
  };

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (aadhaarNumber.replace(/\s/g, '').length !== 12) return;
    
    setLoading(true);
    // Simulate network delay
    setTimeout(() => {
      setLoading(false);
      setStep(2);
    }, 1500);
  };

  const handleVerify = (e) => {
    e.preventDefault();
    if (otp.length !== 6) return;
    
    setLoading(true);
    // Simulate verification delay
    setTimeout(() => {
      // Redirect to backend callback with mock=true and the auth token
      const apiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_SERVER_URL || 'https://proofstamp-server.onrender.com';
      window.location.href = `${apiUrl}/api/ekyc/setu/callback?mock=true&token=${token}`;
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md apple-glass rounded-[2rem] p-8 md:p-10 apple-shadow relative z-10 border border-white/10 relative overflow-hidden">
        {/* Header */}
        <div className="text-center mb-8 relative z-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-500/20 text-indigo-400 mb-6 shadow-[0_0_40px_-10px_rgba(99,102,241,0.5)]">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2 font-display">Aadhaar eKYC</h1>
          <p className="text-white/60 text-sm">
            {step === 1 ? 'Enter your 12-digit Aadhaar number to verify your identity.' : 'Enter the 6-digit OTP sent to your linked mobile number.'}
          </p>
        </div>

        {/* Step 1: Aadhaar Number */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-6 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-2">
              <label className="text-xs font-medium text-white/70 uppercase tracking-wider ml-1">Aadhaar Number</label>
              <div className="relative">
                <input
                  type="text"
                  value={aadhaarNumber}
                  onChange={handleAadhaarChange}
                  placeholder="0000 0000 0000"
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-4 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all tracking-widest text-center font-mono text-xl"
                  autoFocus
                />
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={aadhaarNumber.replace(/\s/g, '').length !== 12 || loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white h-12 rounded-xl text-md font-medium transition-all shadow-[0_0_20px_-5px_rgba(99,102,241,0.4)] hover:shadow-[0_0_25px_-5px_rgba(99,102,241,0.6)] disabled:opacity-50 disabled:shadow-none"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>Get OTP <ArrowRight className="w-4 h-4 ml-2" /></>
              )}
            </Button>
          </form>
        )}

        {/* Step 2: OTP */}
        {step === 2 && (
          <form onSubmit={handleVerify} className="space-y-6 relative z-10 animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="flex justify-center mb-6">
               <div className="flex space-x-3 items-center bg-white/5 rounded-full px-4 py-2 border border-white/10">
                 <Smartphone className="w-4 h-4 text-green-400" />
                 <span className="text-xs text-white/80">OTP sent to linked mobile</span>
               </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-medium text-white/70 uppercase tracking-wider ml-1 text-center block">Enter 6-digit OTP</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <KeyRound className="w-5 h-5 text-white/30" />
                </div>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full bg-black/50 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all tracking-[0.5em] text-center font-mono text-2xl"
                  autoFocus
                />
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={otp.length !== 6 || loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white h-12 rounded-xl text-md font-medium transition-all shadow-[0_0_20px_-5px_rgba(99,102,241,0.4)] hover:shadow-[0_0_25px_-5px_rgba(99,102,241,0.6)] disabled:opacity-50 disabled:shadow-none"
            >
              {loading ? (
                <div className="flex items-center">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Verifying...
                </div>
              ) : (
                <>Verify & Continue <CheckCircle2 className="w-4 h-4 ml-2" /></>
              )}
            </Button>
            
            <div className="text-center">
              <button 
                type="button" 
                onClick={() => { setStep(1); setOtp(''); }}
                className="text-white/40 hover:text-white/80 text-xs transition-colors"
                disabled={loading}
              >
                Change Aadhaar Number
              </button>
            </div>
          </form>
        )}

        {/* Sandbox Badge */}
        <div className="absolute top-0 right-0 overflow-hidden w-24 h-24">
          <div className="bg-yellow-500/90 text-black text-[10px] font-bold uppercase tracking-wider py-1 text-center w-32 shadow-sm transform rotate-45 translate-x-[26px] translate-y-[16px]">
            Sandbox
          </div>
        </div>
      </div>
    </div>
  );
}
