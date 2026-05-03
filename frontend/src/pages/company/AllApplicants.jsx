import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EllipsisHorizontalIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  StarIcon as StarOutlineIcon,
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import CompanyTopBar from '../../components/CompanyTopBar';
import ApplicantPortrait from '../../components/ApplicantPortrait';
import {
  applicantReferenceList,
  companyApplicantsReferenceMeta,
} from '../../data/companyApplicantsReference';

const stageBadgeStyles = {
  Interview: 'border-[#f0b34a] text-[#f0b34a]',
  Shortlisted: 'border-[#6b5cff] text-[#6b5cff]',
  Declined: 'border-[#ff6550] text-[#ff6550]',
  Hired: 'border-[#56cdad] text-[#56cdad]',
  Interviewed: 'border-[#4f9cff] text-[#4f9cff]',
  'In Review': 'border-[#98a2b3] text-[#98a2b3]',
};

const pipelineColumns = ['In Review', 'Shortlisted', 'Interview', 'Interviewed', 'Hired', 'Declined'];

function compareValues(a, b, direction) {
  if (a < b) return direction === 'asc' ? -1 : 1;
  if (a > b) return direction === 'asc' ? 1 : -1;
  return 0;
}

function RatingCell({ score, scoreLabel }) {
  const empty = score <= 0;

  return (
    <div className="flex items-center gap-1.5 text-[13px] text-[#25324b]">
      {empty ? <StarOutlineIcon className="h-4 w-4 text-[#25324b]" /> : <StarIcon className="h-4 w-4 text-[#ffb836]" />}
      <span>{scoreLabel}</span>
    </div>
  );
}

function TableHeaderButton({ label, sortKey, currentSort, onSort }) {
  const isActive = currentSort.key === sortKey;

  return (
    <button
      type="button"
      onClick={() => onSort(sortKey)}
      className="flex items-center gap-2 text-[12px] font-medium text-[#7c8493] transition hover:text-[#25324b]"
    >
      <span>{label}</span>
      <ChevronDownIcon className={`h-3.5 w-3.5 transition ${isActive && currentSort.direction === 'desc' ? 'rotate-180' : ''}`} />
    </button>
  );
}

function PipelineCard({ applicant }) {
  return (
    <Link
      to={`/company/applicants/${applicant.id}`}
      className="block rounded-[6px] border border-[#d6ddeb] bg-white p-4 transition hover:border-[#5b4ff7]"
    >
      <div className="flex items-center gap-3">
        <ApplicantPortrait palette={applicant.avatarPalette} className="h-10 w-10 border border-white shadow-sm" />
        <div className="min-w-0">
          <p className="truncate text-[14px] font-semibold text-[#25324b]">{applicant.name}</p>
          <p className="truncate text-[12px] text-[#7c8493]">{applicant.jobRole}</p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <RatingCell score={applicant.score} scoreLabel={applicant.scoreLabel} />
        <span className="text-[12px] text-[#7c8493]">{applicant.appliedDate}</span>
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
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [selectedApplicantIds, setSelectedApplicantIds] = useState([]);

  const filteredApplicants = useMemo(() => {
    let results = [...applicantReferenceList];

    if (filterStage !== 'all') {
      results = results.filter((applicant) => applicant.stage === filterStage);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      results = results.filter((applicant) => {
        return (
          applicant.name.toLowerCase().includes(query) ||
          applicant.jobRole.toLowerCase().includes(query) ||
          applicant.profileRole.toLowerCase().includes(query)
        );
      });
    }

    if (sortConfig.key) {
      results.sort((left, right) => {
        switch (sortConfig.key) {
          case 'name':
            return compareValues(left.name, right.name, sortConfig.direction);
          case 'score':
            return compareValues(left.score, right.score, sortConfig.direction);
          case 'stage':
            return compareValues(left.stage, right.stage, sortConfig.direction);
          case 'appliedDate':
            return compareValues(left.appliedOrder, right.appliedOrder, sortConfig.direction);
          case 'jobRole':
            return compareValues(left.jobRole, right.jobRole, sortConfig.direction);
          default:
            return 0;
        }
      });
    }

    return results;
  }, [filterStage, searchQuery, sortConfig]);

  const totalPages = Math.max(1, Math.ceil(filteredApplicants.length / itemsPerPage));
  const safeCurrentPage = currentPage > totalPages ? totalPages : currentPage;
  const paginatedApplicants = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * itemsPerPage;
    return filteredApplicants.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredApplicants, itemsPerPage, safeCurrentPage]);

  const allCurrentPageSelected =
    paginatedApplicants.length > 0 && paginatedApplicants.every((applicant) => selectedApplicantIds.includes(applicant.id));

  function handleSort(sortKey) {
    setSortConfig((current) => {
      if (current.key === sortKey) {
        return { key: sortKey, direction: current.direction === 'asc' ? 'desc' : 'asc' };
      }

      return { key: sortKey, direction: 'asc' };
    });
  }

  function toggleApplicantSelection(id) {
    setSelectedApplicantIds((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id]
    );
  }

  function toggleCurrentPageSelection() {
    if (allCurrentPageSelected) {
      setSelectedApplicantIds((current) => current.filter((id) => !paginatedApplicants.some((applicant) => applicant.id === id)));
      return;
    }

    setSelectedApplicantIds((current) => {
      const next = new Set(current);
      paginatedApplicants.forEach((applicant) => next.add(applicant.id));
      return Array.from(next);
    });
  }

  return (
    <div className="min-h-screen bg-[#fbfbfd]">
      <CompanyTopBar variant="applicants" />

      <div className="px-5 pb-12 pt-[88px] sm:px-6 lg:px-8">
        <div className="w-full">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-4 border border-[#d6ddeb] bg-white px-6 py-5">
              <div className="flex items-center justify-between gap-4">
                <h1 className="text-[16px] font-semibold text-[#25324b]">
                  Total Applicants : {companyApplicantsReferenceMeta.totalApplicants}
                </h1>
              </div>

              <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <div className="relative w-full max-w-[320px]">
                  <MagnifyingGlassIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a8adb7]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(event) => {
                      setSearchQuery(event.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search Applicants"
                    className="h-11 w-full rounded-[2px] border border-[#d6ddeb] bg-white pl-10 pr-4 text-[13px] text-[#25324b] outline-none placeholder:text-[#a8adb7] focus:border-[#5b4ff7]"
                  />
                </div>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowFilterMenu((current) => !current)}
                    className="inline-flex h-11 items-center gap-2 rounded-[2px] border border-[#d6ddeb] px-4 text-[13px] font-medium text-[#25324b] transition hover:bg-[#f8f8fd]"
                  >
                    <FunnelIcon className="h-4 w-4" />
                    <span>Filter</span>
                  </button>

                  {showFilterMenu ? (
                    <div className="absolute left-0 top-full z-10 mt-2 min-w-[180px] border border-[#d6ddeb] bg-white py-2 shadow-sm">
                      {['all', 'In Review', 'Shortlisted', 'Interview', 'Interviewed', 'Hired', 'Declined'].map((stage) => (
                        <button
                          key={stage}
                          type="button"
                          onClick={() => {
                            setFilterStage(stage);
                            setShowFilterMenu(false);
                            setCurrentPage(1);
                          }}
                          className={`block w-full px-4 py-2 text-left text-[13px] ${
                            filterStage === stage ? 'bg-[#f1efff] text-[#5b4ff7]' : 'text-[#515b6f] hover:bg-[#f8f8fd]'
                          }`}
                        >
                          {stage === 'all' ? 'All Stages' : stage}
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
                    className={`h-10 rounded-[2px] border px-4 text-[12px] font-medium transition ${
                      view === 'pipeline'
                        ? 'border-[#5b4ff7] bg-[#f1efff] text-[#5b4ff7]'
                        : 'border-[#d6ddeb] bg-white text-[#515b6f] hover:bg-[#f8f8fd]'
                    }`}
                  >
                    Pipeline View
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setView('table');
                      setCurrentPage(1);
                    }}
                    className={`h-10 rounded-[2px] border px-4 text-[12px] font-medium transition ${
                      view === 'table'
                        ? 'border-[#5b4ff7] bg-[#5b4ff7] text-white'
                        : 'border-[#d6ddeb] bg-white text-[#515b6f] hover:bg-[#f8f8fd]'
                    }`}
                  >
                    Table View
                  </button>
                </div>
              </div>
            </div>

            {view === 'table' ? (
              <div className="overflow-hidden border border-[#d6ddeb] bg-white">
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse">
                    <thead className="border-b border-[#d6ddeb] bg-white">
                      <tr>
                        <th className="px-3 py-4 text-left">
                          <input
                            type="checkbox"
                            checked={allCurrentPageSelected}
                            onChange={toggleCurrentPageSelection}
                            className="h-4 w-4 rounded-[2px] border border-[#d6ddeb] text-[#5b4ff7] focus:ring-0"
                          />
                        </th>
                        <th className="px-3 py-4 text-left">
                          <TableHeaderButton label="Full Name" sortKey="name" currentSort={sortConfig} onSort={handleSort} />
                        </th>
                        <th className="px-3 py-4 text-left">
                          <TableHeaderButton label="Score" sortKey="score" currentSort={sortConfig} onSort={handleSort} />
                        </th>
                        <th className="px-3 py-4 text-left">
                          <TableHeaderButton label="Hiring Stage" sortKey="stage" currentSort={sortConfig} onSort={handleSort} />
                        </th>
                        <th className="px-3 py-4 text-left">
                          <TableHeaderButton label="Applied Date" sortKey="appliedDate" currentSort={sortConfig} onSort={handleSort} />
                        </th>
                        <th className="px-3 py-4 text-left">
                          <TableHeaderButton label="Job Role" sortKey="jobRole" currentSort={sortConfig} onSort={handleSort} />
                        </th>
                        <th className="px-3 py-4 text-left text-[12px] font-medium text-[#7c8493]">Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {paginatedApplicants.map((applicant, index) => (
                        <tr
                          key={applicant.id}
                          className={`border-b border-[#eef0f5] ${index % 2 === 1 ? 'bg-[#fbfbfd]' : 'bg-white'} hover:bg-[#f8f8fd]`}
                        >
                          <td className="px-3 py-4 align-middle">
                            <input
                              type="checkbox"
                              checked={selectedApplicantIds.includes(applicant.id)}
                              onChange={() => toggleApplicantSelection(applicant.id)}
                              className="h-4 w-4 rounded-[2px] border border-[#d6ddeb] text-[#5b4ff7] focus:ring-0"
                            />
                          </td>
                          <td className="px-3 py-4 align-middle">
                            <div className="flex items-center gap-3">
                              <ApplicantPortrait
                                palette={applicant.avatarPalette}
                                className="h-8 w-8 border border-white shadow-sm"
                              />
                              <span className="text-[14px] font-medium text-[#25324b]">{applicant.name}</span>
                            </div>
                          </td>
                          <td className="px-3 py-4 align-middle">
                            <RatingCell score={applicant.score} scoreLabel={applicant.scoreLabel} />
                          </td>
                          <td className="px-3 py-4 align-middle">
                            <span
                              className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                                stageBadgeStyles[applicant.stage] || 'border-[#d6ddeb] text-[#515b6f]'
                              }`}
                            >
                              {applicant.stage}
                            </span>
                          </td>
                          <td className="px-3 py-4 align-middle text-[13px] text-[#25324b]">{applicant.appliedDate}</td>
                          <td className="px-3 py-4 align-middle text-[13px] text-[#25324b]">{applicant.jobRole}</td>
                          <td className="px-3 py-4 align-middle">
                            <div className="flex items-center gap-3">
                              <Link
                                to={`/company/applicants/${applicant.id}`}
                                className="inline-flex h-9 items-center rounded-[2px] border border-[#5b4ff7] px-4 text-[12px] font-semibold text-[#5b4ff7] transition hover:bg-[#f1efff]"
                              >
                                See Application
                              </Link>
                              <button type="button" className="text-[#515b6f] transition hover:text-[#25324b]">
                                <EllipsisHorizontalIcon className="h-5 w-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-col gap-4 border-t border-[#d6ddeb] px-5 py-4 text-[13px] text-[#7c8493] sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <span>View</span>
                    <label className="relative">
                      <select
                        value={itemsPerPage}
                        onChange={(event) => {
                          setItemsPerPage(Number(event.target.value));
                          setCurrentPage(1);
                        }}
                        className="h-10 appearance-none rounded-[2px] border border-[#d6ddeb] bg-white pl-4 pr-9 text-[13px] text-[#25324b] outline-none"
                      >
                        {companyApplicantsReferenceMeta.itemsPerPageOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                      <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#515b6f]" />
                    </label>
                    <span>Applicants per page</span>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setCurrentPage(Math.max(1, safeCurrentPage - 1))}
                      className="inline-flex h-8 w-8 items-center justify-center text-[#25324b] transition hover:text-[#5b4ff7]"
                    >
                      <ChevronLeftIcon className="h-4 w-4" />
                    </button>

                    {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                      <button
                        key={page}
                        type="button"
                        onClick={() => setCurrentPage(page)}
                        className={`inline-flex h-8 w-8 items-center justify-center rounded-[6px] text-[13px] font-medium transition ${
                          safeCurrentPage === page ? 'bg-[#5b4ff7] text-white' : 'text-[#25324b] hover:bg-[#f1efff]'
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      type="button"
                      onClick={() => setCurrentPage(Math.min(totalPages, safeCurrentPage + 1))}
                      className="inline-flex h-8 w-8 items-center justify-center text-[#25324b] transition hover:text-[#5b4ff7]"
                    >
                      <ChevronRightIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 xl:grid-cols-6">
                {pipelineColumns.map((stage) => {
                  const applicants = filteredApplicants.filter((applicant) => applicant.stage === stage);

                  return (
                    <div key={stage} className="border border-[#d6ddeb] bg-white">
                      <div className="border-b border-[#d6ddeb] px-4 py-3">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                              stageBadgeStyles[stage] || 'border-[#d6ddeb] text-[#515b6f]'
                            }`}
                          >
                            {stage}
                          </span>
                          <span className="text-[12px] font-semibold text-[#25324b]">{applicants.length}</span>
                        </div>
                      </div>
                      <div className="space-y-3 p-3">
                        {applicants.length > 0 ? (
                          applicants.map((applicant) => <PipelineCard key={applicant.id} applicant={applicant} />)
                        ) : (
                          <div className="rounded-[6px] border border-dashed border-[#d6ddeb] px-4 py-8 text-center text-[12px] text-[#a8adb7]">
                            No applicants
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
      </div>
    </div>
  );
}
