import { useState } from 'react';
import { Link } from 'react-router-dom';
import CompanyTopBar from '../../components/CompanyTopBar';
import { applicants } from '../../data/companyMockData';

const statusColor = {
  'In Review': 'bg-blue-100 text-blue-600',
  'Shortlisted': 'bg-yellow-100 text-yellow-700',
  'Declined': 'bg-red-100 text-red-600',
  'Interviewing': 'bg-purple-100 text-purple-600',
};

export default function AllApplicants() {
  const [view, setView] = useState('table'); // table | pipeline | kanban

  return (
    <div className="flex-1 flex flex-col bg-gray-50 min-h-screen">
      <CompanyTopBar title="Social Media Assistant" subtitle="Design · Full Time · 4/11 Hired" />
      <div className="px-8 py-4 bg-white border-b border-gray-200 flex items-center justify-between">
        <div className="flex gap-1">
          {['Applicant Profile', 'Resume', 'Hiring Progress', 'Interview Schedule'].map((t, i) => (
            <button key={t} className={`px-4 py-2 text-sm rounded-lg ${i === 0 ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>{t}</button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <input className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none" placeholder="Search applicants..." />
          <button className="border border-gray-300 text-gray-600 text-sm px-3 py-1.5 rounded-lg">Filter</button>
          <div className="flex gap-1">
            <button onClick={() => setView('pipeline')} className={`px-3 py-1.5 text-sm rounded-lg border ${view === 'pipeline' ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-600'}`}>Pipeline View</button>
            <button onClick={() => setView('table')} className={`px-3 py-1.5 text-sm rounded-lg border ${view === 'table' ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-600'}`}>Table View</button>
          </div>
        </div>
      </div>

      <div className="p-8">
        <p className="text-sm text-gray-500 mb-4">Total Applicants: 10</p>

        {/* TABLE VIEW */}
        {view === 'table' && (
          <div className="bg-white rounded-xl border border-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 text-xs border-b border-gray-100">
                  <th className="text-left p-4">Full Name</th>
                  <th className="text-left p-4">Score</th>
                  <th className="text-left p-4">Hiring Stage</th>
                  <th className="text-left p-4">Applied Date</th>
                  <th className="text-left p-4">Job Role</th>
                  <th className="p-4" />
                </tr>
              </thead>
              <tbody>
                {applicants.map(a => (
                  <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`${a.color} text-white rounded-full w-9 h-9 flex items-center justify-center text-xs font-bold`}>{a.avatar}</div>
                        <p className="font-medium text-gray-800">{a.name}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-400">★</span>
                        <span className="text-gray-700">{a.rating}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor[a.stage]}`}>{a.stage}</span>
                    </td>
                    <td className="p-4 text-gray-500">{a.applied}</td>
                    <td className="p-4 text-gray-600">{a.status}</td>
                    <td className="p-4">
                      <Link to={`/company/applicants/${a.id}`} className="bg-blue-50 text-blue-600 text-xs px-3 py-1.5 rounded-lg hover:bg-blue-600 hover:text-white transition">See Application</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-between items-center p-4">
              <p className="text-xs text-gray-400">View 10 applicants per page</p>
              <div className="flex gap-2">
                {[1,2].map(p => (
                  <button key={p} className={`w-8 h-8 rounded text-sm ${p === 1 ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>{p}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PIPELINE VIEW */}
        {view === 'pipeline' && (
          <div className="grid grid-cols-4 gap-4">
            {['In Review', 'Shortlisted', 'Interviewing', 'Declined'].map(stage => {
              const stageApplicants = applicants.filter(a => a.stage === stage);
              const colColor = {
                'In Review': 'bg-blue-100 text-blue-600',
                'Shortlisted': 'bg-yellow-100 text-yellow-700',
                'Interviewing': 'bg-purple-100 text-purple-600',
                'Declined': 'bg-red-100 text-red-600',
              };
              return (
                <div key={stage} className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${colColor[stage]}`}>{stage}</span>
                    <span className="text-xs text-gray-400">{stageApplicants.length}</span>
                  </div>
                  <div className="space-y-3">
                    {stageApplicants.map(a => (
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
                    {stageApplicants.length === 0 && (
                      <p className="text-xs text-gray-400 text-center py-4">No applicants</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
