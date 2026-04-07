import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashTopBar from '../../components/DashTopBar';
import apiService from '../../services/api';

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

function SkillsDetailModal({ experience, allExperiences, allEducations, onClose }) {
  const [expandedSkills, setExpandedSkills] = useState({});

  const toggleSkill = (skill) => {
    setExpandedSkills(prev => ({ ...prev, [skill]: !prev[skill] }));
  };

  // Aggregate all skills from the clicked experience and find where else they appear
  const aggregateSkills = () => {
    const skillMap = {};
    
    // Get skills from the clicked experience
    const clickedSkills = experience.skills || [];
    
    clickedSkills.forEach(skill => {
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

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 pr-8">
            Skills
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none flex-shrink-0">
            ×
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {skillsList.length > 0 ? (
            <div className="space-y-3">
              {skillsList.map((skill, index) => {
                const occurrences = skillsData[skill];
                const totalCount = occurrences.experiences.length + occurrences.educations.length;
                
                return (
                  <div key={index} className="border border-gray-200 rounded-lg">
                    <button
                      onClick={() => toggleSkill(skill)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">{skill}</span>
                        <span className="text-xs text-gray-500">({totalCount} {totalCount === 1 ? 'place' : 'places'})</span>
                      </div>
                      <svg
                        className={`w-5 h-5 text-gray-600 transition-transform ${expandedSkills[skill] ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {expandedSkills[skill] && (
                      <div className="px-4 pb-4 space-y-2">
                        {/* Show all experiences where this skill appears */}
                        {occurrences.experiences.map((exp, idx) => (
                          <div key={`exp-${idx}`} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className={`w-10 h-10 rounded-lg ${exp.logoBg} flex items-center justify-center text-lg flex-shrink-0`}>
                              {exp.logo}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900">{exp.role}</p>
                              <p className="text-xs text-gray-600">{exp.company}</p>
                            </div>
                            <div className="flex items-center gap-1 text-gray-500">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                              </svg>
                            </div>
                          </div>
                        ))}
                        
                        {/* Show all educations where this skill appears */}
                        {occurrences.educations.map((edu, idx) => (
                          <div key={`edu-${idx}`} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className={`w-10 h-10 rounded-lg ${edu.logoBg} flex items-center justify-center text-lg flex-shrink-0`}>
                              {edu.logo}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900">{edu.school}</p>
                              <p className="text-xs text-gray-600">{edu.degree}</p>
                            </div>
                            <div className="flex items-center gap-1 text-gray-500">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                              </svg>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-8">No skills added.</p>
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
  const { user } = useAuth();
  const displayName = user?.fullName || 'User Name';
  const userEmail = user?.email || 'user@email.com';

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
  const [showAllExp, setShowAllExp] = useState(false);
  const [showAllEdu, setShowAllEdu] = useState(false);
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const [modal, setModal] = useState(null);
  const [tmp, setTmp] = useState({});
  const [tmpSkills, setTmpSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [skillSuggestions, setSkillSuggestions] = useState([]);
  const [showSkillDropdown, setShowSkillDropdown] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [initialFormState, setInitialFormState] = useState(null);
  const [skillsDetailExp, setSkillsDetailExp] = useState(null);

  const coverInputRef = useRef(null);
  const avatarInputRef = useRef(null);
  const mediaInputRef = useRef(null);
  const skillInputRef = useRef(null);
  const locationInputRef = useRef(null);

  // Common skills list for autocomplete
  const commonSkills = [
    'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'TypeScript', 'HTML', 'CSS',
    'Angular', 'Vue.js', 'SQL', 'MongoDB', 'PostgreSQL', 'AWS', 'Azure', 'Docker',
    'Kubernetes', 'Git', 'Agile', 'Scrum', 'Project Management', 'Leadership',
    'Communication', 'Problem Solving', 'Team Collaboration', 'Spring Boot',
    'Django', 'Flask', 'Express.js', 'REST API', 'GraphQL', 'Machine Learning',
    'Data Analysis', 'UI/UX Design', 'Figma', 'Adobe XD', 'Photoshop', 'Marketing',
    'SEO', 'Content Writing', 'Sales', 'Customer Service', 'Excel', 'PowerPoint'
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

  const openModal = (key, initial) => {
    // Parse start/end dates back into month/year if they exist
    let parsedInitial = { ...initial };
    
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
    
    // Store initial state for comparison
    setInitialFormState({
      tmp: parsedInitial,
      skills: parsedInitial.skills || [],
      media: parsedInitial.media || [],
    });
    
    setModal(key);
  };

  const closeModal = () => {
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
      setModal(null);
      setShowDiscardDialog(false);
      setHasUnsavedChanges(false);
      setInitialFormState(null);
    }
  };

  const confirmDiscard = () => {
    setModal(null);
    setShowDiscardDialog(false);
    setHasUnsavedChanges(false);
    setInitialFormState(null);
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
    await persistProfile(
      {
        fullName: tmp.name,
        title: tmp.title,
        company: tmp.company,
        location: tmp.location,
      },
      'Profile header updated.',
    );
    closeModal();
  };

  const saveAbout = async () => {
    await persistProfile({ about: tmp.about }, 'About section updated.');
    closeModal();
  };

  const saveDetails = async () => {
    await persistProfile(
      {
        phone: tmp.phone,
        languages: tmp.languages,
      },
      'Additional details updated.',
    );
    closeModal();
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
    closeModal();
  };

  const saveSkills = async () => {
    const nextSkills = (tmp.skills || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
    await persistProfile({ skills: nextSkills }, 'Skills updated.');
    closeModal();
  };

  const saveExp = async () => {
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
      skills: tmpSkills || [],
      media: mediaFiles || [],
    };

    const nextExperiences = modal === 'add-exp'
      ? [...experiences, normalizedEntry]
      : experiences.map((entry) => (entry.id === normalizedEntry.id ? normalizedEntry : entry));

    await persistProfile({ experiences: nextExperiences }, modal === 'add-exp' ? 'Experience added.' : 'Experience updated.');
    setShowDiscardDialog(false);
    setHasUnsavedChanges(false);
    setModal(null);
  };

  const showToast = (message) => {
    setStatusMessage(message);
    setTimeout(() => setStatusMessage(''), 3000);
  };

  const handleSkillInputChange = (value) => {
    setNewSkill(value);
    if (value.trim()) {
      const filtered = commonSkills.filter(skill => 
        skill.toLowerCase().includes(value.toLowerCase()) &&
        !tmpSkills.includes(skill)
      );
      setSkillSuggestions(filtered.slice(0, 10));
      setShowSkillDropdown(filtered.length > 0);
    } else {
      setSkillSuggestions([]);
      setShowSkillDropdown(false);
    }
  };

  const addSkill = (skill) => {
    if (skill.trim() && !tmpSkills.includes(skill.trim())) {
      setTmpSkills([...tmpSkills, skill.trim()]);
      setNewSkill('');
      setSkillSuggestions([]);
      setShowSkillDropdown(false);
    }
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
      skills: tmpSkills || [],
      media: mediaFiles || [],
    };

    const nextEducations = modal === 'add-edu'
      ? [...educations, normalizedEntry]
      : educations.map((entry) => (entry.id === normalizedEntry.id ? normalizedEntry : entry));

    await persistProfile({ educations: nextEducations }, modal === 'add-edu' ? 'Education added.' : 'Education updated.');
    setShowDiscardDialog(false);
    setHasUnsavedChanges(false);
    setModal(null);
  };

  const deleteExp = async (id) => {
    await persistProfile(
      {
        experiences: experiences.filter((entry) => entry.id !== id),
      },
      'Experience removed.',
    );
    closeModal();
  };

  const deleteEdu = async (id) => {
    await persistProfile(
      {
        educations: educations.filter((entry) => entry.id !== id),
      },
      'Education removed.',
    );
    closeModal();
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

  const visibleExp = showAllExp ? experiences : experiences.slice(0, 2);
  const visibleEdu = showAllEdu ? educations : educations.slice(0, 2);
  const initials = getInitials(profile.name || displayName);
  const resolvedAvatarUrl = avatarImg ? apiService.resolveFileUrl(avatarImg) : '';
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

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50">
      <DashTopBar title="My Profile" />

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
                <h3 className="font-semibold text-gray-900">About Me</h3>
                <EditBtn onClick={() => openModal('about', { about })} ariaLabel="Edit about section" />
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
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900">Experiences</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openModal('add-exp', { 
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
                      media: []
                    })}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-blue-600 hover:bg-blue-50 border border-blue-100 transition text-xl font-light"
                    aria-label="Add experience"
                    disabled={submitting}
                  >
                    +
                  </button>
                  <button
                    onClick={() => setModal('edit-all-exp')}
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
                                const isExpanded = expandedDescriptions[exp.id];
                                const displayLines = isExpanded ? lines : lines.slice(0, 3);
                                const hasMore = lines.length > 3;
                                
                                return (
                                  <>
                                    {displayLines.map((line, idx) => {
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
                                    {hasMore && (
                                      <button
                                        type="button"
                                        onClick={() => setExpandedDescriptions(prev => ({ ...prev, [exp.id]: !prev[exp.id] }))}
                                        className="text-sm text-gray-600 hover:text-blue-600 font-medium mt-1"
                                      >
                                        ...{isExpanded ? ' show less' : ' more'}
                                      </button>
                                    )}
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

              {experiences.length > 2 && (
                <button onClick={() => setShowAllExp((current) => !current)} className="mt-4 text-sm text-blue-600 hover:underline w-full text-center">
                  {showAllExp ? 'Show less' : `Show ${experiences.length - 2} more experiences`}
                </button>
              )}
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900">Educations</h3>
                <button
                  onClick={() => openModal('add-edu', { school: '', degree: '', start: '', end: '', desc: '' })}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-blue-600 hover:bg-blue-50 border border-blue-100 transition text-xl font-light"
                  aria-label="Add education"
                  disabled={submitting}
                >
                  +
                </button>
              </div>

              {visibleEdu.length > 0 ? (
                <div className="space-y-5">
                  {visibleEdu.map((edu, index) => (
                    <div key={edu.id} className={`flex gap-4 ${index < visibleEdu.length - 1 ? 'pb-5 border-b border-gray-100' : ''}`}>
                      <div className={`w-11 h-11 rounded-xl ${edu.logoBg} flex items-center justify-center text-xl flex-shrink-0`}>{edu.logo}</div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{edu.school || 'Institution'}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{edu.degree || 'Degree / Certificate'}</p>
                            {(edu.start || edu.end) && <p className="text-xs text-gray-400">{edu.start || 'Start'} - {edu.end || 'End'}</p>}
                          </div>
                          <EditBtn onClick={() => openModal(`edu-${edu.id}`, { ...edu })} ariaLabel="Edit education entry" />
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
                <EditBtn onClick={() => openModal('skills', { skills: skills.join(', ') })} ariaLabel="Edit skills section" />
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

      {modal === 'profile' && (
        <Modal title="Edit Profile" onClose={closeModal}>
          <Field label="Full Name" value={tmp.name || ''} onChange={(value) => setTmp((current) => ({ ...current, name: value }))} />
          <Field label="Job Title" value={tmp.title || ''} onChange={(value) => setTmp((current) => ({ ...current, title: value }))} />
          <Field label="Company" value={tmp.company || ''} onChange={(value) => setTmp((current) => ({ ...current, company: value }))} />
          <Field label="Location" value={tmp.location || ''} onChange={(value) => setTmp((current) => ({ ...current, location: value }))} />
          <div className="flex justify-end gap-3 mt-2">
            <button onClick={closeModal} className="border border-gray-300 text-gray-600 text-sm px-4 py-2 rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button onClick={saveProfile} disabled={submitting} className="bg-blue-600 text-white text-sm px-5 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60">
              {submitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </Modal>
      )}

      {modal === 'about' && (
        <Modal title="Edit About Me" onClose={closeModal}>
          <Field label="About Me" value={tmp.about || ''} onChange={(value) => setTmp((current) => ({ ...current, about: value }))} rows={6} />
          <div className="flex justify-end gap-3 mt-2">
            <button onClick={closeModal} className="border border-gray-300 text-gray-600 text-sm px-4 py-2 rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button onClick={saveAbout} disabled={submitting} className="bg-blue-600 text-white text-sm px-5 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60">
              {submitting ? 'Saving...' : 'Save'}
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
          <p className="text-xs text-gray-400 mb-3">Enter skills separated by commas</p>
          <Field label="Skills" value={tmp.skills || ''} onChange={(value) => setTmp((current) => ({ ...current, skills: value }))} rows={3} />
          <div className="flex justify-end gap-3 mt-2">
            <button onClick={closeModal} className="border border-gray-300 text-gray-600 text-sm px-4 py-2 rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button onClick={saveSkills} disabled={submitting} className="bg-blue-600 text-white text-sm px-5 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60">
              {submitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </Modal>
      )}

      {(modal?.startsWith('exp-') || modal === 'add-exp') && (
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

          <Field label="Title*" value={tmp.role || ''} onChange={(value) => setTmp((current) => ({ ...current, role: value }))} />
          
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

          <Field label="Company or organization*" value={tmp.company || ''} onChange={(value) => setTmp((current) => ({ ...current, company: value }))} />
          
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
                <span className="text-sm text-gray-700">End current position as of now - DSA Member</span>
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
                placeholder="Ex: London, United Kingdom"
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
              placeholder="Ex-SDE Intern @airtel | Java 21 | Spring Boot | Spring Cloud | Backend-Focused | Python • JavaScript • ES7 | Op..."
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
                      const filtered = commonSkills.filter(skill => 
                        skill.toLowerCase().includes(newSkill.toLowerCase()) &&
                        !tmpSkills.includes(skill)
                      );
                      setSkillSuggestions(filtered.slice(0, 10));
                      setShowSkillDropdown(filtered.length > 0);
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
              <button onClick={saveExp} disabled={submitting} className="bg-blue-600 text-white text-sm font-semibold px-6 py-2 rounded-full hover:bg-blue-700 disabled:opacity-60">
                {submitting ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {(modal?.startsWith('edu-') || modal === 'add-edu') && (
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

          <Field label="School*" value={tmp.school || ''} onChange={(value) => setTmp((current) => ({ ...current, school: value }))} />
          <Field label="Degree" value={tmp.degree || ''} onChange={(value) => setTmp((current) => ({ ...current, degree: value }))} />
          <Field label="Field of study" value={tmp.fieldOfStudy || ''} onChange={(value) => setTmp((current) => ({ ...current, fieldOfStudy: value }))} />
          
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
            <p className="text-xs text-gray-600 mb-3">We recommend adding your top 5 skills used in this experience. They'll also appear in your Skills section.</p>
            
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

            <button
              type="button"
              onClick={() => {
                // Open skill input - you can enhance this with a modal or inline input
                const skill = prompt('Enter a skill:');
                if (skill && skill.trim() && !tmpSkills.includes(skill.trim())) {
                  setTmpSkills([...tmpSkills, skill.trim()]);
                }
              }}
              className="flex items-center gap-1 text-sm text-blue-600 border border-blue-600 rounded-full px-4 py-1.5 hover:bg-blue-50 transition"
            >
              <span className="text-lg leading-none">+</span>
              Add skill
            </button>
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
              <button onClick={saveEdu} disabled={submitting} className="bg-blue-600 text-white text-sm font-semibold px-6 py-2 rounded-full hover:bg-blue-700 disabled:opacity-60">
                {submitting ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </Modal>
      )}
      
      {showDiscardDialog && (
        <ConfirmDialog
          title="Discard changes"
          message="All unsaved changes will be discarded, and you'll return to your profile."
          onConfirm={confirmDiscard}
          onCancel={cancelDiscard}
          confirmText="Discard"
          cancelText="No thanks"
        />
      )}
      
      {modal === 'edit-all-exp' && (
        <div className="fixed inset-0 z-50 bg-gray-50 overflow-y-auto">
          {/* LinkedIn-style Navigation Bar */}
          <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                    <span className="text-white font-bold text-sm">in</span>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <button className="hover:text-gray-900">Home</button>
                  <button className="hover:text-gray-900">My Network</button>
                  <button className="hover:text-gray-900">Jobs</button>
                  <button className="hover:text-gray-900">Messaging</button>
                  <button className="hover:text-gray-900">Notifications</button>
                </div>
              </div>
            </div>
          </div>

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
                  setModal(null);
                  openModal('add-exp', { 
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
                    media: []
                  });
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
                              setModal(null);
                              setTimeout(() => openModal(`exp-${exp.id}`, { ...exp }), 100);
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
                      setModal(null);
                      openModal('add-exp', { 
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
                        media: []
                      });
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
      
      {skillsDetailExp && (
        <SkillsDetailModal
          experience={skillsDetailExp}
          allExperiences={experiences}
          allEducations={educations}
          onClose={() => setSkillsDetailExp(null)}
        />
      )}
    </div>
  );
}
