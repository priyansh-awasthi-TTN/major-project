import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashTopBar from '../../components/DashTopBar';
import apiService from '../../services/api';
import {
  applications as mockApplications,
  companies as mockCompanies,
  jobs as mockJobs,
  recruiterProfiles as mockRecruiterProfiles,
} from '../../data/mockData';

function EditIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M13.586 3.586a2 2 0 112.828 2.828L7.5 15.414 4 16l.586-3.5 9-8.914z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M3 17h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function EditBtn({ onClick, ariaLabel = 'Edit section' }) {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      className="w-8 h-8 flex items-center justify-center rounded-lg text-blue-600 hover:bg-blue-50 border border-blue-100 transition"
    >
      <EditIcon />
    </button>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">
            ×
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

function ConfirmDialog({ title, message, onConfirm, onCancel, confirmText = "Discard", cancelText = "No thanks" }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50" onClick={onCancel}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 text-xl leading-none">
            ×
          </button>
        </div>
        <p className="text-sm text-gray-600 mb-6 leading-relaxed">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="border border-blue-600 text-blue-600 text-sm font-medium px-5 py-2 rounded-full hover:bg-blue-50 transition"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="bg-blue-600 text-white text-sm font-semibold px-5 py-2 rounded-full hover:bg-blue-700 transition"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

function SkillsDetailModal({ experience, allExperiences, allEducations, topSkills, profileName, onClose }) {
  const [expandedSkills, setExpandedSkills] = useState({});

  const toggleSkill = (skill) => {
    setExpandedSkills(prev => ({ ...prev, [skill]: !prev[skill] }));
  };

  // Aggregate skills - either from clicked experience or from top skills
  const aggregateSkills = () => {
    const skillMap = {};
    
    // If this is top skills view, use all profile skills
    const skillsToShow = topSkills || (experience?.skills || []);
    
    skillsToShow.forEach(skill => {
      if (!skillMap[skill]) {
        skillMap[skill] = {
          experiences: [],
          educations: []
        };
      }
    });
    
    // Find all occurrences of these skills across all experiences
    allExperiences.forEach(exp => {
      if (exp.skills && exp.skills.length > 0) {
        exp.skills.forEach(skill => {
          if (skillMap[skill]) {
            skillMap[skill].experiences.push({
              id: exp.id,
              role: exp.role,
              company: exp.company,
              logo: exp.logo,
              logoBg: exp.logoBg,
              logoUrl: exp.logoUrl,
              type: 'experience'
            });
          }
        });
      }
    });
    
    // Find all occurrences of these skills across all educations
    allEducations.forEach(edu => {
      if (edu.skills && edu.skills.length > 0) {
        edu.skills.forEach(skill => {
          if (skillMap[skill]) {
            skillMap[skill].educations.push({
              id: edu.id,
              school: edu.school,
              degree: edu.degree,
              logo: edu.logo,
              logoBg: edu.logoBg,
              type: 'education'
            });
          }
        });
      }
    });
    
    return skillMap;
  };

  const skillsData = aggregateSkills();
  const skillsList = Object.keys(skillsData);
  
  // Separate skills into those with occurrences and standalone
  const skillsWithOccurrences = skillsList.filter(skill => {
    const occurrences = skillsData[skill];
    return occurrences.experiences.length > 0 || occurrences.educations.length > 0;
  });
  
  const standaloneSkills = skillsList.filter(skill => {
    const occurrences = skillsData[skill];
    return occurrences.experiences.length === 0 && occurrences.educations.length === 0;
  });

  const isTopSkillsView = !!topSkills;
  const title = isTopSkillsView ? `${profileName}'s top skills` : 'Skills';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 pr-8">
            {title}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none flex-shrink-0">
            ×
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {skillsWithOccurrences.length > 0 && (
            <div className="space-y-3 mb-6">
              {skillsWithOccurrences.map((skill, index) => {
                const occurrences = skillsData[skill];
                const totalCount = occurrences.experiences.length + occurrences.educations.length;
                
                return (
                  <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleSkill(skill)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition"
                    >
                      <div className="flex-1">
                        <span className="font-semibold text-gray-900 text-base">{skill}</span>
                      </div>
                      <svg
                        className={`w-5 h-5 text-gray-600 transition-transform flex-shrink-0 ${expandedSkills[skill] ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {expandedSkills[skill] && (
                      <div className="px-4 pb-4 space-y-2 bg-white">
                        {/* Show all experiences where this skill appears */}
                        {occurrences.experiences.map((exp, idx) => (
                          <div key={`exp-${idx}`} className="flex items-center gap-3 py-2">
                            <div className="flex-shrink-0">
                              {exp.logoUrl ? (
                                <img 
                                  src={exp.logoUrl} 
                                  alt={exp.company}
                                  className="w-6 h-6 rounded object-contain"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                  }}
                                />
                              ) : null}
                              <div className={`w-6 h-6 rounded ${exp.logoBg} flex items-center justify-center text-xs ${exp.logoUrl ? 'hidden' : ''}`}>
                                {exp.logo}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-900">{exp.role || exp.company}</p>
                            </div>
                          </div>
                        ))}
                        
                        {/* Show all educations where this skill appears */}
                        {occurrences.educations.map((edu, idx) => (
                          <div key={`edu-${idx}`} className="flex items-center gap-3 py-2">
                            <div className={`w-6 h-6 rounded ${edu.logoBg} flex items-center justify-center text-xs flex-shrink-0`}>
                              {edu.logo}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-900">{edu.degree || edu.school}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          
          {/* Standalone skills section */}
          {standaloneSkills.length > 0 && (
            <div>
              {skillsWithOccurrences.length > 0 && (
                <div className="border-t border-gray-200 pt-6 mb-4">
                  <h3 className="font-semibold text-gray-900 text-base mb-3">Other skills</h3>
                </div>
              )}
              <div className="space-y-2">
                {standaloneSkills.map((skill, index) => (
                  <div key={index} className="py-3 border-b border-gray-100 last:border-0">
                    <span className="text-gray-900 text-base">{skill}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {skillsList.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-8">No skills added.</p>
          )}
          
          {isTopSkillsView && skillsList.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="font-semibold text-gray-900 text-base mb-2">Learn more about these skills</h3>
              <p className="text-sm text-gray-600 mb-4">Discover jobs, people, learning content and conversations about these skills</p>
              <div className="space-y-3">
                {skillsList.slice(0, 4).map((skill, index) => (
                  <button
                    key={index}
                    className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                  >
                    <span className="text-gray-900 text-sm font-medium">{skill}</span>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle cx="11" cy="11" r="8" strokeWidth={2} />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', rows, readOnly = false }) {
  const sharedClassName = `w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 ${
    readOnly ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''
  }`;

  return (
    <div className="mb-4">
      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">{label}</label>
      {rows ? (
        <textarea
          rows={rows}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          readOnly={readOnly}
          className={`${sharedClassName} resize-none`}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          readOnly={readOnly}
          className={sharedClassName}
        />
      )}
    </div>
  );
}

function normalizeExternalUrl(value) {
  if (!value) return '';
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

function getInitials(value) {
  return (value || 'U')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function buildSortedOptions(values) {
  return [...new Set(
    values
      .map((value) => (typeof value === 'string' ? value.trim() : ''))
      .filter(Boolean),
  )].sort((left, right) => left.localeCompare(right));
}

const GENERIC_EXPERIENCE_TITLES = [
  'Software Engineer',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Product Manager',
  'Project Manager',
  'Business Analyst',
  'Data Analyst',
  'Marketing Specialist',
  'Sales Executive',
  'Customer Success Manager',
  'HR Manager',
  'Operations Manager',
  'QA Engineer',
  'DevOps Engineer',
  'UI/UX Designer',
  'Graphic Designer',
  'Intern',
];

const EXPERIENCE_TITLE_OPTIONS = buildSortedOptions([
  ...GENERIC_EXPERIENCE_TITLES,
  ...mockJobs.map((job) => job.title),
  ...mockApplications.map((application) => application.title),
  ...Object.values(mockRecruiterProfiles).flatMap((profile) => [
    profile.title,
    ...(profile.openRoles || []),
    ...((profile.experience || []).map((experience) => experience.role)),
  ]),
]);

const EXPERIENCE_COMPANY_OPTIONS = buildSortedOptions([
  ...mockCompanies.map((company) => company.name),
  ...mockJobs.map((job) => job.company),
  ...mockApplications.map((application) => application.company),
  ...Object.values(mockRecruiterProfiles).flatMap((profile) => [
    profile.company,
    ...((profile.experience || []).map((experience) => experience.company)),
  ]),
]);

const EXPERIENCE_COMPANY_METADATA = (() => {
  const metadata = new Map();

  const registerCompany = (name, logo, color) => {
    if (!name) {
      return;
    }

    const normalizedName = name.trim().toLowerCase();
    if (!normalizedName || metadata.has(normalizedName)) {
      return;
    }

    metadata.set(normalizedName, {
      logo: logo || getInitials(name),
      logoBg: color ? `${color} text-white` : 'bg-gray-100 text-gray-600',
    });
  };

  mockCompanies.forEach((company) => registerCompany(company.name, company.logo, company.color));
  mockJobs.forEach((job) => registerCompany(job.company, job.logo, job.color));
  mockApplications.forEach((application) => registerCompany(application.company, application.logo, application.color));

  return metadata;
})();

function normalizeExperiences(entries) {
  return (Array.isArray(entries) ? entries : []).map((entry, index) => ({
    id: entry?.id ?? index + 1,
    role: entry?.role || '',
    company: entry?.company || '',
    logo: entry?.logo || '💼',
    logoBg: entry?.logoBg || 'bg-gray-100 text-gray-600',
    type: entry?.type || '',
    start: entry?.start || '',
    end: entry?.end || '',
    duration: entry?.duration || '',
    location: entry?.location || '',
    desc: entry?.desc || '',
    notifyNetwork: entry?.notifyNetwork || false,
    currentlyWorking: entry?.currentlyWorking || false,
    endCurrentPosition: entry?.endCurrentPosition || false,
    startMonth: entry?.startMonth || '',
    startYear: entry?.startYear || '',
    endMonth: entry?.endMonth || '',
    endYear: entry?.endYear || '',
    locationType: entry?.locationType || '',
    headline: entry?.headline || '',
    jobSource: entry?.jobSource || '',
    skills: entry?.skills || [],
    media: entry?.media || [],
  }));
}

function normalizeEducations(entries) {
  return (Array.isArray(entries) ? entries : []).map((entry, index) => ({
    id: entry?.id ?? index + 1,
    school: entry?.school || '',
    logo: entry?.logo || '🎓',
    logoBg: entry?.logoBg || 'bg-gray-100 text-gray-600',
    degree: entry?.degree || '',
    start: entry?.start || '',
    end: entry?.end || '',
    desc: entry?.desc || '',
    notifyNetwork: entry?.notifyNetwork || false,
    fieldOfStudy: entry?.fieldOfStudy || '',
    startMonth: entry?.startMonth || '',
    startYear: entry?.startYear || '',
    endMonth: entry?.endMonth || '',
    endYear: entry?.endYear || '',
    grade: entry?.grade || '',
    activities: entry?.activities || '',
    skills: entry?.skills || [],
    media: entry?.media || [],
  }));
}

function buildEmptyState(displayName, userEmail) {
  return {
    profile: {
      name: displayName || 'User Name',
      title: '',
      company: '',
      location: '',
    },
    about: '',
    details: {
      email: userEmail || '',
      phone: '',
      languages: '',
    },
    socials: {
      instagram: '',
      twitter: '',
      website: '',
    },
    skills: [],
    experiences: [],
    educations: [],
    openToOpportunities: true,
    avatarImg: '',
    coverImg: '',
  };
}

function buildEmptyExperienceDraft() {
  return {
    role: '',
    company: '',
    type: '',
    start: '',
    end: '',
    duration: '',
    location: '',
    desc: '',
    notifyNetwork: false,
    currentlyWorking: false,
    endCurrentPosition: false,
    startMonth: '',
    startYear: '',
    endMonth: '',
    endYear: '',
    locationType: '',
    headline: '',
    jobSource: '',
    skills: [],
    media: [],
  };
}

function SectionActionButton({ onClick, children, disabled = false }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`border border-blue-600 text-blue-600 text-sm px-4 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
        disabled ? 'opacity-60 cursor-not-allowed' : 'hover:bg-blue-50'
      }`}
    >
      <EditIcon className="w-3.5 h-3.5" />
      {children}
    </button>
  );
}

export default function Profile() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const displayName = user?.fullName || 'User Name';
  const userEmail = user?.email || 'user@email.com';
  const isExperiencePage = location.pathname === '/dashboard/profile/experience';
  const routeRequestedExperienceModal = location.state?.openExperienceModal;

  const initialState = buildEmptyState(displayName, userEmail);

  const [profile, setProfile] = useState(initialState.profile);
  const [about, setAbout] = useState(initialState.about);
  const [details, setDetails] = useState(initialState.details);
  const [socials, setSocials] = useState(initialState.socials);
  const [skills, setSkills] = useState(initialState.skills);
  const [experiences, setExperiences] = useState(initialState.experiences);
  const [educations, setEducations] = useState(initialState.educations);
  const [openForOpp, setOpenForOpp] = useState(initialState.openToOpportunities);
  const [coverImg, setCoverImg] = useState(initialState.coverImg);
  const [avatarImg, setAvatarImg] = useState(initialState.avatarImg);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showAllEdu, setShowAllEdu] = useState(false);
  const [modal, setModal] = useState(null);
  const [parentModal, setParentModal] = useState(null);
  const [tmp, setTmp] = useState({});
  const [tmpSkills, setTmpSkills] = useState([]);
  const [draggedSkillIndex, setDraggedSkillIndex] = useState(null);
  const [newSkill, setNewSkill] = useState('');
  const [skillSuggestions, setSkillSuggestions] = useState([]);
  const [showSkillDropdown, setShowSkillDropdown] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [schoolSuggestions, setSchoolSuggestions] = useState([]);
  const [showSchoolDropdown, setShowSchoolDropdown] = useState(false);
  const [degreeSuggestions, setDegreeSuggestions] = useState([]);
  const [showDegreeDropdown, setShowDegreeDropdown] = useState(false);
  const [fieldOfStudySuggestions, setFieldOfStudySuggestions] = useState([]);
  const [showFieldOfStudyDropdown, setShowFieldOfStudyDropdown] = useState(false);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [initialFormState, setInitialFormState] = useState(null);
  const [skillsDetailExp, setSkillsDetailExp] = useState(null);
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);

  const coverInputRef = useRef(null);
  const avatarInputRef = useRef(null);
  const mediaInputRef = useRef(null);
  const skillInputRef = useRef(null);
  const locationInputRef = useRef(null);
  const schoolInputRef = useRef(null);
  const degreeInputRef = useRef(null);
  const fieldOfStudyInputRef = useRef(null);

  useEffect(() => {
    setAvatarLoadFailed(false);
  }, [avatarImg]);

  // Common skills list for autocomplete
  const commonSkills = [
    // Programming Languages
    'JavaScript', 'Python', 'Java', 'TypeScript', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Rust',
    'Swift', 'Kotlin', 'Scala', 'R', 'MATLAB', 'Perl', 'Objective-C', 'Dart', 'Elixir', 'Haskell',
    
    // Frontend Technologies
    'React', 'Angular', 'Vue.js', 'HTML', 'CSS', 'SASS', 'LESS', 'Tailwind CSS', 'Bootstrap',
    'Material-UI', 'jQuery', 'Next.js', 'Nuxt.js', 'Svelte', 'Redux', 'MobX', 'Webpack', 'Vite',
    
    // Backend Technologies
    'Node.js', 'Express.js', 'Django', 'Flask', 'Spring Boot', 'Spring MVC', 'ASP.NET', 'Ruby on Rails',
    'Laravel', 'FastAPI', 'NestJS', 'Koa', 'Gin', 'Echo', 'Fiber',
    
    // Databases
    'SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Cassandra', 'Oracle', 'SQL Server',
    'SQLite', 'MariaDB', 'DynamoDB', 'Elasticsearch', 'Neo4j', 'CouchDB', 'Firebase',
    
    // Cloud & DevOps
    'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Jenkins', 'GitLab CI', 'GitHub Actions',
    'CircleCI', 'Travis CI', 'Terraform', 'Ansible', 'Chef', 'Puppet', 'Vagrant', 'Heroku', 'Netlify', 'Vercel',
    
    // API & Integration
    'REST API', 'GraphQL', 'gRPC', 'WebSocket', 'SOAP', 'Microservices', 'API Gateway', 'Postman',
    
    // Version Control & Tools
    'Git', 'GitHub', 'GitLab', 'Bitbucket', 'SVN', 'Mercurial', 'JIRA', 'Confluence', 'Trello', 'Asana',
    
    // Testing
    'Jest', 'Mocha', 'Chai', 'Jasmine', 'Cypress', 'Selenium', 'Puppeteer', 'JUnit', 'TestNG',
    'PyTest', 'RSpec', 'Cucumber', 'Unit Testing', 'Integration Testing', 'E2E Testing',
    
    // Mobile Development
    'React Native', 'Flutter', 'iOS Development', 'Android Development', 'Xamarin', 'Ionic',
    'SwiftUI', 'Jetpack Compose',
    
    // Data Science & AI
    'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Keras', 'Scikit-learn',
    'Pandas', 'NumPy', 'Data Analysis', 'Data Visualization', 'Tableau', 'Power BI', 'Jupyter',
    'Natural Language Processing', 'Computer Vision', 'Neural Networks', 'AI', 'Big Data',
    
    // Design
    'UI/UX Design', 'Figma', 'Adobe XD', 'Sketch', 'Photoshop', 'Illustrator', 'InDesign',
    'Wireframing', 'Prototyping', 'User Research', 'Responsive Design', 'Design Systems',
    
    // Methodologies & Practices
    'Agile', 'Scrum', 'Kanban', 'Waterfall', 'DevOps', 'CI/CD', 'TDD', 'BDD', 'Pair Programming',
    'Code Review', 'Continuous Integration', 'Continuous Deployment',
    
    // Soft Skills & Leadership
    'Project Management', 'Leadership', 'Communication', 'Problem Solving', 'Team Collaboration',
    'Critical Thinking', 'Time Management', 'Presentation Skills', 'Negotiation', 'Mentoring',
    'Strategic Planning', 'Decision Making', 'Conflict Resolution', 'Adaptability', 'Creativity',
    'Emotional Intelligence', 'Active Listening', 'Empathy', 'Teamwork', 'Coaching',
    'Public Speaking', 'Interpersonal Skills', 'Organizational Skills', 'Multitasking', 'Attention to Detail',
    'Self-Motivation', 'Work Ethic', 'Flexibility', 'Patience', 'Resilience', 'Stress Management',
    'Collaboration', 'Delegation', 'Facilitation', 'Influencing', 'Persuasion', 'Relationship Building',
    'Networking', 'Customer Relations', 'Client Management', 'Stakeholder Management',
    
    // Business & Marketing
    'Marketing', 'Digital Marketing', 'SEO', 'SEM', 'Content Marketing', 'Social Media Marketing',
    'Email Marketing', 'Google Analytics', 'Google Ads', 'Facebook Ads', 'Content Writing',
    'Copywriting', 'Sales', 'Business Development', 'Customer Service', 'CRM', 'Salesforce',
    'Brand Management', 'Market Research', 'Competitive Analysis', 'Product Management',
    'Business Strategy', 'Financial Analysis', 'Budgeting', 'Forecasting', 'Risk Management',
    
    // Office & Productivity
    'Microsoft Office', 'Excel', 'PowerPoint', 'Word', 'Google Workspace', 'Slack', 'Microsoft Teams',
    'Notion', 'Airtable', 'Monday.com', 'Data Entry', 'Documentation', 'Report Writing',
    
    // Security
    'Cybersecurity', 'Network Security', 'Penetration Testing', 'Ethical Hacking', 'OWASP',
    'SSL/TLS', 'OAuth', 'JWT', 'Encryption', 'Firewall', 'VPN',
    
    // Blockchain & Web3
    'Blockchain', 'Ethereum', 'Solidity', 'Smart Contracts', 'Web3', 'Cryptocurrency', 'NFT',
    
    // Creative & Arts
    'Photography', 'Videography', 'Video Editing', 'Graphic Design', 'Animation', '3D Modeling',
    'Drawing', 'Painting', 'Illustration', 'Creative Writing', 'Storytelling', 'Music Production',
    'Sound Design', 'Film Making', 'Art Direction', 'Typography', 'Color Theory',
    
    // Languages
    'English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese', 'Korean', 'Arabic',
    'Portuguese', 'Italian', 'Russian', 'Hindi', 'Bengali', 'Multilingual', 'Translation',
    'Interpretation', 'Language Teaching',
    
    // Education & Training
    'Teaching', 'Curriculum Development', 'Training & Development', 'E-Learning', 'Instructional Design',
    'Educational Technology', 'Tutoring', 'Workshop Facilitation', 'Academic Writing', 'Research',
    
    // Healthcare & Wellness
    'Healthcare', 'Nursing', 'Patient Care', 'Medical Terminology', 'First Aid', 'CPR',
    'Mental Health', 'Counseling', 'Therapy', 'Nutrition', 'Fitness Training', 'Yoga',
    'Meditation', 'Wellness Coaching', 'Health Education',
    
    // Hobbies & Interests
    'Reading', 'Writing', 'Blogging', 'Podcasting', 'Gaming', 'Chess', 'Cooking', 'Baking',
    'Gardening', 'Traveling', 'Hiking', 'Camping', 'Running', 'Cycling', 'Swimming',
    'Sports', 'Basketball', 'Football', 'Soccer', 'Tennis', 'Volleyball', 'Cricket',
    'Martial Arts', 'Dance', 'Singing', 'Playing Musical Instruments', 'Guitar', 'Piano',
    'Drums', 'Volunteering', 'Community Service', 'Event Planning', 'DIY Projects',
    'Crafts', 'Knitting', 'Sewing', 'Woodworking', 'Astronomy', 'Bird Watching',
    
    // Science & Research
    'Research Methodology', 'Data Collection', 'Statistical Analysis', 'Laboratory Skills',
    'Scientific Writing', 'Experiment Design', 'Literature Review', 'Hypothesis Testing',
    
    // Legal & Compliance
    'Legal Research', 'Contract Management', 'Compliance', 'Regulatory Affairs', 'Policy Development',
    'Risk Assessment', 'Audit', 'Corporate Governance',
    
    // Other Technical Skills
    'Linux', 'Unix', 'Windows Server', 'Bash', 'Shell Scripting', 'PowerShell', 'Networking',
    'TCP/IP', 'DNS', 'Load Balancing', 'Caching', 'Message Queues', 'RabbitMQ', 'Kafka',
    'Microservices Architecture', 'System Design', 'Algorithms', 'Data Structures', 'OOP',
    'Functional Programming', 'Design Patterns', 'Clean Code', 'Refactoring'
  ];

  // Common locations list for autocomplete
  const commonLocations = [
    'New York, NY, USA', 'Los Angeles, CA, USA', 'Chicago, IL, USA', 'Houston, TX, USA',
    'San Francisco, CA, USA', 'Seattle, WA, USA', 'Boston, MA, USA', 'Austin, TX, USA',
    'London, United Kingdom', 'Paris, France', 'Berlin, Germany', 'Tokyo, Japan',
    'Singapore', 'Dubai, UAE', 'Toronto, Canada', 'Sydney, Australia', 'Mumbai, India',
    'Bangalore, India', 'Delhi, India', 'Hyderabad, India', 'Pune, India', 'Chennai, India',
    'Remote', 'Hybrid'
  ];

  // Common schools list for autocomplete
  const commonSchools = [
    // India - Top Universities
    'Indian Institute of Technology (IIT) Delhi', 'Indian Institute of Technology (IIT) Bombay',
    'Indian Institute of Technology (IIT) Madras', 'Indian Institute of Technology (IIT) Kanpur',
    'Indian Institute of Technology (IIT) Kharagpur', 'Indian Institute of Technology (IIT) Roorkee',
    'Indian Institute of Technology (IIT) Guwahati', 'Indian Institute of Science (IISc) Bangalore',
    'Jawaharlal Nehru University', 'University of Delhi', 'Banaras Hindu University',
    'Anna University', 'Jadavpur University', 'Aligarh Muslim University',
    'Birla Institute of Technology and Science (BITS) Pilani', 'Vellore Institute of Technology (VIT)',
    'Manipal Academy of Higher Education', 'SRM Institute of Science and Technology',
    'Amity University', 'Lovely Professional University', 'Symbiosis International University',
    
    // India - Management Institutes
    'Indian Institute of Management (IIM) Ahmedabad', 'Indian Institute of Management (IIM) Bangalore',
    'Indian Institute of Management (IIM) Calcutta', 'Indian Institute of Management (IIM) Lucknow',
    'Indian School of Business (ISB)', 'Xavier Labour Relations Institute (XLRI)',
    
    // USA - Top Universities
    'Harvard University', 'Stanford University', 'Massachusetts Institute of Technology (MIT)',
    'California Institute of Technology (Caltech)', 'Princeton University', 'Yale University',
    'Columbia University', 'University of Chicago', 'University of Pennsylvania',
    'Cornell University', 'Duke University', 'Northwestern University', 'Johns Hopkins University',
    'University of California, Berkeley', 'University of California, Los Angeles (UCLA)',
    'University of Michigan', 'New York University (NYU)', 'Carnegie Mellon University',
    'University of Southern California', 'University of Texas at Austin',
    
    // UK - Top Universities
    'University of Oxford', 'University of Cambridge', 'Imperial College London',
    'London School of Economics (LSE)', 'University College London (UCL)',
    'University of Edinburgh', 'King\'s College London', 'University of Manchester',
    'University of Warwick', 'University of Bristol',
    
    // Other International Universities
    'University of Toronto', 'McGill University', 'University of British Columbia',
    'National University of Singapore (NUS)', 'Nanyang Technological University (NTU)',
    'University of Melbourne', 'Australian National University', 'University of Sydney',
    'ETH Zurich', 'Technical University of Munich', 'University of Tokyo'
  ];

  // Common degrees list for autocomplete
  const commonDegrees = [
    // School Education
    '10th', '12th', 'High School Diploma', 'Secondary School Certificate',
    
    // Undergraduate Degrees
    'Bachelor of Technology (B.Tech)', 'Bachelor of Engineering (B.E.)', 'Bachelor of Science (B.Sc)',
    'Bachelor of Arts (B.A)', 'Bachelor of Commerce (B.Com)', 'Bachelor of Business Administration (BBA)',
    'Bachelor of Computer Applications (BCA)', 'Bachelor of Architecture (B.Arch)',
    'Bachelor of Medicine, Bachelor of Surgery (MBBS)', 'Bachelor of Dental Surgery (BDS)',
    'Bachelor of Pharmacy (B.Pharm)', 'Bachelor of Laws (LLB)', 'Bachelor of Education (B.Ed)',
    'Bachelor of Fine Arts (BFA)', 'Bachelor of Design (B.Des)',
    
    // Master's Degrees
    'Master of Technology (M.Tech)', 'Master of Engineering (M.E.)', 'Master of Science (M.Sc)',
    'Master of Arts (M.A)', 'Master of Commerce (M.Com)', 'Master of Business Administration (MBA)',
    'Master of Computer Applications (MCA)', 'Master of Architecture (M.Arch)',
    'Master of Laws (LLM)', 'Master of Education (M.Ed)', 'Master of Fine Arts (MFA)',
    'Master of Design (M.Des)', 'Master of Public Health (MPH)', 'Master of Social Work (MSW)',
    
    // Doctoral Degrees
    'Doctor of Philosophy (Ph.D)', 'Doctor of Medicine (M.D)', 'Doctor of Business Administration (DBA)',
    'Doctor of Education (Ed.D)', 'Doctor of Engineering (D.Eng)',
    
    // Diplomas & Certificates
    'Diploma', 'Advanced Diploma', 'Post Graduate Diploma (PGD)', 'Certificate',
    'Professional Certificate', 'Associate Degree', 'Vocational Training'
  ];

  // Common fields of study for autocomplete
  const commonFieldsOfStudy = [
    // Engineering & Technology
    'Computer Science', 'Information Technology', 'Software Engineering', 'Computer Engineering',
    'Electrical Engineering', 'Electronics Engineering', 'Electronics and Communication Engineering',
    'Mechanical Engineering', 'Civil Engineering', 'Chemical Engineering', 'Aerospace Engineering',
    'Biomedical Engineering', 'Industrial Engineering', 'Automobile Engineering', 'Robotics',
    'Artificial Intelligence', 'Machine Learning', 'Data Science', 'Cybersecurity',
    
    // Science
    'Physics', 'Chemistry', 'Mathematics', 'Biology', 'Biotechnology', 'Microbiology',
    'Biochemistry', 'Environmental Science', 'Geology', 'Astronomy', 'Statistics',
    'Applied Mathematics', 'Pure Mathematics', 'Zoology', 'Botany',
    
    // Business & Management
    'Business Administration', 'Management', 'Finance', 'Accounting', 'Marketing',
    'Human Resource Management', 'Operations Management', 'Supply Chain Management',
    'International Business', 'Entrepreneurship', 'Business Analytics', 'Economics',
    'Commerce', 'Banking and Finance', 'Financial Management',
    
    // Arts & Humanities
    'English Literature', 'History', 'Philosophy', 'Psychology', 'Sociology', 'Political Science',
    'Anthropology', 'Geography', 'Linguistics', 'Journalism', 'Mass Communication',
    'Public Relations', 'Advertising', 'Film Studies', 'Theatre Arts', 'Music', 'Fine Arts',
    
    // Design & Architecture
    'Architecture', 'Interior Design', 'Graphic Design', 'Fashion Design', 'Product Design',
    'Industrial Design', 'UI/UX Design', 'Animation', 'Visual Communication',
    
    // Medicine & Healthcare
    'Medicine', 'Nursing', 'Pharmacy', 'Dentistry', 'Physiotherapy', 'Occupational Therapy',
    'Public Health', 'Nutrition and Dietetics', 'Medical Laboratory Technology',
    'Radiology', 'Veterinary Science',
    
    // Law & Legal Studies
    'Law', 'Corporate Law', 'Criminal Law', 'International Law', 'Intellectual Property Law',
    'Constitutional Law', 'Legal Studies',
    
    // Education
    'Education', 'Elementary Education', 'Secondary Education', 'Special Education',
    'Educational Technology', 'Curriculum and Instruction', 'Educational Leadership',
    
    // Agriculture & Food Science
    'Agriculture', 'Agricultural Engineering', 'Horticulture', 'Food Technology',
    'Food Science', 'Agricultural Economics',
    
    // Social Sciences
    'Social Work', 'Development Studies', 'International Relations', 'Public Administration',
    'Public Policy', 'Urban Planning', 'Gender Studies',
    
    // Other Fields
    'Library Science', 'Hotel Management', 'Tourism Management', 'Event Management',
    'Sports Management', 'Physical Education', 'Aviation', 'Maritime Studies'
  ];

  const normalizeSkillList = (value) => {
    const rawSkills = Array.isArray(value) ? value : String(value || '').split(',');
    const seen = new Set();

    return rawSkills
      .map((item) => String(item).trim())
      .filter((item) => {
        if (!item) {
          return false;
        }

        const normalizedItem = item.toLowerCase();
        if (seen.has(normalizedItem)) {
          return false;
        }

        seen.add(normalizedItem);
        return true;
      });
  };

  const parseMonthYear = (month, year) => {
    if (!month || !year) {
      return null;
    }

    const parsedDate = new Date(`${month} 1, ${year}`);
    return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
  };

  const hasSkillAlreadySelected = (skill) => {
    const normalizedSkill = String(skill || '').trim().toLowerCase();
    return tmpSkills.some((selectedSkill) => selectedSkill.toLowerCase() === normalizedSkill);
  };

  const getFilteredSkillSuggestions = (value) => {
    const normalizedValue = value.trim().toLowerCase();
    if (!normalizedValue) {
      return [];
    }

    return commonSkills.filter((skill) => (
      skill.toLowerCase().includes(normalizedValue) && !hasSkillAlreadySelected(skill)
    )).slice(0, 10);
  };

  const updateSkillSuggestions = (value) => {
    const filteredSkills = getFilteredSkillSuggestions(value);
    setSkillSuggestions(filteredSkills);
    setShowSkillDropdown(filteredSkills.length > 0);
  };

  const trimmedSkills = normalizeSkillList(tmpSkills.length > 0 ? tmpSkills : tmp.skills);
  const isProfileSaveDisabled = submitting || !tmp.name?.trim();
  const isAboutSaveDisabled = submitting || !tmp.about?.trim();
  const isSkillsSaveDisabled = submitting || trimmedSkills.length === 0 || trimmedSkills.length > 5;
  const isExperienceSaveDisabled = submitting
    || !tmp.role?.trim()
    || !tmp.company?.trim()
    || !tmp.startMonth
    || !tmp.startYear
    || (!tmp.currentlyWorking && (!tmp.endMonth || !tmp.endYear));
  const isEducationSaveDisabled = submitting || !tmp.school?.trim();

  const getProfileValidationError = () => {
    const normalizedName = tmp.name?.trim() || '';

    if (!normalizedName) {
      return 'Full name is required.';
    }
    if (normalizedName.length < 2) {
      return 'Full name must be at least 2 characters.';
    }
    return '';
  };

  const getAboutValidationError = () => {
    if (!tmp.about?.trim()) {
      return 'About Me cannot be empty.';
    }
    return '';
  };

  const getSkillsValidationError = () => {
    if (trimmedSkills.length === 0) {
      return 'Add at least one skill before saving.';
    }
    if (trimmedSkills.length > 5) {
      return 'Add up to 5 skills only.';
    }
    return '';
  };

  const getExperienceValidationError = () => {
    if (!tmp.role?.trim()) {
      return 'Experience title is required.';
    }
    if (!tmp.company?.trim()) {
      return 'Company or organization is required.';
    }
    if (!tmp.startMonth || !tmp.startYear) {
      return 'Start month and year are required.';
    }
    if (!tmp.currentlyWorking && (!tmp.endMonth || !tmp.endYear)) {
      return 'End month and year are required unless this is your current role.';
    }
    const experienceStart = parseMonthYear(tmp.startMonth, tmp.startYear);
    const experienceEnd = parseMonthYear(tmp.endMonth, tmp.endYear);
    if (!tmp.currentlyWorking && experienceStart && experienceEnd && experienceEnd < experienceStart) {
      return 'End date cannot be earlier than start date.';
    }
    if (normalizeSkillList(tmpSkills).length > 5) {
      return 'Add up to 5 skills per experience entry.';
    }
    return '';
  };

  const getEducationValidationError = () => {
    if (!tmp.school?.trim()) {
      return 'School is required.';
    }
    if ((tmp.startMonth || tmp.startYear) && (!tmp.startMonth || !tmp.startYear)) {
      return 'Complete both start month and year.';
    }
    if ((tmp.endMonth || tmp.endYear) && (!tmp.endMonth || !tmp.endYear)) {
      return 'Complete both end month and year.';
    }
    const educationStart = parseMonthYear(tmp.startMonth, tmp.startYear);
    const educationEnd = parseMonthYear(tmp.endMonth, tmp.endYear);
    if (educationStart && educationEnd && educationEnd < educationStart) {
      return 'End date cannot be earlier than start date.';
    }
    if (normalizeSkillList(tmpSkills).length > 5) {
      return 'Add up to 5 skills per education entry.';
    }
    return '';
  };

  const openModal = (key, initial) => {
    // Track parent modal if opening from edit-all views
    if (modal === 'edit-all-edu' || modal === 'edit-all-exp') {
      setParentModal(modal);
    }
    
    // Parse start/end dates back into month/year if they exist
    let parsedInitial = { ...initial };
    
    if (typeof parsedInitial.skills === 'string' || Array.isArray(parsedInitial.skills)) {
      parsedInitial.skills = normalizeSkillList(parsedInitial.skills);
    } else {
      parsedInitial.skills = [];
    }
    
    if (key.startsWith('exp-') || key === 'add-exp') {
      // If start date exists but startMonth/startYear don't, parse it
      if (initial.start && !initial.startMonth && !initial.startYear) {
        const startParts = initial.start.split(' ');
        if (startParts.length === 2) {
          parsedInitial.startMonth = startParts[0];
          parsedInitial.startYear = startParts[1];
        }
      }
      
      // If end date exists but endMonth/endYear don't, parse it
      if (initial.end && initial.end !== 'Present' && !initial.endMonth && !initial.endYear) {
        const endParts = initial.end.split(' ');
        if (endParts.length === 2) {
          parsedInitial.endMonth = endParts[0];
          parsedInitial.endYear = endParts[1];
        }
      }
      
      // Set currentlyWorking if end date is 'Present'
      if (initial.end === 'Present') {
        parsedInitial.currentlyWorking = true;
      }
    }
    
    if (key.startsWith('edu-') || key === 'add-edu') {
      // Parse education dates
      if (initial.start && !initial.startMonth && !initial.startYear) {
        const startParts = initial.start.split(' ');
        if (startParts.length === 2) {
          parsedInitial.startMonth = startParts[0];
          parsedInitial.startYear = startParts[1];
        }
      }
      
      if (initial.end && !initial.endMonth && !initial.endYear) {
        const endParts = initial.end.split(' ');
        if (endParts.length === 2) {
          parsedInitial.endMonth = endParts[0];
          parsedInitial.endYear = endParts[1];
        }
      }
    }
    
    setTmp(parsedInitial);
    setTmpSkills(parsedInitial.skills || []);
    setNewSkill('');
    setMediaFiles(parsedInitial.media || []);
    setSkillSuggestions([]);
    setShowSkillDropdown(false);
    setLocationSuggestions([]);
    setShowLocationDropdown(false);
    setHasUnsavedChanges(false);
    setErrorMessage('');
    
    // Store initial state for comparison
    setInitialFormState({
      tmp: parsedInitial,
      skills: parsedInitial.skills || [],
      media: parsedInitial.media || [],
    });
    
    setModal(key);
  };

  useEffect(() => {
    if (!isExperiencePage || routeRequestedExperienceModal !== 'add-exp' || modal) {
      return;
    }

    openModal('add-exp', buildEmptyExperienceDraft());
    navigate('/dashboard/profile/experience', { replace: true, state: null });
  }, [isExperiencePage, routeRequestedExperienceModal, modal, navigate]);

  const dismissModal = () => {
    setModal(null);
    setShowDiscardDialog(false);
    setHasUnsavedChanges(false);
    setInitialFormState(null);
    setTmp({});
    setTmpSkills([]);
    setNewSkill('');
    setSkillSuggestions([]);
    setShowSkillDropdown(false);
    setLocationSuggestions([]);
    setShowLocationDropdown(false);
    setMediaFiles([]);
    setUploadingMedia(false);
    
    // Restore the parent modal if there was one
    if (parentModal) {
      setTimeout(() => {
        setModal(parentModal);
        setParentModal(null);
      }, 50);
    }
  };

  const closeModal = () => {
    if (!modal) {
      return;
    }

    if (!initialFormState) {
      dismissModal();
      return;
    }

    // Check if there are unsaved changes
    const currentState = {
      tmp,
      skills: tmpSkills,
      media: mediaFiles,
    };
    
    const hasChanges = JSON.stringify(currentState) !== JSON.stringify(initialFormState);
    
    if (hasChanges && !showDiscardDialog) {
      setShowDiscardDialog(true);
    } else {
      dismissModal();
    }
  };

  const confirmDiscard = () => {
    dismissModal();
  };

  const cancelDiscard = () => {
    setShowDiscardDialog(false);
  };

  const applyProfileData = (data) => {
    const fallbackState = buildEmptyState(displayName, userEmail);

    setProfile({
      name: data?.fullName || fallbackState.profile.name,
      title: data?.title || '',
      company: data?.company || '',
      location: data?.location || '',
    });
    setAbout(data?.description || '');
    setDetails({
      email: data?.email || fallbackState.details.email,
      phone: data?.phone || '',
      languages: data?.languages || '',
    });
    setSocials({
      instagram: data?.instagram || '',
      twitter: data?.twitter || '',
      website: data?.website || '',
    });
    setSkills(Array.isArray(data?.skills) ? data.skills.filter(Boolean) : []);
    setExperiences(normalizeExperiences(data?.experiences));
    setEducations(normalizeEducations(data?.educations));
    setOpenForOpp(data?.openToOpportunities ?? true);
    setAvatarImg(data?.profilePhotoUrl || '');
    setCoverImg(data?.coverPhotoUrl || '');
    updateUser({
      fullName: data?.fullName || fallbackState.profile.name,
      email: data?.email || fallbackState.details.email,
      userType: data?.userType || user?.userType,
      profilePhotoUrl: data?.profilePhotoUrl || '',
    });
  };

  useEffect(() => {
    let ignore = false;

    const fetchProfile = async () => {
      setLoadingProfile(true);
      try {
        const response = await apiService.getMyProfile();
        if (!ignore) {
          applyProfileData(response);
          setErrorMessage('');
        }
      } catch (error) {
        if (!ignore) {
          const fallbackState = buildEmptyState(displayName, userEmail);
          setProfile(fallbackState.profile);
          setAbout(fallbackState.about);
          setDetails(fallbackState.details);
          setSocials(fallbackState.socials);
          setSkills(fallbackState.skills);
          setExperiences(fallbackState.experiences);
          setEducations(fallbackState.educations);
          setOpenForOpp(fallbackState.openToOpportunities);
          setAvatarImg(fallbackState.avatarImg);
          setCoverImg(fallbackState.coverImg);
          setErrorMessage(error.message || 'Failed to load profile data.');
        }
      } finally {
        if (!ignore) {
          setLoadingProfile(false);
        }
      }
    };

    fetchProfile();

    return () => {
      ignore = true;
    };
  }, [displayName, userEmail]);

  const buildPayload = (overrides = {}) => ({
    fullName: overrides.fullName ?? profile.name,
    title: overrides.title ?? profile.title,
    company: overrides.company ?? profile.company,
    location: overrides.location ?? profile.location,
    about: overrides.about ?? about,
    phone: overrides.phone ?? details.phone,
    languages: overrides.languages ?? details.languages,
    instagram: overrides.instagram ?? socials.instagram,
    twitter: overrides.twitter ?? socials.twitter,
    website: overrides.website ?? socials.website,
    profilePhotoUrl: overrides.profilePhotoUrl ?? avatarImg,
    coverPhotoUrl: overrides.coverPhotoUrl ?? coverImg,
    openToOpportunities: overrides.openToOpportunities ?? openForOpp,
    skills: overrides.skills ?? skills,
    experiences: normalizeExperiences(overrides.experiences ?? experiences),
    educations: normalizeEducations(overrides.educations ?? educations),
  });

  const persistProfile = async (overrides = {}, successMessage = 'Profile saved.') => {
    setSubmitting(true);
    setErrorMessage('');

    try {
      const response = await apiService.updateMyProfile(buildPayload(overrides));
      applyProfileData(response);
      setStatusMessage(successMessage);
      return response;
    } catch (error) {
      setErrorMessage(error.message || 'Failed to save profile data.');
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  const uploadImage = async (file, field) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please upload a valid image file.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      const uploadResponse = await apiService.uploadFile(file);
      const response = await apiService.updateMyProfile(
        buildPayload({
          [field]: uploadResponse.url,
        }),
      );
      applyProfileData(response);
      setStatusMessage(field === 'profilePhotoUrl' ? 'Profile photo updated.' : 'Cover photo updated.');
    } catch (error) {
      setErrorMessage(error.message || 'Failed to upload image.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCoverChange = async (event) => {
    const file = event.target.files?.[0];
    await uploadImage(file, 'coverPhotoUrl');
    event.target.value = '';
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files?.[0];
    await uploadImage(file, 'profilePhotoUrl');
    event.target.value = '';
  };

  const saveProfile = async () => {
    const validationError = getProfileValidationError();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    await persistProfile(
      {
        fullName: tmp.name,
        title: tmp.title,
        company: tmp.company,
        location: tmp.location,
      },
      'Profile header updated.',
    );
    dismissModal();
  };

  const saveAbout = async () => {
    const validationError = getAboutValidationError();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    await persistProfile({ about: tmp.about, skills: normalizeSkillList(tmpSkills) }, 'About section updated.');
    dismissModal();
  };

  const saveDetails = async () => {
    await persistProfile(
      {
        phone: tmp.phone,
        languages: tmp.languages,
      },
      'Additional details updated.',
    );
    dismissModal();
  };

  const saveSocials = async () => {
    await persistProfile(
      {
        instagram: tmp.instagram,
        twitter: tmp.twitter,
        website: tmp.website,
      },
      'Social links updated.',
    );
    dismissModal();
  };

  const saveSkills = async () => {
    const validationError = getSkillsValidationError();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    const nextSkills = normalizeSkillList(tmpSkills);
    await persistProfile({ skills: nextSkills }, 'Skills updated.');
    dismissModal();
  };

  const saveExp = async () => {
    const validationError = getExperienceValidationError();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    // Combine month and year into start/end strings
    const startDate = tmp.startMonth && tmp.startYear ? `${tmp.startMonth} ${tmp.startYear}` : tmp.start || '';
    const endDate = tmp.currentlyWorking ? 'Present' : (tmp.endMonth && tmp.endYear ? `${tmp.endMonth} ${tmp.endYear}` : tmp.end || '');
    
    const normalizedEntry = {
      id: tmp.id ?? Date.now(),
      role: tmp.role || '',
      company: tmp.company || '',
      logo: tmp.logo || '💼',
      logoBg: tmp.logoBg || 'bg-gray-100 text-gray-600',
      type: tmp.type || '',
      start: startDate,
      end: endDate,
      duration: tmp.duration || '',
      location: tmp.location || '',
      desc: tmp.desc || '',
      notifyNetwork: tmp.notifyNetwork || false,
      currentlyWorking: tmp.currentlyWorking || false,
      endCurrentPosition: tmp.endCurrentPosition || false,
      startMonth: tmp.startMonth || '',
      startYear: tmp.startYear || '',
      endMonth: tmp.endMonth || '',
      endYear: tmp.endYear || '',
      locationType: tmp.locationType || '',
      headline: tmp.headline || '',
      jobSource: tmp.jobSource || '',
      skills: normalizeSkillList(tmpSkills),
      media: mediaFiles || [],
    };

    const nextExperiences = modal === 'add-exp'
      ? [...experiences, normalizedEntry]
      : experiences.map((entry) => (entry.id === normalizedEntry.id ? normalizedEntry : entry));

    await persistProfile({ experiences: nextExperiences }, modal === 'add-exp' ? 'Experience added.' : 'Experience updated.');
    dismissModal();
  };

  const showToast = (message) => {
    setStatusMessage(message);
    setTimeout(() => setStatusMessage(''), 3000);
  };

  const handleSkillInputChange = (value) => {
    setNewSkill(value);
    if (value.trim()) {
      updateSkillSuggestions(value);
    } else {
      setSkillSuggestions([]);
      setShowSkillDropdown(false);
    }
  };

  const addSkill = (skill) => {
    const normalizedSkill = String(skill || '').trim();
    if (!normalizedSkill) {
      return;
    }

    if (hasSkillAlreadySelected(normalizedSkill)) {
      setNewSkill('');
      setSkillSuggestions([]);
      setShowSkillDropdown(false);
      return;
    }

    if (tmpSkills.length >= 5) {
      setErrorMessage('Add up to 5 skills only.');
      return;
    }

    setTmpSkills([...tmpSkills, normalizedSkill]);
    setNewSkill('');
    setSkillSuggestions([]);
    setShowSkillDropdown(false);
    setErrorMessage('');
  };

  const handleSkillDragStart = (index) => {
    setDraggedSkillIndex(index);
  };

  const handleSkillDragOver = (e, index) => {
    e.preventDefault();
    if (draggedSkillIndex === null || draggedSkillIndex === index) return;
    
    const newSkills = [...tmpSkills];
    const draggedSkill = newSkills[draggedSkillIndex];
    newSkills.splice(draggedSkillIndex, 1);
    newSkills.splice(index, 0, draggedSkill);
    
    setTmpSkills(newSkills);
    setDraggedSkillIndex(index);
  };

  const handleSkillDragEnd = () => {
    setDraggedSkillIndex(null);
  };

  const handleLocationInputChange = (value) => {
    setTmp((current) => ({ ...current, location: value }));
    if (value.trim()) {
      const filtered = commonLocations.filter(location => 
        location.toLowerCase().includes(value.toLowerCase())
      );
      setLocationSuggestions(filtered.slice(0, 10));
      setShowLocationDropdown(filtered.length > 0);
    } else {
      setLocationSuggestions([]);
      setShowLocationDropdown(false);
    }
  };

  const selectLocation = (location) => {
    setTmp((current) => ({ ...current, location }));
    setLocationSuggestions([]);
    setShowLocationDropdown(false);
  };

  const handleSchoolInputChange = (value) => {
    setTmp((current) => ({ ...current, school: value }));
    if (value.trim()) {
      const filtered = commonSchools.filter(school => 
        school.toLowerCase().includes(value.toLowerCase())
      );
      setSchoolSuggestions(filtered.slice(0, 10));
      setShowSchoolDropdown(filtered.length > 0);
    } else {
      setSchoolSuggestions([]);
      setShowSchoolDropdown(false);
    }
  };

  const selectSchool = (school) => {
    setTmp((current) => ({ ...current, school }));
    setSchoolSuggestions([]);
    setShowSchoolDropdown(false);
  };

  const handleDegreeInputChange = (value) => {
    setTmp((current) => ({ ...current, degree: value }));
    if (value.trim()) {
      const filtered = commonDegrees.filter(degree => 
        degree.toLowerCase().includes(value.toLowerCase())
      );
      setDegreeSuggestions(filtered.slice(0, 10));
      setShowDegreeDropdown(filtered.length > 0);
    } else {
      setDegreeSuggestions([]);
      setShowDegreeDropdown(false);
    }
  };

  const selectDegree = (degree) => {
    setTmp((current) => ({ ...current, degree }));
    setDegreeSuggestions([]);
    setShowDegreeDropdown(false);
  };

  const handleFieldOfStudyInputChange = (value) => {
    setTmp((current) => ({ ...current, fieldOfStudy: value }));
    if (value.trim()) {
      const filtered = commonFieldsOfStudy.filter(field => 
        field.toLowerCase().includes(value.toLowerCase())
      );
      setFieldOfStudySuggestions(filtered.slice(0, 10));
      setShowFieldOfStudyDropdown(filtered.length > 0);
    } else {
      setFieldOfStudySuggestions([]);
      setShowFieldOfStudyDropdown(false);
    }
  };

  const selectFieldOfStudy = (field) => {
    setTmp((current) => ({ ...current, fieldOfStudy: field }));
    setFieldOfStudySuggestions([]);
    setShowFieldOfStudyDropdown(false);
  };

  const handleExperienceRoleChange = (value) => {
    setTmp((current) => ({ ...current, role: value }));
  };

  const handleExperienceCompanyChange = (value) => {
    const normalizedValue = value.trim().toLowerCase();
    const companyMetadata = EXPERIENCE_COMPANY_METADATA.get(normalizedValue);

    setTmp((current) => ({
      ...current,
      company: value,
      logo: value.trim() ? (companyMetadata?.logo || getInitials(value)) : '💼',
      logoBg: companyMetadata?.logoBg || 'bg-gray-100 text-gray-600',
    }));
  };

  const handleMediaUpload = async (files) => {
    if (!files || files.length === 0) return;

    setUploadingMedia(true);
    const uploadedFiles = [];

    try {
      for (const file of files) {
        const uploadResponse = await apiService.uploadFile(file);
        uploadedFiles.push({
          name: file.name,
          url: uploadResponse.url,
          type: file.type,
          size: file.size,
        });
      }
      
      setMediaFiles([...mediaFiles, ...uploadedFiles]);
      showToast(`${uploadedFiles.length} file(s) uploaded successfully`);
    } catch (error) {
      setErrorMessage(error.message || 'Failed to upload media files');
    } finally {
      setUploadingMedia(false);
    }
  };

  const removeMediaFile = (index) => {
    setMediaFiles(mediaFiles.filter((_, i) => i !== index));
  };

  const saveEdu = async () => {
    const validationError = getEducationValidationError();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    // Combine month and year into start/end strings
    const startDate = tmp.startMonth && tmp.startYear ? `${tmp.startMonth} ${tmp.startYear}` : tmp.start || '';
    const endDate = tmp.endMonth && tmp.endYear ? `${tmp.endMonth} ${tmp.endYear}` : tmp.end || '';
    
    const normalizedEntry = {
      id: tmp.id ?? Date.now(),
      school: tmp.school || '',
      logo: tmp.logo || '🎓',
      logoBg: tmp.logoBg || 'bg-gray-100 text-gray-600',
      degree: tmp.degree || '',
      start: startDate,
      end: endDate,
      desc: tmp.desc || '',
      notifyNetwork: tmp.notifyNetwork || false,
      fieldOfStudy: tmp.fieldOfStudy || '',
      startMonth: tmp.startMonth || '',
      startYear: tmp.startYear || '',
      endMonth: tmp.endMonth || '',
      endYear: tmp.endYear || '',
      grade: tmp.grade || '',
      activities: tmp.activities || '',
      skills: normalizeSkillList(tmpSkills),
      media: mediaFiles || [],
    };

    const nextEducations = modal === 'add-edu'
      ? [...educations, normalizedEntry]
      : educations.map((entry) => (entry.id === normalizedEntry.id ? normalizedEntry : entry));

    await persistProfile({ educations: nextEducations }, modal === 'add-edu' ? 'Education added.' : 'Education updated.');
    dismissModal();
  };

  const deleteExp = async (id) => {
    await persistProfile(
      {
        experiences: experiences.filter((entry) => entry.id !== id),
      },
      'Experience removed.',
    );
    dismissModal();
  };

  const deleteEdu = async (id) => {
    await persistProfile(
      {
        educations: educations.filter((entry) => entry.id !== id),
      },
      'Education removed.',
    );
    dismissModal();
  };

  const toggleOpenForOpportunities = async () => {
    const nextValue = !openForOpp;
    setOpenForOpp(nextValue);

    try {
      await persistProfile({ openToOpportunities: nextValue }, nextValue ? 'Profile is now open to opportunities.' : 'Profile is no longer open to opportunities.');
    } catch (error) {
      setOpenForOpp((current) => !current);
    }
  };

  const visibleExp = experiences;
  const visibleEdu = showAllEdu ? educations : educations.slice(0, 2);
  const initials = getInitials(profile.name || displayName);
  const resolvedAvatarUrl = avatarImg && !avatarLoadFailed ? apiService.resolveFileUrl(avatarImg) : '';
  const resolvedCoverUrl = coverImg ? apiService.resolveFileUrl(coverImg) : '';
  const portfolioUrl = normalizeExternalUrl(socials.website);
  const aboutParagraphs = about.trim() ? about.split('\n\n') : [];
  const socialRows = [
    { label: 'Instagram', icon: '📸', value: socials.instagram },
    { label: 'Twitter', icon: '🐦', value: socials.twitter },
    { label: 'Website', icon: '🌐', value: socials.website },
  ];
  const completenessChecks = [
    { label: 'Add a profile photo', complete: Boolean(avatarImg) },
    { label: 'Write an about summary', complete: Boolean(about.trim()) },
    { label: 'Add your first skill', complete: skills.length > 0 },
    { label: 'Add an experience entry', complete: experiences.length > 0 },
    { label: 'Add an education entry', complete: educations.length > 0 },
    { label: 'Add your website', complete: Boolean(socials.website.trim()) },
  ];
  const completedItems = completenessChecks.filter((item) => item.complete).length;
  const completenessPercent = Math.round((completedItems / completenessChecks.length) * 100);
  const remainingItems = completenessChecks.filter((item) => !item.complete);

  if (loadingProfile) {
    return (
      <div className="flex-1 flex flex-col h-full bg-gray-50">
        <DashTopBar title="My Profile" />
        <div className="flex-1 flex items-center justify-center text-gray-400">
          <p className="text-lg font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Edit all experiences view
  if (modal === 'edit-all-exp') {
    return (
      <div className="flex-1 flex flex-col h-full bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setModal(null)}
                className="text-gray-600 hover:text-gray-900"
                aria-label="Back to profile"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Experience</h1>
            </div>
            <button
              onClick={() => openModal('add-exp', buildEmptyExperienceDraft())}
              className="w-10 h-10 flex items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100 transition text-2xl font-light"
              aria-label="Add experience"
              disabled={submitting}
            >
              +
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 px-8 py-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {experiences.length > 0 ? (
              experiences.map((exp, index) => (
                <div key={exp.id} className="bg-white rounded-xl p-6 border border-gray-200 relative">
                  <button
                    onClick={() => openModal(`exp-${exp.id}`, exp)}
                    className="absolute top-6 right-6 p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                    aria-label="Edit experience"
                  >
                    <EditIcon className="w-5 h-5" />
                  </button>

                  <div className="flex gap-4">
                    {exp.logoUrl ? (
                      <img 
                        src={exp.logoUrl} 
                        alt={exp.company}
                        className="w-12 h-12 rounded object-contain flex-shrink-0"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className={`w-12 h-12 rounded ${exp.logoBg} flex items-center justify-center text-xl flex-shrink-0 ${exp.logoUrl ? 'hidden' : ''}`}>
                      {exp.logo}
                    </div>
                    
                    <div className="flex-1 pr-12">
                      <h3 className="text-lg font-semibold text-gray-900">{exp.role || 'Untitled role'}</h3>
                      <p className="text-sm text-gray-700 mt-0.5">
                        {exp.company || 'Company'}
                        {exp.type ? ` · ${exp.type}` : ''}
                      </p>
                      <p className="text-sm text-gray-600 mt-0.5">
                        {exp.start || 'Start'} - {exp.end || 'Present'}
                        {exp.duration ? ` · ${exp.duration}` : ''}
                      </p>
                      <p className="text-sm text-gray-600">
                        {exp.location || ''}
                        {exp.locationType ? ` · ${exp.locationType}` : ''}
                      </p>

                      {exp.desc && (
                        <div className="mt-4">
                          <div className="text-sm text-gray-700 leading-relaxed">
                            {(() => {
                              const lines = exp.desc.split('\n').filter(line => line.trim());
                              return lines.map((line, idx) => {
                                const trimmedLine = line.trim();
                                const hasBullet = trimmedLine.startsWith('•') || 
                                                 trimmedLine.startsWith('-') || 
                                                 trimmedLine.startsWith('*');
                                
                                return (
                                  <p key={idx} className="mb-2">
                                    {hasBullet ? trimmedLine : `• ${trimmedLine}`}
                                  </p>
                                );
                              });
                            })()}
                          </div>
                        </div>
                      )}

                      {exp.media && exp.media.length > 0 && (
                        <div className="mt-4 flex gap-3 flex-wrap">
                          {exp.media.map((file, idx) => (
                            <div key={idx} className="relative group">
                              {file.type?.startsWith('image/') ? (
                                <div className="relative">
                                  <img 
                                    src={apiService.resolveFileUrl(file.url)} 
                                    alt={file.name}
                                    className="w-32 h-32 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-90"
                                    onClick={() => window.open(apiService.resolveFileUrl(file.url), '_blank')}
                                  />
                                  <div className="absolute bottom-2 left-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs text-gray-700 truncate">
                                    {file.name}
                                  </div>
                                </div>
                              ) : (
                                <div 
                                  className="w-32 h-32 bg-gray-50 rounded-lg border border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 p-3"
                                  onClick={() => window.open(apiService.resolveFileUrl(file.url), '_blank')}
                                >
                                  <span className="text-3xl mb-2">📄</span>
                                  <span className="text-xs text-gray-700 text-center truncate w-full px-1">{file.name}</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {exp.skills && exp.skills.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {exp.skills.map((skill, idx) => (
                            <span key={idx} className="inline-flex items-center gap-1 text-sm text-gray-700">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z" />
                              </svg>
                              {skill}
                              {idx < exp.skills.length - 1 && <span className="text-gray-400">·</span>}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-xl p-12 border border-gray-200 text-center">
                <p className="text-gray-400">No experiences yet. Add your first experience.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50">
      <DashTopBar title="My Profile" />

      {!isExperiencePage && (
      <div className="overflow-y-auto flex-1 px-8 py-6">
        {statusMessage && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {statusMessage}
          </div>
        )}
        {errorMessage && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-5">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="h-28 relative overflow-hidden">
                {resolvedCoverUrl ? (
                  <img src={resolvedCoverUrl} alt="Profile cover" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400" />
                )}
                <button
                  onClick={() => coverInputRef.current?.click()}
                  className="absolute top-3 right-3 w-8 h-8 bg-white/20 hover:bg-white/50 border border-white/40 rounded-lg flex items-center justify-center text-white transition"
                  aria-label="Upload cover photo"
                  disabled={submitting}
                >
                  <EditIcon className="w-4 h-4" />
                </button>
                <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
              </div>

              <div className="px-6 pb-5">
                <div className="flex items-end justify-between -mt-10 mb-3">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full border-4 border-white shadow-md overflow-hidden bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-2xl">
                      {resolvedAvatarUrl ? (
                        <a
                          href={resolvedAvatarUrl}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`Open ${profile.name || displayName} profile photo`}
                          className="block w-full h-full"
                        >
                          <img
                            src={resolvedAvatarUrl}
                            alt={`${profile.name || displayName} profile photo`}
                            className="w-full h-full object-cover"
                            onError={() => setAvatarLoadFailed(true)}
                          />
                        </a>
                      ) : (
                        initials
                      )}
                    </div>
                    <button
                      onClick={() => avatarInputRef.current?.click()}
                      aria-label="Upload profile photo"
                      disabled={submitting}
                      className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white border border-blue-100 text-blue-600 shadow-sm flex items-center justify-center hover:bg-blue-50 transition"
                    >
                      <EditIcon className="w-4 h-4" />
                    </button>
                    <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                  </div>

                  <SectionActionButton onClick={() => openModal('profile', { ...profile })} disabled={submitting}>
                    Edit Profile
                  </SectionActionButton>
                </div>

                <h2 className="text-xl font-bold text-gray-900">{profile.name || displayName}</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  {profile.title || 'Add a headline'}
                  {profile.company ? ` at ${profile.company}` : ''}
                </p>
                <p className="text-xs text-gray-400 mt-1">{profile.location ? `📍 ${profile.location}` : 'Add your location'}</p>
                {resolvedAvatarUrl && (
                  <p className="text-xs text-blue-600 mt-2">Click the profile photo to open the full image.</p>
                )}
                <button
                  onClick={toggleOpenForOpportunities}
                  disabled={submitting}
                  className={`mt-3 flex items-center gap-2 text-xs font-medium px-4 py-1.5 rounded-lg border transition ${
                    openForOpp
                      ? 'bg-green-50 border-green-300 text-green-700 hover:bg-green-100'
                      : 'bg-gray-50 border-gray-300 text-gray-500 hover:bg-gray-100'
                  } ${submitting ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  <span className={`w-2 h-2 rounded-full ${openForOpp ? 'bg-green-500' : 'bg-gray-400'}`} />
                  {openForOpp ? 'OPEN FOR OPPORTUNITIES' : 'NOT OPEN FOR OPPORTUNITIES'}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900">About</h3>
                <EditBtn onClick={() => openModal('about', { about, skills })} ariaLabel="Edit about section" />
              </div>
              {aboutParagraphs.length > 0 ? (
                aboutParagraphs.map((paragraph, index) => (
                  <p key={`${paragraph}-${index}`} className="text-sm text-gray-600 leading-relaxed mb-2 last:mb-0">
                    {paragraph}
                  </p>
                ))
              ) : (
                <p className="text-sm text-gray-400">Add a summary so recruiters and other users can quickly understand your profile.</p>
              )}
              
              {skills.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <svg className="w-6 h-6 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 2.18l8 3.6v8.72c0 4.35-3.07 8.44-8 9.5-4.93-1.06-8-5.15-8-9.5V7.78l8-3.6z"/>
                        <path d="M12 6L6 9v6c0 3.31 2.16 6.4 5 7.5 2.84-1.1 5-4.19 5-7.5V9l-6-3zm0 1.82l4 1.8v5.38c0 2.61-1.62 5.06-4 5.94-2.38-.88-4-3.33-4-5.94V9.62l4-1.8z"/>
                      </svg>
                      <div className="text-left">
                        <h4 className="font-semibold text-gray-900 text-sm">Top skills</h4>
                        <p className="text-sm text-gray-600 mt-0.5">
                          {skills.slice(0, 4).join(' • ')}
                          {skills.length > 4 && ` • +${skills.length - 4} more`}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSkillsDetailExp({ type: 'top-skills' })}
                      className="p-2 rounded-lg hover:bg-gray-200 transition group"
                      aria-label="View all skills"
                    >
                      <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900">Experiences</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate('/dashboard/profile/experience', { state: { openExperienceModal: 'add-exp' } })}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-blue-600 hover:bg-blue-50 border border-blue-100 transition text-xl font-light"
                    aria-label="Add experience"
                    disabled={submitting}
                  >
                    +
                  </button>
                  <button
                    onClick={() => navigate('/dashboard/profile/experience')}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-blue-600 hover:bg-blue-50 border border-blue-100 transition"
                    aria-label="Edit experiences"
                    disabled={submitting}
                  >
                    <EditIcon />
                  </button>
                </div>
              </div>

              {visibleExp.length > 0 ? (
                <div className="space-y-5">
                  {visibleExp.map((exp, index) => (
                    <div key={exp.id} className={`flex gap-4 ${index < visibleExp.length - 1 ? 'pb-5 border-b border-gray-100' : ''}`}>
                      <div className={`w-12 h-12 rounded-lg ${exp.logoBg} flex items-center justify-center text-xl flex-shrink-0`}>{exp.logo}</div>
                      <div className="flex-1">
                        <div className="mb-1">
                          <p className="font-semibold text-gray-900 text-base">{exp.role || 'Untitled role'}</p>
                          <p className="text-sm text-gray-700 mt-0.5">
                            {exp.company || 'Company'}
                            {exp.type ? ` · ${exp.type}` : ''}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {exp.start || 'Start'} - {exp.end || 'Present'}
                            {exp.duration ? ` · ${exp.duration}` : ''}
                          </p>
                          <p className="text-xs text-gray-500">
                            {exp.location || 'Location not specified'}
                            {exp.locationType ? ` · ${exp.locationType}` : ''}
                          </p>
                        </div>
                        
                        {exp.desc && (
                          <div className="mt-2">
                            <div className="text-sm text-gray-600 leading-relaxed">
                              {(() => {
                                const lines = exp.desc.split('\n').filter(line => line.trim());
                                
                                return (
                                  <>
                                    {lines.map((line, idx) => {
                                      const trimmedLine = line.trim();
                                      const hasBullet = trimmedLine.startsWith('•') || 
                                                       trimmedLine.startsWith('-') || 
                                                       trimmedLine.startsWith('*');
                                      
                                      return (
                                        <span key={idx} className="block mb-1">
                                          {hasBullet ? trimmedLine : `• ${trimmedLine}`}
                                        </span>
                                      );
                                    })}
                                  </>
                                );
                              })()}
                            </div>
                          </div>
                        )}
                        
                        {exp.media && exp.media.length > 0 && (
                          <div className="mt-3 flex gap-2 flex-wrap">
                            {exp.media.slice(0, 3).map((file, idx) => (
                              <div key={idx} className="relative group">
                                {file.type?.startsWith('image/') ? (
                                  <img 
                                    src={apiService.resolveFileUrl(file.url)} 
                                    alt={file.name}
                                    className="w-24 h-24 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-90"
                                    onClick={() => window.open(apiService.resolveFileUrl(file.url), '_blank')}
                                  />
                                ) : (
                                  <div 
                                    className="w-24 h-24 bg-gray-100 rounded-lg border border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-200"
                                    onClick={() => window.open(apiService.resolveFileUrl(file.url), '_blank')}
                                  >
                                    <span className="text-2xl mb-1">📄</span>
                                    <span className="text-xs text-gray-600 text-center px-1 truncate w-full">{file.name?.split('.').pop()?.toUpperCase()}</span>
                                  </div>
                                )}
                              </div>
                            ))}
                            {exp.media.length > 3 && (
                              <div className="w-24 h-24 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center text-sm text-gray-600">
                                +{exp.media.length - 3} more
                              </div>
                            )}
                          </div>
                        )}
                        
                        {exp.skills && exp.skills.length > 0 && (
                          <div className="mt-3">
                            <button 
                              type="button"
                              className="flex items-center gap-1 text-sm text-gray-700 hover:text-gray-900 cursor-pointer"
                              onClick={() => setSkillsDetailExp(exp)}
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z" />
                              </svg>
                              <span className="font-medium">{exp.skills.slice(0, 3).join(', ')}</span>
                              {exp.skills.length > 3 && <span className="text-gray-500">and +{exp.skills.length - 3} skills</span>}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">No experience entries yet. Add your first role to store it in your profile.</p>
              )}
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900">Educations</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openModal('add-edu', { school: '', degree: '', start: '', end: '', desc: '' })}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-blue-600 hover:bg-blue-50 border border-blue-100 transition text-xl font-light"
                    aria-label="Add education"
                    disabled={submitting}
                  >
                    +
                  </button>
                  <button
                    onClick={() => setModal('edit-all-edu')}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-blue-600 hover:bg-blue-50 border border-blue-100 transition"
                    aria-label="Edit educations"
                    disabled={submitting}
                  >
                    <EditIcon />
                  </button>
                </div>
              </div>

              {visibleEdu.length > 0 ? (
                <div className="space-y-5">
                  {visibleEdu.map((edu, index) => (
                    <div key={edu.id} className={`flex gap-4 ${index < visibleEdu.length - 1 ? 'pb-5 border-b border-gray-100' : ''}`}>
                      <div className={`w-11 h-11 rounded-xl ${edu.logoBg} flex items-center justify-center text-xl flex-shrink-0`}>{edu.logo}</div>
                      <div className="flex-1">
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{edu.school || 'Institution'}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{edu.degree || 'Degree / Certificate'}</p>
                          {(edu.start || edu.end) && <p className="text-xs text-gray-400">{edu.start || 'Start'} - {edu.end || 'End'}</p>}
                        </div>
                        {edu.desc && <p className="text-sm text-gray-600 mt-2 leading-relaxed">{edu.desc}</p>}
                        
                        {edu.media && edu.media.length > 0 && (
                          <div className="mt-3 flex gap-2 flex-wrap">
                            {edu.media.slice(0, 3).map((file, idx) => (
                              <div key={idx} className="relative group">
                                {file.type?.startsWith('image/') ? (
                                  <img 
                                    src={apiService.resolveFileUrl(file.url)} 
                                    alt={file.name}
                                    className="w-24 h-24 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-90"
                                    onClick={() => window.open(apiService.resolveFileUrl(file.url), '_blank')}
                                  />
                                ) : (
                                  <div 
                                    className="w-24 h-24 bg-gray-100 rounded-lg border border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-200"
                                    onClick={() => window.open(apiService.resolveFileUrl(file.url), '_blank')}
                                  >
                                    <span className="text-2xl mb-1">📄</span>
                                    <span className="text-xs text-gray-600 text-center px-1 truncate w-full">{file.name?.split('.').pop()?.toUpperCase()}</span>
                                  </div>
                                )}
                              </div>
                            ))}
                            {edu.media.length > 3 && (
                              <div className="w-24 h-24 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center text-sm text-gray-600">
                                +{edu.media.length - 3} more
                              </div>
                            )}
                          </div>
                        )}
                        
                        {edu.skills && edu.skills.length > 0 && (
                          <div className="mt-3">
                            <button 
                              type="button"
                              className="flex items-center gap-1 text-sm text-gray-700 hover:text-gray-900 cursor-pointer"
                              onClick={() => setSkillsDetailExp({ ...edu, role: edu.degree || 'Education', company: edu.school })}
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z" />
                              </svg>
                              <span className="font-medium">{edu.skills.slice(0, 3).join(', ')}</span>
                              {edu.skills.length > 3 && <span className="text-gray-500">and +{edu.skills.length - 3} skills</span>}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">No education entries yet. Add one so it persists on your public profile.</p>
              )}

              {educations.length > 2 && (
                <button onClick={() => setShowAllEdu((current) => !current)} className="mt-4 text-sm text-blue-600 hover:underline w-full text-center">
                  {showAllEdu ? 'Show less' : `Show ${educations.length - 2} more educations`}
                </button>
              )}
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900">Skills</h3>
                <EditBtn onClick={() => openModal('skills', { skills })} ariaLabel="Edit skills section" />
              </div>
              {skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <span key={skill} className="bg-orange-50 text-orange-600 border border-orange-200 text-sm rounded px-3 py-1">
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">Add skills to make your public profile more useful in search and messaging.</p>
              )}
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900">Portfolio</h3>
                <EditBtn onClick={() => openModal('socials', { ...socials })} ariaLabel="Edit portfolio link" />
              </div>
              {portfolioUrl ? (
                <a
                  href={portfolioUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-xl border border-gray-200 p-4 hover:border-blue-200 hover:shadow-sm transition"
                >
                  <p className="text-sm font-semibold text-gray-900">Portfolio Website</p>
                  <p className="text-sm text-blue-600 mt-1 break-all">{socials.website}</p>
                  <p className="text-xs text-gray-400 mt-2">Clickable and accessible from your profile and public views.</p>
                </a>
              ) : (
                <p className="text-sm text-gray-400">Add a website or portfolio URL to make it visible on your profile.</p>
              )}
            </div>
          </div>

          <div className="space-y-5">
            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900 text-sm">Additional Details</h3>
                <EditBtn onClick={() => openModal('details', { ...details })} ariaLabel="Edit additional details" />
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">✉️ Email</p>
                  <p className="text-sm text-gray-700 break-all">{details.email || 'Not available'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">📞 Phone</p>
                  <p className="text-sm text-gray-700">{details.phone || 'Add your phone number'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">🌐 Languages</p>
                  <p className="text-sm text-gray-700">{details.languages || 'Add your spoken languages'}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900 text-sm">Social Links</h3>
                <EditBtn onClick={() => openModal('socials', { ...socials })} ariaLabel="Edit social links" />
              </div>
              <div className="space-y-2.5">
                {socialRows.map((row) => {
                  const href = normalizeExternalUrl(row.value);
                  return (
                    <div key={row.label}>
                      <p className="text-xs text-gray-400 mb-0.5">{row.icon} {row.label}</p>
                      {href ? (
                        <a href={href} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline break-all">
                          {row.value}
                        </a>
                      ) : (
                        <p className="text-sm text-gray-400">Not added yet</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <h3 className="font-semibold text-gray-900 text-sm mb-3">Profile Completeness</h3>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">{completenessPercent}% complete</span>
                <span className="text-xs text-blue-600 font-medium">
                  {remainingItems.length === 0 ? 'All key items added' : `${remainingItems.length} item${remainingItems.length === 1 ? '' : 's'} left`}
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 mb-3">
                <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${completenessPercent}%` }} />
              </div>
              <div className="space-y-1.5">
                {completenessChecks.map((item) => (
                  <div key={item.label} className="flex items-center gap-2 text-xs">
                    <span className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 text-xs ${
                      item.complete ? 'border-green-400 text-green-600 bg-green-50' : 'border-gray-300 text-gray-300'
                    }`}>
                      {item.complete ? '✓' : '○'}
                    </span>
                    <span className={item.complete ? 'text-green-700' : 'text-gray-500'}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      )}

      {modal === 'profile' && (
        <Modal title="Edit Profile" onClose={closeModal}>
          <Field label="Full Name" value={tmp.name || ''} onChange={(value) => setTmp((current) => ({ ...current, name: value }))} />
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Job Title</label>
            <input
              type="text"
              list="experience-title-options"
              value={tmp.title || ''}
              onChange={(event) => setTmp((current) => ({ ...current, title: event.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
              placeholder="Select or type a title"
            />
            <datalist id="experience-title-options">
              {EXPERIENCE_TITLE_OPTIONS.map((title) => (
                <option key={title} value={title} />
              ))}
            </datalist>
          </div>
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Company</label>
            <input
              type="text"
              list="experience-company-options"
              value={tmp.company || ''}
              onChange={(event) => setTmp((current) => ({ ...current, company: event.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
              placeholder="Select or type a company"
            />
            <datalist id="experience-company-options">
              {EXPERIENCE_COMPANY_OPTIONS.map((company) => (
                <option key={company} value={company} />
              ))}
            </datalist>
          </div>
          <Field label="Location" value={tmp.location || ''} onChange={(value) => setTmp((current) => ({ ...current, location: value }))} />
          <div className="flex justify-end gap-3 mt-2">
            <button onClick={closeModal} className="border border-gray-300 text-gray-600 text-sm px-4 py-2 rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button onClick={saveProfile} disabled={isProfileSaveDisabled} className="bg-blue-600 text-white text-sm px-5 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60">
              {submitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </Modal>
      )}

      {modal === 'about' && (
        <Modal title="Edit about" onClose={closeModal}>
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-700 mb-1">About</label>
            <textarea
              rows={6}
              value={tmp.about || ''}
              onChange={(e) => {
                const value = e.target.value;
                if (value.length <= 2800) {
                  setTmp((current) => ({ ...current, about: value }));
                }
              }}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 resize-none"
              maxLength={2800}
            />
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-gray-400">
                <span className="text-yellow-500">✨</span> Get AI suggestions with Premium
              </span>
              <span className="text-xs text-gray-400">{(tmp.about || '').length}/2,800</span>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Skills</h4>
            <p className="text-xs text-gray-600 mb-3">Show your top skills — add up to 5 skills you want to be known for. They'll also appear in your Skills section.</p>
            
            {tmpSkills.length > 0 && (
              <div className="space-y-2 mb-3">
                {tmpSkills.map((skill, index) => (
                  <div 
                    key={index} 
                    onDragOver={(e) => handleSkillDragOver(e, index)}
                    className={`flex items-center gap-3 py-2 ${draggedSkillIndex === index ? 'opacity-50' : ''}`}
                  >
                    <button
                      type="button"
                      onClick={() => setTmpSkills(tmpSkills.filter((_, i) => i !== index))}
                      className="text-gray-500 hover:text-gray-700 text-xl leading-none"
                    >
                      ×
                    </button>
                    <span className="flex-1 text-sm text-gray-900">{skill}</span>
                    <button
                      type="button"
                      draggable
                      onDragStart={() => handleSkillDragStart(index)}
                      onDragEnd={handleSkillDragEnd}
                      className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
                    >
                      ☰
                    </button>
                  </div>
                ))}
              </div>
            )}

            {tmpSkills.length < 5 && (
              <div className="mb-3">
                <div className="relative">
                  <input
                    ref={skillInputRef}
                    type="text"
                    value={newSkill}
                    onChange={(e) => handleSkillInputChange(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && newSkill.trim()) {
                        e.preventDefault();
                        addSkill(newSkill);
                      }
                    }}
                    onFocus={() => {
                      if (newSkill.trim()) {
                        updateSkillSuggestions(newSkill);
                      }
                    }}
                    onBlur={() => setTimeout(() => setShowSkillDropdown(false), 200)}
                    placeholder="Skill (ex: Project Management)"
                    className="w-full border-2 border-blue-500 rounded px-3 py-2 text-sm outline-none focus:border-blue-600"
                  />
                  {showSkillDropdown && skillSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {skillSuggestions.map((skill, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => addSkill(skill)}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 border-b border-gray-100 last:border-0"
                        >
                          {skill}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {tmpSkills.length < 5 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="text-sm font-semibold text-gray-900">Suggested based on your profile</h5>
                  <button
                    type="button"
                    onClick={() => {
                      setSkillSuggestions([]);
                      setShowSkillDropdown(false);
                    }}
                    className="text-gray-500 hover:text-gray-700 text-xl leading-none"
                  >
                    ×
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {commonSkills
                    .filter(skill => !tmpSkills.includes(skill))
                    .slice(0, 6)
                    .map((skill, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => {
                          if (tmpSkills.length < 5) {
                            setTmpSkills([...tmpSkills, skill]);
                          }
                        }}
                        className="inline-flex items-center gap-1 bg-white border border-gray-300 text-gray-700 text-sm px-3 py-2 rounded-full hover:bg-gray-100"
                      >
                        {skill}
                        <span className="text-blue-600 text-lg leading-none">+</span>
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-2">
            <button onClick={closeModal} className="border border-gray-300 text-gray-600 text-sm px-6 py-2 rounded-full hover:bg-gray-50">
              Cancel
            </button>
            <button onClick={saveAbout} disabled={isAboutSaveDisabled} className="bg-blue-600 text-white text-sm font-semibold px-6 py-2 rounded-full hover:bg-blue-700 disabled:opacity-60">
              Save
            </button>
          </div>
        </Modal>
      )}

      {modal === 'details' && (
        <Modal title="Edit Additional Details" onClose={closeModal}>
          <Field
            label="Email"
            value={tmp.email || ''}
            onChange={(value) => setTmp((current) => ({ ...current, email: value }))}
            type="email"
            readOnly
          />
          <Field label="Phone" value={tmp.phone || ''} onChange={(value) => setTmp((current) => ({ ...current, phone: value }))} />
          <Field label="Languages" value={tmp.languages || ''} onChange={(value) => setTmp((current) => ({ ...current, languages: value }))} />
          <p className="text-xs text-gray-400 mb-4">Account email is managed separately and remains stored on your user account.</p>
          <div className="flex justify-end gap-3 mt-2">
            <button onClick={closeModal} className="border border-gray-300 text-gray-600 text-sm px-4 py-2 rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button onClick={saveDetails} disabled={submitting} className="bg-blue-600 text-white text-sm px-5 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60">
              {submitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </Modal>
      )}

      {modal === 'socials' && (
        <Modal title="Edit Social Links" onClose={closeModal}>
          <Field label="Instagram" value={tmp.instagram || ''} onChange={(value) => setTmp((current) => ({ ...current, instagram: value }))} />
          <Field label="Twitter" value={tmp.twitter || ''} onChange={(value) => setTmp((current) => ({ ...current, twitter: value }))} />
          <Field label="Website" value={tmp.website || ''} onChange={(value) => setTmp((current) => ({ ...current, website: value }))} />
          <div className="flex justify-end gap-3 mt-2">
            <button onClick={closeModal} className="border border-gray-300 text-gray-600 text-sm px-4 py-2 rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button onClick={saveSocials} disabled={submitting} className="bg-blue-600 text-white text-sm px-5 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60">
              {submitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </Modal>
      )}

      {modal === 'skills' && (
        <Modal title="Edit Skills" onClose={closeModal}>
          <div className="mb-6">
            <p className="text-xs text-gray-600 mb-3">Start typing a skill to see matching options. Add up to 5 skills.</p>

            {tmpSkills.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {tmpSkills.map((skill, index) => (
                  <span key={index} className="inline-flex items-center gap-1 bg-orange-50 text-orange-700 text-xs px-3 py-1 rounded-full border border-orange-200">
                    {skill}
                    <button
                      type="button"
                      onClick={() => setTmpSkills(tmpSkills.filter((_, currentIndex) => currentIndex !== index))}
                      className="text-orange-500 hover:text-orange-700 ml-1"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            {tmpSkills.length < 5 && (
              <div className="relative">
                <input
                  ref={skillInputRef}
                  type="text"
                  value={newSkill}
                  onChange={(e) => handleSkillInputChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addSkill(newSkill);
                    }
                  }}
                  onFocus={() => {
                    if (newSkill.trim()) {
                      updateSkillSuggestions(newSkill);
                    }
                  }}
                  onBlur={() => setTimeout(() => setShowSkillDropdown(false), 200)}
                  placeholder="Type a skill or initials"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
                />
                {showSkillDropdown && skillSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {skillSuggestions.map((skill, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => addSkill(skill)}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 border-b border-gray-100 last:border-0"
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3 mt-2">
            <button onClick={closeModal} className="border border-gray-300 text-gray-600 text-sm px-4 py-2 rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button onClick={saveSkills} disabled={isSkillsSaveDisabled} className="bg-blue-600 text-white text-sm px-5 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60">
              {submitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </Modal>
      )}

      {(!parentModal && !isExperiencePage && (modal?.startsWith('exp-') || modal === 'add-exp')) && (
        <Modal title={modal === 'add-exp' ? 'Add experience' : 'Edit experience'} onClose={closeModal}>
          {/* Notify Network Section */}
          <div className="mb-6 bg-gray-50 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-gray-900 mb-1">Notify network</h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Turn on to notify your network of key profile changes (such as new job) and work anniversaries. 
                  Updates can take up to 2 hours. <a href="https://www.linkedin.com/help/linkedin/answer/a549047" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Learn more about sharing profile changes</a>.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTmp((current) => ({ ...current, notifyNetwork: !current.notifyNetwork }))}
                className={`ml-4 relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  tmp.notifyNetwork ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    tmp.notifyNetwork ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          <p className="text-xs text-gray-500 mb-4">* Indicates required</p>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Title*</label>
            <input
              type="text"
              list="experience-title-options-regular"
              value={tmp.role || ''}
              onChange={(event) => handleExperienceRoleChange(event.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
              placeholder="Select or type a title"
            />
            <datalist id="experience-title-options-regular">
              {EXPERIENCE_TITLE_OPTIONS.map((title) => (
                <option key={title} value={title} />
              ))}
            </datalist>
          </div>
          
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-700 mb-1">Employment type</label>
            <select
              value={tmp.type || ''}
              onChange={(e) => setTmp((current) => ({ ...current, type: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
            >
              <option value="">Please select</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Self-employed">Self-employed</option>
              <option value="Freelance">Freelance</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
              <option value="Apprenticeship">Apprenticeship</option>
              <option value="Seasonal">Seasonal</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Company or organization*</label>
            <input
              type="text"
              list="experience-company-options-regular"
              value={tmp.company || ''}
              onChange={(event) => handleExperienceCompanyChange(event.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
              placeholder="Select or type a company"
            />
            <datalist id="experience-company-options-regular">
              {EXPERIENCE_COMPANY_OPTIONS.map((company) => (
                <option key={company} value={company} />
              ))}
            </datalist>
          </div>
          
          <div className="mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={tmp.currentlyWorking || false}
                onChange={(e) => setTmp((current) => ({ ...current, currentlyWorking: e.target.checked, end: e.target.checked ? '' : current.end }))}
                className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="text-sm font-medium text-gray-900">I am currently working in this role</span>
            </label>
          </div>

          {tmp.currentlyWorking && (
            <div className="mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={tmp.endCurrentPosition || false}
                  onChange={(e) => setTmp((current) => ({ ...current, endCurrentPosition: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300 text-gray-600 focus:ring-gray-500"
                />
                <span className="text-sm text-gray-700">End current position now</span>
              </label>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-700 mb-1">Start date</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Month*</label>
                <select
                  value={tmp.startMonth || ''}
                  onChange={(e) => setTmp((current) => ({ ...current, startMonth: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
                >
                  <option value="">Month</option>
                  <option value="January">January</option>
                  <option value="February">February</option>
                  <option value="March">March</option>
                  <option value="April">April</option>
                  <option value="May">May</option>
                  <option value="June">June</option>
                  <option value="July">July</option>
                  <option value="August">August</option>
                  <option value="September">September</option>
                  <option value="October">October</option>
                  <option value="November">November</option>
                  <option value="December">December</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Year*</label>
                <select
                  value={tmp.startYear || ''}
                  onChange={(e) => setTmp((current) => ({ ...current, startYear: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
                >
                  <option value="">Year</option>
                  {Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {!tmp.currentlyWorking && (
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-700 mb-1">End date</label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Month*</label>
                  <select
                    value={tmp.endMonth || ''}
                    onChange={(e) => setTmp((current) => ({ ...current, endMonth: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
                  >
                    <option value="">Month</option>
                    <option value="January">January</option>
                    <option value="February">February</option>
                    <option value="March">March</option>
                    <option value="April">April</option>
                    <option value="May">May</option>
                    <option value="June">June</option>
                    <option value="July">July</option>
                    <option value="August">August</option>
                    <option value="September">September</option>
                    <option value="October">October</option>
                    <option value="November">November</option>
                    <option value="December">December</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Year*</label>
                  <select
                    value={tmp.endYear || ''}
                    onChange={(e) => setTmp((current) => ({ ...current, endYear: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
                  >
                    <option value="">Year</option>
                    {Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-700 mb-1">Location</label>
            <div className="relative">
              <input
                ref={locationInputRef}
                type="text"
                value={tmp.location || ''}
                onChange={(e) => handleLocationInputChange(e.target.value)}
                onFocus={() => {
                  if (tmp.location && tmp.location.trim()) {
                    const filtered = commonLocations.filter(location => 
                      location.toLowerCase().includes(tmp.location.toLowerCase())
                    );
                    setLocationSuggestions(filtered.slice(0, 10));
                    setShowLocationDropdown(filtered.length > 0);
                  }
                }}
                onBlur={() => setTimeout(() => setShowLocationDropdown(false), 200)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
                placeholder="City, state, or country"
              />
              {showLocationDropdown && locationSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {locationSuggestions.map((location, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => selectLocation(location)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 border-b border-gray-100 last:border-0"
                    >
                      {location}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-700 mb-1">Location type</label>
            <select
              value={tmp.locationType || ''}
              onChange={(e) => setTmp((current) => ({ ...current, locationType: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
            >
              <option value="">Please select</option>
              <option value="On-site">On-site</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Remote">Remote</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">Pick a location type (ex: remote)</p>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
            <textarea
              rows={4}
              value={tmp.desc || ''}
              onChange={(e) => {
                const value = e.target.value;
                if (value.length <= 2000) {
                  setTmp((current) => ({ ...current, desc: value }));
                }
              }}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 resize-none"
              maxLength={2000}
            />
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-gray-400">
                <span className="text-yellow-500">✨</span> Get AI suggestions with Premium
              </span>
              <span className="text-xs text-gray-400">{(tmp.desc || '').length}/2,000</span>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-700 mb-1">Profile headline</label>
            <input
              type="text"
              value={tmp.headline || ''}
              onChange={(e) => {
                const value = e.target.value;
                if (value.length <= 220) {
                  setTmp((current) => ({ ...current, headline: value }));
                }
              }}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
              placeholder="Example: Your role | Specialty | Key skills"
              maxLength={220}
            />
            <p className="text-xs text-gray-500 mt-1">Appears below your name at the top of your profile.</p>
            <div className="text-right">
              <span className="text-xs text-gray-400">{(tmp.headline || '').length}/220</span>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-700 mb-1">Where did you find the job?</label>
            <select
              value={tmp.jobSource || ''}
              onChange={(e) => setTmp((current) => ({ ...current, jobSource: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
            >
              <option value="">Please select</option>
              <option value="JobHuntly">JobHuntly</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="Company website">Company website</option>
              <option value="Referral">Referral</option>
              <option value="Job board">Job board</option>
              <option value="Recruiter">Recruiter</option>
              <option value="Other">Other</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">This information will be used to improve job search experience.</p>
          </div>

          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Skills</h4>
            <p className="text-xs text-gray-600 mb-3">We recommend adding your top 5 used in this role. They'll also appear in your Skills section.</p>
            
            {tmpSkills.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {tmpSkills.map((skill, index) => (
                  <span key={index} className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full border border-blue-200">
                    {skill}
                    <button
                      type="button"
                      onClick={() => setTmpSkills(tmpSkills.filter((_, i) => i !== index))}
                      className="text-blue-500 hover:text-blue-700 ml-1"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="flex gap-2 relative">
              <div className="flex-1 relative">
                <input
                  ref={skillInputRef}
                  type="text"
                  value={newSkill}
                  onChange={(e) => handleSkillInputChange(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addSkill(newSkill);
                    }
                  }}
                    onFocus={() => {
                      if (newSkill.trim()) {
                        updateSkillSuggestions(newSkill);
                      }
                    }}
                  onBlur={() => setTimeout(() => setShowSkillDropdown(false), 200)}
                  placeholder="Type a skill and press Enter"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
                />
                {showSkillDropdown && skillSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {skillSuggestions.map((skill, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => addSkill(skill)}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 border-b border-gray-100 last:border-0"
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => addSkill(newSkill)}
                className="flex items-center gap-1 text-sm text-blue-600 border border-blue-600 rounded-lg px-4 py-2 hover:bg-blue-50 transition"
              >
                <span className="text-lg leading-none">+</span>
                Add
              </button>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Media</h4>
            <p className="text-xs text-gray-600 mb-3">
              Add media like images, documents, sites or presentations (up to 50). <a href="https://www.linkedin.com/help/linkedin/answer/a566952" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Learn more about media file types supported</a>
            </p>
            
            {mediaFiles.length > 0 && (
              <div className="mb-3 space-y-2">
                {mediaFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-lg">📎</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeMediaFile(index)}
                      className="text-red-500 hover:text-red-700 ml-2"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => mediaInputRef.current?.click()}
              disabled={uploadingMedia}
              className={`flex items-center gap-1 text-sm border rounded-full px-4 py-1.5 transition ${
                uploadingMedia 
                  ? 'text-gray-400 border-gray-300 cursor-not-allowed' 
                  : 'text-blue-600 border-blue-600 hover:bg-blue-50'
              }`}
            >
              <span className="text-lg leading-none">+</span>
              {uploadingMedia ? 'Uploading...' : 'Add media'}
            </button>
            <input
              ref={mediaInputRef}
              type="file"
              accept="image/*,video/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt"
              multiple
              className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                if (files.length > 0) {
                  handleMediaUpload(files);
                }
                e.target.value = '';
              }}
            />
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-gray-100">
            {modal !== 'add-exp' && (
              <button 
                onClick={() => deleteExp(tmp.id)} 
                disabled={submitting}
                className="text-sm text-red-500 hover:text-red-700 hover:underline disabled:opacity-60"
              >
                Delete experience
              </button>
            )}
            <div className={`flex gap-3 ${modal === 'add-exp' ? 'ml-auto' : ''}`}>
              <button onClick={closeModal} className="border border-gray-300 text-gray-600 text-sm px-4 py-2 rounded-lg hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={saveExp} disabled={isExperienceSaveDisabled} className="bg-blue-600 text-white text-sm font-semibold px-6 py-2 rounded-full hover:bg-blue-700 disabled:opacity-60">
                {submitting ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {((parentModal === 'edit-all-exp' || isExperiencePage) && (modal?.startsWith('exp-') || modal === 'add-exp')) && (
        <Modal title={modal === 'add-exp' ? 'Add experience' : 'Edit experience'} onClose={closeModal}>
          {/* Notify Network Section */}
          <div className="mb-6 bg-gray-50 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-gray-900 mb-1">Notify network</h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Turn on to notify your network of key profile changes (such as new job) and work anniversaries. 
                  Updates can take up to 2 hours. <a href="https://www.linkedin.com/help/linkedin/answer/a549047" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Learn more about sharing profile changes</a>.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTmp((current) => ({ ...current, notifyNetwork: !current.notifyNetwork }))}
                className={`ml-4 relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  tmp.notifyNetwork ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    tmp.notifyNetwork ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          <p className="text-xs text-gray-500 mb-4">* Indicates required</p>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Title*</label>
            <input
              type="text"
              list="experience-title-options"
              value={tmp.role || ''}
              onChange={(event) => handleExperienceRoleChange(event.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
              placeholder="Select or type a title"
            />
            <datalist id="experience-title-options">
              {EXPERIENCE_TITLE_OPTIONS.map((title) => (
                <option key={title} value={title} />
              ))}
            </datalist>
          </div>
          
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-700 mb-1">Employment type</label>
            <select
              value={tmp.type || ''}
              onChange={(e) => setTmp((current) => ({ ...current, type: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
            >
              <option value="">Please select</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Self-employed">Self-employed</option>
              <option value="Freelance">Freelance</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
              <option value="Apprenticeship">Apprenticeship</option>
              <option value="Seasonal">Seasonal</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Company or organization*</label>
            <input
              type="text"
              list="experience-company-options"
              value={tmp.company || ''}
              onChange={(event) => handleExperienceCompanyChange(event.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
              placeholder="Select or type a company"
            />
            <datalist id="experience-company-options">
              {EXPERIENCE_COMPANY_OPTIONS.map((company) => (
                <option key={company} value={company} />
              ))}
            </datalist>
          </div>
          
          <div className="mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={tmp.currentlyWorking || false}
                onChange={(e) => setTmp((current) => ({ ...current, currentlyWorking: e.target.checked, end: e.target.checked ? '' : current.end }))}
                className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="text-sm font-medium text-gray-900">I am currently working in this role</span>
            </label>
          </div>

          {tmp.currentlyWorking && (
            <div className="mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={tmp.endCurrentPosition || false}
                  onChange={(e) => setTmp((current) => ({ ...current, endCurrentPosition: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300 text-gray-600 focus:ring-gray-500"
                />
                <span className="text-sm text-gray-700">End current position now</span>
              </label>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-700 mb-1">Start date</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Month*</label>
                <select
                  value={tmp.startMonth || ''}
                  onChange={(e) => setTmp((current) => ({ ...current, startMonth: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
                >
                  <option value="">Month</option>
                  <option value="January">January</option>
                  <option value="February">February</option>
                  <option value="March">March</option>
                  <option value="April">April</option>
                  <option value="May">May</option>
                  <option value="June">June</option>
                  <option value="July">July</option>
                  <option value="August">August</option>
                  <option value="September">September</option>
                  <option value="October">October</option>
                  <option value="November">November</option>
                  <option value="December">December</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Year*</label>
                <select
                  value={tmp.startYear || ''}
                  onChange={(e) => setTmp((current) => ({ ...current, startYear: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
                >
                  <option value="">Year</option>
                  {Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {!tmp.currentlyWorking && (
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-700 mb-1">End date</label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Month*</label>
                  <select
                    value={tmp.endMonth || ''}
                    onChange={(e) => setTmp((current) => ({ ...current, endMonth: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
                  >
                    <option value="">Month</option>
                    <option value="January">January</option>
                    <option value="February">February</option>
                    <option value="March">March</option>
                    <option value="April">April</option>
                    <option value="May">May</option>
                    <option value="June">June</option>
                    <option value="July">July</option>
                    <option value="August">August</option>
                    <option value="September">September</option>
                    <option value="October">October</option>
                    <option value="November">November</option>
                    <option value="December">December</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Year*</label>
                  <select
                    value={tmp.endYear || ''}
                    onChange={(e) => setTmp((current) => ({ ...current, endYear: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
                  >
                    <option value="">Year</option>
                    {Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-700 mb-1">Location</label>
            <div className="relative">
              <input
                ref={locationInputRef}
                type="text"
                value={tmp.location || ''}
                onChange={(e) => handleLocationInputChange(e.target.value)}
                onFocus={() => {
                  if (tmp.location && tmp.location.trim()) {
                    const filtered = commonLocations.filter(location => 
                      location.toLowerCase().includes(tmp.location.toLowerCase())
                    );
                    setLocationSuggestions(filtered.slice(0, 10));
                    setShowLocationDropdown(filtered.length > 0);
                  }
                }}
                onBlur={() => setTimeout(() => setShowLocationDropdown(false), 200)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
                placeholder="City, state, or country"
              />
              {showLocationDropdown && locationSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {locationSuggestions.map((location, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => selectLocation(location)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 border-b border-gray-100 last:border-0"
                    >
                      {location}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-700 mb-1">Location type</label>
            <select
              value={tmp.locationType || ''}
              onChange={(e) => setTmp((current) => ({ ...current, locationType: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
            >
              <option value="">Please select</option>
              <option value="On-site">On-site</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Remote">Remote</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">Pick a location type (ex: remote)</p>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
            <textarea
              rows={4}
              value={tmp.desc || ''}
              onChange={(e) => {
                const value = e.target.value;
                if (value.length <= 2000) {
                  setTmp((current) => ({ ...current, desc: value }));
                }
              }}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 resize-none"
              maxLength={2000}
            />
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-gray-400">
                <span className="text-yellow-500">✨</span> Get AI suggestions with Premium
              </span>
              <span className="text-xs text-gray-400">{(tmp.desc || '').length}/2,000</span>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-700 mb-1">Profile headline</label>
            <input
              type="text"
              value={tmp.headline || ''}
              onChange={(e) => {
                const value = e.target.value;
                if (value.length <= 220) {
                  setTmp((current) => ({ ...current, headline: value }));
                }
              }}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
              placeholder="Example: Your role | Specialty | Key skills"
              maxLength={220}
            />
            <p className="text-xs text-gray-500 mt-1">Appears below your name at the top of your profile.</p>
            <div className="text-right">
              <span className="text-xs text-gray-400">{(tmp.headline || '').length}/220</span>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-700 mb-1">Where did you find the job?</label>
            <select
              value={tmp.jobSource || ''}
              onChange={(e) => setTmp((current) => ({ ...current, jobSource: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
            >
              <option value="">Please select</option>
              <option value="JobHuntly">JobHuntly</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="Company website">Company website</option>
              <option value="Referral">Referral</option>
              <option value="Job board">Job board</option>
              <option value="Recruiter">Recruiter</option>
              <option value="Other">Other</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">This information will be used to improve job search experience.</p>
          </div>

          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Skills</h4>
            <p className="text-xs text-gray-600 mb-3">We recommend adding your top 5 used in this role. They'll also appear in your Skills section.</p>
            
            {tmpSkills.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {tmpSkills.map((skill, index) => (
                  <span key={index} className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full border border-blue-200">
                    {skill}
                    <button
                      type="button"
                      onClick={() => setTmpSkills(tmpSkills.filter((_, i) => i !== index))}
                      className="text-blue-500 hover:text-blue-700 ml-1"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="flex gap-2 relative">
              <div className="flex-1 relative">
                <input
                  ref={skillInputRef}
                  type="text"
                  value={newSkill}
                  onChange={(e) => handleSkillInputChange(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addSkill(newSkill);
                    }
                  }}
                    onFocus={() => {
                      if (newSkill.trim()) {
                        updateSkillSuggestions(newSkill);
                      }
                    }}
                  onBlur={() => setTimeout(() => setShowSkillDropdown(false), 200)}
                  placeholder="Type a skill and press Enter"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
                />
                {showSkillDropdown && skillSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {skillSuggestions.map((skill, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => addSkill(skill)}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 border-b border-gray-100 last:border-0"
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => addSkill(newSkill)}
                className="flex items-center gap-1 text-sm text-blue-600 border border-blue-600 rounded-lg px-4 py-2 hover:bg-blue-50 transition"
              >
                <span className="text-lg leading-none">+</span>
                Add
              </button>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Media</h4>
            <p className="text-xs text-gray-600 mb-3">
              Add media like images, documents, sites or presentations (up to 50). <a href="https://www.linkedin.com/help/linkedin/answer/a566952" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Learn more about media file types supported</a>
            </p>
            
            {mediaFiles.length > 0 && (
              <div className="mb-3 space-y-2">
                {mediaFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-lg">📎</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeMediaFile(index)}
                      className="text-red-500 hover:text-red-700 ml-2"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => mediaInputRef.current?.click()}
              disabled={uploadingMedia}
              className={`flex items-center gap-1 text-sm border rounded-full px-4 py-1.5 transition ${
                uploadingMedia 
                  ? 'text-gray-400 border-gray-300 cursor-not-allowed' 
                  : 'text-blue-600 border-blue-600 hover:bg-blue-50'
              }`}
            >
              <span className="text-lg leading-none">+</span>
              {uploadingMedia ? 'Uploading...' : 'Add media'}
            </button>
            <input
              ref={mediaInputRef}
              type="file"
              accept="image/*,video/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt"
              multiple
              className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                if (files.length > 0) {
                  handleMediaUpload(files);
                }
                e.target.value = '';
              }}
            />
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-gray-100">
            {modal !== 'add-exp' && (
              <button 
                onClick={() => deleteExp(tmp.id)} 
                disabled={submitting}
                className="text-sm text-red-500 hover:text-red-700 hover:underline disabled:opacity-60"
              >
                Delete experience
              </button>
            )}
            <div className={`flex gap-3 ${modal === 'add-exp' ? 'ml-auto' : ''}`}>
              <button onClick={closeModal} className="border border-gray-300 text-gray-600 text-sm px-4 py-2 rounded-lg hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={saveExp} disabled={isExperienceSaveDisabled} className="bg-blue-600 text-white text-sm font-semibold px-6 py-2 rounded-full hover:bg-blue-700 disabled:opacity-60">
                {submitting ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {(parentModal === 'edit-all-edu' && (modal?.startsWith('edu-') || modal === 'add-edu')) && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40" onClick={closeModal}>
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">{modal === 'add-edu' ? 'Add education' : 'Edit education'}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 text-xl leading-none">
                ×
              </button>
            </div>
            <div className="px-6 py-5">
          {/* Notify Network Section */}
          <div className="mb-6 bg-gray-50 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-gray-900 mb-1">Notify network</h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Turn on to notify your network of key profile changes (such as new education) and work anniversaries. 
                  Updates can take up to 2 hours. <a href="https://www.linkedin.com/help/linkedin/answer/a549047" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Learn more about sharing profile changes</a>.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTmp((current) => ({ ...current, notifyNetwork: !current.notifyNetwork }))}
                className={`ml-4 relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  tmp.notifyNetwork ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    tmp.notifyNetwork ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          <p className="text-xs text-gray-500 mb-4">* Indicates required</p>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-700 mb-1">School*</label>
            <div className="relative">
              <input
                ref={schoolInputRef}
                type="text"
                value={tmp.school || ''}
                onChange={(e) => handleSchoolInputChange(e.target.value)}
                onFocus={() => {
                  if (tmp.school && tmp.school.trim()) {
                    const filtered = commonSchools.filter(school => 
                      school.toLowerCase().includes(tmp.school.toLowerCase())
                    );
                    setSchoolSuggestions(filtered.slice(0, 10));
                    setShowSchoolDropdown(filtered.length > 0);
                  }
                }}
                onBlur={() => setTimeout(() => setShowSchoolDropdown(false), 200)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
                placeholder="Ex: Harvard University"
              />
              {showSchoolDropdown && schoolSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {schoolSuggestions.map((school, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => selectSchool(school)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 border-b border-gray-100 last:border-0"
                    >
                      {school}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-700 mb-1">Degree</label>
            <div className="relative">
              <input
                ref={degreeInputRef}
                type="text"
                value={tmp.degree || ''}
                onChange={(e) => handleDegreeInputChange(e.target.value)}
                onFocus={() => {
                  if (tmp.degree && tmp.degree.trim()) {
                    const filtered = commonDegrees.filter(degree => 
                      degree.toLowerCase().includes(tmp.degree.toLowerCase())
                    );
                    setDegreeSuggestions(filtered.slice(0, 10));
                    setShowDegreeDropdown(filtered.length > 0);
                  }
                }}
                onBlur={() => setTimeout(() => setShowDegreeDropdown(false), 200)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
                placeholder="Ex: Bachelor of Science"
              />
              {showDegreeDropdown && degreeSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {degreeSuggestions.map((degree, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => selectDegree(degree)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 border-b border-gray-100 last:border-0"
                    >
                      {degree}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-700 mb-1">Field of study</label>
            <div className="relative">
              <input
                ref={fieldOfStudyInputRef}
                type="text"
                value={tmp.fieldOfStudy || ''}
                onChange={(e) => handleFieldOfStudyInputChange(e.target.value)}
                onFocus={() => {
                  if (tmp.fieldOfStudy && tmp.fieldOfStudy.trim()) {
                    const filtered = commonFieldsOfStudy.filter(field => 
                      field.toLowerCase().includes(tmp.fieldOfStudy.toLowerCase())
                    );
                    setFieldOfStudySuggestions(filtered.slice(0, 10));
                    setShowFieldOfStudyDropdown(filtered.length > 0);
                  }
                }}
                onBlur={() => setTimeout(() => setShowFieldOfStudyDropdown(false), 200)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
                placeholder="Ex: Computer Science"
              />
              {showFieldOfStudyDropdown && fieldOfStudySuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {fieldOfStudySuggestions.map((field, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => selectFieldOfStudy(field)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 border-b border-gray-100 last:border-0"
                    >
                      {field}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-700 mb-1">Start date</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Month</label>
                <select
                  value={tmp.startMonth || ''}
                  onChange={(e) => setTmp((current) => ({ ...current, startMonth: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
                >
                  <option value="">Month</option>
                  <option value="January">January</option>
                  <option value="February">February</option>
                  <option value="March">March</option>
                  <option value="April">April</option>
                  <option value="May">May</option>
                  <option value="June">June</option>
                  <option value="July">July</option>
                  <option value="August">August</option>
                  <option value="September">September</option>
                  <option value="October">October</option>
                  <option value="November">November</option>
                  <option value="December">December</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Year</label>
                <select
                  value={tmp.startYear || ''}
                  onChange={(e) => setTmp((current) => ({ ...current, startYear: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
                >
                  <option value="">Year</option>
                  {Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-700 mb-1">End date (or expected)</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Month</label>
                <select
                  value={tmp.endMonth || ''}
                  onChange={(e) => setTmp((current) => ({ ...current, endMonth: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
                >
                  <option value="">Month</option>
                  <option value="January">January</option>
                  <option value="February">February</option>
                  <option value="March">March</option>
                  <option value="April">April</option>
                  <option value="May">May</option>
                  <option value="June">June</option>
                  <option value="July">July</option>
                  <option value="August">August</option>
                  <option value="September">September</option>
                  <option value="October">October</option>
                  <option value="November">November</option>
                  <option value="December">December</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Year</label>
                <select
                  value={tmp.endYear || ''}
                  onChange={(e) => setTmp((current) => ({ ...current, endYear: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
                >
                  <option value="">Year</option>
                  {Array.from({ length: 50 }, (_, i) => new Date().getFullYear() + 10 - i).map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-700 mb-1">Grade</label>
            <input
              type="text"
              value={tmp.grade || ''}
              onChange={(e) => {
                const value = e.target.value;
                if (value.length <= 80) {
                  setTmp((current) => ({ ...current, grade: value }));
                }
              }}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
              maxLength={80}
            />
            <div className="text-right">
              <span className="text-xs text-gray-400">{(tmp.grade || '').length}/80</span>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-700 mb-1">Activities and societies</label>
            <textarea
              rows={3}
              value={tmp.activities || ''}
              onChange={(e) => {
                const value = e.target.value;
                if (value.length <= 500) {
                  setTmp((current) => ({ ...current, activities: value }));
                }
              }}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 resize-none"
              placeholder="Ex: Alpha Phi Omega, Marching Band, Volleyball"
              maxLength={500}
            />
            <div className="text-right">
              <span className="text-xs text-gray-400">{(tmp.activities || '').length}/500</span>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
            <textarea
              rows={4}
              value={tmp.desc || ''}
              onChange={(e) => {
                const value = e.target.value;
                if (value.length <= 1000) {
                  setTmp((current) => ({ ...current, desc: value }));
                }
              }}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 resize-none"
              maxLength={1000}
            />
            <div className="text-right">
              <span className="text-xs text-gray-400">{(tmp.desc || '').length}/1,000</span>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Skills</h4>
            <p className="text-xs text-gray-600 mb-3">We recommend adding your top 5 skills from this education entry. They'll also appear in your Skills section.</p>
            
            {tmpSkills.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {tmpSkills.map((skill, index) => (
                  <span key={index} className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full border border-blue-200">
                    {skill}
                    <button
                      type="button"
                      onClick={() => setTmpSkills(tmpSkills.filter((_, i) => i !== index))}
                      className="text-blue-500 hover:text-blue-700 ml-1"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="flex gap-2 relative">
              <div className="flex-1 relative">
                <input
                  ref={skillInputRef}
                  type="text"
                  value={newSkill}
                  onChange={(e) => handleSkillInputChange(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addSkill(newSkill);
                    }
                  }}
                    onFocus={() => {
                      if (newSkill.trim()) {
                        updateSkillSuggestions(newSkill);
                      }
                    }}
                  onBlur={() => setTimeout(() => setShowSkillDropdown(false), 200)}
                  placeholder="Type a skill and press Enter"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
                />
                {showSkillDropdown && skillSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {skillSuggestions.map((skill, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => addSkill(skill)}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 border-b border-gray-100 last:border-0"
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => addSkill(newSkill)}
                className="flex items-center gap-1 text-sm text-blue-600 border border-blue-600 rounded-lg px-4 py-2 hover:bg-blue-50 transition"
              >
                <span className="text-lg leading-none">+</span>
                Add
              </button>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Media</h4>
            <p className="text-xs text-gray-600 mb-3">
              Add media like images, documents, sites or presentations (up to 50). <a href="https://www.linkedin.com/help/linkedin/answer/a566952" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Learn more about media file types supported</a>
            </p>
            
            {mediaFiles.length > 0 && (
              <div className="mb-3 space-y-2">
                {mediaFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-lg">📎</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeMediaFile(index)}
                      className="text-red-500 hover:text-red-700 ml-2"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => mediaInputRef.current?.click()}
              disabled={uploadingMedia}
              className={`flex items-center gap-1 text-sm border rounded-full px-4 py-1.5 transition ${
                uploadingMedia 
                  ? 'text-gray-400 border-gray-300 cursor-not-allowed' 
                  : 'text-blue-600 border-blue-600 hover:bg-blue-50'
              }`}
            >
              <span className="text-lg leading-none">+</span>
              {uploadingMedia ? 'Uploading...' : 'Add media'}
            </button>
            <input
              ref={mediaInputRef}
              type="file"
              accept="image/*,video/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt"
              multiple
              className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                if (files.length > 0) {
                  handleMediaUpload(files);
                }
                e.target.value = '';
              }}
            />
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-gray-100">
            {modal !== 'add-edu' && (
              <button 
                onClick={() => deleteEdu(tmp.id)} 
                disabled={submitting}
                className="text-sm text-red-500 hover:text-red-700 hover:underline disabled:opacity-60"
              >
                Delete education
              </button>
            )}
            <div className={`flex gap-3 ${modal === 'add-edu' ? 'ml-auto' : ''}`}>
              <button onClick={closeModal} className="border border-gray-300 text-gray-600 text-sm px-4 py-2 rounded-lg hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={saveEdu} disabled={isEducationSaveDisabled} className="bg-blue-600 text-white text-sm font-semibold px-6 py-2 rounded-full hover:bg-blue-700 disabled:opacity-60">
                {submitting ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
            </div>
          </div>
        </div>
      )}

      {(!parentModal && (modal?.startsWith('edu-') || modal === 'add-edu')) && (
        <Modal title={modal === 'add-edu' ? 'Add education' : 'Edit education'} onClose={closeModal}>
          {/* Notify Network Section */}
          <div className="mb-6 bg-gray-50 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-gray-900 mb-1">Notify network</h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Turn on to notify your network of key profile changes (such as new education) and work anniversaries. 
                  Updates can take up to 2 hours. <a href="https://www.linkedin.com/help/linkedin/answer/a549047" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Learn more about sharing profile changes</a>.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTmp((current) => ({ ...current, notifyNetwork: !current.notifyNetwork }))}
                className={`ml-4 relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  tmp.notifyNetwork ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    tmp.notifyNetwork ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          <p className="text-xs text-gray-500 mb-4">* Indicates required</p>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-700 mb-1">School*</label>
            <div className="relative">
              <input
                ref={schoolInputRef}
                type="text"
                value={tmp.school || ''}
                onChange={(e) => handleSchoolInputChange(e.target.value)}
                onFocus={() => {
                  if (tmp.school && tmp.school.trim()) {
                    const filtered = commonSchools.filter(school => 
                      school.toLowerCase().includes(tmp.school.toLowerCase())
                    );
                    setSchoolSuggestions(filtered.slice(0, 10));
                    setShowSchoolDropdown(filtered.length > 0);
                  }
                }}
                onBlur={() => setTimeout(() => setShowSchoolDropdown(false), 200)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
                placeholder="Ex: Harvard University"
              />
              {showSchoolDropdown && schoolSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {schoolSuggestions.map((school, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => selectSchool(school)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 border-b border-gray-100 last:border-0"
                    >
                      {school}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-700 mb-1">Degree</label>
            <div className="relative">
              <input
                ref={degreeInputRef}
                type="text"
                value={tmp.degree || ''}
                onChange={(e) => handleDegreeInputChange(e.target.value)}
                onFocus={() => {
                  if (tmp.degree && tmp.degree.trim()) {
                    const filtered = commonDegrees.filter(degree => 
                      degree.toLowerCase().includes(tmp.degree.toLowerCase())
                    );
                    setDegreeSuggestions(filtered.slice(0, 10));
                    setShowDegreeDropdown(filtered.length > 0);
                  }
                }}
                onBlur={() => setTimeout(() => setShowDegreeDropdown(false), 200)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
                placeholder="Ex: Bachelor of Science"
              />
              {showDegreeDropdown && degreeSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {degreeSuggestions.map((degree, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => selectDegree(degree)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 border-b border-gray-100 last:border-0"
                    >
                      {degree}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-700 mb-1">Field of study</label>
            <div className="relative">
              <input
                ref={fieldOfStudyInputRef}
                type="text"
                value={tmp.fieldOfStudy || ''}
                onChange={(e) => handleFieldOfStudyInputChange(e.target.value)}
                onFocus={() => {
                  if (tmp.fieldOfStudy && tmp.fieldOfStudy.trim()) {
                    const filtered = commonFieldsOfStudy.filter(field => 
                      field.toLowerCase().includes(tmp.fieldOfStudy.toLowerCase())
                    );
                    setFieldOfStudySuggestions(filtered.slice(0, 10));
                    setShowFieldOfStudyDropdown(filtered.length > 0);
                  }
                }}
                onBlur={() => setTimeout(() => setShowFieldOfStudyDropdown(false), 200)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
                placeholder="Ex: Computer Science"
              />
              {showFieldOfStudyDropdown && fieldOfStudySuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {fieldOfStudySuggestions.map((field, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => selectFieldOfStudy(field)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 border-b border-gray-100 last:border-0"
                    >
                      {field}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-700 mb-1">Start date</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Month</label>
                <select
                  value={tmp.startMonth || ''}
                  onChange={(e) => setTmp((current) => ({ ...current, startMonth: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
                >
                  <option value="">Month</option>
                  <option value="January">January</option>
                  <option value="February">February</option>
                  <option value="March">March</option>
                  <option value="April">April</option>
                  <option value="May">May</option>
                  <option value="June">June</option>
                  <option value="July">July</option>
                  <option value="August">August</option>
                  <option value="September">September</option>
                  <option value="October">October</option>
                  <option value="November">November</option>
                  <option value="December">December</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Year</label>
                <select
                  value={tmp.startYear || ''}
                  onChange={(e) => setTmp((current) => ({ ...current, startYear: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
                >
                  <option value="">Year</option>
                  {Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-700 mb-1">End date (or expected)</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Month</label>
                <select
                  value={tmp.endMonth || ''}
                  onChange={(e) => setTmp((current) => ({ ...current, endMonth: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
                >
                  <option value="">Month</option>
                  <option value="January">January</option>
                  <option value="February">February</option>
                  <option value="March">March</option>
                  <option value="April">April</option>
                  <option value="May">May</option>
                  <option value="June">June</option>
                  <option value="July">July</option>
                  <option value="August">August</option>
                  <option value="September">September</option>
                  <option value="October">October</option>
                  <option value="November">November</option>
                  <option value="December">December</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Year</label>
                <select
                  value={tmp.endYear || ''}
                  onChange={(e) => setTmp((current) => ({ ...current, endYear: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
                >
                  <option value="">Year</option>
                  {Array.from({ length: 50 }, (_, i) => new Date().getFullYear() + 10 - i).map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-700 mb-1">Grade</label>
            <input
              type="text"
              value={tmp.grade || ''}
              onChange={(e) => {
                const value = e.target.value;
                if (value.length <= 80) {
                  setTmp((current) => ({ ...current, grade: value }));
                }
              }}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
              maxLength={80}
            />
            <div className="text-right">
              <span className="text-xs text-gray-400">{(tmp.grade || '').length}/80</span>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-700 mb-1">Activities and societies</label>
            <textarea
              rows={3}
              value={tmp.activities || ''}
              onChange={(e) => {
                const value = e.target.value;
                if (value.length <= 500) {
                  setTmp((current) => ({ ...current, activities: value }));
                }
              }}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 resize-none"
              placeholder="Ex: Alpha Phi Omega, Marching Band, Volleyball"
              maxLength={500}
            />
            <div className="text-right">
              <span className="text-xs text-gray-400">{(tmp.activities || '').length}/500</span>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
            <textarea
              rows={4}
              value={tmp.desc || ''}
              onChange={(e) => {
                const value = e.target.value;
                if (value.length <= 1000) {
                  setTmp((current) => ({ ...current, desc: value }));
                }
              }}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 resize-none"
              maxLength={1000}
            />
            <div className="text-right">
              <span className="text-xs text-gray-400">{(tmp.desc || '').length}/1,000</span>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Skills</h4>
            <p className="text-xs text-gray-600 mb-3">We recommend adding your top 5 skills from this education entry. They'll also appear in your Skills section.</p>
            
            {tmpSkills.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {tmpSkills.map((skill, index) => (
                  <span key={index} className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full border border-blue-200">
                    {skill}
                    <button
                      type="button"
                      onClick={() => setTmpSkills(tmpSkills.filter((_, i) => i !== index))}
                      className="text-blue-500 hover:text-blue-700 ml-1"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="flex gap-2 relative">
              <div className="flex-1 relative">
                <input
                  ref={skillInputRef}
                  type="text"
                  value={newSkill}
                  onChange={(e) => handleSkillInputChange(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addSkill(newSkill);
                    }
                  }}
                    onFocus={() => {
                      if (newSkill.trim()) {
                        updateSkillSuggestions(newSkill);
                      }
                    }}
                  onBlur={() => setTimeout(() => setShowSkillDropdown(false), 200)}
                  placeholder="Type a skill and press Enter"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
                />
                {showSkillDropdown && skillSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {skillSuggestions.map((skill, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => addSkill(skill)}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 border-b border-gray-100 last:border-0"
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => addSkill(newSkill)}
                className="flex items-center gap-1 text-sm text-blue-600 border border-blue-600 rounded-lg px-4 py-2 hover:bg-blue-50 transition"
              >
                <span className="text-lg leading-none">+</span>
                Add
              </button>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Media</h4>
            <p className="text-xs text-gray-600 mb-3">
              Add media like images, documents, sites or presentations (up to 50). <a href="https://www.linkedin.com/help/linkedin/answer/a566952" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Learn more about media file types supported</a>
            </p>
            
            {mediaFiles.length > 0 && (
              <div className="mb-3 space-y-2">
                {mediaFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-lg">📎</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeMediaFile(index)}
                      className="text-red-500 hover:text-red-700 ml-2"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => mediaInputRef.current?.click()}
              disabled={uploadingMedia}
              className={`flex items-center gap-1 text-sm border rounded-full px-4 py-1.5 transition ${
                uploadingMedia 
                  ? 'text-gray-400 border-gray-300 cursor-not-allowed' 
                  : 'text-blue-600 border-blue-600 hover:bg-blue-50'
              }`}
            >
              <span className="text-lg leading-none">+</span>
              {uploadingMedia ? 'Uploading...' : 'Add media'}
            </button>
            <input
              ref={mediaInputRef}
              type="file"
              accept="image/*,video/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt"
              multiple
              className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                if (files.length > 0) {
                  handleMediaUpload(files);
                }
                e.target.value = '';
              }}
            />
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-gray-100">
            {modal !== 'add-edu' && (
              <button 
                onClick={() => deleteEdu(tmp.id)} 
                disabled={submitting}
                className="text-sm text-red-500 hover:text-red-700 hover:underline disabled:opacity-60"
              >
                Delete education
              </button>
            )}
            <div className={`flex gap-3 ${modal === 'add-edu' ? 'ml-auto' : ''}`}>
              <button onClick={closeModal} className="border border-gray-300 text-gray-600 text-sm px-4 py-2 rounded-lg hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={saveEdu} disabled={isEducationSaveDisabled} className="bg-blue-600 text-white text-sm font-semibold px-6 py-2 rounded-full hover:bg-blue-700 disabled:opacity-60">
                {submitting ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </Modal>
      )}
      
      {showDiscardDialog && (
        <ConfirmDialog
          title="Discard changes"
          message={isExperiencePage ? 'All unsaved changes will be discarded.' : "All unsaved changes will be discarded, and you'll return to your profile."}
          onConfirm={confirmDiscard}
          onCancel={cancelDiscard}
          confirmText="Discard"
          cancelText="No thanks"
        />
      )}
      
      {isExperiencePage && (
        <div className="fixed inset-0 z-40 bg-gray-50 overflow-y-auto">
          {/* Profile Header */}
          <div className="bg-white border-b border-gray-200">
            <div className="max-w-4xl mx-auto px-6 py-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate('/dashboard/profile')}
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
                  aria-label="Go back"
                >
                  <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-xl">
                    {resolvedAvatarUrl ? (
                      <img
                        src={resolvedAvatarUrl}
                        alt={profile.name || displayName}
                        className="w-full h-full object-cover"
                        onError={() => setAvatarLoadFailed(true)}
                      />
                    ) : (
                      initials
                    )}
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">{profile.name || displayName}</h1>
                    <p className="text-sm text-gray-600">
                      {profile.title || 'Add a headline'}
                      {profile.company ? ` at ${profile.company}` : ''}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Experience Section */}
          <div className="max-w-4xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Experience</h2>
              <button
                onClick={() => {
                  openModal('add-exp', buildEmptyExperienceDraft());
                }}
                className="w-10 h-10 flex items-center justify-center rounded-lg text-blue-600 hover:bg-blue-50 border border-blue-100 transition text-xl font-light"
                aria-label="Add experience"
              >
                +
              </button>
            </div>

            <div className="space-y-4">
              {experiences.length > 0 ? (
                experiences.map((exp) => (
                  <div key={exp.id} className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-sm transition">
                    <div className="flex gap-3">
                      <div className={`w-12 h-12 rounded ${exp.logoBg} flex items-center justify-center text-lg flex-shrink-0`}>
                        {exp.logo}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 text-base">{exp.role || 'Untitled role'}</h3>
                            <p className="text-sm text-gray-600 mt-0.5">
                              {exp.company || 'Company'}
                              {exp.type ? ` · ${exp.type}` : ''}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {exp.start || 'Start'} - {exp.end || 'Present'}
                              {exp.duration ? ` · ${exp.duration}` : ''}
                            </p>
                            <p className="text-xs text-gray-500">
                              {exp.location || 'Location not specified'}
                              {exp.locationType ? ` · ${exp.locationType}` : ''}
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              openModal(`exp-${exp.id}`, { ...exp });
                            }}
                            className="w-9 h-9 flex items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 transition flex-shrink-0"
                            aria-label="Edit experience"
                          >
                            <EditIcon className="w-4 h-4" />
                          </button>
                        </div>
                        
                        {exp.desc && (
                          <div className="mt-3">
                            <div className="text-sm text-gray-600 leading-relaxed">
                              {exp.desc.split('\n').filter(line => line.trim()).slice(0, 3).map((line, idx) => {
                                const trimmedLine = line.trim();
                                const hasBullet = trimmedLine.startsWith('•') || 
                                                 trimmedLine.startsWith('-') || 
                                                 trimmedLine.startsWith('*');
                                
                                return (
                                  <span key={idx} className="block mb-1">
                                    {hasBullet ? trimmedLine : `• ${trimmedLine}`}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        )}
                        
                        {exp.media && exp.media.length > 0 && (
                          <div className="mt-3 flex gap-2">
                            {exp.media.slice(0, 1).map((file, idx) => (
                              <div key={idx} className="relative">
                                {file.type?.startsWith('image/') ? (
                                  <img 
                                    src={apiService.resolveFileUrl(file.url)} 
                                    alt={file.name}
                                    className="w-16 h-16 object-cover rounded border border-gray-200"
                                  />
                                ) : (
                                  <div className="w-16 h-16 bg-gray-100 rounded border border-gray-200 flex flex-col items-center justify-center">
                                    <span className="text-lg">📄</span>
                                    <span className="text-xs text-gray-600 mt-0.5">{file.name?.split('.').pop()?.toUpperCase()}</span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {exp.skills && exp.skills.length > 0 && (
                          <div className="mt-3 flex items-center gap-1 text-sm text-gray-700">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z" />
                            </svg>
                            <span>{exp.skills.slice(0, 3).join(', ')}</span>
                            {exp.skills.length > 3 && <span className="text-gray-500">+{exp.skills.length - 3}</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                  <p className="text-gray-500 mb-4">No experience entries yet.</p>
                  <button
                    onClick={() => {
                      openModal('add-exp', buildEmptyExperienceDraft());
                    }}
                    className="text-blue-600 hover:underline"
                  >
                    Add your first experience
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {(modal === 'edit-all-edu' || parentModal === 'edit-all-edu') && (
        <div className="fixed inset-0 z-50 bg-gray-50 overflow-y-auto">
          {/* Profile Header */}
          <div className="bg-white border-b border-gray-200">
            <div className="max-w-4xl mx-auto px-6 py-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setModal(null)}
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
                  aria-label="Go back"
                >
                  <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-xl">
                    {resolvedAvatarUrl ? (
                      <img
                        src={resolvedAvatarUrl}
                        alt={profile.name || displayName}
                        className="w-full h-full object-cover"
                        onError={() => setAvatarLoadFailed(true)}
                      />
                    ) : (
                      initials
                    )}
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">{profile.name || displayName}</h1>
                    <p className="text-sm text-gray-600">
                      {profile.title || 'Add a headline'}
                      {profile.company ? ` at ${profile.company}` : ''}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Education Section */}
          <div className="max-w-4xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Education</h2>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Add education clicked, current modal:', modal);
                  openModal('add-edu', { 
                    school: '', 
                    degree: '', 
                    start: '', 
                    end: '', 
                    desc: '',
                    notifyNetwork: false,
                    fieldOfStudy: '',
                    startMonth: '',
                    startYear: '',
                    endMonth: '',
                    endYear: '',
                    grade: '',
                    activities: '',
                    skills: [],
                    media: []
                  });
                }}
                className="w-10 h-10 flex items-center justify-center rounded-lg text-blue-600 hover:bg-blue-50 border border-blue-100 transition text-xl font-light"
                aria-label="Add education"
              >
                +
              </button>
            </div>

            <div className="space-y-4">
              {educations.length > 0 ? (
                educations.map((edu) => (
                  <div key={edu.id} className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-sm transition">
                    <div className="flex gap-3">
                      <div className={`w-12 h-12 rounded ${edu.logoBg} flex items-center justify-center text-lg flex-shrink-0`}>
                        {edu.logo}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 text-base">{edu.school || 'Institution'}</h3>
                            <p className="text-sm text-gray-600 mt-0.5">
                              {edu.degree || 'Degree / Certificate'}
                              {edu.fieldOfStudy ? ` · ${edu.fieldOfStudy}` : ''}
                            </p>
                            {(edu.start || edu.end) && (
                              <p className="text-xs text-gray-500 mt-1">
                                {edu.start || 'Start'} - {edu.end || 'End'}
                              </p>
                            )}
                            {edu.grade && (
                              <p className="text-xs text-gray-500">Grade: {edu.grade}</p>
                            )}
                          </div>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log('Edit education clicked, edu:', edu.id);
                              openModal(`edu-${edu.id}`, { ...edu });
                            }}
                            className="w-9 h-9 flex items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 transition flex-shrink-0"
                            aria-label="Edit education"
                          >
                            <EditIcon className="w-4 h-4" />
                          </button>
                        </div>
                        
                        {edu.desc && (
                          <div className="mt-3">
                            <div className="text-sm text-gray-600 leading-relaxed">
                              {edu.desc.split('\n').filter(line => line.trim()).slice(0, 2).map((line, idx) => (
                                <span key={idx} className="block mb-1">
                                  {line.trim()}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {edu.media && edu.media.length > 0 && (
                          <div className="mt-3 flex gap-2">
                            {edu.media.slice(0, 1).map((file, idx) => (
                              <div key={idx} className="relative">
                                {file.type?.startsWith('image/') ? (
                                  <img 
                                    src={apiService.resolveFileUrl(file.url)} 
                                    alt={file.name}
                                    className="w-16 h-16 object-cover rounded border border-gray-200"
                                  />
                                ) : (
                                  <div className="w-16 h-16 bg-gray-100 rounded border border-gray-200 flex flex-col items-center justify-center">
                                    <span className="text-lg">📄</span>
                                    <span className="text-xs text-gray-600 mt-0.5">{file.name?.split('.').pop()?.toUpperCase()}</span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {edu.skills && edu.skills.length > 0 && (
                          <div className="mt-3 flex items-center gap-1 text-sm text-gray-700">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z" />
                            </svg>
                            <span>{edu.skills.slice(0, 3).join(', ')}</span>
                            {edu.skills.length > 3 && <span className="text-gray-500">+{edu.skills.length - 3}</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                  <p className="text-gray-500 mb-4">No education entries yet.</p>
                  <button
                    onClick={() => {
                      openModal('add-edu', { 
                        school: '', 
                        degree: '', 
                        start: '', 
                        end: '', 
                        desc: '',
                        notifyNetwork: false,
                        fieldOfStudy: '',
                        startMonth: '',
                        startYear: '',
                        endMonth: '',
                        endYear: '',
                        grade: '',
                        activities: '',
                        skills: [],
                        media: []
                      });
                    }}
                    className="text-blue-600 hover:underline"
                  >
                    Add your first education
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {skillsDetailExp && (
        <SkillsDetailModal
          experience={skillsDetailExp.type === 'top-skills' ? null : skillsDetailExp}
          topSkills={skillsDetailExp.type === 'top-skills' ? skills : null}
          profileName={profile.name || displayName}
          allExperiences={experiences}
          allEducations={educations}
          onClose={() => setSkillsDetailExp(null)}
        />
      )}
    </div>
  );
}
