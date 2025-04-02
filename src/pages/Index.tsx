
import Calculator from '@/components/Calculator';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-indigo-900 to-black p-4">
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-8 text-center">
        Scientific Calculator
      </h1>
      <Calculator />
      <footer className="mt-8 text-center text-gray-400 text-sm">
        <p>Use the arrow buttons in the calculator header to toggle scientific mode and history</p>
        <p className="mt-2">Keyboard shortcuts available for basic operations</p>
      </footer>
    </div>
  );
};

export default Index;
