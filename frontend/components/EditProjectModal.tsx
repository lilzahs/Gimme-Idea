'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Rocket, Lightbulb, Image as ImageIcon, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Project } from '../lib/types';
import { uploadProjectImage } from '../lib/imgbb';
import { MarkdownGuide } from './MarkdownGuide';
import toast from 'react-hot-toast';

interface EditProjectModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Project>) => void;
}

export const EditProjectModal = ({ project, isOpen, onClose, onSave }: EditProjectModalProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categories: [] as string[],
    stage: 'Idea',
    website: '',
    bounty: '',
    problem: '',
    opportunity: '',
    solution: '',
    isAnonymous: false,
    imageUrl: ''
  });

  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const categories = [
    'DeFi', 'NFT', 'Gaming', 'Infrastructure', 'DAO', 'DePIN', 'Social', 'Mobile', 'Security',
    'Payment', 'Developer Tooling', 'ReFi', 'Content', 'Dapp', 'Blinks'
  ];

  // Initialize form when project changes
  useEffect(() => {
    if (project && isOpen) {
      setFormData({
        title: project.title || '',
        description: project.description || '',
        categories: project.category ? [project.category] : [],
        stage: project.stage || 'Idea',
        website: project.website || '',
        bounty: project.bounty?.toString() || '',
        problem: project.problem || '',
        opportunity: project.opportunity || '',
        solution: project.solution || '',
        isAnonymous: project.isAnonymous || false,
        imageUrl: project.image || ''
      });
      setTags(project.tags || []);
    }
  }, [project, isOpen]);

  const isIdea = project?.type === 'idea';

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error('Image size must be less than 5MB');
        return;
      }

      setIsUploadingImage(true);
      try {
        const imageUrl = await uploadProjectImage(file);
        setFormData({ ...formData, imageUrl });
        toast.success('Image uploaded!');
      } catch (error) {
        console.error('Image upload error:', error);
        toast.error('Failed to upload image');
      } finally {
        setIsUploadingImage(false);
      }
    }
  };

  const toggleCategory = (category: string) => {
    if (formData.categories.includes(category)) {
      setFormData({ ...formData, categories: formData.categories.filter(c => c !== category) });
    } else {
      if (formData.categories.length < 3) {
        setFormData({ ...formData, categories: [...formData.categories, category] });
      } else {
        toast.error('You can select up to 3 categories');
      }
    }
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
        setTagInput('');
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    if (formData.categories.length === 0) {
      toast.error('Please select at least one category');
      return;
    }

    if (isIdea) {
      if (!formData.problem.trim() || !formData.solution.trim()) {
        toast.error('Please fill in Problem and Solution fields');
        return;
      }
    } else {
      if (!formData.description.trim()) {
        toast.error('Please describe your project');
        return;
      }
    }

    setIsSaving(true);

    try {
      const updateData: Partial<Project> = {
        id: project?.id,
        title: formData.title,
        description: isIdea ? formData.problem.substring(0, 100) + '...' : formData.description,
        category: formData.categories[0] as Project['category'],
        stage: formData.stage as Project['stage'],
        tags: tags.length > 0 ? tags : [...formData.categories.slice(1), 'Solana'],
        website: formData.website,
        image: formData.imageUrl || undefined,
        bounty: formData.bounty ? Number(formData.bounty) : undefined,
        problem: formData.problem,
        opportunity: formData.opportunity,
        solution: formData.solution,
        isAnonymous: formData.isAnonymous
      };

      onSave(updateData);
      toast.success(`${isIdea ? 'Idea' : 'Project'} updated!`);
      onClose();
    } catch (error) {
      toast.error('Failed to update');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || !project) return null;

  const themeColor = isIdea ? 'from-[#FFD700] to-[#FDB931]' : 'from-[#9945FF] to-[#7c3aed]';
  const borderColor = isIdea ? 'border-[#FFD700]/30' : 'border-[#9945FF]/30';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />

      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className={`relative w-full max-w-4xl bg-[#121212] border ${borderColor} rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col`}
      >
        {/* Header */}
        <div className={`relative px-8 py-6 border-b border-white/10 overflow-hidden`}>
          <div className={`absolute inset-0 bg-gradient-to-r ${themeColor} opacity-10`} />
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative z-10 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${themeColor} text-white shadow-lg`}>
                {isIdea ? <Lightbulb className="w-6 h-6" /> : <Rocket className="w-6 h-6" />}
              </div>
              <div>
                <h2 className="text-2xl font-bold font-display text-white">
                  Edit {isIdea ? 'Idea' : 'Project'}
                </h2>
                <p className="text-sm text-gray-400">
                  Update your {isIdea ? 'idea' : 'project'} details
                </p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Form Area */}
        <div className="overflow-y-auto p-8 custom-scrollbar bg-gradient-to-b from-[#121212] to-[#0A0A0A]">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Title */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">
                {isIdea ? 'Idea Name' : 'Project Name'} *
              </label>
              <input 
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-5 py-4 outline-none focus:border-white/30 text-white placeholder:text-gray-600 transition-colors font-medium"
                placeholder={isIdea ? "e.g. Decentralized Uber" : "e.g. SolStream Protocol"}
              />
            </div>

            {/* Categories */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">
                Categories * <span className="text-gray-600 font-normal text-[10px]">(Select 1-3)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      formData.categories.includes(cat)
                        ? isIdea
                          ? 'bg-gradient-to-r from-[#FFD700] to-[#FDB931] text-black border border-[#FFD700] shadow-lg shadow-yellow-500/20'
                          : 'bg-gradient-to-r from-[#9945FF] to-[#7c3aed] text-white border border-[#9945FF] shadow-lg shadow-purple-500/20'
                        : 'bg-[#1A1A1A] text-gray-400 border border-white/10 hover:border-white/30 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Project Specific Fields */}
            {!isIdea && (
              <>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Description *</label>
                  <textarea 
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-5 py-4 outline-none focus:border-white/30 text-white h-32 resize-none placeholder:text-gray-600"
                    placeholder="Describe your project's value proposition..."
                  />
                </div>

                {/* Image Upload */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Project Banner</label>
                  <div 
                    onClick={() => !isUploadingImage && fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all relative h-48 flex flex-col items-center justify-center overflow-hidden group/upload bg-[#1A1A1A] ${
                      isUploadingImage ? 'border-accent/50 cursor-wait' : 'border-white/10 hover:bg-white/5 hover:border-white/20'
                    }`}
                  >
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploadingImage} />
                    {isUploadingImage ? (
                      <div className="flex flex-col items-center justify-center">
                        <Loader2 className="w-10 h-10 text-accent animate-spin mb-3" />
                        <p className="text-gray-300 font-bold text-sm">Uploading image...</p>
                      </div>
                    ) : formData.imageUrl ? (
                      <>
                        <img src={formData.imageUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover/upload:opacity-40 transition-opacity" />
                        <div className="relative z-10 bg-black/60 px-4 py-2 rounded-full backdrop-blur-md opacity-0 group-hover/upload:opacity-100 transition-opacity">
                          <span className="text-white font-bold text-sm">Change Image</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3 text-gray-500 group-hover/upload:text-white group-hover/upload:scale-110 transition-all">
                          <ImageIcon className="w-6 h-6" />
                        </div>
                        <p className="text-gray-300 font-bold text-sm">Click to upload banner</p>
                        <p className="text-gray-600 text-xs mt-1">Max 5MB</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Website & Bounty */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Website / Repo</label>
                    <input 
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-5 py-4 outline-none focus:border-white/30 text-white placeholder:text-gray-600"
                      placeholder="https://..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Bounty (USDC)</label>
                    <div className="relative">
                      <input 
                        type="number"
                        value={formData.bounty}
                        onChange={(e) => setFormData({ ...formData, bounty: e.target.value })}
                        className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-5 py-4 outline-none focus:border-white/30 text-white placeholder:text-gray-600 pr-16"
                        placeholder="0.00"
                      />
                      <span className="absolute right-5 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-500">USDC</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Idea Specific Fields */}
            {isIdea && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <p className="text-xs text-gray-400">✨ Markdown formatting supported</p>
                  <MarkdownGuide />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">The Problem *</label>
                  <textarea 
                    value={formData.problem}
                    onChange={(e) => setFormData({ ...formData, problem: e.target.value })}
                    className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-5 py-4 outline-none focus:border-white/30 text-white h-24 resize-none placeholder:text-gray-600"
                    placeholder="What pain point are you solving?"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">The Solution *</label>
                  <textarea 
                    value={formData.solution}
                    onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
                    className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-5 py-4 outline-none focus:border-white/30 text-white h-24 resize-none placeholder:text-gray-600"
                    placeholder="How does your idea solve this?"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Opportunity</label>
                  <textarea
                    value={formData.opportunity}
                    onChange={(e) => setFormData({ ...formData, opportunity: e.target.value })}
                    className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-5 py-4 outline-none focus:border-white/30 text-white h-24 resize-none placeholder:text-gray-600"
                    placeholder="Market size, timing, potential..."
                  />
                </div>

                {/* Anonymous Toggle */}
                <div className="flex items-center gap-4 bg-[#1A1A1A] p-4 rounded-xl border border-white/5">
                  <div className={`p-3 rounded-xl ${formData.isAnonymous ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20' : 'bg-white/5 text-gray-400'}`}>
                    {formData.isAnonymous ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-bold text-sm text-white">Post Anonymously</h4>
                    <p className="text-xs text-gray-500 mt-0.5">Hide your identity on this post.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={formData.isAnonymous} onChange={e => setFormData({ ...formData, isAnonymous: e.target.checked })} className="sr-only peer" />
                    <div className="w-12 h-7 bg-black/50 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600 border border-white/10"></div>
                  </label>
                </div>
              </div>
            )}

            {/* Tags */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Tags</label>
              <div className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3 flex flex-wrap gap-2 min-h-[56px] focus-within:border-white/30 transition-colors">
                {tags.map(tag => (
                  <span key={tag} className={`text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold ${isIdea ? 'bg-yellow-500/20 text-yellow-300' : 'bg-purple-500/20 text-purple-300'}`}>
                    #{tag}
                    <button type="button" onClick={() => removeTag(tag)} className="hover:text-white transition-colors"><X className="w-3 h-3" /></button>
                  </span>
                ))}
                <input 
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  className="bg-transparent outline-none text-white flex-grow text-sm min-w-[100px] placeholder:text-gray-600 py-1"
                  placeholder={tags.length === 0 ? "Add tags (press Enter)" : ""}
                />
              </div>
            </div>

          </form>
        </div>

        {/* Footer Action */}
        <div className="p-6 border-t border-white/10 bg-[#0F0F0F]">
          <div className="flex gap-4">
            <button 
              onClick={handleSubmit}
              disabled={isSaving}
              className={`flex-1 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-lg disabled:opacity-50 ${isIdea ? 'bg-gradient-to-r from-[#FFD700] to-[#FDB931] text-black shadow-yellow-500/20' : 'bg-gradient-to-r from-[#9945FF] to-[#7c3aed] text-white shadow-purple-500/20'}`}
            >
              {isSaving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {isIdea ? <Lightbulb className="w-5 h-5" /> : <Rocket className="w-5 h-5" />}
                  Save Changes
                </>
              )}
            </button>
            <button 
              onClick={onClose}
              className="px-8 py-4 border border-white/10 rounded-xl hover:bg-white/5 text-gray-300 transition-colors font-bold"
            >
              Cancel
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
