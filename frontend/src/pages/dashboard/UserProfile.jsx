import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { companies, messages, recruiterProfiles } from '../../data/mockData';
import DashTopBar from '../../components/DashTopBar';
import apiService from '../../services/api';

const COLOR_POOL = [
  'bg-orange-400',
  'bg-blue-500',
  'bg-green-500',
  'bg-yellow-500',
  'bg-purple-500',
  'bg-red-500',
];

function getInitials(name) {
  return (name || 'U')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function getColorClass(seed) {
  const index = Math.abs(Number(seed) || 0) % COLOR_POOL.length;
  return COLOR_POOL[index];
}

function buildWebsiteUrl(website) {
  if (!website) return '';
  return /^https?:\/\//i.test(website) ? website : `https://${website}`;
}

function buildMockEmail(name, company) {
  const localPart = (name || 'user').toLowerCase().trim().replace(/\s+/g, '.');
  const domainPart = (company || 'company').toLowerCase().trim().replace(/\s+/g, '');
  return `${localPart}@${domainPart}.com`;
}

export default function UserProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const numericUserId = Number(userId);

  const [networkUser, setNetworkUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    const fetchUser = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const data = await apiService.getNetworkUser(userId);
        if (!ignore) {
          setNetworkUser(data || null);
        }
      } catch (error) {
        if (!ignore) {
          setNetworkUser(null);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchUser();
    return () => {
      ignore = true;
    };
  }, [userId]);

  const mockUser = Number.isFinite(numericUserId)
    ? messages.find((msg) => msg.id === numericUserId)
    : null;
  const mockProfile = Number.isFinite(numericUserId)
    ? recruiterProfiles[numericUserId]
    : null;
  const mockCompany = mockProfile?.companyId
    ? companies.find((company) => company.id === mockProfile.companyId)
    : null;

  const profileData = useMemo(() => {
    if (networkUser) {
      const isCompany = networkUser.userType === 'COMPANY';
      const name = networkUser.fullName || `User ${userId}`;
      const websiteUrl = buildWebsiteUrl(networkUser.website);
      const title = networkUser.industry || (isCompany ? 'Hiring Team' : 'Job Seeker');
      const bio = networkUser.description
        || (isCompany
          ? `${name} is active on JobHuntly for hiring and networking conversations.`
          : `${name} is active on JobHuntly and open to connecting about relevant opportunities.`);
      const tags = Array.from(
        new Set(
          [
            networkUser.industry,
            networkUser.companySize,
            networkUser.location,
            isCompany ? 'Hiring' : 'Open to work',
          ].filter(Boolean),
        ),
      ).slice(0, 4);

      return {
        id: networkUser.id,
        userType: networkUser.userType || (isCompany ? 'COMPANY' : 'JOBSEEKER'),
        pageTitle: isCompany ? 'Company Profile' : 'User Profile',
        name,
        email: networkUser.email,
        title,
        location: networkUser.location,
        avatar: getInitials(name),
        avatarColor: getColorClass(networkUser.id),
        badge: getInitials(name),
        badgeColor: getColorClass((networkUser.id || 0) + 1),
        aboutItems: [
          { label: isCompany ? 'Industry' : 'Current Role', value: title },
          { label: isCompany ? 'Company' : 'Name', value: name },
          ...(networkUser.companySize
            ? [{ label: isCompany ? 'Company Size' : 'Experience Level', value: networkUser.companySize }]
            : []),
          ...(networkUser.location
            ? [{ label: 'Location', value: networkUser.location }]
            : []),
          { label: 'Bio', value: bio, multiline: true },
        ],
        tags: tags.length > 0 ? tags : [isCompany ? 'Hiring' : 'Open to work', 'Networking', 'Collaboration'],
        experience: isCompany
          ? []
          : [
              {
                role: title,
                company: 'JobHuntly Member',
                period: 'Current',
                desc: bio,
              },
            ],
        highlights: Array.from(
          new Set(
            [
              isCompany
                ? (networkUser.industry ? `Hiring in ${networkUser.industry}` : null)
                : (networkUser.industry ? `Interested in ${networkUser.industry}` : null),
              networkUser.companySize,
              !isCompany ? 'Available on JobHuntly chat' : null,
            ].filter(Boolean),
          ),
        ),
        companyPath: null,
        websiteUrl,
        contactRows: [
          { icon: '📧', value: networkUser.email, href: `mailto:${networkUser.email}` },
          ...(networkUser.location ? [{ icon: '📍', value: networkUser.location }] : []),
          ...(websiteUrl ? [{ icon: '🌐', value: websiteUrl, href: websiteUrl }] : []),
          ...(networkUser.industry ? [{ icon: '🏢', value: networkUser.industry }] : []),
          ...(networkUser.companySize ? [{ icon: '👥', value: networkUser.companySize }] : []),
        ],
      };
    }

    if (!mockUser) {
      return null;
    }

    const recruiterEmail = buildMockEmail(mockUser.name, mockUser.company);
    const title = mockProfile?.title || mockUser.role.split(' at ')[0];

    return {
      id: mockUser.id,
      userType: 'COMPANY',
      pageTitle: 'Recruiter Profile',
      name: mockUser.name,
      email: recruiterEmail,
      title,
      location: mockProfile?.location,
      avatar: mockUser.avatar,
      avatarColor: mockUser.avatarColor,
      badge: mockCompany?.logo || getInitials(mockUser.company),
      badgeColor: mockCompany?.color || getColorClass(mockUser.id + 1),
      aboutItems: [
        { label: 'Position', value: title },
        { label: 'Company', value: mockUser.company },
        ...(mockProfile?.location
          ? [{ label: 'Location', value: mockProfile.location }]
          : []),
        {
          label: 'Bio',
          value: mockProfile?.bio
            || 'Experienced professional dedicated to connecting great talent with great opportunities.',
          multiline: true,
        },
      ],
      tags: mockProfile?.skills || ['Communication', 'Leadership', 'Recruitment', 'Strategy'],
      experience: mockProfile?.experience || [],
      highlights: mockProfile?.openRoles || [],
      companyPath: mockCompany ? `/dashboard/companies/${mockCompany.id}` : null,
      websiteUrl: '',
      contactRows: [
        { icon: '📧', value: recruiterEmail, href: `mailto:${recruiterEmail}` },
        { icon: '🏢', value: mockUser.company },
        ...(mockProfile?.location ? [{ icon: '📍', value: mockProfile.location }] : []),
        ...(mockProfile?.linkedin ? [{ icon: '💼', value: mockProfile.linkedin }] : []),
        ...(mockProfile?.twitter ? [{ icon: '🐦', value: mockProfile.twitter }] : []),
      ],
    };
  }, [mockCompany, mockProfile, mockUser, networkUser, userId]);

  const openMessages = () => {
    if (!profileData) return;

    const params = new URLSearchParams({
      user: String(profileData.id),
      name: profileData.name,
      email: profileData.email || '',
      type: profileData.userType || 'COMPANY',
    });
    navigate(`/dashboard/messages?${params.toString()}`);
  };

  const handleSendEmail = () => {
    if (!profileData?.email) return;

    const firstName = profileData.name?.split(' ')[0] || 'there';
    const subject = encodeURIComponent('Reaching out from JobHuntly');
    const body = encodeURIComponent(
      `Hi ${firstName},\n\nI came across your profile on JobHuntly and wanted to reach out.\n\nBest regards`,
    );
    window.open(
      `https://mail.google.com/mail/?view=cm&to=${profileData.email}&su=${subject}&body=${body}`,
      '_blank',
    );
  };

  if (loading && !profileData) {
    return (
      <div className="flex-1 flex flex-col h-full bg-gray-50">
        <DashTopBar title="Profile" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <p className="text-lg font-medium">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="flex-1 flex flex-col h-full bg-gray-50">
        <DashTopBar title="Profile" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <p className="text-lg font-medium">User not found</p>
            <button
              onClick={() => navigate('/dashboard/messages')}
              className="mt-4 text-blue-600 hover:underline"
            >
              Back to Messages
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50">
      <DashTopBar title={profileData.pageTitle} />

      <div className="overflow-y-auto flex-1 px-8 py-6">
        <div className="max-w-2xl mx-auto space-y-5">
          <button
            onClick={openMessages}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition mb-1"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to Messages
          </button>

          <div className="bg-white rounded-xl p-8 border border-gray-200">
            <div className="flex items-start gap-6">
              <div className={`w-20 h-20 rounded-full ${profileData.avatarColor} flex items-center justify-center text-white text-2xl font-bold flex-shrink-0`}>
                {profileData.avatar}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">{profileData.name}</h1>
                <p className="text-gray-500 mt-0.5">{profileData.title}</p>
                {profileData.location && (
                  <p className="text-sm text-gray-400 mt-1 flex items-center gap-1">
                    <span>📍</span> {profileData.location}
                  </p>
                )}
                <div className="flex gap-3 mt-4 flex-wrap">
                  <button
                    onClick={handleSendEmail}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition flex items-center gap-2"
                  >
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                    Send Email
                  </button>
                  <button
                    onClick={openMessages}
                    className="border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition"
                  >
                    Message
                  </button>
                  {profileData.companyPath && (
                    <button
                      onClick={() => navigate(profileData.companyPath)}
                      className="border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition"
                    >
                      View Company
                    </button>
                  )}
                  {!profileData.companyPath && profileData.websiteUrl && (
                    <button
                      onClick={() => window.open(profileData.websiteUrl, '_blank')}
                      className="border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition"
                    >
                      Visit Website
                    </button>
                  )}
                </div>
              </div>
              <div className={`w-12 h-12 rounded-lg ${profileData.badgeColor} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                {profileData.badge}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h2 className="font-semibold text-gray-900 mb-4">About</h2>
            <div className="space-y-4">
              {profileData.aboutItems.map((item) => (
                <div key={item.label}>
                  <p className="text-sm text-gray-500 font-medium">{item.label}</p>
                  <p className={item.multiline ? 'text-gray-700 leading-relaxed' : 'text-gray-900'}>
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h2 className="font-semibold text-gray-900 mb-4">Skills & Expertise</h2>
            <div className="flex flex-wrap gap-2">
              {profileData.tags.map((tag) => (
                <span key={tag} className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {profileData.experience.length > 0 && (
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h2 className="font-semibold text-gray-900 mb-4">Experience</h2>
              <div className="space-y-4">
                {profileData.experience.map((exp, index) => (
                  <div key={`${exp.role}-${exp.company}-${index}`} className="flex gap-4">
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

          {profileData.highlights.length > 0 && (
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h2 className="font-semibold text-gray-900 mb-4">
                {networkUser?.userType === 'COMPANY' ? 'Currently Hiring For' : 'Profile Highlights'}
              </h2>
              <div className="flex flex-wrap gap-2">
                {profileData.highlights.map((item) => (
                  <span key={item} className="bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-full text-sm">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h2 className="font-semibold text-gray-900 mb-4">Contact Information</h2>
            <div className="space-y-3">
              {profileData.contactRows.map((row) => (
                <div key={`${row.icon}-${row.value}`} className="flex items-center gap-3">
                  <span className="text-gray-400">{row.icon}</span>
                  {row.href ? (
                    <a
                      href={row.href}
                      target={row.href.startsWith('http') ? '_blank' : undefined}
                      rel={row.href.startsWith('http') ? 'noreferrer' : undefined}
                      className="text-blue-600 hover:underline text-sm break-all"
                    >
                      {row.value}
                    </a>
                  ) : (
                    <span className="text-gray-700 break-all">{row.value}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
