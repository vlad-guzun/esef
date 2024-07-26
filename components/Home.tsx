import { PiStudentFill } from 'react-icons/pi';

type HomeProps = {
  onArrowClick: () => void;
};

export default function Home({ onArrowClick }: HomeProps) {
  return (
    <div className="flex flex-col items-center h-[500px] justify-center">
      <h2 className="text-3xl font-bold mb-4 text-slate-400">Students Catalog</h2>
      <PiStudentFill size={100} className="text-4xl text-slate-600 mb-4" />
      <button onClick={onArrowClick} className="text-slate-400">
        Go to Students
      </button>
    </div>
  );
}
