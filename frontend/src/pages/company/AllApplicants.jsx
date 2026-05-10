import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  Squares2X2Icon,
  TableCellsIcon,
} from '@heroicons/react/24/outline';
import CompanyTopBar from '../../components/CompanyTopBar';
import apiService from '../../services/api';
import {
  buildJobsById,
  COMPANY_STAGE_OPTIONS,
  filterApplications,
  formatNumber,
  getInitials,
  normalizeApplication,
  normalizeJob,
} from '../../utils/companyData';

function compareValues(left, right, direction) {
  if (left < right) return direction === 'asc' ? -1 : 1;
  if (left > right) return direction === 'asc' ? 1 : -1;
  return 0;
}

function LoadingState() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-indigo-600" />
        <p className="mt-3 text-sm text-slate-500">Loading applicants...</p>
      </div>
    </div>
  );
}

function TableHeaderButton({ label, sortKey, currentSort, onSort }) {
  const isActive = currentSort.key === sortKey;

  return (
    <button
      type="button"
      onClick={() => onSort(sortKey)}
      className="flex items-center gap-2 text-[12px] font-medium text-slate-500 transition hover:text-slate-900"
    >
      <span>{label}</span>
      <span className={`transition ${isActive && currentSort.direction === 'desc' ? 'rotate-180' : ''}`}>⌄</span>
    </button>
  );
}

function PipelineCard({ applicant }) {
  return (
    <Link
      to={`/company/applicants/${applicant.id}`}
      className="block rounded-[10px] border border-slate-200 bg-white p-4 transition hover:border-indigo-300"
    >
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-semibold text-white ${applicant.avatarTone}`}>
          {getInitials(applicant.candidateName)}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">{applicant.candidateName}</p>
          <p className="truncate text-xs text-slate-500">{applicant.jobTitle}</p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
          {applicant.stage}
        </span>
        <span className="text-[12px] text-slate-500">{applicant.dateAppliedLabel}</span>
      </div>
    </Link>
  );
}

export default function AllApplicants() {
  const [view, setView] = useState('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStage, setFilterStage] = useState('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: 'dateApplied', direction: 'desc' });
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const loadApplicants = async () => {
      setLoading(true);
      setError('');

      try {
        const [jobsResponse, applicationsResponse] = await Promise.all([
          apiService.getCompanyJobs(),
          apiService.getCompanyApplications(),
        ]);

        if (cancelled) return;

        const normalizedJobs = (jobsResponse || []).map(normalizeJob);
        const jobsById = buildJobsById(normalizedJobs);
        const normalizedApplications = (applicationsResponse || []).map((item) => normalizeApplication(item, jobsById));
        setApplications(normalizedApplications);
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError.message || 'Failed to load applicants.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadApplicants();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredApplicants = useMemo(() => {
    const base = filterApplications(applications, { search: searchQuery, stage: filterStage });

    return [...base].sort((left, right) => {
      switch (sortConfig.key) {
        case 'candidateName':
          return compareValues(left.candidateName, right.candidateName, sortConfig.direction);
        case 'score':
          return compareValues(left.score, right.score, sortConfig.direction);
        case 'stage':
          return compareValues(left.stage, right.stage, sortConfig.direction);
        case 'jobTitle':
          return compareValues(left.jobTitle, right.jobTitle, sortConfig.direction);
        case 'dateApplied':
        default:
          return compareValues(left.dateApplied?.getTime() || 0, right.dateApplied?.getTime() || 0, sortConfig.direction);
      }
    });
  }, [applications, filterStage, searchQuery, sortConfig.direction, sortConfig.key]);

  const totalPages = Math.max(1, Math.ceil(filteredApplicants.length / itemsPerPage));
  const safeCurrentPage = currentPage > totalPages ? totalPages : currentPage;
  const paginatedApplicants = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * itemsPerPage;
    return filteredApplicants.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredApplicants, itemsPerPage, safeCurrentPage]);

  function handleSort(sortKey) {
    setSortConfig((current) => {
      if (current.key === sortKey) {
        return { key: sortKey, direction: current.direction === 'asc' ? 'desc' : 'asc' };
      }

      return { key: sortKey, direction: 'asc' };
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fbfbfd]">
        <CompanyTopBar variant="applicants" />
        <div className="px-5 pb-12 pt-[88px] sm:px-6 lg:px-8">
          <LoadingState />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbfbfd]">
      <CompanyTopBar variant="applicants" />

      <div className="px-5 pb-12 pt-[88px] sm:px-6 lg:px-8">
        {error ? (
          <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <div className="w-full">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-4 border border-slate-200 bg-white px-6 py-5">
              <div className="flex items-center justify-between gap-4">
                <h1 className="text-[16px] font-semibold text-slate-900">
                  Total Applicants: {formatNumber(filteredApplicants.length)}
                </h1>
              </div>

              <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <div className="relative w-full max-w-[320px]">
                  <MagnifyingGlassIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(event) => {
                      setSearchQuery(event.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search applicants"
                    className="h-11 w-full rounded-[6px] border border-slate-200 bg-white pl-10 pr-4 text-[13px] text-slate-900 outline-none placeholder:text-slate-400 focus:border-indigo-500"
                  />
                </div>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowFilterMenu((current) => !current)}
                    className="inline-flex h-11 items-center gap-2 rounded-[6px] border border-slate-200 px-4 text-[13px] font-medium text-slate-900 transition hover:bg-slate-50"
                  >
                    <FunnelIcon className="h-4 w-4" />
                    <span>Filter</span>
                  </button>

                  {showFilterMenu ? (
                    <div className="absolute left-0 top-full z-10 mt-2 min-w-[180px] rounded-xl border border-slate-200 bg-white py-2 shadow-sm">
                      {COMPANY_STAGE_OPTIONS.map((stage) => (
                        <button
                          key={stage}
                          type="button"
                          onClick={() => {
                            setFilterStage(stage);
                            setShowFilterMenu(false);
                            setCurrentPage(1);
                          }}
                          className={`block w-full px-4 py-2 text-left text-[13px] ${
                            filterStage === stage ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {stage === 'all' ? 'All stages' : stage}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>

                <div className="ml-auto flex items-center gap-2 self-end lg:self-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setView('pipeline');
                      setCurrentPage(1);
                    }}
                    className={`inline-flex h-10 items-center gap-2 rounded-[6px] border px-4 text-[12px] font-medium transition ${
                      view === 'pipeline'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Squares2X2Icon className="h-4 w-4" />
                    Pipeline
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setView('table');
                      setCurrentPage(1);
                    }}
                    className={`inline-flex h-10 items-center gap-2 rounded-[6px] border px-4 text-[12px] font-medium transition ${
                      view === 'table'
                        ? 'border-indigo-600 bg-indigo-600 text-white'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <TableCellsIcon className="h-4 w-4" />
                    Table
                  </button>
                </div>
              </div>
            </div>

            {view === 'table' ? (
              <div className="overflow-hidden border border-slate-200 bg-white">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-[0.14em] text-slate-500">
                      <tr>
                        <th className="px-5 py-4 text-left font-semibold">
                          <TableHeaderButton label="Full Name" sortKey="candidateName" currentSort={sortConfig} onSort={handleSort} />
                        </th>
                        <th className="px-5 py-4 text-left font-semibold">
                          <TableHeaderButton label="Role" sortKey="jobTitle" currentSort={sortConfig} onSort={handleSort} />
                        </th>
                        <th className="px-5 py-4 text-left font-semibold">
                          <TableHeaderButton label="Stage" sortKey="stage" currentSort={sortConfig} onSort={handleSort} />
                        </th>
                        <th className="px-5 py-4 text-left font-semibold">
                          <TableHeaderButton label="Applied Date" sortKey="dateApplied" currentSort={sortConfig} onSort={handleSort} />
                        </th>
                        <th className="px-5 py-4 text-left font-semibold">
                          <TableHeaderButton label="Score" sortKey="score" currentSort={sortConfig} onSort={handleSort} />
                        </th>
                        <th className="px-5 py-4 text-right font-semibold">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {paginatedApplicants.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-5 py-16 text-center">
                            <p className="text-sm font-medium text-slate-500">No applicants match the current search and filter state.</p>
                          </td>
                        </tr>
                      ) : (
                        paginatedApplicants.map((applicant) => (
                          <tr key={applicant.id}>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className={`flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-semibold text-white ${applicant.avatarTone}`}>
                                  {getInitials(applicant.candidateName)}
                                </div>
                                <div className="min-w-0">
                                  <p className="truncate font-semibold text-slate-900">{applicant.candidateName}</p>
                                  <p className="truncate text-xs text-slate-500">{applicant.candidateEmail}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-4 text-slate-600">{applicant.jobTitle}</td>
                            <td className="px-5 py-4">
                              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{applicant.stage}</span>
                            </td>
                            <td className="px-5 py-4 text-slate-600">{applicant.dateAppliedLabel}</td>
                            <td className="px-5 py-4 text-slate-600">{applicant.score.toFixed(1)}</td>
                            <td className="px-5 py-4 text-right">
                              <Link
                                to={`/company/applicants/${applicant.id}`}
                                className="inline-flex rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                              >
                                Open
                              </Link>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-col gap-4 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <span>View</span>
                    <select
                      value={itemsPerPage}
                      onChange={(event) => {
                        setItemsPerPage(Number(event.target.value));
                        setCurrentPage(1);
                      }}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>
                    <span>applicants per page</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                      disabled={safeCurrentPage === 1}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 disabled:opacity-40"
                    >
                      <ChevronLeftIcon className="h-5 w-5" />
                    </button>
                    <span className="px-3 text-sm font-medium text-slate-700">
                      {safeCurrentPage} / {totalPages}
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                      disabled={safeCurrentPage === totalPages}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 disabled:opacity-40"
                    >
                      <ChevronRightIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
                {COMPANY_STAGE_OPTIONS.slice(1).map((stage) => {
                  const stageApplicants = filteredApplicants.filter((applicant) => applicant.stage === stage);

                  return (
                    <div key={stage} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-slate-900">{stage}</h2>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                          {formatNumber(stageApplicants.length)}
                        </span>
                      </div>

                      <div className="space-y-3">
                        {stageApplicants.length === 0 ? (
                          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-4 text-xs text-slate-500">
                            No applicants in this stage.
                          </div>
                        ) : (
                          stageApplicants.map((applicant) => <PipelineCard key={applicant.id} applicant={applicant} />)
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
