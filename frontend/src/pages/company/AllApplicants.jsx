import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CompanyTopBar from '../../components/CompanyTopBar';
import apiService from '../../services/api';

const hiringStageColors = {
  'Interview': 'bg-yellow-50 text-yellow-600 border-yellow-200',
  'Shortlisted': 'bg-purple-50 text-purple-600 border-purple-200',
  'Declined': 'bg-red-50 text-red-600 border-red-200',
  'Hired': 'bg-green-50 text-green-600 border-green-200',
  'Interviewed': 'bg-blue-50 text-blue-600 border-blue-200',
  'In Review': 'bg-gray-50 text-gray-600 border-gray-200',
};

export default function AllApplicants() {
  const navigate = useNavigate();
  const [view, setView] = useState('table'); // table | pipeline
  const [apps, setApps] = useState([]);
  const [filteredApps, setFilteredApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApplicants, setSelectedApplicants] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [filterStage, setFilterStage] = useState('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  useEffect(() => {
    fetchApplicants();
  }, []);

  useEffect(() => {
    filterAndSearchApplicants();
  }, [apps, searchQuery, filterStage]);

  const fetchApplicants = async () => {
    try {
      const data = await apiService.getCompanyApplications();
      setApps(data || []);
    } catch (error) {
      console.error('Failed to fetch applicants:', error);
      setApps([]);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSearchApplicants = () => {
    let filtered = [...apps];

    // Apply stage filter
    if (filterStage !== 'all') {
      filtered = filtered.filter(app => app.status === filterStage);
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(app =>
        app.candidateName?.toLowerCase().includes(query) ||
        app.title?.toLowerCase().includes(query) ||
        app.candidateEmail?.toLowerCase().includes(query)
      );
    }

    setFilteredApps(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sorted = [...filteredApps].sort((a, b) => {
      let aVal = a[key];
      let bVal = b[key];

      if (key === 'score') {
        aVal = parseFloat(aVal) || 0;
        bVal = parseFloat(bVal) || 0;
      }

      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredApps(sorted);
  };

  const toggleSelectApplicant = (id) => {
    setSelectedApplicants(prev =>
      prev.includes(id) ? prev.filter(appId => appId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedApplicants.length === paginatedApps.length) {
      setSelectedApplicants([]);
    } else {
      setSelectedApplicants(paginatedApps.map(app => app.id));
    }
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedApps = filteredApps.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredApps.length / itemsPerPage);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const getAvatarColor = (name) => {
    const colors = ['bg-blue-500', 'bg-red-500', 'bg-green-500', 'bg-yellow-500', 'bg-teal-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500'];
    if (!name) return colors[0];
    return colors[name.charCodeAt(0) % colors.length];
  };

  const getScoreDisplay = (score) => {
    const numScore = parseFloat(score) || 0;
    return numScore.toFixed(1);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading applicants...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50 min-h-screen">
      <CompanyTopBar title="All Applicants" subtitle="Manage and review all job applications" />

      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 px-8 py-6 mt-16">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Total Applicants: {filteredApps.length}</h1>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Search Applicants"
            />
          </div>

          <div className="relative">
            <button
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className="border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filter
            </button>

            {showFilterMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
                <p className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Hiring Stage</p>
                {['all', 'Interview', 'Shortlisted', 'Declined', 'Hired', 'Interviewed'].map(stage => (
                  <button
                    key={stage}
                    onClick={() => {
                      setFilterStage(stage);
                      setShowFilterMenu(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${filterStage === stage ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'}`}
                  >
                    {stage === 'all' ? 'All Stages' : stage}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2 border border-gray-300 rounded-lg p-1">
            <button
              onClick={() => setView('pipeline')}
              className={`px-4 py-1.5 text-sm rounded transition ${view === 'pipeline' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              Pipeline View
            </button>
            <button
              onClick={() => setView('table')}
              className={`px-4 py-1.5 text-sm rounded transition ${view === 'table' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              Table View
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-8">
        {view === 'table' ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left">
                      <input
                        type="checkbox"
                        checked={selectedApplicants.length === paginatedApps.length && paginatedApps.length > 0}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-4 text-left">
                      <button
                        onClick={() => handleSort('candidateName')}
                        className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wider hover:text-gray-900"
                      >
                        Full Name
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                        </svg>
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <button
                        onClick={() => handleSort('score')}
                        className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wider hover:text-gray-900"
                      >
                        Score
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                        </svg>
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <button
                        onClick={() => handleSort('status')}
                        className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wider hover:text-gray-900"
                      >
                        Hiring Stage
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                        </svg>
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <button
                        onClick={() => handleSort('dateApplied')}
                        className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wider hover:text-gray-900"
                      >
                        Applied Date
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                        </svg>
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <button
                        onClick={() => handleSort('title')}
                        className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wider hover:text-gray-900"
                      >
                        Job Role
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                        </svg>
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedApps.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedApplicants.includes(app.id)}
                          onChange={() => toggleSelectApplicant(app.id)}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`${getAvatarColor(app.candidateName)} text-white rounded-full w-10 h-10 flex items-center justify-center text-sm font-semibold shadow-sm`}>
                            {getInitials(app.candidateName)}
                          </div>
                          <span className="font-medium text-gray-900">{app.candidateName || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="font-medium text-gray-900">{getScoreDisplay(app.score)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${hiringStageColors[app.status] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                          {app.status || 'In Review'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {app.dateApplied || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        {app.title || 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/company/applicants/${app.id}`)}
                            className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 hover:text-white transition"
                          >
                            See Application
                          </button>
                          <button className="text-gray-400 hover:text-gray-600 p-2">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {paginatedApps.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                          </svg>
                          <p className="text-gray-500 font-medium mb-1">No applicants found</p>
                          <p className="text-gray-400 text-sm">Try adjusting your search or filter criteria</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredApps.length > 0 && (
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">View</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="border border-gray-300 rounded px-3 py-1 text-sm outline-none focus:border-blue-500"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <span className="text-sm text-gray-600">Applicants per page</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  {[...Array(Math.min(totalPages, 5))].map((_, idx) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = idx + 1;
                    } else if (currentPage <= 3) {
                      pageNum = idx + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + idx;
                    } else {
                      pageNum = currentPage - 2 + idx;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-lg text-sm font-medium transition ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Pipeline View */
          <div className="grid grid-cols-4 gap-6">
            {['Interview', 'Shortlisted', 'Interviewed', 'Hired'].map(stage => {
              const stageApplicants = filteredApps.filter(a => a.status === stage);
              return (
                <div key={stage} className="bg-white rounded-xl border border-gray-200 shadow-sm">
                  <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-xl">
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border ${hiringStageColors[stage]}`}>
                        {stage}
                      </span>
                      <span className="text-sm font-bold text-gray-500">{stageApplicants.length}</span>
                    </div>
                  </div>
                  <div className="p-4 space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
                    {stageApplicants.map(app => (
                      <div
                        key={app.id}
                        className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-blue-400 hover:shadow-md transition cursor-pointer"
                        onClick={() => navigate(`/company/applicants/${app.id}`)}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`${getAvatarColor(app.candidateName)} text-white rounded-full w-10 h-10 flex items-center justify-center text-sm font-semibold shadow-sm`}>
                            {getInitials(app.candidateName)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">{app.candidateName}</p>
                            <p className="text-xs text-gray-500 truncate">{app.title}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 mb-3">
                          <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="text-sm font-medium text-gray-700">{getScoreDisplay(app.score)}</span>
                        </div>
                        <p className="text-xs text-gray-500 mb-3">📅 Applied {app.dateApplied}</p>
                        <button className="w-full bg-blue-50 text-blue-600 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 hover:text-white transition">
                          View Application
                        </button>
                      </div>
                    ))}
                    {stageApplicants.length === 0 && (
                      <div className="text-center py-8">
                        <p className="text-sm text-gray-400">No applicants in this stage</p>
                      </div>
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
