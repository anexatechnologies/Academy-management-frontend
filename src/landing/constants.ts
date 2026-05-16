import type { Course } from "./types";

export const COURSES: Course[] = [
  {
    id: "math-101",
    title: "Advanced Mathematics",
    description: "Master complex algebraic structures and calculus concepts with our deep dive course.",
    instructor: "Dr. Sarah Miller",
    thumbnail: "https://picsum.photos/seed/math/800/600",
    category: "Mathematics",
    price: 49.99,
    rating: 4.8,
    lessons: [
      { id: "m1", title: "Introduction to Calculus", content: "...", duration: "45m" },
      { id: "m2", title: "Derivatives Explained", content: "...", duration: "1h 10m" },
    ]
  },
  {
    id: "science-202",
    title: "Modern Physics & Quantum Mechanics",
    description: "Explore the fascinating world of quantum physics and the laws that govern the universe at the smallest scales.",
    instructor: "Prof. James Chen",
    thumbnail: "https://picsum.photos/seed/physics/800/600",
    category: "Science",
    price: 59.99,
    rating: 4.9,
    lessons: [
      { id: "p1", title: "The Dual Nature of Light", content: "...", duration: "55m" },
      { id: "p2", title: "Schrödinger's Equation", content: "...", duration: "1h 30m" },
    ]
  },
  {
    id: "history-303",
    title: "Global Civilizations",
    description: "A journey through the rise and fall of major civilizations that shaped our modern world.",
    instructor: "Dr. Elena Rodriguez",
    thumbnail: "https://picsum.photos/seed/history/800/600",
    category: "History",
    price: 39.99,
    rating: 4.7,
    lessons: [
      { id: "h1", title: "Ancient Mesopotamia", content: "...", duration: "50m" },
      { id: "h2", title: "The Roman Empire", content: "...", duration: "1h 05m" },
    ]
  }
];
