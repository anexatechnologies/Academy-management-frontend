import React from 'react';
import { Library, Laptop, Smartphone, Home, Coffee, CheckCircle, Zap } from 'lucide-react';

export default function Facilities() {
  const [content, setContent] = React.useState(() => {
    const saved = localStorage.getItem('pawan_content');
    const data = saved ? JSON.parse(saved) : null;
    return data?.facilities || {
      title: "सोयी-सुविधा (Facilities)",
      text: "आमच्याकडे अद्ययावत डिजिटल क्लासरूम, प्रशस्त ग्रंथालय, आणि 24/7 अभ्यासासाठी स्वतंत्र व्यवस्था उपलब्ध आहे."
    };
  });

  React.useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'pawan_content' && e.newValue) {
        try {
          const data = JSON.parse(e.newValue);
          if (data?.facilities) setContent(data.facilities);
        } catch (err) {}
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const facilities = [
    { icon: <Library className="w-10 h-10 text-orange-500" />, title: 'स्वतंत्र ग्रंथालय (Library)', desc: 'अभ्यासासाठी शांततापूर्ण आणि समृद्ध ग्रंथालयाची सोय. अद्ययावत मासिके आणि पुस्तकांचा संग्रह.' },
    { icon: <Home className="w-10 h-10 text-blue-600" />, title: 'निवासी सोय (Hostel)', desc: 'बाहेरगावच्या विद्यार्थ्यांसाठी राहण्याची आणि जेवणाची उत्तम सोय.' },
    { icon: <Laptop className="w-10 h-10 text-purple-600" />, title: 'डिजिटल लॅब', desc: 'ऑनलाईन सराव करण्यासाठी कंप्यूटर लॅब आणि वाय-फाय सुविधा.' },
    { icon: <Zap className="w-10 h-10 text-yellow-500" />, title: 'शारीरिक प्रशिक्षण मैदान', desc: 'भरती पूर्व सरावासाठी सर्व सोयींनी युक्त स्वतःचे मैदान.' },
    { icon: <Coffee className="w-10 h-10 text-brown-600" />, title: 'मेस सुविधा', desc: 'घरगुती आणि पौष्टिक जेवणाची सोय.' },
    { icon: <Smartphone className="w-10 h-10 text-teal-500" />, title: 'मोबाईल App', desc: 'घरबसल्या तयारी करण्यासाठी पवन अकॅडमीचे ऑनलाईन प्लॅटफॉर्म.' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-6 uppercase flex items-center justify-center gap-4">
          <Home className="w-10 h-10 text-orange-500" /> {content.title}
        </h2>
        <div className="max-w-4xl mx-auto bg-blue-50 p-8 rounded-[2.5rem] border border-blue-100 shadow-sm">
           <p className="text-blue-800 text-lg font-bold italic whitespace-pre-wrap">{content.text}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
        {facilities.map((f, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-xl transition-all group flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 transform group-hover:scale-110 group-hover:bg-slate-100 transition-all">{f.icon}</div>
            <h3 className="text-xl font-black text-slate-900 mb-3">{f.title}</h3>
            <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* Why Choose Us / Quality Promise */}
      <div className="grid lg:grid-cols-2 gap-12 mb-24">
         <div className="bg-blue-50 p-10 md:p-16 rounded-[4rem] text-blue-900 relative overflow-hidden flex flex-col justify-center border border-blue-100 shadow-sm">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-200/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
            <h3 className="text-xl md:text-2xl font-black mb-8 relative z-10 italic">"विद्यार्थ्यांच्या यशासाठी, आम्ही सर्वोत्तम सुविधा देण्यास कटिबद्ध आहोत."</h3>
            <p className="text-blue-700 text-sm md:text-base leading-relaxed mb-8 font-bold italic">पवन अकॅडमीमध्ये आम्ही केवळ शिकवत नाही, तर विद्यार्थ्यांच्या निवासापासून ते अभ्यासापर्यंतच्या प्रत्येक गोष्टीचे सूक्ष्म नियोजन करतो.</p>
            <div className="flex items-center space-x-6 relative z-10">
               <div className="flex -space-x-3">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-12 h-12 rounded-full border-2 border-white bg-blue-100 flex items-center justify-center text-[10px] font-black text-blue-800">PA</div>
                  ))}
               </div>
               <p className="text-sm font-black text-blue-600 tracking-widest uppercase">१०००+ विद्यार्थी समाधानी</p>
            </div>
         </div>

         <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col items-center text-center">
               <div className="bg-orange-50 p-4 rounded-2xl mb-4"><CheckCircle className="text-orange-500 w-6 h-6" /></div>
               <h4 className="font-bold text-slate-900 mb-2">सुरक्षित परिसर</h4>
               <p className="text-xs text-slate-500">CCTV पाळत आणि डेस्क असिस्टंट २४/७ उपलब्ध.</p>
            </div>
            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col items-center text-center">
               <div className="bg-blue-50 p-4 rounded-2xl mb-4"><CheckCircle className="text-blue-500 w-6 h-6" /></div>
               <h4 className="font-bold text-slate-900 mb-2">स्वतंत्र बैठक सोय</h4>
               <p className="text-xs text-slate-500">मुलां-मुलींसाठी स्वतंत्र अभ्यासिका आणि आसनव्यवस्था.</p>
            </div>
            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col items-center text-center">
               <div className="bg-emerald-50 p-4 rounded-2xl mb-4"><CheckCircle className="text-emerald-500 w-6 h-6" /></div>
               <h4 className="font-bold text-slate-900 mb-2">अद्ययावत लॅब</h4>
               <p className="text-xs text-slate-500">हाय-स्पीड इंटरनेट आणि ऑनलाईन सराव परीक्षांची सोय.</p>
            </div>
            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col items-center text-center">
               <div className="bg-purple-50 p-4 rounded-2xl mb-4"><CheckCircle className="text-purple-500 w-6 h-6" /></div>
               <h4 className="font-bold text-slate-900 mb-2">२४/७ वीज सोय</h4>
               <p className="text-xs text-slate-500">जनरेटर आणि इन्व्हर्टर बॅकअपमुळे अभ्यासात खंड नाही.</p>
            </div>
         </div>
      </div>

      <div className="bg-blue-50 p-10 md:p-16 rounded-[3rem] text-blue-900 overflow-hidden relative shadow-sm border border-blue-100">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-200/20 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="flex flex-col md:flex-row items-center justify-between relative z-10">
          <div className="md:w-2/3 mb-10 md:mb-0">
            <h3 className="text-3xl font-black mb-6 uppercase tracking-tighter text-gray-900">आम्ही विद्यार्थ्यांच्या सर्वांगीण विकासासाठी कटिबद्ध आहोत</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <CheckCircle className="text-orange-500 mr-3" />
                <p className="font-bold text-blue-800">सुरक्षित आणि शिस्तबद्ध कॅम्पस</p>
              </div>
              <div className="flex items-center">
                <CheckCircle className="text-orange-500 mr-3" />
                <p className="font-bold text-blue-800">मुलां-मुलींसाठी स्वतंत्र बसण्याची सोय</p>
              </div>
              <div className="flex items-center">
                <CheckCircle className="text-orange-500 mr-3" />
                <p className="font-bold text-blue-800">अद्ययावत पिण्याच्या पाण्याची सोय</p>
              </div>
            </div>
          </div>
          <div className="md:w-1/3">
             <button className="bg-orange-500 text-white px-10 py-5 rounded-2xl font-black text-xl hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20 w-full uppercase tracking-widest">
               संपर्क साधा
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
