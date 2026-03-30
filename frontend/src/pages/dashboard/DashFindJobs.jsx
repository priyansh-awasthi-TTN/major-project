import { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import DashTopBar from '../../components/DashTopBar';
import apiService from '../../services/api';

// Extended job dataset matching Figma — used as fallback only
const fallbackJobs = [
  { id: 1,  title: 'Social Media Assistant',  company: 'Nomad',      location: 'Paris, France',        type: 'Full-Time',  categories: ['Marketing', 'Design'],       logo: 'N',  color: 'bg-emerald-500', level: 'Entry Level',  salary: 700,  applied: 5,  capacity: 10 },
  { id: 2,  title: 'Brand Designer',           company: 'Dropbox',    location: 'San Francisco, USA',   type: 'Full-Time',  categories: ['Design', 'Business'],        logo: 'D',  color: 'bg-blue-500',    level: 'Mid Level',    salary: 1200, applied: 2,  capacity: 8  },
  { id: 3,  title: 'Interactive Developer',    company: 'Terraform',  location: 'Hamburg, Germany',     type: 'Full-Time',  categories: ['Marketing', 'Design'],       logo: 'T',  color: 'bg-purple-500',  level: 'Senior Level', salary: 1500, applied: 7,  capacity: 12 },
];

const EMPLOYMENT_TYPES = ['Full-Time', 'Part-Time', 'Remote', 'Internship', 'Contract'];
const CATEGORIES = ['Design', 'Sales', 'Marketing', 'Business', 'Human Resource', 'Finance', 'Engineering', 'Technology'];
const JOB_LEVELS = ['Entry Level', 'Mid Level', 'Senior Level', 'Director', 'VP or Above'];
const SALARY_RANGES = [
  { label: '$700 - $1000', min: 700,  max: 1000 },
  { label: '$1000 - $1500', min: 1000, max: 1500 },
  { label: '$1500 - $2000', min: 1500, max: 2000 },
  { label: '$3000 or above', min: 3000, max: Infinity },
];
const SORT_OPTIONS = ['Most relevant', 'Newest', 'Oldest', 'Salary (High-Low)', 'Salary (Low-High)'];
const PAGE_SIZE = 9;

function FilterSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="mb-5">
      <button onClick={() => setOpen(o => !o)}
        className="flex items-center justify-between w-full text-sm font-semibold text-gray-800 mb-2">
        {title}
        <span className="text-gray-400 text-xs">{open ? '▲' : '▼'}</span>
      </button>
      {open && <div>{children}</div>}
    </div>
  );
}

function CheckItem({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2 text-sm text-gray-600 mb-2 cursor-pointer hover:text-gray-900">
      <input type="checkbox" checked={checked} onChange={onChange}
        className="w-4 h-4 rounded border-gray-300 accent-blue-600 cursor-pointer" />
      {label}
    </label>
  );
}

// Compact job card for list view
function ListJobCard({ job, viewParam, isApplied }) {
  return (
    <Link to={`/dashboard/jobs/${job.id}?from=${viewParam}`} className="block">
      <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-blue-200 transition flex items-start gap-4">
        <div className={`${job.color} text-white rounded-xl w-12 h-12 flex items-center justify-center font-bold text-sm flex-shrink-0`}>
          {job.logo}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className={`text-xs border rounded px-2 py-0.5 font-medium ${
                  job.type === 'Full-Time' ? 'border-green-500 text-green-600' :
                  job.type === 'Part-Time' ? 'border-blue-500 text-blue-600' :
                  job.type === 'Remote' ? 'border-teal-500 text-teal-600' :
                  job.type === 'Internship' ? 'border-yellow-500 text-yellow-600' :
                  'border-purple-500 text-purple-600'
                }`}>{job.type}</span>
              </div>
              <h3 className="font-semibold text-gray-900 text-sm hover:text-blue-600">{job.title}</h3>
              <p className="text-xs text-gray-500 mt-0.5">{job.company} • {job.location}</p>
            </div>
            {isApplied ? (
               <span className="bg-green-100 text-green-700 text-xs px-4 py-1.5 rounded-lg flex-shrink-0 font-medium">Applied</span>
            ) : (
               <Link to={`/dashboard/jobs/${job.id}?from=${viewParam}`}
                 className="bg-blue-50 text-blue-600 text-xs px-4 py-1.5 rounded-lg hover:bg-blue-600 hover:text-white transition flex-shrink-0 font-medium">
                 Apply
               </Link>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {(Array.isArray(job.categories) ? job.categories : (job.categories||'').split(',').map(s=>s.trim()).filter(Boolean)).map(c => (
              <span key={c} className="text-xs bg-orange-50 text-orange-600 border border-orange-200 rounded px-2 py-0.5">{c}</span>
            ))}
          </div>
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
              <span>{job.applied} applied of {job.capacity} capacity</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div className="bg-green-400 h-1.5 rounded-full" style={{ width: `${Math.min((job.applied / job.capacity) * 100, 100)}%` }} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

// Compact job card for grid view
function GridJobCard({ job, viewParam }) {
  return (
    <Link to={`/dashboard/jobs/${job.id}?from=${viewParam}`} className="block">
      <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md hover:border-blue-200 transition h-full flex flex-col">
        <div className="flex items-start justify-between mb-3">
          <div className={`${job.color} text-white rounded-xl w-10 h-10 flex items-center justify-center font-bold text-xs flex-shrink-0`}>
            {job.logo}
          </div>
          <span className={`text-xs border rounded px-2 py-0.5 font-medium ${
            job.type === 'Full-Time' ? 'border-green-500 text-green-600' :
            job.type === 'Part-Time' ? 'border-blue-500 text-blue-600' :
            job.type === 'Remote' ? 'border-teal-500 text-teal-600' :
            job.type === 'Internship' ? 'border-yellow-500 text-yellow-600' :
            'border-purple-500 text-purple-600'
          }`}>{job.type}</span>
        </div>
        <h3 className="font-semibold text-gray-900 text-sm hover:text-blue-600 mb-0.5">{job.title}</h3>
        <p className="text-xs text-gray-500 mb-2">{job.company} • {job.location}</p>
        <div className="flex flex-wrap gap-1 mb-3">
          {(Array.isArray(job.categories) ? job.categories : (job.categories||'').split(',').map(s=>s.trim()).filter(Boolean)).map(c => (
            <span key={c} className="text-xs bg-orange-50 text-orange-600 border border-orange-200 rounded px-1.5 py-0.5">{c}</span>
          ))}
        </div>
        <div className="mt-auto">
          <div className="w-full bg-gray-100 rounded-full h-1.5 mb-1">
            <div className="bg-green-400 h-1.5 rounded-full" style={{ width: `${Math.min((job.applied / job.capacity) * 100, 100)}%` }} />
          </div>
          <p className="text-xs text-gray-400">{job.applied} applied of {job.capacity} capacity</p>
        </div>
      </div>
    </Link>
  );
}

export default function DashFindJobs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const viewGrid = searchParams.get('view') === 'grid';
  const setViewGrid = (val) => setSearchParams(prev => { const p = new URLSearchParams(prev); p.set('view', val ? 'grid' : 'list'); return p; }, { replace: true });
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [sortBy, setSortBy] = useState('Most relevant');
  const [page, setPage] = useState(1);
  const [allJobs, setAllJobs] = useState(fallbackJobs);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [appliedJobsIds, setAppliedJobsIds] = useState([]);

  useEffect(() => {
    Promise.all([
      apiService.getJobs(),
      apiService.getApplications()
    ]).then(([jobsData, appsData]) => {
      if (jobsData?.length) setAllJobs(jobsData);
      if (appsData?.length) setAppliedJobsIds(appsData.map(a => Number(a.jobId)));
    }).catch(() => {})
      .finally(() => setLoadingJobs(false));
  }, []);

  // Filter state
  const [selTypes, setSelTypes]       = useState([]);
  const [selCats, setSelCats]         = useState([]);
  const [selLevels, setSelLevels]     = useState([]);
  const [selSalary, setSelSalary]     = useState([]);

  const toggle = (arr, setArr, val) =>
    setArr(prev => prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val]);

  // Compute counts dynamically — depend on allJobs so they update after API load
  const typeCounts  = useMemo(() => Object.fromEntries(EMPLOYMENT_TYPES.map(t => [t, allJobs.filter(j => j.type === t).length])), [allJobs]);
  const catCounts   = useMemo(() => Object.fromEntries(CATEGORIES.map(c => [c, allJobs.filter(j => Array.isArray(j.categories) ? j.categories.includes(c) : (j.categories || '').includes(c)).length])), [allJobs]);
  const levelCounts = useMemo(() => Object.fromEntries(JOB_LEVELS.map(l => [l, allJobs.filter(j => j.level === l).length])), [allJobs]);

  const filtered = useMemo(() => {
    let result = allJobs.filter(j => {
      // normalize categories to array regardless of DB format
      const cats = Array.isArray(j.categories)
        ? j.categories
        : (j.categories || '').split(',').map(s => s.trim()).filter(Boolean);

      const q = search.toLowerCase();
      const matchSearch = !q || j.title.toLowerCase().includes(q) || j.company.toLowerCase().includes(q) || (j.location || '').toLowerCase().includes(q);
      const matchType   = selTypes.length === 0 || selTypes.includes(j.type);
      const matchCat    = selCats.length === 0  || selCats.some(c => cats.includes(c));
      const matchLevel  = selLevels.length === 0 || selLevels.includes(j.level);
      const matchLoc    = !location.trim() || (j.location || '').toLowerCase().includes(location.toLowerCase());
      const matchSalary = selSalary.length === 0 || selSalary.some(r => {
        const range = SALARY_RANGES.find(s => s.label === r);
        return range && j.salary >= range.min && j.salary <= range.max;
      });
      return matchSearch && matchType && matchCat && matchLevel && matchLoc && matchSalary;
    });

    if (sortBy === 'Newest')           result = [...result].sort((a, b) => b.id - a.id);
    else if (sortBy === 'Oldest')      result = [...result].sort((a, b) => a.id - b.id);
    else if (sortBy === 'Salary (High-Low)') result = [...result].sort((a, b) => b.salary - a.salary);
    else if (sortBy === 'Salary (Low-High)') result = [...result].sort((a, b) => a.salary - b.salary);

    return result;
  }, [search, location, selTypes, selCats, selLevels, selSalary, sortBy, allJobs]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = () => setPage(1);

  const clearAll = () => {
    setSelTypes([]); setSelCats([]); setSelLevels([]); setSelSalary([]);
    setSearch(''); setPage(1);
  };

  const hasFilters = selTypes.length || selCats.length || selLevels.length || selSalary.length;

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50">
      <DashTopBar title="Find Jobs" />

      {/* Search bar — fixed, doesn't scroll */}
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex-shrink-0">
        <div className="flex gap-3">
          <div className="flex-1 flex items-center gap-2 border border-gray-300 rounded-lg px-4 py-2.5">
            <span className="text-gray-400 text-sm">🔍</span>
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              className="flex-1 text-sm outline-none text-gray-700 placeholder-gray-400"
              placeholder="Job title or keyword" />
          </div>
          <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-4 py-2.5 min-w-44">
            <span className="text-gray-400 text-sm">📍</span>
            <input value={location} onChange={e => setLocation(e.target.value)}
              className="flex-1 text-sm outline-none text-gray-700"
              placeholder="Location" />
          </div>
          <button onClick={handleSearch}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
            Search
          </button>
        </div>
        <p className="text-gray-400 text-xs mt-2">Popular: UI Designer, UX Researcher, Android, Admin</p>
      </div>

      {/* Scrollable content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-60 bg-white border-r border-gray-200 p-5 flex-shrink-0 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-gray-700">Filters</span>
            {hasFilters ? (
              <button onClick={clearAll} className="text-xs text-red-500 hover:underline">Clear all</button>
            ) : null}
          </div>

          <FilterSection title="Type of Employment">
            {EMPLOYMENT_TYPES.map(t => (
              <CheckItem key={t} label={`${t} (${typeCounts[t] || 0})`}
                checked={selTypes.includes(t)} onChange={() => { toggle(selTypes, setSelTypes, t); setPage(1); }} />
            ))}
          </FilterSection>

          <FilterSection title="Categories">
            {CATEGORIES.map(c => (
              <CheckItem key={c} label={`${c} (${catCounts[c] || 0})`}
                checked={selCats.includes(c)} onChange={() => { toggle(selCats, setSelCats, c); setPage(1); }} />
            ))}
          </FilterSection>

          <FilterSection title="Job Level">
            {JOB_LEVELS.map(l => (
              <CheckItem key={l} label={`${l} (${levelCounts[l] || 0})`}
                checked={selLevels.includes(l)} onChange={() => { toggle(selLevels, setSelLevels, l); setPage(1); }} />
            ))}
          </FilterSection>

          <FilterSection title="Salary Range">
            {SALARY_RANGES.map(r => (
              <CheckItem key={r.label} label={r.label}
                checked={selSalary.includes(r.label)} onChange={() => { toggle(selSalary, setSelSalary, r.label); setPage(1); }} />
            ))}
          </FilterSection>
        </aside>

        {/* Main content */}
        <div className="flex-1 p-6 min-w-0 overflow-y-auto">
          {/* Results header */}
          <div className="flex justify-between items-center mb-5">
            <div>
              <h2 className="font-semibold text-gray-900">All Jobs</h2>
              <p className="text-sm text-gray-500">Showing {filtered.length} results</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                <span>Sort by:</span>
                <select value={sortBy} onChange={e => { setSortBy(e.target.value); setPage(1); }}
                  className="border border-gray-200 rounded-lg px-2 py-1 text-sm outline-none text-gray-700 bg-white">
                  {SORT_OPTIONS.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <button onClick={() => setViewGrid(false)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg border transition ${!viewGrid ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-400 hover:bg-gray-50'}`}>
                ☰
              </button>
              <button onClick={() => setViewGrid(true)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg border transition ${viewGrid ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-400 hover:bg-gray-50'}`}>
                ⊞
              </button>
            </div>
          </div>

          {/* Active filter chips */}
          {hasFilters ? (
            <div className="flex flex-wrap gap-2 mb-4">
              {[...selTypes, ...selCats, ...selLevels, ...selSalary].map(f => (
                <span key={f} className="flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-full border border-blue-200">
                  {f}
                  <button onClick={() => {
                    if (selTypes.includes(f)) toggle(selTypes, setSelTypes, f);
                    else if (selCats.includes(f)) toggle(selCats, setSelCats, f);
                    else if (selLevels.includes(f)) toggle(selLevels, setSelLevels, f);
                    else toggle(selSalary, setSelSalary, f);
                    setPage(1);
                  }} className="ml-0.5 hover:text-red-500">✕</button>
                </span>
              ))}
            </div>
          ) : null}

          {/* Job cards */}
          {loadingJobs ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
            </div>
          ) : paginated.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <span className="text-5xl mb-3">🔍</span>
              <p className="text-lg font-medium text-gray-500">No jobs found</p>
              <p className="text-sm mt-1">Try adjusting your filters or search terms</p>
              <button onClick={clearAll} className="mt-4 text-sm text-blue-600 hover:underline">Clear all filters</button>
            </div>
          ) : viewGrid ? (
            <div className="grid grid-cols-3 gap-4">
              {paginated.map(job => <GridJobCard key={job.id} job={job} viewParam={viewGrid ? 'grid' : 'list'} />)}
            </div>
          ) : (
            <div className="space-y-3">
              {paginated.map(job => <ListJobCard key={job.id} job={job} viewParam={viewGrid ? 'grid' : 'list'} isApplied={appliedJobsIds.includes(Number(job.id))} />)}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-1 mt-6">
              <button onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:bg-gray-100 rounded disabled:opacity-30">‹</button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = totalPages <= 5 ? i + 1 : page <= 3 ? i + 1 : page >= totalPages - 2 ? totalPages - 4 + i : page - 2 + i;
                return (
                  <button key={p} onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded text-sm font-medium transition ${p === page ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                    {p}
                  </button>
                );
              })}
              {totalPages > 5 && page < totalPages - 2 && <span className="text-gray-400 text-sm px-1">...</span>}
              {totalPages > 5 && page < totalPages - 2 && (
                <button onClick={() => setPage(totalPages)}
                  className="w-8 h-8 rounded text-sm text-gray-600 hover:bg-gray-100">{totalPages}</button>
              )}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:bg-gray-100 rounded disabled:opacity-30">›</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
