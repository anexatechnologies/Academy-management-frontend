import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Briefcase, ExternalLink, Search, FileText, ChevronRight, ChevronLeft } from 'lucide-react';

export default function Advertisements() {
  const [ads, setAds] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedAds, setExpandedAds] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  useEffect(() => {
    const saved = localStorage.getItem('pawan_jobs');
    if (saved) {
      setAds(JSON.parse(saved)); // Removed .reverse() because LoginPage prepends now
    } else {
      const defaultAds = [
        {
          id: 1,
          title: 'ऑपरेटर (केमिकल) ट्रेनी भरती २०२६',
          company: 'केमिकल कॉर्पोरेशन',
          location: 'मुंबई',
          date: '१७ फेब्रुवारी २०२६',
          adNumber: '17022026',
          total: '188',
          qualification: '55% गुणांसह B.Sc. (Chemistry) + NCVT (AO-CP) किंवा केमिकल इंजिनिअरिंग डिप्लोमा किंवा 12वी (विज्ञान) उत्तीर्ण [SC/ST: 50% गुण]',
          age: '01 फेब्रुवारी 2026 रोजी 30 वर्षांपर्यंत [SC/ST: 05 वर्षे सूट, OBC: 03 वर्षे सूट]',
          fee: 'General/EWS/OBC: ₹700/- [SC/ST/PWD/ExSM/महिला: फी नाही]',
          method: 'Online',
          lastDate: '2026-05-27', // Use YYYY-MM-DD for logic
          examDate: 'नंतर कळविण्यात येईल',
          pdfLink: '#',
          applyLink: '#',
          webLink: '#',
          posts: [
            { name: 'ऑपरेटर (केमिकल) ट्रेनी', count: '188' }
          ]
        }
      ];
      setAds(defaultAds);
    }
  }, []);

  const toggleExpand = (id: number) => {
    setExpandedAds(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const filteredAds = ads.filter(ad => 
    ad.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    ad.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ad.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination Logic
  const totalPages = Math.ceil(filteredAds.length / itemsPerPage);
  const currentAds = filteredAds.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const isDateExpired = (dateString: string) => {
    if (!dateString) return false;
    const lastDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return lastDate < today;
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleDateString('mr-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Hero Header */}
      <div className="bg-blue-600 text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl -mr-48 -mt-48"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl md:text-5xl font-black mb-4 tracking-tighter uppercase">नवीन जाहिराती (Jahirati)</h1>
            <p className="text-blue-100 font-bold italic">नोकरीच्या ताज्या संधी खास तुमच्यासाठी!</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-8 relative z-20">
        {/* Search Bar */}
        <div className="bg-white p-3 rounded-2xl shadow-xl border border-slate-100 mb-8 max-w-2xl mx-auto">
          <div className="relative flex items-center">
            <Search className="absolute left-6 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="जाहिरात शोधा..." 
              className="w-full pl-16 pr-6 py-4 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 font-bold outline-none"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        {/* Ads Table-like List */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
          {/* Header Row */}
          <div className="hidden md:grid grid-cols-[1fr_120px_180px] bg-slate-900 text-white p-6 font-black text-xs uppercase tracking-widest">
            <div className="pl-4">जाहिरात (Headline)</div>
            <div className="text-center">जागा (Posts)</div>
            <div className="text-center">शेवटची तारीख (Last Date)</div>
          </div>

          <div className="divide-y divide-slate-100">
            {currentAds.map((ad) => {
              const expired = isDateExpired(ad.lastDate);
              const isExpanded = expandedAds.includes(ad.id);

              return (
                <div key={ad.id} className="group transition-colors hover:bg-slate-50/50">
                  {/* Summary Row */}
                  <div 
                    onClick={() => toggleExpand(ad.id)}
                    className="grid grid-cols-1 md:grid-cols-[1fr_120px_180px] p-4 md:p-6 cursor-pointer items-center gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isExpanded ? 'bg-orange-500 text-white rotate-90' : 'bg-slate-100 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500'}`}>
                        <ChevronRight size={20} />
                      </div>
                      <div>
                        <h3 className="font-black text-slate-900 md:text-lg mb-1 leading-tight group-hover:text-blue-600 transition-colors uppercase">
                          {ad.title}
                        </h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{ad.company}</p>
                      </div>
                    </div>

                    <div className="flex md:block items-center justify-between">
                      <span className="md:hidden text-[10px] font-black text-slate-400 uppercase">जागा:</span>
                      <div className="text-center">
                        <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg font-black text-sm border border-blue-100 shadow-sm">
                          {ad.total}
                        </span>
                      </div>
                    </div>

                    <div className="flex md:block items-center justify-between">
                      <span className="md:hidden text-[10px] font-black text-slate-400 uppercase">शेवटची तारीख:</span>
                      <div className="text-center">
                        <span className={`px-4 py-1 rounded-lg font-black text-sm border shadow-sm ${expired ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                          {ad.lastDate ? formatDate(ad.lastDate) : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-slate-50 shadow-inner"
                      >
                        <div className="p-6 md:p-10 space-y-8 max-w-4xl mx-auto">
                          {/* Posts Table */}
                          {ad.posts && ad.posts.length > 0 && (
                            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                              <table className="w-full text-left">
                                <thead className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">
                                  <tr>
                                    <th className="px-6 py-4">पदाचे नाव</th>
                                    <th className="px-6 py-4 text-center">पद संख्या</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {ad.posts.map((p: any, idx: number) => (
                                    <tr key={idx} className="border-b border-slate-100 font-bold text-sm hover:bg-slate-50 transition-colors">
                                      <td className="px-6 py-4 text-slate-700">{p.name}</td>
                                      <td className="px-6 py-4 text-center text-blue-600">{p.count}</td>
                                    </tr>
                                  ))}
                                  <tr className="font-black text-slate-900 bg-slate-50/50">
                                    <td className="px-6 py-4">एकूण जागा</td>
                                    <td className="px-6 py-4 text-center text-lg">{ad.total}</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          )}

                          <div className="grid md:grid-cols-2 gap-8">
                             <div className="space-y-4">
                                <div>
                                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">शैक्षणिक पात्रता</label>
                                  <p className="bg-white p-4 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 leading-relaxed shadow-sm">{ad.qualification || 'माहिती उपलब्ध नाही'}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                   <div>
                                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">अर्ज करण्याची पद्धत</label>
                                     <p className="bg-white p-3 rounded-xl border border-slate-200 text-sm font-black text-slate-700 shadow-sm">{ad.method || 'Online'}</p>
                                   </div>
                                   <div>
                                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">जाहिरात क्र.</label>
                                     <p className="bg-white p-3 rounded-xl border border-slate-200 text-sm font-black text-slate-700 shadow-sm">{ad.adNumber || 'N/A'}</p>
                                   </div>
                                </div>
                             </div>

                             <div className="space-y-6">
                                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">महत्त्वाच्या माहिती</label>
                                  <div className="space-y-3">
                                    <div className="flex justify-between items-center text-sm font-bold">
                                      <span className="text-slate-500">वयाची अट:</span>
                                      <span className="text-slate-900">{ad.age || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm font-bold">
                                      <span className="text-slate-500">परीक्षा शुल्क:</span>
                                      <span className="text-slate-900">{ad.fee || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm font-bold">
                                      <span className="text-slate-500">परीक्षा तारीख:</span>
                                      <span className="text-slate-900">{ad.examDate || 'नंतर कळविण्यात येईल'}</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex flex-wrap gap-3">
                                  {ad.pdfLink && (
                                    <a href={ad.pdfLink} target="_blank" rel="noopener noreferrer" className="flex-1 bg-white border-2 border-slate-900 text-slate-900 px-4 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest text-center hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center gap-2">
                                      <FileText size={16} /> जाहिरात पहा
                                    </a>
                                  )}
                                  {ad.applyLink && (
                                    <a href={ad.applyLink} target="_blank" rel="noopener noreferrer" className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest text-center hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all flex items-center justify-center gap-2">
                                      <ExternalLink size={16} /> अर्ज करा
                                    </a>
                                  )}
                                </div>
                             </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {filteredAds.length === 0 && (
            <div className="text-center py-24 bg-white">
              <Briefcase className="w-16 h-16 text-slate-100 mx-auto mb-4" />
              <p className="text-xl font-black text-slate-300 italic">जाहीराती उपलब्ध नाहीत.</p>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="bg-slate-900 p-6 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-slate-800">
               <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-2 text-white font-black text-xs uppercase tracking-widest disabled:opacity-30 disabled:cursor-not-allowed hover:text-blue-400 transition-colors"
               >
                <ChevronLeft /> Previous Page (मागे)
               </button>
               
               <div className="flex gap-2">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button 
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-10 h-10 rounded-xl font-black transition-all ${currentPage === i + 1 ? 'bg-blue-600 text-white shadow-xl scale-110' : 'bg-slate-800 text-slate-500 hover:bg-slate-700'}`}
                    >
                      {i + 1}
                    </button>
                  ))}
               </div>

               <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-2 text-white font-black text-xs uppercase tracking-widest disabled:opacity-30 disabled:cursor-not-allowed hover:text-blue-400 transition-colors"
               >
                Next Page (पुढे) <ChevronRight />
               </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
