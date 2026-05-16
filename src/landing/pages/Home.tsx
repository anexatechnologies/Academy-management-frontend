import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ChevronRight, 
  Bell, 
  Calendar, 
  Users, 
  BookOpen, 
  Trophy, 
  GraduationCap, 
  BookMarked,
  Monitor,
  Fingerprint,
  Target,
  ArrowUpRight,
  ShieldCheck,
  Star,
  Quote,
  Youtube,
  Instagram,
  Send,
  MessageSquare,
  Smartphone,
  Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function Home() {
  const navigate = useNavigate();
  const [activeNotices, setActiveNotices] = React.useState<any[]>(() => {
    const saved = localStorage.getItem('pawan_notices');
    if (saved) return JSON.parse(saved);
    return [
      { id: 1, text: 'नवीन निकाल पहा', link: '/results', date: '१० मे' },
      { id: 2, text: 'आठवडी निकाल पहा', link: '/results', date: '०८ मे' },
      { id: 3, text: 'नवीन जाहिराती पहा', link: '/advertisements', date: '०५ मे' },
      { id: 4, text: 'प्रवेश प्रकिया विषयी माहिती', link: '/contact', date: '०१ मे' }
    ];
  });

  const [stats, setStats] = React.useState(() => {
    try {
      const saved = localStorage.getItem('pawan_stats');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return { students: '1203+', selections: '503+', activeCourses: '5' };
  });
  
  React.useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'pawan_content' && e.newValue) {
        try {
          const data = JSON.parse(e.newValue);
          const home = data?.home || {};
          setContent({
            badge: home.badge || "महाराष्ट्रमध्ये सर्वोत्तम निकाल",
            title: home.title || "तुमच्या खाकी वर्दीचं स्वप्न आता सत्यात!",
            subtitle: home.subtitle || '"मित्रांनो कानापेक्षा डोळ्यावर विश्वास ठेवणारा माणुस कधीही धोका खात नाही कारण ते वास्तव असते." — जगताप सर',
            news: data?.news || "पोलीस भरती २०२६ नवीन बॅचेस सुरू! • म्हाडा भरती निकालात पवन अकॅडमीचे १५ विद्यार्थी यशस्वी! • संपर्क: ७६२०४८५५०७",
            btn1: home.btn1 || "प्रवेश घ्या",
            btn2: home.btn2 || "कोर्सेस पहा",
            introTitle: home.introTitle || "पवन अकॅडमीमध्ये स्वागत",
            introText: home.introText || "महाराष्ट्र अग्रगण्य आणि रिझल्ट देणारी करिअर संस्था. स्पर्धा परीक्षांच्या प्रवासात आम्ही आपली भक्कम साथ आहोत.",
            featuresTitle: home.featuresTitle || "पवन अकॅडमी का निवडावी?",
            featuresSubtitle: home.featuresSubtitle || "स्पर्धा परीक्षेच्या युगात योग्य मार्गदर्शन हीच यशाची पहिली पायरी आहे.",
            features: home.features || [],
            quote: home.quote || "",
            statsTitle: home.statsTitle || "",
            statsSubtitle: home.statsSubtitle || "",
            bannerImage: home.bannerImage || "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgS_VGQa0JKuZ8i_rd6BfVFyYJbcEnaKDzLj_3_dOZeouW7oPOQD-nRxCpCB3NAmOulTkNdo83idALv8Rl8Z4wTSmhTg2R6L5mQKbyO1gwAntVHn3_DpiKicJxUvafMyQs65KBYM0KrM5E2HIEq0DO2DnHtoUjQ4cEILI3XWt3IKE3lWY5qTzbDtZ64Xltq/s1280/6332519989499774549.jpg"
          });
        } catch (err) {}
      }
      if (e.key === 'pawan_faqs' && e.newValue) {
        try {
          setFaqs(JSON.parse(e.newValue));
        } catch (err) {}
      }
      if (e.key === 'pawan_testimonials' && e.newValue) {
        try {
          setTestimonials(JSON.parse(e.newValue));
        } catch (err) {}
      }
      if (e.key === 'pawan_notices' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setActiveNotices(parsed);
        } catch (err) {
          console.error('Error syncing notices across tabs:', err);
        }
      }
      if (e.key === 'pawan_stats' && e.newValue) {
        try {
          setStats(JSON.parse(e.newValue));
        } catch (err) {
          console.error('Error syncing stats across tabs:', err);
        }
      }
      if (e.key === 'pawan_banners' && e.newValue) {
        try {
          setBanners(JSON.parse(e.newValue));
          setCurrentBannerIndex(0);
        } catch (err) {}
      }
      if (e.key === 'pawan_success_photos' && e.newValue) {
        try {
          setSuccessPhotos(JSON.parse(e.newValue));
        } catch (err) {}
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const [content, setContent] = React.useState(() => {
    const saved = localStorage.getItem('pawan_content');
    const data = saved ? JSON.parse(saved) : null;
    return {
      badge: data?.home?.badge || "महाराष्ट्रमध्ये सर्वोत्तम निकाल",
      title: data?.home?.title || "तुमच्या खाकी वर्दीचं स्वप्न आता सत्यात!",
      subtitle: data?.home?.subtitle || '"मित्रांनो कानापेक्षा डोळ्यावर विश्वास ठेवणारा माणुस कधीही धोका खात नाही कारण ते वास्तव असते." — जगताप सर',
      news: data?.news || "पोलीस भरती २०२६ नवीन बॅचेस सुरू! • म्हाडा भरती निकालात पवन अकॅडमीचे १५ विद्यार्थी यशस्वी! • संपर्क: ७६२०४८५५०७",
      btn1: data?.home?.btn1 || "प्रवेश घ्या",
      btn2: data?.home?.btn2 || "कोर्सेस पहा",
      introTitle: data?.home?.introTitle || "पवन अकॅडमीमध्ये स्वागत",
      introText: data?.home?.introText || "महाराष्ट्र अग्रगण्य आणि रिझल्ट देणारी करिअर संस्था. स्पर्धा परीक्षांच्या प्रवासात आम्ही आपली भक्कम साथ आहोत.",
      featuresTitle: data?.home?.featuresTitle || "पवन अकॅडमी का निवडावी?",
      featuresSubtitle: data?.home?.featuresSubtitle || "स्पर्धा परीक्षेच्या युगात योग्य मार्गदर्शन हीच यशाची पहिली पायरी आहे.",
      features: data?.home?.features || [
        { title: 'तज्ज्ञ मार्गदर्शक', desc: 'प्रत्येक विषयासाठी अनुभवी शिक्षक आणि सोपी भाषा.' },
        { title: 'दर्जेदार साहित्य', desc: "अद्ययावत नोट्स आणि आमचे प्रसिद्ध 'Fast Revision' बुक." },
        { title: 'डिजिटल लर्निंग', desc: 'मोबाईल ॲप आणि ऑनलाईन टेस्ट सिरीजची सुविधा.' },
        { title: 'बायोमेट्रिक शिस्त', desc: 'हजेरी प्रणालीद्वारे सातत्य आणि शिस्तीवर विशेष लक्ष.' }
      ],
      quote: data?.home?.quote || '"तुमचे स्वप्न, आमचे प्रयत्न! आजच पवन अकॅडमीमध्ये प्रवेश घ्या आणि आपल्या उज्वल भविष्याची सुरुवात करा."',
      statsTitle: data?.home?.statsTitle || "आकडेमोड नव्हे, हा विश्वासाचा निकाल आहे!",
      statsSubtitle: data?.home?.statsSubtitle || "साधारणपणे दर १५ दिवसांनी किंवा मोठ्या भरती जाहीर झाल्यावर नवीन बॅचेस सुरू होतात.",
      bannerImage: data?.home?.bannerImage || "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgS_VGQa0JKuZ8i_rd6BfVFyYJbcEnaKDzLj_3_dOZeouW7oPOQD-nRxCpCB3NAmOulTkNdo83idALv8Rl8Z4wTSmhTg2R6L5mQKbyO1gwAntVHn3_DpiKicJxUvafMyQs65KBYM0KrM5E2HIEq0DO2DnHtoUjQ4cEILI3XWt3IKE3lWY5qTzbDtZ64Xltq/s1280/6332519989499774549.jpg"
    };
  });

  const [faqs, setFaqs] = React.useState<Array<{ q: string; a: string }>>(() => {
    const saved = localStorage.getItem('pawan_faqs');
    return saved ? JSON.parse(saved) : [
      { q: "नवीन बॅचेस कधी सुरू होतात?", a: "साधारणपणे दर १५ दिवसांनी किंवा मोठ्या भरती जाहीर झाल्यावर नवीन बॅचेस सुरू होतात. सध्याच्या बॅचेसची माहिती घेण्यासाठी संपर्कावर कॉल करा." },
      { q: "लाईव्ह क्लासेसची सोय आहे का?", a: "हो, आमच्या 'Pawan Academy' मोबाईल ॲपवर लाईव्ह लेक्चर्स आणि रेकॉर्डेड लेक्चर्सची सोय उपलब्ध आहे." },
      { q: "फी हप्त्यांमध्ये (Installments) भरता येते का?", a: "हो, विद्यार्थ्यांच्या सोयीनुसार आम्ही दोन ते तीन हप्त्यांमध्ये फी भरण्याची सवलत देतो." },
      { q: "फिजिकल ट्रेनिंगसाठी वेगळी फी आहे का?", a: "पोलीस भरती बॅचमधील विद्यार्थ्यांसाठी लेखी आणि मैदानी ही एकाच पॅकेजचा भाग आहे." }
    ];
  });

  const [testimonials, setTestimonials] = React.useState(() => {
    const saved = localStorage.getItem('pawan_testimonials');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: "Rahul Jadhav", post: "पोलीस शिपाई", message: "पोलीस भरतीसाठी पवन अकॅडमी ही सर्वोत्तम आहे. जगताप सरांचे मार्गदर्शन लाखमोलाचे ठरते.", photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400" },
      { id: 2, name: "Sneha Patil", post: "तलाठी", message: "लेखी आणि मैदानी अशा दोन्ही तयारीसाठी इथली शिस्त खूप महत्त्वाची आहे.", photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400" }
    ];
  });

  const [banners, setBanners] = React.useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('pawan_banners');
      return saved ? JSON.parse(saved) : [
        { id: 1, url: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=1600', title: 'पोलीस भरती बॅच २०२४' },
        { id: 2, url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600', title: 'मैदानी सराव' }
      ];
    } catch (e) {
      return [];
    }
  });

  const [successPhotos, setSuccessPhotos] = React.useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('pawan_success_photos');
      return saved ? JSON.parse(saved) : [
        { id: 1, url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800', title: 'राहुल - पोलीस भरती २०२४' },
        { id: 2, url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800', title: 'स्नेहा - तलाठी २०२३' }
      ];
    } catch (e) { return []; }
  });

  // Sync with localStorage on focus to ensure admin updates are seen
  React.useEffect(() => {
    const syncPhotos = () => {
      try {
        const saved = localStorage.getItem('pawan_success_photos');
        if (saved) {
          const parsed = JSON.parse(saved);
          setSuccessPhotos(parsed);
        }
      } catch (e) {}
    };

    window.addEventListener('focus', syncPhotos);
    return () => window.removeEventListener('focus', syncPhotos);
  }, []);

  const [currentBannerIndex, setCurrentBannerIndex] = React.useState(0);

  React.useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  return (
    <div className="bg-[#f8fafc] min-h-screen">
      {/* Dynamic News Ticker */}
      <div className="bg-blue-50 overflow-hidden py-3 border-b border-blue-100">
        <div className="flex items-center whitespace-nowrap">
          <div className="bg-orange-500 text-white text-[10px] font-extrabold px-4 py-1.5 ml-4 rounded-full z-10 shadow-md flex items-center shrink-0">
            <Bell className="w-3.5 h-3.5 mr-1.5" /> नवीन अपडेट
          </div>
          {React.createElement('marquee', { className: 'text-blue-900 text-xs font-bold ml-4 w-full', scrollamount: '4' }, content.news)}
        </div>
      </div>

      {/* Hero Section - Dynamic Banner Slider */}
      <div className="relative bg-white text-gray-900 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-8 lg:py-12">
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            {/* Text Content */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-5"
            >
              <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-100 px-4 py-2 rounded-full mb-6">
                <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-pulse"></span>
                <span className="text-xs font-extrabold tracking-widest uppercase text-blue-800">{content.badge}</span>
              </div>
              
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black leading-[1.2] mb-6 tracking-tight text-gray-900 uppercase">
                {content.title}
              </h1>
              
              <p className="text-sm sm:text-base text-gray-600 mb-8 max-w-lg leading-relaxed font-medium italic">
                {content.subtitle}
              </p>

              {/* Home Hero Search */}
              <div className="mb-8 max-w-md">
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    // @ts-ignore
                    const q = e.target.search.value;
                    if (q.trim()) navigate(`/gallery?q=${encodeURIComponent(q)}`);
                  }}
                  className="relative group"
                >
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={20} />
                  <input 
                    name="search"
                    type="text" 
                    placeholder="भरती अपडेट्स, निकाल शोधा..."
                    className="w-full pl-14 pr-32 py-4 bg-white border-2 border-slate-100 rounded-2xl font-bold outline-none focus:border-orange-500 shadow-xl shadow-slate-100 transition-all"
                  />
                  <button 
                    type="submit"
                    className="absolute right-2 top-2 bottom-2 bg-slate-900 text-white px-6 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all"
                  >
                    शोधा
                  </button>
                </form>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link to="/contact">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-2xl font-black text-lg shadow-xl shadow-orange-500/30 transition-all flex items-center justify-center group border border-orange-600"
                  >
                    {content.btn1} <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                </Link>
                <Link to="/academics" className="w-full sm:w-auto">
                  <button className="w-full bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 px-8 py-4 rounded-2xl font-black text-lg transition-all flex items-center justify-center">
                    {content.btn2}
                  </button>
                </Link>
              </div>

              <div className="flex items-center space-x-6 text-gray-500 font-bold">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-gray-200">
                      <img src={`https://ui-avatars.com/api/?name=S${i}&background=random`} alt="user" />
                    </div>
                  ))}
                </div>
                <p className="text-sm">५०००+ विद्यार्थ्यांचा यशस्वी प्रवास</p>
              </div>
            </motion.div>

            {/* Banner Slider */}
            <div className="lg:col-span-7 relative">
               <div className="relative aspect-[16/9] w-full bg-slate-100 rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white group">
                  <AnimatePresence mode="wait">
                    {banners.length > 0 ? (
                      <motion.img
                        key={banners[currentBannerIndex]?.id || 'default'}
                        src={banners[currentBannerIndex]?.url}
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="absolute inset-0 w-full h-full object-cover"
                        alt={banners[currentBannerIndex]?.title}
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                       <img 
                         src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop"
                         className="absolute inset-0 w-full h-full object-cover"
                         alt="Default"
                       />
                    )}
                  </AnimatePresence>
                  
                  {/* Slider Controls Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-8">
                     <div className="flex items-center gap-2 mb-2">
                        {banners.map((_, idx) => (
                           <button 
                             key={idx}
                             onClick={() => setCurrentBannerIndex(idx)}
                             className={`h-1.5 rounded-full transition-all ${idx === currentBannerIndex ? 'w-8 bg-orange-500' : 'w-2 bg-white/50 hover:bg-white'}`}
                           />
                        ))}
                     </div>
                  </div>

                  {/* Floating Selection Stats */}
                  <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-3xl shadow-2xl z-20 text-slate-900 border border-slate-100 hidden sm:block">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Success Rate</p>
                    <h4 className="text-4xl font-bold">{stats.selections}</h4>
                    <p className="text-sm font-medium text-slate-600">Total Selections</p>
                    <div className="flex mt-2 text-orange-500">
                      {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-3 h-3 fill-orange-500" />)}
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout - Bento Style */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Main Feed (Bento) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Intro Grid */}
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              <motion.div 
                variants={itemVariants}
                className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col justify-between group hover:shadow-xl transition-all h-full"
              >
                <div>
                  <div className="bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <GraduationCap className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">{content.introTitle}</h3>
                  <p className="text-slate-600 leading-relaxed">
                    {content.introText}
                  </p>
                </div>
                <Link to="/contact" className="mt-8 flex items-center text-blue-600 font-bold group-hover:underline">
                  आमच्याबद्दल अधिक <ArrowUpRight className="ml-1 w-4 h-4" />
                </Link>
              </motion.div>

              <div className="grid grid-cols-1 gap-8">
                <Link to="/contact">
                  <motion.div 
                    variants={itemVariants}
                    whileHover={{ scale: 1.02 }}
                    className="bg-blue-50 p-8 rounded-[2.5rem] text-blue-900 shadow-lg shadow-blue-100 flex flex-col justify-between group h-full cursor-pointer border border-blue-100"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-black flex items-center">
                        <Trophy className="w-6 h-6 mr-2 text-yellow-500" /> साप्ताहिक टेस्ट निकाल
                      </h3>
                      <ArrowUpRight className="w-5 h-5 text-blue-300 group-hover:text-blue-600 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                    </div>
                    <p className="text-blue-700 text-sm font-bold">
                      प्रत्येक परीक्षेचे सविस्तर निकाल आणि गुणवत्ता यादी पाहण्यासाठी येथे क्लिक करा.
                    </p>
                    <div className="mt-6 flex justify-end">
                      <span className="text-3xl font-black opacity-10">#RESULTS</span>
                    </div>
                  </motion.div>
                </Link>
                <motion.div 
                  variants={itemVariants}
                  className="bg-white p-8 rounded-[2.5rem] border border-slate-100 flex items-center shadow-sm"
                >
                  <div className="bg-yellow-50 p-4 rounded-2xl mr-6">
                    <Trophy className="w-8 h-8 text-yellow-500" />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 uppercase">विजेत्यांची निवड</h4>
                    <p className="text-sm font-bold text-slate-500">महाराष्ट्र अग्रगण्य करिअर संस्था</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Features Section (Why Choose Us) */}
            <motion.section 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-blue-50 p-10 md:p-16 rounded-[3rem] text-blue-900 mt-12 relative overflow-hidden shadow-sm border border-blue-100"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-200/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
              <div className="relative z-10">
                <div className="max-w-2xl">
                  <h3 className="text-2xl md:text-4xl font-black mb-6 tracking-tight uppercase">{content.featuresTitle}</h3>
                  <p className="text-blue-700 text-base md:text-lg mb-12 font-bold italic">
                    {content.featuresSubtitle}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {content.features.map((feat: any, i: number) => {
                    const icons = [
                      <Users className="text-blue-600" />,
                      <BookMarked className="text-orange-600" />,
                      <Monitor className="text-emerald-600" />,
                      <Fingerprint className="text-purple-600" />
                    ];
                    return (
                      <div key={i} className="flex space-x-6 p-6 rounded-3xl bg-white border border-blue-100 hover:shadow-lg transition-all cursor-default group">
                        <div className="flex-shrink-0 w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          {icons[i] || <Users className="text-blue-600" />}
                        </div>
                        <div>
                          <h4 className="font-black text-lg mb-2 text-gray-900">{feat.title}</h4>
                          <p className="text-gray-600 text-sm leading-relaxed font-medium">{feat.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="mt-16 pt-10 border-t border-blue-200 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center bg-orange-50 px-6 py-4 rounded-3xl border border-orange-200 max-w-xl shadow-sm">
                    <Quote className="w-8 h-8 text-orange-500 mr-4 flex-shrink-0 rotate-180" />
                    <p className="text-orange-600 font-black italic text-sm">
                      {content.quote}
                    </p>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Banner Section */}
            <div className="bg-white p-4 rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden transform hover:-rotate-1 transition-transform">
              <img 
                src={content.bannerImage} 
                alt="Banner" 
                className="w-full h-auto rounded-[1.5rem]"
              />
            </div>

          </div>

          {/* Right Sidebar */}
          <aside className="lg:col-span-4 space-y-8">
            
            {/* Notice Board */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col h-[500px]">
              <div className="bg-blue-50 text-blue-900 p-8 flex items-center justify-between border-b border-blue-100">
                <h3 className="font-black flex items-center text-xl tracking-tight uppercase">
                   नोटीस बोर्ड <Bell className="w-5 h-5 ml-4 text-orange-500 animate-pulse" />
                </h3>
                <span className="text-blue-300 text-sm font-bold">पहा</span>
              </div>
              
              <div className="flex-1 overflow-hidden relative bg-slate-50/50 text-slate-400">
                <div className="absolute w-full animate-marquee-up flex flex-col">
                  {activeNotices.map((notice, i) => {
                    const isExternal = notice.link?.startsWith('http');
                    const Content = (
                      <>
                        <div className="bg-orange-50 text-orange-600 text-[10px] font-bold px-2 py-1 rounded-full mr-4 border border-orange-100 shrink-0">
                          {notice.date}
                        </div>
                        <p className="text-sm text-slate-700 font-bold leading-relaxed group-hover:text-blue-600">
                          {notice.text}
                        </p>
                      </>
                    );

                    if (notice.link) {
                      if (isExternal) {
                        return (
                          <a 
                            key={i} 
                            href={notice.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-6 border-b border-slate-100 flex items-start group cursor-pointer transition-colors bg-white hover:bg-slate-50"
                          >
                            {Content}
                          </a>
                        );
                      }
                      return (
                        <Link 
                          key={i} 
                          to={notice.link}
                          className="p-6 border-b border-slate-100 flex items-start group cursor-pointer transition-colors bg-white hover:bg-slate-50"
                        >
                          {Content}
                        </Link>
                      );
                    }

                    return (
                      <div key={i} className="p-6 border-b border-slate-100 flex items-start group bg-white">
                        {Content}
                      </div>
                    );
                  })}
                  
                  {/* Duplicate for marquee effect */}
                  {activeNotices.map((notice, i) => {
                    const isExternal = notice.link?.startsWith('http');
                    const Content = (
                      <>
                        <div className="bg-orange-50 text-orange-600 text-[10px] font-bold px-2 py-1 rounded-full mr-4 shrink-0">
                          {notice.date}
                        </div>
                        <p className="text-sm text-slate-700 font-bold leading-relaxed">
                          {notice.text}
                        </p>
                      </>
                    );

                    if (notice.link) {
                      if (isExternal) {
                        return (
                          <a 
                            key={`dup-${i}`} 
                            href={notice.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-6 border-b border-slate-100 flex items-start group cursor-pointer transition-colors bg-white hover:bg-slate-50"
                          >
                            {Content}
                          </a>
                        );
                      }
                      return (
                        <Link 
                          key={`dup-${i}`} 
                          to={notice.link}
                          className="p-6 border-b border-slate-100 flex items-start group cursor-pointer transition-colors bg-white hover:bg-slate-50"
                        >
                          {Content}
                        </Link>
                      );
                    }

                    return (
                      <div key={`dup-${i}`} className="p-6 border-b border-slate-100 flex items-start group bg-white">
                        {Content}
                      </div>
                    );
                  })}
                  {activeNotices.length === 0 && (
                    <div className="p-10 text-center italic text-slate-400">सध्या कोणतीही सूचना नाही.</div>
                  )}
                </div>
              </div>
            </div>

            {/* Events Card */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
              <h3 className="text-xl font-bold text-slate-900 mb-8 flex items-center">
                <Calendar className="w-5 h-5 mr-3 text-blue-600" /> आगामी उपक्रम
              </h3>
              <div className="space-y-6">
                {[
                  { month: 'MAY', day: '10', title: 'पोलीस भरती नवीन बॅच', time: '१०:०० AM' },
                  { month: 'MAY', day: '15', title: 'MPSC टेस्ट सिरीज', time: '११:३० AM' },
                ].map((ev, i) => (
                  <div key={i} className="flex items-center group cursor-pointer">
                    <div className="bg-slate-50 text-slate-400 rounded-2xl p-3 text-center min-w-[60px] group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <p className="text-[10px] font-bold">{ev.month}</p>
                      <p className="text-lg font-black">{ev.day}</p>
                    </div>
                    <div className="ml-4">
                      <h4 className="font-bold text-slate-800 text-sm leading-tight group-hover:text-blue-600 transition-colors">{ev.title}</h4>
                      <p className="text-[10px] text-slate-400 mt-1">{ev.time} • ऑफलाईन बॅच</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link to="/contact">
                <button className="w-full mt-8 py-4 rounded-2xl bg-slate-50 text-slate-600 font-bold text-sm hover:bg-slate-100 transition-colors">
                  सर्व उपक्रम पहा
                </button>
              </Link>
            </div>

            {/* Quick Contact Card */}
            <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white overflow-hidden relative shadow-xl shadow-indigo-600/20">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
               <h4 className="text-lg font-bold mb-4 relative z-10">काही शंका आहे?</h4>
               <p className="text-indigo-100 text-sm mb-6 relative z-10 leading-relaxed uppercase tracking-widest font-medium">
                 आमच्याशी थेट संपर्क साधा आणि करिअर घडा!
               </p>
               <Link to="/contact" className="block">
                <button className="w-full bg-white text-indigo-600 py-3 rounded-2xl font-bold shadow-lg">
                  संपर्क साधा
                </button>
               </Link>
            </div>

          </aside>
        </div>
      </div>

      {/* Success Rate Section - Infinite Moving Photos */}
      <div className="bg-slate-900 py-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 mb-10 text-center">
           <h3 className="text-white text-2xl md:text-4xl font-black uppercase tracking-tighter mb-2">अभिनंदन! पवन अकॅडमीचे हिरे</h3>
           <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">येथे आमचा रिझल्ट बोलतो!</p>
        </div>
        
        <div className="relative flex overflow-x-hidden border-y border-white/5">
           <div className="animate-marquee flex whitespace-nowrap py-8">
              {/* Multiplying items to ensure smooth infinite loop regardless of count */}
              {[...successPhotos, ...successPhotos, ...successPhotos, ...successPhotos, ...successPhotos, ...successPhotos, ...successPhotos, ...successPhotos].map((photo, i) => (
                <div key={`${photo.id}-${i}`} className="mx-4 w-40 h-48 md:w-56 md:h-72 flex-shrink-0 bg-white rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10 group relative transform hover:-translate-y-2 transition-all duration-500">
                  <img 
                    src={photo.url} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    alt={photo.title} 
                    onError={(e) => (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x500?text=Result'}
                  />
                  <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                     <p className="text-[10px] md:text-xs font-black text-white uppercase leading-tight mb-1">{photo.title}</p>
                     <div className="flex">
                        {[1, 2, 3, 4, 5].map(s => <Star key={s} size={8} className="fill-yellow-500 text-yellow-500" />) }
                     </div>
                  </div>
                  <div className="absolute top-4 right-4 bg-orange-600 text-white text-[8px] font-black px-2 py-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest">
                     Selected
                  </div>
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* consolidated Achievements & Stats Section */}
      <div className="bg-white py-24 relative overflow-hidden border-y border-slate-100">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px]"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-xs font-black text-blue-600 uppercase tracking-[0.3em] mb-4">Our Track Record</h2>
            <h3 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">{content.statsTitle}</h3>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
            {[
              { label: 'विद्यार्थी (Students)', value: stats.students, icon: <Users className="w-6 h-6 text-blue-600" />, color: 'blue' },
              { label: 'निवड झालेले विद्यार्थी', value: stats.selections, icon: <Trophy className="w-6 h-6 text-orange-500" />, color: 'orange' },
              { label: 'तज्ज्ञ व अनुभवी शिक्षक', value: '10+', icon: <GraduationCap className="w-6 h-6 text-emerald-600" />, color: 'emerald' },
              { label: 'शिस्त व 100% यश', value: '100%', icon: <ShieldCheck className="w-6 h-6 text-indigo-600" />, color: 'indigo' },
              { label: 'विविध कोर्सेस', value: stats.activeCourses + '+', icon: <BookOpen className="w-6 h-6 text-pink-600" />, color: 'pink' },
              { label: 'समाधानी पालक', value: '1000+', icon: <Star className="w-6 h-6 text-yellow-500" />, color: 'yellow' },
              { label: 'साप्ताहिक टेस्ट सिरीज', value: '50+', icon: <Target className="w-6 h-6 text-red-600" />, color: 'red' },
              { label: 'डिजीटल क्लासरूम', value: 'Yes', icon: <Monitor className="w-6 h-6 text-slate-600" />, color: 'slate' }
            ].map((stat, i) => (
              <motion.div 
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 flex flex-col items-center text-center group hover:bg-white hover:shadow-2xl hover:shadow-slate-200/50 transition-all cursor-default"
              >
                <div className={`mb-6 p-4 rounded-2xl bg-white shadow-sm group-hover:scale-110 transition-transform`}>
                  {stat.icon}
                </div>
                <div className="text-3xl md:text-4xl font-black text-slate-900 mb-2 tracking-tighter">{stat.value}</div>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest leading-tight px-4">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Success Stories Section - Rotating Carousel */}
      <div className="bg-white py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 mb-16 text-center">
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">यशस्वी विद्यार्थ्यांचे मनोगत</h2>
          <p className="text-slate-500 max-w-2xl mx-auto">पवन अकॅडमीच्या मार्गदर्शनाखाली यश संपादन केलेल्या विद्यार्थ्यांचे अनुभव.</p>
        </div>
        
        <div className="relative flex overflow-x-hidden group">
          {testimonials.length > 0 ? (
            <div className="animate-marquee-slow flex py-12 whitespace-nowrap">
              {[...testimonials, ...testimonials, ...testimonials].map((testi, i) => (
                <div
                  key={`${testi.id}-${i}`}
                  className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 relative mx-4 w-[350px] sm:w-[450px] inline-block whitespace-normal group-hover:bg-white group-hover:shadow-xl transition-all"
                >
                  <Quote className="absolute top-6 right-6 w-10 h-10 text-slate-200 group-hover:text-orange-200 transition-colors" />
                  <div className="flex items-center mb-6">
                    <div className="w-14 h-14 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4 shadow-lg shadow-orange-500/20 overflow-hidden shrink-0">
                      {testi.photo ? (
                        <img src={testi.photo} alt={testi.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        testi.name.charAt(0)
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 uppercase leading-none mb-1">{testi.name}</h4>
                      <p className="text-orange-600 text-[10px] font-black uppercase tracking-widest">{testi.post}</p>
                    </div>
                  </div>
                  <p className="text-slate-600 italic leading-relaxed text-sm">"{testi.message}"</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="w-full text-center py-20 text-slate-400 italic font-bold uppercase tracking-widest text-xs">
              अद्याप कोणतेही मनोगत उपलब्ध नाही.
            </div>
          )}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white py-24 border-t border-slate-100">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">काही शंका? (FAQs)</h2>
            <p className="text-slate-500">विद्यार्थी आणि पालकांच्या मनात येणाऱ्या काही सामान्य प्रश्नांची उत्तरे.</p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                <h4 className="font-bold text-slate-900 mb-3 flex items-start">
                  <span className="text-orange-500 mr-2">Q.</span> {faq.q}
                </h4>
                <p className="text-slate-600 text-sm leading-relaxed ml-6">
                  <span className="font-bold text-blue-600 mr-2">Ans:</span> {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Social Media Section */}
      <div className="bg-slate-50 py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">आमच्याशी जोडून घ्या</h2>
            <p className="text-slate-500 mb-12 max-w-2xl mx-auto">नवीन अपडेट्स, मोफत अभ्यास साहित्य आणि चालू घडामोडींसाठी आमच्या सोशल मीडिया हॅन्डल्सला आजच फॉलो करा.</p>
            
            <div className="flex flex-wrap justify-center gap-6">
              <a href="https://youtube.com/@Pawan_Academy" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 bg-white p-4 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all group">
                <div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-all">
                  <Youtube className="w-5 h-5" />
                </div>
                <span className="font-bold text-slate-700">YouTube</span>
              </a>
              <a href="https://t.me/pawan_academy" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 bg-white p-4 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all group">
                <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-all">
                  <Send className="w-5 h-5" />
                </div>
                <span className="font-bold text-slate-700">Telegram</span>
              </a>
              <a href="https://www.instagram.com/pawan_academy" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 bg-white p-4 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all group">
                <div className="w-10 h-10 bg-pink-50 text-pink-600 rounded-xl flex items-center justify-center group-hover:bg-pink-600 group-hover:text-white transition-all">
                  <Instagram className="w-5 h-5" />
                </div>
                <span className="font-bold text-slate-700">Instagram</span>
              </a>
              <a href="https://prourls.info/sZtBld" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 bg-white p-4 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all group">
                <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-all">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <span className="font-bold text-slate-700">WhatsApp</span>
              </a>
              <a href="https://play.google.com/store/apps/details?id=co.tarly.ctygi" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 bg-white p-4 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all group">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <Smartphone className="w-5 h-5" />
                </div>
                <span className="font-bold text-slate-700">Our App</span>
              </a>
            </div>
          </motion.div>
        </div>
      </div>

    </div>
  );
}
