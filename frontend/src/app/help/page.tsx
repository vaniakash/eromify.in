"use client";

import React, { useState } from 'react';
import { Mail, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HelpPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [responseMessage, setResponseMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatus('success');
        setResponseMessage(data.message);
        setFormData({ name: '', email: '', subject: '', message: '' }); // Clear form
      } else {
        setStatus('error');
        setResponseMessage(data.message || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      setStatus('error');
      setResponseMessage('Failed to send message. Please check your connection and try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <main className="flex-grow max-w-4xl mx-auto w-full px-4 sm:px-6 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 sm:p-12">
          
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
              Help & Support Center
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Have a question or need assistance? Our support team is here to help. Check our FAQs or send us a message directly!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            
            {/* Left side: FAQs */}
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Frequently Asked Questions</h2>
              
              <section>
                <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                  Getting Started
                </h3>
                <div className="text-slate-600 space-y-4">
                  <p className="text-sm">
                    <strong>How do I create an account?</strong><br/>
                    Click on the "Register" button in the top right corner and follow the prompts to sign up using your email or Google account.
                  </p>
                  <p className="text-sm">
                    <strong>What is Eromify?</strong><br/>
                    Eromify is an advanced AI platform designed to help you create stunning, realistic AI influencers and manage their content effortlessly.
                  </p>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                  Credits & Billing
                </h3>
                <div className="text-slate-600 space-y-4">
                  <p className="text-sm">
                    <strong>How do credits work?</strong><br/>
                    Every image or video you generate consumes a certain amount of credits. You can view your remaining balance in the navigation bar when logged in.
                  </p>
                  <p className="text-sm">
                    <strong>Can I buy more credits?</strong><br/>
                    Yes! Simply click the "Buy" button next to your credit balance to explore our top-up options and subscription plans.
                  </p>
                </div>
              </section>
            </div>

            {/* Right side: Contact Form */}
            <div className="bg-slate-50 p-6 sm:p-8 rounded-xl border border-slate-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-[#1736cf]/10 p-2 rounded-lg">
                  <Mail className="h-6 w-6 text-[#1736cf]" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Contact Us</h2>
              </div>

              {status === 'success' ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center">
                  <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-emerald-900 mb-2">Message Sent!</h3>
                  <p className="text-emerald-700 text-sm">{responseMessage}</p>
                  <Button 
                    className="mt-6 w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => setStatus('idle')}
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {status === 'error' && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 shrink-0" />
                      <p>{responseMessage}</p>
                    </div>
                  )}

                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1736cf]/20 focus:border-[#1736cf] outline-none transition-all"
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1736cf]/20 focus:border-[#1736cf] outline-none transition-all"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1736cf]/20 focus:border-[#1736cf] outline-none transition-all"
                    >
                      <option value="" disabled>Select a topic</option>
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Billing & Credits">Billing & Credits</option>
                      <option value="Technical Support">Technical Support</option>
                      <option value="Feedback & Suggestions">Feedback & Suggestions</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1736cf]/20 focus:border-[#1736cf] outline-none transition-all resize-none"
                      placeholder="How can we help you?"
                    ></textarea>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-[#1736cf] hover:bg-[#1430b8] text-white flex items-center justify-center gap-2"
                    disabled={status === 'loading'}
                  >
                    {status === 'loading' ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </span>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>

          </div>

          {/* SEO FAQs Section */}
          <div className="mt-16 pt-12 border-t border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">More Frequently Asked Questions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              <section>
                <h3 className="text-md font-bold text-slate-900 mb-2">Is the Eromify AI influencer generator free?</h3>
                <p className="text-sm text-slate-600">Yes, you can start using the Eromify AI influencer generator for free. We offer free trial credits to new users so you can experience the best AI influencer generator free of charge before upgrading.</p>
              </section>

              <section>
                <h3 className="text-md font-bold text-slate-900 mb-2">Can I use the AI influencer generator free without login?</h3>
                <p className="text-sm text-slate-600">To ensure the highest quality generation and to prevent abuse, we require a quick login. However, signing up is completely free and takes just a few seconds.</p>
              </section>

              <section>
                <h3 className="text-md font-bold text-slate-900 mb-2">Is the AI influencer generator free unlimited?</h3>
                <p className="text-sm text-slate-600">While we offer generous free credits for starters, unlimited generation requires one of our premium Pro plans. Upgrading gives you unlimited access to create photos, videos, and more.</p>
              </section>

              <section>
                <h3 className="text-md font-bold text-slate-900 mb-2">Is this a free AI influencer generator for Instagram?</h3>
                <p className="text-sm text-slate-600">Absolutely. Eromify is heavily optimized for social media. You can seamlessly make influencer AI content tailored specifically for Instagram posts, reels, and stories.</p>
              </section>

              <section>
                <h3 className="text-md font-bold text-slate-900 mb-2">Are there free AI influencer generator prompts I can use?</h3>
                <p className="text-sm text-slate-600">Yes! Our platform provides built-in prompt templates and an AI prompt enhancer. You don't need to be an expert—our system will help you craft the perfect AI influencer generator prompt free of charge.</p>
              </section>

              <section>
                <h3 className="text-md font-bold text-slate-900 mb-2">Can I generate free AI influencer videos?</h3>
                <p className="text-sm text-slate-600">Yes, Eromify goes beyond just images. You can use your initial credits to test our AI influencer free video generation tools, bringing your virtual characters to life with stunning motion and realism.</p>
              </section>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
