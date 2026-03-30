import { useState } from 'react';
import { Link } from 'react-router-dom';
import { companies } from '../data/mockData';

const industries = [
  { label: 'Advertising', count: 63 },
  { label: 'Business Service', count: 6 },
  { label: 'Blockchain', count: 3 },
  { label: 'Cloud', count: 16 },
  { label: 'Consumer Tech', count: 8 },
  { label: 'Education', count: 34 },
  { label: 'Fintech', count: 48 },
  { label: 'Food & Beverage', count: 1 },
  { label: 'Healthcare', count: 7 },
  { label: 'Hosting', count: 5 },
  { label: 'Media', count: 4 },
];

const companySizes = [
  { label: '1-50', count: 3 },
  { label: '51-150', count: 97 },
  { label: '151-250', count: 46 },
  { label: '251-500', count: 4 },
  { label: '501-1000', count: 43 },
  { label: '1001+', count: 23 },
];

export default function BrowseCompanies() {
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [selectedIndustries, setSelectedIndustries] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);

  const handleSearch = () => {
    setSearchQuery(searchInput);
    setLocationQuery(locationInput);
  };

  const toggleIndustry = (label) =>
    setSelectedIndustries(prev => prev.includes(label) ? prev.filter(i => i !== label) : [...prev, label]);

  const toggleSize = (label) =>
    setSelectedSizes(prev => prev.includes(label) ? prev.filter(s => s !== label) : [...prev, label]);

  const filtered = companies.filter(c => {
    const q = searchQuery.toLowerCase();
    const l = locationQuery.toLowerCase();
    const matchesQuery = !searchQuery ||
      c.name.toLowerCase().includes(q) ||
      c.industry?.toLowerCase().includes(q) ||
      c.tags.some(t => t.toLowerCase().includes(q));
    const matchesLoc = !locationQuery.trim() || (c.location || c.description).toLowerCase().includes(l.trim());
    const matchesIndustry = selectedIndustries.length === 0 || selectedIndustries.includes(c.industry);
    const matchesSize = selectedSizes.length === 0 || selectedSizes.includes(c.size);
    return matchesQuery && matchesLoc && matchesIndustry && matchesSize;
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Search Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-12 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Find your <span className="text-blue-600 underline decoration-2 underline-offset-4">dream companies</span>
        </h1>
        <p className="text-gray-500 text-sm mb-6">Find the dream companies you dream work for</p>
        <div className="flex bg-white border border-gray-300 rounded-lg overflow-hidden max-w-2xl mx-auto shadow-sm">
          <div className="flex items-center gap-2 flex-1 px-4 py-3">
            <span className="text-gray-400">🔍</span>
            <input
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              className="flex-1 text-gray-800 text-sm outline-none"
              placeholder="Company name or keyword"
            />
          </div>
          <div className="w-px bg-gray-200 my-2" />
          <div className="flex items-center gap-2 flex-1 px-4 py-3">
            <span className="text-gray-400">📍</span>
            <input value={locationInput} onChange={e => setLocationInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} className="flex-1 text-gray-800 text-sm outline-none" placeholder="Florence, Italy" />
            <span className="text-gray-400 text-xs">▼</span>
          </div>
          <button onClick={handleSearch} className="bg-blue-600 text-white text-sm px-6 py-3 hover:bg-blue-700 font-medium">Search</button>
        </div>
        <p className="text-gray-400 text-xs mt-3">Popular: Twitter, Microsoft, Apple, Facebook</p>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-8 flex gap-8">
        {/* Sidebar */}
        <aside className="w-52 flex-shrink-0">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-900 text-sm">Industry</h3>
              <span className="text-gray-400 text-xs">▲</span>
            </div>
            {industries.map(i => (
              <label key={i.label} className="flex items-center gap-2 text-sm text-gray-600 mb-2.5 cursor-pointer">
                <input type="checkbox" checked={selectedIndustries.includes(i.label)}
                  onChange={() => toggleIndustry(i.label)} className="accent-blue-600 w-4 h-4" />
                <span className="flex-1">{i.label}</span>
                <span className="text-gray-400 text-xs">({i.count})</span>
              </label>
            ))}
          </div>
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-900 text-sm">Company Size</h3>
              <span className="text-gray-400 text-xs">▲</span>
            </div>
            {companySizes.map(s => (
              <label key={s.label} className="flex items-center gap-2 text-sm text-gray-600 mb-2.5 cursor-pointer">
                <input type="checkbox" checked={selectedSizes.includes(s.label)}
                  onChange={() => toggleSize(s.label)} className="accent-blue-600 w-4 h-4" />
                <span className="flex-1">{s.label}</span>
                <span className="text-gray-400 text-xs">({s.count})</span>
              </label>
            ))}
          </div>
        </aside>

        {/* Results */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h2 className="font-bold text-gray-900 text-lg">All Companies</h2>
              <p className="text-sm text-gray-400">Showing {filtered.length} results</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">Sort by:</span>
              <select className="border border-gray-300 rounded-lg text-sm px-3 py-1.5 outline-none text-gray-700">
                <option>Most relevant</option>
                <option>Most jobs</option>
                <option>A-Z</option>
              </select>
              <button className="p-2 rounded-lg border border-gray-300 text-gray-400 hover:border-blue-600 hover:text-blue-600">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M1 2a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V2zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V2zM1 7a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V7zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V7z"/></svg>
              </button>
              <button className="p-2 rounded-lg border border-blue-600 text-blue-600">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path fillRule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"/></svg>
              </button>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-4xl mb-3">🔍</p>
              <p className="font-medium text-gray-600">No companies found</p>
              <p className="text-sm mt-1">Try a different keyword or clear filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {filtered.map(company => (
                <Link key={company.id} to={`/companies/${company.id}`}
                  className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition block">
                  <div className="flex items-start gap-4">
                    <div className={`${company.color} text-white rounded-xl w-12 h-12 flex items-center justify-center font-bold flex-shrink-0`}>{company.logo}</div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-gray-900">{company.name}</h3>
                        <span className="text-xs text-blue-600 font-medium flex-shrink-0 ml-2">{company.jobs} Jobs</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{company.description}</p>
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {company.tags.map(t => (
                          <span key={t} className={`text-xs rounded px-2 py-0.5 border ${
                            t === 'Blockchain' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                            t === 'Payment Gateway' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                            'bg-orange-50 text-orange-600 border-orange-200'
                          }`}>{t}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="flex justify-center items-center gap-1 mt-8">
            <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:bg-gray-100 rounded">‹</button>
            {[1,2,3].map(p => (
              <button key={p} className={`w-8 h-8 rounded text-sm font-medium ${p === 1 ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>{p}</button>
            ))}
            <span className="text-gray-400 text-sm px-1">...</span>
            <button className="w-8 h-8 rounded text-sm text-gray-600 hover:bg-gray-100">8</button>
            <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:bg-gray-100 rounded">›</button>
          </div>
        </div>
      </div>
    </div>
  );
}
