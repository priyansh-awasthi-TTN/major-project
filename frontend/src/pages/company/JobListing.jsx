import { useState } from 'react';
import { Link } from 'react-router-dom';
import CompanyTopBar from '../../components/CompanyTopBar';
import { jobListings } from '../../data/companyMockData';

export default function JobListing() {
  const [dateRange, setDateRange] = useState('July 19 - July 25');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(null);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [filters, setFilters] = useState({
    status: 'all',
    jobType: 'all',
    dateRange: 'all'
  });

  // Enhanced job listings with needs data
  const enhancedJobListings = jobListings.map(job => ({
    ...job,
    hired: Math.floor(Math.random() * 5) + 1,
    needed: Math.floor(Math.random() * 10) + 5
  }));

  // Filter jobs
  const filteredJobs = enhancedJobListings.filter(job => {
    if (filters.status !== 'all' && job.status !== filters.status) return false;
    if (filters.jobType !== 'all' && job.jobType !== filters.jobType) return false;
    return true;
  });

  // Sort jobs
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    
    if (sortConfig.direction === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Paginate jobs
  const totalPages = Math.ceil(sortedJobs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedJobs = sortedJobs.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  const handleAction = (action, jobId) => {
    setShowActionsMenu(null);
    // Handle actions here
    console.log(`Action: ${action} for job ${jobId}`);
  };

  const getJobTypeBadgeColor = (type) => {
    const colors = {
      'Full-Time': 'bg-purple-100 text-purple-700',
      'Part-Time': 'bg-blue-100 text-blue-700',
      'Freelance': 'bg-yellow-100 text-yellow-700',
      'Contract': 'bg-orange-100 text-orange-700'
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50 min-h-screen">
      <CompanyTopBar title="Job Listing" subtitle={`Here is your jobs listing status from ${dateRange}.`} />
      
      <div className="p-8" style={{ marginTop: '60px' }}>
        {/* Header with Date Range and Post Job Button */}
        <div className="flex justify-between items-center mb-6">
          <div className="relative">
            <button 
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 text-sm text-gray-700"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {dateRange}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showDatePicker && (
              <div className="absolute top-full mt-2 left-0 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-10 w-64">
                <p className="text-sm font-medium mb-2">Select Date Range</p>
                <div className="space-y-2">
                  {['July 19 - July 25', 'July 12 - July 18', 'July 5 - July 11', 'June 28 - July 4'].map(range => (
                    <button
                      key={range}
                      onClick={() => {
                        setDateRange(range);
                        setShowDatePicker(false);
                      }}
                      className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded"
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <Link 
            to="/company/jobs/post"
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Post a job
          </Link>
        </div>

        {/* Main Table Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center p-4 border-b border-gray-100">
            <p className="font-semibold text-gray-900">Job List</p>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 border border-gray-300 text-gray-600 text-sm px-4 py-2 rounded-lg hover:bg-gray-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="p-4 border-b border-gray-100 bg-gray-50">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                  <select 
                    value={filters.status}
                    onChange={(e) => setFilters({...filters, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="Live">Live</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Job Type</label>
                  <select 
                    value={filters.jobType}
                    onChange={(e) => setFilters({...filters, jobType: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="all">All Types</option>
                    <option value="Full-Time">Full-Time</option>
                    <option value="Part-Time">Part-Time</option>
                    <option value="Freelance">Freelance</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button 
                    onClick={() => setFilters({ status: 'all', jobType: 'all', dateRange: 'all' })}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-xs border-b border-gray-100">
                  <th className="text-left p-4 font-medium">
                    <button 
                      onClick={() => handleSort('title')}
                      className="flex items-center gap-1 hover:text-gray-700"
                    >
                      Roles
                      {sortConfig.key === 'title' && (
                        <svg className={`w-3 h-3 ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      )}
                    </button>
                  </th>
                  <th className="text-left p-4 font-medium">
                    <button 
                      onClick={() => handleSort('status')}
                      className="flex items-center gap-1 hover:text-gray-700"
                    >
                      Status
                      {sortConfig.key === 'status' && (
                        <svg className={`w-3 h-3 ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      )}
                    </button>
                  </th>
                  <th className="text-left p-4 font-medium">
                    <button 
                      onClick={() => handleSort('datePosted')}
                      className="flex items-center gap-1 hover:text-gray-700"
                    >
                      Date Posted
                      {sortConfig.key === 'datePosted' && (
                        <svg className={`w-3 h-3 ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      )}
                    </button>
                  </th>
                  <th className="text-left p-4 font-medium">
                    <button 
                      onClick={() => handleSort('dueDate')}
                      className="flex items-center gap-1 hover:text-gray-700"
                    >
                      Due Date
                      {sortConfig.key === 'dueDate' && (
                        <svg className={`w-3 h-3 ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      )}
                    </button>
                  </th>
                  <th className="text-left p-4 font-medium">
                    <button 
                      onClick={() => handleSort('jobType')}
                      className="flex items-center gap-1 hover:text-gray-700"
                    >
                      Job Type
                      {sortConfig.key === 'jobType' && (
                        <svg className={`w-3 h-3 ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      )}
                    </button>
                  </th>
                  <th className="text-left p-4 font-medium">
                    <button 
                      onClick={() => handleSort('applications')}
                      className="flex items-center gap-1 hover:text-gray-700"
                    >
                      Applicants
                      {sortConfig.key === 'applications' && (
                        <svg className={`w-3 h-3 ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      )}
                    </button>
                  </th>
                  <th className="text-left p-4 font-medium">Needs</th>
                  <th className="p-4" />
                </tr>
              </thead>
              <tbody>
                {paginatedJobs.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="p-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <p className="text-gray-500 font-medium">No jobs found</p>
                        <p className="text-gray-400 text-sm">Try adjusting your filters</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedJobs.map(job => (
                    <tr key={job.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`${job.color} text-white rounded-lg w-10 h-10 flex items-center justify-center text-sm font-bold`}>
                            {job.title[0]}
                          </div>
                          <p className="font-medium text-gray-900">{job.title}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                          job.status === 'Live' 
                            ? 'bg-green-50 text-green-700 border border-green-200' 
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                          {job.status}
                        </span>
                      </td>
                      <td className="p-4 text-gray-600 text-sm">{job.datePosted}</td>
                      <td className="p-4 text-gray-600 text-sm">{job.dueDate}</td>
                      <td className="p-4">
                        <span className={`text-xs px-3 py-1 rounded-full font-medium ${getJobTypeBadgeColor(job.jobType)}`}>
                          {job.jobType}
                        </span>
                      </td>
                      <td className="p-4 text-gray-900 font-semibold">{job.applications}</td>
                      <td className="p-4">
                        <span className="text-gray-900 font-medium">{job.hired} / {job.needed}</span>
                      </td>
                      <td className="p-4">
                        <div className="relative">
                          <button 
                            onClick={() => setShowActionsMenu(showActionsMenu === job.id ? null : job.id)}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                          >
                            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                              <circle cx="12" cy="5" r="2" />
                              <circle cx="12" cy="12" r="2" />
                              <circle cx="12" cy="19" r="2" />
                            </svg>
                          </button>
                          
                          {showActionsMenu === job.id && (
                            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 w-48">
                              <Link 
                                to={`/company/jobs/${job.id}/applicants`}
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                onClick={() => setShowActionsMenu(null)}
                              >
                                View Applicants
                              </Link>
                              <Link 
                                to={`/company/jobs/${job.id}/detail`}
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                onClick={() => setShowActionsMenu(null)}
                              >
                                View Details
                              </Link>
                              <button 
                                onClick={() => handleAction('edit', job.id)}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                Edit Job
                              </button>
                              <button 
                                onClick={() => handleAction('duplicate', job.id)}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                Duplicate
                              </button>
                              <hr className="my-1" />
                              <button 
                                onClick={() => handleAction('close', job.id)}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                {job.status === 'Live' ? 'Close Job' : 'Reopen Job'}
                              </button>
                              <button 
                                onClick={() => handleAction('delete', job.id)}
                                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                              >
                                Delete Job
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center p-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">View</span>
              <select 
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-sm text-gray-600">jobs per page</span>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button 
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
