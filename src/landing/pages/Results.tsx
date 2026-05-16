import React from 'react';
import { Trophy, ExternalLink, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

export default function Results() {
  const [results, setResults] = React.useState(() => {
    try {
      const saved = localStorage.getItem('pawan_external_results');
      return saved ? JSON.parse(saved) : [
        { id: 2, title: 'राज्य उत्पादन शुल्क भरती - गुणवत्ता यादी', link: 'https://pawanacademy.in/results/2' },
        { id: 1, title: 'पोलीस भरती २०२४ - जालना जिल्हा निकाल', link: 'https://pawanacademy.in/results/1' }
      ];
    } catch (e) {
      return [];
    }
  });

  React.useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'pawan_external_results' && e.newValue) {
        try {
          setResults(JSON.parse(e.newValue));
        } catch (e) {}
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 shadow-inner">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 text-white rounded-3xl shadow-xl shadow-blue-100 mb-6 motion-safe:animate-bounce">
            <Trophy size={40} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight uppercase">निकाल (Results)</h1>
          <div className="w-24 h-1.5 bg-blue-600 mx-auto rounded-full mb-4"></div>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] md:text-xs italic">पवन अकॅडमी - यशाची परंपरा अविरत चालू!</p>
        </div>

        {/* Results List */}
        <div className="space-y-6">
          {results.map((r: any, idx: number) => (
            <motion.a
              key={r.id}
              href={r.link}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group block bg-white p-6 md:p-8 rounded-[2.5rem] border-2 border-transparent hover:border-blue-500 hover:shadow-2xl transition-all relative overflow-hidden"
            >
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-start gap-5">
                   <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                     <ExternalLink size={24} />
                   </div>
                   <div>
                     <h2 className="text-xl md:text-2xl font-black text-slate-800 leading-tight mb-2 group-hover:text-blue-600 transition-colors">{r.title}</h2>
                     <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                       <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-200"></span>
                       निकाल उपलब्ध आहे • क्लिक करा
                     </div>
                   </div>
                </div>
                <div className="hidden sm:flex items-center justify-center w-12 h-12 bg-slate-50 rounded-2xl text-slate-300 group-hover:bg-blue-50 group-hover:text-blue-500 transition-all">
                  <ChevronRight size={24} />
                </div>
              </div>
              
              {/* Background gradient on hover */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </motion.a>
          ))}

          {results.length === 0 && (
            <div className="text-center py-32 bg-white rounded-[3rem] border-4 border-dashed border-slate-100">
              <p className="text-slate-400 font-black italic uppercase tracking-widest text-sm">निकाल अद्याप अपडेट केलेले नाहीत.</p>
            </div>
          )}
        </div>

        {/* Footer Note */}
        <div className="mt-20 text-center">
           <p className="text-slate-400 font-medium italic text-sm">"प्रयत्न आणि सातत्य याच्या बळावरच यश संपादन करता येते."</p>
        </div>
      </div>
      
      {/* Decorative background */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:32px_32px] opacity-30"></div>
    </div>
  );
}
