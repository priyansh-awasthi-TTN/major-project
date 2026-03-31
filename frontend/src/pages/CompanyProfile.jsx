import { useParams, Link } from 'react-router-dom';
import { companies, jobs } from '../data/mockdata';

const companyJobs = {
  1: [1, 2, 3, 4, 5, 6],
  2: [2, 3],
  3: [3, 7],
  4: [6, 8],
  5: [5, 1],
  6: [3, 6],
  7: [4, 8],
  8: [7, 3],
  9: [1, 2],
  10: [2, 6],
  11: [6, 3],
  12: [1, 3],
  13: [2, 5],
  14: [6, 7],
  15: [2, 6],
  16: [2, 8],
  17: [6, 3],
  18: [1, 2],
  19: [8, 3],
  20: [2, 3],
};

const perks = [
  { icon: '🏥', label: 'Full Healthcare', desc: 'We believe in thriving communities and that starts with our team being happy and healthy.' },
  { icon: '🏖️', label: 'Unlimited Vacation', desc: 'We believe you should have a flexible schedule that makes space for family, wellness, and fun.' },
  { icon: '📚', label: 'Skill Development', desc: 'We believe in always learning and leveling up our skills. Freedom to try and learn things.' },
  { icon: '⛺', label: 'Team Summits', desc: 'Every 6 months we have a full team summit where we meet up for a week of talks, workshops.' },
  { icon: '🏠', label: 'Remote Working', desc: 'You know how you perform your best. Work from home, coffee shop or anywhere when you feel like it.' },
  { icon: '🚌', label: 'Commuter Benefits', desc: "We're grateful for all the time and energy each team member puts into getting to work every day." },
  { icon: '❤️', label: 'We give back', desc: 'We anonymously match any donation our employees make (up to $/€ 600) so you can support the causes you love.' },
  { icon: '🤝', label: 'Flexible Team', desc: 'We believe in a flexible team structure that allows for growth and change as the company evolves.' },
];

const teamMembers = [
  { name: 'Colette Garfield', role: 'Managing Director' },
  { name: 'Raynaud Colbert', role: 'Managing Director' },
  { name: 'Brianna Lyon', role: 'Managing Director' },
  { name: 'Bernard Alexander', role: 'Managing Director' },
  { name: 'Christina Johanson', role: 'Managing Director' },
];

const avatarColors = ['bg-blue-400', 'bg-purple-400', 'bg-pink-400', 'bg-indigo-400', 'bg-teal-400'];

export default function CompanyProfile() {
  const { id } = useParams();
  const company = companies.find(c => c.id === Number(id)) || companies[0];
  const openJobIds = companyJobs[company.id] || [1, 2];
  const openJobs = openJobIds.map(jid => jobs.find(j => j.id === jid)).filter(Boolean);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-8 py-8">
        <p className="text-sm text-gray-400 mb-6">
          Home / <Link to="/browse-companies" className="hover:text-blue-600">Companies</Link> / <span className="text-gray-700">{company.name}</span>
        </p>

        <div className="grid grid-cols-3 gap-6">
          {/* Main */}
          <div className="col-span-2 space-y-6">

            {/* Header */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="h-28 bg-gradient-to-r from-blue-500 to-purple-600" />
              <div className="px-6 pb-6">
                <div className="flex items-end justify-between -mt-8 mb-4">
                  <div className={`${company.color} text-white rounded-xl w-16 h-16 flex items-center justify-center font-bold text-2xl border-4 border-white flex-shrink-0`}>
                    {company.logo}
                  </div>
                  <span className="text-xs bg-blue-50 text-blue-600 border border-blue-200 rounded-full px-3 py-1 mb-1">{company.jobs} Jobs</span>
                </div>
                <h1 className="text-xl font-bold text-gray-900">{company.name}</h1>
                <p className="text-sm text-blue-500 mb-3">https://{company.name.toLowerCase().replace(/\s/g, '')}.com</p>
                <div className="flex gap-6 text-sm text-gray-500">
                  <span>📅 Founded: July 31, 2011</span>
                  <span>👥 4000+</span>
                  <span>📍 36 countries</span>
                  <span>🏷️ {company.industry}</span>
                </div>
              </div>
            </div>

            {/* Company Profile */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h2 className="font-bold text-gray-900 mb-3">Company Profile</h2>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                {company.description} {company.name} is a technology company that builds economic infrastructure for the internet.
                Businesses of every size—from new startups to public companies—use our software to accept payments and manage their businesses online.
                We believe that growing the GDP of the internet is a problem rooted in code and design, not finance.
                We obsessively seek out elegant, composable abstractions that enable robust, scalable, flexible integrations.
              </p>

              {/* Contact */}
              <h3 className="font-semibold text-gray-900 text-sm mb-3">Contact</h3>
              <div className="flex gap-3 flex-wrap">
                <a href="#" className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50">
                  <span>🐦</span> @{company.name.toLowerCase()}
                </a>
                <a href="#" className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50">
                  <span>📘</span> facebook.com/{company.name.toLowerCase()}
                </a>
                <a href="#" className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50">
                  <span>💼</span> linkedin.com/company/{company.name.toLowerCase()}
                </a>
              </div>

              {/* Office photos */}
              <div className="grid grid-cols-3 gap-3 mt-5">
                <div className="col-span-1 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl h-32 flex items-center justify-center text-4xl">🏢</div>
                <div className="col-span-1 bg-gradient-to-br from-green-100 to-teal-100 rounded-xl h-32 flex items-center justify-center text-4xl">💻</div>
                <div className="col-span-1 bg-gradient-to-br from-orange-100 to-pink-100 rounded-xl h-32 flex items-center justify-center text-4xl">🤝</div>
              </div>
            </div>

            {/* Team */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex justify-between items-center mb-5">
                <h2 className="font-bold text-gray-900">Team</h2>
                <Link to="#" className="text-blue-600 text-sm">See all (47) →</Link>
              </div>
              <div className="flex gap-5">
                {teamMembers.map((member, i) => (
                  <div key={member.name} className="text-center">
                    <div className={`w-14 h-14 rounded-full ${avatarColors[i]} mx-auto mb-2 flex items-center justify-center text-white font-bold text-lg`}>
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <p className="text-xs font-medium text-gray-700">{member.name.split(' ')[0]}</p>
                    <p className="text-xs text-gray-400">{member.name.split(' ')[1]}</p>
                    <div className="flex gap-1 justify-center mt-1">
                      <span className="text-gray-300 text-xs">🐦</span>
                      <span className="text-gray-300 text-xs">💼</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Perks & Benefits */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h2 className="font-bold text-gray-900 mb-1">Perks & Benefits</h2>
              <p className="text-sm text-gray-400 mb-5">This job comes with several perks and benefits</p>
              <div className="grid grid-cols-4 gap-4">
                {perks.map(perk => (
                  <div key={perk.label} className="p-4 border border-gray-200 rounded-xl">
                    <div className="text-2xl mb-2">{perk.icon}</div>
                    <p className="text-sm font-semibold text-gray-800 mb-1">{perk.label}</p>
                    <p className="text-xs text-gray-400 leading-relaxed">{perk.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Open Jobs */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Open Jobs</h2>
                <Link to="/find-jobs" className="text-blue-600 text-sm">Show all jobs →</Link>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {openJobs.map(job => (
                  <Link key={job.id} to={`/companies/${company.id}/jobs/${job.id}`}
                    className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition block">
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`${job.color} text-white rounded-xl w-10 h-10 flex items-center justify-center font-bold flex-shrink-0`}>{job.logo}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-sm">{job.title}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{job.company} • {job.location}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="text-xs border border-green-500 text-green-600 rounded px-2 py-0.5">{job.type}</span>
                      {job.categories.map(c => (
                        <span key={c} className={`text-xs rounded px-2 py-0.5 border ${
                          c === 'Design' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                          c === 'Business' ? 'bg-green-50 text-green-700 border-green-200' :
                          'bg-orange-50 text-orange-600 border-orange-200'
                        }`}>{c}</span>
                      ))}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
                      <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${(job.applied / job.capacity) * 100}%` }} />
                    </div>
                    <p className="text-xs text-gray-400"><span className="font-medium text-gray-600">{job.applied} applied</span> of {job.capacity} capacity</p>
                  </Link>
                ))}
              </div>
            </div>

          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">Tech Stack</h3>
              <div className="flex flex-wrap gap-2">
                {['HTML5', 'CSS3', 'JavaScript', 'Ruby', 'Atom', 'Twitter'].map(t => (
                  <span key={t} className="text-xs bg-gray-100 text-gray-700 rounded px-2 py-1 flex items-center gap-1">
                    <span>⚙️</span>{t}
                  </span>
                ))}
              </div>
              <button className="text-blue-600 text-xs mt-3 hover:underline">View tech stack →</button>
            </div>

            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">Office Location</h3>
              <p className="text-sm text-gray-500 mb-3">{company.name} operates across multiple countries</p>
              <div className="space-y-2 text-sm">
                {['🇺🇸 United States', '🏴󠁧󠁢󠁥󠁮󠁧󠁿 England', '🇯🇵 Japan', '🇦🇺 Australia', '🇨🇳 China'].map(loc => (
                  <p key={loc} className="text-gray-600">{loc}</p>
                ))}
              </div>
              <button className="text-blue-600 text-xs mt-3 hover:underline">View countries →</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
