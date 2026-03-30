import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';

const fallbackJobs = [
  { id: 1, title: 'Social Media Assistant', company: 'Nomad', location: 'Paris, France', type: 'Full-Time', categories: ['Marketing', 'Design'], logo: 'N', color: 'bg-emerald-500', applied: 5, capacity: 10, salary: 700, level: 'Entry Level' },
  { id: 2, title: 'Brand Designer', company: 'Dropbox', location: 'San Francisco, USA', type: 'Full-Time', categories: ['Design', 'Business'], logo: 'D', color: 'bg-blue-500', applied: 2, capacity: 8, salary: 1200, level: 'Mid Level' },
  { id: 3, title: 'Interactive Developer', company: 'Terraform', location: 'Hamburg, Germany', type: 'Full-Time', categories: ['Marketing', 'Design'], logo: 'T', color: 'bg-indigo-500', applied: 3, capacity: 12, salary: 1800, level: 'Senior Level' },
  { id: 4, title: 'Email Marketing', company: 'Revolut', location: 'Madrid, Spain', type: 'Full-Time', categories: ['Marketing', 'Design'], logo: 'R', color: 'bg-red-500', applied: 0, capacity: 6, salary: 900, level: 'Entry Level' },
  { id: 5, title: 'Lead Engineer', company: 'Canva', location: 'Ankara, Turkey', type: 'Full-Time', categories: ['Marketing', 'Design'], logo: 'C', color: 'bg-teal-500', applied: 5, capacity: 15, salary: 3500, level: 'Director' },
  { id: 6, title: 'Product Designer', company: 'ClassPass', location: 'Berlin, Germany', type: 'Full-Time', categories: ['Marketing', 'Design'], logo: 'C', color: 'bg-purple-500', applied: 5, capacity: 10, salary: 1600, level: 'Senior Level' },
  { id: 7, title: 'Customer Manager', company: 'Pitch', location: 'Berlin, Germany', type: 'Full-Time', categories: ['Marketing', 'Design'], logo: 'P', color: 'bg-gray-800', applied: 5, capacity: 10, salary: 1100, level: 'Mid Level' },
];

const EMPLOYMENT_TYPES = ['Full-Time', 'Part-Time', 'Remote', 'Internship', 'Contract'];
const CATEGORIES = ['Design', 'Sales', 'Marketing', 'Business', 'Human Resource', 'Finance', 'Engineering', 'Technology'];
const JOB_LEVELS = ['Entry Level', 'Mid Level', 'Senior Level', 'Director', 'VP or Above'];
const SALARY_RANGES = [
  { label: '$700 - $1000', min: 700, max: 1000 },
  { label: '$1000 - $1500', min: 1000, max: 1500 },
  { label: '$1500 - $2000', min: 1500, max: 2000 },
  { label: '$3000 or above', min: 3000, max: Infinity },
];

export default function FindJobs() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const handleApply = (jobId) => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate(`/jobs/${jobId}`);
  };

  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [viewGrid, setViewGrid] = useState(false);
  const [allJobs, setAllJobs] = useState(fallbackJobs);

  useEffect(() => {
    apiService.getJobs()
      .then(jobsData => {
        if (jobsData?.length) setAllJobs(jobsData);
      })
      .catch(() => {});
  }, []);

  const [selTypes, setSelTypes] = useState([]);
  const [selCats, setSelCats] = useState([]);
  const [selLevels, setSelLevels] = useState([]);
  const [selSalary, setSelSalary] = useState([]);

  const toggle = (arr, setArr, val) =>
    setArr(prev => prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val]);

  const typeCounts = useMemo(() => Object.fromEntries(EMPLOYMENT_TYPES.map(t => [t, allJobs.filter(j => j.type === t).length])), [allJobs]);
  const catCounts = useMemo(() => Object.fromEntries(CATEGORIES.map(c => [c, allJobs.filter(j => Array.isArray(j.categories) ? j.categories.includes(c) : (j.categories || '').includes(c)).length])), [allJobs]);
  const levelCounts = useMemo(() => Object.fromEntries(JOB_LEVELS.map(l => [l, allJobs.filter(j => j.level === l).length])), [allJobs]);

  const filtered = useMemo(() => {
    let result = allJobs.filter(j => {
      const cats = Array.isArray(j.categories) ? j.categories : (j.categories || '').split(',').map(s => s.trim()).filter(Boolean);
      const q = search.toLowerCase();
      const matchSearch = !q || j.title.toLowerCase().includes(q) || j.company.toLowerCase().includes(q);
      const matchLoc    = !location.trim() || (j.location || '').toLowerCase().includes(location.trim().toLowerCase());
      const matchType   = selTypes.length === 0 || selTypes.includes(j.type);
      const matchCat    = selCats.length === 0  || selCats.some(c => cats.includes(c));
      const matchLevel  = selLevels.length === 0 || selLevels.includes(j.level);
      const matchSalary = selSalary.length === 0 || selSalary.some(r => {
        const range = SALARY_RANGES.find(s => s.label === r);
        return range && j.salary >= range.min && j.salary <= range.max;
      });
      return matchSearch && matchType && matchCat && matchLevel && matchSalary && matchLoc;
    });
    return result;
  }, [search, location, selTypes, selCats, selLevels, selSalary, allJobs]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header search */}
      <div className="bg-white border-b border-gray-200 px-8 py-12 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Find your <span className="text-blue-600">dream job</span>
        </h1>
        <p className="text-gray-500 text-sm mb-6">Find your next career at companies like HubSpot, Nike, and Dropbox</p>
        <div className="flex bg-white border border-gray-300 rounded-lg overflow-hidden max-w-2xl mx-auto shadow-sm">
          <div className="flex items-center gap-2 flex-1 px-4 py-3">
            <span className="text-gray-400">🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)}
              className="flex-1 text-gray-800 text-sm outline-none" placeholder="Job title or keyword" />
          </div>
          <div className="w-px bg-gray-200 my-2" />
          <div className="flex items-center gap-2 flex-1 px-4 py-3">
            <span className="text-gray-400">📍</span>
            <input value={location} onChange={e => setLocation(e.target.value)} className="flex-1 text-gray-800 text-sm outline-none" placeholder="Florence, Italy" />
            <span className="text-gray-400 text-xs">▼</span>
          </div>
          <button className="bg-blue-600 text-white text-sm px-6 py-3 hover:bg-blue-700 font-medium">Search</button>
        </div>
        <p className="text-gray-400 text-xs mt-3">Popular: UI Designer, UX Researcher, Android, Admin</p>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-8 flex gap-8">
        {/* Sidebar filters */}
        <aside className="w-52 flex-shrink-0">
          {/* Employment Type */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-900 text-sm">Type of Employment</h3>
              <span className="text-gray-400 text-xs">▲</span>
            </div>
            {EMPLOYMENT_TYPES.map(t => (
              <label key={t} className="flex items-center gap-2 text-sm text-gray-600 mb-2.5 cursor-pointer hover:text-gray-900">
                <input type="checkbox" checked={selTypes.includes(t)} onChange={() => toggle(selTypes, setSelTypes, t)} className="accent-blue-600 w-4 h-4" />
                <span className="flex-1">{t}</span>
                <span className="text-gray-400 text-xs">({typeCounts[t] || 0})</span>
              </label>
            ))}
          </div>

          {/* Categories */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-900 text-sm">Categories</h3>
              <span className="text-gray-400 text-xs">▲</span>
            </div>
            {CATEGORIES.map(c => (
              <label key={c} className="flex items-center gap-2 text-sm text-gray-600 mb-2.5 cursor-pointer hover:text-gray-900">
                <input type="checkbox" checked={selCats.includes(c)} onChange={() => toggle(selCats, setSelCats, c)} className="accent-blue-600 w-4 h-4" />
                <span className="flex-1">{c}</span>
                <span className="text-gray-400 text-xs">({catCounts[c] || 0})</span>
              </label>
            ))}
          </div>

          {/* Job Level */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-900 text-sm">Job Level</h3>
              <span className="text-gray-400 text-xs">▲</span>
            </div>
            {JOB_LEVELS.map(l => (
              <label key={l} className="flex items-center gap-2 text-sm text-gray-600 mb-2.5 cursor-pointer hover:text-gray-900">
                <input type="checkbox" checked={selLevels.includes(l)} onChange={() => toggle(selLevels, setSelLevels, l)} className="accent-blue-600 w-4 h-4" />
                <span className="flex-1">{l}</span>
                <span className="text-gray-400 text-xs">({levelCounts[l] || 0})</span>
              </label>
            ))}
          </div>

          {/* Salary Range */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-900 text-sm">Salary Range</h3>
              <span className="text-gray-400 text-xs">▲</span>
            </div>
            {SALARY_RANGES.map(s => (
              <label key={s.label} className="flex items-center gap-2 text-sm text-gray-600 mb-2.5 cursor-pointer hover:text-gray-900">
                <input type="checkbox" checked={selSalary.includes(s.label)} onChange={() => toggle(selSalary, setSelSalary, s.label)} className="accent-blue-600 w-4 h-4" />
                <span className="flex-1">{s.label}</span>
              </label>
            ))}
          </div>
        </aside>

        {/* Job list */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h2 className="font-bold text-gray-900 text-lg">All Jobs</h2>
              <p className="text-sm text-gray-400">Showing {filtered.length} results</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">Sort by:</span>
              <select className="border border-gray-300 rounded-lg text-sm px-3 py-1.5 outline-none text-gray-700">
                <option>Most relevant</option>
                <option>Newest</option>
                <option>Oldest</option>
              </select>
              <button onClick={() => setViewGrid(true)} className={`p-2 rounded-lg border ${viewGrid ? 'border-blue-600 text-blue-600' : 'border-gray-300 text-gray-400'}`}>
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M1 2a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V2zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V2zM1 7a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V7zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V7z"/></svg>
              </button>
              <button onClick={() => setViewGrid(false)} className={`p-2 rounded-lg border ${!viewGrid ? 'border-blue-600 text-blue-600' : 'border-gray-300 text-gray-400'}`}>
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path fillRule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"/></svg>
              </button>
            </div>
          </div>

          {/* List view */}
          {!viewGrid && (
            <div className="space-y-4">
              {filtered.map(job => (
                <div key={job.id} className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4 hover:shadow-sm transition">
                  <div className={`${job.color} text-white rounded-xl w-12 h-12 flex items-center justify-center font-bold text-lg flex-shrink-0`}>{job.logo}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{job.title}</h3>
                    </div>
                    <p className="text-sm text-gray-500">{job.company} • {job.location}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="text-xs border border-green-500 text-green-600 rounded px-2 py-0.5">{job.type}</span>
                      {(Array.isArray(job.categories) ? job.categories : (job.categories || '').split(',').map(s => s.trim()).filter(Boolean)).map(c => (
                        <span key={c} className={`text-xs rounded px-2 py-0.5 border ${c === 'Design' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-orange-50 text-orange-600 border-orange-200'}`}>{c}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <button 
                      onClick={() => handleApply(job.id)}
                      className="bg-blue-600 text-white text-sm px-5 py-2 rounded-lg hover:bg-blue-700 font-medium"
                    >
                      Apply
                    </button>
                    <div className="text-right">
                      <div className="w-32 bg-gray-200 rounded-full h-1.5 mb-1">
                        <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${(job.applied / job.capacity) * 100}%` }} />
                      </div>
                      <p className="text-xs text-gray-400"><span className="font-medium text-gray-600">{job.applied} applied</span> of {job.capacity} capacity</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Grid view */}
          {viewGrid && (
            <div className="grid grid-cols-2 gap-4">
              {filtered.map(job => (
                <div key={job.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-sm transition">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-xs border border-green-500 text-green-600 rounded px-2 py-0.5">{job.type}</span>
                    <button 
                      onClick={() => handleApply(job.id)}
                      className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-blue-700"
                    >
                      Apply
                    </button>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className={`${job.color} text-white rounded-xl w-11 h-11 flex items-center justify-center font-bold flex-shrink-0`}>{job.logo}</div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">{job.title}</h3>
                      <p className="text-xs text-gray-500">{job.company} • {job.location}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {(Array.isArray(job.categories) ? job.categories : (job.categories || '').split(',').map(s => s.trim()).filter(Boolean)).map(c => (
                      <span key={c} className={`text-xs rounded px-2 py-0.5 border ${c === 'Design' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-orange-50 text-orange-600 border-orange-200'}`}>{c}</span>
                    ))}
                  </div>
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
                      <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${(job.applied / job.capacity) * 100}%` }} />
                    </div>
                    <p className="text-xs text-gray-400"><span className="font-medium text-gray-600">{job.applied} applied</span> of {job.capacity} capacity</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          <div className="flex justify-center items-center gap-1 mt-8">
            <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:bg-gray-100 rounded">‹</button>
            {[1,2,3,4,5].map(p => (
              <button key={p} className={`w-8 h-8 rounded text-sm font-medium ${p === 1 ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>{p}</button>
            ))}
            <span className="text-gray-400 text-sm px-1">...</span>
            <button className="w-8 h-8 rounded text-sm text-gray-600 hover:bg-gray-100">33</button>
            <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:bg-gray-100 rounded">›</button>
          </div>
        </div>
      </div>
    </div>
  );
}
