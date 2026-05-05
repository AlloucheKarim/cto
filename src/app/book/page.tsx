import { BookingForm } from '@/components/booking/booking-form';

export default function BookingPage() {
  return (
    <div className="min-h-screen bg-zinc-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <BookingForm />
      </div>
    </div>
  );
}
