import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { COURSES } from '../constants';
import { PlayCircle, Clock, Star, Users, CheckCircle, ChevronRight, Lock, BookOpen } from 'lucide-react';

const CourseDetail = () => {
  const { id } = useParams();
  const course = COURSES.find(c => c.id === id);

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Course not found</h2>
          <Link to="/academics" className="text-indigo-600 font-bold hover:underline">Back to all courses</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative py-20 bg-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img src={course.thumbnail} className="w-full h-full object-cover blur-2xl" alt="Background" referrerPolicy="no-referrer" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <nav className="flex gap-2 text-sm text-gray-400 mb-8 font-medium">
                <Link to="/academics" className="hover:text-white transition-colors">Courses</Link>
                <span>/</span>
                <span className="text-indigo-400">{course.category}</span>
              </nav>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">{course.title}</h1>
              <p className="text-xl text-gray-300 mb-10 leading-relaxed max-w-xl">
                {course.description}
              </p>
              
              <div className="flex flex-wrap gap-8 mb-10">
                <div className="flex items-center gap-3">
                  <div className="flex text-yellow-400">
                    {[1, 2, 3, 4, 5].map(i => <Star key={i} size={18} fill="currentColor" />)}
                  </div>
                  <span className="font-bold">{course.rating}</span>
                  <span className="text-gray-400">(2,450 ratings)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={20} className="text-indigo-400" />
                  <span className="font-medium text-gray-200">12,405 students enrolled</span>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm self-start">
                <img src={`https://i.pravatar.cc/100?u=${course.instructor}`} className="w-12 h-12 rounded-full border-2 border-indigo-500" alt={course.instructor} referrerPolicy="no-referrer" />
                <div>
                  <p className="text-xs text-gray-400 uppercase font-bold tracking-widest mb-0.5">Instructor</p>
                  <p className="font-bold text-lg">{course.instructor}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative"
            >
              <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 text-gray-900 relative">
                <div className="mb-8 rounded-3xl overflow-hidden shadow-lg aspect-video relative group cursor-pointer">
                  <img src={course.thumbnail} className="w-full h-full object-cover" alt="Preview" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-colors">
                    <PlayCircle size={64} className="text-white drop-shadow-lg" />
                  </div>
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-gray-900 shadow-sm">
                    Course Preview
                  </div>
                </div>

                <div className="flex items-end gap-3 mb-8">
                  <span className="text-4xl font-bold tracking-tight">${course.price}</span>
                  <span className="text-gray-400 line-through mb-1.5">$99.99</span>
                  <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded text-xs font-bold mb-2">50% OFF</span>
                </div>

                <button className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 mb-4">
                  Enroll Now
                </button>
                <p className="text-center text-xs text-gray-500 font-medium">30-Day Money-Back Guarantee</p>
                
                <div className="mt-8 space-y-4">
                  <h4 className="font-bold text-gray-900 border-b border-gray-100 pb-4">This course includes:</h4>
                  {[
                    { icon: PlayCircle, text: "12.5 hours on-demand video" },
                    { icon: BookOpen, text: "15 downloadable resources" },
                    { icon: CheckCircle, text: "Full lifetime access" },
                    { icon: Award, text: "Certificate of completion" }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-gray-600 text-sm font-medium">
                      <item.icon size={18} className="text-indigo-600" />
                      {item.text}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Curriculum */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 tracking-tight">Course Curriculum</h2>
            <div className="space-y-4">
              {course.lessons.map((lesson, idx) => (
                <div key={lesson.id} className="group border border-gray-200 rounded-2xl p-6 hover:bg-gray-50 transition-all flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <span className="text-2xl font-bold text-gray-200 group-hover:text-indigo-200 transition-colors">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">{lesson.title}</h4>
                      <div className="flex items-center gap-4 text-xs text-gray-500 uppercase font-bold tracking-widest">
                        <span className="flex items-center gap-1.5"><Clock size={12} /> {lesson.duration}</span>
                        <span className="flex items-center gap-1.5 text-green-600"><PlayCircle size={12} /> Video Lesson</span>
                      </div>
                    </div>
                  </div>
                  {idx === 0 ? (
                    <button className="text-indigo-600 font-bold text-sm bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100">
                      Preview
                    </button>
                  ) : (
                    <div className="text-gray-400">
                      <Lock size={20} />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 tracking-tight">What you'll learn</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  "Comprehensive understanding of core concepts",
                  "Practical application of theoretical knowledge",
                  "Step-by-step problem-solving methodologies",
                  "Expert industry tips and tricks",
                  "High-level strategic analysis skills",
                  "Portfolio-building project experience"
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 p-4 border border-gray-100 rounded-2xl bg-gray-50/50">
                    <CheckCircle className="text-indigo-600 flex-shrink-0" size={20} />
                    <span className="text-sm font-medium text-gray-700 leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="sticky top-28 space-y-8">
              <div className="p-8 rounded-[2.5rem] bg-indigo-50 border border-indigo-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-100/50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700"></div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 relative">Ready to start?</h3>
                <p className="text-gray-600 mb-8 relative leading-relaxed">
                  Join our community of over 10,000 students and start your journey today.
                </p>
                <button className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-lg relative">
                  Enroll in Course
                </button>
              </div>

              <div className="p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
                <h3 className="font-bold text-gray-900">Scholarship Available</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  We believe education should be accessible. Apply for our merit-based scholarship program today.
                </p>
                <Link to="/contact" className="text-indigo-600 font-bold flex items-center gap-2 text-sm group">
                  Apply Now <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import { Award } from 'lucide-react';

export default CourseDetail;
