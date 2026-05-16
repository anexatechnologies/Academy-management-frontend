import React from 'react';
import { 
  BookOpen, 
  CheckCircle, 
  Eye, 
  Rocket, 
  Users, 
  BookMarked,
  Smartphone, 
  ShieldCheck, 
  Scale, 
  Quote,
  Youtube,
  Send,
  Globe,
  Trophy
} from 'lucide-react';
import { motion } from 'motion/react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function About() {
  const [content, setContent] = React.useState(() => {
    const saved = localStorage.getItem('pawan_content');
    const data = saved ? JSON.parse(saved) : null;
    return data?.about || {
      title: "पवन अकॅडमी बद्दल",
      text: "स्पर्धा परीक्षेच्या अथांग महासागरात योग्य दिशा मिळणे हीच यशाची गुरुकिल्ली आहे. पवन अकॅडमी ही केवळ एक कोचिंग इन्स्टिट्यूट नसून, स्पर्धा परीक्षेची तयारी करणाऱ्या प्रत्येक जिद्दी विद्यार्थ्याचे हक्काचे व्यासपीठ आहे."
    };
  });

  React.useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'pawan_content' && e.newValue) {
        try {
          const data = JSON.parse(e.newValue);
          if (data?.about) setContent(data.about);
        } catch (err) {}
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero Section */}
      <div className="bg-blue-50 text-blue-900 py-20 relative overflow-hidden border-b border-blue-100">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-orange-200 rounded-full blur-3xl -mr-48 -mt-48"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-200 rounded-full blur-3xl -ml-48 -mb-48"></div>
        </div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center space-x-2 bg-blue-100 px-4 py-2 rounded-full mb-6 border border-blue-200">
              <Trophy className="w-4 h-4 text-orange-500" />
              <span className="text-xs font-bold tracking-widest uppercase">स्थापना २०१८</span>
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black mb-6 tracking-tight text-gray-900 uppercase">{content.title}</h1>
            <p className="text-base md:text-lg text-blue-700 leading-relaxed font-bold italic">
              "मित्रांनो कानापेक्षा डोळ्यावर विश्वास ठेवणारा माणुस कधीही धोका खात नाही कारण ते वास्तव असते."
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="space-y-20"
        >
          {/* Introduction */}
          <motion.section variants={itemVariants} className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-slate-100">
            <h2 className="text-3xl font-bold text-slate-900 mb-8 flex items-center">
              <BookOpen className="w-8 h-8 mr-4 text-orange-500" /> प्रस्तावना: यशाचा एक भक्कम पाया
            </h2>
            <div className="prose prose-lg max-w-none text-slate-600 leading-relaxed space-y-6">
              <p className="whitespace-pre-wrap">
                {content.text}
              </p>
              <p>
                पोलीस भरती, MPSC, सरळसेवा आणि इतर निमसरकारी परीक्षांमध्ये ग्रामीण तसेच शहरी भागातील विद्यार्थ्यांनी आपले नाव सुवर्ण अक्षरात कोरावे, या उदात्त हेतूने आमची वाटचाल सुरू आहे.
              </p>
            </div>
          </motion.section>

          {/* Vision & Mission */}
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div variants={itemVariants} className="bg-blue-50 text-blue-900 p-10 rounded-[3rem] shadow-sm border border-blue-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full blur-2xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
              <Eye className="w-12 h-12 mb-6 text-blue-600" />
              <h3 className="text-3xl font-black mb-4 uppercase tracking-tighter">आमची दूरदृष्टी (Vision)</h3>
              <p className="text-blue-700 text-lg leading-relaxed font-bold italic">
                अल्प दरात परंतु अत्यंत उच्च दर्जाचे शिक्षण देऊन समाजातील शेवटच्या घटकापर्यंत स्पर्धा परीक्षेचे ज्ञान पोहोचवणे. विद्यार्थ्यांमध्ये केवळ परीक्षेपुरती तयारी न करून घेता, त्यांच्यामध्ये प्रशासकीय शिस्त आणि नैतिक मूल्ये रुजवणे हे आमचे दीर्घकालीन ध्येय आहे.
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-orange-50 text-orange-900 p-10 rounded-[3rem] shadow-sm border border-orange-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/5 rounded-full blur-2xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
              <Rocket className="w-12 h-12 mb-6 text-orange-600" />
              <h3 className="text-3xl font-black mb-4 uppercase tracking-tighter">आमचे ध्येय (Mission)</h3>
              <div className="space-y-4">
                <div className="flex items-start bg-white p-4 rounded-2xl shadow-sm">
                  <CheckCircle className="w-5 h-5 mr-3 mt-1 flex-shrink-0 text-orange-500" />
                  <p className="font-extrabold">गुणवत्तापूर्ण मार्गदर्शन: सखोल अभ्यास आणि सोप्या क्लृप्त्या (Shortcuts).</p>
                </div>
                <div className="flex items-start bg-white p-4 rounded-2xl shadow-sm">
                  <Smartphone className="w-5 h-5 mr-3 mt-1 flex-shrink-0 text-orange-500" />
                  <p className="font-extrabold">तंत्रज्ञानाचा वापर: पारंपरिक शिक्षणाला 'डिजिटल लर्निंग' ची जोड.</p>
                </div>
                <div className="flex items-start bg-white p-4 rounded-2xl shadow-sm">
                  <ShieldCheck className="w-5 h-5 mr-3 mt-1 flex-shrink-0 text-orange-500" />
                  <p className="font-extrabold">आत्मविश्वास: परीक्षेची भीती काढून विद्यार्थ्यांना सक्षम बनवणे.</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Features */}
          <motion.section variants={itemVariants}>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">पवन अकॅडमीची वैशिष्ट्ये</h2>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">आमची कार्यपद्धती आणि सोयी</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { 
                  icon: <Users className="text-blue-500" />, 
                  title: 'अनुभवी मार्गदर्शक मंडळ', 
                  desc: 'प्रत्येक विषयासाठी स्वतंत्र आणि निष्णात शिक्षक. बदलते स्वरूप ओळखून अचूक मार्गदर्शन.' 
                },
                { 
                  icon: <BookMarked className="text-orange-500" />, 
                  title: 'अद्ययावत अभ्यास साहित्य', 
                  desc: "आमचे 'Fast Revision' पुस्तक आणि स्वतःचे संशोधित अभ्यास साहित्य विद्यार्थ्यांसाठी उपलब्ध." 
                },
                { 
                  icon: <Smartphone className="text-emerald-500" />, 
                  title: 'मोबाईल ॲप सुविधा', 
                  desc: "'Pawan Academy App' द्वारे व्हिडिओ लेक्चर्स, पीडीएफ आणि प्रश्नसंच कधीही उपलब्ध." 
                },
                { 
                  icon: <CheckCircle className="text-purple-500" />, 
                  title: 'पारदर्शक परीक्षा प्रणाली', 
                  desc: 'साप्ताहिक सराव परीक्षा आणि निकालाचे विशेष पोर्टलवर त्वरित विश्लेषण.' 
                },
                { 
                  icon: <Smartphone className="text-red-500" />, 
                  title: 'बायोमेट्रिक हजेरी', 
                  desc: 'सातत्य आणि वेळेच्या पालनासाठी बायोमेट्रिक प्रणाली. पालकांसाठी उपस्थितीची हमी.' 
                },
                { 
                  icon: <Rocket className="text-indigo-500" />, 
                  title: 'शारीरिक चाचणी मार्गदर्शन', 
                  desc: 'मैदानावरील प्रशिक्षणाचे (Ground Training) योग्य नियोजन आणि मार्गदर्शन.' 
                }
              ].map((feature, i) => (
                <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 group">
                  <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h4>
                  <p className="text-slate-500 text-sm leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Social Commitment */}
          <motion.section variants={itemVariants} className="bg-blue-50 p-10 md:p-20 rounded-[4rem] text-blue-900 overflow-hidden relative border border-blue-100 shadow-sm">
            <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200/20 rounded-full blur-[100px] -ml-48 -mt-48"></div>
            <div className="relative z-10 max-w-4xl mx-auto text-center">
              <Scale className="w-12 h-12 text-orange-500 mb-6 mx-auto" />
              <h2 className="text-4xl font-black mb-6 tracking-tight uppercase">सामाजिक बांधिलकी</h2>
              <p className="text-blue-700 text-lg leading-relaxed mb-8 font-bold italic">
                पवन बहुउद्देशीय सेवाभावी संस्थेच्या माध्यमातून आम्ही केवळ शैक्षणिकच नव्हे, तर सामाजिक जबाबदारीचे भान ठेवून विविध उपक्रम राबवतो. आर्थिकदृष्ट्या दुर्बल असलेल्या होतकरू विद्यार्थ्यांना मदत करणे हा आमच्या संस्थेचा अविभाज्य भाग आहे.
              </p>
              <div className="flex flex-wrap justify-center gap-6">
                <div className="bg-white border border-blue-100 p-6 rounded-3xl min-w-[200px] shadow-sm">
                  <h4 className="text-3xl font-black mb-1 tracking-tighter text-gray-900">५००+</h4>
                  <p className="text-xs text-blue-500 uppercase font-bold tracking-widest">मदत मिळालेले विद्यार्थी</p>
                </div>
                <div className="bg-white border border-blue-100 p-6 rounded-3xl min-w-[200px] shadow-sm">
                  <h4 className="text-3xl font-black mb-1 tracking-tighter text-gray-900">२०+</h4>
                  <p className="text-xs text-blue-500 uppercase font-bold tracking-widest">सामाजिक उपक्रम</p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Milestones / Journey */}
          <motion.section variants={itemVariants} className="py-20 bg-white rounded-[4rem] border border-slate-100 shadow-sm px-8 md:px-16 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 tracking-tight">आमचा प्रवास (Our Journey)</h2>
              <p className="text-slate-500">२०१८ पासून सुरू झालेला हा यशाचा प्रवास आजही अविरत सुरू आहे.</p>
            </div>
            
            <div className="relative">
              {/* Vertical line for desktop */}
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-100 hidden md:block"></div>
              
              <div className="space-y-12">
                {[
                  { year: '२०१८', title: 'अकॅडमीची स्थापना', desc: 'अंबड शहरात अल्प विद्यार्थ्यांसह पवन अकॅडमीचा शुभारंभ.' },
                  { year: '२०१९', title: 'पहिला भरघोस निकाल', desc: 'पोलीस भरतीमध्ये २५+ विद्यार्थ्यांची निवडून ऐतिहासिक सुरुवात.' },
                  { year: '२०२१', title: 'डिजिटल क्रांती', desc: 'मोबाईल ॲप आणि ऑनलाईन लर्निंग पोर्टलची अधिकृत सुरुवात.' },
                  { year: '२०२३', title: 'नवीन प्रशस्त इमारत', desc: 'अद्ययावत सोयी-सुविधांनी युक्त नवीन कॅम्पसचे उद्घाटन.' },
                  { year: '२०२४', title: '५००+ निवडींचा टप्पा', desc: 'विविध सरकारी पदांवर ५०० हून अधिक विद्यार्थ्यांच्या निवडीचा विक्रम.' }
                ].map((milestone, i) => (
                  <div key={i} className={`flex flex-col md:flex-row items-center ${i % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                    <div className="md:w-1/2 flex justify-center px-8 mb-4 md:mb-0">
                      <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 w-full max-w-sm hover:shadow-xl transition-all">
                        <span className="text-orange-500 font-black text-xl mb-2 block">{milestone.year}</span>
                        <h4 className="font-bold text-slate-900 mb-2">{milestone.title}</h4>
                        <p className="text-sm text-slate-500">{milestone.desc}</p>
                      </div>
                    </div>
                    <div className="w-4 h-4 bg-orange-500 rounded-full border-4 border-white shadow-md relative z-10 hidden md:block"></div>
                    <div className="md:w-1/2"></div>
                  </div>
                ))}
              </div>
            </div>
          </motion.section>

          {/* Founders Messages Section */}
          <motion.section variants={itemVariants}>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">संस्थापकांचा संदेश</h2>
              <p className="text-slate-600 max-w-3xl mx-auto leading-relaxed">
                आमच्या संस्थेचा पाया हा केवळ शिक्षणावर नाही, तर विद्यार्थ्यांच्या उज्वल भविष्याच्या विश्वासावर आधारलेला आहे. पवन अकॅडमीच्या माध्यमातून आम्ही स्पर्धा परीक्षेची तयारी करणाऱ्या प्रत्येक विद्यार्थ्याला सक्षम बनवण्यासाठी कटिबद्ध आहोत.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12">
              {/* Director 1 */}
              <div className="bg-white p-8 md:p-12 rounded-[3.5rem] border border-slate-100 shadow-xl relative group">
                <Quote className="absolute top-8 right-8 w-16 h-16 text-slate-50 opacity-10 group-hover:opacity-20 transition-opacity" />
                <div className="relative z-10">
                  <div className="flex items-center mb-8">
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-blue-600/20 mr-4">
                      स
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-slate-900">श्री. सुरेश जगताप सर</h4>
                      <p className="text-blue-600 text-xs font-bold uppercase tracking-widest">संचालक, पवन अकॅडमी</p>
                    </div>
                  </div>
                  <div className="space-y-4 text-slate-600 leading-relaxed italic">
                    <p className="font-bold text-slate-800">"प्रिय विद्यार्थी मित्रांनो,"</p>
                    <p>
                      स्पर्धा परीक्षा हे केवळ अभ्यासाचे मैदान नसून ते तुमच्या संयमाची आणि जिद्दीची कसोटी पाहणारे क्षेत्र आहे. ग्रामीण भागातील विद्यार्थ्यांमध्ये प्रचंड गुणवत्ता असते, पण योग्य मार्गदर्शनाअभावी अनेकदा ती मागे पडते. हीच उणीव भरून काढण्यासाठी आम्ही 'पवन अकॅडमी'ची स्थापना केली आहे.
                    </p>
                    <p>
                      आमचा उद्देश केवळ सिलॅबस पूर्ण करणे हा नसून, प्रत्येक विद्यार्थ्यामध्ये परीक्षेला सामोरे जाण्याचा आत्मविश्वास निर्माण करणे हा आहे. शिस्त, चिकाटी आणि योग्य रणनीती या त्रिसूत्रीच्या जोरावर तुम्ही कोणतेही शिखर सर करू शकता. तुमच्या स्वप्नांच्या या प्रवासात आम्ही सदैव तुमच्या सोबत आहोत.
                    </p>
                  </div>
                </div>
              </div>

              {/* Director 2 */}
              <div className="bg-white p-8 md:p-12 rounded-[3.5rem] border border-slate-100 shadow-xl relative group">
                <Quote className="absolute top-8 right-8 w-16 h-16 text-slate-50 opacity-10 group-hover:opacity-20 transition-opacity" />
                <div className="relative z-10">
                  <div className="flex items-center mb-8">
                    <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-orange-500/20 mr-4">
                      य
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-slate-900">श्री. योगेश दत्ता शिकरे सर</h4>
                      <p className="text-orange-600 text-xs font-bold uppercase tracking-widest">संचालक, पवन अकॅडमी</p>
                    </div>
                  </div>
                  <div className="space-y-4 text-slate-600 leading-relaxed italic">
                    <p className="font-bold text-slate-800">"नमस्कार,"</p>
                    <p>
                      आजच्या अत्यंत स्पर्धेच्या युगात केवळ कष्ट करून चालत नाही, तर त्याला आधुनिक तंत्रज्ञानाची आणि 'स्मार्ट वर्क'ची जोड द्यावी लागते. पवन अकॅडमीमध्ये आम्ही पारंपरिक शिक्षणासोबतच डिजिटल प्लॅटफॉर्म्स, मोबाईल ॲप आणि अपडेटेड नोट्सचा वापर करून शिक्षण अधिक सुलभ आणि प्रभावी बनवले आहे.
                    </p>
                    <p>
                      आमचा प्रयत्न आहे की, प्रत्येक विद्यार्थ्याला दर्जेदार सराव प्रश्नसंच, अचूक विश्लेषण आणि शिस्तबद्ध वातावरण मिळावे. पोलीस भरती असो वा इतर स्पर्धा परीक्षा, तुमची मेहनत आणि आमचे नियोजन यांची सांगड घालून आपण नक्कीच यशस्वी होऊ. लक्षात ठेवा, यश हे सातत्य राखणाऱ्यांनाच मिळते. तुमच्या उज्वल भविष्यासाठी माझ्याकडून खूप खूप शुभेच्छा!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Call to Action */}
          <motion.section variants={itemVariants} className="text-center py-10">
             <h2 className="text-3xl font-black text-slate-900 mb-8">आमच्याशी जोडून घ्या</h2>
             <div className="flex flex-wrap justify-center gap-4">
                <a href="https://t.me/pawan_academy" target="_blank" rel="noreferrer" className="flex items-center bg-blue-500 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-600 transition-all shadow-xl shadow-blue-500/20">
                  <Send className="w-5 h-5 mr-3" /> टेलिग्राम चॅनेल
                </a>
                <a href="https://www.youtube.com/@pawan_academy" target="_blank" rel="noreferrer" className="flex items-center bg-red-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-red-700 transition-all shadow-xl shadow-red-600/20">
                  <Youtube className="w-5 h-5 mr-3" /> यूट्यूब चॅनेल
                </a>
                <a href="https://pawanacademyambad.blogspot.com/" target="_blank" rel="noreferrer" className="flex items-center bg-orange-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-orange-700 transition-all shadow-xl shadow-orange-600/20">
                  <Globe className="w-5 h-5 mr-3" /> ब्लॉगर वेबसाईट
                </a>
             </div>
             <p className="mt-12 text-slate-500 font-medium">
               तुमच्या यशाच्या प्रवासात पवन अकॅडमी नेहमीच तुमच्या पाठीशी उभी आहे.
             </p>
          </motion.section>
        </motion.div>
      </div>
    </div>
  );
}
