import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignUp: (email: string, password: string, name: string) => Promise<void>;
  onLogin: (email: string, password: string) => Promise<void>;
  initialMode?: 'signup' | 'login';
}

export default function AuthModal({ isOpen, onClose, onSignUp, onLogin, initialMode = 'signup' }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(initialMode === 'signup');

  useEffect(() => {
    if (isOpen) {
      setIsSignUp(initialMode === 'signup');
    }
  }, [isOpen, initialMode]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        if (!name.trim()) {
          throw new Error('Please enter your name');
        }
        await onSignUp(email, password, name);
      } else {
        await onLogin(email, password);
      }
      // Reset form on success
      setEmail('');
      setPassword('');
      setName('');
      setError('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setEmail('');
    setPassword('');
    setName('');
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className="bg-[#18181b] border-2 border-[#3f3f47] rounded-[12px] p-[32px] w-full max-w-[400px] relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-[16px] right-[16px] text-[#9f9fa9] hover:text-[#f1f5f9] transition-colors"
        >
          <X size={24} />
        </button>

        <h2 className="font-['Inter:Bold',sans-serif] font-bold text-[#f8fafc] text-[28px] mb-[24px]">
          {isSignUp ? 'Sign Up' : 'Log In'}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-[16px]">
          {isSignUp && (
            <div className="flex flex-col gap-[8px]">
              <label className="font-['Inter:Medium',sans-serif] font-medium text-[#f1f5f9] text-[14px]">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-[#27272a] border border-[#3f3f47] rounded-[4px] px-[12px] py-[8px] text-[#f1f5f9] outline-none focus:border-[#8200db] transition-colors"
                placeholder="Enter your name"
              />
            </div>
          )}

          <div className="flex flex-col gap-[8px]">
            <label className="font-['Inter:Medium',sans-serif] font-medium text-[#f1f5f9] text-[14px]">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-[#27272a] border border-[#3f3f47] rounded-[4px] px-[12px] py-[8px] text-[#f1f5f9] outline-none focus:border-[#8200db] transition-colors"
              placeholder="Enter your email"
            />
          </div>

          <div className="flex flex-col gap-[8px]">
            <label className="font-['Inter:Medium',sans-serif] font-medium text-[#f1f5f9] text-[14px]">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="bg-[#27272a] border border-[#3f3f47] rounded-[4px] px-[12px] py-[8px] text-[#f1f5f9] outline-none focus:border-[#8200db] transition-colors"
              placeholder="Enter your password"
            />
          </div>

          {error && (
            <p className="text-red-500 text-[14px] font-['Inter:Medium',sans-serif]">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-[#8200db] hover:bg-[#9500f5] disabled:opacity-50 disabled:cursor-not-allowed text-[#f8fafc] font-['Geist:Medium',sans-serif] font-medium py-[12px] rounded-[8px] transition-colors mt-[8px]"
          >
            {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Log In')}
          </button>
        </form>

        <div className="mt-[24px] text-center">
          <button
            onClick={switchMode}
            className="text-[#8200db] hover:text-[#9500f5] font-['Inter:Medium',sans-serif] text-[14px] transition-colors"
          >
            {isSignUp ? 'Already have an account? Log In' : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}