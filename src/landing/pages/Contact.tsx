import React from 'react';
import { Phone, Mail, MapPin, Youtube, Send, ChevronRight, MessageSquare, Check } from 'lucide-react';

export default function Contact() {
  const [content, setContent] = React.useState(() => {
    const saved = localStorage.getItem('pawan_content');
    const data = saved ? JSON.parse(saved) : null;
    return data?.contact || {
      title: "आमच्याशी संपर्क साधा (Contact Us)",
      subtitle: "तुमच्या करिअरच्या दिशेने पाऊल टाका. प्रवेशासंदर्भात किंवा इतर कोणत्याही माहितीसाठी आम्ही सदैव उपलब्ध आहोत.",
      address: "पवन करिअर अकॅडमी,\nनवीन पोलीस स्टेशन समोर, पाचोड रोड,\nअंबड, ता. अंबड, जि. जालना - ४३१२०४",
      phone: "+91 88059 95353",
      phone2: "+91 88300 06411",
      phone3: "+91 90214 45353",
      whatsapp: "8830006411",
      youtube: "https://www.youtube.com/@pawan_academy",
      telegram: "https://t.me/pawan_academy",
      mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15024.184323871634!2d75.8459463!3d19.2814896!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bd963ae37d95fd9%3A0x67393439f0464f16!2sPawan%20Career%20Academy%20Ambad!5e0!3m2!1sen!2sin!4v1714392000000!5m2!1sen!2sin"
    };
  });

  const [formData, setFormData] = React.useState({
    name: '',
    mobile: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission success since user requested no Firebase
    setTimeout(() => {
      // Clear Form and show success
      const whatsappNumber = content.whatsapp || "8830006411";
      const text = `*नवीन चौकशी (New Inquiry)*\n\n*नाव:* ${formData.name}\n*मोबाईल:* ${formData.mobile}\n*संदेश:* ${formData.message}\n\n_from academy website_`;
      const encodedText = encodeURIComponent(text);
      
      setFormData({ name: '', mobile: '', message: '' });
      setIsSuccess(true);
      setIsSubmitting(false);
      
      // Open WhatsApp as the primary communication method
      window.open(`https://wa.me/91${whatsappNumber}?text=${encodedText}`, '_blank');
      
      setTimeout(() => setIsSuccess(false), 5000);
    }, 800);
  };

  React.useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'pawan_content' && e.newValue) {
        try {
          const data = JSON.parse(e.newValue);
          if (data?.contact) setContent(data.contact);
        } catch (err) {}
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          <div className="bg-blue-50 p-10 md:p-16 text-blue-900 relative border-b border-blue-100">
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-200 rounded-full -mr-32 -mt-32 blur-3xl opacity-50"></div>
            <h2 className="text-4xl font-black mb-4 relative z-10 text-gray-900 uppercase">{content.title}</h2>
            <p className="text-blue-700 text-lg max-w-2xl relative z-10 font-bold italic">
              {content.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            <div className="p-10 md:p-16 space-y-12 bg-white">
              <section>
                <h3 className="text-2xl font-black text-gray-900 mb-8 flex items-center uppercase">
                  <MapPin className="w-7 h-7 mr-3 text-orange-500" /> मुख्य कार्यालय (Address)
                </h3>
                <div className="space-y-4 text-gray-700 text-lg font-medium">
                  <div className="whitespace-pre-wrap font-black text-blue-800 text-xl">{content.address}</div>
                </div>
              </section>

              <section className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-xl font-black text-gray-900 mb-4 flex items-center uppercase">
                    <Phone className="w-5 h-5 mr-3 text-orange-500" /> फोन नंबर
                  </h4>
                  <div className="space-y-2 text-gray-700 font-bold">
                    {content.phones?.split(',').map((p: string, i: number) => (
                      <p key={i}>{p.trim()}</p>
                    )) || (
                      <>
                        <p>{content.phone}</p>
                        <p>{content.phone2}</p>
                        <p>{content.phone3}</p>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="text-xl font-black text-gray-900 mb-4 flex items-center uppercase">
                    <Mail className="w-5 h-5 mr-3 text-orange-500" /> ईमेल
                  </h4>
                  <a href={`mailto:${content.email}`} className="text-blue-600 hover:text-blue-800 font-black break-all underline">
                    {content.email}
                  </a>
                </div>
              </section>


              <section>
                <h3 className="text-2xl font-bold text-blue-900 mb-6 flex items-center">
                  <MessageSquare className="w-7 h-7 mr-3 text-orange-500" /> सोशल मीडिया
                </h3>
                <div className="flex flex-wrap gap-4">
                  {content.youtube && (
                    <a 
                      href={content.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors shadow-md"
                    >
                      <Youtube className="w-5 h-5 mr-2" /> YouTube
                    </a>
                  )}
                  {content.telegram && (
                    <a 
                      href={content.telegram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center px-6 py-3 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition-colors shadow-md"
                    >
                      <Send className="w-5 h-5 mr-2" /> Telegram
                    </a>
                  )}
                </div>
              </section>
            </div>

            <div className="p-10 md:p-16 bg-blue-50 border-l border-gray-100">
              <h3 className="text-2xl font-bold text-blue-900 mb-8">क्विक मॅसेज (Send us a Message)</h3>
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">विद्यार्थ्याचे नाव (Full Name)</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white font-medium shadow-sm" 
                    placeholder="तुमचे नाव टाका" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">मोबाईल नंबर (WhatsApp Number)</label>
                  <input 
                    type="tel" 
                    required
                    value={formData.mobile}
                    onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white font-medium shadow-sm" 
                    placeholder="९८७६५४३२१०" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">तुमचा संदेश (Message)</label>
                  <textarea 
                    rows={4} 
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white font-medium shadow-inner resize-none" 
                    placeholder="येथे तुमची चौकशी लिहा..." 
                  />
                  <p className="mt-2 text-[10px] text-slate-400 italic">हा संदेश WhatsApp द्वारे पाठविला जाईल.</p>
                </div>
                
                {isSuccess ? (
                  <div className="bg-emerald-100 text-emerald-800 p-4 rounded-xl font-bold flex items-center justify-center gap-2 animate-bounce">
                    <Check size={20} /> संदेश यशस्वीरित्या पाठवला! (Sent Successfully)
                  </div>
                ) : (
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-emerald-600 disabled:bg-slate-400 text-white py-4 rounded-xl font-extrabold hover:bg-emerald-700 transition-all shadow-lg flex items-center justify-center text-lg uppercase tracking-wider group ring-4 ring-emerald-600/10"
                  >
                    {isSubmitting ? "पाठवत आहे..." : "पाठवा (Send message)"} <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                )}
              </form>
            </div>
          </div>
        </div>

        {/* Map Section */}
        {content.mapUrl && (
          <div className="mt-12 bg-white p-4 rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden h-[450px]">
            <iframe 
              src={content.mapUrl}
              className="w-full h-full rounded-[2rem]"
              style={{ border: 0 }} 
              allowFullScreen={true}
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        )}
      </div>
    </div>
  );
}
