export const HACKATHONS_MOCK_DATA = [
  {
    id: 'ai-innovation-challenge',
    title: 'AI Innovation Challenge: Shaping the Future with AI',
    date: 'Mar 1 - Mar 31, 2026',
    status: 'ongoing',
    prizePool: '$50,000 USD',
    description: 'Explore the limitless possibilities of Artificial Intelligence. Develop groundbreaking AI solutions that address real-world problems in various sectors.',
    countdown: '00M : 15D : 08H',
    timeline: [
      { id: '1', title: 'Registration & Idea Submission', startDate: '2026-03-01T00:00:00+00:00', endDate: '2026-03-10T23:59:59+00:00' },
      { id: '2', title: 'Development Phase', startDate: '2026-03-11T00:00:00+00:00', endDate: '2026-03-25T23:59:59+00:00' },
      { id: '3', title: 'Judging & Demo Day', startDate: '2026-03-28T09:00:00+00:00' },
      { id: '4', title: 'Winners Announcement', startDate: '2026-03-31T14:00:00+00:00' },
    ],
    prizes: [
      { rank: '1st Place', reward: '$25,000 USD' },
      { rank: '2nd Place', reward: '$15,000 USD' },
      { rank: '3rd Place', reward: '$10,000 USD' },
    ],
    tasks: [
      { id: '1.1', text: 'Register for the AI Challenge', phaseId: '1', done: true },
      { id: '1.2', text: 'Submit your AI Project Idea', phaseId: '1', done: false },
      { id: '1.3', text: 'Form your AI Development Team', phaseId: '1', done: false },
      { id: '2.1', text: 'Develop your AI Solution', phaseId: '2', done: false },
      { id: '2.2', text: 'Prepare your Demo and Presentation', phaseId: '2', done: false },
      { id: '3.1', text: 'Present to Judges', phaseId: '3', done: false },
      { id: '4.1', text: 'Attend Award Ceremony', phaseId: '4', done: false },
    ],
    tracks: [
      { title: 'Generative AI', icon: 'Sparkles', color: 'text-purple-500', image: 'https://images.unsplash.com/photo-1684491913410-b9a3e20e8b2c?q=80&w=2940&auto=format&fit=crop' },
      { title: 'AI for Healthcare', icon: 'Heart', color: 'text-red-500', image: 'https://images.unsplash.com/photo-1627439066619-3e3e0d8f0f0a?q=80&w=2940&auto=format&fit=crop' },
      { title: 'Ethical AI & Bias Mitigation', icon: 'Balance', color: 'text-green-500', image: 'https://images.unsplash.com/photo-1601777402928-1f3b0c1b0c0a?q=80&w=2940&auto=format&fit=crop' },
    ],
    leaderboard: [],
    resources: [
      { name: 'Google AI Platform Docs', icon: 'Code', link: 'https://cloud.google.com/ai-platform/docs' },
      { name: 'OpenAI API Documentation', icon: 'Cloud', link: 'https://openai.com/docs/' },
      { name: 'Gimmeidea AI Community', icon: 'MessageSquare', link: 'https://t.me/gimmeidea_ai_community' },
    ],
    tabs: [
      { id: 'overview', label: 'Overview', stepId: null },
      { id: 'tracks', label: 'Tracks', stepId: null },
      { id: 'register', label: 'Register', stepId: '1', hideAfterEnd: true },
      { id: 'submission', label: 'Submission', stepId: '1' },
      { id: 'demo', label: 'Demo Day', stepId: '3' },
    ],
    projectTicket: null,
    image_url: 'https://images.unsplash.com/photo-1621243881472-a1b7e28f30d0?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    announcements: [
      { id: '1', date: '2026-03-01 09:00:00', message: 'Welcome to the AI Innovation Challenge! Registrations are now open.', type: 'info', config: { effect: 'typewriter' } },
      { id: '2', date: '2026-03-05 10:00:00', message: 'Join our introductory webinar on Generative AI. Link in resources.', type: 'info' },
      { id: '3', date: '2026-03-09 14:30:00', message: 'Mentor session with Dr. Ava Sharma on AI Ethics this Friday!', type: 'info' },
      { id: '4', date: '2026-03-10 00:00:00', message: 'WARNING: Idea Submission closes in', type: 'warning', config: { effect: 'pulse', widget: { type: 'countdown', target: '2026-03-10T23:59:59+00:00' } } },
    ],
    teams: [
      { id: 1, name: 'AI Visionaries', members: 4, maxMembers: 5, tags: ['Generative AI', 'Python'], lookingFor: ['Data Scientist'] },
      { id: 2, name: 'HealthTech Innovators', members: 3, maxMembers: 4, tags: ['Healthcare AI', 'Machine Learning'], lookingFor: ['Medical Advisor'] },
      { id: 3, name: 'Ethical Bytes', members: 2, maxMembers: 3, tags: ['AI Ethics', 'NLP'], lookingFor: ['UX Researcher'] },
    ],
    participants: [
      { id: 1, name: 'Dr. John Doe', role: 'Lead AI Engineer', skills: ['Python', 'TensorFlow', 'NLP'], bio: 'Passionate about building responsible AI systems.' },
      { id: 2, name: 'Jane Smith', role: 'Machine Learning Scientist', skills: ['PyTorch', 'Computer Vision'], bio: 'Developing AI solutions for early disease detection.' },
      { id: 3, name: 'Peter Jones', role: 'AI Product Manager', skills: ['Product Strategy', 'Market Analysis'], bio: 'Guiding AI products from concept to launch.' },
    ]
  },
];