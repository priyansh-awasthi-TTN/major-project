import { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { companies } from '../../data/mockData';
import DashTopBar from '../../components/DashTopBar';

// Extended company dataset with more industries/sizes
const allCompanies = [
  ...companies,
  { id: 21, name: 'Twitter',    description: 'Twitter is what\'s happening and what people are talking about right now.', logo: 'Tw', color: 'bg-sky-500',    jobs: 12, tags: ['Business Service', 'Technology'], industry: 'Technology',      size: '1001+' },
  { id: 22, name: 'Microsoft',  description: 'Microsoft enables digital transformation for the era of an intelligent cloud and edge.', logo: 'Ms', color: 'bg-blue-700',   jobs: 25, tags: ['Technology', 'Cloud'],            industry: 'Cloud',           size: '1001+' },
  { id: 23, name: 'Apple',      description: 'Apple designs Macs, the best personal computers in the world, along with OS X, iLife, iWork and professional software.', logo: 'Ap', color: 'bg-gray-600',   jobs: 18, tags: ['Technology', 'Consumer Tech'],   industry: 'Consumer Tech',   size: '1001+' },
  { id: 24, name: 'Facebook',   description: 'Facebook\'s mission is to give people the power to build community and bring the world closer together.', logo: 'Fb', color: 'bg-blue-600',   jobs: 15, tags: ['Technology', 'Media'],            industry: 'Media',           size: '1001+' },
  { id: 25, name: 'Google',     description: 'Google\'s mission is to organize the world\'s information and make it universally accessible and useful.', logo: 'G',  color: 'bg-red-500',    jobs: 30, tags: ['Technology', 'Cloud'],            industry: 'Cloud',           size: '1001+' },
  { id: 26, name: 'Netflix',    description: 'Netflix is the world\'s leading streaming entertainment service with over 200 million paid memberships.', logo: 'Nf', color: 'bg-red-600',    jobs: 8,  tags: ['Media', 'Technology'],            industry: 'Media',           size: '1001+' },
  { id: 27, name: 'Airbnb',     description: 'Airbnb is a community based on connection and belonging — a place where anyone can belong anywhere.', logo: 'Ab', color: 'bg-rose-500',   jobs: 6,  tags: ['Business Service'],               industry: 'Business Service', size: '1001+' },
  { id: 28, name: 'Spotify',    description: 'Spotify is a digital music, podcast, and video service that gives you access to millions of songs.', logo: 'Sp', color: 'bg-green-500',  jobs: 9,  tags: ['Technology', 'Media'],            industry: 'Media',           size: '1001+' },
];

const INDUSTRIES = ['Advertising', 'Business Service', 'Blockchain', 'Cloud', 'Consumer Tech', 'Education', 'Fintech', 'Gaming', 'Food & Beverage', 'Healthcare', 'Hosting', 'Media', 'Technology'];
const SIZES = ['1-50', '51-150', '151-250', '251-500', '501-1000', '1000+'];
const SORT_OPTIONS = ['Most relevant', 'Most jobs', 'A-Z', 'Z-A'];
const PAGE_SIZE = 6;

function FilterSection({ title, children }) {
  const [open, setOpen] = useState(true);
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

function CompanyCard({ company, grid }) {
  if (grid) {
    return (
      <Link to={`/dashboard/companies/${company.id}`} className="block">
        <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-blue-200 transition h-full flex flex-col">
          <div className="flex items-start justify-between mb-3">
            <div className={`${company.color} text-white rounded-xl w-12 h-12 flex items-center justify-center font-bold text-sm flex-shrink-0`}>
              {company.logo}
            </div>
            <span className="text-xs text-blue-600 font-medium">{company.jobs} Jobs</span>
          </div>
          <h3 className="font-bold text-gray-900 text-base mb-1 hover:text-blue-600">{company.name}</h3>
          <p className="text-sm text-gray-500 line-clamp-3 flex-1">{company.description}</p>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {company.tags.map(t => (
              <span key={t} className="text-xs bg-orange-50 text-orange-600 border border-orange-200 rounded px-2 py-0.5">{t}</span>
            ))}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/dashboard/companies/${company.id}`} className="block">
      <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-blue-200 transition flex items-start gap-4">
        <div className={`${company.color} text-white rounded-xl w-14 h-14 flex items-center justify-center font-bold text-lg flex-shrink-0`}>
          {company.logo}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-gray-900 text-base hover:text-blue-600">{company.name}</h3>
            <span className="text-xs text-blue-600 font-medium flex-shrink-0">{company.jobs} Jobs</span>
          </div>
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{company.description}</p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {company.tags.map(t => (
              <span key={t} className="text-xs bg-orange-50 text-orange-600 border border-orange-200 rounded px-2 py-0.5">{t}</span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function DashCompanies() {
  const [searchParams, setSearchParams] = useSearchParams();
  const viewGrid = searchParams.get('view') === 'grid';
  const setViewGrid = (val) =>
    setSearchParams(prev => { const p = new URLSearchParams(prev); p.set('view', val ? 'grid' : 'list'); return p; }, { replace: true });

  const [search, setSearch]         = useState('');
  const [location, setLocation]     = useState('Florence, Italy');
  const [sortBy, setSortBy]         = useState('Most relevant');
  const [page, setPage]             = useState(1);
  const [selIndustry, setSelIndustry] = useState([]);
  const [selSize, setSelSize]         = useState([]);

  const toggle = (arr, setArr, val) =>
    setArr(prev => prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val]);

  // Dynamic counts
  const industryCounts = useMemo(() =>
    Object.fromEntries(INDUSTRIES.map(i => [i, allCompanies.filter(c => c.industry === i).length])), []);
  const sizeCounts = useMemo(() =>
    Object.fromEntries(SIZES.map(s => [s, allCompanies.filter(c => c.size === s).length])), []);

  const filtered = useMemo(() => {
    let result = allCompanies.filter(c => {
      const q = search.toLowerCase();
      const matchSearch = !q || c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q) || c.tags.some(t => t.toLowerCase().includes(q));
      const matchIndustry = selIndustry.length === 0 || selIndustry.includes(c.industry);
      const matchSize     = selSize.length === 0     || selSize.includes(c.size);
      const matchLoc      = !location.trim() || (c.location || c.description).toLowerCase().includes(location.trim().toLowerCase());
      return matchSearch && matchIndustry && matchSize && matchLoc;
    });

    if (sortBy === 'Most jobs') result = [...result].sort((a, b) => b.jobs - a.jobs);
    else if (sortBy === 'A-Z')  result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    else if (sortBy === 'Z-A')  result = [...result].sort((a, b) => b.name.localeCompare(a.name));

    return result;
  }, [search, selIndustry, selSize, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const clearAll = () => { setSelIndustry([]); setSelSize([]); setSearch(''); setPage(1); };
  const hasFilters = selIndustry.length || selSize.length;

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50">
      <DashTopBar title="Browse Companies" />

      {/* Search bar — fixed */}
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex-shrink-0">
        <div className="flex gap-3">
          <div className="flex-1 flex items-center gap-2 border border-gray-300 rounded-lg px-4 py-2.5">
            <span className="text-gray-400 text-sm">🔍</span>
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              onKeyDown={e => e.key === 'Enter' && setPage(1)}
              className="flex-1 text-sm outline-none text-gray-700 placeholder-gray-400"
              placeholder="Company title or keyword" />
          </div>
          <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-4 py-2.5 min-w-52">
            <span className="text-gray-400 text-sm">📍</span>
            <input value={location} onChange={e => setLocation(e.target.value)}
              className="flex-1 text-sm outline-none text-gray-700" placeholder="Location" />
            <span className="text-gray-300 text-xs">▼</span>
          </div>
          <button onClick={() => setPage(1)}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
            Search
          </button>
        </div>
        <p className="text-gray-400 text-xs mt-2">Popular: Twitter, Microsoft, Apple, Facebook</p>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-60 bg-white border-r border-gray-200 p-5 flex-shrink-0 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-gray-700">Filters</span>
            {hasFilters ? <button onClick={clearAll} className="text-xs text-red-500 hover:underline">Clear all</button> : null}
          </div>

          <FilterSection title="Industry">
            {INDUSTRIES.map(i => (
              <CheckItem key={i} label={`${i} (${industryCounts[i] || 0})`}
                checked={selIndustry.includes(i)}
                onChange={() => { toggle(selIndustry, setSelIndustry, i); setPage(1); }} />
            ))}
          </FilterSection>

          <FilterSection title="Company Size">
            {SIZES.map(s => (
              <CheckItem key={s} label={`${s} (${sizeCounts[s] || 0})`}
                checked={selSize.includes(s)}
                onChange={() => { toggle(selSize, setSelSize, s); setPage(1); }} />
            ))}
          </FilterSection>
        </aside>

        {/* Main content */}
        <div className="flex-1 p-6 min-w-0 overflow-y-auto">
          {/* Results header */}
          <div className="flex justify-between items-center mb-5">
            <div>
              <h2 className="font-semibold text-gray-900">All Companies</h2>
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
              <button onClick={() => setViewGrid(true)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg border transition ${viewGrid ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-400 hover:bg-gray-50'}`}>
                ⊞
              </button>
              <button onClick={() => setViewGrid(false)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg border transition ${!viewGrid ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-400 hover:bg-gray-50'}`}>
                ☰
              </button>
            </div>
          </div>

          {/* Active filter chips */}
          {hasFilters ? (
            <div className="flex flex-wrap gap-2 mb-4">
              {[...selIndustry, ...selSize].map(f => (
                <span key={f} className="flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-full border border-blue-200">
                  {f}
                  <button onClick={() => {
                    if (selIndustry.includes(f)) toggle(selIndustry, setSelIndustry, f);
                    else toggle(selSize, setSelSize, f);
                    setPage(1);
                  }} className="ml-0.5 hover:text-red-500">✕</button>
                </span>
              ))}
            </div>
          ) : null}

          {/* Company cards */}
          {paginated.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <span className="text-5xl mb-3">🏢</span>
              <p className="text-lg font-medium text-gray-500">No companies found</p>
              <p className="text-sm mt-1">Try adjusting your filters or search terms</p>
              <button onClick={clearAll} className="mt-4 text-sm text-blue-600 hover:underline">Clear all filters</button>
            </div>
          ) : (
            <div className={viewGrid ? 'grid grid-cols-2 gap-4' : 'space-y-4'}>
              {paginated.map(company => <CompanyCard key={company.id} company={company} grid={viewGrid} />)}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-1 mt-6">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
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
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:bg-gray-100 rounded disabled:opacity-30">›</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
