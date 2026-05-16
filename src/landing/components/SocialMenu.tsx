import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Share2, Youtube, Instagram, Send, MessageCircle, MessageSquare, Smartphone, X } from 'lucide-react';

const socialLinks = [
  { icon: <Youtube className="w-5 h-5 text-red-600" />, href: "https://youtube.com/@Pawan_Academy", label: "YouTube" },
  { icon: <Send className="w-5 h-5 text-blue-500" />, href: "https://t.me/pawan_academy", label: "Telegram" },
  { icon: <Instagram className="w-5 h-5 text-pink-600" />, href: "https://www.instagram.com/pawan_academy", label: "Instagram" },
  { icon: <MessageCircle className="w-5 h-5 text-orange-500" />, href: "https://aratt.ai/@pawan_academy", label: "Arattai" },
  { icon: <MessageSquare className="w-5 h-5 text-green-500" />, href: "https://wa.me/919021445353?text=Hii", label: "Chatbot" },
  { icon: <Smartphone className="w-5 h-5 text-blue-600" />, href: "https://play.google.com/store/apps/details?id=co.tarly.ctygi", label: "App" },
];

export default function SocialMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <div className="fixed right-4 bottom-4 sm:right-6 sm:bottom-6 z-[9999] flex items-center justify-center">
      <AnimatePresence>
        {isOpen && (
          <div className="absolute bottom-full mb-6 flex flex-col items-center gap-4">
            {socialLinks.map((link, index) => (
              <motion.a
                key={index}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ scale: 0, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0, y: 20, opacity: 0 }}
                transition={{ 
                  delay: (socialLinks.length - 1 - index) * 0.05,
                  type: 'spring', 
                  stiffness: 300, 
                  damping: 25 
                }}
                className="bg-white p-3.5 sm:p-4 rounded-2xl shadow-2xl border border-gray-100 hover:bg-orange-50 flex items-center justify-center group relative shadow-orange-200/20"
                title={link.label}
              >
                <div className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center">
                  {link.icon}
                </div>
                <span className="absolute right-full mr-4 bg-gray-900 px-3 py-1.5 rounded-xl text-white text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100 whitespace-nowrap pointer-events-none shadow-2xl border border-white/10">
                  {link.label}
                </span>
              </motion.a>
            ))}
          </div>
        )}
      </AnimatePresence>

      <button
        onClick={toggleMenu}
        className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 z-10 border-4 border-white ${isOpen ? 'bg-red-500 rotate-[450deg]' : 'bg-orange-500 hover:scale-110 active:scale-90 hover:rotate-12'}`}
      >
        {isOpen ? <X className="text-white w-7 h-7" /> : <Share2 className="text-white w-7 h-7" />}
      </button>
    </div>
  );
}
