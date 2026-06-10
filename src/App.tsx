import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Briefcase, 
  TrendingUp, 
  Coins, 
  Users, 
  BookOpen, 
  Sparkles, 
  Lock, 
  Unlock, 
  ShieldCheck, 
  CheckCircle2, 
  Copy, 
  Download, 
  Search, 
  Building2, 
  Filter, 
  ArrowRight, 
  ArrowLeft,
  ChevronDown, 
  ChevronUp, 
  RefreshCw, 
  FileText, 
  HelpCircle, 
  Phone, 
  User, 
  Check, 
  ExternalLink, 
  Menu, 
  X,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Quote,
  Sprout,
  MapPin,
  Award,
  MessageSquare,
  GraduationCap
} from 'lucide-react';
import { 
  curatedOpportunities, 
  africanTestimonials, 
  tanzaniaPaymentCarriers, 
  faqs 
} from './data';
import { uiTranslations, getTranslatedOpportunities, getTranslatedTestimonials } from './translations';
import { SkeletonRow } from './components/SkeletonCard';
import { BusinessPlanInput, PitchDeckInput, Opportunity } from './types';
import { generatePDF } from './pdfExporter';
import confetti from 'canvas-confetti';
import ScholarshipSection from './components/ScholarshipSection';
import DashboardView from './components/DashboardView';
import OpportunityNotificationSignup from './components/OpportunityNotificationSignup';
import OpportunityReminderActions from './components/OpportunityReminderActions';
import OpportunityReminderCalendarPanel from './components/OpportunityReminderCalendarPanel';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import Auth from './components/Auth';
import { MatchingScoreChart } from './components/MatchingScoreChart';
import ContactForm from './components/ContactForm';
import AdminDashboard from './components/AdminDashboard';
import { subscriptionService } from './lib/subscriptionService';
import PaymentModal from './components/PaymentModal';

// Resolves real official application web links for opportunities
export const getOpportunityLink = (opp: any): string => {
  if (opp.link) return opp.link;
  
  const fallbackLinks: Record<string, string> = {
    'opp-1': 'https://www.tonyelumelufoundation.org/e-programme-details',
    'opp-2': 'https://www.tadb.co.tz',
    'opp-3': 'https://www.costech.or.tz',
    'opp-4': 'https://mastercardfdn.org',
    'opp-5': 'https://anzishaprize.org',
    'opp-6': 'https://pass.or.tz',
    'opp-7': 'http://www.sido.go.tz',
    'opp-8': 'https://www.ycombinator.com/apply',
    'opp-9': 'https://savannah.vc',
    'opp-10': 'https://saharaventures.com',
    'opp-11': 'https://www.usadf.gov/apply',
    'opp-12': 'https://www.crdbbank.co.tz',
    'opp-13': 'https://www.nmbbank.co.tz',
    'opp-14': 'https://startup.google.com/accelerator/africa/',
    'opp-15': 'https://www.forwomeninscience.com',
    'opp-16': 'https://heinekenafricafoundation.org',
    'opp-17': 'https://equitybank.co.tz',
    'opp-18': 'http://www.akiiraone.com',
    'opp-19': 'https://climatejusticealliance.org',
    'opp-20': 'https://www.safaricom.co.ke',
    'opp-21': 'https://www.chevening.org/scholarship/tanzania/',
    'opp-22': 'https://tz.usembassy.gov/education-culture/educational-exchange-programs/',
    'opp-23': 'https://www.modewjifoundation.org/contact',
    'opp-25': 'https://www.zawadiafrica.org',
    'opp-26': 'https://www.tanzaniawomensfund.org',
    'opp-27': 'https://www.socialimpactfoundation.org',
    'opp-28': 'https://anitab.org',
    'opp-29': 'http://www.sido.go.tz',
  };
  
  const rawId = (opp.id || '').toString().trim();
  return fallbackLinks[rawId] || fallbackLinks[rawId.replace('opp-', '')] || 'https://www.google.com/search?q=' + encodeURIComponent(opp.title + ' ' + (opp.provider || ''));
};

export default function App() {
  // Page Title and Dynamic Google SEO Setup
  useEffect(() => {
    document.title = "FundSeed | Ruzuku, Ufadhili wa ruzuku na Biashara - Kilimo biashara Tanzania na Business planning AI";
    
    // Inject SEO meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', 'FundSeed ni mfumo thabiti wa AI na dharura inayokuunganisha na ruzuku 50+ (Grants) zilizothibitishwa nchini Tanzania. Tengeneza Business Plan ya "Kilimo biashara Tanzania" na "Ufadhili wa ruzuku" kwa kutumia "Business planning AI" kwa ufanisi zaidi.');

    // Inject SEO keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', 'FundSeed, ruzuku Tanzania, Kilimo biashara Tanzania, Ufadhili wa ruzuku, Business planning AI, mikopo ya bodi ya mikopo, kupata mtaji wa kuanzisha biashara, ruzuku za kilimo nchini Tanzania, business plan ya Kiswahili, pitch deck ya AI Tanzania, SIDO, TADB, USADF, Tony Elumelu Foundation Tanzania');
  }, []);

  // Internationalization State ('sw' = Swahili, 'en' = English)
  const [lang, setLang] = useState<'sw' | 'en'>(() => {
    const saved = localStorage.getItem('fundseed_lang');
    return (saved === 'en' || saved === 'sw') ? saved : 'sw';
  });

  // Keep language synchronized on updates
  useEffect(() => {
    localStorage.setItem('fundseed_lang', lang);
  }, [lang]);

  // Auth & Multi-User Dashboards State
  const [user, setUser] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isPaid, setIsPaid] = useState<boolean>(false);
  const [isLoadingSub, setIsLoadingSub] = useState(true);
  
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // PWA Install Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallPWA = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the A2HS prompt');
        }
        setDeferredPrompt(null);
        setShowInstallBtn(false);
      });
    }
  };

  // Manage global database of registered users
  const [users, setUsers] = useState<any[]>(() => {
    const saved = localStorage.getItem('fundseed_all_users_db');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    const defaultUsers = [
      { id: 'usr-1', name: 'Baraka John', email: 'baraka.john@geita.go.tz', isPaid: false, registeredAt: '2026-06-01', draftsCount: 0 },
      { id: 'usr-2', name: 'Juma Hamisi', email: 'juma.hamisi@gmail.com', isPaid: true, registeredAt: '2026-06-03', draftsCount: 2 },
      { id: 'usr-3', name: 'Neema Swai', email: 'neema.swai@outlook.com', isPaid: true, registeredAt: '2026-06-04', draftsCount: 1 },
      { id: 'usr-4', name: 'Mariam Rashid', email: 'mariam.rashid@gmail.com', isPaid: true, registeredAt: '2026-06-05', draftsCount: 3 },
      { id: 'usr-5', name: 'Emmanuel Kessy', email: 'emmanuel.kessy@gmail.com', isPaid: false, registeredAt: '2026-06-07', draftsCount: 0 }
    ];
    localStorage.setItem('fundseed_all_users_db', JSON.stringify(defaultUsers));
    return defaultUsers;
  });

  // Track AI draft logs
  const [savedDrafts, setSavedDrafts] = useState<any[]>(() => {
    const saved = localStorage.getItem('fundseed_saved_drafts_log_db');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    const initialDrafts = [
      { id: 'drf-1', userEmail: 'juma.hamisi@gmail.com', userName: 'Juma Hamisi', title: 'Salama Organic Poultry', type: 'Business Plan', date: '2026-06-03', content: 'Mpango wa kibiashara uliyofanikisha mkopo wa SIDO.' },
      { id: 'drf-2', userEmail: 'juma.hamisi@gmail.com', userName: 'Juma Hamisi', title: 'Hamisi Greenhouses', type: 'Pitch Deck', date: '2026-06-04', content: 'Mchanganuo mkuu wa uwekezaji kwa ajili ya kilimo cha nyanya nchini.' },
      { id: 'drf-3', userEmail: 'neema.swai@outlook.com', userName: 'Neema Swai', title: 'Pwani Soap Industry', type: 'Business Plan', date: '2026-06-04', content: 'Kiwanda kidogo cha sabuni asilia soko la Pwani.' }
    ];
    localStorage.setItem('fundseed_saved_drafts_log_db', JSON.stringify(initialDrafts));
    return initialDrafts;
  });

  // Custom opportunities from Firestore
  const [dbOpps, setDbOpps] = useState<any[]>([]);
  const [isLoadingOpps, setIsLoadingOpps] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'opportunities'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const opps = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDbOpps(opps);
      setIsLoadingOpps(false);
    }, (error) => {
      console.error("App.tsx onSnapshot error:", error);
      setIsLoadingOpps(false);
    });

    return () => unsubscribe();
  }, []);

  // Use Firestore data, or static curated data as fallback if empty/loading
  // In addition, automatically merge any static curated opportunities (such as TRA Innovation)
  // that are present in curatedOpportunities but not yet in the Firestore database.
  let allOppsInSystem = dbOpps.length > 0 ? dbOpps : curatedOpportunities;
  if (dbOpps.length > 0) {
    const existingTitles = new Set(dbOpps.map((o: any) => o.title.toLowerCase().trim()));
    const unseededStaticOpps = curatedOpportunities.filter(
      (g) => !existingTitles.has(g.title.toLowerCase().trim())
    );
    allOppsInSystem = [...unseededStaticOpps, ...dbOpps];
  }

  // Dynamic translated data arrays based on active language (SW or EN)
  const activeOpportunities = getTranslatedOpportunities(allOppsInSystem, lang);
  const activeTestimonials = getTranslatedTestimonials(africanTestimonials, lang);

  // Active Testimonial Index State for the success story slider
  const [activeTestimonialIdx, setActiveTestimonialIdx] = useState<number>(0);

  // Auto-rotating Testimonials timer (every 8 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonialIdx((prev) => (prev + 1) % activeTestimonials.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [activeTestimonials]);

  const currentTest = activeTestimonials[activeTestimonialIdx];

  // User Tagging & Grant Matching State
  const [userInterests, setUserInterests] = useState<string[]>(() => {
    const saved = localStorage.getItem('fundseed_user_interests');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse user interests:", e);
      }
    }
    return [];
  });

  const handleSaveInterests = (interests: string[]) => {
    setUserInterests(interests);
    localStorage.setItem('fundseed_user_interests', JSON.stringify(interests));
    window.dispatchEvent(new Event('fundseed_interests_sync'));
  };

  useEffect(() => {
    const handleSync = () => {
      const saved = localStorage.getItem('fundseed_user_interests');
      if (saved) {
        try {
          setUserInterests(JSON.parse(saved));
        } catch (e) {}
      } else {
        setUserInterests([]);
      }
    };
    
    const handleGrantsRedirect = () => {
      setCurrentPage('grants');
      setTimeout(() => {
        const target = document.getElementById('grants-view-destination') || document.getElementById('opp-list-section');
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }, 150);
    };

    window.addEventListener('fundseed_interests_sync', handleSync);
    window.addEventListener('fundseed_navigate_grants', handleGrantsRedirect);
    return () => {
      window.removeEventListener('fundseed_interests_sync', handleSync);
      window.removeEventListener('fundseed_navigate_grants', handleGrantsRedirect);
    };
  }, []);

  // Sync subscription status from Firestore
  useEffect(() => {
    if (user) {
      subscriptionService.getSubscription(user.uid, user.email || '', user.displayName || 'User')
        .then((sub) => {
          setCurrentUser(sub);
          setIsPaid(sub.isPaid);
          setIsLoadingSub(false);
        })
        .catch((error) => {
          console.error("Failed to sync sub from Firestore, checking offline fallback:", error);
          // Graceful fallback to preserve UI interactivity on offline/restricted networks
          setCurrentUser({
            userId: user.uid,
            email: user.email || '',
            name: user.displayName || 'User',
            isPaid: false
          });
          setIsPaid(false);
          setIsLoadingSub(false);
        });
    } else {
      setCurrentUser(null);
      setIsPaid(false);
      setIsLoadingSub(false);
    }
  }, [user]);

  const handleUnlockVIP = () => {
    if (!user) {
      setShowAuthModal(true);
    } else {
      setShowPaymentModal(true);
    }
  };

  const handlePaymentSuccess = async () => {
    // Local state update when webhook successfully unlocks the account
    setIsPaid(true);
    setCurrentUser((prev: any) => prev ? { ...prev, isPaid: true } : prev);
    setShowPaymentModal(false);
    
    if (user) {
      try {
        await subscriptionService.processPayment(user.uid, 20000, "MOCK_GATEWAY", user.displayName || undefined);
      } catch (err) {
        console.error("Failed to sync payment state:", err);
      }
    }
    
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  useEffect(() => {
    return onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
    });
  }, []);

  // Current page view state ('home', 'grants', 'scholarships', 'dashboard')
  const [currentPage, setCurrentPage] = useState<'home' | 'grants' | 'scholarships' | 'dashboard' | 'academy' | 'mentorship'>('home');

  // Handle universal checkouts from any sub-page back to home's pricing deck
  const handleNavigateToCheckout = () => {
    setCurrentPage('home');
    window.location.hash = '#bei';
    setTimeout(() => {
      const el = document.getElementById('bei');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else if (checkoutSectionRef.current) {
        checkoutSectionRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 120);
  };

  // Handle URL hash routing or manual toggle for separate pages
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#/grants' || hash === '#grants') {
        setCurrentPage('grants');
        window.scrollTo({ top: 0, behavior: 'auto' });
      } else if (hash === '#/scholarships' || hash === '#scholarships') {
        setCurrentPage('scholarships');
        window.scrollTo({ top: 0, behavior: 'auto' });
      } else if (hash === '#/dashboard' || hash === '#dashboard' || hash === '#/smart-draft' || hash === '#smart-draft') {
        setCurrentPage('dashboard');
        window.scrollTo({ top: 0, behavior: 'auto' });
      } else if (hash === '#/academy' || hash === '#academy') {
        setCurrentPage('academy');
        window.scrollTo({ top: 0, behavior: 'auto' });
      } else if (hash === '#/mentorship' || hash === '#mentorship') {
        setCurrentPage('mentorship');
        window.scrollTo({ top: 0, behavior: 'auto' });
      } else {
        setCurrentPage('home');
        if (hash && hash !== '#/' && hash !== '#home') {
          // Allow some time for render cycle to put objects in DOM then navigate
          setTimeout(() => {
            const cleanId = hash.startsWith('#') ? hash.substring(1).replace(/^\//, '') : hash;
            const element = document.getElementById(cleanId);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth' });
            }
          }, 150);
        }
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Search & Filter state for Opportunities
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('zote');
  const [originFilter, setOriginFilter] = useState<string>('zote');
  const [expandedOpportunity, setExpandedOpportunity] = useState<string | null>(null);

  // Checkout Payment state
  const [fullName, setFullName] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [selectedCarrier, setSelectedCarrier] = useState<string>('voda');
  const [paymentStep, setPaymentStep] = useState<'idle' | 'preparing' | 'processing' | 'success'>('idle');
  const [paymentTimer, setPaymentTimer] = useState<number>(0);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Trigger professional celebratory confetti when payment is successful
  useEffect(() => {
    if (paymentStep === 'success') {
      // 1. Initial big celebratory blast from the center
      confetti({
        particleCount: 150,
        spread: 85,
        origin: { y: 0.6 },
        colors: ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6']
      });

      // 2. Sequential side-cannon blasts for ongoing joy during 3 seconds
      const end = Date.now() + 3000;
      const interval = setInterval(() => {
        if (Date.now() > end) {
          clearInterval(interval);
          return;
        }

        // Left side cannon
        confetti({
          particleCount: 45,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.85 },
          colors: ['#10b981', '#3b82f6', '#f59e0b']
        });

        // Right side cannon
        confetti({
          particleCount: 45,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.85 },
          colors: ['#10b981', '#3b82f6', '#6366f1']
        });
      }, 400);

      return () => clearInterval(interval);
    }
  }, [paymentStep]);

  // Interactive AI Generation Tool state
  const [activeTool, setActiveTool] = useState<'business-plan' | 'pitch-deck'>('business-plan');
  const [academyTab, setAcademyTab] = useState<'mbona-kufeli' | 'miradi-kipaumbele' | 'incubator-vs-accelerator'>('mbona-kufeli');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [genStepMessage, setGenStepMessage] = useState<string>('');
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Form Fields Prefill for easy testing/demo
  const [bpForm, setBpForm] = useState<BusinessPlanInput>({
    businessName: 'Salama Organic Poultry',
    industry: 'Kilimo na Ufugaji',
    problem: 'Ukosefu wa kuku salama wa kienyeji na mayai ya uhakika yasiyo na kemikali katika wilaya ya Kigamboni, Dar es Salaam.',
    solution: 'Kuanzisha mradi wa kisasa wa kuzalisha, kusindika, na kusambaza kuku wa kienyeji na mayai asilia kwa teknolojia ya kulisha chakula cha asili kisicho na kemikali.',
    targetCustomers: 'Hoteli, migahawa ya kiwango cha juu, na mama lishe nchini Kigamboni na Temeke.',
    budgetString: 'Milioni 15 TZS (Kwa ajili ya mizinga ya chakula, vizimba thabiti, na vifaa vya chanjo ya asili)'
  });

  const [pdForm, setPdForm] = useState<PitchDeckInput>({
    startupName: 'Rafiki Logistics',
    industry: 'Teknolojia na Usafirishaji',
    problem: 'Wakulima wa Lushoto wanapata hasara ya 40% ya mboga mboga kabla ya kufika sokoni Dar es Salaam kwa sababu ya kukosa magari yenye mifumo ya ubaridi na usafiri wa haraka.',
    solution: 'Kutengeneza application inayounganisha gari zilizopo barabarani zenye mifumo ya baridi na wakulima wadogo wadogo kushiriki gharama za usafiri kwa njia rahisi ya simu (Uber ya mazao ya baridi).',
    marketSize: 'Wakulima wadogo zaidi ya 30,000 Lushoto na soko la mazao safi la TZS Bilioni 2.5 kwa mwaka Dar es Salaam.',
    businessModel: 'Tutapokea asilimia 12% ya kila mauzo ya mazao yanayosafirishwa kupitia mtandao wetu.',
    fundingNeeds: 'Milioni 30 TZS kwa ajili ya kuanzisha mfumo (App) na kukodisha gari mbili za kwanza za majaribio.'
  });

  // Reference for smooth scrolling
  const checkoutSectionRef = useRef<HTMLDivElement>(null);
  const aiToolSectionRef = useRef<HTMLDivElement>(null);
  const projectsSliderRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (ref && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Present payment modal
  const handleStartPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setShowPaymentModal(true);
  };

  // Reset payment flow to try again
  const handleResetPayment = () => {
    setPaymentStep('idle');
    setFullName('');
    setPhoneNumber('');
  };

  // Submit trigger to backend to write Business Plan / Pitch Deck
  const handleGenerateAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPaid) {
      setGenerationError('Tafadhali kamilisha malipo yako ya TZS 20,000 ili kutumia zana kamili ya AI.');
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);
    setAiResult(null);

    // Dynamic loading messages to increase delight
    const messages = [
      'Inakaribisha AI Assistant yetu...',
      'Inachambua soko la Tanzania na sekta uliyochagua...',
      'Inatengeneza muundo wa malengo ya soko na bajeti...',
      'Inashona andishi lako makini kwa lugha fasaha ya Kiswahili...'
    ];
    let msgIdx = 0;
    setGenStepMessage(messages[0]);
    const msgInterval = setInterval(() => {
      msgIdx = (msgIdx + 1) % messages.length;
      setGenStepMessage(messages[msgIdx]);
    }, 2000);

    try {
      const endpoint = activeTool === 'business-plan' 
        ? '/api/smart-draft/business-plan' 
        : '/api/smart-draft/pitch-deck';
      
      const payload = activeTool === 'business-plan' ? bpForm : pdForm;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let errorMessage = 'Imeshindwa kuwasiliana na seva. Tafadhali jaribu tena baada ya muda mdogo.';
        try {
          const errorData = await response.json();
          if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (e) {
          // ignore error parsing
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      clearInterval(msgInterval);
      setAiResult(data.result);
    } catch (err: any) {
      clearInterval(msgInterval);
      setGenerationError(err.message || 'Hitilafu isiyotarajiwa imetokea.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Copy to clipboard logic helper
  const handleCopyToClipboard = () => {
    if (!aiResult) return;
    navigator.clipboard.writeText(aiResult)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        alert('Imeshindwa kunakili. Tafadhali chagua kila kitu ukinakili mwenyewe.');
      });
  };

  // Download logic helper (Generates a professional PDF)
  const handleDownloadFile = () => {
    if (!aiResult) return;
    const title = activeTool === 'business-plan' ? 'Business_Plan' : 'Investor_Pitch_Deck';
    // Basic cleaning of markdown symbols
    const cleanContent = aiResult.replace(/\*\*/g, '').replace(/### /g, '').replace(/## /g, '').replace(/# /g, '');
    generatePDF(cleanContent, title);
  };

  // Filter curated opportunities based on Category, Origin, and Search Search-input
  const filteredOpportunities = activeOpportunities.filter((opp) => {
    const matchesSearch = 
      opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'zote' || opp.category === categoryFilter;
    const matchesOrigin = originFilter === 'zote' || opp.origin === originFilter;

    return matchesSearch && matchesCategory && matchesOrigin;
  });

  // Basic custom markdown formatter to display output nicely on a page
  const renderFormattedMarkdown = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      // Match headings
      if (line.startsWith('# ')) {
        return <h1 key={idx} className="text-2xl font-bold text-slate-800 border-b border-stone-200 pb-2 mt-6 mb-3 font-display">{line.substring(2)}</h1>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={idx} className="text-xl font-semibold text-slate-800 mt-5 mb-2 font-display">{line.substring(3)}</h2>;
      }
      if (line.startsWith('### ')) {
        return <h3 key={idx} className="text-lg font-medium text-slate-800 mt-4 mb-2 font-display">{line.substring(4)}</h3>;
      }
      // Match lists
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return <li key={idx} className="ml-5 list-disc text-slate-700 py-0.5 leading-relaxed">{line.substring(2)}</li>;
      }
      if (line.match(/^\d+\.\s/)) {
        return <li key={idx} className="ml-5 list-decimal text-slate-700 py-0.5 leading-relaxed">{line.replace(/^\d+\.\s/, '')}</li>;
      }
      // Empty line
      if (line.trim() === '') {
        return <div key={idx} className="h-2"></div>;
      }
      
      // Remove all ** from the line
      const cleanLine = line.replace(/\*\*/g, '');
      return <p key={idx} className="text-slate-700 leading-relaxed py-1">{cleanLine}</p>;
    });
  };

  const getOpportunityMatches = (opp: any, interests: string[]): string[] => {
    if (!interests || interests.length === 0) return [];
    const matches: string[] = [];
    const fullText = `${opp.title} ${opp.provider || ''} ${opp.description || ''} ${(opp.eligibility || []).join(' ')}`.toLowerCase();

    interests.forEach(interest => {
      if (interest === 'Agriculture') {
        const keywords = ['kilimo', 'ufugaji', 'uvuvi', 'chakula', 'agri', 'farm', 'crop', 'usindikaji', 'mnyororo wa thamani', 'tadb', 'pass trust', 'sido'];
        if (keywords.some(kw => fullText.includes(kw))) {
          matches.push('Agriculture');
        }
      } else if (interest === 'Tech') {
        const keywords = ['teknolojia', 'sayansi', 'tech', 'software', 'programming', 'digital', 'ubunifu', 'innovat', 'startup', 'fintech', 'app', 'web', 'system', 'costech', 'y combinator'];
        if (keywords.some(kw => fullText.includes(kw))) {
          matches.push('Tech');
        }
      } else if (interest === 'Education') {
        const keywords = ['elimu', 'masomo', 'chuo', 'research', 'academic', 'scholarship', 'university', 'tafiti', 'costech', 'shule'];
        if (keywords.some(kw => fullText.includes(kw))) {
          matches.push('Education');
        }
      } else if (interest === 'Healthcare') {
        const keywords = ['afya', 'hospital', 'health', 'biotech', 'matibabu', 'wagonjwa', 'dawa', 'medicine'];
        if (keywords.some(kw => fullText.includes(kw))) {
          matches.push('Healthcare');
        }
      } else if (interest === 'Women') {
        const keywords = ['wanawake', 'mwanamke', 'kike', 'women', 'girl', 'gender', 'female'];
        if (keywords.some(kw => fullText.includes(kw))) {
          matches.push('Women');
        }
      } else if (interest === 'Youth') {
        const keywords = ['vijana', 'youth', 'young', 'umri', 'student', 'kijana', 'anzisha', 'shule'];
        if (keywords.some(kw => fullText.includes(kw))) {
          matches.push('Youth');
        }
      }
    });

    return matches;
  };

  const renderOpportunityCard = (opp: any, idx: number, isMatchSection = false) => {
    const isExpanded = expandedOpportunity === opp.id;
    const matches = getOpportunityMatches(opp, userInterests);
    const matchPercentage = userInterests.length > 0 
      ? Math.min(Math.round((matches.length / userInterests.length) * 100), 100) 
      : 0;
    
    return (
      <motion.div 
        key={`${opp.id}-${isMatchSection ? 'match' : 'standard'}`}
        id={`opp-card-${opp.id}`}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ 
          opacity: { duration: 0.4 },
          y: { type: 'spring', stiffness: 100, damping: 15 },
          delay: Math.min(idx * 0.05, 0.3)
        }}
        whileHover={{ 
          y: -6,
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.03), 0 0 0 1px rgba(16, 185, 129, 0.18)",
          borderColor: "rgb(16, 185, 129)"
        }}
        className={`rounded-2xl border bg-white shadow-sm transition-colors duration-200 overflow-hidden ${
          isExpanded ? 'border-emerald-500 ring-1 ring-emerald-500/10' : 'border-stone-200'
        } ${isMatchSection ? 'border-emerald-305 bg-emerald-50/5/10 shadow-emerald-50 ring-1 ring-emerald-500/15' : ''}`}
      >
        
        {/* Top Row visible panel */}
        <div 
          onClick={() => setExpandedOpportunity(isExpanded ? null : opp.id)}
          className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer hover:bg-stone-50/50"
        >
          <div className="space-y-1.5 flex-1 select-none">
            
            {/* Headers */}
            <div className="flex flex-wrap items-center gap-2.5 text-[11px] font-bold">
              <span className={`px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                opp.category === 'ruzuku' ? 'bg-emerald-100 text-emerald-800' :
                opp.category === 'mkopo' ? 'bg-blue-100 text-blue-800' :
                opp.category === 'equity' ? 'bg-indigo-100 text-indigo-800' :
                'bg-amber-100 text-amber-800'
              }`}>
                {opp.category === 'ruzuku' ? (lang === 'sw' ? 'Ruzuku' : 'Grant') :
                 opp.category === 'mkopo' ? (lang === 'sw' ? 'Mkopo wa Nafuu' : 'Soft Loan') :
                 opp.category === 'equity' ? (lang === 'sw' ? 'Uwekezaji (Equity)' : 'Equity Investor') :
                 (lang === 'sw' ? 'Incubator & Training' : 'Incubator & Training')}
              </span>

              {isMatchSection && (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white flex items-center gap-1 font-black animate-pulse">
                  <Sparkles className="h-3 w-3" />
                  <span>{lang === 'sw' ? 'DODOSO LIFANANA' : 'QUIZ MATCH'}</span>
                </span>
              )}

              <span className={`px-2 py-0.5 rounded-full border flex items-center gap-1.5 ${
                opp.origin === 'Tanzania' 
                  ? 'bg-stone-50 text-stone-700 border-stone-200' 
                  : 'bg-indigo-50/30 text-indigo-700 border-indigo-100'
              }`}>
                <MapPin className="h-3 w-3 text-emerald-600" />
                <span>{opp.origin}</span>
              </span>

              <span className="text-stone-400">
                {lang === 'sw' ? 'Mwisho:' : 'Deadline:'} {opp.deadline}
              </span>

              <OpportunityReminderActions 
                opp={opp}
                lang={lang}
                compact={true}
                onReminderChanged={() => {
                  window.dispatchEvent(new Event('fundseed_reminder_sync'));
                }}
              />
            </div>

            <h3 className="text-base font-bold text-stone-900 font-display hover:text-emerald-700 leading-tight">
              {opp.title}
            </h3>

            <p className="text-xs text-stone-500 flex items-center space-x-1 font-semibold">
              <span>{lang === 'sw' ? 'Mtoa Programu:' : 'Provider:'}</span>
              <span className="text-stone-750">{opp.provider}</span>
            </p>

            {/* Tags matching details */}
            {matches.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] text-stone-450 uppercase font-bold tracking-widest">{lang === 'sw' ? 'Yaliyooana:' : 'Interests matched:'}</span>
                {matches.map(m => (
                  <span key={m} className="px-1.5 py-0.5 text-[9px] font-bold rounded-md bg-stone-100 text-stone-700 border border-stone-200">
                    {m === 'Agriculture' ? (lang === 'sw' ? '🌾 Kilimo' : '🌾 Agriculture') :
                     m === 'Tech' ? (lang === 'sw' ? '💻 Teknolojia' : '💻 Tech') :
                     m === 'Education' ? (lang === 'sw' ? '🎓 Elimu' : '🎓 Education') :
                     m === 'Healthcare' ? (lang === 'sw' ? '🏥 Afya' : '🏥 Healthcare') :
                     m === 'Women' ? (lang === 'sw' ? '👩‍💼 Wanawake' : '👩‍💼 Women') :
                     m === 'Youth' ? (lang === 'sw' ? '🧑‍💻 Vijana' : '🧑‍💻 Youth') : m}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Right Amount display & toggle */}
          <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-stone-105">
            {/* Matching Score Gauge Visualization */}
            <MatchingScoreChart 
              score={matchPercentage} 
              lang={lang} 
              hasInterests={userInterests.length > 0} 
              onTakeQuiz={() => {
                setCurrentPage('dashboard');
                setActiveTool('business-plan');
                setTimeout(() => {
                  const el = document.getElementById('matching-quiz-card');
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 150);
              }}
            />

            <div className="text-left sm:text-right">
              <span className="text-xs text-stone-400 block">{lang === 'sw' ? 'Kiwango cha Juu' : 'Max Funding'}</span>
              <span className="text-sm font-extrabold text-emerald-700">{opp.amount}</span>
            </div>
            
            <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-stone-100 text-stone-600 border border-stone-200/80">
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
          </div>

        </div>

        {/* Expandable internal details */}
        {isExpanded && (
          <div className="bg-stone-50/70 py-5 px-6 border-t border-stone-100 space-y-4 text-xs font-sans">
            
            {/* Description */}
            <div>
              <h4 className="font-bold text-stone-850 uppercase text-[10px] tracking-wide mb-1 flex items-center space-x-1.5 font-display">
                <FileText className="h-3.5 w-3.5 text-emerald-600" />
                <span>{lang === 'sw' ? 'Maelezo ya Fursa' : 'Opportunity Description'}</span>
              </h4>
              <p className="text-stone-660 leading-relaxed text-xs">
                {opp.description}
              </p>
            </div>

            {/* Eligibility */}
            <div>
              <h4 className="font-bold text-stone-850 uppercase text-[10px] tracking-wide mb-1.5 flex items-center space-x-1.5 font-display">
                <Award className="h-3.5 w-3.5 text-emerald-600" />
                <span>{lang === 'sw' ? 'Sifa za Kuomba (Eligibility criteria):' : 'Application eligibility:'}</span>
              </h4>
              <ul className="grid gap-2 sm:grid-cols-2">
                {opp.eligibility.map((crit: string, cIdx: number) => (
                  <li key={cIdx} className="flex items-start space-x-1.5 text-stone-605">
                    <span className="text-emerald-650 font-bold shrink-0 text-xs text-emerald-600">✔</span>
                    <span>{crit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA apply / Deep links to draft */}
            <div className="pt-3 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-stone-500">
              <p className="text-[11px] leading-snug">
                {lang === 'sw' 
                  ? 'Unaweza kutumia zana yetu ya Smart-Draft™ AI hapo juu kuandaa andiko thabiti la biashara lililoboreshwa haswa kwanza kwa fursa hii.'
                  : 'You can use our Smart-Draft™ AI tool above to formulate a highly optimized and focused business plan for this specific opportunity.'}
              </p>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <OpportunityReminderActions 
                  opp={opp}
                  lang={lang}
                  compact={false}
                  onReminderChanged={() => {
                    window.dispatchEvent(new Event('fundseed_reminder_sync'));
                  }}
                />

                <button
                  onClick={() => {
                    if (opp.category === 'ruzuku' || opp.category === 'mkopo') {
                      setBpForm({
                        ...bpForm,
                        budgetString: opp.amount.split('(')[0].trim(),
                        industry: opp.title.toLowerCase().includes('kilimo') ? 'Kilimo na Usimamizi' : bpForm.industry
                      });
                      setActiveTool('business-plan');
                    } else {
                      setPdForm({
                        ...pdForm,
                        fundingNeeds: opp.amount.split('(')[0].trim(),
                        industry: opp.title.toLowerCase().includes('kilimo') ? 'Kilimo kibunifu' : pdForm.industry
                      });
                      setActiveTool('pitch-deck');
                    }
                    scrollToSection(aiToolSectionRef);
                  }}
                  className="w-full sm:w-auto rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold px-4 py-2.5 transition-all text-center"
                >
                  {lang === 'sw' ? 'Andaa andiko la Fursa hii kwa AI' : 'Draft opportunity proposal with AI'}
                </button>
                
                <button
                  onClick={() => {
                    if (isPaid) {
                      const appLink = getOpportunityLink(opp);
                      window.open(appLink, '_blank', 'noopener,noreferrer');
                    } else if (!user) {
                      setShowAuthModal(true);
                    } else {
                      scrollToSection(checkoutSectionRef);
                      setShowPaymentModal(true);
                    }
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg bg-stone-900 hover:bg-stone-850 text-white text-xs font-bold px-4 py-2.5 transition-all text-center gap-1.5"
                >
                  <span>{lang === 'sw' ? 'Tuma Maombi ya Fursa' : 'Apply for Opportunity'}</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

          </div>
        )}

      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-800 antialiased selection:bg-emerald-200">
      
      {showAuthModal && <Auth onClose={() => setShowAuthModal(false)} />}
      {showPaymentModal && (
        <PaymentModal 
          isOpen={showPaymentModal} 
          onClose={() => setShowPaymentModal(false)} 
          user={user} 
          onSuccess={handlePaymentSuccess} 
        />
      )}
      {showContactModal && <ContactForm onClose={() => setShowContactModal(false)} />}
      {showAdminDashboard && user?.email === 'adamukafuruma@gmail.com' && (
        <AdminDashboard onClose={() => setShowAdminDashboard(false)} />
      )}
      
      {/* 1. Header (Navigation) */}
      <header className={`sticky top-0 z-50 border-b transition-colors duration-300 ${
        currentPage === 'home' 
          ? 'border-white/10 bg-stone-950/45 backdrop-blur-md text-white' 
          : 'border-stone-200 bg-white/90 backdrop-blur-md'
      }`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          
          {/* Logo with sprout icon denoting "Growth & Seeds" */}
          <div 
            onClick={() => {
              window.location.hash = '#/';
              setCurrentPage('home');
              window.scrollTo({ top: 0, behavior: 'instant' });
            }}
            className="flex items-center space-x-2 cursor-pointer select-none"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-900/40">
              <Sprout className="h-5 w-5 text-white animate-pulse" />
            </div>
            <div>
              <span className={`text-2xl font-black tracking-tight font-display ${currentPage === 'home' ? 'text-white' : 'text-stone-955'}`}>
                Fund<span className="text-emerald-500">Seed</span>
              </span>
              <span className={`ml-1.5 rounded-full px-2 py-0.5 text-xs font-semibold ${currentPage === 'home' ? 'bg-white/15 text-emerald-400' : 'bg-emerald-100 text-emerald-800'}`}>
                Tanzania
              </span>
            </div>
          </div>

          {/* Desktop Navigation links */}
          <nav className={`hidden md:flex items-center space-x-6 text-sm font-medium ${currentPage === 'home' ? 'text-stone-300' : 'text-stone-605'}`}>
            <a 
              href="#/"
              onClick={(e) => {
                e.preventDefault();
                window.location.hash = '#/';
                setCurrentPage('home');
                window.scrollTo({ top: 0, behavior: 'instant' });
              }}
              className={`transition-all duration-250 pb-1 ${
                currentPage === 'home' 
                  ? 'text-emerald-400 font-extrabold border-b-2 border-emerald-400'
                  : 'text-stone-600 hover:text-emerald-600'
              }`}
            >
              {uiTranslations.navHome[lang]}
            </a>
            
            <a 
              href="#/grants" 
              className={`transition-all duration-205 pb-1 ${
                currentPage === 'grants' 
                  ? 'text-emerald-450 font-extrabold border-b-2 border-emerald-500' 
                  : (currentPage === 'home' ? 'text-stone-300 hover:text-emerald-400' : 'text-stone-605 hover:text-emerald-605')
              }`}
            >
              {uiTranslations.navGrants[lang]}
            </a>

            <a 
              href="#/scholarships" 
              className={`transition-all duration-205 pb-1 ${
                currentPage === 'scholarships' 
                  ? 'text-emerald-455 font-extrabold border-b-2 border-emerald-500' 
                  : (currentPage === 'home' ? 'text-stone-300 hover:text-emerald-400' : 'text-stone-600 hover:text-emerald-605')
              }`}
            >
              {uiTranslations.navScholarships[lang]}
            </a>

            <a 
              href="#/academy" 
              className={`transition-all duration-205 pb-1 ${
                currentPage === 'academy'
                  ? 'text-emerald-455 font-extrabold border-b-2 border-emerald-500'
                  : (currentPage === 'home' ? 'text-stone-300 hover:text-emerald-400' : 'text-stone-600 hover:text-emerald-605')
              }`}
            >
              {lang === 'sw' ? 'Funding Academy' : 'Funding Academy'}
            </a>

            <a 
              href="#/mentorship" 
              className={`transition-all duration-205 pb-1 ${
                currentPage === 'mentorship'
                  ? 'text-emerald-455 font-extrabold border-b-2 border-emerald-500'
                  : (currentPage === 'home' ? 'text-stone-300 hover:text-emerald-400' : 'text-stone-600 hover:text-emerald-605')
              }`}
            >
              {uiTranslations.navMentorship[lang]}
            </a>

            <a 
              href="#/dashboard" 
              className={`transition-all duration-205 pb-1 ${
                currentPage === 'dashboard'
                  ? 'text-emerald-455 font-extrabold border-b-2 border-emerald-500'
                  : (currentPage === 'home' ? 'text-stone-300 hover:text-emerald-400' : 'text-stone-605 hover:text-emerald-605')
              }`}
            >
              {uiTranslations.navDashboard[lang]}
            </a>

            {/* Quick anchors available when on Home */}
            {currentPage === 'home' && (
              <div className="flex items-center space-x-4 pl-4 border-l border-white/20">
                <a href="#ushuhuda" className="text-xs text-stone-400 hover:text-emerald-400 transition-colors">{lang === 'sw' ? 'Ushuhuda' : 'Testimonials'}</a>
                <a href="#bei" className="text-xs text-stone-400 hover:text-emerald-405 transition-colors">{lang === 'sw' ? 'Bei' : 'Pricing'}</a>
              </div>
            )}
          </nav>

          {/* Action Call, Language Selector and Session Status */}
          <div className="hidden md:flex items-center space-x-4">
            
            {showInstallBtn && (
              <button
                onClick={handleInstallPWA}
                className="flex items-center space-x-1.5 rounded-full bg-stone-900 border border-stone-800 px-3 py-1.5 text-xs font-bold text-white hover:bg-stone-800 transition shadow"
              >
                <Download className="w-3 h-3" />
                <span>{lang === 'sw' ? 'Sakinisha App' : 'Install App'}</span>
              </button>
            )}

            {/* Elegant Language Selector */}
            <div className={`flex items-center space-x-1 p-1 rounded-lg border ${currentPage === 'home' ? 'bg-white/5 border-white/10' : 'bg-stone-100 border-stone-200'}`}>
              <button 
                onClick={() => setLang('sw')}
                className={`px-2 py-1 text-xs font-bold rounded-md transition-all ${
                  lang === 'sw' 
                    ? (currentPage === 'home' ? 'bg-white/20 text-white shadow-sm' : 'bg-white text-stone-900 shadow-sm') 
                    : (currentPage === 'home' ? 'text-stone-400 hover:text-white' : 'text-stone-500 hover:text-stone-800')
                }`}
              >
                SW
              </button>
              <button 
                onClick={() => setLang('en')}
                className={`px-2 py-1 text-xs font-bold rounded-md transition-all ${
                  lang === 'en' 
                    ? (currentPage === 'home' ? 'bg-white/20 text-white shadow-sm' : 'bg-white text-stone-900 shadow-sm') 
                    : (currentPage === 'home' ? 'text-stone-400 hover:text-white' : 'text-stone-500 hover:text-stone-800')
                }`}
              >
                EN
              </button>
            </div>

            {user ? (
              <div className="flex items-center space-x-2">
                {user.email === 'adamukafuruma@gmail.com' && (
                  <button 
                    onClick={() => setShowAdminDashboard(true)}
                    className={`mr-2 text-xs font-black px-3 py-1.5 rounded-lg border ${
                      currentPage === 'home'
                        ? 'text-amber-300 bg-amber-950/40 border-amber-500/20'
                        : 'text-amber-900 bg-amber-100 border-amber-200'
                    }`}
                  >
                    Admin
                  </button>
                )}
                <button 
                  onClick={() => setCurrentPage('dashboard')} 
                  className={`mr-2 text-xs font-black px-3 py-1.5 rounded-lg border ${
                    currentPage === 'home'
                      ? 'text-white bg-white/10 border-white/15 hover:bg-white/20 shadow-sm'
                      : 'text-stone-705 bg-stone-105 border-stone-200'
                  }`}
                >
                  {lang === 'sw' ? 'Dashibodi' : 'Dashboard'}
                </button>
                <button
                  onClick={() => signOut(auth)}
                  className={`text-xs font-bold ${
                    currentPage === 'home' ? 'text-stone-300 hover:text-white' : 'text-stone-500 hover:text-stone-900'
                  }`}
                >
                  {lang === 'sw' ? 'Toka' : 'Logout'}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
              >
                {lang === 'sw' ? 'Ingia' : 'Login'}
              </button>
            )}
          </div>

          {/* Mobile menu toggle buttons */}
          <div className="flex md:hidden items-center">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`rounded-lg p-1 ${currentPage === 'home' ? 'text-white hover:bg-white/10' : 'text-stone-600 hover:bg-stone-105'}`}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Expansion Drawer */}
        {mobileMenuOpen && (
          <div className="border-t border-stone-100 bg-white/80 backdrop-blur-md px-4 py-4 md:hidden shadow-lg space-y-3">
            <a 
              href="#/" 
              onClick={() => { setMobileMenuOpen(false); window.location.hash = '#/'; }}
              className={`block rounded-lg px-3 py-2 text-base font-semibold ${
                currentPage === 'home' ? 'text-emerald-600 bg-emerald-50' : 'text-stone-700 hover:bg-stone-50'
              }`}
            >
              {uiTranslations.navHome[lang]}
            </a>
            
            <a 
              href="#/grants" 
              onClick={() => { setMobileMenuOpen(false); window.location.hash = '#/grants'; }}
              className={`block rounded-lg px-3 py-2 text-base font-semibold ${
                currentPage === 'grants' ? 'text-white bg-emerald-600' : 'text-stone-700 hover:bg-stone-50'
              }`}
            >
              {uiTranslations.navGrants[lang]}
            </a>

            <a 
              href="#/scholarships" 
              onClick={() => { setMobileMenuOpen(false); window.location.hash = '#/scholarships'; }}
              className={`block rounded-lg px-3 py-2 text-base font-semibold ${
                currentPage === 'scholarships' ? 'text-white bg-emerald-600' : 'text-stone-700 hover:bg-stone-50'
              }`}
            >
              {uiTranslations.navScholarships[lang]}
            </a>

            <a 
              href="#/dashboard" 
              onClick={() => { setMobileMenuOpen(false); window.location.hash = '#/dashboard'; }}
              className={`block rounded-lg px-3 py-2 text-base font-semibold ${
                currentPage === 'dashboard' ? 'text-white bg-emerald-600' : 'text-stone-700 hover:bg-stone-50'
              }`}
            >
              {uiTranslations.navDashboard[lang]}
            </a>
            
            {/* Mobile language selector buttons */}
            <div className="pt-2 flex items-center justify-between border-t border-stone-100">
              <span className="text-xs font-bold text-stone-500 uppercase">{lang === 'sw' ? 'Mabadiliko ya Lugha' : 'Select Language'}</span>
              <div className="flex items-center space-x-1.5 bg-stone-100 p-1 rounded-lg border border-stone-200">
                <button 
                  onClick={() => { setLang('sw'); setMobileMenuOpen(false); }}
                  className={`px-3 py-1 text-xs font-bold rounded transition-all ${
                    lang === 'sw' ? 'bg-white text-stone-900 shadow-sm font-black' : 'text-stone-500'
                  }`}
                >
                  SW
                </button>
                <button 
                  onClick={() => { setLang('en'); setMobileMenuOpen(false); }}
                  className={`px-3 py-1 text-xs font-bold rounded transition-all ${
                    lang === 'en' ? 'bg-white text-stone-900 shadow-sm font-black' : 'text-stone-500'
                  }`}
                >
                  EN
                </button>
              </div>
            </div>

            {/* Mobile Auth Access Module */}
            <div className="pt-3 border-t border-stone-100">
              {user ? (
                <div className="space-y-2">
                  <div className="px-3 py-2 bg-stone-50 rounded-xl text-xs font-semibold text-stone-700 border border-stone-150 flex items-center justify-between">
                    <span className="truncate max-w-[180px] font-mono">{user.email}</span>
                    <span className="bg-emerald-100 text-emerald-800 text-[9px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider shrink-0">Active</span>
                  </div>
                  {user.email === 'adamukafuruma@gmail.com' && (
                    <button 
                      onClick={() => { setMobileMenuOpen(false); setShowAdminDashboard(true); }}
                      className="w-full text-center bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-sm py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span className="inline-block w-2 h-2 rounded-full bg-stone-900 animate-ping"></span>
                      Paneli ya Admin
                    </button>
                  )}
                  <button 
                    onClick={() => { setMobileMenuOpen(false); signOut(auth); }}
                    className="w-full text-center bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-sm py-2.5 rounded-xl transition-all border border-stone-200 cursor-pointer"
                  >
                    {lang === 'sw' ? 'Toka Kwenye Akaunti' : 'Logout Account'}
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => { setMobileMenuOpen(false); setShowAuthModal(true); }}
                  className="w-full text-center bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm py-3 rounded-xl transition-all shadow-md cursor-pointer"
                >
                  {lang === 'sw' ? 'Ingia / Jisajili Sasa' : 'Login / Register Sasa'}
                </button>
              )}
            </div>

            {currentPage === 'home' && (
              <div className="pt-2 border-t border-stone-100 space-y-1">
                <a 
                  href="#academy" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="block rounded-lg px-3 py-1.5 text-sm text-stone-500 hover:text-emerald-500"
                >
                  FundSeed Academy
                </a>
                <a 
                  href="#ushuhuda" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="block rounded-lg px-3 py-1.5 text-sm text-stone-500 hover:text-emerald-500"
                >
                  {lang === 'sw' ? 'Ushuhuda wetu' : 'Client Testimonials'}
                </a>
                <a 
                  href="#bei" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="block rounded-lg px-3 py-1.5 text-sm text-stone-500 hover:text-emerald-500"
                >
                  {lang === 'sw' ? 'Malipo & Bei' : 'Rates and Pricing'}
                </a>
              </div>
            )}
            
            <div className="pt-2">
              {isPaid ? (
                <div className="flex items-center space-x-1.5 rounded-lg bg-emerald-50 px-3 py-2.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="h-4 w-4 shrink-0" />
                  <span>Premium Unlocked (Kila kitu kiko wazi)</span>
                </div>
              ) : (
                <button 
                  onClick={() => { setMobileMenuOpen(false); handleNavigateToCheckout(); }} 
                  className="w-full rounded-lg bg-emerald-600 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 cursor-pointer"
                >
                  Anza Sasa - 20,000 TZS
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {currentPage === 'home' && (
        <>
          {/* 2. Hero Section */}
          <section className="relative overflow-hidden bg-stone-950 py-20 sm:py-32">
            {/* Textured background photo of diverse business professional people collaborating */}
            <div className="absolute inset-0 z-0">
              <img
                src="/src/assets/images/hero_background_1781078300010.png"
                alt="Diverse business professional people collaborating"
                className="w-full h-full object-cover opacity-35 animate-fade-in"
                referrerPolicy="no-referrer"
              />
              {/* Subtle top-to-bottom and radial gradient fades to guarantee absolute legibility of primary headline and header in white text */}
              <div className="absolute inset-0 bg-gradient-to-b from-stone-950/90 via-stone-950/70 to-stone-950/95"></div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(5,150,105,0.15),transparent_60%)]"></div>
            </div>

            <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
                
                <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                  <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl font-display leading-[1.1]">
                    Badili Wazo lako Kuwa <br />
                    <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                      Biashara ya Ndoto
                    </span>
                  </h1>
                  
                  {/* Bullet checklist with glowing checkmarks */}
                  <div className="mx-auto flex max-w-md flex-col space-y-2.5 text-sm text-stone-300 lg:mx-0">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                      <span>Ufikiaji kamili wa fursa za ruzuku 50+ zilizohakikiwa nchini</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                      <span>Zalisha Business Plans na Pitch Decks zenye weledi mkubwa wa AI</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                      <span>Msaada kamili wa kiufundi na miongozo ya kujibu maswali (24/7 Support)</span>
                    </div>
                  </div>

                  {/* Call to Actions */}
                  <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                    <button 
                      onClick={() => scrollToSection(checkoutSectionRef)} 
                      className="group w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-emerald-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-emerald-900/30 hover:bg-emerald-500 transition-all active:scale-98 cursor-pointer"
                    >
                      Anza Sasa — 20,000 TZS
                      <ArrowRight className="ml-2.5 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button 
                      onClick={() => {
                        const el = document.getElementById('fursa');
                        if(el) el.scrollIntoView({ behavior: 'smooth' });
                      }} 
                      className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-white/10 px-8 py-4 text-base font-semibold text-white shadow-sm border border-white/20 hover:border-emerald-400 hover:text-emerald-400 transition-all backdrop-blur-sm cursor-pointer"
                    >
                      Vinjari Fursa
                    </button>
                  </div>

                  {!user && (
                    <div className="text-center lg:text-left pt-2 font-semibold">
                      <span className="text-stone-400 text-xs sm:text-sm">
                        {lang === 'sw' ? 'Mwanachama tayari? ' : 'Already have an account? '}
                      </span>
                      <button 
                        onClick={() => setShowAuthModal(true)}
                        className="text-emerald-400 hover:text-emerald-300 font-extrabold text-xs sm:text-sm underline cursor-pointer ml-1.5"
                      >
                        {lang === 'sw' ? 'Ingia hapa' : 'Log in here'}
                      </button>
                    </div>
                  )}

                  {/* User review stats badges */}
                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 pt-6 text-stone-400 text-xs">
                    <div className="flex items-center space-x-1.5">
                      <span className="font-bold text-white text-sm">500+</span>
                      <span>Wajasiriamali nchini</span>
                    </div>
                    <div className="hidden sm:block h-4 w-px bg-stone-800"></div>
                    <div className="flex items-center space-x-1.5">
                      <span className="font-bold text-emerald-400 text-sm">TZS Milioni 45+</span>
                      <span>Zilizopatikana za ruzuku</span>
                    </div>
                    <div className="hidden sm:block h-4 w-px bg-stone-800"></div>
                    <div className="flex items-center space-x-1">
                      <span className="text-amber-400 text-sm">★★★★★</span>
                      <span>Ushuru wa nyota tano nchini</span>
                    </div>
                  </div>
                </div>

                {/* Hero Right Visual Display Card */}
                <div className="lg:col-span-5 relative mt-8 lg:mt-0">
                  <div className="relative rounded-2xl border border-stone-805 bg-stone-900/85 p-6 shadow-2xl sm:p-8 backdrop-blur-sm">
                    <div className="absolute top-3 right-3 rounded-full bg-emerald-950 px-3 py-1 text-[10px] font-bold text-emerald-400 uppercase tracking-widest border border-emerald-800/50">
                      Mfano Kamili wa AI
                    </div>
                    <h3 className="text-white font-bold mb-1.5 font-display text-lg flex items-center space-x-1.5">
                      <span>Business Plan: Salama Poultry Farm</span>
                    </h3>
                    <p className="text-stone-400 text-xs mb-4">Wilaya ya Kigamboni, Dar es Salaam — Imeandikwa na AI</p>

                    <div className="space-y-4 text-sm max-h-[290px] overflow-y-auto pr-2 scrollbar-thin">
                      <div className="rounded-lg bg-stone-950 p-3 border border-stone-800">
                        <p className="font-bold text-stone-300 text-xs mb-1 uppercase">1. Executive Summary</p>
                        <p className="text-xs text-stone-400 leading-relaxed">
                          "Salama Organic Poultry Farm inaleta mapinduzi ya afya nchini kwa kuzalisha kuku safi wa kienyeji na mayai ya uhakika kulishwa chakula cha mimea yenye afya asilia..."
                        </p>
                      </div>
                      
                      <div className="rounded-lg bg-stone-950 p-3 border border-stone-800">
                        <p className="font-bold text-stone-300 text-xs mb-1 uppercase">2. Market Problem</p>
                        <p className="text-xs text-stone-400 leading-relaxed text-red-400">
                          "Soko la sasa linajaa kuku walioongezewa kemikali za ukuaji wa haraka na mayai yasiyo na ladha asilia, hali inayohatarisha usalama wa walaji na watoto wadogo."
                        </p>
                      </div>

                      <div className="rounded-lg bg-stone-950 p-3 border border-stone-800">
                        <p className="font-bold text-stone-300 text-xs mb-1 uppercase">3. Smart-Draft Financial Projection</p>
                        <table className="w-full text-[10px] border-collapse mt-2 text-stone-400">
                          <thead>
                            <tr className="border-b border-stone-800 text-left">
                              <th className="py-1">Hitaji la Kazi</th>
                              <th className="py-1">Gharama</th>
                              <th className="py-1">Chanzo</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b border-stone-900">
                              <td className="py-1">Chakula cha Kuku cha Miezi 6</td>
                              <td className="py-1 font-semibold text-emerald-400">TZS 3,500,000</td>
                              <td className="py-1">Ruzuku</td>
                            </tr>
                            <tr>
                              <td className="py-1">Vifaa vya Chanjo na Maji</td>
                              <td className="py-1 font-semibold text-emerald-400">TZS 1,200,000</td>
                              <td className="py-1">Ruzuku</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-stone-800 flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="text-[11px] font-medium text-emerald-400">Mfumo Uko Imara (Online)</span>
                      </div>
                      
                      <button 
                        onClick={() => scrollToSection(aiToolSectionRef)}
                        className="inline-flex items-center text-xs font-bold text-emerald-400 hover:text-emerald-300 underline underline-offset-4"
                      >
                        Jaribu Kitengeneza AI Sasa
                        <ArrowRight className="ml-1 h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </section>

      {/* 3. Mission & Pillars Section */}
      <section id="kuhusu" className="py-20 bg-white border-y border-stone-200/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="mx-auto max-w-3xl text-center mb-16 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-600">Kuhusu FundSeed & Lengo Letu</h2>
            <p className="text-3xl font-extrabold text-stone-900 font-display sm:text-4xl">
              Kuwawezesha Watanzania kufikia ndoto zao
            </p>
            <p className="text-stone-605 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
              Mission ya FundSeed ni kuwawezesha Watanzania kufikia ndoto zao za kiuchumi na kitaaluma kwa kuwapa taarifa sahihi, fursa za uhakika za ufadhili, na miongozo ya kibiashara inayojengwa kwenye msingi wa ukweli na usalama.
            </p>
            <div className="h-1 w-16 bg-emerald-500 mx-auto rounded-full"></div>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            
            {/* Pillar 1 */}
            <div className="rounded-2xl bg-stone-50 p-8 border border-stone-200/60 transition-all hover:shadow-md hover:border-orange-200 group">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 mb-6 group-hover:scale-110 transition-transform">
                <Briefcase className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-stone-950 font-display mb-3">Kusaidia Ukuaji wa Biashara</h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                Tunapunguza tatizo la mtaji kwa wafanyabiashara wadogo na wa kati (SMEs). Tunatafuta, kuchuja, na kuleta ruzuku (grants) na fursa za mitaji ili kusaidia biashara zianze, zikue, na ziwe endelevu.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="rounded-2xl bg-stone-50 p-8 border border-stone-200/60 transition-all hover:shadow-md hover:border-blue-200 group">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 mb-6 group-hover:scale-110 transition-transform">
                <GraduationCap className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-stone-950 font-display mb-3">Kufungua Milango ya Elimu</h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                Tunasaidia vijana wenye vipaji na ndoto za kusoma nje ya nchi (Masters, PhD, au tafiti). Tunafanya kazi ya ziada ya kutafuta scholarship za uhakika ili mwanafunzi asipoteze muda na pesa kwenye maombi ya uongo au scams.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="rounded-2xl bg-emerald-900 text-white p-8 border border-emerald-800 shadow-xl transition-all hover:shadow-2xl group flex flex-col justify-between">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-800 mb-6 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="h-6 w-6 text-emerald-300" />
                </div>
                <h3 className="text-xl font-bold text-white font-display mb-3">3. Usalama & Uadilifu</h3>
                <p className="text-emerald-100 text-sm leading-relaxed mb-4">
                  Kama mwanzilishi anayezingatia maadili, mbinu yetu ni "Usalama Kwanza".
                </p>
                <ul className="space-y-3 mt-4">
                  <li className="flex items-start text-xs text-emerald-200 leading-relaxed">
                    <Check className="h-4 w-4 mr-2 shrink-0 text-emerald-400 mt-0.5" />
                    <span><strong>Kutokomeza Utapeli:</strong> Kila fursa imefanyiwa vetting (ukaguzi) ili usipoteze muda.</span>
                  </li>
                  <li className="flex items-start text-xs text-emerald-200 leading-relaxed">
                    <Check className="h-4 w-4 mr-2 shrink-0 text-emerald-400 mt-0.5" />
                    <span><strong>Data Security:</strong> Taarifa zako zinalindwa kwa viwango vya juu vya kiusalama.</span>
                  </li>
                </ul>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Miradi Yetu ya Mafanikio - Horizontal Carousel Slider */}
      <section id="miradi-mafanikio" className="py-20 bg-stone-100 border-b border-stone-200/85 scroll-mt-20 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div className="space-y-4 max-w-2xl text-left">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">Galerie ya Mafanikio</span>
              <h2 className="text-3xl font-extrabold text-stone-900 font-display sm:text-4xl leading-tight">
                Miradi Yetu ya Mafanikio
              </h2>
              <p className="text-stone-600 text-sm leading-relaxed max-w-xl">
                Gundua picha halisi na maelezo ya wajasiriamali waliovunja vikwazo na kufanikiwa kupata mitaji mikubwa wakiongozwa na mifumo yetu ya kibiashara.
              </p>
            </div>
            
            {/* Carousel navigation controls (Floating left/right buttons for desktop & mobile) */}
            <div className="flex items-center space-x-3 self-start md:self-end">
              <span className="text-xs text-stone-500 font-mono hidden sm:block mr-2">← Buruta au Tumia Mishale →</span>
              <button
                type="button"
                onClick={() => projectsSliderRef.current?.scrollBy({ left: -380, behavior: 'smooth' })}
                className="h-12 w-12 rounded-full border border-stone-300 bg-white text-stone-700 hover:text-emerald-600 hover:border-emerald-600 hover:shadow-md transition-all flex items-center justify-center cursor-pointer active:scale-95"
                aria-label="Sogeza Kushoto"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => projectsSliderRef.current?.scrollBy({ left: 380, behavior: 'smooth' })}
                className="h-12 w-12 rounded-full border border-stone-300 bg-white text-stone-700 hover:text-emerald-600 hover:border-emerald-600 hover:shadow-md transition-all flex items-center justify-center cursor-pointer active:scale-95"
                aria-label="Sogeza Kulia"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Horizontal scroll slider */}
          <div 
            ref={projectsSliderRef}
            className="flex space-x-6 overflow-x-auto pb-6 snap-x snap-mandatory scrollbar-none"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {africanTestimonials.map((test) => (
              <div 
                key={test.id} 
                className="w-[290px] sm:w-[370px] h-[480px] shrink-0 rounded-2xl relative overflow-hidden group snap-start shadow-md hover:shadow-xl transition-all duration-500 border border-stone-200 bg-stone-900"
              >
                {/* Project Image */}
                {test.image ? (
                  <img 
                    src={test.image} 
                    alt={test.name} 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className={`absolute inset-0 flex items-center justify-center text-white text-4xl font-extrabold uppercase ${test.avatarColor}`}>
                    {test.avatarChar}
                  </div>
                )}

                {/* Ambient vignette gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-900/65 to-black/15 group-hover:opacity-95 transition-opacity duration-300"></div>

                {/* Top Location tag badge */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                  <span className="inline-flex items-center space-x-1 bg-black/40 backdrop-blur-md border border-white/15 text-white text-[9px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                    Hapa: {test.location}
                  </span>
                  <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                </div>

                {/* Bottom caption overlay with fully legible text */}
                <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col justify-end space-y-4 z-10">
                  
                  {/* High-contrast Capital Raised badge wrapper */}
                  <div className="bg-emerald-500/95 backdrop-blur-sm text-white px-3.5 py-2 rounded-xl border border-emerald-400/30 w-fit shadow-md">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-100">Ufadhili Waliopata:</p>
                    <p className="text-xs sm:text-xs font-black">{test.amountGranted}</p>
                  </div>

                  {/* Narrative quote from the founder */}
                  <p className="text-xs sm:text-xs text-stone-100 font-sans italic leading-relaxed line-clamp-4">
                    "{test.story}"
                  </p>

                  {/* Horizontal Divider border */}
                  <div className="h-[1px] bg-white/15 w-full"></div>

                  {/* Founder professional Profile signature */}
                  <div className="flex items-center space-x-3">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-black text-sm uppercase ${test.avatarColor} border border-white/20 shadow-sm`}>
                      {test.avatarChar}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-white truncate tracking-wide">{test.name}</h4>
                      <p className="text-[10px] text-stone-300 truncate font-mono">{test.business}</p>
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>

          {/* Swipe helper dots indicator showing scroll alignment */}
          <div className="flex items-center justify-center space-x-2 mt-4 sm:hidden">
            <span className="text-[10px] text-stone-400 italic">← Swipia kushoto au kulia kuona zaidi →</span>
          </div>

        </div>
      </section>

      {/* 4. How It Works Section */}
      <section id="vile-inavyofanya-kazi" className="py-20 bg-stone-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="mx-auto max-w-3xl text-center mb-16 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-600">Maelekezo Rahisi</h2>
            <p className="text-3xl font-extrabold text-stone-900 font-display sm:text-4xl">
              Hatua 3 Rahisi Kuunda Biashara Yako
            </p>
            <div className="h-1 w-16 bg-emerald-500 mx-auto rounded-full"></div>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            
            {/* Step 1 */}
            <div className="rounded-2xl bg-white p-6 border border-stone-200/80 text-center relative shadow-sm">
              <span className="absolute top-4 left-4 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-sm font-extrabold text-emerald-800">
                1
              </span>
              <div className="mx-auto my-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <Phone className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-stone-900 font-display mb-2">Register & Pay</h3>
              <p className="text-stone-605 text-sm leading-relaxed">
                Jisajili kwa urahisi ukitumia namba yako ya simu na kulipia ada ya uanachama ya mara moja tu ya 20,000 TZS kwa njia rahisi kabisa ya simu asilia nchini.
              </p>
            </div>

            {/* Step 2 */}
            <div className="rounded-2xl bg-white p-6 border border-stone-200/80 text-center relative shadow-sm">
              <span className="absolute top-4 left-4 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-sm font-extrabold text-emerald-800">
                2
              </span>
              <div className="mx-auto my-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-stone-900 font-display mb-2">Zalisha kwa AI (Generate)</h3>
              <p className="text-stone-605 text-sm leading-relaxed">
                Jaza herufi na maelezo machache kuhusu wazo lako kwenye zana yetu thabiti ya Smart-Draft™. AI yetuitaandaa hati yenye kina cha juu ndani ya sekunde 30 tu.
              </p>
            </div>

            {/* Step 3 */}
            <div className="rounded-2xl bg-white p-6 border border-stone-200/80 text-center relative shadow-sm">
              <span className="absolute top-4 left-4 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-sm font-extrabold text-emerald-800">
                3
              </span>
              <div className="mx-auto my-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <Briefcase className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-stone-900 font-display mb-2">Tuma Maombi (Apply)</h3>
              <p className="text-stone-605 text-sm leading-relaxed">
                Pakua hati yako na kuituma kwenye fursa mbalimbali za kusisimua zilizothibitishwa katika orodha yetu fursa halali nchini Tanzania na kote duniani.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Directory Portal Block */}
      <section className="py-20 bg-stone-50 border-y border-stone-200/40 relative">
        <div className="absolute top-0 right-0 -z-10 h-72 w-72 rounded-full bg-emerald-500/5 blur-3xl"></div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="mx-auto max-w-3xl text-center mb-16 space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">Huduma zetu</span>
            <p className="text-3xl font-extrabold text-stone-900 font-display sm:text-4xl">
              Maktaba na Mifumo Thabiti ya FundSeed
            </p>
            <p className="text-stone-600 text-sm leading-relaxed max-w-xl mx-auto">
              Tumeigawa FundSeed katika kurasa thabiti ili kukusaidia kupata ruzuku kwa haraka, kufanya maombi kwa kufanikiwa, na kutengeneza makabrasha ya kitaalamu ya kibiashara.
            </p>
            <div className="h-1 w-16 bg-emerald-500 mx-auto rounded-full"></div>
          </div>

          <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
            {/* Directory 1: Business Grants */}
            <div className="rounded-2xl border border-stone-200 bg-white p-6 sm:p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-all group">
              <div className="space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-600 border border-orange-100/80">
                  <Briefcase className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-stone-900 font-display">Mkusanyiko wa Ruzuku (Business Grants)</h3>
                  <p className="text-stone-500 text-xs mt-2 leading-relaxed">
                    Database ya fursa vipya 50+ za ruzuku (Grants), mikopo yenye dhamana, na incubator zilizothibitishwa nchini Tanzania kama SIDO, TADB, na Tony Elumelu.
                  </p>
                </div>
              </div>
              <div className="pt-6">
                <button 
                  onClick={() => { window.location.hash = '#/grants'; }}
                  className="group/btn w-full inline-flex items-center justify-center rounded-xl bg-stone-900 hover:bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white transition-all cursor-pointer"
                >
                  <span>Fungua Grants Database</span>
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Directory 2: Scholarships Hub */}
            <div className="rounded-2xl border border-stone-200 bg-white p-6 sm:p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-all group">
              <div className="space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                  <Award className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-stone-900 font-display">Fursa za Masomo (Scholarships Hub)</h3>
                  <p className="text-stone-500 text-xs mt-2 leading-relaxed">
                    Pata na uone scholarships za bure nje ya nchi (Bachelors, Masters, PhD). Inajumuisha miongozo na Scholarship Success Kit kuandaa SOP / LOR ya ushindi.
                  </p>
                </div>
              </div>
              <div className="pt-6">
                <button 
                  onClick={() => { window.location.hash = '#/scholarships'; }}
                  className="group/btn w-full inline-flex items-center justify-center rounded-xl bg-stone-900 hover:bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white transition-all cursor-pointer"
                >
                  <span>Fungua Scholarships Hub</span>
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Directory 3: Smart-Draft AI Workspace */}
            <div className="rounded-2xl border border-stone-200 bg-emerald-950 p-6 sm:p-8 flex flex-col justify-between shadow-md group border-emerald-900">
              <div className="space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-900 text-emerald-400">
                  <Sparkles className="h-6 w-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white font-display">Smart-Draft™ AI Workspace</h3>
                  <p className="text-emerald-200 text-xs mt-2 leading-relaxed">
                    Zana thabiti ya AI inayokuandalia mchanganuo kamili wa business plan au hati ya Pitch-Deck ya Kiswahili kulingana na mazingira ya kibiashara nchini Tanzania kwa sekunde 30 tu.
                  </p>
                </div>
              </div>
              <div className="pt-6">
                <button 
                  onClick={() => { window.location.hash = '#/dashboard'; }}
                  className="group/btn w-full inline-flex items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 text-xs font-bold text-white transition-all cursor-pointer"
                >
                  <span>Ingia AI Dashboard</span>
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>

        </div>
      </section>

        </>
      )}

      {/* 5. Interactive Workspace of AI-Tools (Smart-Draft & Opportunities) */}
      {currentPage === 'dashboard' && (
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }} 
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="min-h-screen bg-stone-50 pb-12"
        >
          <DashboardView 
            lang={lang}
            currentUser={currentUser}
            setCurrentUser={setCurrentUser}
            users={users}
            setUsers={setUsers}
            savedDrafts={savedDrafts}
            setSavedDrafts={setSavedDrafts}
            isPaid={isPaid}
            setIsPaid={setIsPaid}
            setShowAuthModal={setShowAuthModal}
            activeTool={activeTool}
            setActiveTool={setActiveTool}
            isGenerating={isGenerating}
            handleGenerateAI={handleGenerateAI}
            aiResult={aiResult}
            setAiResult={setAiResult}
            generationError={generationError}
            setGenerationError={setGenerationError}
            copied={copied}
            handleCopyToClipboard={handleCopyToClipboard}
            handleDownloadFile={handleDownloadFile}
            bpForm={bpForm}
            setBpForm={setBpForm}
            pdForm={pdForm}
            setPdForm={setPdForm}
            checkoutSectionRef={checkoutSectionRef}
            scrollToSection={(ref: any) => {
              if (ref && ref.current) {
                ref.current.scrollIntoView({ behavior: 'smooth' });
              } else {
                handleNavigateToCheckout();
              }
            }}
            onUnlockPremium={handleUnlockVIP}
            renderFormattedMarkdown={renderFormattedMarkdown}
            interests={userInterests}
            setInterests={handleSaveInterests}
          />
        </motion.div>
      )}

      {/* Legacy layout wrapper */}
      {false && currentPage === 'dashboard' && (
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }} 
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="min-h-screen bg-stone-50 pb-12"
        >
          {/* Custom Back to Home Breadcrumb/Navigation block */}
          <div className="bg-white border-b border-stone-200/60 py-4 shadow-sm mb-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <button 
                  onClick={() => { window.location.hash = '#/'; }}
                  className="inline-flex items-center space-x-1 text-xs text-stone-500 hover:text-emerald-600 font-bold bg-stone-100 px-3 py-1.5 rounded-lg transition-all cursor-pointer border border-stone-200"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Nyumbani</span>
                </button>
                <span className="text-stone-300">/</span>
                <span className="text-xs font-black text-stone-800">Smart-Draft™ AI Workspace</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-600 font-bold bg-emerald-50 border border-emerald-200/40 px-2.5 py-1 rounded-full uppercase animate-pulse">
                Live AI Co-Pilot
              </span>
            </div>
          </div>

      <section id="smart-draft-workspace" className="py-16 bg-white border-y border-stone-200/80">
        <div ref={aiToolSectionRef} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 mb-12 border-b border-stone-100 pb-6">
            <div className="space-y-1.5 text-center lg:text-left">
              <span className="text-stone-500 text-xs font-bold uppercase tracking-widest">Kikokotoo cha Mradi</span>
              <h2 className="text-2xl font-extrabold text-stone-950 font-display flex items-center justify-center lg:justify-start gap-2">
                <span>Smart-Draft™ Workspace</span>
                <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">V.3.5</span>
              </h2>
              <p className="text-stone-600 text-sm">Andaa mpango wa biashara na mchanganuo wa kibajeti papo hapo</p>
            </div>

            {/* Select Tab between Business Plan or Pitch Deck */}
            <div className="flex items-center space-x-1.5 rounded-xl bg-stone-100 p-1.5 border border-stone-200/80">
              <button
                onClick={() => { setActiveTool('business-plan'); setGenerationError(null); }}
                className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                  activeTool === 'business-plan' 
                    ? 'bg-white text-stone-950 shadow-sm border border-stone-200/30' 
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                1. Business Plan Assistant
              </button>
              <button
                onClick={() => { setActiveTool('pitch-deck'); setGenerationError(null); }}
                className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                  activeTool === 'pitch-deck' 
                    ? 'bg-white text-stone-950 shadow-sm border border-stone-200/30' 
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                2. AI-Powered Pitch Builder
              </button>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-12">
            
            {/* Form side or Paywall notice */}
            <div className="lg:col-span-6">
              {!isPaid ? (
                /* Paywall locked state card */
                <div className="rounded-2xl border-2 border-stone-200 bg-stone-50 p-6 text-center space-y-6 shadow-sm relative overflow-hidden flex flex-col justify-center min-h-[400px]">
                  {/* Subtle diagonal ribbon */}
                  <div className="absolute top-4 right-[-32px] rotate-45 bg-amber-500 text-white font-bold text-[10px] px-8 py-1 uppercase shadow-sm">
                    Fungwa
                  </div>
                  
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-stone-200 text-stone-600 border border-stone-300">
                    <Lock className="h-6 w-6 text-stone-500 animate-bounce" />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-stone-950 font-display">Mfumo Huu Umefungwa Pekee</h3>
                    <p className="text-sm text-stone-600 leading-relaxed max-w-md mx-auto">
                      Zana hii ya kitaalamu inatumiwa na AI kufanya uchambuzi na kuwasilisha andiko lako. Ili kuanza kutumia na kupakua ripoti yako, unapaswa kulipia ada ya uanachama ya TZS 20,000.
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-4 border border-stone-200/80 max-w-sm mx-auto text-left space-y-2.5">
                    <p className="text-xs font-bold text-stone-900 border-b border-stone-100 pb-1.5 flex items-center space-x-1.5">
                      <span>Inajumuisha:</span>
                    </p>
                      <ul className="text-xs text-stone-660 space-y-1.5">
                        <li className="flex items-center space-x-1.5">
                          <span className="text-emerald-500 font-bold">Lipi:</span>
                          <span>Uzalishaji usio na kikomo wa andishi la mradi</span>
                        </li>
                        <li className="flex items-center space-x-1.5">
                          <span className="text-emerald-500 font-bold">Lipi:</span>
                          <span>Fomati kamili ya Kiswahili ya kifedha</span>
                        </li>
                        <li className="flex items-center space-x-1.5">
                          <span className="text-emerald-500 font-bold">Lipi:</span>
                          <span>Pakua haraka kama nakala ya neno (.txt)</span>
                        </li>
                      </ul>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                      onClick={() => scrollToSection(checkoutSectionRef)}
                      className="w-full sm:w-auto rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-6 py-3 shadow-md active:translate-y-[1px] transition-all"
                    >
                      Lipia TZS 20,000 Sasa
                    </button>
                  </div>
                </div>
              ) : (
                /* Unlocked Form State */
                <div className="rounded-2xl border border-stone-200 bg-stone-50 p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4 border-b border-stone-100 pb-3">
                    <div className="flex items-center space-x-1.5 font-semibold text-emerald-700 text-sm">
                      <Unlock className="h-4 w-4" />
                      <span>Uanachama Umethibitishwa! Inafanya kazi.</span>
                    </div>
                    <button
                      onClick={() => {
                        setIsPaid(false);
                        setAiResult(null);
                        setPaymentStep('idle');
                      }}
                      className="text-stone-400 hover:text-red-500 text-xs flex items-center space-x-1"
                    >
                      <span>Funga Uanachama</span>
                    </button>
                  </div>

                  {activeTool === 'business-plan' ? (
                    /* Business Plan Form */
                    <form onSubmit={handleGenerateAI} className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-stone-700 block uppercase">Jina la Biashara / Mradi</label>
                        <input
                          type="text"
                          value={bpForm.businessName}
                          onChange={(e) => setBpForm({ ...bpForm, businessName: e.target.value })}
                          className="w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2 text-sm text-stone-900 focus:border-emerald-600 focus:outline-none"
                          required
                          placeholder="Mwaya Poultry Care etc."
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-stone-700 block uppercase">Sekta au Aina ya Biashara</label>
                        <input
                          type="text"
                          value={bpForm.industry}
                          onChange={(e) => setBpForm({ ...bpForm, industry: e.target.value })}
                          className="w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2 text-sm text-stone-900 focus:border-emerald-600 focus:outline-none"
                          required
                          placeholder="Kilimo, Teknolojia, Viwanda vidogo etc."
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-stone-700 block uppercase">Changamoto unayotatua (The Problem)</label>
                        <textarea
                          rows={3}
                          value={bpForm.problem}
                          onChange={(e) => setBpForm({ ...bpForm, problem: e.target.value })}
                          className="w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2 text-xs text-stone-900 focus:border-emerald-600 focus:outline-none leading-relaxed"
                          required
                          placeholder="Fafanua tatizo nchini kwa ufupi..."
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-stone-700 block uppercase">Suluhisho mnalotoa (The Solution)</label>
                        <textarea
                          rows={3}
                          value={bpForm.solution}
                          onChange={(e) => setBpForm({ ...bpForm, solution: e.target.value })}
                          className="w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2 text-xs text-stone-900 focus:border-emerald-600 focus:outline-none leading-relaxed"
                          required
                          placeholder="Fafanua jinsi mtakavyotatua changamoto hii..."
                        />
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-stone-700 block uppercase">Wateja Walengwa</label>
                          <input
                            type="text"
                            value={bpForm.targetCustomers}
                            onChange={(e) => setBpForm({ ...bpForm, targetCustomers: e.target.value })}
                            className="w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2 text-xs text-stone-900 focus:border-emerald-600 focus:outline-none"
                            placeholder="Wateja kama makampuni, familia nk."
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-stone-700 block uppercase">Kadirio la Bajeti ya Mtaji</label>
                          <input
                            type="text"
                            value={bpForm.budgetString}
                            onChange={(e) => setBpForm({ ...bpForm, budgetString: e.target.value })}
                            className="w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2 text-xs text-stone-900 focus:border-emerald-600 focus:outline-none"
                            placeholder="Milioni 20 TZS nk."
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isGenerating}
                        className="w-full rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm py-3 px-4 shadow-sm transition-all uppercase tracking-wider flex items-center justify-center space-x-2"
                      >
                        {isGenerating ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            <span>Inatengeneza Andiko kwa AI...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4" />
                            <span>Zalisha Business Plan kwa AI</span>
                          </>
                        )}
                      </button>
                    </form>
                  ) : (
                    /* Pitch Deck Form */
                    <form onSubmit={handleGenerateAI} className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-stone-700 block uppercase">Jina la Startup / Biashara</label>
                        <input
                          type="text"
                          value={pdForm.startupName}
                          onChange={(e) => setPdForm({ ...pdForm, startupName: e.target.value })}
                          className="w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2 text-sm text-stone-900 focus:border-emerald-600 focus:outline-none"
                          required
                          placeholder="Rafiki App n.k."
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-stone-700 block uppercase">Sekta / Soko kuu</label>
                        <input
                          type="text"
                          value={pdForm.industry}
                          onChange={(e) => setPdForm({ ...pdForm, industry: e.target.value })}
                          className="w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2 text-sm text-stone-900 focus:border-emerald-600 focus:outline-none"
                          required
                          placeholder="Teknolojia ya Fedha (FinTech) nk."
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-stone-700 block uppercase">Changamoto kubwa nchini (Problem)</label>
                        <textarea
                          rows={3}
                          value={pdForm.problem}
                          onChange={(e) => setPdForm({ ...pdForm, problem: e.target.value })}
                          className="w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2 text-xs text-stone-900 focus:border-emerald-600 focus:outline-none leading-relaxed"
                          required
                          placeholder="Eleza tatizo la mteja unaotatua..."
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-stone-700 block uppercase">Suluhisho lenu lilivyo bora (Solution)</label>
                        <textarea
                          rows={3}
                          value={pdForm.solution}
                          onChange={(e) => setPdForm({ ...pdForm, solution: e.target.value })}
                          className="w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2 text-xs text-stone-900 focus:border-emerald-600 focus:outline-none leading-relaxed"
                          required
                          placeholder="Fafanua jinsi programu au vifaa vyenu vitatua hili..."
                        />
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-stone-700 block uppercase">Ukubwa wa soko / Uwezo (Market Size)</label>
                          <input
                            type="text"
                            value={pdForm.marketSize}
                            onChange={(e) => setPdForm({ ...pdForm, marketSize: e.target.value })}
                            className="w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2 text-xs text-stone-900 focus:border-emerald-600 focus:outline-none"
                            placeholder="Watumiaji milioni 5 nchini nk."
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-stone-700 block uppercase">Jinsi ya kupata mapato (Model)</label>
                          <input
                            type="text"
                            value={pdForm.businessModel}
                            onChange={(e) => setPdForm({ ...pdForm, businessModel: e.target.value })}
                            className="w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2 text-xs text-stone-900 focus:border-emerald-600 focus:outline-none"
                            placeholder="Commission ya asilimia 10 nk."
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-stone-700 block uppercase">Kiasi cha Mtaji Unaotafuta (Funding Needs)</label>
                        <input
                          type="text"
                          value={pdForm.fundingNeeds}
                          onChange={(e) => setPdForm({ ...pdForm, fundingNeeds: e.target.value })}
                          className="w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2 text-xs text-stone-900 focus:border-emerald-600 focus:outline-none"
                          required
                          placeholder="Milioni 25 TZS ya Ruzuku nk."
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isGenerating}
                        className="w-full rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm py-3 px-4 shadow-sm transition-all uppercase tracking-wider flex items-center justify-center space-x-2"
                      >
                        {isGenerating ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            <span>Inasindika Pitch Script...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4" />
                            <span>Zalisha Pitch Deck Script kwa AI</span>
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>

            {/* Output Display Board side */}
            <div className="lg:col-span-6 flex flex-col h-full">
              <div className="flex-1 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm min-h-[460px] flex flex-col justify-between">
                
                {/* Board header */}
                <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                    <span className="text-xs font-bold text-stone-800 uppercase tracking-widest font-display">
                      {activeTool === 'business-plan' ? 'Business Plan Viewer' : 'Pitch Deck Script Viewer'}
                    </span>
                  </div>

                  {aiResult && (
                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={handleCopyToClipboard}
                        className="rounded-lg p-1.5 text-stone-500 hover:bg-stone-50 hover:text-stone-900 flex items-center space-x-1 border border-stone-200 text-[11px] font-semibold"
                        title="Nakili nakala zote"
                      >
                        <Copy className="h-3.5 w-3.5" />
                        <span>{copied ? 'Yamelyalikiwa!' : 'Nakili'}</span>
                      </button>
                      <button
                        onClick={handleDownloadFile}
                        className="rounded-lg p-1.5 text-emerald-650 hover:bg-emerald-50 hover:text-emerald-800 flex items-center space-x-1 border border-emerald-100 bg-emerald-50/50 text-[11px] font-bold"
                        title="Pakua faili kama txt"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Pakua</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-auto pr-1">
                  {isGenerating ? (
                    /* Loading message block */
                    <div className="h-full flex flex-col items-center justify-center space-y-4 py-20 text-center animate-fade-in">
                      <div className="relative">
                        <div className="h-14 w-14 rounded-full border-4 border-emerald-100 border-t-emerald-600 animate-spin"></div>
                        <span className="absolute bottom-[-10px] right-[-10px] text-lg"></span>
                      </div>
                      <div className="space-y-1.5 max-w-sm">
                        <p className="text-sm font-bold text-stone-900">Akili Mnemba (Gemini AI) Inatengeneza...</p>
                        <p className="text-xs text-stone-500 italic">" {genStepMessage} "</p>
                      </div>
                    </div>
                  ) : generationError ? (
                    /* Error Feedback Block */
                    <div className="rounded-xl bg-red-50 p-4 border border-red-200 text-red-800 space-y-3">
                      <div className="flex items-start space-x-2">
                        <AlertCircle className="h-5 w-5 text-red-650 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-xs uppercase tracking-wide text-red-900">Hitilafu imetokea</p>
                          <p className="text-xs leading-relaxed mt-1">{generationError}</p>
                        </div>
                      </div>
                    </div>
                  ) : aiResult ? (
                    /* Render generated Markdown response beautifully */
                    <div className="space-y-4 text-xs font-serif leading-relaxed px-1 max-h-[500px]">
                      {renderFormattedMarkdown(aiResult)}
                    </div>
                  ) : (
                    /* Pre-generation empty guidance */
                    <div className="h-full flex flex-col items-center justify-center space-y-4 py-20 text-center text-stone-400">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-stone-50 border border-stone-100 text-stone-300">
                        <FileText className="h-8 w-8" />
                      </div>
                      <div className="space-y-1 max-w-xs mx-auto">
                        <p className="text-sm font-bold text-stone-850">Zana ya Smart-Draft iko tayari.</p>
                        <p className="text-xs text-stone-500 leading-relaxed">
                          {!isPaid 
                            ? 'Fungua uanachama kwa kulipia ili kuanza kuzalisha hati kamili za kiuchumi.'
                            : 'Bofya kitufe cha "Zalisha" kushoto ili AI yetu iandae hati yako ndani ya sekunde chache.'
                          }
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Notice badge footer */}
                <div className="mt-4 pt-3 border-t border-stone-100 text-[10px] text-stone-460 flex items-center justify-between">
                  <span>Msaada wa AI na Gemini 3.5 Flash</span>
                  <span>FundSeed Smart-Draft™ na Adamu Kafuruma</span>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>
    </motion.div>
  )}

  {/* 6. Curated Opportunities Section */}
  {currentPage === 'grants' && (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-stone-50 pb-12"
    >
      {/* Custom Back to Home Breadcrumb/Navigation block */}
      <div className="bg-white border-b border-stone-200/60 py-4 shadow-sm mb-6 sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => { window.location.hash = '#/'; }}
              className="inline-flex items-center space-x-1.5 text-xs text-stone-600 hover:text-emerald-700 font-semibold bg-stone-100/80 hover:bg-stone-200/80 px-3 py-1.5 rounded-lg transition-colors border border-stone-200"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Nyumbani</span>
            </button>
            <span className="text-stone-300">/</span>
            <h1 className="text-sm font-black text-stone-800 font-display tracking-tight">Mkusanyiko wa Ruzuku (Business Grants)</h1>
          </div>
          <div className="inline-flex items-center space-x-1.5 bg-emerald-50 border border-emerald-600 px-3 py-1.5 rounded-full">
            <span className="text-[10px] font-bold text-emerald-700 tracking-widest uppercase">Database Ya Sasa Hivi</span>
          </div>
        </div>
      </div>

      <section id="fursa" className="py-12 bg-stone-50 space-y-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header Description for Grants */}
          <div className="mx-auto max-w-3xl text-center mb-8 space-y-4">
            <h2 className="text-3xl font-extrabold text-stone-900 font-display sm:text-4xl">
              Fursa za Ufadhili kwa Biashara Zetu
            </h2>
            <p className="text-stone-605 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
              Tunapunguza tatizo la mtaji kwa wafanyabiashara wadogo na wa kati. Tunatafuta, kuchuja, na kuleta ruzuku (grants) na fursa za mitaji ili kusaidia biashara zianze, zikue, na ziwe endelevu.
            </p>
          </div>

          {/* Paywall Gate for Curated Opportunities list */}
          {!isPaid ? (
            /* Locked Pre-payment Sneak-peek view */
            <div className="max-w-5xl mx-auto space-y-6 relative">
              
              {/* Premium locked overlays */}
              <div className="absolute inset-0 bg-stone-50/10 backdrop-blur-md z-10 flex flex-col items-center justify-center p-4">
                <div className="rounded-2xl bg-white/95 backdrop-blur-md p-6 sm:p-10 border border-stone-200/90 shadow-2xl max-w-xl w-full mx-auto space-y-6 animate-fade-in text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-600 border border-amber-200">
                    <Lock className="h-6 w-6 text-amber-600 animate-pulse" />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-2xl font-extrabold text-stone-950 font-display">Hub ya Ufadhili Imefungwa</h3>
                    <p className="text-sm text-stone-605 leading-relaxed">
                      Maktaba hii ina taarifa za kina za majukwaa na wavuti 50+ za sasa zinazotoa ruzuku (Grants) na mikopo isiyo na riba kwa wajasiriamali nchini Tanzania kama vile SIDO, TADB, PASS, Tony Elumelu, na USADF.
                    </p>
                    <p className="text-xs text-stone-500 font-medium">
                      Lipia ada ya mara moja ya TZS 20,000 pekee ili kuona orodha kamili, viungo vya wavuti vya kutuma maombi, kupata masomo ya siri ya kipekee, na kujiunga na barua pepe yetu ya support - fundseed.tanzania@gmail.com!
                    </p>
                  </div>

                  <div className="bg-stone-50 rounded-xl p-4 border border-stone-200/40 text-left space-y-2.5 text-xs">
                    <div className="flex items-center space-x-2 text-emerald-800 font-bold">
                      <ShieldCheck className="h-4 w-4 text-emerald-600" />
                      <span>Uanachama wako wa Premium unajumuisha:</span>
                    </div>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-stone-600">
                      <li className="flex items-center space-x-1.55">
                        <span className="text-emerald-500 font-bold text-sm">Hapa:</span>
                        <span>Orodha ya ruzuku 50+</span>
                      </li>
                      <li className="flex items-center space-x-1.55">
                        <span className="text-emerald-500 font-bold text-sm">Hapa:</span>
                        <span>Tovuti & Viungi vipya</span>
                      </li>
                      <li className="flex items-center space-x-1.55">
                        <span className="text-emerald-500 font-bold text-sm">Hapa:</span>
                        <span>Zana thabiti ya Smart-Draft AI</span>
                      </li>
                      <li className="flex items-center space-x-1.55">
                        <span className="text-emerald-500 font-bold text-sm">Hapa:</span>
                        <span>Barua pepe ya Support ya VIP</span>
                      </li>
                    </ul>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                    <button
                      onClick={handleUnlockVIP}
                      className="w-full sm:w-auto rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-6 py-3.5 shadow-md active:scale-95 transition-all flex items-center justify-center space-x-2"
                    >
                      <span>Anza Toleo la Premium — TZS 20,000</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Blurred placeholder cards shown to build visual premium context */}
              <div className="blur-[5px] select-none pointer-events-none space-y-4 opacity-40">
                {[
                  {
                    title: "Ruzuku ya Ustahimilivu wa Kilimo Tanzania",
                    provider: "USADF Program",
                    amount: "TZS 55,000,000",
                    origin: "Duniani",
                    category: "ruzuku"
                  },
                  {
                    title: "Mfuko wa Mikopo na Udhamini wa Vijana nchini",
                    provider: "PASS Trust Tanzania",
                    amount: "TZS 40,000,000",
                    origin: "Tanzania",
                    category: "mkopo"
                  },
                  {
                    title: "Ruzuku Maalum ya Kukuza Ushirika wa Wanawake",
                    provider: "UN Women Tanzania",
                    amount: "TZS 25,000,000",
                    origin: "Duniani",
                    category: "ruzuku"
                  }
                ].map((fake, fIdx) => (
                  <div key={fIdx} className="rounded-2xl border border-stone-200 bg-white p-5 flex justify-between items-center gap-4">
                    <div>
                      <span className="px-2.5 py-0.5 rounded-full uppercase text-[10px] font-bold bg-stone-100 text-stone-700">
                        {fake.category}
                      </span>
                      <h4 className="text-base font-bold text-stone-900 mt-2">{fake.title}</h4>
                      <p className="text-xs text-stone-400 font-medium">Mtoa Huduma: {fake.provider}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-stone-400 block">Kiwango cha Juu</span>
                      <span className="text-sm font-extrabold text-emerald-700">{fake.amount}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Unlocked Live Interactive Opportunities Experience */
            <>
              {/* Search, filters, and categories panel */}
              <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-sm space-y-4 max-w-5xl mx-auto animate-fade-in">
                <div className="grid gap-4 md:grid-cols-12 items-center">
                  
                  {/* Search text-field */}
                  <div className="md:col-span-5 relative">
                    <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                    <input
                      type="text"
                      placeholder="Tafuta ruzuku au taasisi (e.g. TADB, SIDO, Tony Elumelu)..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full rounded-xl border border-stone-300 bg-white pl-10 pr-3.5 py-2.5 text-sm text-stone-900 focus:border-emerald-600 focus:outline-none placeholder-stone-400"
                    />
                  </div>

                  {/* Category selector */}
                  <div className="md:col-span-3 flex items-center space-x-2">
                    <Filter className="h-4 w-4 text-stone-400 shrink-0" />
                    <select
                      value={categoryFilter}
                      onChange={(e) => {
                        setCategoryFilter(e.target.value);
                        setExpandedOpportunity(null);
                      }}
                      className="w-full rounded-xl border border-stone-305 bg-white px-3 py-2.5 text-xs font-bold text-stone-700 focus:border-emerald-650 focus:outline-none"
                    >
                      <option value="zote">Aina Zote za Mtaji</option>
                      <option value="ruzuku">Ruzuku Pekee</option>
                      <option value="mkopo">Mikopo ya Nafuu</option>
                      <option value="equity">Uwekezaji (Equity)</option>
                      <option value="incubator">Incubators / Malezi</option>
                    </select>
                  </div>

                  {/* Origin filter selector */}
                  <div className="md:col-span-3">
                    <select
                      value={originFilter}
                      onChange={(e) => {
                        setOriginFilter(e.target.value);
                        setExpandedOpportunity(null);
                      }}
                      className="w-full rounded-xl border border-stone-305 bg-white px-3 py-2.5 text-xs font-bold text-stone-700 focus:border-emerald-650 focus:outline-none"
                    >
                      <option value="zote">Maeneo Yote (Chukua Kote)</option>
                      <option value="Tanzania">Tanzania pekee</option>
                      <option value="Duniani">Hadi fursa za Kimataifa</option>
                    </select>
                  </div>

                  {/* Counter badges */}
                  <div className="md:col-span-1 text-center py-1">
                    <span className="inline-flex rounded-full bg-stone-100 px-3 py-1 text-xs font-bold text-stone-800 border border-stone-200">
                      {filteredOpportunities.length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Grid list of opportunities */}
              <OpportunityNotificationSignup 
                lang={lang} 
                currentUser={currentUser}
                activeFilters={{
                    category: categoryFilter,
                    origin: originFilter,
                    searchTerm: searchTerm
                }} 
              />

              {/* Deadline Calendar reminders tracking active flagged opportunities */}
              <OpportunityReminderCalendarPanel 
                allOpportunities={activeOpportunities}
                lang={lang}
                onViewOpportunity={(id) => {
                  setExpandedOpportunity(id);
                  setTimeout(() => {
                    const el = document.getElementById(`opp-card-${id}`);
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                  }, 120);
                }}
              />

              <div className="max-w-5xl mx-auto space-y-4">
                {isLoadingOpps ? (
                  <>
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                  </>
                ) : (
                  (() => {
                    const matches = userInterests.length > 0 
                      ? filteredOpportunities.filter(o => getOpportunityMatches(o, userInterests).length > 0)
                      : [];
                    const others = userInterests.length > 0
                      ? filteredOpportunities.filter(o => getOpportunityMatches(o, userInterests).length === 0)
                      : filteredOpportunities;

                    return (
                      <div className="space-y-8" id="grants-view-destination">
                        {/* Highlighted Match Desk */}
                        {userInterests.length > 0 && (
                          <div className="space-y-4 p-5 sm:p-6 bg-amber-50/20 rounded-3xl border border-amber-500/10 shadow-sm relative overflow-hidden backdrop-blur-sm">
                            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                              <Sparkles className="h-24 w-24 text-amber-500" />
                            </div>
                            
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200/50 pb-4">
                              <div className="space-y-1">
                                <h3 className="text-base font-black text-amber-950 font-display flex items-center gap-2">
                                  <Sparkles className="h-5 w-5 text-amber-600 animate-spin-slow" />
                                  <span>
                                    {lang === 'sw' 
                                      ? 'Fursa Zilizooana na Profaili Yako' 
                                      : 'Opportunities Tailored to Your Profile'}
                                  </span>
                                </h3>
                                <p className="text-stone-605 text-xs leading-relaxed">
                                  {lang === 'sw'
                                    ? `Zilizopendekezwa kulingana na mambo unayopenda: ${userInterests.map(i => i === 'Agriculture' ? 'Kilimo' : i === 'Healthcare' ? 'Afya' : i === 'Education' ? 'Elimu' : i === 'Tech' ? 'Teknolojia' : i === 'Women' ? 'Wanawake' : i === 'Youth' ? 'Vijana' : i).join(', ')}`
                                    : `Tailored matching recommendations based on your quiz: ${userInterests.join(', ')}`}
                                </p>
                              </div>
                              <button
                                onClick={() => {
                                  setCurrentPage('dashboard');
                                  // Switch to smart-draft tool tab manually
                                  setActiveTool('business-plan');
                                  setTimeout(() => {
                                    const el = document.getElementById('matching-quiz-card');
                                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                                  }, 150);
                                }}
                                className="px-3 py-1.5 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-105 border border-amber-200 rounded-xl transition-all inline-flex items-center gap-1 shrink-0 self-start sm:self-center bg-white"
                              >
                                ✏ {lang === 'sw' ? 'Badili Dodoso' : 'Retake Quiz'}
                              </button>
                            </div>

                            {matches.length > 0 ? (
                              <div className="space-y-4">
                                {matches.map((opp, idx) => renderOpportunityCard(opp, idx, true))}
                              </div>
                            ) : (
                              <div className="rounded-xl border border-stone-200 bg-white p-6 text-center text-stone-500 text-xs">
                                {lang === 'sw' 
                                  ? 'Hatukupata fursa zinazolingana kabisa na vipengele hivi kwa sasa nchini Tanzania. Tunasasisha maktaba kila siku!'
                                  : 'No specific matching opportunities in Tanzania found right now. Check back as we update daily!'}
                              </div>
                            )}
                          </div>
                        )}

                        {/* General/Main List Directory Section */}
                        <div className="space-y-4">
                          {userInterests.length > 0 && others.length > 0 && (
                            <h3 className="text-xs font-black text-stone-900 block uppercase tracking-wider pl-1 pt-2">
                              {lang === 'sw' ? 'Fursa Nyingine za Ufadhili' : 'All Other Funding Opportunities'}
                            </h3>
                          )}

                          {others.length > 0 ? (
                            others.map((opp, idx) => renderOpportunityCard(opp, idx, false))
                          ) : (
                            userInterests.length === 0 ? (
                              <div className="rounded-2xl border border-stone-200 bg-white p-12 text-center text-stone-400">
                                <p className="font-bold font-sans">Hatukupata fursa zinazoendana na utafutaji wako.</p>
                                <button 
                                  onClick={() => { setSearchTerm(''); setCategoryFilter('zote'); setOriginFilter('zote'); }}
                                  className="mt-3 inline-flex items-center text-emerald-650 text-xs font-bold underline"
                                >
                                  Safisha vichungi vyote
                                </button>
                              </div>
                            ) : null
                          )}
                        </div>
                      </div>
                    );
                  })()
                )}
              </div>
            </>
          )}

        </div>
      </section>
    </motion.div>
  )}

  {/* Scholarships Section is now on its own separate dedicated page view */}

  {/* 7. African Testimonials Section */}
  {currentPage === 'home' && (
    <>
      <section id="ushuhuda" className="py-20 bg-stone-50/40 border-y border-stone-200/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="mx-auto max-w-3xl text-center mb-16 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-600">Mafanikio Halisi</h2>
            <p className="text-3xl font-extrabold text-stone-900 font-display sm:text-4xl">
              Wamefanikiwa Kupata Ufadhili
            </p>
            <p className="text-stone-600 text-sm leading-relaxed max-w-xl mx-auto">
              Tazama miradi halisi ya wajasiriamali wa Kitanzania waliotumia zana zetu kujaza hati za kitaalamu na sasa wamefanikiwa kukuza ndoto zao kwa vitendo.
            </p>
            <div className="h-1 w-16 bg-emerald-500 mx-auto rounded-full"></div>
          </div>

          {/* Main Slide Carousel Container */}
          <div className="relative max-w-5xl mx-auto bg-white rounded-3xl border border-stone-200/90 shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
            
            <div className="grid grid-cols-1 md:grid-cols-12 min-h-[420px]">
              
              {/* Left Column: Premium Success Project High-quality Photo */}
              <div className="md:col-span-5 relative bg-stone-900 overflow-hidden min-h-[300px] md:min-h-full">
                
                {currentTest.image ? (
                  <img 
                    src={currentTest.image} 
                    alt={currentTest.name} 
                    className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out scale-100 hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="absolute inset-0 bg-emerald-950 flex items-center justify-center text-white text-5xl font-black">
                    {currentTest.avatarChar}
                  </div>
                )}
                
                {/* Visual Glow Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/20 to-transparent"></div>

                {/* Left Side Labels & Story Overview */}
                <div className="absolute top-4 left-4 z-10">
                  <span className="inline-flex items-center space-x-1 bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-md">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                    <span>SUCCESS STORY</span>
                  </span>
                </div>

                <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-emerald-400">Mradi Halisi</p>
                  <h4 className="text-lg font-black leading-tight tracking-wide">{currentTest.business}</h4>
                  <p className="text-[11px] text-stone-300">{currentTest.location}</p>
                </div>
              </div>

              {/* Right Column: Narrative Content & Meta details */}
              <div className="md:col-span-7 p-6 sm:p-10 md:p-12 flex flex-col justify-between space-y-6 relative bg-white">
                
                {/* SVG pattern overlay behind content */}
                <div className="absolute top-0 right-0 w-44 h-44 opacity-5 pointer-events-none text-emerald-900">
                  <Quote className="w-full h-full" />
                </div>

                {/* Big Quote & Narrative Story */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-emerald-600/20">
                    <Quote className="w-10 h-10 fill-current text-emerald-500" />
                  </div>
                  
                  <p className="text-stone-700 text-sm md:text-base leading-relaxed font-sans italic">
                    "{currentTest.story}"
                  </p>
                </div>

                {/* Sub-Footer: Profile and Chevron Navigation controls */}
                <div className="pt-6 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  
                  {/* Founder Profile details */}
                  <div className="flex items-center space-x-3.5">
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center text-white font-extrabold text-base uppercase shadow-sm ${currentTest.avatarColor}`}>
                      {currentTest.avatarChar}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-stone-900 tracking-wide">{currentTest.name}</h4>
                      <p className="text-[10px] text-stone-500 font-medium">{currentTest.business}</p>
                      <p className="text-[9px] text-stone-400">Makazi: {currentTest.location}</p>
                    </div>
                  </div>

                  {/* High-impact Funding Amount Received indicator */}
                  <div className="flex sm:flex-col items-start bg-emerald-50 border border-emerald-100 p-2.5 px-3.5 rounded-2xl flex-grow sm:flex-grow-0">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block mr-2 sm:mr-0">Ufadhili Waliopata:</span>
                    <span className="text-sm font-extrabold text-emerald-600 whitespace-nowrap block mt-0.5">
                      {currentTest.amountGranted}
                    </span>
                  </div>

                </div>

                {/* Chevron Navigation & Auto-indicator slide dots */}
                <div className="flex items-center justify-between pt-4 border-t border-stone-50 bg-stone-50/30 px-2 py-1 rounded-xl">
                  
                  {/* Dots Indicator */}
                  <div className="flex space-x-2">
                    {africanTestimonials.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveTestimonialIdx(idx)}
                        className={`h-2 rounded-full transition-all duration-300 ${
                          idx === activeTestimonialIdx ? 'bg-emerald-600 w-6' : 'bg-stone-300 hover:bg-stone-400'
                        }`}
                        title={`Nenda kwa Ushuhuda ${idx + 1}`}
                      />
                    ))}
                  </div>

                  {/* Previous / Next buttons */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setActiveTestimonialIdx((prev) => 
                          prev === 0 ? africanTestimonials.length - 1 : prev - 1
                        );
                      }}
                      className="p-2 rounded-lg border border-stone-200 bg-white text-stone-600 hover:text-emerald-600 hover:border-emerald-600/40 transition-colors shadow-sm cursor-pointer"
                      title="Ushuhuda Uliopita"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        setActiveTestimonialIdx((prev) => 
                          (prev + 1) % africanTestimonials.length
                        );
                      }}
                      className="p-2 rounded-lg border border-stone-200 bg-white text-stone-600 hover:text-emerald-600 hover:border-emerald-600/40 transition-colors shadow-sm cursor-pointer"
                      title="Ushuhuda Ujao"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                </div>

              </div>
            </div>

          </div>

          {/* Inline Slider Mini Navigation Grid (Tabs for selection) */}
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {africanTestimonials.map((test, idx) => (
              <button
                key={test.id}
                onClick={() => setActiveTestimonialIdx(idx)}
                className={`p-3 text-left rounded-2xl transition-all duration-300 border flex items-center space-x-3 cursor-pointer group ${
                  idx === activeTestimonialIdx 
                    ? 'bg-white border-emerald-500 shadow-md ring-1 ring-emerald-500/10' 
                    : 'bg-stone-50/50 border-stone-200 hover:bg-white hover:border-stone-300 hover:shadow-sm'
                }`}
              >
                <div className="relative flex-shrink-0">
                  {test.image ? (
                    <img 
                      src={test.image} 
                      alt={test.name} 
                      className="w-10 h-10 rounded-full object-cover border border-stone-200"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-extrabold text-xs uppercase ${test.avatarColor}`}>
                      {test.avatarChar}
                    </div>
                  )}
                  {idx === activeTestimonialIdx && (
                    <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 text-[8px] leading-none font-bold shadow-sm">
                      Hi
                    </span>
                  )}
                </div>
                
                <div className="min-w-0 flex-1">
                  <h5 className={`text-[11px] font-bold tracking-tight truncate transition-colors ${
                    idx === activeTestimonialIdx ? 'text-emerald-700' : 'text-stone-900 group-hover:text-emerald-600'
                  }`}>
                    {test.name}
                  </h5>
                  <p className="text-[9px] text-stone-500 truncate leading-none mt-0.5">{test.business}</p>
                  <p className="text-[9px] text-emerald-800 font-extrabold mt-1">{test.amountGranted.split(' ')[0]} {test.amountGranted.split(' ')[1] || 'TZS'}</p>
                </div>
              </button>
            ))}
          </div>

        </div>
      </section>

      {/* Academy & Resources segment */}
    </>
  )}

  {currentPage === 'academy' && (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-stone-50 pb-12"
    >
      <div className="bg-white border-b border-stone-200/60 py-4 shadow-sm mb-6 sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => { window.location.hash = '#/'; }}
              className="inline-flex items-center space-x-1.5 text-xs text-stone-600 hover:text-emerald-700 font-semibold bg-stone-100/80 hover:bg-stone-200/80 px-3 py-1.5 rounded-lg transition-colors border border-stone-200"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Nyumbani</span>
            </button>
            <span className="text-stone-300">/</span>
            <h1 className="text-sm font-black text-stone-800 font-display tracking-tight">Funding Academy</h1>
          </div>
          <div className="inline-flex items-center space-x-1.5 bg-emerald-50 border border-emerald-600 px-3 py-1.5 rounded-full">
            <span className="text-[10px] font-bold text-emerald-700 tracking-widest uppercase">Elimu & Mwongozo</span>
          </div>
        </div>
      </div>

      <section id="academy" className="py-12 bg-stone-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="mx-auto max-w-4xl text-center mb-14 space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">FundSeed Academy</span>
            <h2 className="text-3xl font-extrabold text-stone-900 font-display sm:text-4xl leading-tight">
              Elimu na Mwongozo wa Kupata Mtaji
            </h2>
            <p className="text-stone-600 text-sm leading-relaxed max-w-2xl mx-auto">
              Kupata ufadhili si mafanikio ya bahati tu, bali ni matokeo ya <strong>maandalizi thabiti na kuunganishwa na mfumo sahihi.</strong> Soma maelezo ya kitaalamu hapa chini ili kujifunza siri za kuwavutia wawekezaji na wafadhili wa ruzuku nchini Tanzania.
            </p>
            <div className="h-1 w-16 bg-emerald-500 mx-auto rounded-full"></div>
          </div>

          <div className="max-w-6xl mx-auto grid gap-8 lg:grid-cols-12 items-start">
            
            {/* Left navigation buttons list for tabs layout */}
            <div className="lg:col-span-4 space-y-3.5">
              <button
                type="button"
                onClick={() => setAcademyTab('mbona-kufeli')}
                className={`w-full text-left rounded-xl p-4 transition-all duration-200 font-display border ${
                  academyTab === 'mbona-kufeli'
                    ? 'bg-emerald-900 text-white shadow-md border-emerald-950'
                    : 'bg-white text-stone-850 border-stone-250 hover:border-emerald-500/55 hover:bg-stone-50/50'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <span></span>
                  <div>
                    <h3 className="font-bold text-sm">1. Kwa Nini Unakosa Ufadhili?</h3>
                    <p className={`text-[11px] mt-0.5 ${academyTab === 'mbona-kufeli' ? 'text-emerald-100' : 'text-stone-500'}`}>
                      Mbona wajasiriamali wadogo hukataliwa?
                    </p>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setAcademyTab('miradi-kipaumbele')}
                className={`w-full text-left rounded-xl p-4 transition-all duration-200 font-display border ${
                  academyTab === 'miradi-kipaumbele'
                    ? 'bg-emerald-900 text-white shadow-md border-emerald-955'
                    : 'bg-white text-stone-850 border-stone-250 hover:border-emerald-500/55 hover:bg-stone-50/50'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <span></span>
                  <div>
                    <h3 className="font-bold text-sm">2. Miradi ya Kipaumbele</h3>
                    <p className={`text-[11px] mt-0.5 ${academyTab === 'miradi-kipaumbele' ? 'text-emerald-100' : 'text-stone-500'}`}>
                      Sekta nazo ruzuku wanazopendelea kuwekeza.
                    </p>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setAcademyTab('incubator-vs-accelerator')}
                className={`w-full text-left rounded-xl p-4 transition-all duration-200 font-display border ${
                  academyTab === 'incubator-vs-accelerator'
                    ? 'bg-emerald-900 text-white shadow-md border-emerald-955'
                    : 'bg-white text-stone-850 border-stone-250 hover:border-emerald-500/55 hover:bg-stone-50/50'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <span className="text-xl">⚖️</span>
                  <div>
                    <h3 className="font-bold text-sm">3. Incubator vs. Accelerator</h3>
                    <p className={`text-[11px] mt-0.5 ${academyTab === 'incubator-vs-accelerator' ? 'text-emerald-100' : 'text-stone-500'}`}>
                      Kuna tofauti gani? Linganisha mifumo yote.
                    </p>
                  </div>
                </div>
              </button>

              {/* Quick Academy sidebar banner showing CTA */}
              <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50/80 p-5 border border-emerald-100/70 text-left space-y-4">
                <p className="text-xs font-bold text-emerald-850 flex items-center gap-1.5 uppercase tracking-wide">
                  <span></span>
                  <span>Anza Leo</span>
                </p>
                <p className="text-stone-600 text-xs leading-relaxed">
                  Usipoteze muda sasa kwa kutuma maombi yasiyo na tailored details weledi. Sajili andiko thabiti sasa upate ruzuku!
                </p>
                <button
                  type="button"
                  onClick={() => scrollToSection(checkoutSectionRef)}
                  className="w-full inline-flex items-center justify-center rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 shadow-sm transition-all text-center gap-1.5"
                >
                  <span>Mwanzo wa Kujiunga</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Right Display area based on active Academy tab selection */}
            <div className="lg:col-span-8 bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-sm min-h-[440px] transition-all duration-300">
              
              {academyTab === 'mbona-kufeli' && (
                <div className="space-y-6">
                  <div className="border-b border-stone-100 pb-3">
                    <h3 className="text-2xl font-black text-stone-900 font-display">
                      Kwa Nini Wajasiriamali Wanakosa Ufadhili (Funding)?
                    </h3>
                    <p className="text-stone-505 text-xs mt-1">Ukurasa wa Masomo: Uboreshaji wa Mbinu za Biashara na Wawekezaji</p>
                  </div>
                  
                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-sans">
                    Wengi huamini kuwa ufadhili ni suala la bahati, lakini kwa wawekezaji, ni suala la <strong>maandalizi na uunganisho.</strong> Hizi ndizo sababu kuu zinazowafanya wajasiriamali wengi kukosa fursa nchini Tanzania:
                  </p>

                  <div className="space-y-4 text-xs sm:text-xs">
                    
                    {/* Item 1 */}
                    <div className="rounded-xl border border-stone-150 p-4 space-y-1.5 bg-stone-50 hover:bg-white transition-all">
                      <h4 className="font-bold text-stone-900 flex items-center gap-2 text-sm sm:text-sm">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-150 text-[10px] font-bold text-red-700 shrink-0"></span>
                        Kukosa Jukwaa Sahihi la Uunganishaji (The Missing Platform)
                      </h4>
                      <p className="text-stone-600 leading-relaxed pl-7">
                        Unaweza kuwa na dhahabu mkononi, lakini kama hujui wapi pa kuiuzia, itabaki kuwa jiwe tu. Wajasiriamali wengi wanashindwa kwa sababu hawana daraja (platform) linalowaunganisha na wawekezaji husika. Wanaishia kutuma maombi kwenye maeneo yasiyo sahihi (misalignment), jambo linalopoteza muda na rasilimali. <strong>FundSeed</strong> inakuja kuziba pengo hili kwa kukuunganisha na fursa zilizothibitishwa.
                      </p>
                    </div>

                    {/* Item 2 */}
    <div className="rounded-xl border border-stone-150 p-4 space-y-1.5 bg-stone-50 hover:bg-white transition-all">
      <h4 className="font-bold text-stone-900 flex items-center gap-2 text-sm sm:text-sm">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-155 text-[10px] font-bold text-red-700 shrink-0"></span>
        Kukosa Utaalamu wa Kuziwasilisha (Pitching Skills)
      </h4>
                      <p className="text-stone-600 leading-relaxed pl-7">
                        Wazo lako linaweza kuwa bora, lakini kama huwezi kulielezea kwa lugha inayoeleweka na wawekezaji (Financial jargon & Pitching), maombi yako yatatupiliwa mbali.
                      </p>
                    </div>

                    {/* Item 3 */}
                    <div className="rounded-xl border border-stone-150 p-4 space-y-1.5 bg-stone-50 hover:bg-white transition-all">
                      <h4 className="font-bold text-stone-900 flex items-center gap-2 text-sm sm:text-sm">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-155 text-[10px] font-bold text-red-700 shrink-0"></span>
                        Kukosa Uthibitisho wa Soko (Lack of Traction)
                      </h4>
                      <p className="text-stone-600 leading-relaxed pl-7">
                        Wawekezaji hawapendi kuwekeza kwenye "ndoto." Wanapenda kuona umeshaanza kuingia sokoni (hata kidogo), unajua wateja wako ni nani, na unajua changamoto unazopitia.
                      </p>
                    </div>

                    {/* Item 4 */}
                    <div className="rounded-xl border border-stone-150 p-4 space-y-1.5 bg-stone-50 hover:bg-white transition-all">
                      <h4 className="font-bold text-stone-900 flex items-center gap-2 text-sm sm:text-sm">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-155 text-[10px] font-bold text-red-700 shrink-0"></span>
                        Kukosa Mipango ya Kifedha (Financial Literacy)
                      </h4>
                      <p className="text-stone-600 leading-relaxed pl-7">
                        Kujua unataka pesa kiasi gani ni jambo moja, lakini kuonyesha jinsi pesa hiyo itakavyozalisha faida au kuleta impact ni jambo lingine. Wengi hushindwa hapa.
                      </p>
                    </div>

                    {/* Item 5 */}
                    <div className="rounded-xl border border-stone-150 p-4 space-y-1.5 bg-stone-50 hover:bg-white transition-all">
                      <h4 className="font-bold text-stone-900 flex items-center gap-2 text-sm sm:text-sm">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-155 text-[10px] font-bold text-red-700 shrink-0"></span>
                        Kutoa Maombi ya Jumla (Generic Applications)
                      </h4>
                      <p className="text-stone-600 leading-relaxed pl-7">
                        Kila mfadhili ana vigezo vyake. Kutumia "Business Plan" ileile kwa kila fursa ni kosa kubwa. Maombi lazima yawe ya kipekee (tailored) kulingana na mahitaji ya mfadhili.
                      </p>
                    </div>

                  </div>
                </div>
              )}

              {academyTab === 'miradi-kipaumbele' && (
                <div className="space-y-6">
                  <div className="border-b border-stone-100 pb-3">
                    <h3 className="text-2xl font-black text-stone-900 font-display">
                      Miradi ya Kipaumbele (High-Priority Projects)
                    </h3>
                    <p className="text-stone-505 text-xs mt-1">Ukurasa wa Masomo: Sekta Zinazopendelewa za Grant & Ruzuku nchini</p>
                  </div>
                  
                  <div className="grid gap-4 sm:grid-cols-2 text-xs">
                    
                    {/* Project 1 */}
                    <div className="rounded-xl border border-stone-200 p-4 space-y-2 bg-gradient-to-b from-stone-50/60 to-white hover:border-emerald-500/40 transition-colors">
                      <div className="flex items-center space-x-2 text-stone-900 font-bold text-sm">
                        <Sparkles className="h-4 w-4 text-emerald-600 shrink-0" />
                        <h4>Teknolojia na Digital Solutions</h4>
                      </div>
                      <p className="text-stone-600 leading-relaxed">
                        Miradi inayotumia mfumo wa kidijitali kutatua matatizo makubwa ya jamii (e.g., E-commerce, Fintech, Edutech na telemedicine).
                      </p>
                    </div>

                    {/* Project 2 */}
                    <div className="rounded-xl border border-stone-200 p-4 space-y-2 bg-gradient-to-b from-stone-50/60 to-white hover:border-emerald-500/40 transition-colors">
                      <div className="flex items-center space-x-2 text-stone-900 font-bold text-sm">
                        <Sprout className="h-4 w-4 text-emerald-600 shrink-0" />
                        <h4>Kilimo-Biashara na Usindikaji</h4>
                      </div>
                      <p className="text-stone-600 leading-relaxed">
                        Agribusiness & Value Addition: Miradi inayoongeza thamani ya mazao ya kilimo, inayoleta ajira kwa vijana na wanawake, na inayohakikisha usalama wa chakula kitaifa.
                      </p>
                    </div>

                    {/* Project 3 */}
                    <div className="rounded-xl border border-stone-200 p-4 space-y-2 bg-gradient-to-b from-stone-50/60 to-white hover:border-emerald-500/40 transition-colors">
                      <div className="flex items-center space-x-2 text-stone-900 font-bold text-sm">
                        <Sprout className="h-4 w-4 text-emerald-500 shrink-0" />
                        <h4>Nishati Safi na Mazingira</h4>
                      </div>
                      <p className="text-stone-600 leading-relaxed">
                        Green Energy & Sustainability: Miradi inaypunguza hewa ukaa, inayotumia nishati mbadala (solar, biogas), na inayolinda mazingira na uoto wa asili.
                      </p>
                    </div>

                    {/* Project 4 */}
                    <div className="rounded-xl border border-stone-200 p-4 space-y-2 bg-gradient-to-b from-stone-50/60 to-white hover:border-emerald-500/40 transition-colors">
                      <div className="flex items-center space-x-2 text-stone-900 font-bold text-sm">
                        <BookOpen className="h-4 w-4 text-emerald-600 shrink-0" />
                        <h4>Huduma za Jamii (Healthcare & Ed)</h4>
                      </div>
                      <p className="text-stone-600 leading-relaxed">
                        Miradi inayorahisisha upatikanaji wa huduma bora za afya, vituo asilia vya lishe na elimu bora kwa gharama nafuu kwa kila raia.
                      </p>
                    </div>

                    {/* Project 5 */}
                    <div className="rounded-xl border border-stone-200 p-4 space-y-2 bg-gradient-to-b from-stone-50/60 to-white hover:border-emerald-500/40 transition-colors sm:col-span-2">
                      <div className="flex items-center space-x-2 text-stone-900 font-bold text-sm">
                        <RefreshCw className="h-4 w-4 text-emerald-600 shrink-0" />
                        <h4>Uchumi wa Mduara (Circular Economy)</h4>
                      </div>
                      <p className="text-stone-600 leading-relaxed">
                        Miradi inayotumia taka za mitaani na viwandani kama malighafi kuzalisha bidhaa nyingine muhimu mbadala ili kuzuia upotevu (recycling and waste management).
                      </p>
                    </div>

                  </div>
                </div>
              )}

              {academyTab === 'incubator-vs-accelerator' && (
                <div className="space-y-6">
                  <div className="border-b border-stone-100 pb-3">
                    <h3 className="text-2xl font-black text-stone-900 font-display">
                      Incubator vs. Accelerator Fund: Kuna Tofauti Gani?
                    </h3>
                    <p className="text-stone-505 text-xs mt-1">Ukurasa wa Masomo: Utofautishaji wa Vyombo na Mifumo ya Kibiashara nchini</p>
                  </div>
                  
                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                    Wajasiriamali wengi wanachanganya hizi mbili. Ukiwaelewesha, wataona wewe ni mtaalamu. Soma ulinganisho rasmi wa sifa hapa chini:
                  </p>

                  <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-stone-100 border-b border-stone-200 text-stone-900 font-bold font-display">
                          <th className="p-3">Kipengele</th>
                          <th className="p-3">Incubator</th>
                          <th className="p-3">Accelerator</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-150 text-stone-700">
                        <tr className="hover:bg-stone-50/50">
                          <td className="p-3 font-semibold text-stone-950 bg-stone-50/20">Lengo</td>
                          <td className="p-3">Kulea wazo ili liwe biashara.</td>
                          <td className="p-3">Kuharakisha ukuaji wa biashara iliyopo.</td>
                        </tr>
                        <tr className="hover:bg-stone-50/50">
                          <td className="p-3 font-semibold text-stone-950 bg-stone-50/20">Hatua ya Biashara</td>
                          <td className="p-3">Wazo bado ni changa (Idea stage).</td>
                          <td className="p-3">Biashara imeanza, ina wateja/mauzo.</td>
                        </tr>
                        <tr className="hover:bg-stone-50/50">
                          <td className="p-3 font-semibold text-stone-950 bg-stone-50/20">Muda</td>
                          <td className="p-3">Muda mrefu (Miezi 6 hadi miaka 2).</td>
                          <td className="p-3">Muda mfupi (Miezi 3 hadi 6).</td>
                        </tr>
                        <tr className="hover:bg-stone-50/50">
                          <td className="p-3 font-semibold text-stone-950 bg-stone-50/20">Ufadhili</td>
                          <td className="p-3">Mara nyingi hutoa nafasi ya ofisi na ushauri.</td>
                          <td className="p-3">Mara nyingi hutoa mtaji (seed investment).</td>
                        </tr>
                        <tr className="hover:bg-stone-50/50">
                          <td className="p-3 font-semibold text-stone-950 bg-stone-50/20">Ushauri</td>
                          <td className="p-3">Focus kwenye msingi wa biashara.</td>
                          <td className="p-3">Focus kwenye mauzo na kuongeza soko (Scale).</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 text-xs text-amber-900 leading-relaxed">
                    <p className="font-bold flex items-center gap-1.5 mb-1 text-amber-950">
                      <span></span>
                      <span>Golden Tip (Dhahabu ya Soko):</span>
                    </p>
                    Usiombe rasilimali duni za Accelerator kama una wazo tu bado halijafanyiwa majaribio ya soko. Na pia usikae kwenye Incubator kama una wateja 100 na unataka kutanua soko letu Tanzania!
                  </div>

                </div>
              )}

              {/* Dynamic Action Trigger Bottom Area */}
              <div className="mt-8 pt-5 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-emerald-50/30 p-4 rounded-xl border border-emerald-100/60">
                <div className="space-y-1">
                  <p className="font-extrabold text-stone-900 text-xs sm:text-xs uppercase">Je, uko tayari kuanza safari yako ya kupata mtaji?</p>
                  <p className="text-[11px] text-stone-600 leading-snug">
                    Usipoteze muda kuomba kwenye fursa ambazo hazikufai. Jisajili na <strong>FundSeed</strong> leo, pata mwongozo wa kitaalamu, na uweke mradi wako kwenye nafasi ya juu ya kupata ruzuku.
                  </p>
                </div>
                
                <button
                  type="button"
                  onClick={() => scrollToSection(checkoutSectionRef)}
                  className="rounded-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs py-3 px-6 shadow-sm transition-all text-center flex items-center justify-center gap-1.5 shrink-0 w-full sm:w-auto"
                >
                  <span>Anza Sasa - Pata Fursa</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>

            </div>

          </div>

        </div>
      </section>
    </motion.div>
  )}

  {currentPage === 'home' && (
    <>
      {/* 8. Pricing & Checkout page */}
      <section id="bei" className="py-20 bg-stone-55">
        <div ref={checkoutSectionRef} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="mx-auto max-w-3xl text-center mb-16 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-600">Uwekezaji Wako Mdogo</h2>
            <p className="text-3xl font-extrabold text-stone-900 font-display sm:text-4xl">
              Ufikiaji Kamili wa Mfumo
            </p>
            <div className="h-1 w-16 bg-emerald-500 mx-auto rounded-full"></div>
          </div>

          <div className="grid gap-12 lg:grid-cols-12 max-w-5xl mx-auto items-stretch">
            
            {/* Left pricing display package */}
            <div className="lg:col-span-5 rounded-2xl border border-stone-200 bg-white p-8 flex flex-col justify-between shadow-md">
              <div className="space-y-6">
                <div>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 uppercase tracking-wider">Plan Kamili</span>
                  <div className="mt-4 flex items-baseline">
                    <span className="text-5xl font-black tracking-tight text-stone-950">20,000</span>
                    <span className="ml-2 text-lg font-bold text-stone-500">TZS</span>
                  </div>
                  <p className="text-xs text-stone-400 mt-1">Malipo ya mara moja tu (One-time Access Fee)</p>
                </div>

                <div className="space-y-3.5 pt-4 border-t border-stone-100 text-sm">
                  <p className="font-bold text-stone-900 text-xs block uppercase tracking-wider">Nini Kimejumuishwa:</p>
                  
                  <ul className="space-y-2.5 text-xs text-stone-660">
                    <li className="flex items-center space-x-2.5">
                      <span className="text-emerald-500 font-bold">✔</span>
                      <span>Ufikiaji kamili wa fursa 50+ za ruzuku</span>
                    </li>
                    <li className="flex items-center space-x-2.5">
                      <span className="text-emerald-500 font-bold">✔</span>
                      <span>Zana zote za kulea andishi: Smart-Draft AI</span>
                      <span className="rounded bg-emerald-100/85 px-1.5 py-0.5 text-[8px] font-bold text-emerald-800 ml-1">Infinite</span>
                    </li>
                    <li className="flex items-center space-x-2.5">
                      <span className="text-emerald-500 font-bold">✔</span>
                      <span>Miongozo ya jinsi ya kujibu maswali ya bodi nchini</span>
                    </li>
                    <li className="flex items-center space-x-2.5">
                      <span className="text-emerald-500 font-bold">✔</span>
                      <span>Msaada wa kiufundi barua pepe (24/7)</span>
                    </li>
                    <li className="flex items-center space-x-2.5">
                      <span className="text-emerald-500 font-bold">✔</span>
                      <span>Ahadi ya ukaribisho usio na malipo mengine ya sirini</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Security seal and guarantee */}
              <div className="mt-8 pt-4 border-t border-stone-100 flex items-center space-x-2.5 text-[11px] text-stone-500 select-none">
                <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
                <span>Ulinzi thabiti wa TLS wenye usimbaji thabiti wa data (SSL Secured).</span>
              </div>
            </div>

            {/* Right checkout gateway container - Simplified to a direct CTA */}
            <div id="checkout-box" className="lg:col-span-7 rounded-2xl border border-stone-200 bg-white p-6 sm:p-12 shadow-sm flex flex-col justify-center items-center text-center space-y-6">
              
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mb-2">
                <Sparkles className="h-10 w-10 animate-pulse" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-black text-stone-950 font-display">Anza Leo na FundSeed VIP</h3>
                <p className="text-stone-600 text-sm leading-relaxed max-w-sm mx-auto">
                  Jiunge na mtandao wetu wa wasomi na wajasiriamali 500+ nchini Tanzania na ufungue milango ya mitaji sasa.
                </p>
              </div>

              <div className="space-y-4 w-full max-w-md">
                <button
                  onClick={handleUnlockVIP}
                  className="w-full rounded-2xl bg-stone-950 hover:bg-emerald-600 text-white font-black text-base py-5 px-8 shadow-xl hover:shadow-emerald-500/20 transition-all uppercase tracking-wider flex items-center justify-center space-x-3 group active:scale-[0.98]"
                >
                  <span>Mchakato wa Lipa 20,000</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
                
                <p className="text-[10px] text-stone-400 font-medium">
                  Utachukuliwa kwenye fomu ya usajili na malipo (M-Pesa, Tigo Pesa, nk.)
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 w-full pt-4">
                <div className="flex flex-col items-center p-3 rounded-xl bg-stone-50 border border-stone-100">
                  <span className="text-stone-900 font-bold text-sm">24/7</span>
                  <span className="text-[10px] text-stone-500 uppercase font-bold tracking-tighter">Live Support</span>
                </div>
                <div className="flex flex-col items-center p-3 rounded-xl bg-stone-50 border border-stone-100">
                  <span className="text-stone-900 font-bold text-sm">Infinite</span>
                  <span className="text-[10px] text-stone-500 uppercase font-bold tracking-tighter">AI Generation</span>
                </div>
              </div>

            </div>

            {/* Secure checkout badges inline */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-[10px] text-stone-500 border-t border-stone-105 pt-4">
              <span className="flex items-center space-x-1 select-none">
                <span>SSL Secured Connection</span>
              </span>
              <span className="hidden sm:inline h-3 w-px bg-stone-300"></span>
              <span>Mitandao ya Kulipia: M-Pesa, Tigo Pesa, Airtel Money, Halopesa</span>
            </div>

          </div>
        </div>
      </section>

      {/* 9. FAQ Section */}
      <section className="py-20 bg-white border-t border-stone-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="mx-auto max-w-3xl text-center mb-16 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-600">Maswali ya mara kwa mara</h2>
            <p className="text-3xl font-extrabold text-stone-900 font-display sm:text-4xl">
              Katiba na Maswali ya FundSeed
            </p>
            <div className="h-1 w-16 bg-emerald-500 mx-auto rounded-full"></div>
          </div>

          <div className="max-w-3xl mx-auto grid gap-6">
            {faqs.map((faq, idx) => (
              <div key={idx} className="rounded-2xl border border-stone-200 bg-stone-50/40 p-5 space-y-2">
                <h3 className="text-xs font-bold text-stone-900 font-display flex items-start space-x-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-800 shrink-0 mt-0.5">S</span>
                  <span>{faq.q}</span>
                </h3>
                <p className="text-xs text-stone-605 leading-relaxed pl-7">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

        </>
      )}

      {currentPage === 'scholarships' && (
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.3 }}
        >
          <ScholarshipSection 
            lang={lang}
            isPaid={isPaid} 
            onUnlockPremium={handleNavigateToCheckout} 
            checkoutRef={checkoutSectionRef}
            onGoToHome={() => {
              window.location.hash = '#/';
              setCurrentPage('home');
              window.scrollTo({ top: 0, behavior: 'instant' });
            }}
            onGoToCheckout={handleNavigateToCheckout}
            onGoToSmartDraft={() => {
              window.location.hash = '#/dashboard';
              setCurrentPage('dashboard');
              window.scrollTo({ top: 0, behavior: 'instant' });
            }}
          />
        </motion.div>
      )}

      {currentPage === 'mentorship' && (
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }} 
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="min-h-screen bg-stone-50 pb-12"
        >
          <div className="bg-white border-b border-stone-200/60 py-4 shadow-sm mb-6 sticky top-0 z-40">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => { window.location.hash = '#/'; }}
                  className="inline-flex items-center space-x-1.5 text-xs text-stone-600 hover:text-emerald-700 font-semibold bg-stone-100/80 hover:bg-stone-200/80 px-3 py-1.5 rounded-lg transition-colors border border-stone-200"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Nyumbani</span>
                </button>
                <span className="text-stone-300">/</span>
                <h1 className="text-sm font-black text-stone-800 font-display tracking-tight">Mentorship & Network</h1>
              </div>
              <div className="inline-flex items-center space-x-1.5 bg-emerald-50 border border-emerald-600 px-3 py-1.5 rounded-full">
                <span className="text-[10px] font-bold text-emerald-700 tracking-widest uppercase">Kuunganishwa</span>
              </div>
            </div>
          </div>

          <section className="py-12 bg-stone-50">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-4xl text-center mb-14 space-y-4">
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">Mtandao wa Wataalamu</span>
                <h2 className="text-3xl font-extrabold text-stone-900 font-display sm:text-4xl leading-tight">
                  Pata Mentorship kutoka kwa Waliotangulia
                </h2>
                <p className="text-stone-600 text-sm leading-relaxed max-w-2xl mx-auto">
                  Tunaunganisha waombaji wapya na wanufaika (Alumni) na wataalamu wa kimataifa waliotoka Tanzania kupitia mentorship programs. Pata ushauri kuelekeza brand na career yako!
                </p>
                <div className="h-1 w-16 bg-emerald-500 mx-auto rounded-full"></div>
              </div>

              {!isPaid ? (
                <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-stone-200 p-8 sm:p-12 text-center shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                    <ShieldCheck className="w-48 h-48" />
                  </div>
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mb-6 border-2 border-emerald-100">
                      <GraduationCap className="h-8 w-8" />
                    </div>
                    <h3 className="text-2xl font-bold text-stone-900 font-display mb-3">
                      Fungua Dirisha la Mentorship
                    </h3>
                    <p className="text-stone-600 mb-8 max-w-lg leading-relaxed">
                      Ungana na wataalamu zaidi ya 500+ wa kimataifa. Jipatie Account Yako ili ku-access mawasiliano, sessions na network ya wanufaika wa scholarships na grants.
                    </p>
                    <button 
                      onClick={handleNavigateToCheckout}
                      className="w-full sm:w-auto rounded-full bg-stone-950 hover:bg-emerald-600 text-white font-bold text-sm py-4 px-10 shadow-lg hover:shadow-emerald-500/20 transition-all uppercase tracking-wider flex items-center justify-center space-x-2 active:scale-95 transition-transform"
                    >
                      <Sparkles className="h-4 w-4" />
                      <span>Fungua Fursa — 20,000 TZS</span>
                    </button>
                    <div className="mt-6 flex items-center justify-center text-[10px] text-stone-500 font-semibold space-x-2 uppercase tracking-widest">
                      <ShieldCheck className="h-3 w-3 text-emerald-500" />
                      <span>Usalama Uliothibitishwa (SSL)</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-emerald-200 p-8 shadow-sm">
                  <div className="flex flex-col sm:flex-row items-center gap-6 justify-between border-b border-stone-100 pb-6 mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                        <GraduationCap className="h-6 w-6 text-emerald-600" /> Orodha ya Mentors
                      </h3>
                      <p className="text-stone-500 text-sm mt-1">Wasiliana na waelekezi (mentors) moja kwa moja ili kupata ushauri.</p>
                    </div>
                    <div className="inline-flex items-center space-x-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-100 font-bold text-sm">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      <span>Live Mentorship Database (Mawasiliano yamekuja karibuni)</span>
                    </div>
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                     <div className="border border-stone-200 p-5 rounded-xl hover:shadow-md transition bg-stone-50">
                       <div className="flex items-center gap-3 mb-3">
                         <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">EM</div>
                         <div>
                           <p className="font-bold text-stone-900">Elias Mnanka</p>
                           <p className="text-xs text-stone-500">Kijani Agri Mentorship</p>
                         </div>
                       </div>
                       <p className="text-xs text-stone-600">Alipata Milioni 5 TZS & Mentorship mwaka jana kupitia Mo Dewji Foundation.</p>
                       <button className="mt-4 w-full bg-white border border-stone-300 text-stone-700 hover:bg-stone-100 py-2 rounded-lg text-xs font-bold transition">Tuma Ujumbe</button>
                     </div>

                     <div className="border border-stone-200 p-5 rounded-xl hover:shadow-md transition bg-stone-50">
                       <div className="flex items-center gap-3 mb-3">
                         <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg">FK</div>
                         <div>
                           <p className="font-bold text-stone-900">Farida Kamugisha</p>
                           <p className="text-xs text-stone-500">Tech Sis Tz / UK Scholar</p>
                         </div>
                       </div>
                       <p className="text-xs text-stone-600">Chevening Scholar aliye UK. Anatoa mwongozo kwenye application essay na Business Plan.</p>
                       <button className="mt-4 w-full bg-white border border-stone-300 text-stone-700 hover:bg-stone-100 py-2 rounded-lg text-xs font-bold transition">Tuma Ujumbe</button>
                     </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        </motion.div>
      )}

      {/* 10. Footer with Legal Shield Disclaimer (Swahili) & Contacts */}
      <footer className="bg-stone-900 text-stone-400 py-16 border-t border-stone-950 font-sans text-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="grid gap-8 lg:grid-cols-12 pb-12 border-b border-stone-850">
            
            {/* Logo description */}
            <div className="lg:col-span-4 space-y-4 text-left">
              <div className="flex items-center space-x-2 text-white">
                <span className="text-2xl"></span>
                <span className="text-xl font-bold tracking-tight font-display">FundSeed</span>
              </div>
              <p className="leading-relaxed">
                Jukwaa la kidijitali la kuandaa andishi la mradi na kuunganisha wajasiriamali na fursa za ruzuku katika sekta zote Tanzania.
              </p>
              <div className="flex items-center space-x-3 text-stone-200">
                <span>Mawasiliano: <strong>info@fundseed.co.tz</strong></span>
              </div>
            </div>

            {/* Quick links */}
            <div className="lg:col-span-2 space-y-3">
              <h4 className="font-bold text-stone-200 text-[11px] uppercase tracking-wider">Viunganishi Haraka</h4>
              <ul className="space-y-1.5">
                <li><a href="#/" className="hover:text-white transition-all">Kuhusu FundSeed</a></li>
                <li><a href="#/scholarships" className="hover:text-white transition-all font-semibold text-emerald-400">Fursa za Masomo (Scholarships)</a></li>
                <li><a href="#/grants" className="hover:text-white transition-all">Vinjari Ruzuku (Grants)</a></li>
                <li><a href="#/dashboard" className="hover:text-white transition-all">Smart-Draft AI (Dashboard)</a></li>
              </ul>
            </div>

            {/* Partners footer */}
            <div className="lg:col-span-2 space-y-3">
              <h4 className="font-bold text-stone-200 text-[11px] uppercase tracking-wider">Washirika wa Habari</h4>
              <ul className="space-y-1.5">
                <li><span>SIDO Viwanda vidogo</span></li>
                <li><span>COSTECH Sayansi</span></li>
                <li><span>TADB Benki ya Kilimo</span></li>
                <li><span>PASS Trust Guarantee</span></li>
              </ul>
            </div>
          </div>

          {/* Copyright signature block */}
          <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-stone-500 text-[10px] gap-4">
            <p className="text-center md:text-left">
              © 2026 FundSeed Tanzania Corporation. Haki zote zimehifadhiwa. Alama zote nchini na nje za mitandao ni mali ya wamiliki wao.
            </p>
            <div className="flex items-center space-x-4">
              <span className="hover:text-stone-700 transition-all cursor-default">
                Sheria na Masharti
              </span>
              <span>•</span>
              <span>Sera ya Faragha</span>
              <span>•</span>
              <span className="text-emerald-500">SSL Secures</span>
            </div>
          </div>

        </div>
      </footer>

      {/* Payment Modal for VIP Activation */}
    </div>
  );
}
