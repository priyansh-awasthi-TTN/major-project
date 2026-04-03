import { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import ApplicationModal from '../../components/ApplicationModal';
import ShareModal from '../../components/ShareModal';
import DashTopBar from '../../components/DashTopBar';
import Toast from '../../components/Toast';
import { getCompanyRouteId } from '../../data/discoveryData';
import apiService from '../../services/api';

export default function DashJobDetail() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fromView = searchParams.get('from') || 'list';
  const backTo = `/dashboard/find-jobs?view=${fromView}`;

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      apiService.getJob(id),
      apiService.checkApplicationStatus(id).catch(() => ({ applied: false }))
    ])
      .then(([jobData, statusData]) => {
        setJob(jobData);
        if (statusData && statusData.applied) {
          setApplied(true);
        }
      })
      .catch(() => setJob(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="flex-1 flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
    </div>
  );

  if (!job) return (
    <div className="flex-1 flex items-center justify-center bg-gray-50">
      <div className="text-center text-gray-400">
        <p className="text-lg font-medium">Job not found</p>
        <button onClick={() => navigate(-1)} className="text-blue-600 text-sm hover:underline mt-2 block mx-auto">← Back</button>
      </div>
    </div>
  );

  const companyProfileHref = `/dashboard/companies/${getCompanyRouteId({ name: job.company })}`;
  const companyProfileState = {
    backTo: `${location.pathname}${location.search}${location.hash}`,
    origin: 'job-detail',
    suppressSidebarItem: 'companies',
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50">
      <DashTopBar>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <button onClick={() => navigate(-1)} className="hover:text-blue-600">← Back</button>
        </div>
      </DashTopBar>
      <div className="overflow-y-auto flex-1">
        <div className="max-w-5xl mx-auto px-8 py-8">
          {/* Header */}
          <div className="bg-white rounded-xl p-6 flex items-start justify-between mb-6 border border-gray-200">
            <div className="flex items-start gap-4">
              <div className={`${job.color} text-white rounded-xl w-16 h-16 flex items-center justify-center font-bold text-2xl`}>{job.logo}</div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{job.title}</h1>
                <p className="text-gray-500 text-sm">
                  <Link
                    to={companyProfileHref}
                    state={companyProfileState}
                    className="transition-colors hover:text-blue-600 hover:underline underline-offset-4"
                  >
                    {job.company}
                  </Link>
                  {job.location ? ` • ${job.location}` : ''}
                  {job.type ? ` • ${job.type}` : ''}
                </p>
                <div className="flex gap-2 mt-2">
                  {(job.categories || []).map(c => <span key={c} className="text-xs bg-orange-50 text-orange-600 border border-orange-200 rounded px-2 py-0.5">{c}</span>)}
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowShareModal(true)}
                className="border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 flex items-center gap-2 transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                Share
              </button>
              {applied ? (
                <span className="bg-green-100 text-green-700 px-6 py-2 rounded-lg text-sm font-medium flex items-center gap-1">✓ Applied</span>
              ) : job.applied >= job.capacity ? (
                <span className="bg-red-100 text-red-700 px-6 py-2 rounded-lg text-sm font-medium flex items-center gap-1">✕ Out of Capacity</span>
              ) : (
                <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-blue-700">Apply</button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 space-y-6">
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h2 className="font-bold text-gray-900 mb-3">Description</h2>
                <p className="text-gray-600 text-sm leading-relaxed">Stripe is looking for a Social Media Marketing expert to help manage our online networks. You will be responsible for monitoring our social media channels, creating content, finding effective ways to engage the community and inspire others to engage in our channels.</p>

                <h2 className="font-bold text-gray-900 mt-6 mb-3">Responsibilities</h2>
                <ul className="space-y-2 text-sm text-gray-600">
                  {[
                    'Community engagement to ensure that is supported and actively represented online',
                    'Focus on social media content development and publication',
                    'Marketing and strategy support',
                    'Stay on top of trends on social media platforms, and suggest content ideas to the team',
                    'Engage with online communities',
                  ].map((r, i) => (
                    <li key={i} className="flex gap-2"><span className="text-blue-500 mt-0.5">✓</span>{r}</li>
                  ))}
                </ul>

                <h2 className="font-bold text-gray-900 mt-6 mb-3">Who You Are</h2>
                <ul className="space-y-2 text-sm text-gray-600">
                  {[
                    'You get energy from people and building the Atlassian deployment presence',
                    'You have some Stripe Office and Office experience',
                    'You are a confident communicator and writer',
                    'You are a growth marketer and have a knack for lead-to-campaigns',
                  ].map((r, i) => (
                    <li key={i} className="flex gap-2"><span className="text-blue-500 mt-0.5">✓</span>{r}</li>
                  ))}
                </ul>

                <h2 className="font-bold text-gray-900 mt-6 mb-3">Nice-To-Haves</h2>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex gap-2"><span className="text-gray-400 mt-0.5">✓</span>Project management skills</li>
                  <li className="flex gap-2"><span className="text-gray-400 mt-0.5">✓</span>Copy editing skills</li>
                </ul>

                <h2 className="font-bold text-gray-900 mt-6 mb-3">Perks & Benefits</h2>
                <p className="text-sm text-gray-500 mb-4">This job comes with several perks and benefits</p>
                <div className="grid grid-cols-4 gap-3">
                  {['Full Healthcare', 'Unlimited Vacation', 'Skill Development', 'Team Summits', 'Remote Working', 'Commuter Benefits', 'We give back', 'Flexible Team'].map(perk => (
                    <div key={perk} className="text-center p-3 border border-gray-200 rounded-lg">
                      <div className="text-xl mb-1">🎁</div>
                      <p className="text-xs text-gray-600">{perk}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Company info */}
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`${job.color} text-white rounded-xl w-10 h-10 flex items-center justify-center font-bold`}>{job.logo}</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{job.company}</h3>
                    <p className="text-xs text-gray-400">Read more about {job.company}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600">Stripe is a technology company that builds economic infrastructure for the internet. Businesses of every size use our software to accept payments and manage their businesses online.</p>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <div className="bg-white rounded-xl p-5 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">About this role</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Date Posted</span><span className="font-medium">July 31, 2021</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Job Type</span><span className="font-medium">Full Time</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Salary</span><span className="font-medium">$75k-$85k USD</span></div>
                </div>
                <div className="mt-4">
                  <p className="text-xs text-gray-500 mb-2">Categories</p>
                  <div className="flex flex-wrap gap-2">
                    {(job.categories || []).map(c => <span key={c} className="text-xs bg-orange-50 text-orange-600 border border-orange-200 rounded px-2 py-0.5">{c}</span>)}
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-xs text-gray-500 mb-2">Required Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {['Project Management', 'Copywriting', 'Social Media Marketing', 'Copy Editing'].map(s => (
                      <span key={s} className="text-xs bg-blue-50 text-blue-600 rounded px-2 py-0.5">{s}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showModal && (
        <ApplicationModal
          job={job}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setApplied(true);
            setShowModal(false);
            setToast({ message: `Application for ${job.title} at ${job.company} submitted!`, type: 'success' });
          }}
        />
      )}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        job={job}
        url={window.location.href}
      />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
