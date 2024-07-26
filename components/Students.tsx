import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Student = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
};

export default function Students() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch('http://localhost:8080/students', {
          headers: {
            Authorization: `Bearer ${document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1")}`
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setStudents(data);
      } catch (error) {
        console.error("Error fetching students:", error);
      }
    };

    fetchStudents();
  }, []);

  const handleAddStudent = async () => {
    if (firstName && lastName && email) {
      const newStudent = { firstName, lastName, email };
      try {
        const response = await fetch('http://localhost:8080/students/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1")}`
          },
          body: JSON.stringify(newStudent),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const createdStudent = await response.json();
        setStudents([...students, createdStudent]);
        setFirstName('');
        setLastName('');
        setEmail('');
        setIsAddModalOpen(false);
      } catch (error) {
        console.error("Failed to add student:", error);
      }
    }
  };

  const handleEditStudent = async () => {
    if (selectedStudent && firstName && lastName && email) {
      const updatedStudent = { id: selectedStudent.id, firstName, lastName, email };
      try {
        const response = await fetch('http://localhost:8080/students/update', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1")}`
          },
          body: JSON.stringify(updatedStudent),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setStudents(students.map((student) => (student.id === selectedStudent.id ? data : student)));
        setFirstName('');
        setLastName('');
        setEmail('');
        setIsEditModalOpen(false);
        setSelectedStudent(null);
      } catch (error) {
        console.error("Failed to edit student:", error);
      }
    }
  };

  const confirmDeleteStudent = (student: Student) => {
    setSelectedStudent(student);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteStudent = async () => {
    if (selectedStudent) {
      try {
        const response = await fetch('http://localhost:8080/students/delete', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1")}`
          },
          body: JSON.stringify({ id: selectedStudent.id }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        setStudents(students.filter((student) => student.id !== selectedStudent.id));
        setIsDeleteModalOpen(false);
        setSelectedStudent(null);
      } catch (error) {
        console.error("Failed to delete student:", error);
      }
    }
  };

  const openEditModal = (student: Student) => {
    setSelectedStudent(student);
    setFirstName(student.firstName);
    setLastName(student.lastName);
    setEmail(student.email);
    setIsEditModalOpen(true);
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.07 } },
    exit: { opacity: 0, scale: 0.8, transition: { duration: 0.07 } },
  };

  return (
    <div>
      <style jsx>{`
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
          background-color: #007aff;
          border-radius: 0.375rem;
          transition: background-color 0.15s ease-in-out;
        }

        .button:hover {
          background-color: #005bb5;
        }

        .button-red {
          background-color: #ff3b30;
        }

        .button-red:hover {
          background-color: #c53027;
        }

        .button-gray {
          background-color: #8e8e93;
        }

        .button-gray:hover {
          background-color: #6d6d72;
        }

        .modal {
          background: #1f1f1f;
          padding: 1.5rem;
          border-radius: 0.375rem;
          width: 320px;
          max-width: 90%;
        }

        .input {
          background-color: #343541;
          color: #ffffff;
          padding: 0.5rem;
          border-radius: 0.375rem;
          width: 100%;
          margin-bottom: 1rem;
          border: none;
        }

        .input::placeholder {
          color: #6b7280;
        }
      `}</style>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Students List</h2>
        <button onClick={() => setIsAddModalOpen(true)} className="button">
          Add Student
        </button>
      </div>
      <ul className="max-h-[500px] overflow-y-auto scrollbar-thin">
        {students.map((student) => (
          <li
            key={student.id}
            className="bg-gray-700 text-white p-2 rounded mb-2 cursor-pointer"
            onClick={() => openEditModal(student)}
          >
            {student.firstName} {student.lastName}, {student.email}
          </li>
        ))}
      </ul>
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60">
            <motion.div
              className="modal bg-slate-600 p-3 rounded-lg"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <h2 className="text-2xl font-bold mb-4">Add Student</h2>
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="input"
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="input"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                />
                <div className="flex justify-end mt-4">
                  <button onClick={handleAddStudent} className="button">
                    Add Student
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
        {isEditModalOpen && selectedStudent && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <motion.div
              className="modal bg-slate-600 p-3 rounded-lg"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <h2 className="text-2xl font-bold mb-4">Edit Student</h2>
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="input"
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="input"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                />
                <div className="flex justify-end mt-4">
                  <button onClick={handleEditStudent} className="button">
                    Save Changes
                  </button>
                  <button
                    onClick={() => confirmDeleteStudent(selectedStudent)}
                    className="ml-2 button button-red"
                  >
                    Delete Student
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
              <p className="mb-4">Are you sure you want to delete this student?</p>
              <div className="flex justify-end mt-4">
                <button onClick={handleDeleteStudent} className="button button-red">
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
