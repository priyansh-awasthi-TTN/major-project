import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import CompanyTopBar from '../../components/CompanyTopBar';
import apiService from '../../services/api';

const statusColor = {
  'In Review': 'bg-blue-100 text-blue-600',
  'Shortlisted': 'bg-yellow-100 text-yellow-700',
  'Declined': 'bg-red-100 text-red-600',
  'Interviewing': 'bg-purple-100 text-purple-600',
};

export default function AllApplicants() {
  const [view, setView] = useState('table'); // table | pipeline
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiService.getCompanyApplications()
      .then(data => setApps(data || []))
      .catch(() => setApps([]))
      .finally(() => setLoading(false));
  }, []);

  // Compute initials for avatar
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };
  
  // Predict color loosely based on char code
  const getColor = (name) => {
    const colors = ['bg-blue-500', 'bg-red-500', 'bg-green-500', 'bg-yellow-500', 'bg-teal-500', 'bg-purple-500'];
    if (!name) return colors[0];
    return colors[name.charCodeAt(0) % colors.length];
  };

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
        <p className="text-sm text-gray-500 mb-4">Total Applicants: {apps.length}</p>

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
                {apps.map(a => (
                  <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`${getColor(a.candidateName)} text-white rounded-full w-9 h-9 flex items-center justify-center text-xs font-bold`}>{getInitials(a.candidateName)}</div>
                        <p className="font-medium text-gray-800">{a.candidateName}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-400">★</span>
                        <span className="text-gray-700">0.0</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor[a.status] || 'bg-gray-100 text-gray-600'}`}>{a.status}</span>
                    </td>
                    <td className="p-4 text-gray-500">{a.dateApplied}</td>
                    <td className="p-4 text-gray-600">{a.title}</td>
                    <td className="p-4">
                      {a.resumeUrl ? (
                         <a href={a.resumeUrl} target="_blank" rel="noreferrer" className="bg-blue-50 text-blue-600 text-xs px-3 py-1.5 rounded-lg hover:bg-blue-600 hover:text-white transition">View CV</a>
                      ) : (
                         <span className="text-xs text-gray-400">No CV</span>
                      )}
                    </td>
                  </tr>
                ))}
                {apps.length === 0 && (
                  <tr><td colSpan={6} className="text-center text-gray-400 p-8 text-sm">No applicants found</td></tr>
                )}
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
              const stageApplicants = apps.filter(a => a.status === stage);
              const colColor = {
                'In Review': 'bg-blue-100 text-blue-600',
                'Shortlisted': 'bg-yellow-100 text-yellow-700',
                'Interviewing': 'bg-purple-100 text-purple-600',
                'Declined': 'bg-red-100 text-red-600',
              };
              return (
                <div key={stage} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm pb-10 h-[70vh] overflow-y-auto">
                  <div className="flex items-center justify-between mb-4 sticky top-0 bg-white pb-2 z-10 border-b border-gray-100">
                    <span className={`text-xs px-3 py-1.5 rounded-full font-semibold ${colColor[stage] || 'bg-gray-100 text-gray-600'}`}>{stage}</span>
                    <span className="text-xs font-bold text-gray-400">{stageApplicants.length}</span>
                  </div>
                  <div className="space-y-3 mt-4">
                    {stageApplicants.map(a => (
                      <div key={a.id} className="block bg-gray-50 rounded-xl p-3 border border-gray-200 hover:border-blue-400 hover:shadow-md transition">
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`${getColor(a.candidateName)} text-white rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold shadow-sm`}>{getInitials(a.candidateName)}</div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800 leading-tight">{a.candidateName}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{a.title}</p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-400 mb-2 mt-3 flex items-center gap-1">📅 Applied {a.dateApplied}</p>
                        <div className="flex gap-2">
                          {a.resumeUrl && <a href={a.resumeUrl} target="_blank" rel="noreferrer" className="flex-1 text-center bg-white border border-gray-300 text-gray-700 text-xs px-2 py-1.5 rounded hover:bg-gray-50 transition shadow-sm font-medium">CV</a>}
                          <a href={`mailto:${a.candidateEmail}`} className="flex-1 text-center bg-blue-50 text-blue-600 text-xs px-2 py-1.5 rounded border border-blue-100 hover:bg-blue-100 transition font-medium">Email</a>
                        </div>
                      </div>
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
