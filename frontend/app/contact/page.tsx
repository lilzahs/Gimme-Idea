'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Send, 
  MessageCircle, 
  Twitter, 
  CheckCircle,
  Loader2,
  User
} from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

// Contact info
const CONTACT_INFO = {
  email: 'gimmeidea.contact@gmail.com',
  telegram: 'https://t.me/+s7KW91Nf4G1iZWVl',
  twitter: '@gimme_idea',
  twitterUrl: 'https://twitter.com/gimme_idea',
};

// Inquiry types (simplified)
const INQUIRY_TYPES = [
  { value: 'general', label: 'General' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'sponsorship', label: 'Sponsorship' },
  { value: 'bug', label: 'Bug Report' },
  { value: 'feature', label: 'Feature Request' },
  { value: 'other', label: 'Other' }
];

export default function ContactPage() {
  const [stars, setStars] = useState<{ id: number; top: string; left: string; size: number; duration: string; opacity: number }[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    inquiryType: 'general',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const newStars = Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 2 + 1,
      duration: `${Math.random() * 3 + 2}s`,
      opacity: Math.random()
    }));
    setStars(newStars);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      const subject = encodeURIComponent(`[${formData.inquiryType.toUpperCase()}] Contact from ${formData.name}`);
      const body = encodeURIComponent(
        `Name: ${formData.name}\nEmail: ${formData.email}\nType: ${INQUIRY_TYPES.find(t => t.value === formData.inquiryType)?.label}\n\nMessage:\n${formData.message}`
      );
      
      window.location.href = `mailto:${CONTACT_INFO.email}?subject=${subject}&body=${body}`;
      
      setTimeout(() => {
        setIsSubmitting(false);
        setIsSubmitted(true);
        toast.success('Opening your email client...');
      }, 500);

    } catch (error) {
      setIsSubmitting(false);
      toast.error('Something went wrong. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', inquiryType: 'general', message: '' });
    setIsSubmitted(false);
  };

  return (
    <div className="min-h-screen text-gray-300 pt-24 pb-8 px-4 font-sans relative">
      {/* Background */}
      <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden">
        <div className="bg-grid opacity-40"></div>
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#2e1065] rounded-full blur-[120px] animate-pulse-slow opacity-40 mix-blend-screen" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-[#422006] rounded-full blur-[120px] animate-pulse-slow opacity-40 mix-blend-screen" style={{animationDelay: '2s'}} />
        <div className="stars-container">
          {stars.map((star) => (
            <div key={star.id} className="star" style={{ top: star.top, left: star.left, width: `${star.size}px`, height: `${star.size}px`, '--duration': star.duration, '--opacity': star.opacity } as React.CSSProperties} />
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 font-quantico">Get in Touch</h1>
          <p className="text-gray-400">We typically respond within 24-48 hours</p>
        </motion.div>

        {/* Quick Contact Links */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-wrap justify-center gap-3 mb-8">
          <a href={`mailto:${CONTACT_INFO.email}`} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 hover:border-[#FFD700]/50 hover:bg-white/10 transition-all text-sm">
            <Mail className="w-4 h-4 text-[#FFD700]" />
            <span>{CONTACT_INFO.email}</span>
          </a>
          <a href={CONTACT_INFO.twitterUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 hover:border-blue-500/50 hover:bg-white/10 transition-all text-sm">
            <Twitter className="w-4 h-4 text-blue-400" />
            <span>{CONTACT_INFO.twitter}</span>
          </a>
          <a href={CONTACT_INFO.telegram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 hover:border-cyan-500/50 hover:bg-white/10 transition-all text-sm">
            <MessageCircle className="w-4 h-4 text-cyan-400" />
            <span>Telegram</span>
          </a>
        </motion.div>

        {/* Contact Form */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            {isSubmitted ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Message Ready!</h2>
                <p className="text-gray-400 mb-4 text-sm">
                  Your email client should have opened. If not, email us at <span className="text-[#FFD700]">{CONTACT_INFO.email}</span>
                </p>
                <button onClick={resetForm} className="px-5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm">
                  Send Another
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label className="block text-gray-300 text-sm mb-1.5">Name <span className="text-red-400">*</span></label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Your name" className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:border-[#FFD700]/50 focus:outline-none transition-colors text-sm" required />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-gray-300 text-sm mb-1.5">Email <span className="text-red-400">*</span></label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="your@email.com" className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:border-[#FFD700]/50 focus:outline-none transition-colors text-sm" required />
                    </div>
                  </div>
                </div>

                {/* Inquiry Type */}
                <div>
                  <label className="block text-gray-300 text-sm mb-1.5">Inquiry Type</label>
                  <div className="flex flex-wrap gap-2">
                    {INQUIRY_TYPES.map(type => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, inquiryType: type.value }))}
                        className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                          formData.inquiryType === type.value
                            ? 'bg-[#FFD700] text-black font-medium'
                            : 'bg-white/5 border border-white/10 text-gray-400 hover:border-white/30'
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-gray-300 text-sm mb-1.5">Message <span className="text-red-400">*</span></label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Tell us more about your inquiry..."
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-[#FFD700]/50 focus:outline-none transition-colors resize-none text-sm"
                    required
                  />
                </div>

                {/* Submit */}
                <div className="flex items-center justify-between gap-4 pt-2">
                  <p className="text-gray-500 text-xs">
                    By submitting, you agree to our <Link href="/privacy" className="text-[#FFD700] hover:underline">Privacy Policy</Link>
                  </p>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-[#FFD700] to-[#FDB931] text-black font-bold px-6 py-2.5 rounded-xl hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {isSubmitting ? 'Preparing...' : 'Send'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
