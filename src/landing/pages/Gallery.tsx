import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Search, Camera, Maximize2, X, ChevronRight } from 'lucide-react';

export default function Gallery() {
  const [activeCategory, setActiveCategory] = React.useState('All');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedItem, setSelectedItem] = React.useState<any>(null);

  const categories = ['All', 'मैदानी सराव', 'क्लासरूम', 'सत्कार समारंभ', 'यशस्वी विद्यार्थी', 'कार्यक्रम'];

  const [items, setItems] = React.useState(() => {
    const saved = localStorage.getItem('pawan_gallery');
    return saved ? JSON.parse(saved) : [
      { id: 1, type: 'image', category: 'मैदानी सराव', url: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800', title: 'पोलीस भरती मैदानी सराव' },
      { id: 2, type: 'image', category: 'क्लासरूम', url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800', title: 'लेखी परीक्षा सराव' },
      { id: 3, type: 'image', category: 'सत्कार समारंभ', url: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800', title: 'यशस्वी विद्यार्थ्यांचा सत्कार' },
      { id: 4, type: 'image', category: 'मैदानी सराव', url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800', title: 'गोळाफेक सराव' },
      { id: 5, type: 'video', category: 'क्लासरूम', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', title: 'गणित शॉर्ट ट्रिक्स' }, 
      { id: 6, type: 'image', category: 'यशस्वी विद्यार्थी', url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800', title: 'पोलीस शिपाई २०२४ बॅच' }
    ];
  });

  React.useEffect(() => {
    const handleStorage = () => {
      const saved = localStorage.getItem('pawan_gallery');
      if (saved) setItems(JSON.parse(saved));
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const filteredItems = items.filter((item: any) => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-black uppercase tracking-widest">
             <Camera size={16} /> आमची गॅलरी (Gallery)
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter">
            प्रशिक्षणाचे <span className="text-indigo-600">काही क्षण</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-slate-500 font-bold max-w-2xl mx-auto uppercase text-xs tracking-widest italic">
            पवन करिअर अकॅडमीचे मैदानी सराव, क्लासरूम आणि यशस्वी विद्यार्थ्यांचे फोटो
          </motion.p>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row gap-6 items-center justify-between mb-12 bg-white p-4 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100">
           <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto scrollbar-hide px-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeCategory === cat ? 'bg-indigo-600 text-white shadow-lg scale-105' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  {cat}
                </button>
              ))}
           </div>
           
           <div className="relative w-full md:w-80 group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
              <input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="येथे काहीही शोधा..." 
                className="w-full pl-14 pr-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none font-bold text-sm focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all"
              />
           </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
           <AnimatePresence mode="popLayout">
             {filteredItems.map((item: any) => (
               <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="group relative h-[400px] rounded-[3rem] overflow-hidden cursor-pointer shadow-xl hover:shadow-2xl transition-all"
               >
                  <img 
                    src={item.type === 'video' ? `https://img.youtube.com/vi/${item.url.split('embed/')[1] || item.url.split('v=')[1]}/hqdefault.jpg` : item.url} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    alt={item.title} 
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                  
                  <div className="absolute top-6 left-6 flex gap-2">
                     <span className="bg-white/90 backdrop-blur-md text-slate-900 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                        {item.category}
                     </span>
                  </div>

                  <div className="absolute top-6 right-6">
                     {item.type === 'video' ? (
                        <div className="w-12 h-12 bg-red-600 text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                           <Play size={24} fill="currentColor" />
                        </div>
                     ) : (
                        <div className="w-10 h-10 bg-white/20 backdrop-blur-md text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                           <Maximize2 size={20} />
                        </div>
                     )}
                  </div>

                  <div className="absolute bottom-10 left-10 right-10 transform translate-y-4 group-hover:translate-y-0 transition-transform">
                     <h3 className="text-xl font-black text-white leading-tight uppercase line-clamp-2">{item.title}</h3>
                     <p className="text-slate-300 font-bold mt-2 text-xs uppercase tracking-widest flex items-center gap-2">
                        View Details <ChevronRight size={14} className="group-hover:translate-x-2 transition-transform" />
                     </p>
                  </div>
               </motion.div>
             ))}
           </AnimatePresence>
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-40">
             <div className="max-w-xs mx-auto space-y-6">
                <Search size={64} className="mx-auto text-slate-200" />
                <div>
                   <p className="text-xl font-black text-slate-400 font-black">निकाल मिळाला नाही!</p>
                   <p className="text-slate-400 font-bold text-xs uppercase mt-2">दुसरा सर्च वापरून पहा</p>
                </div>
             </div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
         {selectedItem && (
           <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-10"
           >
              <button 
                onClick={() => setSelectedItem(null)}
                className="absolute top-10 right-10 text-white/50 hover:text-white transition-colors p-2"
              >
                 <X size={40} />
              </button>

              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="max-w-6xl w-full flex flex-col md:flex-row gap-10 items-center"
              >
                  <div className="w-full md:w-2/3 aspect-video rounded-3xl overflow-hidden shadow-2xl bg-black">
                     {selectedItem.type === 'video' ? (
                        <iframe 
                          src={selectedItem.url.includes('embed') ? selectedItem.url : `https://www.youtube.com/embed/${selectedItem.url.split('v=')[1]}`} 
                          className="w-full h-full"
                          allowFullScreen
                        />
                     ) : (
                        <img src={selectedItem.url} className="w-full h-full object-contain" alt="" referrerPolicy="no-referrer" />
                     )}
                  </div>
                  <div className="w-full md:w-1/3 space-y-6 text-center md:text-left">
                     <span className="inline-block px-4 py-2 bg-indigo-500 text-white rounded-full text-xs font-black uppercase tracking-widest">
                        {selectedItem.category}
                     </span>
                     <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase leading-tight line-clamp-3">
                        {selectedItem.title}
                     </h2>
                     <button onClick={() => setSelectedItem(null)} className="px-10 py-4 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all shadow-xl">
                        Close Gallery
                     </button>
                  </div>
              </motion.div>
           </motion.div>
         )}
      </AnimatePresence>
    </div>
  );
}
