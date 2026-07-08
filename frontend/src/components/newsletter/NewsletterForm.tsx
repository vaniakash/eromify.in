'use client';

import { useState } from 'react';
import { Mail, Loader2 } from 'lucide-react';

interface NewsletterFormProps {
  variant?: 'sidebar' | 'cta';
}

export default function NewsletterForm({ variant = 'sidebar' }: NewsletterFormProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setMessage('Please enter your email address.');
      setIsSuccess(false);
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage('Please enter a valid email address.');
      setIsSuccess(false);
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        setMessage(data.message || 'Successfully subscribed! Check your email for confirmation.');
        setEmail('');
        
        // Clear success message after 5 seconds
        setTimeout(() => {
          setMessage('');
          setIsSuccess(false);
        }, 5000);
      } else {
        setIsSuccess(false);
        setMessage(data.message || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      setIsSuccess(false);
      setMessage('Failed to subscribe. Please try again later.');
      console.error('Newsletter subscription error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (variant === 'cta') {
    return (
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your work email"
          className="flex-1 px-6 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1736cf] focus:border-[#1736cf] disabled:opacity-50"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="bg-[#1736cf] hover:bg-[#1430b8] text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg shadow-[#1736cf]/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Subscribing...
            </>
          ) : (
            'Join Eromify Inner Circle'
          )}
        </button>
        
        {message && (
          <div className={`sm:col-span-2 text-sm ${isSuccess ? 'text-green-400' : 'text-red-400'}`}>
            {message}
          </div>
        )}
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 relative z-10">
      <div className="relative">
        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@example.com"
          className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 bg-white text-sm outline-none focus:ring-2 focus:ring-[#1736cf]/20 focus:border-[#1736cf] disabled:opacity-50"
          disabled={isLoading}
        />
      </div>
      
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 bg-[#1736cf] text-white font-bold rounded-lg text-sm hover:bg-[#1430b8] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Subscribing...
          </>
        ) : (
          'Subscribe Now'
        )}
      </button>
      
      {message && (
        <div className={`text-xs text-center ${isSuccess ? 'text-green-600' : 'text-red-600'}`}>
          {message}
        </div>
      )}
    </form>
  );
}