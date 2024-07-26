'use client';

import { useState, useEffect } from 'react';
import { FiMoreVertical } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

type Student = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
};

type Subject = {
  id: number;
  name: string;
  students?: Student[];
};

type SubjectsProps = {
  students: Student[];
  subjects: Subject[];
  setSubjects: React.Dispatch<React.SetStateAction<Subject[]>>;
  assignments: { [key: number]: number[] };
  setAssignments: React.Dispatch<React.SetStateAction<{ [key: number]: number[] }>>;
};

export default function Subjects({
  students,
  subjects,
  setSubjects,
  assignments,
  setAssignments,
}: SubjectsProps) {
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [subjectName, setSubjectName] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [optionsMenuOpen, setOptionsMenuOpen] = useState<number | null>(null);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await fetch('http://localhost:8080/subjects', {
          headers: {
            Authorization: `Bearer ${document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1")}`
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setSubjects(data);
      } catch (error) {
        console.error("Error fetching subjects:", error);
      }
    };

    fetchSubjects();
  }, []);

  const handleAddSubject = async () => {
    if (subjectName) {
      const newSubject = { name: subjectName };
      try {
        const response = await fetch('http://localhost:8080/subjects/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1")}`
          },
          body: JSON.stringify(newSubject),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const createdSubject = await response.json();
        setSubjects([...subjects, createdSubject]);
        setSubjectName('');
        setIsAddModalOpen(false);
      } catch (error) {
        console.error("Failed to add subject:", error);
      }
    }
  };

  const handleEditSubject = async () => {
    if (selectedSubject && subjectName) {
      const updatedSubject = { id: selectedSubject.id, name: subjectName };
      try {
        const response = await fetch('http://localhost:8080/subjects/update', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1")}`
          },
          body: JSON.stringify(updatedSubject),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setSubjects(subjects.map((subject) => (subject.id === selectedSubject.id ? data : subject)));
        setSubjectName('');
        setIsEditModalOpen(false);
        setSelectedSubject(null);
        setOptionsMenuOpen(null); // Close options menu
      } catch (error) {
        console.error("Failed to edit subject:", error);
      }
    }
  };

  const confirmDeleteSubject = (subject: Subject) => {
    setSelectedSubject(subject);
    setIsDeleteModalOpen(true);
    setOptionsMenuOpen(null); // Close options menu
  };

  const handleDeleteSubject = async () => {
    if (selectedSubject) {
      try {
        const response = await fetch('http://localhost:8080/subjects/delete', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1")}`
          },
          body: JSON.stringify({ id: selectedSubject.id }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        setSubjects(subjects.filter((subject) => subject.id !== selectedSubject.id));
        setIsDeleteModalOpen(false);
        setSelectedSubject(null);
      } catch (error) {
        console.error("Failed to delete subject:", error);
      }
    }
  };

  const handleAssignSubject = (subject: Subject) => {
    setSelectedSubject(subject);
    setSelectedStudents(assignments[subject.id] || []);
    setIsAssignModalOpen(true);
    setSelectAll(false); // Reset select all when opening the modal
  };

  const assignSubjectToStudents = async () => {
    if (selectedSubject) {
      try {
        const response = await fetch('http://localhost:8080/subjects/assign', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1")}`
          },
          body: JSON.stringify({ subjectId: selectedSubject.id, studentIds: selectedStudents }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        await response.json();

        setAssignments({
          ...assignments,
          [selectedSubject.id]: selectedStudents,
        });
        setSelectedStudents([]);
        setIsAssignModalOpen(false);
      } catch (error) {
        console.error("Failed to assign students to subject:", error);
      }
    }
  };

  const toggleStudentSelection = (studentId: number) => {
    setSelectedStudents((prevSelected) =>
      prevSelected.includes(studentId)
        ? prevSelected.filter((id) => id !== studentId)
        : [...prevSelected, studentId]
    );
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.map((student) => student.id));
    }
    setSelectAll(!selectAll);
  };

  const openEditModal = (subject: Subject) => {
    setSelectedSubject(subject);
    setSubjectName(subject.name);
    setIsEditModalOpen(true);
    setOptionsMenuOpen(null); // Close options menu
  };

  const handleOptionsClick = (subjectId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    setOptionsMenuOpen(optionsMenuOpen === subjectId ? null : subjectId);
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.07 } },
    exit: { opacity: 0, scale: 0.8, transition: { duration: 0.07 } },
  };

  return (
    <div>
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

        .button-gray {
          background-color: #5f6368;
        }

        .button-gray:hover {
          background-color: #3c4043;
        }

        .modal {
          background: #4a4a4a;
          padding: 1.5rem;
          border-radius: 0.375rem;
          width: 320px;
          max-width: 90%;
        }

        .options-menu {
          position: absolute;
          right: 1rem;
          top: 2rem;
          background: #40414F;
          border-radius: 0.375rem;
          padding: 0.3rem 0;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          z-index: 10;
        }

        .options-menu button {
          display: block;
          width: 100%;
          text-align: left;
          padding: 0.5rem 1rem;
          background: none;
          border: none;
          color: white;
          cursor: pointer;
        }

        .options-menu button:hover {
          background-color: #555555;
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
        <h2 className="text-2xl font-bold">Subjects List</h2>
        <button onClick={() => setIsAddModalOpen(true)} className="button">
          Add Subject
        </button>
      </div>
      <div className="max-h-[600px] overflow-y-auto scrollbar-thin">
        <ul className="space-y-8"> {/* Increase gap between subjects */}
          {subjects.map((subject) => (
            <li
              key={subject.id}
              className="bg-gray-700 text-white p-4 rounded relative cursor-pointer"
              onClick={() => handleAssignSubject(subject)}
            >
              <div className="flex justify-between items-center">
                <span>{subject.name}</span>
                <button
                  onClick={(e) => handleOptionsClick(subject.id, e)}
                  className="button button-gray"
                >
                  <FiMoreVertical />
                </button>
                {optionsMenuOpen === subject.id && (
                  <div className="options-menu" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => openEditModal(subject)}>Edit</button>
                    <button onClick={() => confirmDeleteSubject(subject)}>Delete</button>
                  </div>
                )}
              </div>
              <div className="mt-2">
                <ul>
                  {(subject.students || []).map((student) => (
                    <li key={student.id} className="bg-gray-600 text-white p-1 rounded mb-1">
                      {student.firstName} {student.lastName}
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <AnimatePresence>
        {isAssignModalOpen && selectedSubject && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <motion.div
              className="modal bg-slate-600 p-3 rounded-lg"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <h2 className="text-2xl font-bold mb-4">Assign Subject: {selectedSubject.name}</h2>
              <div className="mb-4 max-h-[300px] overflow-y-auto scrollbar-thin">
                <div className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id="select-all"
                    checked={selectAll}
                    onChange={toggleSelectAll}
                    className="mr-2"
                  />
                  <label htmlFor="select-all" className="text-white">Select All</label>
                </div>
                {students.map((student) => (
                  <div key={student.id} className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      id={`student-${student.id}`}
                      checked={selectedStudents.includes(student.id)}
                      onChange={() => toggleStudentSelection(student.id)}
                      className="mr-2"
                    />
                    <label htmlFor={`student-${student.id}`} className="text-white">
                      {student.firstName} {student.lastName}
                    </label>
                  </div>
                ))}
              </div>
              <div className="flex justify-end mt-4">
                <button onClick={assignSubjectToStudents} className="button">
                  Assign Subject
                </button>
                <button
                  onClick={() => setIsAssignModalOpen(false)}
                  className="ml-2 button button-red"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <motion.div
              className="modal bg-slate-600 p-3 rounded-lg"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <h2 className="text-2xl font-bold mb-4">Add Subject</h2>
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Subject Name"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  className="bg-gray-700 text-white p-2 rounded mb-2 w-full"
                />
                <div className="flex justify-end mt-4">
                  <button onClick={handleAddSubject} className="button">
                    Add Subject
                  </button>
                  <button
                    onClick={() => setIsAddModalOpen(false)}
                    className="ml-2 button button-red"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isEditModalOpen && selectedSubject && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <motion.div
              className="modal bg-slate-600 p-3 rounded-lg"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <h2 className="text-2xl font-bold mb-4">Edit Subject</h2>
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Subject Name"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  className="bg-gray-700 text-white p-2 rounded mb-2 w-full"
                />
                <div className="flex justify-end mt-4">
                  <button onClick={handleEditSubject} className="button">
                    Save Changes
                  </button>
                  <button
                    onClick={() => setIsEditModalOpen(false)}
                    className="ml-2 button button-gray"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <motion.div
              className="modal bg-slate-600 p-3 rounded-lg"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <h2 className="text-2xl font-bold mb-4">Confirm Delete</h2>
              <p className="mb-4">Are you sure you want to delete this subject?</p>
              <div className="flex justify-end mt-4">
                <button onClick={handleDeleteSubject} className="button button-red">
                  Delete
                </button>
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="ml-2 button button-gray"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
