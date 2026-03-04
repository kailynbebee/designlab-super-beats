import { useState, useEffect, useRef, useCallback } from 'react';
import { projectId, publicAnonKey } from '@/utils/supabase/info';
import { supabase } from '../../lib/supabase';
import svgPaths from "../../imports/svg-2blbi7adm0";
import AuthModal from './AuthModal';
import SavedBeatsModal from './SavedBeatsModal';
import ProfileModal from './ProfileModal';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-4266c10f`;

// Audio synthesis utilities
class DrumSynthesizer {
  private audioContext: AudioContext;

  constructor() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }

  playKick() {
    const now = this.audioContext.currentTime;
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(0.01, now + 0.5);
    
    gain.gain.setValueAtTime(1, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
    
    osc.connect(gain);
    gain.connect(this.audioContext.destination);
    
    osc.start(now);
    osc.stop(now + 0.5);
  }

  playSnare() {
    const now = this.audioContext.currentTime;
    
    // Noise
    const bufferSize = this.audioContext.sampleRate * 0.2;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noise = this.audioContext.createBufferSource();
    noise.buffer = buffer;
    
    const noiseFilter = this.audioContext.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.value = 1000;
    
    const noiseGain = this.audioContext.createGain();
    noiseGain.gain.setValueAtTime(1, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.audioContext.destination);
    
    // Tone
    const osc = this.audioContext.createOscillator();
    osc.frequency.setValueAtTime(200, now);
    
    const oscGain = this.audioContext.createGain();
    oscGain.gain.setValueAtTime(0.7, now);
    oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    
    osc.connect(oscGain);
    oscGain.connect(this.audioContext.destination);
    
    noise.start(now);
    noise.stop(now + 0.2);
    osc.start(now);
    osc.stop(now + 0.1);
  }

  playOpenHiHat() {
    const now = this.audioContext.currentTime;
    const fundamental = 40;
    const ratios = [2, 3, 4.16, 5.43, 6.79, 8.21];
    
    ratios.forEach(ratio => {
      const osc = this.audioContext.createOscillator();
      osc.type = 'square';
      osc.frequency.value = fundamental * ratio;
      
      const gain = this.audioContext.createGain();
      gain.gain.setValueAtTime(0.3 / ratios.length, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      
      const filter = this.audioContext.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 7000;
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.audioContext.destination);
      
      osc.start(now);
      osc.stop(now + 0.3);
    });
  }

  playClosedHiHat() {
    const now = this.audioContext.currentTime;
    const fundamental = 40;
    const ratios = [2, 3, 4.16, 5.43, 6.79, 8.21];
    
    ratios.forEach(ratio => {
      const osc = this.audioContext.createOscillator();
      osc.type = 'square';
      osc.frequency.value = fundamental * ratio;
      
      const gain = this.audioContext.createGain();
      gain.gain.setValueAtTime(0.2 / ratios.length, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
      
      const filter = this.audioContext.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 7000;
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.audioContext.destination);
      
      osc.start(now);
      osc.stop(now + 0.05);
    });
  }

  playClap() {
    const now = this.audioContext.currentTime;
    
    for (let i = 0; i < 3; i++) {
      const delay = i * 0.03;
      const bufferSize = this.audioContext.sampleRate * 0.1;
      const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
      const data = buffer.getChannelData(0);
      
      for (let j = 0; j < bufferSize; j++) {
        data[j] = Math.random() * 2 - 1;
      }
      
      const noise = this.audioContext.createBufferSource();
      noise.buffer = buffer;
      
      const filter = this.audioContext.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1000;
      
      const gain = this.audioContext.createGain();
      gain.gain.setValueAtTime(0.5, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.01, now + delay + 0.1);
      
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.audioContext.destination);
      
      noise.start(now + delay);
      noise.stop(now + delay + 0.1);
    }
  }

  playSound(instrument: string) {
    switch (instrument) {
      case 'kick':
        this.playKick();
        break;
      case 'snare':
        this.playSnare();
        break;
      case 'openHiHat':
        this.playOpenHiHat();
        break;
      case 'closedHiHat':
        this.playClosedHiHat();
        break;
      case 'clap':
        this.playClap();
        break;
    }
  }
}

interface BeatPattern {
  kick: boolean[];
  snare: boolean[];
  openHiHat: boolean[];
  closedHiHat: boolean[];
  clap: boolean[];
}

const INSTRUMENTS = ['kick', 'snare', 'openHiHat', 'closedHiHat', 'clap'] as const;
const INSTRUMENT_LABELS = ['Kick', 'Snare', 'Open Hi-hat', 'Closed Hi-hat', 'Clap'];
const STEPS = 16;

function IconWrapper({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="bg-[#27272a] content-stretch flex items-center p-[4px] relative rounded-[4px] shrink-0">
      <div aria-hidden="true" className="absolute border border-[#3f3f47] border-solid inset-0 pointer-events-none rounded-[4px]" />
      <div className="overflow-clip relative rounded-[4px] shrink-0 size-[20px]" data-name="Icon">
        {children}
      </div>
    </div>
  );
}

function Button1({ children, onClick }: React.PropsWithChildren<{ onClick?: () => void }>) {
  return (
    <button onClick={onClick} className="relative shrink-0 hover:bg-[#27272a] transition-colors rounded-[4px] flex gap-[8px] items-center justify-center p-[8px]">
      {children}
    </button>
  );
}

function Button({ children, onClick }: React.PropsWithChildren<{ onClick?: () => void }>) {
  return (
    <button onClick={onClick} className="bg-[#8200db] relative rounded-[8px] shrink-0 hover:bg-[#9500f5] transition-colors active:scale-95 flex gap-[4px] items-center justify-center p-[8px]">
      <div aria-hidden="true" className="absolute border border-[#ad46ff] border-solid inset-0 pointer-events-none rounded-[8px]" />
      {children}
    </button>
  );
}

type BeatGridInstrumentTitlesTextProps = {
  text: string;
};

function BeatGridInstrumentTitlesText({ text }: BeatGridInstrumentTitlesTextProps) {
  return (
    <div className="flex items-center p-[8px] relative w-full">
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[normal] not-italic relative text-[#9f9fa9] text-[20px] break-words">{text}</p>
    </div>
  );
}

type GridItemProps = {
  className?: string;
  isActive?: boolean;
  isCurrentStep?: boolean;
  onClick?: () => void;
};

function GridItem({ className, isActive = false, isCurrentStep = false, onClick }: GridItemProps) {
  return (
    <button
      onClick={onClick}
      className={`${className || `relative size-[40px] rounded-[8px] transition-all hover:scale-105 active:scale-95 ${
        isActive 
          ? 'bg-[#8200db] border-[#ad46ff]' 
          : 'bg-[#18181b] border-[#4a5565] hover:bg-[#27272a]'
      } ${
        isCurrentStep ? 'ring-2 ring-[#ad46ff] ring-offset-2 ring-offset-[#18181b]' : ''
      }`}`}
    >
      <div aria-hidden="true" className="absolute border border-solid inset-0 pointer-events-none rounded-[8px]" 
        style={{ borderColor: isActive ? '#ad46ff' : '#4a5565' }} />
    </button>
  );
}

export default function BeatMaker() {
  const [pattern, setPattern] = useState<BeatPattern>(() => ({
    kick: Array(STEPS).fill(false),
    snare: Array(STEPS).fill(false),
    openHiHat: Array(STEPS).fill(false),
    closedHiHat: Array(STEPS).fill(false),
    clap: Array(STEPS).fill(false),
  }));

  const [tempo, setTempo] = useState(120);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [user, setUser] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [authModalMode, setAuthModalMode] = useState<'signup' | 'login' | null>(null);
  const [showSavedBeatsModal, setShowSavedBeatsModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSaveNameModal, setShowSaveNameModal] = useState(false);
  const [saveNameInput, setSaveNameInput] = useState('');
  const [savedBeats, setSavedBeats] = useState<any[]>([]);
  
  const synthRef = useRef<DrumSynthesizer | null>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    synthRef.current = new DrumSynthesizer();
    checkSession();
  }, []);

  // Check for existing session
  const checkSession = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (session && !error) {
      setUser(session.user);
      setAccessToken(session.access_token);
      fetchBeats(session.access_token);
    }
  };

  // Refresh session and update state
  const refreshSession = async () => {
    const { data: { session }, error } = await supabase.auth.refreshSession();
    if (session && !error) {
      setUser(session.user);
      setAccessToken(session.access_token);
      return session.access_token;
    }
    return null;
  };

  // Fetch user's saved beats (refreshes token on 401 and retries)
  const fetchBeats = async (token: string) => {
    const doFetch = async (t: string) => {
      const response = await fetch(`${API_URL}/beats`, {
        headers: { 'Authorization': `Bearer ${t}` },
      });
      if (response.status === 401) return { status: 401, response };
      if (response.ok) {
        const data = await response.json();
        setSavedBeats(data.beats || []);
        return { status: 200 };
      }
      console.error('Failed to fetch beats:', await response.text());
      return { status: response.status };
    };

    try {
      let result = await doFetch(token);
      if (result.status === 401) {
        const newToken = await refreshSession();
        if (newToken) {
          await doFetch(newToken);
        }
      }
    } catch (error) {
      console.error('Error fetching beats:', error);
    }
  };

  const handleSignUp = async (email: string, password: string, name: string) => {
    try {
      const response = await fetch(`${API_URL}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ email, password, name }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to sign up. Please try again.');
      }

      // Now sign in
      await handleLogin(email, password);
    } catch (error: any) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        
        // Provide user-friendly error messages
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password. Please check your credentials and try again.');
        } else if (error.message.includes('Email not confirmed')) {
          throw new Error('Please confirm your email address before logging in.');
        } else if (error.message.includes('User not found')) {
          throw new Error('No account found with this email. Please sign up first.');
        } else {
          throw new Error(error.message || 'Login failed. Please try again.');
        }
      }

      if (data.session) {
        console.log('Login successful for user:', data.session.user.email);
        setUser(data.session.user);
        setAccessToken(data.session.access_token);
        fetchBeats(data.session.access_token);
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setAccessToken(null);
    setSavedBeats([]);
  };

  const handleUpdateProfile = async (file: File | null) => {
    if (!user || !accessToken) return;

    try {
      if (file) {
        // Upload new profile photo
        const formData = new FormData();
        formData.append('photo', file);

        const response = await fetch(`${API_URL}/profile/photo`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          console.error('Upload photo error response:', error);
          throw new Error(error.error || 'Failed to upload photo');
        }

        // Refresh session to get updated user metadata with new token
        await refreshSession();
      } else {
        // Delete profile photo
        const response = await fetch(`${API_URL}/profile/photo`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          const error = await response.json();
          console.error('Delete photo error response:', error);
          throw new Error(error.error || 'Failed to delete photo');
        }

        // Refresh session to get updated user metadata with new token
        await refreshSession();
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const handleSaveToCloud = () => {
    if (!user || !accessToken) {
      alert('Please log in to save beats to the cloud!');
      setAuthModalMode('login');
      return;
    }
    setSaveNameInput('');
    setShowSaveNameModal(true);
  };

  const handleSaveToCloudSubmit = async () => {
    const name = saveNameInput.trim();
    if (!name || !accessToken) return;

    setShowSaveNameModal(false);

    const doSave = async (token: string) => {
      const response = await fetch(`${API_URL}/beats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name, pattern, tempo }),
      });
      return response;
    };

    try {
      let response = await doSave(accessToken);
      let tokenUsed = accessToken;

      // On 401 (expired/invalid token), refresh session and retry once
      if (response.status === 401) {
        const newToken = await refreshSession();
        if (newToken) {
          response = await doSave(newToken);
          tokenUsed = newToken;
        } else {
          alert('Session expired. Please log out and log back in, then try again.');
          return;
        }
      }

      if (response.ok) {
        alert('Beat saved to cloud successfully!');
        fetchBeats(tokenUsed);
      } else {
        let errorMsg = `HTTP ${response.status}`;
        try {
          const data = await response.json();
          errorMsg = data.error || data.message || data.detail || errorMsg;
        } catch {
          errorMsg = await response.text() || errorMsg;
        }
        console.error('Save beat error:', response.status, errorMsg);
        alert(`Failed to save beat: ${errorMsg}`);
      }
    } catch (error) {
      console.error('Error saving beat:', error);
      alert(`Failed to save beat: ${error instanceof Error ? error.message : 'Network or server error'}`);
    }
  };

  const handleLoadBeat = (beat: any) => {
    setPattern(beat.pattern);
    setTempo(beat.tempo);
    setShowSavedBeatsModal(false);
    alert(`Loaded "${beat.name}"!`);
  };

  const handleDeleteBeat = async (beatId: string) => {
    if (!accessToken) return;

    try {
      const response = await fetch(`${API_URL}/beats/${beatId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        alert('Beat deleted successfully!');
        fetchBeats(accessToken);
      } else {
        alert('Failed to delete beat');
      }
    } catch (error) {
      console.error('Error deleting beat:', error);
      alert('Failed to delete beat');
    }
  };

  const handleOpenSavedBeats = async () => {
    if (!user || !accessToken) {
      alert('Please log in to view saved beats!');
      setAuthModalMode('login');
      return;
    }
    // Refresh session first to avoid stale token (fixes "Invalid JWT")
    const freshToken = await refreshSession();
    fetchBeats(freshToken || accessToken);
    setShowSavedBeatsModal(true);
  };

  const playStep = useCallback((step: number) => {
    if (!synthRef.current) return;
    
    INSTRUMENTS.forEach(instrument => {
      if (pattern[instrument][step]) {
        synthRef.current!.playSound(instrument);
      }
    });
  }, [pattern]);

  useEffect(() => {
    if (isPlaying) {
      const stepDuration = (60 / tempo / 4) * 1000; // 16th notes
      
      intervalRef.current = window.setInterval(() => {
        setCurrentStep(prevStep => {
          const nextStep = (prevStep + 1) % STEPS;
          playStep(nextStep);
          return nextStep;
        });
      }, stepDuration);
    } else {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setCurrentStep(-1);
    }

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, tempo, playStep]);

  const toggleBeat = (instrument: keyof BeatPattern, step: number) => {
    setPattern(prev => ({
      ...prev,
      [instrument]: prev[instrument].map((active, i) => i === step ? !active : active)
    }));
  };

  const handlePlayback = () => {
    setIsPlaying(prev => !prev);
  };

  const handleNew = () => {
    if (confirm('Are you sure you want to clear the current beat?')) {
      setPattern({
        kick: Array(STEPS).fill(false),
        snare: Array(STEPS).fill(false),
        openHiHat: Array(STEPS).fill(false),
        closedHiHat: Array(STEPS).fill(false),
        clap: Array(STEPS).fill(false),
      });
      setIsPlaying(false);
    }
  };

  const handleTempoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0 && value <= 300) {
      setTempo(value);
    }
  };

  return (
    <div className="content-stretch flex flex-col items-center justify-center relative size-full" data-name="SuperBeats Home">
      <div className="bg-[#18181b] relative shrink-0 w-full" data-name="Navbar">
        <div className="flex items-center justify-end px-[40px] py-[24px] relative w-full overflow-clip">
          <div className="flex gap-[8px] items-center" data-name="Navbar Actions">
            {user ? (
              <div className="flex gap-[8px] items-center">
                <Button1 onClick={() => setShowProfileModal(true)}>
                  {user.user_metadata?.profile_photo_url && (
                    <img 
                      src={user.user_metadata.profile_photo_url} 
                      alt="Profile" 
                      className="w-[32px] h-[32px] rounded-full object-cover border-2 border-[#3f3f47]"
                    />
                  )}
                  <p className="font-['Geist:Medium',sans-serif] font-medium leading-[normal] relative shrink-0 text-[#f1f5f9] text-[16px]">
                    Profile
                  </p>
                </Button1>
                <Button1 onClick={handleLogout}>
                  <p className="font-['Geist:Medium',sans-serif] font-medium leading-[normal] relative shrink-0 text-[#f1f5f9] text-[16px]">
                    Log Out
                  </p>
                </Button1>
              </div>
            ) : (
              <>
                <Button onClick={() => setAuthModalMode('signup')}>
                  <p className="font-['Geist:Medium',sans-serif] font-medium leading-[normal] relative shrink-0 text-[#f8fafc] text-[16px]">Sign Up</p>
                </Button>
                <Button1 onClick={() => setAuthModalMode('login')}>
                  <p className="font-['Geist:Medium',sans-serif] font-medium leading-[normal] relative shrink-0 text-[#f1f5f9] text-[16px]">Log In</p>
                </Button1>
              </>
            )}
          </div>
          <div className="-translate-x-1/2 -translate-y-1/2 absolute bg-[#8200db] left-1/2 top-[calc(50%+1px)] flex items-center justify-center px-[16px] py-[4px]" data-name="Logo Container">
            <p className="font-['Inter:Black_Italic',sans-serif] font-black italic leading-[normal] relative shrink-0 text-[#f8fafc] text-[36px]">Super Beats</p>
          </div>
        </div>
        
      </div>
      <div className="bg-gradient-to-b flex-[1_0_0] from-[#09090b] min-h-px min-w-px relative to-[#18181b] to-[87.258%] w-full" data-name="Main Content">
        <div className="overflow-clip rounded-[inherit] size-full">
          <div className="content-stretch flex flex-col items-start px-[80px] py-[40px] relative size-full">
            <div className="content-stretch flex flex-col items-start relative shadow-[0px_25px_50px_0px_rgba(0,0,0,0.25)] shrink-0 w-full" data-name="Beatmaker">
              <div className="bg-[#18181b] relative rounded-tl-[12px] rounded-tr-[12px] shrink-0 w-full" data-name="Playback Tools">
                <div className="overflow-clip rounded-[inherit] size-full">
                  <div className="content-stretch flex items-start justify-between px-[40px] py-[16px] relative w-full">
                    <div className="content-stretch flex gap-[40px] items-center relative shrink-0" data-name="Play Beat Toolbar (left)">
                      <div className="flex gap-[8px] items-center" data-name="Input Text">
                        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[normal] not-italic relative shrink-0 text-[#f1f5f9] text-[16px]">Tempo</p>
                        <div className="bg-[#27272a] flex items-center justify-center px-[16px] py-[4px] relative rounded-[2px]" data-name="Input">
                          <div aria-hidden="true" className="absolute border border-[#3f3f47] border-solid inset-0 pointer-events-none rounded-[2px]" />
                          <input
                            type="number"
                            value={tempo}
                            onChange={handleTempoChange}
                            className="bg-transparent font-['Inter:Medium',sans-serif] font-medium leading-[normal] not-italic text-[#f1f5f9] text-[16px] w-[60px] text-center outline-none"
                            min="40"
                            max="300"
                          />
                        </div>
                      </div>
                      <Button onClick={handlePlayback}>
                        <div className="overflow-clip relative shrink-0 size-[20px]" data-name="Icon">
                          <div className="absolute inset-[12.5%]" data-name="Icon">
                            <div className="absolute inset-[-5%]">
                              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.5 16.5">
                                <g id="Icon">
                                  {isPlaying ? (
                                    <>
                                      <rect x="3" y="2" width="4" height="12.5" fill="#F8FAFC" rx="1" />
                                      <rect x="9.5" y="2" width="4" height="12.5" fill="#F8FAFC" rx="1" />
                                    </>
                                  ) : (
                                    <>
                                      <path d={svgPaths.p3031a300} stroke="#F8FAFC" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                                      <path d={svgPaths.p2aad7200} stroke="#F8FAFC" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                                    </>
                                  )}
                                </g>
                              </svg>
                            </div>
                          </div>
                        </div>
                        <p className="font-['Geist:Medium',sans-serif] font-medium leading-[normal] relative shrink-0 text-[#f8fafc] text-[16px]">
                          {isPlaying ? 'Stop' : 'Playback'}
                        </p>
                      </Button>
                    </div>
                    <div className="content-stretch flex gap-[16px] items-center relative shrink-0" data-name="Save Beat Toolbar (right)">
                      <Button1 onClick={handleNew}>
                        <IconWrapper>
                          <div className="absolute inset-[9.38%_15.63%]" data-name="Icon">
                            <div className="absolute inset-[-4.62%_-5.45%]">
                              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.25 17.75">
                                <path d={svgPaths.p2543cf1} id="Icon" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                              </svg>
                            </div>
                          </div>
                        </IconWrapper>
                        <p className="font-['Geist:Medium',sans-serif] font-medium leading-[normal] relative shrink-0 text-[#f1f5f9] text-[16px]">New Beat</p>
                      </Button1>
                      <Button1 onClick={handleSaveToCloud}>
                        <IconWrapper>
                          <div className="absolute inset-[18.75%_9.38%]" data-name="Icon">
                            <div className="absolute inset-[-6%_-4.62%]">
                              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17.75 14">
                                <path d={svgPaths.pb0ea00} id="Icon" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                              </svg>
                            </div>
                          </div>
                        </IconWrapper>
                        <p className="font-['Geist:Medium',sans-serif] font-medium leading-[normal] relative shrink-0 text-[#f1f5f9] text-[16px]">Save to Cloud</p>
                      </Button1>
                      <Button1 onClick={handleOpenSavedBeats}>
                        <IconWrapper>
                          <div className="absolute inset-[15.63%_7.68%]" data-name="Icon">
                            <div className="absolute inset-[-5.45%_-4.43%]">
                              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18.4272 15.25">
                                <path d={svgPaths.p14df6180} id="Icon" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                              </svg>
                            </div>
                          </div>
                        </IconWrapper>
                        <p className="font-['Geist:Medium',sans-serif] font-medium leading-[normal] relative shrink-0 text-[#f1f5f9] text-[16px]">Saved Beats</p>
                      </Button1>
                    </div>
                  </div>
                </div>
                <div aria-hidden="true" className="absolute border-2 border-[#3f3f47] border-solid inset-0 pointer-events-none rounded-tl-[12px] rounded-tr-[12px]" />
              </div>
              <div className="bg-[#18181b] relative shrink-0 w-full" data-name="Beat Grid">
                <div className="content-stretch flex flex-col items-center overflow-clip py-[32px] relative rounded-[inherit] w-full">
                  <div className="relative shrink-0" data-name="BeatGrid">
                    <div className="flex flex-row items-center size-full">
                      <div className="content-stretch flex gap-[24px] items-center relative">
                        <div className="flex flex-row items-center self-stretch">
                          <div className="content-stretch flex flex-col gap-[8px] h-full items-start relative shrink-0" data-name="Track Titles">
                            <div className="content-stretch flex items-center justify-center p-[8px] relative shrink-0" data-name="Title">
                              <p className="font-['Inter:Medium',sans-serif] font-medium leading-[normal] not-italic relative shrink-0 text-[#3f3f47] text-[20px]">Tracks</p>
                            </div>
                            <div className="content-stretch flex flex-[1_0_0] flex-col items-start justify-between min-h-px min-w-px relative" data-name="Instrument Titles">
                              {INSTRUMENT_LABELS.map((label, i) => (
                                <BeatGridInstrumentTitlesText key={i} text={label} />
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0" data-name="Track Grid">
                          <div className="flex gap-[16px] items-center">
                            {Array.from({ length: STEPS }, (_, i) => (
                              <div key={i} className="flex items-center justify-center p-[8px] size-[40px]">
                                <p className="font-['Inter:Medium',sans-serif] font-medium leading-[normal] not-italic text-[#3f3f47] text-[16px]">
                                  {i + 1}
                                </p>
                              </div>
                            ))}
                          </div>
                          <div className="flex flex-col gap-[12px]" data-name="Instrument Grids">
                            {INSTRUMENTS.map((instrument) => (
                              <div key={instrument} className="flex gap-[16px] items-center py-[8px]">
                                {pattern[instrument].map((isActive, stepIndex) => (
                                  <GridItem
                                    key={stepIndex}
                                    isActive={isActive}
                                    isCurrentStep={isPlaying && currentStep === stepIndex}
                                    onClick={() => toggleBeat(instrument, stepIndex)}
                                  />
                                ))}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div aria-hidden="true" className="absolute border-[#3f3f47] border-b-2 border-l-2 border-r-2 border-solid inset-0 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <AuthModal
        isOpen={authModalMode !== null}
        onClose={() => setAuthModalMode(null)}
        onSignUp={handleSignUp}
        onLogin={handleLogin}
        initialMode={authModalMode ?? 'signup'}
      />
      <SavedBeatsModal
        isOpen={showSavedBeatsModal}
        onClose={() => setShowSavedBeatsModal(false)}
        beats={savedBeats}
        onLoadBeat={handleLoadBeat}
        onDeleteBeat={handleDeleteBeat}
      />
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        user={user}
        onUpdateProfile={handleUpdateProfile}
      />
      {showSaveNameModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={() => setShowSaveNameModal(false)}>
          <div
            className="bg-[#18181b] border-2 border-[#3f3f47] rounded-[12px] p-[32px] w-full max-w-[400px] relative"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-['Inter:Bold',sans-serif] font-bold text-[#f8fafc] text-[24px] mb-[16px]">
              Save to Cloud
            </h2>
            <p className="text-[#9f9fa9] text-[14px] mb-[16px]">
              Enter a name for this beat:
            </p>
            <input
              type="text"
              value={saveNameInput}
              onChange={(e) => setSaveNameInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveToCloudSubmit()}
              placeholder="My beat"
              className="w-full bg-[#27272a] border border-[#3f3f47] rounded-[8px] px-[16px] py-[12px] text-[#f8fafc] text-[16px] outline-none focus:border-[#8200db] mb-[24px]"
              autoFocus
            />
            <div className="flex gap-[12px] justify-end">
              <button
                onClick={() => setShowSaveNameModal(false)}
                className="px-[16px] py-[8px] rounded-[8px] text-[#9f9fa9] hover:text-[#f1f5f9] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveToCloudSubmit}
                disabled={!saveNameInput.trim()}
                className="bg-[#8200db] hover:bg-[#9500f5] disabled:opacity-50 disabled:cursor-not-allowed text-[#f8fafc] px-[16px] py-[8px] rounded-[8px] transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}