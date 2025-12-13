export const HACKATHONS_MOCK_DATA = [
  { 
    id: 'dsuc-hackathon-solana-edu', 
    title: 'DSUC HACKATHON : Education Ecosystem using Solana blockchain', 
    date: 'Jan 15 - Feb 15, 2026', 
    status: 'upcoming',
    participants: 0,
    prizePool: '$25,000 USDC',
    description: 'Build innovative solutions for the education sector leveraging the power of Solana blockchain. Focus on decentralized learning, credentialing, and community building.',
    tags: ['Education', 'Solana', 'DeFi', 'Community'],
    countdown: '03M : 05D : 10H',
    timeline: [
        { id: 1, title: 'Registration Opens', date: '2026-01-01T09:00:00Z', status: 'pending' },
        { id: 2, title: 'Submission Deadline', date: '2026-02-10T17:00:00Z', status: 'pending' },
        { id: 3, title: 'Judging & Demo Day', date: '2026-02-15T19:00:00Z', status: 'pending' },
    ],
    prizes: [
      { rank: '1st Place', reward: '$12,000' },
      { rank: '2nd Place', reward: '$6,000' },
      { rank: '3rd Place', reward: '$3,000' },
      { rank: 'Community Choice', reward: '$2,000' },
      { rank: 'Best UI/UX', reward: '$2,000' },
    ],
    tasks: [
        { id: 1, text: 'Register for the Hackathon', done: false },
        { id: 2, text: 'Join DSUC Discord', done: false },
        { id: 3, text: 'Form a Team', done: false },
    ],
    tracks: [
        { title: 'Decentralized Learning Platforms', icon: 'Book', color: 'text-blue-400', image: 'https://images.unsplash.com/photo-1546410531-bb4696068285?w=800&auto=format&fit=crop' },
        { title: 'Blockchain-based Credentialing', icon: 'ShieldCheck', color: 'text-green-400', image: 'https://images.unsplash.com/photo-1621361284488-82ef10f7639d?w=800&auto=format&fit=crop' },
        { title: 'Educational DAOs & Community Tools', icon: 'Users', color: 'text-purple-400', image: 'https://images.unsplash.com/photo-1552588329-a726715b561c?w=800&auto=format&fit=crop' },
    ],
    leaderboard: [],
    resources: [
      { name: 'Solana Docs', icon: 'Code', link: 'https://docs.solana.com/' },
      { name: 'DSUC Discord', icon: 'MessageSquare', link: 'https://discord.gg/dsuc' },
    ],
    projectTicket: null,
    image_url: 'https://images.unsplash.com/photo-1596495578051-24750d42171f?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
];