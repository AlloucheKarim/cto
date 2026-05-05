'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Loader2 } from 'lucide-react';
import { PDFGenerator } from '@/components/booking/pdf-generator';

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [appointment, setAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (sessionId) {
      fetch(`/api/booking/${sessionId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            setError(true);
          } else {
            setAppointment(data);
          }
        })
        .catch(() => setError(true))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
      setError(true);
    }
  }, [sessionId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-zinc-400" size={48} />
        <p className="text-zinc-500">Retrieving booking details...</p>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold text-red-600">Something went wrong</h1>
        <p className="text-zinc-600">We couldn't retrieve your booking details, but don't worry, your deposit was processed.</p>
        <Link href="/" className="inline-block py-2 px-4 bg-black text-white rounded-lg">Go Home</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <CheckCircle size={64} className="text-green-500" />
      </div>
      <h1 className="text-3xl font-bold text-zinc-900">Booking Confirmed!</h1>
      <p className="text-zinc-600">
        Hi {appointment.clientName}, your appointment with {appointment.artistName} is confirmed for {appointment.dateTime}.
      </p>
      
      <div className="pt-4 border-t border-zinc-100">
        <PDFGenerator appointment={appointment} />
      </div>

      <div className="pt-2">
        <Link 
          href="/"
          className="inline-block w-full py-4 bg-black text-white rounded-lg font-semibold hover:bg-zinc-800 transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default function BookingSuccessPage() {
  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-zinc-100 text-center">
        <Suspense fallback={<Loader2 className="animate-spin text-zinc-400 mx-auto" size={48} />}>
          <SuccessContent />
        </Suspense>
      </div>
    </div>
  );
}
