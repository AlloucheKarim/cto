'use client';

import { useState } from 'react';

export default function LeadIntakeForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, source: 'web' }),
      });
      if (res.ok) setSuccess(true);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return <div className="p-4 bg-green-100 text-green-800 rounded">Thanks! We'll be in touch within 2 minutes.</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto p-6 bg-white rounded-lg shadow-md border border-gray-200">
      <h2 className="text-xl font-bold mb-4">Inquire About a Tattoo</h2>
      <div>
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <input name="name" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Phone or Email</label>
        <input name="contactInfo" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Style Interest</label>
        <select name="styleInterest" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
          <option>Traditional</option>
          <option>Realism</option>
          <option>Blackwork</option>
          <option>Minimalist</option>
          <option>Other</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Budget Range</label>
        <input name="budgetRange" placeholder="e.g. $200 - $500" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Timeline</label>
        <input name="timeline" placeholder="e.g. Next 2 weeks" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Message</label>
        <textarea name="message" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
      </div>
      <button disabled={loading} type="submit" className="w-full bg-black text-white p-2 rounded-md hover:bg-gray-800 transition-colors">
        {loading ? 'Sending...' : 'Send Inquiry'}
      </button>
    </form>
  );
}
