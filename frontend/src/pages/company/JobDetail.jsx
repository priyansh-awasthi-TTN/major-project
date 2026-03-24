import { useParams, Link } from 'react-router-dom';
import CompanyTopBar from '../../components/CompanyTopBar';
import { jobListings } from '../../data/companyMockData';
export default function CompanyJobDetail() {
  const { id } = useParams();
  const job = jobListings.find(j => j.id === Number(id)) || jobListings[0];

  return (
    <div className="flex-1 flex flex-col bg-gray-50 min-h-screen">
      <CompanyTopBar title={job.title} subtitle={`Design · Full Time · 4/11 Hired`} />
      <div className="px-8 py-4 bg-white border-b border-gray-200 flex items-center gap-4">
        <Link to="/company/jobs" className="text-gray-400 text-sm hover:text-gray-600">← Job Listing</Link>
        <div className="flex gap-1">
          {[
            { label: 'Applicants', path: `/company/jobs/${id}/applicants` },
            { label: 'Job Details', path: `/company/jobs/${id}/detail` },
            { label: 'Analytics', path: `/company/jobs/${id}/analytics` },
          ].map((t, i) => (
            <Link key={t.label} to={t.path}
              className={`px-4 py-2 text-sm rounded-lg ${i === 1 ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>{t.label}</Link>
          ))}
        </div>
        <button className="ml-auto text-blue-600 text-sm border border-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-50">Edit Job Details</button>
      </div>

      <div className="p-8 max-w-4xl">
        <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6 flex items-start gap-4">
          <div className={`${job.color} text-white rounded-xl w-14 h-14 flex items-center justify-center font-bold text-xl`}>{job.title[0]}</div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{job.title}</h1>
            <p className="text-sm text-gray-500">Nomad · Paris, France · Full-Time</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h2 className="font-bold text-gray-900 mb-3">Description</h2>
              <p className="text-sm text-gray-600 leading-relaxed">Stripe is looking for a Social Media Marketing expert to help manage our online networks. You will be responsible for monitoring our social media channels, creating content, finding effective ways to engage the community and inspire others to engage in our channels.</p>

              <h2 className="font-bold text-gray-900 mt-5 mb-3">Responsibilities</h2>
              <ul className="space-y-2 text-sm text-gray-600">
                {['Community engagement to ensure that is supported and actively represented online', 'Focus on social media content development and publication', 'Marketing and strategy support', 'Stay on top of trends on social media platforms, and suggest content ideas to the team', 'Engage with online communities'].map((r, i) => (
                  <li key={i} className="flex gap-2"><span className="text-blue-500">✓</span>{r}</li>
                ))}
              </ul>

              <h2 className="font-bold text-gray-900 mt-5 mb-3">Who You Are</h2>
              <ul className="space-y-2 text-sm text-gray-600">
                {['You get energy from people and building the Atlassian deployment presence', 'You have some Stripe Office and Office experience', 'You are a confident communicator and writer'].map((r, i) => (
                  <li key={i} className="flex gap-2"><span className="text-blue-500">✓</span>{r}</li>
                ))}
              </ul>

              <h2 className="font-bold text-gray-900 mt-5 mb-3">Nice-To-Haves</h2>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex gap-2"><span className="text-gray-400">✓</span>Project management skills</li>
                <li className="flex gap-2"><span className="text-gray-400">✓</span>Copy editing skills</li>
              </ul>

              <h2 className="font-bold text-gray-900 mt-5 mb-3">Perks & Benefits</h2>
              <div className="grid grid-cols-4 gap-3">
                {['Full Healthcare', 'Unlimited Vacation', 'Skill Development', 'Team Summits', 'Remote Working', 'Commuter Benefits', 'We give back', 'Flexible Team'].map(p => (
                  <div key={p} className="text-center p-3 border border-gray-200 rounded-lg">
                    <div className="text-xl mb-1">🎁</div>
                    <p className="text-xs text-gray-600">{p}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">About this role</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Applied</span><span className="font-medium">{job.applications} / 50 capacity</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Date Posted</span><span className="font-medium">{job.datePosted}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Job Type</span><span className="font-medium">{job.jobType}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Salary</span><span className="font-medium">$75k-$85k USD</span></div>
              </div>
              <div className="mt-4">
                <p className="text-xs text-gray-400 mb-2">Categories</p>
                <div className="flex flex-wrap gap-2">
                  {['Marketing', 'Design'].map(c => <span key={c} className="text-xs bg-orange-50 text-orange-600 border border-orange-200 rounded px-2 py-0.5">{c}</span>)}
                </div>
              </div>
              <div className="mt-4">
                <p className="text-xs text-gray-400 mb-2">Required Skills</p>
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
  );
}
