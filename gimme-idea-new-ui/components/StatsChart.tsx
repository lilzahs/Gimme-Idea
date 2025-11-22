import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

const data = [
  { name: 'Mon', feedback: 2400, projects: 24 },
  { name: 'Tue', feedback: 1398, projects: 12 },
  { name: 'Wed', feedback: 9800, projects: 45 },
  { name: 'Thu', feedback: 3908, projects: 28 },
  { name: 'Fri', feedback: 4800, projects: 34 },
  { name: 'Sat', feedback: 3800, projects: 15 },
  { name: 'Sun', feedback: 4300, projects: 20 },
];

const categoryData = [
  { name: 'DeFi', value: 400 },
  { name: 'Gaming', value: 300 },
  { name: 'NFTs', value: 300 },
  { name: 'Infra', value: 200 },
];

const COLORS = ['#ffd8b4', '#a855f7', '#3b82f6', '#22c55e'];

export const ActivityChart: React.FC = () => {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorFeedback" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ffd8b4" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#ffd8b4" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
          <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#333', borderRadius: '8px' }}
            itemStyle={{ color: '#fff' }}
          />
          <Area 
            type="monotone" 
            dataKey="feedback" 
            stroke="#ffd8b4" 
            fillOpacity={1} 
            fill="url(#colorFeedback)" 
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export const CategoryChart: React.FC = () => {
  return (
     <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={categoryData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
          <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip 
            cursor={{fill: 'transparent'}}
            contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#333', borderRadius: '8px' }}
            itemStyle={{ color: '#fff' }}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {categoryData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
     </div>
  );
};