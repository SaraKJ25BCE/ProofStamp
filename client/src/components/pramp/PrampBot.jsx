import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PrampAvatar from './PrampAvatar';
import { Send, X, Loader2, Square, Trash2, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';

export default function PrampBot() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const [isOpen, setIsOpen] = useState(() => {
    const saved = sessionStorage.getItem('prampIsOpen');
    return saved ? JSON.parse(saved) : false;
  });
  
  const [position, setPosition] = useState({ x: window.innerWidth - 100, y: window.innerHeight - 100 });
  const [isFlipped, setIsFlipped] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isCelebrating, setIsCelebrating] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 384, height: 500 });
  const [avatarMessage, setAvatarMessage] = useState('');
  const [abortController, setAbortController] = useState(null);
  
  const [messages, setMessages] = useState(() => {
    const saved = sessionStorage.getItem('prampMessages');
    return saved ? JSON.parse(saved) : [
      { role: 'model', text: 'Woof! I am Pramp. How can I help you protect your digital assets today?' }
    ];
  });
  const [input, setInput] = useState('');
  const chatEndRef = useRef(null);

  // Persist state to session storage
  useEffect(() => {
    sessionStorage.setItem('prampIsOpen', JSON.stringify(isOpen));
  }, [isOpen]);

  useEffect(() => {
    sessionStorage.setItem('prampMessages', JSON.stringify(messages));
  }, [messages]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  // Set default position on mount and handle resize
  useEffect(() => {
    const handleResize = () => {
      setPosition({
        x: Math.min(window.innerWidth - 100, window.innerWidth - 50),
        y: Math.min(window.innerHeight - 100, window.innerHeight - 50)
      });
    };
    // Initialize
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const executeAction = (action) => {
    switch (action.type) {
      case 'navigate_to':
        if (action.payload.route) {
          navigate(action.payload.route);
          // Let Pramp stay in the corner, just give a happy bounce instead of blocking the screen
          setIsCelebrating(true);
          setTimeout(() => setIsCelebrating(false), 1000);
        }
        break;

      case 'celebrate':
        setIsCelebrating(true);
        setTimeout(() => setIsCelebrating(false), 2000);
        break;
      default:
        console.warn('Unknown Pramp action:', action);
    }
  };

  const handleStop = () => {
    if (abortController) {
      abortController.abort();
      setIsThinking(false);
      setAbortController(null);
      setMessages(prev => [...prev, { role: 'model', text: 'Okay, I stopped sniffing for that!' }]);
    }
  };

  const handleClearChat = () => {
    sessionStorage.removeItem('prampMessages');
    setMessages([{ role: 'model', text: 'Woof! I am Pramp. How can I help you protect your digital assets today?' }]);
    if (abortController) {
      abortController.abort();
      setIsThinking(false);
      setAbortController(null);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isThinking) return;

    const userText = input.trim();
    setInput('');
    
    const newHistory = [...messages, { role: 'user', text: userText }];
    setMessages(newHistory);
    setIsThinking(true);

    const controller = new AbortController();
    setAbortController(controller);

    try {
      let pageContext = "";
      const mainEl = document.querySelector('main');
      if (mainEl) {
        pageContext = mainEl.innerText.replace(/\s+/g, ' ').trim().slice(0, 1500);
      }

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const res = await fetch(`${apiUrl}/api/pramp/chat`, {
        method: 'POST',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          history: newHistory,
          currentRoute: location.pathname + location.search,
          isAuthenticated: !!user,
          pageContext: pageContext
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP Error ${res.status}`);
      }

      const data = await res.json();
      
      if (data.response) {
        setMessages(prev => [...prev, { role: 'model', text: data.response.text }]);
        
        // Execute actions sequentially
        if (data.response.actions && data.response.actions.length > 0) {
          data.response.actions.forEach((action, index) => {
            setTimeout(() => {
              executeAction(action);
            }, index * 500); // Stagger actions slightly
          });
        }
      } else if (data.error) {
        console.error('Backend returned an error:', data.error);
        setMessages(prev => [...prev, { role: 'model', text: `Whimper... ${data.error}` }]);
      } else {
        setMessages(prev => [...prev, { role: 'model', text: 'Whimper... I received an empty response from my brain.' }]);
      }
    } catch (error) {
      if (error.name === 'AbortError') return;
      console.error('Pramp error:', error);
      const isOffline = error.message === 'Failed to fetch';
      setMessages(prev => [...prev, { role: 'model', text: isOffline ? 'the backend is not live right now' : `Whimper... ${error.message || 'I lost connection to my brain. Try again later!'}` }]);
    } finally {
      setIsThinking(false);
      setAbortController(null);
    }
  };

  const handleResizeMouseDown = (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = dimensions.width;
    const startHeight = dimensions.height;

    const handleMouseMove = (moveEvent) => {
      const deltaX = startX - moveEvent.clientX;
      const deltaY = startY - moveEvent.clientY;
      
      setDimensions({
        width: Math.max(300, Math.min(window.innerWidth * 0.9, startWidth + deltaX)),
        height: Math.max(400, Math.min(window.innerHeight * 0.8, startHeight + deltaY))
      });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <>
      {/* Pramp Avatar */}
      <PrampAvatar 
        position={position}
        isFlipped={isFlipped}
        isThinking={isThinking}
        isCelebrating={isCelebrating}
        avatarMessage={avatarMessage}
        onClick={() => setIsOpen(!isOpen)}
      />

      {/* Chat Window */}
      <div 
        style={!isExpanded ? { width: dimensions.width, height: dimensions.height } : {}}
        className={`fixed z-[90] flex flex-col bg-black/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden transition-[transform,opacity,inset] duration-500 origin-bottom-right ${
          !isOpen 
            ? 'bottom-32 right-8 scale-90 opacity-0 translate-y-10 pointer-events-none' 
            : isExpanded 
              ? 'top-4 left-4 right-4 bottom-4 w-auto h-auto scale-100 opacity-100 translate-y-0' 
              : 'bottom-32 right-8 scale-100 opacity-100 translate-y-0'
        }`}
      >
        {/* Custom Top-Left Resizer Handle */}
        {!isExpanded && (
          <div 
            onMouseDown={handleResizeMouseDown}
            className="absolute top-0 left-0 w-6 h-6 cursor-nwse-resize z-50 opacity-60 hover:opacity-100 transition-opacity group"
            title="Drag to resize"
          >
            <div className="absolute top-0 left-0 w-5 h-5 border-t-[5px] border-l-[5px] border-white/90 rounded-tl-3xl group-hover:scale-110 transition-transform origin-top-left" />
          </div>
        )}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsExpanded(!isExpanded)} className="text-white/50 hover:text-white transition-colors p-1 rounded-md hover:bg-white/10" title={isExpanded ? "Minimize" : "Expand"}>
              {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
            <div className="w-8 h-8 rounded-full bg-[#F4D09C]/20 flex items-center justify-center">
              🐶
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Pramp</h3>
              <p className="text-[10px] text-white/50 uppercase tracking-wider font-semibold">FAQs AI</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleClearChat} className="text-white/30 hover:text-white/70 transition-colors" title="Clear chat history">
              <Trash2 className="h-4 w-4" />
            </button>
            <button onClick={() => setIsOpen(false)} className="text-white/50 hover:text-white transition-colors ml-2" title="Close chat">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4 min-h-0">
          {messages.map((msg, idx) => {
            if (!msg.text) return null;
            
            // Strip out raw markdown asterisks if the LLM forgets the prompt rules
            const cleanText = msg.text.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1');

            return (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white/10 text-white/90 border border-white/5'}`}>
                  {cleanText}
                </div>
              </div>
            );
          })}
          {isThinking && (
            <div className="flex justify-start">
              <div className="bg-white/10 border border-white/5 rounded-2xl px-4 py-3 flex items-center justify-between gap-4 w-48">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-white/50" />
                  <span className="text-sm text-white/50">Sniffing...</span>
                </div>
                <button onClick={handleStop} className="text-white/50 hover:text-white transition-colors" title="Stop generating">
                  <Square className="h-3 w-3 fill-current" />
                </button>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="p-4 border-t border-white/10 bg-black/50">
          <form onSubmit={handleSend} className="flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask me anything..." 
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white/30 transition-colors"
            />
            <Button type="submit" disabled={!input.trim() || isThinking} size="icon" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shrink-0">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}
