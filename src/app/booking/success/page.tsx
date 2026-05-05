import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

export default function BookingSuccessPage() {
  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-zinc-100 text-center space-y-6">
        <div className="flex justify-center">
          <CheckCircle size={64} className="text-green-500" />
        </div>
        <h1 className="text-3xl font-bold text-zinc-900">Booking Confirmed!</h1>
        <p className="text-zinc-600">
          Your deposit has been received and your appointment is scheduled. 
          You will receive an SMS confirmation shortly with further details.
        </p>
        <div className="pt-4">
          <Link 
            href="/"
            className="inline-block w-full py-4 bg-black text-white rounded-lg font-semibold hover:bg-zinc-800 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
