'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Home from '../components/Home';
import Students from '../components/Students';
import Subjects from '../components/Subjects';
import Grades from '../components/Grades';
import AuthModal from '../components/AuthModal';
import LogoutButton from '../components/LogoutButton';

type Section = 'home' | 'students' | 'subjects' | 'grades';

type Student = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
};

type Subject = {
  id: number;
  name: string;
};

type Grade = {
  id: number;
  studentId: number;
  subjectId: number;
  grade: number;
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [section, setSection] = useState<Section | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [assignments, setAssignments] = useState<{ [key: number]: number[] }>({});
  const [grades, setGrades] = useState<Grade[]>([]);

  useEffect(() => {
    const token = document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1");
    if (token) {
      setIsAuthenticated(true);
    } else {
      setIsAuthModalOpen(true);
    }
  }, []);

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);
  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    closeAuthModal();
  };
  const handleLogout = () => {
    document.cookie = 'token=; Max-Age=0; path=/;';
    setIsAuthenticated(false);
    openAuthModal();
  };

  const renderSection = () => {
    switch (section) {
      case 'home':
        return <Home onArrowClick={() => setSection('students')} />;
      case 'students':
        return <Students students={students} setStudents={setStudents} />;
      case 'subjects':
        return (
          <Subjects
            students={students}
            subjects={subjects}
            setSubjects={setSubjects}
            assignments={assignments}
            setAssignments={setAssignments}
          />
        );
      case 'grades':
        return (
          <Grades
            students={students}
            subjects={subjects}
            assignments={assignments}
            grades={grades}
            setGrades={setGrades}
          />
        );
      default:
        return <p>Select an option to view content.</p>;
    }
  };

  const modalVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: 50, transition: { duration: 0.5 } },
  };

  const handleSectionClick = (newSection: Section) => {
    setSection(null); // Trigger unmount of the current section
    setTimeout(() => setSection(newSection), 0); // Delay setting the new section to allow the animation to play
  };

  return (
    <div className="flex min-h-screen bg-[#343541] text-white justify-center items-center relative">
      <div className="absolute top-4 right-4">
        {isAuthenticated && <LogoutButton onLogout={handleLogout} />}
      </div>
      <div className="flex gap-4">
        <AnimatePresence>
          {section && (
            <motion.div
              key="modal"
              className="w-[500px] h-[700px] bg-[#2C2D36] p-8 rounded-lg"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div>{renderSection()}</div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="w-[300px] h-[500px] bg-[#2C2D36] p-8 rounded-lg">
          <h1 className="text-3xl font-bold mb-4">Options</h1>
          <nav className="space-y-2">
            <button
              onClick={() => handleSectionClick('home')}
              className={`block py-2 px-2 w-full text-left rounded ${
                section === 'home' ? 'bg-[#565869]' : 'hover:bg-[#565869]'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => handleSectionClick('students')}
              className={`block py-2 px-2 w-full text-left rounded ${
                section === 'students' ? 'bg-[#565869]' : 'hover:bg-[#565869]'
              }`}
            >
              Students
            </button>
            <button
              onClick={() => handleSectionClick('subjects')}
              className={`block py-2 px-2 w-full text-left rounded ${
                section === 'subjects' ? 'bg-[#565869]' : 'hover:bg-[#565869]'
              }`}
            >
              Subjects
            </button>
            <button
              onClick={() => handleSectionClick('grades')}
              className={`block py-2 px-2 w-full text-left rounded ${
                section === 'grades' ? 'bg-[#565869]' : 'hover:bg-[#565869]'
              }`}
            >
              Grades
            </button>
          </nav>
        </div>
      </div>
      <AnimatePresence>
        {isAuthModalOpen && (
          <AuthModal onClose={closeAuthModal} onAuthSuccess={handleAuthSuccess} />
        )}
      </AnimatePresence>
    </div>
  );
}
