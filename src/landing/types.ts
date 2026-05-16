export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  thumbnail: string;
  category: string;
  price: number;
  rating: number;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  content: string;
  duration: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  enrolledCourses: string[]; // IDs of courses
}
