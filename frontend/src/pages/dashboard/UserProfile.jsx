import { useParams, useNavigate } from 'react-router-dom';
import { messages, recruiterProfiles, companies } from '../../data/mockdata';
import DashTopBar from '../../components/DashTopBar';

export default function UserProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const user = messages.find(msg => msg.id === parseInt(userId));
  const profile = recruiterProfiles[parseInt(userId)];

  if (!user) {
    return (
      <div className="flex-1 flex flex-col h-full bg-gray-50">
        <DashTopBar title="Profile" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <p className="text-lg font-medium">User not found</p>
            <button onClick={() => navigate('/dashboard/messages')} className="mt-4 text-blue-600 hover:underline">
              Back to Messages
            </button>
          </div>
        </div>
      </div>
    );
  }

  const company = profile?.companyId ? companies.find(c => c.id === profile.companyId) : null;
  const recruiterEmail = `${user.name.toLowerCase().replace(' ', '.')}@${user.company.toLowerCase()}.com`;

  const handleSendEmail = () => {
    const subject = encodeURIComponent(`Reaching out from JobHuntly`);
    const body = encodeURIComponent(`Hi ${user.name.split(' ')[0]},\n\nI came across your profile on JobHuntly and wanted to reach out.\n\nBest regards`);
    window.open(`https://mail.google.com/mail/?view=cm&to=${recruiterEmail}&su=${subject}&body=${body}`, '_blank');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50">
      <DashTopBar title="Recruiter Profile" />

      <div className="overflow-y-auto flex-1 px-8 py-6">
        <div className="max-w-2xl mx-auto space-y-5">

          {/* Back button */}
          <button
            onClick={() => navigate(`/dashboard/messages?user=${user.id}`)}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition mb-1"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back to Messages
          </button>

          {/* Header */}
          <div className="bg-white rounded-xl p-8 border border-gray-200">
            <div className="flex items-start gap-6">
              <div className={`w-20 h-20 rounded-full ${user.avatarColor} flex items-center justify-center text-white text-2xl font-bold flex-shrink-0`}>
                {user.avatar}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                <p className="text-gray-500 mt-0.5">{profile?.title || user.role.split(' at ')[0]}</p>
                {profile?.location && (
                  <p className="text-sm text-gray-400 mt-1 flex items-center gap-1">
                    <span>📍</span> {profile.location}
                  </p>
                )}
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={handleSendEmail}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition flex items-center gap-2"
                  >
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                    Send Email
                  </button>
                  <button
                    onClick={() => navigate(`/dashboard/messages?user=${user.id}`)}
                    className="border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition"
                  >
                    Message
                  </button>
                  {company && (
                    <button
                      onClick={() => navigate(`/dashboard/companies/${company.id}`)}
                      className="border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition"
                    >
                      View Company
                    </button>
                  )}
                </div>
              </div>
              {/* Company badge */}
              {company && (
                <div className={`w-12 h-12 rounded-lg ${company.color} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                  {company.logo}
                </div>
              )}
            </div>
          </div>

          {/* About */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h2 className="font-semibold text-gray-900 mb-4">About</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 font-medium">Position</p>
                <p className="text-gray-900">{profile?.title || user.role.split(' at ')[0]}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Company</p>
                <p className="text-gray-900">{user.company}</p>
              </div>
              {profile?.location && (
                <div>
                  <p className="text-sm text-gray-500 font-medium">Location</p>
                  <p className="text-gray-900">{profile.location}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500 font-medium">Bio</p>
                <p className="text-gray-700 leading-relaxed">{profile?.bio || 'Experienced professional dedicated to connecting great talent with great opportunities.'}</p>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h2 className="font-semibold text-gray-900 mb-4">Skills & Expertise</h2>
            <div className="flex flex-wrap gap-2">
              {(profile?.skills || ['Communication', 'Leadership', 'Recruitment', 'Strategy']).map(skill => (
                <span key={skill} className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Experience */}
          {profile?.experience && (
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h2 className="font-semibold text-gray-900 mb-4">Experience</h2>
              <div className="space-y-4">
                {profile.experience.map((exp, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-2 h-2 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">{exp.role}</p>
                      <p className="text-sm text-blue-600">{exp.company} · {exp.period}</p>
                      <p className="text-sm text-gray-500 mt-1">{exp.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Open Roles */}
          {profile?.openRoles && (
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h2 className="font-semibold text-gray-900 mb-4">Currently Hiring For</h2>
              <div className="flex flex-wrap gap-2">
                {profile.openRoles.map(role => (
                  <span key={role} className="bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-full text-sm">
                    {role}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Contact */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h2 className="font-semibold text-gray-900 mb-4">Contact Information</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-gray-400">📧</span>
                <button
                  onClick={handleSendEmail}
                  className="text-blue-600 hover:underline text-sm"
                >
                  {recruiterEmail}
                </button>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-gray-400">🏢</span>
                <span className="text-gray-700">{user.company}</span>
              </div>
              {profile?.location && (
                <div className="flex items-center gap-3">
                  <span className="text-gray-400">📍</span>
                  <span className="text-gray-700">{profile.location}</span>
                </div>
              )}
              {profile?.linkedin && (
                <div className="flex items-center gap-3">
                  <span className="text-gray-400">💼</span>
                  <span className="text-blue-600 text-sm">{profile.linkedin}</span>
                </div>
              )}
              {profile?.twitter && (
                <div className="flex items-center gap-3">
                  <span className="text-gray-400">🐦</span>
                  <span className="text-blue-600 text-sm">{profile.twitter}</span>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
