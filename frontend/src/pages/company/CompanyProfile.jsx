import CompanyTopBar from '../../components/CompanyTopBar';
import { jobs } from '../../data/mockData';
import JobCard from '../../components/JobCard';

export default function CompanyProfilePage() {
  return (
    <div className="flex-1 flex flex-col bg-gray-50 min-h-screen">
      <CompanyTopBar title="Company Profile" />
      <div className="p-8 max-w-5xl" style={{ marginTop: '60px' }}>
        {/* Header */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
          <div className="h-24 bg-gradient-to-r from-emerald-400 to-teal-500" />
          <div className="p-6 -mt-8 flex items-end justify-between">
            <div className="flex items-end gap-4">
              <div className="w-16 h-16 rounded-xl bg-emerald-500 border-4 border-white flex items-center justify-center text-white font-bold text-2xl">N</div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Nomad</h1>
                <p className="text-sm text-gray-500">Director, Co-Founder</p>
              </div>
            </div>
            <div className="flex gap-3 text-sm text-gray-500">
              <span>📅 Founded: July 31, 2011</span>
              <span>👥 4000+</span>
              <span>📍 30 countries</span>
              <span>💼 Payment Gateway</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h2 className="font-bold text-gray-900 mb-3">Company Profile</h2>
              <p className="text-sm text-gray-600 leading-relaxed">Nomad is a software platform for starting and running internet businesses. Millions of businesses rely on Nomad's software tools to accept payments, expand globally, and manage their businesses online. Nomad has been at the forefront of expanding internet commerce, removing intermediaries in industries like retail, and supporting the direct relationship between businesses and their customers. Nomad is built for developers, makers, and creators. We work on solving the hard technical problems of internet commerce infrastructure of tomorrow. We're helping highly reliable systems to develop advanced payment and machine learning algorithms on cutting edge.</p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h2 className="font-bold text-gray-900 mb-3">Contact</h2>
              <div className="flex flex-wrap gap-3">
                {['twitter.com/nomad', 'facebook.com/nomad', 'linkedin.com/company/nomad', 'email@nomad.com'].map(c => (
                  <span key={c} className="text-xs bg-gray-100 text-gray-700 rounded px-3 py-1.5">{c}</span>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h2 className="font-bold text-gray-900 mb-4">Working at Nomad</h2>
              <div className="grid grid-cols-3 gap-3">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl" />
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-gray-900">Team</h2>
                <button className="text-blue-600 text-sm hover:underline">View all (47) →</button>
              </div>
              <div className="flex gap-6">
                {['Celestin Gardiner', 'Raynaud Colbert', 'Arienne Lyon'].map(name => (
                  <div key={name} className="text-center">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 mx-auto mb-2" />
                    <p className="text-xs font-medium text-gray-700">{name.split(' ')[0]}</p>
                    <p className="text-xs text-gray-400">{name.split(' ')[1]}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h2 className="font-bold text-gray-900 mb-4">Benefit</h2>
              <div className="grid grid-cols-3 gap-4">
                {['Full Healthcare', 'Unlimited Vacation', 'Skill Encouragement', 'Team Summits', 'Remote Working', 'Commuter Benefits'].map(b => (
                  <div key={b} className="p-3 border border-gray-200 rounded-xl">
                    <div className="text-xl mb-2">🎁</div>
                    <p className="text-sm font-medium text-gray-800">{b}</p>
                    <p className="text-xs text-gray-500 mt-1">We believe in providing the best benefits for our team.</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-gray-900">Open Positions</h2>
                <button className="text-blue-600 text-sm hover:underline">Show all Jobs →</button>
              </div>
              <div className="space-y-3">
                {jobs.slice(0, 4).map(j => <JobCard key={j.id} job={j} />)}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">Tech Stack</h3>
              <div className="flex flex-wrap gap-2">
                {['HTML5', 'CSS3', 'JavaScript', 'Ruby', 'Atom', 'Twitter'].map(t => (
                  <span key={t} className="text-xs bg-gray-100 text-gray-700 rounded px-2 py-1">{t}</span>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">Office Locations</h3>
              <div className="space-y-2 text-sm">
                {['🇺🇸 United States', '🏴󠁧󠁢󠁥󠁮󠁧󠁿 England', '🇯🇵 Japan', '🇦🇺 Australia', '🇨🇳 China'].map(loc => (
                  <p key={loc} className="text-gray-600">{loc}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
