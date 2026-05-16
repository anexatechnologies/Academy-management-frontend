import React from 'react';
import { 
  CheckCircle, 
  Clock, 
  MessageSquare, 
  FileText, 
  ClipboardCheck, 
  CreditCard, 
  Fingerprint, 
  PackageCheck,
  ArrowRight
} from 'lucide-react';
import { motion } from 'motion/react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const steps = [
  {
    icon: <MessageSquare className="text-blue-500 w-6 h-6" />,
    title: '१. चौकशी आणि समुपदेशन (Inquiry & Counseling)',
    desc: 'प्रवेश घेण्यापूर्वी विद्यार्थी अकॅडमीला प्रत्यक्ष भेट देऊन किंवा फोनद्वारे अभ्यासक्रम, बॅचची वेळ आणि फी याबद्दल सविस्तर माहिती घेऊ शकतात. आमचे मार्गदर्शक तुम्हाला तुमच्या करिअरच्या उद्दिष्टांनुसार योग्य बॅच निवडण्यास मदत करतील.'
  },
  {
    icon: <FileText className="text-orange-500 w-6 h-6" />,
    title: '२. नोंदणी अर्ज भरणे (Registration)',
    desc: 'प्रवेशासाठी निर्धारित केलेला अर्ज अचूकपणे भरणे आवश्यक आहे. हा अर्ज तुम्हाला अकॅडमीच्या कार्यालयात उपलब्ध होईल. अर्जामध्ये स्वतःचे नाव, पत्ता, शैक्षणिक पात्रता आणि संपर्क क्रमांक यांसारखी माहिती देणे अनिवार्य आहे.'
  },
  {
    icon: <ClipboardCheck className="text-green-500 w-6 h-6" />,
    title: '३. आवश्यक कागदपत्रे (Required Documents)',
    desc: 'प्रवेशाच्या वेळी आधार कार्ड, शैक्षणिक गुणपत्रिका (१०वी, १२वी किंवा पदवी), अलीकडील दोन पासपोर्ट साईज फोटो आणि आवश्यक असल्यास जातीचा दाखला यांच्या छायांकित प्रती (Zerox) सोबत ठेवणे आवश्यक आहे.'
  },
  {
    icon: <CreditCard className="text-purple-500 w-6 h-6" />,
    title: '४. प्रवेश निश्चिती आणि फी भरणे',
    desc: 'निवडलेल्या कोर्सची फी भरल्यानंतरच विद्यार्थ्याचा प्रवेश निश्चित केला जातो. आम्ही एकरकमी किंवा हप्त्यांमध्ये (Installments) फी भरण्याची सुविधा उपलब्ध करून देतो. फी भरल्यानंतर अधिकृत पावती (Receipt) नक्की घ्यावी.'
  },
  {
    icon: <Fingerprint className="text-red-500 w-6 h-6" />,
    title: '५. आयडी कार्ड आणि बायोमेट्रिक नोंदणी',
    desc: 'प्रवेश प्रक्रिया पूर्ण झाल्यावर विद्यार्थ्याला अकॅडमीचे ओळखपत्र (ID Card) दिले जाते. तसेच, उपस्थिती नोंदवण्यासाठी विद्यार्थ्याच्या बोटांचे ठसे (Biometric Registration) आमच्या प्रणालीमध्ये घेतले जातात.'
  },
  {
    icon: <PackageCheck className="text-teal-500 w-6 h-6" />,
    title: '६. बॅच आणि अभ्यास साहित्याचे वाटप',
    desc: 'प्रवेश निश्चित झाल्यावर विद्यार्थ्याला त्यांच्या बॅचची वेळ कळवली जाते आणि अकॅडमीचे विशेष अभ्यास साहित्य (Notes, Revision Book) दिले जाते. त्यानंतर विद्यार्थी नियमित वर्गांना उपस्थित राहू शकतात.'
  }
];

export default function Admissions() {
  const [content, setContent] = React.useState(() => {
    const saved = localStorage.getItem('pawan_content');
    const data = saved ? JSON.parse(saved) : null;
    return data?.admissions || {
      title: "प्रवेश प्रक्रिया (Admissions)",
      text: "आमच्या अकॅडमीमध्ये प्रवेश घेण्यासाठी आपण ऑनलाईन किंवा ऑफलाईन पद्धतीने नावनोंदणी करू शकता. नवीन बॅचेस दर महिन्याला सुरू होतात."
    };
  });

  React.useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'pawan_content' && e.newValue) {
        try {
          const data = JSON.parse(e.newValue);
          if (data?.admissions) setContent(data.admissions);
        } catch (err) {}
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero Header */}
      <div className="bg-blue-50 text-blue-900 py-16 md:py-24 relative overflow-hidden border-b border-blue-100">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-200 rounded-full blur-[120px] -mr-64 -mt-64"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-200 rounded-full blur-[120px] -ml-64 -mb-64"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center space-x-2 bg-blue-100 border border-blue-200 px-4 py-2 rounded-full mb-6 shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-pulse"></span>
              <span className="text-xs font-black tracking-widest uppercase text-blue-800">प्रवेश २०२६-२७</span>
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black mb-6 tracking-tight text-gray-900 uppercase">{content.title}</h1>
            <p className="text-base md:text-lg text-blue-700 max-w-2xl mx-auto italic font-bold">
              "यशाची पहिली पायरी म्हणजे योग्य सुरुवात. पवन अकॅडमीमध्ये आपल्या करिअरला एक नवी दिशा द्या."
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-12 gap-12">
          
          {/* Main Content - Admission Steps */}
          <div className="lg:col-span-8">
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="mb-10">
                <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">प्रवेश प्रक्रिया</h2>
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm mb-10">
                  <p className="text-slate-600 text-lg leading-relaxed whitespace-pre-wrap">{content.text}</p>
                </div>
                <p className="text-slate-500 text-lg">पवन अकॅडमीमध्ये प्रवेश घेऊ इच्छिणाऱ्या विद्यार्थ्यांसाठी प्रक्रिया अत्यंत पारदर्शक आणि सोपी ठेवली आहे.</p>
              </div>

              <div className="grid gap-6">
                {steps.map((step, i) => (
                  <motion.div 
                    key={i}
                    variants={itemVariants}
                    className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group flex flex-col md:flex-row items-start"
                  >
                    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 md:mb-0 md:mr-8 group-hover:scale-110 transition-transform flex-shrink-0">
                      {step.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">{step.title}</h3>
                      <p className="text-slate-600 leading-relaxed">{step.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar - Quick Info */}
          <aside className="lg:col-span-4 space-y-8">
            
            {/* Offline Admission Card */}
            <div className="bg-orange-50 text-orange-900 p-10 rounded-[3.5rem] shadow-sm border border-orange-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/5 rounded-full blur-2xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
              <h3 className="text-2xl font-black mb-8 relative z-10 uppercase tracking-tighter text-gray-900">ऑफलाईन प्रवेशासाठी (Offline Admission)</h3>
              <div className="space-y-6 relative z-10">
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center mr-4 flex-shrink-0 shadow-sm">
                    <CheckCircle className="w-4 h-4 text-orange-500" />
                  </div>
                  <p className="text-orange-950 font-bold">अकॅडमीच्या कार्यालयात प्रत्यक्ष येऊन माहिती मिळवा.</p>
                </div>
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center mr-4 flex-shrink-0 shadow-sm">
                    <CheckCircle className="w-4 h-4 text-orange-500" />
                  </div>
                  <p className="text-orange-950 font-bold">वर नमूद केलेली कागदपत्रे आणि फोटो सोबत आणा.</p>
                </div>
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center mr-4 flex-shrink-0 shadow-sm">
                    <CheckCircle className="w-4 h-4 text-orange-500" />
                  </div>
                  <p className="text-orange-950 font-bold">बॅचची वेळ आणि फी भरून नोंदणी पूर्ण करा.</p>
                </div>
              </div>
              <button className="w-full mt-10 bg-orange-500 text-white py-4 rounded-2xl font-black hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20 flex items-center justify-center uppercase tracking-widest text-sm">
                कार्यालयीन पत्ता <ArrowRight className="ml-2 w-4 h-4" />
              </button>
            </div>

            {/* Timings Card */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                <Clock className="w-5 h-5 mr-3 text-blue-600" /> कार्यालयीन वेळ
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-slate-50">
                  <span className="text-slate-500 font-medium">सकाळी</span>
                  <span className="text-slate-900 font-bold">०९:०० ते १२:३०</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-50">
                  <span className="text-slate-500 font-medium">दुपारी</span>
                  <span className="text-slate-900 font-bold">०४:०० ते ०८:००</span>
                </div>
                <p className="text-xs text-slate-400 italic mt-4 text-center">रविवार सुट्टी (विशेष बॅचेस वगळता)</p>
              </div>
            </div>

            {/* Support Card */}
            <div className="bg-blue-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-blue-600/20">
              <h4 className="text-lg font-bold mb-4">काही अडचण आल्यास?</h4>
              <p className="text-blue-100 text-sm mb-6 leading-relaxed">
                प्रवेश प्रक्रियेबद्दल अधिक माहितीसाठी आमच्या हेल्पलाईन क्रमांकावर संपर्क साधा.
              </p>
              <div className="bg-white/10 p-4 rounded-2xl flex items-center justify-center">
                <span className="text-xl font-black tracking-widest">+91 8805995353</span>
              </div>
            </div>

          </aside>
        </div>
      </div>
    </div>
  );
}
