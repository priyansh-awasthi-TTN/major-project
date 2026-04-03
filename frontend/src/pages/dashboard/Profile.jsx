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
            x
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
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
  const [modal, setModal] = useState(null);
  const [tmp, setTmp] = useState({});

  const coverInputRef = useRef(null);
  const avatarInputRef = useRef(null);

  const openModal = (key, initial) => {
    setTmp(initial);
    setModal(key);
  };

  const closeModal = () => setModal(null);

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
    const normalizedEntry = {
      id: tmp.id ?? Date.now(),
      role: tmp.role || '',
      company: tmp.company || '',
      logo: tmp.logo || '💼',
      logoBg: tmp.logoBg || 'bg-gray-100 text-gray-600',
      type: tmp.type || '',
      start: tmp.start || '',
      end: tmp.end || '',
      duration: tmp.duration || '',
      location: tmp.location || '',
      desc: tmp.desc || '',
    };

    const nextExperiences = modal === 'add-exp'
      ? [...experiences, normalizedEntry]
      : experiences.map((entry) => (entry.id === normalizedEntry.id ? normalizedEntry : entry));

    await persistProfile({ experiences: nextExperiences }, modal === 'add-exp' ? 'Experience added.' : 'Experience updated.');
    closeModal();
  };

  const saveEdu = async () => {
    const normalizedEntry = {
      id: tmp.id ?? Date.now(),
      school: tmp.school || '',
      logo: tmp.logo || '🎓',
      logoBg: tmp.logoBg || 'bg-gray-100 text-gray-600',
      degree: tmp.degree || '',
      start: tmp.start || '',
      end: tmp.end || '',
      desc: tmp.desc || '',
    };

    const nextEducations = modal === 'add-edu'
      ? [...educations, normalizedEntry]
      : educations.map((entry) => (entry.id === normalizedEntry.id ? normalizedEntry : entry));

    await persistProfile({ educations: nextEducations }, modal === 'add-edu' ? 'Education added.' : 'Education updated.');
    closeModal();
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
                <button
                  onClick={() => openModal('add-exp', { role: '', company: '', type: 'Full-Time', start: '', end: '', duration: '', location: '', desc: '' })}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-blue-600 hover:bg-blue-50 border border-blue-100 transition text-xl font-light"
                  aria-label="Add experience"
                  disabled={submitting}
                >
                  +
                </button>
              </div>

              {visibleExp.length > 0 ? (
                <div className="space-y-5">
                  {visibleExp.map((exp, index) => (
                    <div key={exp.id} className={`flex gap-4 ${index < visibleExp.length - 1 ? 'pb-5 border-b border-gray-100' : ''}`}>
                      <div className={`w-11 h-11 rounded-xl ${exp.logoBg} flex items-center justify-center text-xl flex-shrink-0`}>{exp.logo}</div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{exp.role || 'Untitled role'}</p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {exp.company || 'Company'}
                              {exp.type ? ` · ${exp.type}` : ''}
                              {(exp.start || exp.end) ? ` · ${exp.start || 'Start'} - ${exp.end || 'Present'}` : ''}
                              {exp.duration ? ` (${exp.duration})` : ''}
                            </p>
                            {exp.location && <p className="text-xs text-gray-400">{exp.location}</p>}
                          </div>
                          <EditBtn onClick={() => openModal(`exp-${exp.id}`, { ...exp })} ariaLabel="Edit experience entry" />
                        </div>
                        {exp.desc && <p className="text-sm text-gray-600 mt-2 leading-relaxed">{exp.desc}</p>}
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
        <Modal title={modal === 'add-exp' ? 'Add Experience' : 'Edit Experience'} onClose={closeModal}>
          <Field label="Job Title" value={tmp.role || ''} onChange={(value) => setTmp((current) => ({ ...current, role: value }))} />
          <Field label="Company" value={tmp.company || ''} onChange={(value) => setTmp((current) => ({ ...current, company: value }))} />
          <Field label="Job Type" value={tmp.type || ''} onChange={(value) => setTmp((current) => ({ ...current, type: value }))} />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Start" value={tmp.start || ''} onChange={(value) => setTmp((current) => ({ ...current, start: value }))} />
            <Field label="End" value={tmp.end || ''} onChange={(value) => setTmp((current) => ({ ...current, end: value }))} />
          </div>
          <Field label="Duration" value={tmp.duration || ''} onChange={(value) => setTmp((current) => ({ ...current, duration: value }))} />
          <Field label="Location" value={tmp.location || ''} onChange={(value) => setTmp((current) => ({ ...current, location: value }))} />
          <Field label="Description" value={tmp.desc || ''} onChange={(value) => setTmp((current) => ({ ...current, desc: value }))} rows={3} />
          <div className="flex justify-between mt-2">
            {modal !== 'add-exp' && (
              <button onClick={() => deleteExp(tmp.id)} className="text-sm text-red-500 hover:underline">
                Delete
              </button>
            )}
            <div className="flex gap-3 ml-auto">
              <button onClick={closeModal} className="border border-gray-300 text-gray-600 text-sm px-4 py-2 rounded-lg hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={saveExp} disabled={submitting} className="bg-blue-600 text-white text-sm px-5 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60">
                {submitting ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {(modal?.startsWith('edu-') || modal === 'add-edu') && (
        <Modal title={modal === 'add-edu' ? 'Add Education' : 'Edit Education'} onClose={closeModal}>
          <Field label="School / University" value={tmp.school || ''} onChange={(value) => setTmp((current) => ({ ...current, school: value }))} />
          <Field label="Degree / Certificate" value={tmp.degree || ''} onChange={(value) => setTmp((current) => ({ ...current, degree: value }))} />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Start Year" value={tmp.start || ''} onChange={(value) => setTmp((current) => ({ ...current, start: value }))} />
            <Field label="End Year" value={tmp.end || ''} onChange={(value) => setTmp((current) => ({ ...current, end: value }))} />
          </div>
          <Field label="Description" value={tmp.desc || ''} onChange={(value) => setTmp((current) => ({ ...current, desc: value }))} rows={3} />
          <div className="flex justify-between mt-2">
            {modal !== 'add-edu' && (
              <button onClick={() => deleteEdu(tmp.id)} className="text-sm text-red-500 hover:underline">
                Delete
              </button>
            )}
            <div className="flex gap-3 ml-auto">
              <button onClick={closeModal} className="border border-gray-300 text-gray-600 text-sm px-4 py-2 rounded-lg hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={saveEdu} disabled={submitting} className="bg-blue-600 text-white text-sm px-5 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60">
                {submitting ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
