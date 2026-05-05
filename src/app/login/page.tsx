import AuthForm from './AuthForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="mb-8 flex flex-col items-center">
        <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mb-4 shadow-lg rotate-3">
          <span className="text-white text-3xl font-black italic">T</span>
        </div>
        <h2 className="text-xl font-bold tracking-tight text-gray-900 uppercase">
          Tattoo Shop Manager
        </h2>
      </div>
      
      <AuthForm />
      
      <p className="mt-8 text-gray-400 text-xs uppercase tracking-widest">
        Powered by Ink Business AI
      </p>
    </div>
  );
}
