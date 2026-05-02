import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CompanyTopBar from '../../components/CompanyTopBar';
import apiService from '../../services/api';

const SEEKER_DATA = {
  1: { title: 'UI/UX Designer', location: 'Paris, France', bio: 'Passionate designer with 5+ years creating intuitive digital experiences. Skilled in Figma, Adobe XD, and user research.', skills: ['Figma', 'Adobe XD', 'User Research', 'Prototyping', 'CSS'], experience: [{ role: 'Senior UI Designer', company: 'Dribbble', period: '2021 - Present', desc: 'Leading design for core product features.' }, { role: 'UI Designer', company: 'Behance', period: '2019 - 2021', desc: 'Designed marketing and product pages.' }], education: 'B.Des, Graphic Design - Paris School of Art, 2018', email: 'jan.mayer@email.com' },
  2: { title: 'HR Manager', location: 'Salt Lake City, USA', bio: 'HR professional with 8 years building inclusive teams and streamlining hiring processes across fintech companies.', skills: ['HR Management', 'Onboarding', 'Compliance', 'Recruitment'], experience: [{ role: 'HR Manager', company: 'Divvy', period: '2019 - Present', desc: 'Overseeing HR operations for 200+ employees.' }], education: 'MBA, Human Resources - University of Utah, 2016', email: 'joe.bartmann@email.com' },
  3: { title: 'Technical Recruiter', location: 'San Francisco, USA', bio: 'Technical recruiter bridging engineering teams and top-tier candidates. Background in software engineering.', skills: ['Technical Sourcing', 'Engineering Hiring', 'Pipeline Management'], experience: [{ role: 'Technical Recruiter', company: 'Stripe', period: '2021 - Present', desc: 'Hiring engineers across backend and frontend.' }], education: 'B.Sc, Computer Science - Stanford, 2017', email: 'ally.wales@email.com' },
  4: { title: 'Product Manager', location: 'New York, USA', bio: 'Product and design manager with a keen eye for creative talent. Building world-class product teams.', skills: ['Product Strategy', 'Roadmapping', 'Agile', 'Design Thinking'], experience: [{ role: 'Product Manager', company: 'Coinbase', period: '2020 - Present', desc: 'Leading product across multiple verticals.' }], education: 'MBA, Product Management - NYU Stern, 2018', email: 'james.gardner@email.com' },
  5: { title: 'Brand Designer', location: 'San Francisco, USA', bio: 'Brand designer passionate about candidate experience and employer branding. Helping companies attract world-class talent.', skills: ['Brand Identity', 'Illustration', 'Typography', 'Figma'], experience: [{ role: 'Brand Designer', company: 'Dropbox', period: '2021 - Present', desc: 'Driving brand consistency across all touchpoints.' }], education: 'B.FA, Graphic Design - RISD, 2019', email: 'allison.geidt@email.com' },
  6: { title: 'Frontend Developer', location: 'Hamburg, Germany', bio: 'Engineering leader passionate about infrastructure and open source. Looking for impactful frontend roles.', skills: ['React', 'TypeScript', 'Node.js', 'GraphQL', 'AWS'], experience: [{ role: 'Senior Frontend Dev', company: 'Terraform', period: '2019 - Present', desc: 'Leading frontend architecture and code reviews.' }], education: 'B.Sc, Software Engineering - TU Hamburg, 2016', email: 'ruben.culhane@email.com' },
  7: { title: 'Marketing Specialist', location: 'Madrid, Spain', bio: 'Growth marketer specializing in email campaigns and EMEA market expansion. Data-driven approach to marketing.', skills: ['Email Marketing', 'SEO', 'Google Analytics', 'Copywriting'], experience: [{ role: 'Marketing Specialist', company: 'Revolut', period: '2020 - Present', desc: 'Scaling marketing across European markets.' }], education: 'B.A, Marketing - Universidad Complutense, 2018', email: 'lydia.diaz@email.com' },
  8: { title: 'Visual Designer', location: 'Madrid, Spain', bio: 'Visual designer with a passion for design-driven engineering. Strong portfolio across brand and digital.', skills: ['Visual Design', 'Motion Graphics', 'After Effects', 'Sketch'], experience: [{ role: 'Visual Designer', company: 'Packer', period: '2017 - Present', desc: 'Designed visual identity and marketing materials.' }], education: 'B.Des, Visual Communication - ESAD, 2016', email: 'james.dokidis@email.com' },
  9: { title: 'Data Analyst', location: 'Berlin, Germany', bio: 'Data analyst focused on customer-facing analytics and operations. Passionate about turning data into stories.', skills: ['Python', 'SQL', 'Tableau', 'Data Visualization', 'Excel'], experience: [{ role: 'Data Analyst', company: 'Twilio', period: '2021 - Present', desc: 'Building dashboards and analytics pipelines.' }], education: 'B.Sc, Statistics - Humboldt University, 2019', email: 'angelina.swann@email.com' },
};

const CONTACTS = {
  1: { avatar: 'JM', color: 'bg-orange-400' },
  2: { avatar: 'JB', color: 'bg-blue-500' },
  3: { avatar: 'AW', color: 'bg-green-500' },
  4: { avatar: 'JG', color: 'bg-yellow-500' },
  5: { avatar: 'AG', color: 'bg-blue-600' },
  6: { avatar: 'RC', color: 'bg-purple-500' },
  7: { avatar: 'LD', color: 'bg-red-500' },
  8: { avatar: 'JD', color: 'bg-gray-700' },
  9: { avatar: 'AS', color: 'bg-pink-500' },
};

const NAMES = {
  1: 'Jan Mayer',
  2: 'Joe Bartmann',
  3: 'Ally Wales',
  4: 'James Gardner',
  5: 'Allison Geidt',
  6: 'Ruben Culhane',
  7: 'Lydia Diaz',
  8: 'James Dokidis',
  9: 'Angelina Swann',
};

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

export default function SeekerProfile() {
  const { seekerId } = useParams();
  const navigate = useNavigate();
  const numericSeekerId = Number(seekerId);

  const [networkUser, setNetworkUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    const fetchUser = async () => {
      if (!seekerId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const data = await apiService.getNetworkUser(seekerId);
        if (!ignore) {
          setNetworkUser(data?.userType === 'JOBSEEKER' ? data : null);
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
  }, [seekerId]);

  const profileData = useMemo(() => {
    if (networkUser) {
      const name = networkUser.fullName || `User ${seekerId}`;
      const title = networkUser.title || networkUser.industry || 'Job Seeker';
      const bio = networkUser.description
        || `${name} is active on JobHuntly and open to connecting about relevant opportunities.`;
      const websiteUrl = buildWebsiteUrl(networkUser.website);
      const skills = Array.isArray(networkUser.skills) && networkUser.skills.length > 0
        ? networkUser.skills
        : Array.from(
            new Set(
              [
                networkUser.industry,
                networkUser.location?.split(',')[0]?.trim(),
                'Communication',
                'Collaboration',
              ].filter(Boolean),
            ),
          ).slice(0, 5);
      const experiences = Array.isArray(networkUser.experiences) && networkUser.experiences.length > 0
        ? networkUser.experiences.map((exp) => ({
            role: exp.role || title,
            company: exp.company || 'JobHuntly Member',
            period: [exp.start, exp.end].filter(Boolean).join(' - ') || exp.duration || 'Current',
            desc: exp.desc || bio,
          }))
        : [
            {
              role: title,
              company: networkUser.company || 'JobHuntly Member',
              period: 'Current',
              desc: bio,
            },
          ];
      const educations = Array.isArray(networkUser.educations) ? networkUser.educations : [];

      return {
        pageTitle: 'Candidate Profile',
        name,
        title,
        location: networkUser.location,
        bio,
        skills: skills.length > 0 ? skills : ['Communication', 'Collaboration'],
        experience: experiences,
        educationEntries: educations,
        educationText: educations.length === 0 ? 'Education details are not available on this profile yet.' : '',
        email: networkUser.email,
        avatar: getInitials(name),
        avatarColor: getColorClass(networkUser.id),
        profilePhotoUrl: networkUser.profilePhotoUrl ? apiService.resolveFileUrl(networkUser.profilePhotoUrl) : '',
        websiteUrl,
        contactRows: [
          { icon: '📧', value: networkUser.email, href: `mailto:${networkUser.email}` },
          ...(networkUser.location ? [{ icon: '📍', value: networkUser.location }] : []),
          ...(networkUser.phone ? [{ icon: '📞', value: networkUser.phone }] : []),
          ...(websiteUrl ? [{ icon: '🌐', value: websiteUrl, href: websiteUrl }] : []),
          ...(networkUser.instagram ? [{ icon: '📸', value: networkUser.instagram, href: buildWebsiteUrl(networkUser.instagram) }] : []),
          ...(networkUser.twitter ? [{ icon: '🐦', value: networkUser.twitter, href: buildWebsiteUrl(networkUser.twitter) }] : []),
        ],
      };
    }

    const data = Number.isFinite(numericSeekerId) ? SEEKER_DATA[numericSeekerId] : null;
    const contact = Number.isFinite(numericSeekerId) ? CONTACTS[numericSeekerId] : null;
    const name = Number.isFinite(numericSeekerId) ? NAMES[numericSeekerId] : null;

    if (!data || !contact || !name) {
      return null;
    }

    return {
      pageTitle: 'Candidate Profile',
      name,
      title: data.title,
      location: data.location,
      bio: data.bio,
      skills: data.skills,
      experience: data.experience,
      educationEntries: [],
      educationText: data.education,
      email: data.email,
      avatar: contact.avatar,
      avatarColor: contact.color,
      profilePhotoUrl: '',
      websiteUrl: '',
      contactRows: [
        { icon: '📧', value: data.email, href: `mailto:${data.email}` },
      ],
    };
  }, [networkUser, numericSeekerId, seekerId]);

  const openMessages = () => {
    if (!profileData) return;

    const params = new URLSearchParams({
      user: String(networkUser?.id || numericSeekerId),
      name: profileData.name,
      email: profileData.email || '',
      type: 'JOBSEEKER',
    });

    navigate(`/company/messages?${params.toString()}`);
  };

  if (loading && !profileData) {
    return (
      <div className="flex-1 flex flex-col h-full bg-gray-50">
        <CompanyTopBar title="" />
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
        <CompanyTopBar title="" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <p className="text-lg font-medium">Profile not found</p>
            <button
              onClick={() => navigate('/company/messages')}
              className="mt-3 text-blue-600 hover:underline text-sm"
            >
              ← Back to Messages
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50 min-h-screen">
      <CompanyTopBar title="" />
      <div className="overflow-y-auto flex-1 px-8 py-6" style={{ marginTop: '60px' }}>
        <div className="max-w-2xl mx-auto space-y-5">
          <button
            onClick={openMessages}
            className="flex items-center gap-1.5 text-gray-500 hover:text-blue-600 text-sm font-medium transition mb-2"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to Messages
          </button>

          <div className="bg-white rounded-xl p-8 border border-gray-200">
            <div className="flex items-start gap-6">
              <div className={`w-20 h-20 rounded-full ${profileData.avatarColor} flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 overflow-hidden`}>
                {profileData.profilePhotoUrl ? (
                  <a
                    href={profileData.profilePhotoUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Open ${profileData.name} profile photo`}
                    className="block w-full h-full"
                  >
                    <img src={profileData.profilePhotoUrl} alt={`${profileData.name} profile photo`} className="w-full h-full object-cover" />
                  </a>
                ) : (
                  profileData.avatar
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">{profileData.name}</h1>
                <p className="text-gray-500 mt-0.5">{profileData.title}</p>
                {profileData.location && (
                  <p className="text-sm text-gray-400 mt-1 flex items-center gap-1">📍 {profileData.location}</p>
                )}
                <div className="flex gap-3 mt-4 flex-wrap">
                  <button
                    onClick={openMessages}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition flex items-center gap-2"
                  >
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                    </svg>
                    Send Message
                  </button>
                  <a
                    href={`mailto:${profileData.email}`}
                    className="border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition"
                  >
                    Send Email
                  </a>
                  {profileData.websiteUrl && (
                    <a
                      href={profileData.websiteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition"
                    >
                      Visit Website
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h2 className="font-semibold text-gray-900 mb-4">About</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 font-medium">Current Role</p>
                <p className="text-gray-900">{profileData.title}</p>
              </div>
              {profileData.location && (
                <div>
                  <p className="text-sm text-gray-500 font-medium">Location</p>
                  <p className="text-gray-900">{profileData.location}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500 font-medium">Bio</p>
                <p className="text-gray-700 leading-relaxed">{profileData.bio}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h2 className="font-semibold text-gray-900 mb-4">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {profileData.skills.map((skill) => (
                <span key={skill} className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm">
                  {skill}
                </span>
              ))}
            </div>
          </div>

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

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h2 className="font-semibold text-gray-900 mb-3">Education</h2>
            {profileData.educationEntries.length > 0 ? (
              <div className="space-y-4">
                {profileData.educationEntries.map((edu, index) => (
                  <div key={`${edu.school}-${edu.degree}-${index}`}>
                    <p className="font-medium text-gray-900">{edu.school || 'Institution'}</p>
                    <p className="text-sm text-blue-600">{edu.degree || 'Degree / Certificate'}</p>
                    {(edu.start || edu.end) && (
                      <p className="text-sm text-gray-500">{[edu.start, edu.end].filter(Boolean).join(' - ')}</p>
                    )}
                    {edu.desc && <p className="text-sm text-gray-700 mt-1">{edu.desc}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-700">{profileData.educationText}</p>
            )}
          </div>

          {profileData.websiteUrl && (
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h2 className="font-semibold text-gray-900 mb-3">Portfolio / Website</h2>
              <a
                href={profileData.websiteUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-blue-600 hover:underline break-all"
              >
                {profileData.websiteUrl}
              </a>
            </div>
          )}

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h2 className="font-semibold text-gray-900 mb-4">Contact</h2>
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
