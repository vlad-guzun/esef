'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Grade = {
  id: number;
  studentId: number;
  subjectId: number;
  grade: number;
};

type Student = {
  id: number;
  firstName: string;
  lastName: string;
};

type Subject = {
  id: number;
  name: string;
};

export default function Grades() {
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
  const [gradeValue, setGradeValue] = useState<number | null>(null);
  const [currentSubjectIndex, setCurrentSubjectIndex] = useState(0);
  const [listView, setListView] = useState(false);

  useEffect(() => {
    const fetchStudents = async () => {
      const response = await fetch('http://localhost:8080/students', {
        headers: {
          Authorization: `Bearer ${document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1")}`
        }
      });
      const data = await response.json();
      setStudents(data);
    };

    const fetchSubjects = async () => {
      const response = await fetch('http://localhost:8080/subjects', {
        headers: {
          Authorization: `Bearer ${document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1")}`
        }
      });
      const data = await response.json();
      setSubjects(data);
    };

    const fetchGrades = async () => {
      const response = await fetch('http://localhost:8080/grades', {
        headers: {
          Authorization: `Bearer ${document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1")}`
        }
      });
      const data = await response.json();
      setGrades(data);
    };

    fetchStudents();
    fetchSubjects();
    fetchGrades();
  }, []);

  const handleGradeClick = (student: Student, subject: Subject, grade: Grade | undefined) => {
    setSelectedStudent(student);
    setSelectedSubject(subject);
    setSelectedGrade(grade ?? null);
    setGradeValue(grade ? grade.grade : null);
    setIsEditModalOpen(true);
  };

  const handleSaveChanges = async () => {
    if (selectedStudent && selectedSubject && gradeValue !== null) {
      const existingGrade = grades.find(
        (grade) => grade.studentId === selectedStudent.id && grade.subjectId === selectedSubject.id
      );

      if (existingGrade) {
        const response = await fetch('http://localhost:8080/grades/update', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1")}`
          },
          body: JSON.stringify({ id: existingGrade.id, value: gradeValue })
        });
        const updatedGrade = await response.json();
        setGrades(grades.map(grade => grade.id === updatedGrade.id ? updatedGrade : grade));
      } else {
        const response = await fetch('http://localhost:8080/grades/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1")}`
          },
          body: JSON.stringify({ value: gradeValue, studentId: selectedStudent.id, subjectId: selectedSubject.id })
        });
        const newGrade = await response.json();
        setGrades([...grades, newGrade]);
      }

      setSelectedStudent(null);
      setSelectedSubject(null);
      setSelectedGrade(null);
      setGradeValue(null);
      setIsEditModalOpen(false);
    }
  };

  const handleRemoveGrade = async () => {
    if (selectedGrade) {
      const response = await fetch('http://localhost:8080/grades/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1")}`
        },
        body: JSON.stringify({ id: selectedGrade.id })
      });
      await response.json();
      setGrades(grades.filter(grade => grade.id !== selectedGrade.id));
      setSelectedStudent(null);
      setSelectedSubject(null);
      setSelectedGrade(null);
      setGradeValue(null);
      setIsEditModalOpen(false);
    }
  };

  const handleNextSubject = () => {
    setCurrentSubjectIndex((prevIndex) => (prevIndex + 1) % subjects.length);
  };

  const handlePrevSubject = () => {
    setCurrentSubjectIndex((prevIndex) => (prevIndex - 1 + subjects.length) % subjects.length);
  };

  const toggleListView = () => {
    setListView(!listView);
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.07 } },
    exit: { opacity: 0, scale: 0.8, transition: { duration: 0.07 } },
  };

  return (
    <div className="max-h-[700px] overflow-y-auto scrollbar-thin">
      <style jsx>{`
        .button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.5rem 1rem;
          font-size: 1rem;
          font-weight: 500;
          text-align: center;
          text-decoration: none;
          color: #ffffff;
          background-color: #1a73e8;
          border-radius: 0.375rem;
          transition: background-color 0.15s ease-in-out;
        }

        .button:hover {
          background-color: #0053a0;
        }

        .button-red {
          background-color: #ea4335;
        }

        .button-red:hover {
          background-color: #c5221f;
        }

        .modal {
          background: #40414F;
          padding: 2rem;
          border-radius: 0.375rem;
          width: 400px;
        }

        .table {
          width: 100%;
          border-collapse: collapse;
        }

        .table th, .table td {
          border: 1px solid #565869;
          padding: 0.5rem;
          text-align: left;
        }

        .table th {
          background-color: #343541;
        }

        .table td {
          background-color: #2C2D36;
        }

        .table td:hover {
          background-color: #1a73e8;
          cursor: pointer;
        }

        .table-container {
          max-height: 300px;
          overflow-y: auto;
          padding-right: 1rem; /* Add padding to move the scrollbar farther from the table */
        }

        /* Custom Scrollbar Styles */
        .scrollbar-thin {
          scrollbar-width: thin;
          scrollbar-color: #888888 #343541;
        }

        .scrollbar-thin::-webkit-scrollbar {
          width: 8px;
        }

        .scrollbar-thin::-webkit-scrollbar-track {
          background: #343541;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb {
          background-color: #888888;
          border-radius: 10px;
          border: 3px solid #343541;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background-color: #555555;
        }
      `}</style>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Grades</h2>
        <button onClick={toggleListView} className="button">
          {listView ? 'Overview' : 'Detailed View'}
        </button>
      </div>

      {listView && subjects.length > 0 ? (
        <>
          <div className="flex justify-between items-center mb-4">
            <button onClick={handlePrevSubject} className="button">
              Previous
            </button>
            <h3 className="text-xl font-bold mb-2">{subjects[currentSubjectIndex]?.name}</h3>
            <button onClick={handleNextSubject} className="button">
              Next
            </button>
          </div>
          <div className="table-container scrollbar-thin">
            <table className="table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Grade</th>
                </tr>
              </thead>
              <tbody>
                {students.filter((student) => grades.some((grade) => grade.studentId === student.id && grade.subjectId === subjects[currentSubjectIndex]?.id))
                  .map((student) => {
                    const grade = grades.find((g) => g.studentId === student.id && g.subjectId === subjects[currentSubjectIndex]?.id);
                    return (
                      <tr key={student.id}>
                        <td>{student.firstName} {student.lastName}</td>
                        <td onClick={() => handleGradeClick(student, subjects[currentSubjectIndex], grade)}>
                          {grade ? grade.grade : 'No grade'}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="max-h-[600px] overflow-y-auto scrollbar-thin pr-4"> {/* Add padding here to move the scrollbar */}
          <div className="overflow-x-auto"> {/* Add this wrapper for horizontal scrolling */}
            {subjects.length > 0 ? (
              subjects.map((subject) => (
                <div key={subject.id} className="mb-6">
                  <h3 className="text-xl font-bold mb-2">{subject.name}</h3>
                  <div className="table-container scrollbar-thin">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Student</th>
                          <th>Grade</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.filter((student) => grades.some((grade) => grade.studentId === student.id && grade.subjectId === subject.id))
                          .map((student) => {
                            const grade = grades.find((g) => g.studentId === student.id && g.subjectId === subject.id);
                            return (
                              <tr key={student.id}>
                                <td>{student.firstName} {student.lastName}</td>
                                <td onClick={() => handleGradeClick(student, subject, grade)}>
                                  {grade ? grade.grade : 'No grade'}
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))
            ) : (
              <p>No subjects available.</p>
            )}
          </div>
        </div>
      )}

      <AnimatePresence>
        {isEditModalOpen && selectedStudent && selectedSubject && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <motion.div
              className="modal bg-slate-600 p-2 rounded-lg"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <h2 className="text-2xl font-bold mb-4">
                Edit Grade for {selectedStudent.firstName} {selectedStudent.lastName} in {selectedSubject.name}
              </h2>
              <div className="mb-4">
                <input
                  type="number"
                  placeholder="Grade"
                  value={gradeValue ?? ''}
                  onChange={(e) => setGradeValue(Number(e.target.value))}
                  className="bg-gray-700 text-white p-2 rounded mb-2 w-full"
                />
                <div className="flex justify-end mt-4">
                  <button onClick={handleSaveChanges} className="button">
                    Save Changes
                  </button>
                  {selectedGrade && (
                    <button onClick={handleRemoveGrade} className="ml-2 button button-red">
                      Remove Grade
                    </button>
                  )}
                  <button onClick={() => setIsEditModalOpen(false)} className="ml-2 button button-red">
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
