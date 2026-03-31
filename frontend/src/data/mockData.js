export const jobs = [
  { id: 1, title: 'Social Media Assistant', company: 'Nomad', location: 'Paris, France', type: 'Full-Time', categories: ['Marketing', 'Design'], logo: 'N', color: 'bg-emerald-500', applied: 5, capacity: 10 },
  { id: 2, title: 'Brand Designer', company: 'Dropbox', location: 'San Francisco, USA', type: 'Full-Time', categories: ['Design', 'Business'], logo: 'D', color: 'bg-blue-500', applied: 2, capacity: 8 },
  { id: 3, title: 'Interactive Developer', company: 'Terraform', location: 'Hamburg, Germany', type: 'Full-Time', categories: ['Technology', 'Engineering'], logo: 'T', color: 'bg-purple-500', applied: 7, capacity: 12 },
  { id: 4, title: 'Email Marketing', company: 'Revolut', location: 'Madrid, Spain', type: 'Full-Time', categories: ['Marketing'], logo: 'R', color: 'bg-red-500', applied: 3, capacity: 6 },
  { id: 5, title: 'Lead Engineer', company: 'Stripe', location: 'New York, USA', type: 'Full-Time', categories: ['Engineering', 'Technology'], logo: 'S', color: 'bg-indigo-500', applied: 9, capacity: 15 },
  { id: 6, title: 'Product Designer', company: 'Coinbase', location: 'London, UK', type: 'Part-Time', categories: ['Design'], logo: 'C', color: 'bg-yellow-500', applied: 4, capacity: 5 },
  { id: 7, title: 'Customer Manager', company: 'Twilio', location: 'Berlin, Germany', type: 'Full-Time', categories: ['Business', 'Finance'], logo: 'T', color: 'bg-pink-500', applied: 1, capacity: 4 },
  { id: 8, title: 'Visual Designer', company: 'Packer', location: 'Madrid, Spain', type: 'Full-Time', categories: ['Design'], logo: 'P', color: 'bg-orange-500', applied: 6, capacity: 10 },
];

export const companies = [
  { id: 1, name: 'Stripe', description: 'Stripe is a software platform for starting and running internet businesses. Millions of businesses rely on Stripe\'s software tools...', logo: 'S', color: 'bg-indigo-600', jobs: 7, tags: ['Business', 'Payment Gateway'], industry: 'Fintech', size: '1001+' },
  { id: 2, name: 'Truebill', description: 'Take control of your money. Truebill develops a mobile app that helps consumers take control of their financial...', logo: 'T', color: 'bg-blue-500', jobs: 7, tags: ['Business'], industry: 'Fintech', size: '51-150' },
  { id: 3, name: 'Square', description: 'Square builds common business tools in unconventional ways so more people can start, run, and grow their businesses...', logo: 'Sq', color: 'bg-gray-800', jobs: 7, tags: ['Business', 'Blockchain'], industry: 'Fintech', size: '251-500' },
  { id: 4, name: 'Coinbase', description: 'Coinbase is a digital currency wallet and platform where merchants and consumers can transact with new digital currencies...', logo: 'C', color: 'bg-blue-600', jobs: 7, tags: ['Business', 'Blockchain'], industry: 'Fintech', size: '501-1000' },
  { id: 5, name: 'Robinhood', description: 'Robinhood is lowering barriers, removing fees, and providing greater access to financial information...', logo: 'R', color: 'bg-green-600', jobs: 7, tags: ['Business'], industry: 'Fintech', size: '251-500' },
  { id: 6, name: 'Kraken', description: 'Based in San Francisco, Kraken is the world\'s largest global bitcoin exchange in euro volume and liquidity...', logo: 'K', color: 'bg-purple-600', jobs: 7, tags: ['Business', 'Blockchain'], industry: 'Fintech', size: '51-150' },
  { id: 7, name: 'Revolut', description: 'When Revolut was founded in 2015, we had a vision to build a sustainable, digital alternative to traditional big banks...', logo: 'Rv', color: 'bg-red-500', jobs: 7, tags: ['Business', 'Blockchain'], industry: 'Fintech', size: '1001+' },
  { id: 8, name: 'Divvy', description: 'Divvy is a secure financial platform for businesses to manage payments and subscriptions...', logo: 'Dv', color: 'bg-teal-500', jobs: 7, tags: ['Business', 'Blockchain'], industry: 'Fintech', size: '51-150' },
  { id: 9, name: 'Nomad', description: 'Nomad is located in Paris, France. Nomad has generated ₹726,000 in sales (USD).', logo: 'N', color: 'bg-emerald-500', jobs: 3, tags: ['Business Service'], industry: 'Business Service', size: '1-50' },
  { id: 10, name: 'Discord', description: "We'd love to work with someone like you. Discord is creating a delightful experience.", logo: 'Di', color: 'bg-indigo-500', jobs: 3, tags: ['Business Service'], industry: 'Business Service', size: '251-500' },
  { id: 11, name: 'Maze', description: "We're a passionate bunch working from all over the world to build the future of rapid testing together.", logo: 'M', color: 'bg-pink-500', jobs: 3, tags: ['Business Service'], industry: 'Business Service', size: '51-150' },
  { id: 12, name: 'Udacity', description: 'Udacity is a new type of online university that teaches the actual programming skills.', logo: 'U', color: 'bg-cyan-500', jobs: 3, tags: ['Business Service'], industry: 'Education', size: '251-500' },
  { id: 13, name: 'Webflow', description: 'Webflow is the first design and hosting platform built from the ground up for the mobile age.', logo: 'W', color: 'bg-blue-700', jobs: 5, tags: ['Business Service', 'Technology'], industry: 'Technology', size: '51-150' },
  { id: 14, name: 'Foundation', description: 'Foundation helps creators mint and auction their digital artworks as NFTs on the Ethereum blockchain.', logo: 'F', color: 'bg-gray-900', jobs: 3, tags: ['Business Service', 'Crypto'], industry: 'Blockchain', size: '1-50' },
  { id: 15, name: 'Pentagram', description: 'Pentagram is the world\'s largest independent design consultancy.', logo: 'Pg', color: 'bg-gray-700', jobs: 3, tags: ['Design'], industry: 'Advertising', size: '51-150' },
  { id: 16, name: 'Wolff Olins', description: 'Wolff Olins is a brand consultancy that creates transformative brands.', logo: 'Wo', color: 'bg-orange-500', jobs: 3, tags: ['Design'], industry: 'Advertising', size: '51-150' },
  { id: 17, name: 'Clay', description: 'Clay is a UI/UX design and branding agency based in San Francisco.', logo: 'Cl', color: 'bg-yellow-500', jobs: 2, tags: ['Design'], industry: 'Advertising', size: '1-50' },
  { id: 18, name: 'MediaMonks', description: 'MediaMonks is a digital production company that creates award-winning content.', logo: 'Mm', color: 'bg-red-600', jobs: 3, tags: ['Design', 'Technology'], industry: 'Advertising', size: '1001+' },
  { id: 19, name: 'Packer', description: 'Packer is a tool for creating identical machine images for multiple platforms.', logo: 'P', color: 'bg-orange-400', jobs: 3, tags: ['Technology'], industry: 'Technology', size: '51-150' },
  { id: 20, name: 'Dropbox', description: 'Dropbox is a modern workspace designed to reduce busywork, so you can focus on the things that matter.', logo: 'D', color: 'bg-blue-500', jobs: 5, tags: ['Technology', 'Business Service'], industry: 'Technology', size: '1001+' },
  { id: 21, name: 'Twitter',    description: "Twitter is what's happening and what people are talking about right now.", logo: 'Tw', color: 'bg-sky-500',    jobs: 12, tags: ['Business Service', 'Technology'], industry: 'Technology',      size: '1001+' },
  { id: 22, name: 'Microsoft',  description: 'Microsoft enables digital transformation for the era of an intelligent cloud and edge.', logo: 'Ms', color: 'bg-blue-700',   jobs: 25, tags: ['Technology', 'Cloud'],            industry: 'Cloud',           size: '1001+' },
  { id: 23, name: 'Apple',      description: 'Apple designs Macs, the best personal computers in the world, along with OS X, iLife, iWork and professional software.', logo: 'Ap', color: 'bg-gray-600',   jobs: 18, tags: ['Technology', 'Consumer Tech'],   industry: 'Consumer Tech',   size: '1001+' },
  { id: 24, name: 'Facebook',   description: "Facebook's mission is to give people the power to build community and bring the world closer together.", logo: 'Fb', color: 'bg-blue-600',   jobs: 15, tags: ['Technology', 'Media'],            industry: 'Media',           size: '1001+' },
  { id: 25, name: 'Google',     description: "Google's mission is to organize the world's information and make it universally accessible and useful.", logo: 'G',  color: 'bg-red-500',    jobs: 30, tags: ['Technology', 'Cloud'],            industry: 'Cloud',           size: '1001+' },
  { id: 26, name: 'Netflix',    description: "Netflix is the world's leading streaming entertainment service with over 200 million paid memberships.", logo: 'Nf', color: 'bg-red-600',    jobs: 8,  tags: ['Media', 'Technology'],            industry: 'Media',           size: '1001+' },
  { id: 27, name: 'Airbnb',     description: 'Airbnb is a community based on connection and belonging — a place where anyone can belong anywhere.', logo: 'Ab', color: 'bg-rose-500',   jobs: 6,  tags: ['Business Service'],               industry: 'Business Service', size: '1001+' },
  { id: 28, name: 'Spotify',    description: 'Spotify is a digital music, podcast, and video service that gives you access to millions of songs.', logo: 'Sp', color: 'bg-green-500',  jobs: 9,  tags: ['Technology', 'Media'],            industry: 'Media',           size: '1001+' },
];

export const categories = [
  { name: 'Design', icon: '🎨', jobs: 235 },
  { name: 'Sales', icon: '📈', jobs: 756 },
  { name: 'Marketing', icon: '📣', jobs: 140 },
  { name: 'Finance', icon: '💰', jobs: 325 },
  { name: 'Technology', icon: '💻', jobs: 225 },
  { name: 'Engineering', icon: '</>', jobs: 546 },
  { name: 'Business', icon: '💼', jobs: 31 },
  { name: 'Human Resource', icon: '👥', jobs: 185 },
];

export const applications = [
  { id: 1, title: 'Social Media Assistant', company: 'Nomad', location: 'Paris, France', type: 'Full-Time', dateApplied: '24 July 2021', status: 'In Review', logo: 'N', color: 'bg-emerald-500' },
  { id: 2, title: 'Social Media Assistant', company: 'Udacity', location: 'New York, USA', type: 'Full-Time', dateApplied: '23 July 2021', status: 'Shortlisted', logo: 'U', color: 'bg-cyan-500' },
  { id: 3, title: 'Social Media Assistant', company: 'Packer', location: 'Madrid, Spain', type: 'Full-Time', dateApplied: '23 July 2021', status: 'Declined', logo: 'P', color: 'bg-orange-500' },
  { id: 4, title: 'Brand Designer', company: 'Dropbox', location: 'San Francisco, USA', type: 'Full-Time', dateApplied: '22 July 2021', status: 'Interviewing', logo: 'D', color: 'bg-blue-500' },
  { id: 5, title: 'Interactive Developer', company: 'Terraform', location: 'Hamburg, Germany', type: 'Full-Time', dateApplied: '20 July 2021', status: 'Offered', logo: 'T', color: 'bg-purple-500' },
];

export const recruiterProfiles = {
  1: {
    title: 'Senior Recruiter',
    company: 'Nomad',
    companyId: 9,
    location: 'Paris, France',
    bio: 'Passionate talent acquisition specialist with 6+ years of experience connecting top professionals with innovative companies. Specializing in tech and creative roles across Europe.',
    skills: ['Talent Acquisition', 'Sourcing', 'Interviewing', 'Employer Branding', 'ATS Management'],
    experience: [
      { role: 'Senior Recruiter', company: 'Nomad', period: '2020 – Present', desc: 'Leading full-cycle recruitment for engineering and design teams.' },
      { role: 'Recruiter', company: 'Webflow', period: '2018 – 2020', desc: 'Managed hiring pipelines for product and marketing departments.' },
    ],
    openRoles: ['Social Media Assistant', 'Brand Designer', 'UX Researcher'],
    linkedin: 'linkedin.com/in/janmayer',
    twitter: '@janmayer',
  },
  2: {
    title: 'HR Manager',
    company: 'Divvy',
    companyId: 8,
    location: 'Salt Lake City, USA',
    bio: 'HR professional focused on building inclusive teams and streamlining hiring processes. 8 years in fintech recruitment.',
    skills: ['HR Management', 'Onboarding', 'Compliance', 'Recruitment', 'Employee Relations'],
    experience: [
      { role: 'HR Manager', company: 'Divvy', period: '2019 – Present', desc: 'Overseeing HR operations and talent strategy for 200+ employees.' },
      { role: 'HR Generalist', company: 'Square', period: '2016 – 2019', desc: 'Supported recruitment and employee engagement initiatives.' },
    ],
    openRoles: ['Customer Success Manager', 'Finance Analyst'],
    linkedin: 'linkedin.com/in/joebartmann',
    twitter: '@joebartmann',
  },
  3: {
    title: 'Technical Recruiter',
    company: 'Stripe',
    companyId: 1,
    location: 'San Francisco, USA',
    bio: 'Technical recruiter with a background in software engineering. I bridge the gap between engineering teams and top-tier candidates.',
    skills: ['Technical Sourcing', 'Engineering Hiring', 'Coding Assessments', 'Pipeline Management'],
    experience: [
      { role: 'Technical Recruiter', company: 'Stripe', period: '2021 – Present', desc: 'Hiring engineers across backend, frontend, and infrastructure teams.' },
      { role: 'Recruiter', company: 'Coinbase', period: '2019 – 2021', desc: 'Focused on blockchain and fintech engineering roles.' },
    ],
    openRoles: ['Lead Engineer', 'Backend Developer', 'DevOps Engineer'],
    linkedin: 'linkedin.com/in/allywales',
    twitter: '@allywales',
  },
  4: {
    title: 'Hiring Manager',
    company: 'Coinbase',
    companyId: 4,
    location: 'New York, USA',
    bio: 'Product and design hiring manager with a keen eye for creative talent. Building world-class product teams at Coinbase.',
    skills: ['Design Hiring', 'Product Management', 'Team Building', 'Portfolio Review'],
    experience: [
      { role: 'Hiring Manager', company: 'Coinbase', period: '2020 – Present', desc: 'Leading design and product hiring across multiple verticals.' },
      { role: 'Design Lead', company: 'Kraken', period: '2017 – 2020', desc: 'Managed design team and contributed to hiring decisions.' },
    ],
    openRoles: ['Product Designer', 'UX Lead', 'Visual Designer'],
    linkedin: 'linkedin.com/in/jamesgardner',
    twitter: '@jamesgardner',
  },
  5: {
    title: 'HR Specialist',
    company: 'Dropbox',
    companyId: 20,
    location: 'San Francisco, USA',
    bio: 'HR specialist passionate about candidate experience and employer branding. Helping Dropbox attract world-class talent.',
    skills: ['Employer Branding', 'Candidate Experience', 'Recruitment Marketing', 'Onboarding'],
    experience: [
      { role: 'HR Specialist', company: 'Dropbox', period: '2021 – Present', desc: 'Driving recruitment marketing and candidate experience programs.' },
      { role: 'HR Coordinator', company: 'Webflow', period: '2019 – 2021', desc: 'Coordinated interviews and managed ATS workflows.' },
    ],
    openRoles: ['Brand Designer', 'Content Strategist'],
    linkedin: 'linkedin.com/in/allisongeidt',
    twitter: '@allisongeidt',
  },
  6: {
    title: 'Tech Lead & Hiring',
    company: 'Terraform',
    companyId: 3,
    location: 'Hamburg, Germany',
    bio: 'Engineering leader who also drives technical hiring. I look for developers who are passionate about infrastructure and open source.',
    skills: ['Technical Interviews', 'System Design', 'Open Source', 'Engineering Leadership'],
    experience: [
      { role: 'Tech Lead', company: 'Terraform', period: '2019 – Present', desc: 'Leading engineering team and conducting technical interviews.' },
      { role: 'Senior Engineer', company: 'Packer', period: '2016 – 2019', desc: 'Built core infrastructure tooling and mentored junior engineers.' },
    ],
    openRoles: ['Interactive Developer', 'Infrastructure Engineer'],
    linkedin: 'linkedin.com/in/rubenculhane',
    twitter: '@rubenculhane',
  },
  7: {
    title: 'Talent Recruiter',
    company: 'Revolut',
    companyId: 7,
    location: 'Madrid, Spain',
    bio: 'Recruiter specializing in marketing and growth roles across EMEA. Helping Revolut scale its marketing team rapidly.',
    skills: ['Growth Hiring', 'Marketing Recruitment', 'EMEA Sourcing', 'Stakeholder Management'],
    experience: [
      { role: 'Talent Recruiter', company: 'Revolut', period: '2020 – Present', desc: 'Scaling marketing and growth teams across Europe.' },
      { role: 'Recruiter', company: 'Robinhood', period: '2018 – 2020', desc: 'Focused on marketing and communications hiring.' },
    ],
    openRoles: ['Email Marketing Specialist', 'Growth Manager'],
    linkedin: 'linkedin.com/in/lydiadiaz',
    twitter: '@lydiadiaz',
  },
  8: {
    title: 'CTO & Co-founder',
    company: 'Packer',
    companyId: 19,
    location: 'Madrid, Spain',
    bio: 'CTO with a passion for design-driven engineering. I personally review candidates to ensure cultural and technical fit at Packer.',
    skills: ['Engineering Leadership', 'Design Systems', 'Architecture', 'Hiring Strategy'],
    experience: [
      { role: 'CTO', company: 'Packer', period: '2017 – Present', desc: 'Co-founded Packer and built the engineering and design org from scratch.' },
      { role: 'Senior Engineer', company: 'MediaMonks', period: '2014 – 2017', desc: 'Led frontend engineering for major brand campaigns.' },
    ],
    openRoles: ['Visual Designer', 'Frontend Engineer'],
    linkedin: 'linkedin.com/in/jamesdokidis',
    twitter: '@jamesdokidis',
  },
  9: {
    title: 'HR Generalist',
    company: 'Twilio',
    companyId: null,
    location: 'Berlin, Germany',
    bio: 'HR generalist focused on customer-facing and operations roles. Helping Twilio build a diverse and talented workforce.',
    skills: ['HR Operations', 'Diversity Hiring', 'Interviewing', 'Compensation & Benefits'],
    experience: [
      { role: 'HR Generalist', company: 'Twilio', period: '2021 – Present', desc: 'Managing end-to-end hiring for customer success and operations.' },
      { role: 'HR Assistant', company: 'Discord', period: '2019 – 2021', desc: 'Supported HR operations and new hire onboarding.' },
    ],
    openRoles: ['Customer Manager', 'Support Specialist'],
    linkedin: 'linkedin.com/in/angelinaswann',
    twitter: '@angelinaswann',
  },
};

export const messages = [
  {
    id: 1, name: 'Jan Mayer', role: 'Recruiter at Nomad', company: 'Nomad', time: '12 mins ago',
    preview: 'We want to invite you for a qui...', avatar: 'JM', unread: true,
    avatarColor: 'bg-orange-400',
    chat: [
      { from: 'them', text: 'Hey Jake, I wanted to reach out because we saw your work contributions and were impressed by your work.', time: '12 mins ago' },
      { from: 'them', text: 'We want to invite you for a quick interview', time: '12 mins ago' },
      { from: 'me', text: 'Hi Jan, sure I would love to. Thanks for taking the time to see my work!', time: '12 mins ago' },
    ]
  },
  {
    id: 2, name: 'Joe Bartmann', role: 'HR Manager at Divvy', company: 'Divvy', time: '3:40 PM',
    preview: 'Hey thanks for your interview...', avatar: 'JB', unread: false,
    avatarColor: 'bg-blue-500',
    chat: [
      { from: 'them', text: 'Hey, thanks for coming in for the interview today. We really enjoyed meeting you!', time: '3:40 PM' },
      { from: 'me', text: 'Thank you Joe! It was a great experience. Looking forward to hearing back.', time: '3:38 PM' },
      { from: 'them', text: 'We will be in touch by end of week with next steps.', time: '3:40 PM' },
    ]
  },
  {
    id: 3, name: 'Ally Wales', role: 'Recruiter at Stripe', company: 'Stripe', time: '3:40 PM',
    preview: 'Hey thanks for your interview...', avatar: 'AW', unread: false,
    avatarColor: 'bg-green-500',
    chat: [
      { from: 'them', text: 'Hi! Just wanted to follow up on your application for the Lead Engineer role at Stripe.', time: '3:40 PM' },
      { from: 'me', text: 'Hi Ally! Yes, I am very excited about the opportunity.', time: '3:35 PM' },
      { from: 'them', text: 'Great! We would love to schedule a technical interview with you.', time: '3:40 PM' },
    ]
  },
  {
    id: 4, name: 'James Gardner', role: 'Manager at Coinbase', company: 'Coinbase', time: '3:40 PM',
    preview: 'Hey thanks for your interview...', avatar: 'JG', unread: false,
    avatarColor: 'bg-yellow-500',
    chat: [
      { from: 'them', text: 'Hello! We reviewed your portfolio and are very impressed with your design work.', time: '3:40 PM' },
      { from: 'me', text: 'Thank you James! I put a lot of effort into those projects.', time: '3:30 PM' },
      { from: 'them', text: 'We would like to move forward with a design challenge. Are you available this week?', time: '3:40 PM' },
    ]
  },
  {
    id: 5, name: 'Allison Geidt', role: 'HR at Dropbox', company: 'Dropbox', time: '3:40 PM',
    preview: 'Hey thanks for your interview...', avatar: 'AG', unread: false,
    avatarColor: 'bg-blue-600',
    chat: [
      { from: 'them', text: 'Hi there! Thanks for applying to the Brand Designer position at Dropbox.', time: '3:40 PM' },
      { from: 'me', text: 'Hi Allison! I am really excited about this opportunity.', time: '3:25 PM' },
      { from: 'them', text: 'We would love to set up a call to discuss your experience further.', time: '3:40 PM' },
    ]
  },
  {
    id: 6, name: 'Ruben Culhane', role: 'Tech Lead at Terraform', company: 'Terraform', time: '3:40 PM',
    preview: 'Hey thanks for your interview...', avatar: 'RC', unread: false,
    avatarColor: 'bg-purple-500',
    chat: [
      { from: 'them', text: 'Hey! We saw your GitHub profile and are really impressed with your open source contributions.', time: '3:40 PM' },
      { from: 'me', text: 'Thanks Ruben! I enjoy contributing to open source projects.', time: '3:20 PM' },
      { from: 'them', text: 'We have an Interactive Developer role that would be a perfect fit for you.', time: '3:40 PM' },
    ]
  },
  {
    id: 7, name: 'Lydia Diaz', role: 'Recruiter at Revolut', company: 'Revolut', time: '3:40 PM',
    preview: 'Hey thanks for your interview...', avatar: 'LD', unread: false,
    avatarColor: 'bg-red-500',
    chat: [
      { from: 'them', text: 'Hello! I am reaching out regarding the Email Marketing position at Revolut.', time: '3:40 PM' },
      { from: 'me', text: 'Hi Lydia! Yes, I applied last week. Very interested in the role.', time: '3:15 PM' },
      { from: 'them', text: 'Wonderful! Can we schedule a quick 30-minute call this week?', time: '3:40 PM' },
    ]
  },
  {
    id: 8, name: 'James Dokidis', role: 'CTO at Packer', company: 'Packer', time: '3:40 PM',
    preview: 'Hey thanks for your interview...', avatar: 'JD', unread: false,
    avatarColor: 'bg-gray-700',
    chat: [
      { from: 'them', text: 'Hi! We reviewed your application for the Visual Designer role and loved your portfolio.', time: '3:40 PM' },
      { from: 'me', text: 'Thank you! I spent a lot of time on those case studies.', time: '3:10 PM' },
      { from: 'them', text: 'We would like to invite you for an on-site interview next week.', time: '3:40 PM' },
    ]
  },
  {
    id: 9, name: 'Angelina Swann', role: 'HR at Twilio', company: 'Twilio', time: '3:40 PM',
    preview: 'Hey thanks for your interview...', avatar: 'AS', unread: false,
    avatarColor: 'bg-pink-500',
    chat: [
      { from: 'them', text: 'Hey! Thanks for your interest in the Customer Manager role at Twilio.', time: '3:40 PM' },
      { from: 'me', text: 'Hi Angelina! I am very excited about the possibility of joining Twilio.', time: '3:05 PM' },
      { from: 'them', text: 'Great! We will send over a formal interview invitation shortly.', time: '3:40 PM' },
    ]
  },
];
