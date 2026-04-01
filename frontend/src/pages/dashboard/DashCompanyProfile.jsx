import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { companies, getCompanyOfficeLocations } from '../../data/mockData';
import DashTopBar from '../../components/DashTopBar';
import apiService from '../../services/api';

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

export default function DashCompanyProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  let company = companies.find(c => c.id === Number(id) || String(c.name).toLowerCase() === String(id).toLowerCase());

  if (!company) {
    company = {
      id,
      name: String(id),
      logo: String(id).substring(0, 1).toUpperCase(),
      color: 'bg-indigo-500',
      description: '',
      industry: 'Technology',
      jobs: 0,
    };
  }

  const [realJobs, setRealJobs] = useState([]);

  useEffect(() => {
    apiService.getJobs()
      .then(data => {
        if (data) {
          setRealJobs(data.filter(job => (job.company || '').toLowerCase() === company.name.toLowerCase()));
        }
      })
      .catch(console.error);
  }, [company.name]);

  const officeLocations = getCompanyOfficeLocations(company.id);
  const officeLocationSummary = officeLocations.length === 1
    ? '1 office location'
    : `${officeLocations.length} office locations`;

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50">
      <DashTopBar>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <button onClick={() => navigate('/dashboard/companies')} className="hover:text-blue-600">
            ← Browse Companies
          </button>
          <span>/</span>
          <span className="text-gray-800 font-medium">{company.name}</span>
        </div>
      </DashTopBar>

      <div className="overflow-y-auto flex-1">
        <div className="max-w-6xl mx-auto px-8 py-8">
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 space-y-6">
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
                    <span>📍 {officeLocationSummary}</span>
                    <span>🏷️ {company.industry}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h2 className="font-bold text-gray-900 mb-3">Company Profile</h2>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                  {company.description || `${company.name} is dedicated to building modern solutions that impact millions daily.`} {company.name} remains at the forefront of digital innovation, helping businesses of all sizes scale gracefully and safely on the web. We are building elegant abstractions to push technology boundaries.
                </p>
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
                <div className="grid grid-cols-3 gap-3 mt-5">
                  <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl h-32 flex items-center justify-center text-4xl">🏢</div>
                  <div className="bg-gradient-to-br from-green-100 to-teal-100 rounded-xl h-32 flex items-center justify-center text-4xl">💻</div>
                  <div className="bg-gradient-to-br from-orange-100 to-pink-100 rounded-xl h-32 flex items-center justify-center text-4xl">🤝</div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex justify-between items-center mb-5">
                  <h2 className="font-bold text-gray-900">Team</h2>
                  <button className="text-blue-600 text-sm hover:underline">See all (47) →</button>
                </div>
                <div className="flex gap-5">
                  {teamMembers.map((member, index) => (
                    <div key={member.name} className="text-center">
                      <div className={`w-14 h-14 rounded-full ${avatarColors[index]} mx-auto mb-2 flex items-center justify-center text-white font-bold text-lg`}>
                        {member.name.split(' ').map(name => name[0]).join('')}
                      </div>
                      <p className="text-xs font-medium text-gray-700">{member.name.split(' ')[0]}</p>
                      <p className="text-xs text-gray-400">{member.name.split(' ')[1]}</p>
                    </div>
                  ))}
                </div>
              </div>

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

              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex justify-between items-center mb-5">
                  <h2 className="font-bold text-gray-900">Company Reviews</h2>
                  <span className="text-sm font-bold text-green-600 px-3 py-1 bg-green-50 rounded-full">★ 4.8 Average</span>
                </div>
                <div className="space-y-4">
                  <div className="border-b border-gray-100 pb-4">
                    <p className="font-semibold text-gray-800 text-sm">"Great work-life balance and supportive team"</p>
                    <div className="flex items-center gap-2 mt-1 mb-2 text-xs text-gray-500">
                      <span className="text-yellow-400">★★★★☆</span>
                      <span>• Current Employee</span>
                      <span>• 2 months ago</span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">The management is very transparent and genuinely cares about your growth. Flexible remote options are honored without micro-management.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">"Fast paced but highly rewarding"</p>
                    <div className="flex items-center gap-2 mt-1 mb-2 text-xs text-gray-500">
                      <span className="text-yellow-400">★★★★★</span>
                      <span>• Former Employee</span>
                      <span>• 10 months ago</span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">You will learn a lot in a short amount of time. The benefits are top-tier and the compensation reviews occur bi-annually.</p>
                  </div>
                  <button className="text-blue-600 text-xs font-medium hover:underline w-full text-center mt-2">See all 142 reviews</button>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-4 mt-2">
                  <h2 className="text-xl font-bold text-gray-900">Open Jobs</h2>
                  <Link to="/dashboard/find-jobs" className="text-blue-600 text-sm hover:underline">Show all jobs →</Link>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {realJobs.length === 0 ? (
                    <div className="col-span-2 bg-white rounded-xl p-8 border border-gray-200 text-center">
                      <p className="text-gray-500 text-sm font-medium">No open positions currently available</p>
                    </div>
                  ) : (
                    realJobs.map(job => (
                      <Link
                        key={job.id}
                        to={`/dashboard/jobs/${job.id}`}
                        className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition block"
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <div className={`${job.color || 'bg-blue-500'} text-white rounded-xl w-10 h-10 flex items-center justify-center font-bold flex-shrink-0`}>
                            {job.logo || company.logo}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 text-sm">{job.title}</h3>
                            <p className="text-xs text-gray-500 mt-0.5">{job.company} • {job.location}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className="text-xs border border-green-500 text-green-600 rounded px-2 py-0.5">{job.type}</span>
                          {((typeof job.categories === 'string' ? job.categories.split(',') : (job.categories || []))).map(category => (
                            <span key={category} className="text-xs rounded px-2 py-0.5 border bg-orange-50 text-orange-600 border-orange-200">{category}</span>
                          ))}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
                          <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${Math.min(((job.applied || 0) / (job.capacity || 10)) * 100, 100)}%` }} />
                        </div>
                        <p className="text-xs text-gray-400"><span className="font-medium text-gray-600">{job.applied || 0} applied</span> of {job.capacity || 10} capacity</p>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-xl p-5 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">Tech Stack</h3>
                <div className="flex flex-wrap gap-2">
                  {['HTML5', 'CSS3', 'JavaScript', 'Ruby', 'Atom', 'Twitter'].map(tech => (
                    <span key={tech} className="text-xs bg-gray-100 text-gray-700 rounded px-2 py-1">⚙️ {tech}</span>
                  ))}
                </div>
                <button className="text-blue-600 text-xs mt-3 hover:underline">View tech stack →</button>
              </div>

              <div className="bg-white rounded-xl p-5 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">Office Location</h3>
                <p className="text-sm text-gray-500 mb-3">
                  {officeLocations.length > 0
                    ? `${company.name} operates across ${officeLocationSummary}`
                    : `${company.name} will share office locations soon`}
                </p>
                <div className="space-y-2 text-sm">
                  {officeLocations.length > 0 ? officeLocations.map(location => (
                    <p key={location} className="text-gray-600">{location}</p>
                  )) : (
                    <p className="text-gray-400">Office locations coming soon</p>
                  )}
                </div>
                <button className="text-blue-600 text-xs mt-3 hover:underline">View locations →</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
