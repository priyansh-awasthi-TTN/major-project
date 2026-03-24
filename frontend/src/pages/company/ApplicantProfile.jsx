import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import CompanyTopBar from '../../components/CompanyTopBar';
import { applicants } from '../../data/companyMockData';

const tabs = ['Applicant Profile', 'Resume', 'Hiring Progress', 'Interview Schedule'];

const hiringStages = ['In Review', 'Shortlisted', 'Interview', 'Hired/Rejected'];

export default function ApplicantProfile() {
  const { id } = useParams();
  const applicant = applicants.find(a => a.id === Number(id)) || applicants[0];
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="flex-1 flex flex-col bg-gray-50 min-h-screen">
      <CompanyTopBar title="Social Media Assistant" subtitle="Design · Full Time · 4/11 Hired" />

      {/* Sub nav */}
      <div className="bg-white border-b border-gray-200 px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/company/applicants" className="text-gray-400 text-sm hover:text-gray-600">← Applicant Details</Link>
        </div>
        <div className="flex gap-1">
          {tabs.map((t, i) => (
            <button key={t} onClick={() => setActiveTab(i)}
              className={`px-4 py-2 text-sm rounded-lg transition ${activeTab === i ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>{t}</button>
          ))}
        </div>
        <button className="text-blue-600 text-sm border border-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-50">More Action</button>
      </div>

      <div className="flex flex-1">
        {/* Left panel */}
        <div className="w-72 bg-white border-r border-gray-200 p-6 flex-shrink-0">
          <div className="text-center mb-6">
            <div className={`${applicant.color} text-white rounded-full w-20 h-20 flex items-center justify-center text-2xl font-bold mx-auto mb-3`}>{applicant.avatar}</div>
            <h2 className="font-bold text-gray-900 text-lg">{applicant.name}</h2>
            <p className="text-sm text-gray-500">{applicant.role}</p>
            <div className="flex items-center justify-center gap-1 mt-1">
              <span className="text-yellow-400">★</span>
              <span className="text-sm text-gray-600">{applicant.rating}</span>
            </div>
          </div>

          <div className="space-y-3 text-sm mb-6">
            <div><p className="text-xs text-gray-400">Applied Jobs</p><p className="font-medium text-gray-800">1 · 5 days ago</p></div>
            <div><p className="text-xs text-gray-400">Stage</p><p className="font-medium text-gray-800">Interviewing</p></div>
          </div>

          <div className="mb-6">
            <p className="text-xs text-gray-400 mb-2">Product Development</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '70%' }} />
            </div>
          </div>

          <button className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 mb-3">Schedule Interview</button>

          <div className="space-y-2 text-sm">
            <p className="text-xs text-gray-400 font-medium">Contact</p>
            <p className="text-gray-600">📧 jerome@email.com</p>
            <p className="text-gray-600">📞 +44 345 123 98</p>
            <p className="text-blue-600">🐦 twitter.com/jerome</p>
            <p className="text-blue-600">🔗 linkedin.com/jerome</p>
            <p className="text-blue-600">🌐 www.jeromebell.com</p>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 p-8">
          {activeTab === 0 && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">Personal Info</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><p className="text-gray-400 text-xs">Full Name</p><p className="font-medium text-gray-800">{applicant.name}</p></div>
                  <div><p className="text-gray-400 text-xs">Gender</p><p className="font-medium text-gray-800">Male</p></div>
                  <div><p className="text-gray-400 text-xs">Date of Birth</p><p className="font-medium text-gray-800">March 23, 1993</p></div>
                  <div><p className="text-gray-400 text-xs">Language</p><p className="font-medium text-gray-800">English, French, German</p></div>
                  <div className="col-span-2"><p className="text-gray-400 text-xs">Address</p><p className="font-medium text-gray-800">497 Washington Ave, Manchester, Kentucky 39495</p></div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">Professional Info</h3>
                <p className="text-sm text-gray-600 leading-relaxed">I'm a product designer — Currently working remotely at Twitter from Manchester, United Kingdom. I'm passionate about designing digital products that have a positive impact on the world. For the past 15 years, I've specialized in interface design, experience design as well as working in user research and product strategy for product agencies, big tech companies and startups.</p>
                <div className="mt-4">
                  <p className="text-xs text-gray-400 mb-2">Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {['Project Management', 'Copywriting', 'Social Media Marketing', 'Copy Editing'].map(s => (
                      <span key={s} className="text-xs bg-orange-50 text-orange-600 border border-orange-200 rounded px-2 py-0.5">{s}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 1 && (
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">Resume</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Experience</h4>
                  {[
                    { role: 'Product Designer', company: 'Twitter', period: 'Jun 2019 - Present' },
                    { role: 'Growth Marketing Designer', company: 'Udacity', period: 'Jun 2013 - May 2019' },
                  ].map((e, i) => (
                    <div key={i} className="flex gap-3 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">{e.company[0]}</div>
                      <div>
                        <p className="font-medium text-gray-800 text-sm">{e.role}</p>
                        <p className="text-xs text-gray-500">{e.company} · {e.period}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Education</h4>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-600 font-bold text-xs">H</div>
                    <div>
                      <p className="font-medium text-gray-800 text-sm">Harvard University</p>
                      <p className="text-xs text-gray-500">Postgraduate degree, Applied Psychology · 2010-2012</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 2 && (
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">Hiring Progress</h3>
              <div className="flex gap-2 mb-6">
                {hiringStages.map((stage, i) => (
                  <div key={stage} className={`flex-1 text-center py-2 text-xs rounded-lg font-medium ${i === 2 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>{stage}</div>
                ))}
              </div>
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-800 mb-1">Stage Info</p>
                <p className="text-xs text-gray-500">Interview Status: <span className="text-blue-600">Scheduled</span></p>
                <p className="text-xs text-gray-500 mt-1">Date: 18 July 2021</p>
                <p className="text-xs text-gray-500">Location: 2972 Westheimer Rd, Harold Office, 1517 W, Jay St, Utica, Pennsylvania 85501</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800 mb-2">Notes</p>
                <div className="space-y-2">
                  {[
                    { author: 'Maria Kelly', note: 'Please, do let me know the stage immediately. The design division details.', time: '5 July, 2021' },
                    { author: 'Maria Kelly', note: 'Please, do let me know stage of interview.', time: '5 July, 2021' },
                  ].map((n, i) => (
                    <div key={i} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-6 h-6 rounded-full bg-pink-200 flex items-center justify-center text-xs font-bold text-pink-700">MK</div>
                        <p className="text-xs font-medium text-gray-700">{n.author}</p>
                        <p className="text-xs text-gray-400 ml-auto">{n.time}</p>
                      </div>
                      <p className="text-xs text-gray-600">{n.note}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 3 && (
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">Interview Schedule</h3>
              <button className="text-blue-600 text-sm border border-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-50 mb-4">+ Add Schedule Interview</button>
              <div className="space-y-3">
                {[
                  { name: 'Kathryn Murphy', time: '10:00 AM - 11:00 AM', date: '14 July 2021' },
                  { name: 'Jenny Wilson', time: '10:00 AM - 11:00 AM', date: '14 July 2021' },
                  { name: 'Floyd Miles', time: '10:00 AM - 11:00 AM', date: '14 July 2021' },
                  { name: 'Floyd Eldridge', time: '10:00 AM - 11:00 AM', date: '14 July 2021' },
                ].map((s, i) => (
                  <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center text-xs font-bold text-blue-700">{s.name[0]}</div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{s.name}</p>
                        <p className="text-xs text-gray-400">{s.date} · {s.time}</p>
                      </div>
                    </div>
                    <button className="text-blue-600 text-xs border border-blue-600 px-2 py-1 rounded hover:bg-blue-50">Add Feedback</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
