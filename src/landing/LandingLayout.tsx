import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  GraduationCap,
  Layout as LayoutIcon,
  Search,
  Menu,
  X,
  MapPin,
  Phone,
  Mail,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import SocialMenu from '@/landing/components/SocialMenu';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAcademyOpen, setIsAcademyOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [isMobileAcademyOpen, setIsMobileAcademyOpen] = useState(false);
  const [isMobileLoginOpen, setIsMobileLoginOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (globalSearch.trim()) {
      setIsSearchOpen(false);
      navigate(`/gallery?q=${encodeURIComponent(globalSearch)}`);
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-2 group">
                <div className="bg-indigo-600 p-2 rounded-xl text-white transition-transform group-hover:scale-110">
                  <GraduationCap size={24} />
                </div>
                <span className="text-xl font-bold font-sans tracking-tight text-gray-900">Pawan Academy</span>
              </Link>
            </div>

            {/* Desktop Navbar */}
            <div className="hidden md:flex items-center space-x-8">
              <div
                className="relative"
                onMouseEnter={() => setIsAcademyOpen(true)}
                onMouseLeave={() => setIsAcademyOpen(false)}
              >
                <button
                  onClick={() => setIsAcademyOpen(!isAcademyOpen)}
                  className="flex items-center gap-1 text-gray-600 hover:text-indigo-600 font-medium transition-colors py-2"
                  title="Academy Menu"
                >
                  Academy <ChevronDown size={16} className={`transition-transform ${isAcademyOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isAcademyOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full left-0 mt-0 pt-2 w-48 z-50"
                    >
                      <div className="bg-white rounded-xl shadow-xl border border-gray-100 flex flex-col overflow-hidden">
                        <Link to="/about" onClick={() => setIsAcademyOpen(false)} className="px-5 py-3 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 font-medium border-b border-gray-50 transition-colors">About Us</Link>
                        <Link to="/admissions" onClick={() => setIsAcademyOpen(false)} className="px-5 py-3 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 font-medium border-b border-gray-50 transition-colors">Admissions</Link>
                        <Link to="/facilities" onClick={() => setIsAcademyOpen(false)} className="px-5 py-3 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 font-medium border-b border-gray-50 transition-colors">Facilities</Link>
                        <Link to="/academics" onClick={() => setIsAcademyOpen(false)} className="px-5 py-3 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 font-medium transition-colors">Academics</Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link to="/gallery" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">Gallery</Link>
              <Link to="/advertisements" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">Jobs</Link>
              <Link to="/results" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">Results</Link>
              <Link to="/contact" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">Enquiry</Link>

              <div className="h-8 w-px bg-gray-200"></div>

              <button
                onClick={() => setIsSearchOpen(true)}
                className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 font-medium transition-colors"
              >
                <Search size={20} />
              </button>

              {/* Admin Login dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setIsLoginOpen(true)}
                onMouseLeave={() => setIsLoginOpen(false)}
              >
                <button
                  onClick={() => setIsLoginOpen(!isLoginOpen)}
                  className="bg-indigo-600 text-white px-6 py-2.5 rounded-full font-bold hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2 group"
                >
                  Login <ChevronDown size={18} className={`transition-transform ${isLoginOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isLoginOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className="absolute top-full right-0 mt-2 w-56 z-50 pt-2"
                    >
                      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden p-2">
                        <a
                          href="/login"
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setIsLoginOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 font-bold rounded-xl transition-all"
                        >
                          <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
                            <GraduationCap size={18} />
                          </div>
                          Admin Login
                        </a>
                        <a
                          href="/login"
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setIsLoginOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 font-bold rounded-xl transition-all"
                        >
                          <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center">
                            <LayoutIcon size={18} />
                          </div>
                          Panel Login
                        </a>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="text-gray-600 hover:text-gray-900 p-2 rounded-xl border border-gray-200 bg-white shadow-sm transition-colors"
              >
                <Search size={22} />
              </button>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-xl border border-gray-200 transition-colors flex items-center gap-2 font-bold bg-white shadow-sm"
              >
                {isOpen ? <X size={20} /> : <Menu size={20} />}
                <span>{isOpen ? 'Close' : 'Menu'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="md:hidden bg-white border-b border-gray-100 absolute w-full"
            >
              <div className="px-4 pt-2 pb-6 space-y-2">
                <div className="space-y-1">
                  <button
                    onClick={() => setIsMobileAcademyOpen(!isMobileAcademyOpen)}
                    className="w-full flex items-center justify-between px-3 py-3 text-base font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all"
                  >
                    <span>Academy</span>
                    <ChevronDown size={16} className={`transition-transform ${isMobileAcademyOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isMobileAcademyOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pl-6 space-y-1 mt-1">
                          <Link to="/about" onClick={() => setIsOpen(false)} className="block px-3 py-3 text-sm font-medium text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all">About Us</Link>
                          <Link to="/admissions" onClick={() => setIsOpen(false)} className="block px-3 py-3 text-sm font-medium text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all">Admissions</Link>
                          <Link to="/facilities" onClick={() => setIsOpen(false)} className="block px-3 py-3 text-sm font-medium text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all">Facilities</Link>
                          <Link to="/academics" onClick={() => setIsOpen(false)} className="block px-3 py-3 text-sm font-medium text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all">Academics</Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="h-px bg-gray-100 my-2"></div>
                <Link to="/gallery" onClick={() => setIsOpen(false)} className="block px-3 py-4 text-base font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all">Gallery</Link>
                <Link to="/advertisements" onClick={() => setIsOpen(false)} className="block px-3 py-4 text-base font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all">Job Updates</Link>
                <Link to="/results" onClick={() => setIsOpen(false)} className="block px-3 py-4 text-base font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all">Results</Link>
                <Link to="/contact" onClick={() => setIsOpen(false)} className="block px-3 py-4 text-base font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all">Enquiry</Link>

                <div className="pt-2">
                  <button
                    onClick={() => setIsMobileLoginOpen(!isMobileLoginOpen)}
                    className="w-full flex items-center justify-between bg-indigo-600 text-white px-5 py-4 rounded-xl font-bold shadow-md"
                  >
                    <span>Login</span>
                    <ChevronDown size={18} className={`transition-transform ${isMobileLoginOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isMobileLoginOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden mt-2 bg-gray-50 rounded-xl border border-gray-100"
                      >
                        <a
                          href="/login"
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-3 px-4 py-4 text-sm font-bold text-gray-700 border-b border-gray-100"
                        >
                          <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
                            <GraduationCap size={18} />
                          </div>
                          Admin Login
                        </a>
                        <a
                          href="/login"
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-3 px-4 py-4 text-sm font-bold text-gray-700"
                        >
                          <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center">
                            <LayoutIcon size={18} />
                          </div>
                          Panel Login
                        </a>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Global search overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-110 bg-white/95 backdrop-blur-xl flex items-center justify-center p-6"
          >
            <button
              onClick={() => setIsSearchOpen(false)}
              className="absolute top-10 right-10 text-slate-400 hover:text-slate-900 transition-colors p-2"
            >
              <X size={32} />
            </button>
            <div className="w-full max-w-3xl text-center">
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-8 uppercase">काहीतरी शोधा (Search Something)</h2>
              <form onSubmit={handleSearch} className="relative group flex items-center">
                <div className="absolute left-6 text-indigo-600 pointer-events-none">
                  <Search size={32} />
                </div>
                <input
                  autoFocus
                  type="text"
                  value={globalSearch}
                  onChange={(e) => setGlobalSearch(e.target.value)}
                  placeholder="उदा. मैदानी सराव, निकाल, यशस्वी विद्यार्थी..."
                  className="w-full pl-20 pr-32 py-8 rounded-[2.5rem] bg-white border-2 border-indigo-100 shadow-2xl shadow-indigo-100 outline-none focus:border-indigo-600 transition-all text-xl font-bold placeholder:text-slate-300"
                />
                <button
                  type="submit"
                  className="absolute right-4 bg-indigo-600 text-white px-6 py-4 rounded-[1.8rem] font-black uppercase text-sm hover:bg-indigo-700 transition-all shadow-lg"
                >
                  Search
                </button>
              </form>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                {['निकाल', 'मैदानी सराव', 'क्लासरूम', 'यशस्वी विद्यार्थी'].map(tag => (
                  <button
                    key={tag}
                    onClick={() => setGlobalSearch(tag)}
                    className="px-6 py-2 rounded-full bg-slate-100 text-slate-600 font-bold text-sm hover:bg-indigo-600 hover:text-white transition-all"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const Footer = () => {
  const [content, setContent] = useState(() => {
    try {
      const saved = localStorage.getItem('pawan_content');
      const data = saved ? JSON.parse(saved) : null;
      return data?.contact || {
        address: "नवीन पोलीस स्टेशनच्या समोर,\nपाचोड रोड, अंबड - ४३१२०४",
        phones: "+91 88059 95353",
        email: "pawanacademyambad@gmail.com",
        mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15024.184323871634!2d75.8459463!3d19.2814896!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bd963ae37d95fd9%3A0x67393439f0464f16!2sPawan%20Career%20Academy%20Ambad!5e0!3m2!1sen!2sin!4v1714392000000!5m2!1sen!2sin",
      };
    } catch {
      return {
        address: "नवीन पोलीस स्टेशनच्या समोर,\nपाचोड रोड, अंबड - ४३१२०४",
        phones: "+91 88059 95353",
        email: "pawanacademyambad@gmail.com",
        mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15024.184323871634!2d75.8459463!3d19.2814896!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bd963ae37d95fd9%3A0x67393439f0464f16!2sPawan%20Career%20Academy%20Ambad!5e0!3m2!1sen!2sin!4v1714392000000!5m2!1sen!2sin",
      };
    }
  });

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'pawan_content' && e.newValue) {
        try {
          const data = JSON.parse(e.newValue);
          if (data?.contact) setContent(data.contact);
        } catch { /* ignore */ }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <footer className="bg-white text-gray-600 pt-16 pb-8 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12">

        {/* Column 1 – Contact */}
        <div>
          <h4 className="text-gray-900 text-xl font-extrabold mb-6 flex items-center tracking-tight">
            <GraduationCap className="w-8 h-8 mr-2 text-orange-500" /> पवन अकॅडमी (Pawan Academy)
          </h4>
          <p className="text-sm mb-6 leading-relaxed text-gray-500 font-medium">
            गुणवत्तापूर्ण मार्गदर्शन, आधुनिक तंत्रज्ञान आणि शिस्तबद्ध वातावरण यांच्या जोरावर विद्यार्थ्यांच्या स्वप्नांना ताकद देणारी महाराष्ट्रातील अग्रगण्य संस्था.
          </p>
          <div className="space-y-4 text-sm font-medium">
            <p className="flex items-start">
              <MapPin className="w-5 h-5 mr-3 text-orange-500 shrink-0 mt-0.5" />
              <span className="text-gray-700 whitespace-pre-wrap">{content.address}</span>
            </p>
            <div className="space-y-1">
              {content.phones?.split(',').map((p: string, i: number) => (
                <p key={i} className="flex items-center">
                  <Phone className="w-5 h-5 mr-3 text-orange-500 shrink-0" />
                  <span className="text-gray-700">{p.trim()}</span>
                </p>
              )) || (
                <p className="flex items-center">
                  <Phone className="w-5 h-5 mr-3 text-orange-500 shrink-0" />
                  <span className="text-gray-700">{content.phone || '+91 88059 95353'}</span>
                </p>
              )}
            </div>
            <p className="flex items-center">
              <Mail className="w-5 h-5 mr-3 text-orange-500 shrink-0" />
              <span className="text-gray-700">{content.email}</span>
            </p>
          </div>
        </div>

        {/* Column 2 – Links */}
        <div>
          <h4 className="text-gray-900 text-lg font-bold mb-6 border-b-2 border-orange-500 pb-2 inline-block">Explore</h4>
          <ul className="space-y-3 text-sm font-bold">
            <li><Link to="/about" className="text-gray-600 hover:text-orange-500 transition-colors flex items-center"><ChevronRight className="w-4 h-4 mr-1 text-orange-400" /> आमच्याबद्दल (About Us)</Link></li>
            <li><Link to="/admissions" className="text-gray-600 hover:text-orange-500 transition-colors flex items-center"><ChevronRight className="w-4 h-4 mr-1 text-orange-400" /> प्रवेश प्रक्रिया (Admissions)</Link></li>
            <li><Link to="/facilities" className="text-gray-600 hover:text-orange-500 transition-colors flex items-center"><ChevronRight className="w-4 h-4 mr-1 text-orange-400" /> सोयी-सुविधा (Facilities)</Link></li>
            <li><Link to="/gallery" className="text-gray-600 hover:text-orange-500 transition-colors flex items-center"><ChevronRight className="w-4 h-4 mr-1 text-orange-400" /> गॅलरी (Gallery)</Link></li>
            <li><Link to="/advertisements" className="text-gray-600 hover:text-orange-500 transition-colors flex items-center"><ChevronRight className="w-4 h-4 mr-1 text-orange-400" /> नवीन जाहिराती (Job Updates)</Link></li>
            <li><Link to="/results" className="text-gray-600 hover:text-orange-500 transition-colors flex items-center"><ChevronRight className="w-4 h-4 mr-1 text-orange-400" /> निकाल (Results)</Link></li>
            <li><Link to="/academics" className="text-gray-600 hover:text-orange-500 transition-colors flex items-center"><ChevronRight className="w-4 h-4 mr-1 text-orange-400" /> शैक्षणिक उपक्रम (Academics)</Link></li>
            <li><Link to="/contact" className="text-gray-600 hover:text-orange-500 transition-colors flex items-center"><ChevronRight className="w-4 h-4 mr-1 text-orange-400" /> संपर्क साधा (Contact)</Link></li>
          </ul>
        </div>

        {/* Column 3 – Map */}
        <div>
          <h4 className="text-gray-900 text-lg font-bold mb-6 border-b-2 border-orange-500 pb-2 inline-block">Location Map</h4>
          <div className="w-full h-64 bg-gray-50 rounded-2xl overflow-hidden border border-gray-200 mb-8 shadow-inner">
            {content.mapUrl ? (
              <iframe
                title="Pawan Academy Location"
                src={content.mapUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-300 font-bold uppercase tracking-widest text-xs p-10 text-center">
                Map not configured
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-gray-100 text-center">
        <p className="text-xs text-gray-400 font-medium">
          &copy; 2026 Pawan Career Academy, Ambad. All Rights Reserved. | Designed with ❤️ for Excellence
        </p>
      </div>
    </footer>
  );
};

export default function LandingLayout() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-indigo-100 selection:text-indigo-700">
      <ScrollToTop />
      <Navbar />
      <main className="pt-16">
        <AnimatePresence mode="wait">
          <Outlet />
        </AnimatePresence>
      </main>
      <SocialMenu />
      <Footer />
    </div>
  );
}
