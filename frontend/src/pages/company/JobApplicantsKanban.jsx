import { Link, useParams } from 'react-router-dom';
import CompanyTopBar from '../../components/CompanyTopBar';
import { applicants } from '../../data/companyMockData';

const stages = ['In Review', 'Shortlisted', 'Interview', 'Hired'];
const stageColor = {
  'In Review': 'bg-blue-100 text-blue-600',
  'Shortlisted': 'bg-yellow-100 text-yellow-700',
  'Interview': 'bg-purple-100 text-purple-600',
  'Hired': 'bg-green-100 text-green-600',
};

export default function JobApplicantsKanban() {
  const { id } = useParams();
  const grouped = stages.reduce((acc, s) => {
    acc[s] = applicants.filter(a => {
      if (s === 'Interview') return a.stage === 'Interviewing';
      return a.stage === s;
    });
    return acc;
  }, {});

  return (
    <div className="flex-1 flex flex-col bg-gray-50 min-h-screen">
      <CompanyTopBar title="Social Media Assistant" subtitle="Design · Full Time · 4/11 Hired" />
      <div className="px-8 py-4 bg-white border-b border-gray-200 flex items-center justify-between">
        <div className="flex gap-1">
          {[
            { label: 'Applicants', path: `/company/jobs/${id}/applicants` },
            { label: 'Job Details', path: `/company/jobs/${id}/detail` },
            { label: 'Analytics', path: `/company/jobs/${id}/analytics` },
          ].map((t, i) => (
            <Link key={t.label} to={t.path}
              className={`px-4 py-2 text-sm rounded-lg ${i === 0 ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>{t.label}</Link>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <input className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none" placeholder="Search..." />
          <button className="border border-gray-300 text-gray-600 text-sm px-3 py-1.5 rounded-lg">Filter</button>
          <div className="flex gap-1">
            <button className="px-3 py-1.5 text-sm rounded-lg border bg-blue-600 text-white border-blue-600">Pipeline View</button>
            <button className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 text-gray-600">Table View</button>
          </div>
        </div>
      </div>

      <div className="p-8">
        <p className="text-sm text-gray-500 mb-4">Total Applicants: 10</p>
        <div className="grid grid-cols-4 gap-4">
          {stages.map(stage => (
            <div key={stage} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${stageColor[stage]}`}>{stage}</span>
                <span className="text-xs text-gray-400">{grouped[stage]?.length || 0}</span>
              </div>
              <div className="space-y-3">
                {(grouped[stage] || []).map(a => (
                  <Link key={a.id} to={`/company/applicants/${a.id}`} className="block bg-gray-50 rounded-xl p-3 hover:shadow-sm transition">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`${a.color} text-white rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold`}>{a.avatar}</div>
                      <div>
                        <p className="text-xs font-medium text-gray-800">{a.name}</p>
                        <p className="text-xs text-gray-400">{a.role}</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400">Applied: {a.applied}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-yellow-400 text-xs">★</span>
                      <span className="text-xs text-gray-600">{a.rating}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
