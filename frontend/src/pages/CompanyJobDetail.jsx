import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { jobs, companies } from '../data/mockdata';
import { useAuth } from '../context/AuthContext';
import ApplicationModal from '../components/ApplicationModal';
import JobCard from '../components/JobCard';

export default function CompanyJobDetail() {
  const { companyId, jobId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const company = companies.find(c => c.id === Number(companyId)) || companies[0];
  const job = jobs.find(j => j.id === Number(jobId)) || jobs[0];
  const [showModal, setShowModal] = useState(false);

  const handleApply = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-8 py-8">
        {/* Breadcrumb */}
        <p className="text-sm text-gray-400 mb-6">
          <Link to="/" className="hover:text-blue-600">Home</Link>
          {' / '}
          <Link to="/browse-companies" className="hover:text-blue-600">Companies</Link>
          {' / '}
          <Link to={`/companies/${company.id}`} className="hover:text-blue-600">{company.name}</Link>
          {' / '}
          <span className="text-gray-700">{job.title}</span>
        </p>

        {/* Header */}
        <div className="bg-white rounded-xl p-6 flex items-start justify-between mb-6 border border-gray-200">
          <div className="flex items-start gap-4">
            <div className={`${job.color} text-white rounded-xl w-16 h-16 flex items-center justify-center font-bold text-2xl`}>{job.logo}</div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{job.title}</h1>
              <p className="text-gray-500 text-sm">{job.company} • {job.location} • {job.type}</p>
              <div className="flex gap-2 mt-2">
                {job.categories.map(c => (
                  <span key={c} className="text-xs bg-orange-50 text-orange-600 border border-orange-200 rounded px-2 py-0.5">{c}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-50">🔗</button>
            <button onClick={handleApply} className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-blue-700 font-medium">Apply</button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="col-span-2 space-y-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h2 className="font-bold text-gray-900 mb-3">Description</h2>
              <p className="text-gray-600 text-sm leading-relaxed">{company.name} is looking for a {job.title} expert to help manage our online presence. You will be responsible for creating content, finding effective ways to engage the community and inspire others to engage in our channels.</p>

              <h2 className="font-bold text-gray-900 mt-6 mb-3">Responsibilities</h2>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex gap-2"><span className="text-blue-500 mt-0.5">✓</span> Community engagement to ensure that is supported and actively represented online</li>
                <li className="flex gap-2"><span className="text-blue-500 mt-0.5">✓</span> Focus on content development and publication</li>
                <li className="flex gap-2"><span className="text-blue-500 mt-0.5">✓</span> Marketing and strategy support</li>
                <li className="flex gap-2"><span className="text-blue-500 mt-0.5">✓</span> Stay on top of trends and suggest content ideas to the team</li>
                <li className="flex gap-2"><span className="text-blue-500 mt-0.5">✓</span> Engage with online communities</li>
              </ul>

              <h2 className="font-bold text-gray-900 mt-6 mb-3">Who You Are</h2>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex gap-2"><span className="text-blue-500 mt-0.5">✓</span> You get energy from people and building the brand presence</li>
                <li className="flex gap-2"><span className="text-blue-500 mt-0.5">✓</span> You have relevant experience in the field</li>
                <li className="flex gap-2"><span className="text-blue-500 mt-0.5">✓</span> You are a confident communicator and writer</li>
                <li className="flex gap-2"><span className="text-blue-500 mt-0.5">✓</span> You are a growth marketer with a knack for campaigns</li>
              </ul>

              <h2 className="font-bold text-gray-900 mt-6 mb-3">Nice-To-Haves</h2>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex gap-2"><span className="text-gray-400 mt-0.5">✓</span> Project management skills</li>
                <li className="flex gap-2"><span className="text-gray-400 mt-0.5">✓</span> Copy editing skills</li>
              </ul>

              <h2 className="font-bold text-gray-900 mt-6 mb-3">Perks & Benefits</h2>
              <p className="text-sm text-gray-500 mb-4">This job comes with several perks and benefits</p>
              <div className="grid grid-cols-4 gap-4">
                {['Full Healthcare', 'Unlimited Vacation', 'Skill Development', 'Team Summits', 'Remote Working', 'Commuter Benefits', 'We give back', 'Flexible Team'].map(perk => (
                  <div key={perk} className="text-center p-3 border border-gray-200 rounded-lg">
                    <div className="text-2xl mb-1">🎁</div>
                    <p className="text-xs text-gray-600">{perk}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">About this role</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Date Posted</span><span className="font-medium">July 31, 2021</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Job Type</span><span className="font-medium">{job.type}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Salary</span><span className="font-medium">$75k-$85k USD</span></div>
              </div>
              <div className="mt-4">
                <p className="text-xs text-gray-500 mb-2">Categories</p>
                <div className="flex flex-wrap gap-2">
                  {job.categories.map(c => (
                    <span key={c} className="text-xs bg-orange-50 text-orange-600 border border-orange-200 rounded px-2 py-0.5">{c}</span>
                  ))}
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

            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <div className={`${company.color} text-white rounded-xl w-12 h-12 flex items-center justify-center font-bold text-xl mb-3`}>{company.logo}</div>
              <h3 className="font-semibold text-gray-900">{company.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{company.description}</p>
              <Link to={`/companies/${company.id}`} className="text-blue-600 text-sm mt-3 block hover:underline">
                Read more about {company.name} →
              </Link>
            </div>
          </div>
        </div>

        {/* Similar Jobs */}
        <div className="mt-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Similar Jobs</h2>
            <Link to="/find-jobs" className="text-blue-600 text-sm hover:underline">Show all jobs →</Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {jobs.filter(j => j.id !== job.id).slice(0, 4).map(j => <JobCard key={j.id} job={j} />)}
          </div>
        </div>
      </div>

      {showModal && <ApplicationModal job={job} onClose={() => setShowModal(false)} />}
    </div>
  );
}
