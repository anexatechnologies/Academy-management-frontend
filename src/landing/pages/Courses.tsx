import { motion } from 'motion/react';
import { Search, Star, Clock, BookOpen, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { COURSES } from '../constants';
import { useState, useEffect } from 'react';

const Courses = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [content, setContent] = useState(() => {
    const saved = localStorage.getItem('pawan_content');
    const data = saved ? JSON.parse(saved) : null;
    return data?.academics || {
      title: "शैक्षणिक उपक्रम (Academics)",
      text: "आम्ही प्रामुख्याने पोलीस भरती, तलाठी भरती, आणि MPSC परीक्षेसाठी विशेष बॅचेस घेतो."
    };
  });

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'pawan_content' && e.newValue) {
        try {
          const data = JSON.parse(e.newValue);
          if (data?.academics) setContent(data.academics);
        } catch (err) {}
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const categories = ['All', 'Mathematics', 'Science', 'History', 'Technology', 'Arts'];

  const filteredCourses = COURSES.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight uppercase">{content.title}</h1>
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm inline-block">
               <p className="text-xl text-indigo-600 max-w-2xl leading-relaxed whitespace-pre-wrap font-bold italic">
                 {content.text}
               </p>
            </div>
            <p className="text-lg text-gray-500 mt-6 max-w-2xl leading-relaxed font-medium">
              Discover your next learning adventure. Choose from a wide range of subjects taught by industry experts.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-6 mb-12 items-center justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search for courses..."
              className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex overflow-x-auto w-full md:w-auto pb-4 md:pb-0 gap-2 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-3 rounded-full font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-600 hover:text-indigo-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map((course, idx) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="group bg-white rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col h-full overflow-hidden"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img 
                  src={course.thumbnail} 
                  alt={course.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-indigo-600 shadow-sm uppercase tracking-wider">
                    {course.category}
                  </span>
                </div>
              </div>
              
              <div className="p-8 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex text-yellow-500">
                    <Star size={16} fill="currentColor" />
                  </div>
                  <span className="text-sm font-bold text-gray-900">{course.rating}</span>
                  <span className="text-gray-400 text-sm font-medium">• 1.2k Students</span>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors line-clamp-1">
                  {course.title}
                </h3>
                
                <p className="text-gray-500 text-sm mb-8 line-clamp-2 leading-relaxed">
                  {course.description}
                </p>

                <div className="mt-auto">
                  <div className="flex items-center gap-4 py-6 border-y border-gray-50 mb-6">
                    <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                      <Clock size={16} />
                      12h 30m
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                      <BookOpen size={16} />
                      {course.lessons.length} Lessons
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Tuition</span>
                      <span className="text-2xl font-bold text-gray-900">${course.price}</span>
                    </div>
                    <Link 
                      to={`/academics/${course.id}`}
                      className="bg-gray-900 text-white p-4 rounded-2xl hover:bg-indigo-600 transition-colors shadow-lg hover:shadow-indigo-100"
                    >
                      <ChevronRight size={24} />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <div className="py-20 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-500">Try adjusting your search or filter to find what you're looking for.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;
