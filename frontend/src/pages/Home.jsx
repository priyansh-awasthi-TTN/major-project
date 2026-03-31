import { Link } from 'react-router-dom';
import { jobs, categories } from '../data/mockdata';

const brands = [
  { name: 'vodafone', style: 'text-red-500 font-bold' },
  { name: 'intel', style: 'text-blue-700 font-bold' },
  { name: 'TESLA', style: 'text-gray-800 font-bold tracking-widest' },
  { name: 'AMD', style: 'text-gray-800 font-bold' },
  { name: 'Talkit', style: 'text-gray-700 font-semibold' },
];

const categoryIcons = {
  Design: '🎨', Sales: '📈', Marketing: '📣', Finance: '💰',
  Technology: '💻', Engineering: '</>', Business: '💼', 'Human Resource': '👥',
};

const featuredJobs = [
  { id: 1, title: 'Email Marketing', company: 'Revolut', location: 'Madrid, Spain', type: 'Full-Time', categories: ['Marketing', 'Design'], logo: 'R', color: 'bg-red-500' },
  { id: 2, title: 'Brand Designer', company: 'Dropbox', location: 'San Francisco, USA', type: 'Full-Time', categories: ['Design', 'Business'], logo: 'D', color: 'bg-blue-500' },
  { id: 3, title: 'Email Marketing', company: 'Pitch', location: 'Berlin, Germany', type: 'Full-Time', categories: ['Marketing'], logo: 'P', color: 'bg-orange-500' },
  { id: 4, title: 'Visual Designer', company: 'Blinklist', location: 'Granada, Spain', type: 'Full-Time', categories: ['Design', 'Business'], logo: 'B', color: 'bg-green-500' },
  { id: 5, title: 'Product Designer', company: 'ClassPass', location: 'Berlin, Germany', type: 'Full-Time', categories: ['Marketing', 'Design'], logo: 'C', color: 'bg-purple-500' },
  { id: 6, title: 'Lead Designer', company: 'Canva', location: 'Ankara, Turkey', type: 'Full-Time', categories: ['Design', 'Business'], logo: 'C', color: 'bg-teal-500' },
  { id: 7, title: 'Brand Strategist', company: 'GoDaddy', location: 'Marseille, France', type: 'Full-Time', categories: ['Marketing', 'Business'], logo: 'G', color: 'bg-green-600' },
  { id: 8, title: 'Data Analyst', company: 'Twitter', location: 'San Jose, USA', type: 'Full-Time', categories: ['Marketing'], logo: 'T', color: 'bg-sky-500' },
];

const latestJobs = [
  { id: 1, title: 'Social Media Assistant', company: 'Nomad', location: 'Paris, France', type: 'Full-Time', categories: ['Full-Time', 'Marketing', 'Design'], logo: 'N', color: 'bg-emerald-500' },
  { id: 2, title: 'Social Media Assistant', company: 'Udacity', location: 'New York, USA', type: 'Full-Time', categories: ['Full-Time', 'Marketing', 'Design'], logo: 'U', color: 'bg-cyan-500' },
  { id: 3, title: 'Brand Designer', company: 'Dropbox', location: 'San Francisco, USA', type: 'Full-Time', categories: ['Full-Time', 'Marketing', 'Design'], logo: 'D', color: 'bg-blue-500' },
  { id: 4, title: 'Brand Designer', company: 'Maze', location: 'San Francisco, USA', type: 'Full-Time', categories: ['Full-Time', 'Marketing', 'Design'], logo: 'M', color: 'bg-purple-500' },
  { id: 5, title: 'Interactive Developer', company: 'Terraform', location: 'Hamburg, Germany', type: 'Full-Time', categories: ['Full-Time', 'Marketing', 'Design'], logo: 'T', color: 'bg-indigo-500' },
  { id: 6, title: 'Interactive Developer', company: 'Canva', location: 'Hamburg, Germany', type: 'Full-Time', categories: ['Full-Time', 'Marketing', 'Design'], logo: 'C', color: 'bg-pink-500' },
  { id: 7, title: 'HR Manager', company: 'Twitter', location: 'Zurich, Switzerland', type: 'Full-Time', categories: ['Full-Time', 'Marketing', 'Design'], logo: 'T', color: 'bg-sky-500' },
  { id: 8, title: 'HR Manager', company: 'Webflow', location: 'Zurich, Switzerland', type: 'Full-Time', categories: ['Full-Time', 'Marketing', 'Design'], logo: 'W', color: 'bg-blue-700' },
];

export default function Home() {
  return (
    <div className="bg-white">
      {/* Hero - dark navy */}
      <section className="bg-[#1a1a2e] text-white px-8 py-20">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-5xl font-bold leading-tight mb-4">
            Discover more than<br />
            <span className="text-blue-500 underline decoration-2 underline-offset-4">5000+ Jobs</span>
          </h1>
          <p className="text-gray-400 max-w-md mb-8 text-sm leading-relaxed">
            Great platform for the job seeker that searching for new career heights and passionate about startups.
          </p>
          <div className="flex bg-white rounded-lg overflow-hidden max-w-2xl shadow-lg">
            <div className="flex items-center gap-2 flex-1 px-4 py-3">
              <span className="text-gray-400 text-sm">🔍</span>
              <input className="flex-1 text-gray-800 text-sm outline-none" placeholder="Job title or keyword" />
            </div>
            <div className="w-px bg-gray-200 my-2" />
            <div className="flex items-center gap-2 flex-1 px-4 py-3">
              <span className="text-gray-400 text-sm">📍</span>
              <input className="flex-1 text-gray-800 text-sm outline-none" placeholder="Florence, Italy" />
            </div>
            <button className="bg-blue-600 text-white text-sm px-6 py-3 hover:bg-blue-700 font-medium">Search my job</button>
          </div>
          <p className="text-gray-500 text-xs mt-3">Popular: UI Designer, UX Researcher, Android, Admin</p>
        </div>
      </section>

      {/* Brands */}
      <section className="border-b border-gray-100 py-8 bg-[#1a1a2e]">
        <div className="max-w-5xl mx-auto px-8">
          <p className="text-gray-500 text-xs mb-5">Companies we helped grow:</p>
          <div className="flex flex-wrap gap-10 items-center">
            {brands.map(b => <span key={b.name} className={`text-lg ${b.style}`}>{b.name}</span>)}
          </div>
        </div>
      </section>

      {/* Explore by category */}
      <section className="max-w-5xl mx-auto px-8 py-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Explore by <span className="text-blue-600">category</span></h2>
          <Link to="/find-jobs" className="text-blue-600 text-sm hover:underline flex items-center gap-1">Show all jobs →</Link>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {categories.map(cat => (
            <Link to="/find-jobs" key={cat.name}
              className={`p-5 rounded-xl border transition hover:border-blue-500 hover:shadow-sm cursor-pointer ${cat.name === 'Marketing' ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-200 text-gray-800'}`}>
              <div className="text-2xl mb-3">{categoryIcons[cat.name] || '💼'}</div>
              <h3 className="font-semibold text-sm">{cat.name}</h3>
              <p className={`text-xs mt-1 ${cat.name === 'Marketing' ? 'text-blue-200' : 'text-gray-400'}`}>{cat.jobs} jobs available →</p>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="max-w-5xl mx-auto px-8 pb-16">
        <div className="bg-blue-600 rounded-2xl p-10 flex items-center justify-between overflow-hidden relative">
          <div className="z-10">
            <h2 className="text-2xl font-bold text-white mb-2">Start posting jobs today</h2>
            <p className="text-blue-200 text-sm mb-5">Start posting jobs for only $10.</p>
            <button className="bg-white text-blue-600 font-semibold text-sm px-5 py-2.5 rounded-md hover:bg-blue-50">Sign Up For Free</button>
          </div>
          <div className="hidden md:block bg-white/10 rounded-2xl p-5 min-w-56 z-10">
            <p className="text-blue-200 text-xs mb-1">Dashboard Stats</p>
            <p className="text-white text-3xl font-bold">21,457</p>
            <p className="text-blue-200 text-xs">Jobs listed</p>
            <div className="mt-3 pt-3 border-t border-white/20">
              <p className="text-blue-200 text-xs mb-2">Applicants Statistic</p>
              <p className="text-white text-2xl font-bold">5 <span className="text-sm font-normal text-blue-200">Applicants</span></p>
            </div>
            <p className="text-blue-200 text-xs mt-2">Recent Applicants</p>
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="max-w-5xl mx-auto px-8 pb-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Featured <span className="text-blue-600">jobs</span></h2>
          <Link to="/find-jobs" className="text-blue-600 text-sm hover:underline">Show all jobs →</Link>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {featuredJobs.map(job => (
            <Link to={`/jobs/${job.id}`} key={job.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition block">
              <div className="flex items-start justify-between mb-3">
                <span className="text-xs border border-blue-500 text-blue-600 rounded px-2 py-0.5">{job.type}</span>
              </div>
              <div className="flex items-start gap-3">
                <div className={`${job.color} text-white rounded-xl w-11 h-11 flex items-center justify-center font-bold text-base flex-shrink-0`}>{job.logo}</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-sm">{job.title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{job.company} • {job.location}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {job.categories.map(c => (
                      <span key={c} className={`text-xs rounded px-2 py-0.5 border ${c === 'Design' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : c === 'Business' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-orange-50 text-orange-600 border-orange-200'}`}>{c}</span>
                    ))}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Latest Jobs Open */}
      <section className="max-w-5xl mx-auto px-8 pb-20">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Latest <span className="text-blue-600">jobs open</span></h2>
          <Link to="/find-jobs" className="text-blue-600 text-sm hover:underline">Show all jobs →</Link>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {latestJobs.map((job, i) => (
            <Link to={`/jobs/${job.id}`} key={i} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition flex items-start gap-4 block">
              <div className={`${job.color} text-white rounded-xl w-11 h-11 flex items-center justify-center font-bold text-base flex-shrink-0`}>{job.logo}</div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-sm">{job.title}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{job.company} • {job.location}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {job.categories.map(c => (
                    <span key={c} className={`text-xs rounded px-2 py-0.5 border ${c === 'Full-Time' ? 'border-green-500 text-green-600' : c === 'Design' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-orange-50 text-orange-600 border-orange-200'}`}>{c}</span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
