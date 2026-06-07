import { Link } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LegalLayout({ title, children }) {
  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg text-white">
            <Shield className="h-6 w-6 text-white" />
            ProofStamp
          </Link>
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/10" asChild>
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-1" /> Home
            </Link>
          </Button>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-white mb-8">{title}</h1>
        <div className="prose prose-invert max-w-none text-white/70 space-y-4 text-sm leading-relaxed">
          {children}
        </div>
        <footer className="mt-12 pt-8 border-t text-sm text-muted-foreground flex flex-wrap gap-4">
          <Link to="/terms" className="hover:text-indigo-600">Terms</Link>
          <Link to="/privacy" className="hover:text-indigo-600">Privacy</Link>
          <Link to="/legal-guide" className="hover:text-indigo-600">Legal Guide</Link>
          <Link to="/register-copyright" className="hover:text-indigo-600">Copyright Registration</Link>
        </footer>
      </main>
    </div>
  );
}
