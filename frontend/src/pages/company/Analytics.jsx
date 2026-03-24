import { useParams, Link } from 'react-router-dom';
import CompanyTopBar from '../../components/CompanyTopBar';

export default function Analytics() {
  const { id } = useParams();
  return (
    <div className="flex-1 flex flex-col bg-gray-50 min-h-screen">
      <CompanyTopBar title="Social Media Assistant" subtitle="Design · Full Time · 4/11 Hired" />
      <div className="px-8 py-4 bg-white border-b border-gray-200 flex items-center gap-4">
        <div className="flex gap-1">
          {[
            { label: 'Applicants', path: `/company/jobs/${id}/applicants` },
            { label: 'Job Details', path: `/company/jobs/${id}/detail` },
            { label: 'Analytics', path: `/company/jobs/${id}/analytics` },
          ].map((t, i) => (
            <Link key={t.label} to={t.path}
              className={`px-4 py-2 text-sm rounded-lg ${i === 2 ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>{t.label}</Link>
          ))}
        </div>
        <button className="ml-auto text-blue-600 text-sm border border-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-50">More Action</button>
      </div>

      <div className="p-8">
        {/* Top stats */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <p className="text-sm text-gray-500 mb-1">Total Views</p>
            <p className="text-3xl font-bold text-gray-900">23,564 <span className="text-sm text-green-500 font-normal">↑ 6.4%</span></p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <p className="text-sm text-gray-500 mb-1">Total Applied</p>
            <p className="text-3xl font-bold text-gray-900">132 <span className="text-sm text-red-500 font-normal">↓ 0.5%</span></p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <p className="text-sm text-gray-500 mb-2">Traffic channel</p>
            <div className="flex items-center gap-3">
              <div className="relative w-16 h-16">
                <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#3b82f6" strokeWidth="3" strokeDasharray="40 60" />
                </svg>
              </div>
              <div className="text-xs space-y-1">
                <p><span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-1" />Direct 40%</p>
                <p><span className="inline-block w-2 h-2 bg-purple-400 rounded-full mr-1" />Social 22%</p>
                <p><span className="inline-block w-2 h-2 bg-yellow-400 rounded-full mr-1" />Referral 21%</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Line chart */}
          <div className="col-span-2 bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-gray-900">Job Listing View rate</h2>
              <select className="border border-gray-300 rounded text-xs px-2 py-1 outline-none">
                <option>Last 7 Days</option>
              </select>
            </div>
            {/* Mock line chart */}
            <div className="h-40 flex items-end gap-1">
              {[30, 45, 35, 60, 40, 70, 55, 80, 50, 65, 45, 75, 60, 85].map((h, i) => (
                <div key={i} className="flex-1 bg-blue-100 rounded-t hover:bg-blue-300 transition" style={{ height: `${h}%` }} />
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-2">
              {['19 Jul', '20 Jul', '21 Jul', '22 Jul', '23 Jul', '24 Jul', '25 Jul'].map(d => <span key={d}>{d}</span>)}
            </div>
          </div>

          {/* Visitors by country */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h2 className="font-semibold text-gray-900 mb-4">Visitors by country</h2>
            <div className="space-y-3">
              {[
                { country: '🇺🇸 USA', count: '3,481' },
                { country: '🇩🇪 Germany', count: '2,982' },
                { country: '🇫🇷 France', count: '2,765' },
                { country: '🇮🇹 Italy', count: '2,644' },
                { country: '🇬🇧 UK', count: '2,644' },
              ].map(v => (
                <div key={v.country} className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">{v.country}</span>
                  <span className="font-medium text-gray-800">{v.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
