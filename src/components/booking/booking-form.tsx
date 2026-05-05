'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Calendar, Clock, User, Mail, Phone, Palette, Ruler, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

const bookingSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number is required'),
  style: z.string().min(1, 'Style is required'),
  size: z.string().min(1, 'Size is required'),
  placement: z.string().min(1, 'Placement is required'),
  artistId: z.string().min(1, 'Artist is required'),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  description: z.string().optional(),
});

type BookingValues = z.infer<typeof bookingSchema>;

const STYLES = [
  'Traditional', 'Realism', 'Blackwork', 'Fine Line', 
  'Neo Traditional', 'Japanese', 'Tribal', 'Other'
];

const SIZES = [
  'Small (< 2")', 'Medium (2-5")', 'Large (5-10")', 'Extra Large (> 10")'
];

const PLACEMENTS = [
  'Arm', 'Leg', 'Back', 'Chest', 'Ribs', 'Hand', 'Foot', 'Neck', 'Head', 'Other'
];

export function BookingForm() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [artists, setArtists] = useState<any[]>([]);

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const response = await fetch('/api/artists');
        const data = await response.json();
        if (Array.isArray(data)) {
          setArtists(data);
        }
      } catch (error) {
        console.error('Failed to fetch artists:', error);
      }
    };
    fetchArtists();
  }, []);

  const { register, handleSubmit, formState: { errors }, watch } = useForm<BookingValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      style: '',
      size: '',
      placement: '',
      artistId: '',
    }
  });

  const onSubmit = async (data: BookingValues) => {
    setIsSubmitting(true);
    console.log('Form data:', data);
    
    // Step 1: Create client and appointment (pending)
    // Step 2: Create Stripe Checkout Session
    // Step 3: Redirect to Stripe
    
    try {
      const response = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      if (result.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      console.error('Booking error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-lg mx-auto p-4 bg-white rounded-xl shadow-sm border border-zinc-100">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-zinc-900">Book Your Tattoo</h2>
        <p className="text-zinc-500">Tell us about your next piece.</p>
      </div>

      <div className="flex gap-2 mb-8">
        {[1, 2, 3].map((i) => (
          <div 
            key={i} 
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors",
              step >= i ? "bg-black" : "bg-zinc-100"
            )} 
          />
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <User size={16} /> Full Name
            </label>
            <input 
              {...register('name')}
              className="w-full p-3 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-black/5"
              placeholder="John Doe"
            />
            {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Mail size={16} /> Email
            </label>
            <input 
              {...register('email')}
              className="w-full p-3 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-black/5"
              placeholder="john@example.com"
            />
            {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Phone size={16} /> Phone
            </label>
            <input 
              {...register('phone')}
              className="w-full p-3 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-black/5"
              placeholder="+1 (555) 000-0000"
            />
            {errors.phone && <p className="text-red-500 text-xs">{errors.phone.message}</p>}
          </div>

          <button 
            type="button" 
            onClick={nextStep}
            className="w-full py-4 bg-black text-white rounded-lg font-semibold hover:bg-zinc-800 transition-colors"
          >
            Next: Tattoo Details
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Palette size={16} /> Tattoo Style
            </label>
            <select 
              {...register('style')}
              className="w-full p-3 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-black/5 bg-white"
            >
              <option value="">Select a style</option>
              {STYLES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            {errors.style && <p className="text-red-500 text-xs">{errors.style.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Ruler size={16} /> Size
              </label>
              <select 
                {...register('size')}
                className="w-full p-3 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-black/5 bg-white"
              >
                <option value="">Select size</option>
                {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              {errors.size && <p className="text-red-500 text-xs">{errors.size.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <MapPin size={16} /> Placement
              </label>
              <select 
                {...register('placement')}
                className="w-full p-3 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-black/5 bg-white"
              >
                <option value="">Select placement</option>
                {PLACEMENTS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              {errors.placement && <p className="text-red-500 text-xs">{errors.placement.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description & Ideas</label>
            <textarea 
              {...register('description')}
              className="w-full p-3 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-black/5 min-h-[100px]"
              placeholder="Tell us about your design idea..."
            />
          </div>

          <div className="flex gap-4">
            <button 
              type="button" 
              onClick={prevStep}
              className="flex-1 py-4 bg-zinc-100 text-zinc-900 rounded-lg font-semibold hover:bg-zinc-200 transition-colors"
            >
              Back
            </button>
            <button 
              type="button" 
              onClick={nextStep}
              className="flex-1 py-4 bg-black text-white rounded-lg font-semibold hover:bg-zinc-800 transition-colors"
            >
              Next: Choose Artist
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <User size={16} /> Preferred Artist
            </label>
            <select 
              {...register('artistId')}
              className="w-full p-3 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-black/5 bg-white"
            >
              <option value="">Select an artist</option>
              {artists.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
            {errors.artistId && <p className="text-red-500 text-xs">{errors.artistId.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Calendar size={16} /> Date
              </label>
              <input 
                type="date"
                {...register('date')}
                className="w-full p-3 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-black/5"
              />
              {errors.date && <p className="text-red-500 text-xs">{errors.date.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Clock size={16} /> Time
              </label>
              <input 
                type="time"
                {...register('time')}
                className="w-full p-3 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-black/5"
              />
              {errors.time && <p className="text-red-500 text-xs">{errors.time.message}</p>}
            </div>
          </div>

          <div className="p-4 bg-zinc-50 rounded-lg border border-zinc-100 space-y-2">
            <p className="text-sm font-medium">Deposit Required: $50.00</p>
            <p className="text-xs text-zinc-500">A non-refundable deposit is required to secure your appointment. This will be deducted from your final price.</p>
          </div>

          <div className="flex gap-4">
            <button 
              type="button" 
              onClick={prevStep}
              className="flex-1 py-4 bg-zinc-100 text-zinc-900 rounded-lg font-semibold hover:bg-zinc-200 transition-colors"
            >
              Back
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1 py-4 bg-black text-white rounded-lg font-semibold hover:bg-zinc-800 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Processing...' : 'Pay Deposit & Book'}
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
