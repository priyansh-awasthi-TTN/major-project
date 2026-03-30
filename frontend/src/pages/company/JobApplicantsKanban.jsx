import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import CompanyTopBar from '../../components/CompanyTopBar';
import apiService from '../../services/api';

const stages = ['In Review', 'Shortlisted', 'Interview', 'Hired'];
const stageColor = {
  'In Review': 'bg-blue-100 text-blue-600',
  'Shortlisted': 'bg-yellow-100 text-yellow-700',
  'Interview': 'bg-purple-100 text-purple-600',
  'Hired': 'bg-green-100 text-green-600',
};

const ALL_STAGES = ['In Review', 'Interviewing', 'Assessment', 'Offered', 'Shortlisted', 'Hired', 'Unsuitable'];

export default function JobApplicantsKanban() {
  const { id } = useParams();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiService.getCompanyApplications()
      .then(data => {
        const filtered = (data || []).filter(a => String(a.jobId) === String(id));
        setApps(filtered);
      })
      .catch(() => setApps([]))
      .finally(() => setLoading(false));
  }, [id]);

  const handleStatusChange = async (appId, newStatus) => {
    try {
      await apiService.updateCompanyApplicationStatus(appId, newStatus);
      setApps(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus } : a));
    } catch (e) {
      alert('Failed to update status');
    }
  };

  const grouped = stages.reduce((acc, s) => {
    acc[s] = apps.filter(a => {
      if (s === 'Interview') return a.status === 'Interviewing' || a.status === 'Assessment';
      return a.status === s;
    });
    return acc;
  }, {});

  const getInitials = (n) => n ? n.split(' ').map(x=>x[0]).join('').substring(0,2).toUpperCase() : 'U';
  const getColor = (n) => {
    const cols = ['bg-blue-500', 'bg-red-500', 'bg-green-500', 'bg-purple-500'];
    return n ? cols[n.charCodeAt(0) % cols.length] : cols[0];
  };

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
        <p className="text-sm text-gray-500 mb-4">Total Applicants: {apps.length}</p>
        {loading ? (
             <div className="flex items-center justify-center p-20">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
             </div>
        ) : (
        <div className="grid grid-cols-4 gap-4">
          {stages.map(stage => (
            <div key={stage} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${stageColor[stage]}`}>{stage}</span>
                <span className="text-xs text-gray-400">{grouped[stage]?.length || 0}</span>
              </div>
              <div className="space-y-3 mt-3">
                {(grouped[stage] || []).map(a => (
                  <div key={a.id} className="block bg-gray-50 rounded-xl p-3 border border-gray-200 shadow-sm mt-3 relative">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`${getColor(a.candidateName)} text-white rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold`}>{getInitials(a.candidateName)}</div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800 leading-tight">{a.candidateName}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{a.title}</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mb-3 mt-3 flex items-center gap-1">📅 Applied: {a.dateApplied}</p>
                    
                    <div className="mt-2 border-t border-gray-100 pt-2 flex items-center justify-between">
                       <select 
                         value={a.status} 
                         onChange={(e) => handleStatusChange(a.id, e.target.value)}
                         className="text-xs border border-gray-300 rounded px-2 py-1 outline-none focus:border-blue-500 bg-white"
                       >
                         {ALL_STAGES.map(st => <option key={st} value={st}>{st}</option>)}
                       </select>
                       {a.resumeUrl && <a href={a.resumeUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline font-medium">View CV</a>}
                    </div>
                  </div>
                ))}
                {(!grouped[stage] || grouped[stage].length === 0) && (
                   <div className="text-xs text-gray-400 text-center py-6 border-2 border-dashed border-gray-200 rounded-xl mt-3">Drag applicants here</div>
                )}
              </div>
            </div>
          ))}
        </div>
        )}
      </div>
    </div>
  );
}
