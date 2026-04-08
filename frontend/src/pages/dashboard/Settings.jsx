import { useEffect, useMemo, useRef, useState } from 'react';
import { PhotoIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import DashTopBar from '../../components/DashTopBar';
import { useToast } from '../../components/Toast';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import apiService from '../../services/api';

const tabs = ['My Profile', 'Login Details', 'Notifications'];

const emptyProfileForm = {
  fullName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  gender: '',
  userType: 'JOBSEEKER',
  profilePhotoUrl: '',
};

const emptyEmailForm = {
  currentPassword: '',
  email: '',
};

const emptyPasswordForm = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

function getInitials(name) {
  return (name || 'User')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function mapProfileToForm(profile, fallbackUser) {
  return {
    fullName: profile?.fullName || fallbackUser?.fullName || '',
    email: profile?.email || fallbackUser?.email || '',
    phone: profile?.phone || '',
    dateOfBirth: profile?.dateOfBirth || '',
    gender: profile?.gender || '',
    userType: profile?.userType || fallbackUser?.userType || 'JOBSEEKER',
    profilePhotoUrl: profile?.profilePhotoUrl || '',
  };
}

function mapNotificationSettings(profile) {
  return {
    applications: profile?.applicationNotifications ?? true,
    jobs: profile?.jobNotifications ?? true,
    recommendations: profile?.recommendationNotifications ?? true,
  };
}

function Field({ label, children, helper }) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-slate-700">{label}</label>
      {children}
      {helper ? <p className="text-xs text-slate-400">{helper}</p> : null}
    </div>
  );
}

function SettingsSection({ title, description, children }) {
  return (
    <section className="border-b border-slate-200 py-8 last:border-b-0">
      <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <div>
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
        </div>
        <div>{children}</div>
      </div>
    </section>
  );
}

function TextInput({ className = '', ...props }) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500 ${className}`}
    />
  );
}

function SelectInput({ className = '', children, ...props }) {
  return (
    <select
      {...props}
      className={`w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 ${className}`}
    >
      {children}
    </select>
  );
}

function ActionButton({ children, className = '', ...props }) {
  return (
    <button
      {...props}
      className={`rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300 ${className}`}
    >
      {children}
    </button>
  );
}

function SecondaryButton({ children, className = '', ...props }) {
  return (
    <button
      {...props}
      className={`rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {children}
    </button>
  );
}

function NotificationChoice({ title, description, checked, onChange }) {
  return (
    <label className="flex items-start gap-4 rounded-2xl border border-slate-200 px-4 py-4 transition hover:border-indigo-200 hover:bg-indigo-50/40">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
      />
      <div>
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
      </div>
    </label>
  );
}

export default function Settings() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { user, updateUser, applyAuthResponse } = useAuth();
  const { showToast } = useToast();
  const { notificationPreferences, updateNotificationPreferencesLocally } = useNotifications();

  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [profileForm, setProfileForm] = useState(emptyProfileForm);
  const [emailForm, setEmailForm] = useState(emptyEmailForm);
  const [passwordForm, setPasswordForm] = useState(emptyPasswordForm);
  const [notificationForm, setNotificationForm] = useState(notificationPreferences);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingNotifications, setSavingNotifications] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [draggingPhoto, setDraggingPhoto] = useState(false);
  const canValidateEmailUpdate = emailForm.currentPassword.trim().length > 0;

  useEffect(() => {
    setNotificationForm(notificationPreferences);
  }, [notificationPreferences]);

  useEffect(() => {
    let ignore = false;

    const loadSettings = async () => {
      setLoading(true);
      try {
        const profile = await apiService.getMyProfile();
        if (ignore) {
          return;
        }

        const nextProfileForm = mapProfileToForm(profile, null);
        setProfileForm(nextProfileForm);
        setEmailForm({
          currentPassword: '',
          email: nextProfileForm.email,
        });
        setNotificationForm(mapNotificationSettings(profile));
        updateNotificationPreferencesLocally(mapNotificationSettings(profile));
      } catch (error) {
        if (!ignore) {
          showToast(error.message || 'Failed to load settings', 'error');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadSettings();
    return () => {
      ignore = true;
    };
  }, [updateNotificationPreferencesLocally, user?.id]);

  const photoPreview = useMemo(() => (
    profileForm.profilePhotoUrl ? apiService.resolveFileUrl(profileForm.profilePhotoUrl) : ''
  ), [profileForm.profilePhotoUrl]);

  const handleProfileChange = (field, value) => {
    setProfileForm((currentForm) => ({ ...currentForm, [field]: value }));
  };

  const handlePhotoUpload = async (file) => {
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file', 'error');
      return;
    }

    setUploadingPhoto(true);
    try {
      const uploadResponse = await apiService.uploadFile(file);
      setProfileForm((currentForm) => ({ ...currentForm, profilePhotoUrl: uploadResponse.url }));
      showToast('Photo uploaded. Save profile to publish it.', 'info');
    } catch (error) {
      showToast(error.message || 'Failed to upload photo', 'error');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleProfileSave = async () => {
    if (!profileForm.fullName.trim()) {
      showToast('Full name is required', 'error');
      return;
    }

    setSavingProfile(true);
    try {
      const updatedProfile = await apiService.updateMyProfile({
        fullName: profileForm.fullName,
        phone: profileForm.phone,
        dateOfBirth: profileForm.dateOfBirth || null,
        gender: profileForm.gender || null,
        userType: profileForm.userType,
        profilePhotoUrl: profileForm.profilePhotoUrl || null,
      });

      setProfileForm(mapProfileToForm(updatedProfile, user));
      updateUser({
        fullName: updatedProfile.fullName,
        email: updatedProfile.email,
        userType: updatedProfile.userType,
        profilePhotoUrl: updatedProfile.profilePhotoUrl,
      });
      showToast('Profile settings saved');

      if (updatedProfile.userType === 'COMPANY') {
        navigate('/company/dashboard', { replace: true });
      }
    } catch (error) {
      showToast(error.message || 'Failed to save profile', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleEmailSave = async () => {
    if (!emailForm.currentPassword.trim()) {
      showToast('Current password is required to update email', 'error');
      return;
    }

    if (!emailForm.email.trim()) {
      showToast('New email is required', 'error');
      return;
    }

    setSavingEmail(true);
    try {
      const response = await apiService.updateMyLoginDetails({
        currentPassword: emailForm.currentPassword,
        email: emailForm.email,
      });

      applyAuthResponse(response);
      setProfileForm((currentForm) => ({ ...currentForm, email: response.user.email }));
      setEmailForm({ currentPassword: '', email: response.user.email });
      showToast('Login email updated');
    } catch (error) {
      showToast(error.message || 'Failed to update email', 'error');
    } finally {
      setSavingEmail(false);
    }
  };

  const handlePasswordSave = async () => {
    if (!passwordForm.currentPassword.trim()) {
      showToast('Current password is required to change password', 'error');
      return;
    }

    if (!passwordForm.newPassword.trim()) {
      showToast('New password is required', 'error');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      showToast('New password must be at least 8 characters', 'error');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    setSavingPassword(true);
    try {
      const response = await apiService.updateMyLoginDetails({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      applyAuthResponse(response);
      setPasswordForm(emptyPasswordForm);
      showToast('Password updated');
    } catch (error) {
      showToast(error.message || 'Failed to update password', 'error');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleNotificationSave = async () => {
    setSavingNotifications(true);
    try {
      const profile = await apiService.updateMyNotificationPreferences({
        applicationNotifications: notificationForm.applications,
        jobNotifications: notificationForm.jobs,
        recommendationNotifications: notificationForm.recommendations,
      });

      const nextPreferences = mapNotificationSettings(profile);
      setNotificationForm(nextPreferences);
      updateNotificationPreferencesLocally(nextPreferences);
      showToast('Notification preferences updated');
    } catch (error) {
      showToast(error.message || 'Failed to update notifications', 'error');
    } finally {
      setSavingNotifications(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col h-full bg-white">
        <DashTopBar title="Settings" />
        <div className="flex flex-1 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-indigo-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-white">
      <DashTopBar title="Settings" />

      <div className="flex-1 overflow-y-auto">
        <div className="border-b border-slate-200 px-6 pt-2 sm:px-8 lg:px-10">
          <div className="flex flex-wrap gap-6">
            {tabs.map((tab, index) => (
              <button
                key={tab}
                onClick={() => setActiveTab(index)}
                className={`border-b-2 px-1 py-4 text-sm font-semibold transition ${
                  activeTab === index
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="px-6 pb-8 sm:px-8 lg:px-10">
            {activeTab === 0 && (
              <>
                <div className="border-b border-slate-200 py-8">
                  <h2 className="text-2xl font-bold text-slate-900">Basic Information</h2>
                  <p className="mt-2 text-sm text-slate-500">
                    This is your personal information that you can update anytime.
                  </p>
                </div>

                <SettingsSection
                  title="Profile Photo"
                  description="This image will be shown publicly as your profile picture so recruiters can recognize you quickly."
                >
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
                    <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-slate-100">
                      {photoPreview ? (
                        <img src={photoPreview} alt="Profile" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-200 text-xl font-bold text-slate-600">
                          {getInitials(profileForm.fullName || user?.fullName)}
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(event) => {
                        event.preventDefault();
                        setDraggingPhoto(true);
                      }}
                      onDragLeave={() => setDraggingPhoto(false)}
                      onDrop={(event) => {
                        event.preventDefault();
                        setDraggingPhoto(false);
                        handlePhotoUpload(event.dataTransfer.files?.[0]);
                      }}
                      className={`flex min-h-36 flex-1 flex-col items-center justify-center rounded-[22px] border-2 border-dashed px-6 text-center transition ${
                        draggingPhoto
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-indigo-200 bg-indigo-50/30 hover:border-indigo-400 hover:bg-indigo-50'
                      }`}
                    >
                      <PhotoIcon className="h-10 w-10 text-indigo-500" />
                      <p className="mt-4 text-sm font-semibold text-indigo-600">
                        {uploadingPhoto ? 'Uploading photo...' : 'Click to replace or drag and drop'}
                      </p>
                      <p className="mt-2 text-sm text-slate-500">SVG, PNG, JPG or GIF (max. 400 x 400px)</p>
                    </button>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) => handlePhotoUpload(event.target.files?.[0])}
                    />
                  </div>
                </SettingsSection>

                <SettingsSection
                  title="Personal Details"
                  description="Keep your public profile complete and consistent with the information recruiters will see."
                >
                  <div className="grid gap-5 md:grid-cols-2">
                    <Field label="Full Name *">
                      <TextInput
                        value={profileForm.fullName}
                        onChange={(event) => handleProfileChange('fullName', event.target.value)}
                        placeholder="Enter your full name"
                      />
                    </Field>

                    <Field label="Email *" helper="Email updates are handled securely in the Login Details tab.">
                      <TextInput value={profileForm.email} disabled />
                    </Field>

                    <Field label="Phone Number *">
                      <TextInput
                        value={profileForm.phone}
                        onChange={(event) => handleProfileChange('phone', event.target.value)}
                        placeholder="+91 98765 43210"
                      />
                    </Field>

                    <Field label="Date of Birth *">
                      <TextInput
                        type="date"
                        value={profileForm.dateOfBirth}
                        onChange={(event) => handleProfileChange('dateOfBirth', event.target.value)}
                      />
                    </Field>

                    <Field label="Gender *">
                      <SelectInput
                        value={profileForm.gender}
                        onChange={(event) => handleProfileChange('gender', event.target.value)}
                      >
                        <option value="">Select gender</option>
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="OTHER">Other</option>
                        <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                      </SelectInput>
                    </Field>
                  </div>
                </SettingsSection>

                <SettingsSection
                  title="Account Type"
                  description="Choose how you want this account to behave inside the product."
                >
                  <div className="space-y-4">
                    <label className={`flex cursor-pointer items-start gap-4 rounded-2xl border px-4 py-4 transition ${profileForm.userType === 'JOBSEEKER' ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-slate-300'}`}>
                      <input
                        type="radio"
                        name="userType"
                        value="JOBSEEKER"
                        checked={profileForm.userType === 'JOBSEEKER'}
                        onChange={(event) => handleProfileChange('userType', event.target.value)}
                        className="mt-1 h-4 w-4 border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Job Seeker</p>
                        <p className="mt-1 text-sm text-slate-500">Looking for a job and managing applications.</p>
                      </div>
                    </label>

                    <label className={`flex cursor-pointer items-start gap-4 rounded-2xl border px-4 py-4 transition ${profileForm.userType === 'COMPANY' ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-slate-300'}`}>
                      <input
                        type="radio"
                        name="userType"
                        value="COMPANY"
                        checked={profileForm.userType === 'COMPANY'}
                        onChange={(event) => handleProfileChange('userType', event.target.value)}
                        className="mt-1 h-4 w-4 border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Employer</p>
                        <p className="mt-1 text-sm text-slate-500">Hiring, sourcing candidates, and posting jobs.</p>
                      </div>
                    </label>
                  </div>
                </SettingsSection>

                <div className="flex justify-end pt-8">
                  <ActionButton onClick={handleProfileSave} disabled={savingProfile || uploadingPhoto}>
                    {savingProfile ? 'Saving Profile...' : 'Save Profile'}
                  </ActionButton>
                </div>
              </>
            )}

            {activeTab === 1 && (
              <>
                <div className="border-b border-slate-200 py-8">
                  <h2 className="text-2xl font-bold text-slate-900">Login Details</h2>
                  <p className="mt-2 text-sm text-slate-500">
                    Update your sign-in credentials with password confirmation so the current session stays valid.
                  </p>
                </div>

                <SettingsSection
                  title="Email Address"
                  description="Changing your login email will rotate your tokens immediately to keep the session secure."
                >
                  <div className="grid gap-5 md:grid-cols-2">
                    <Field label="Current Password *" helper="Enter your password first to unlock email editing.">
                      <TextInput
                        type="password"
                        value={emailForm.currentPassword}
                        onChange={(event) => setEmailForm((currentForm) => ({ ...currentForm, currentPassword: event.target.value }))}
                        placeholder="Enter current password"
                      />
                    </Field>

                    <Field label="New Email *">
                      <TextInput
                        type="email"
                        value={emailForm.email}
                        onChange={(event) => setEmailForm((currentForm) => ({ ...currentForm, email: event.target.value }))}
                        placeholder={canValidateEmailUpdate ? 'Enter new login email' : 'Enter your password first'}
                        disabled={!canValidateEmailUpdate}
                      />
                    </Field>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <ActionButton onClick={handleEmailSave} disabled={savingEmail || !canValidateEmailUpdate}>
                      {savingEmail ? 'Updating Email...' : 'Update Email'}
                    </ActionButton>
                  </div>
                </SettingsSection>

                <SettingsSection
                  title="Password"
                  description="Use your current password to confirm the change and then choose a stronger replacement."
                >
                  <div className="grid gap-5 md:grid-cols-2">
                    <Field label="Current Password *">
                      <TextInput
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(event) => setPasswordForm((currentForm) => ({ ...currentForm, currentPassword: event.target.value }))}
                        placeholder="Enter current password"
                      />
                    </Field>

                    <Field label="New Password *" helper="Must be at least 8 characters.">
                      <TextInput
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(event) => setPasswordForm((currentForm) => ({ ...currentForm, newPassword: event.target.value }))}
                        placeholder="Enter new password"
                      />
                    </Field>

                    <Field label="Confirm Password *">
                      <TextInput
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(event) => setPasswordForm((currentForm) => ({ ...currentForm, confirmPassword: event.target.value }))}
                        placeholder="Confirm new password"
                      />
                    </Field>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <ActionButton onClick={handlePasswordSave} disabled={savingPassword}>
                      {savingPassword ? 'Updating Password...' : 'Change Password'}
                    </ActionButton>
                  </div>
                </SettingsSection>
              </>
            )}

            {activeTab === 2 && (
              <>
                <div className="border-b border-slate-200 py-8">
                  <h2 className="text-2xl font-bold text-slate-900">Notifications</h2>
                  <p className="mt-2 text-sm text-slate-500">
                    Control which notification categories stay visible in the app and in your settings experience.
                  </p>
                </div>

                <SettingsSection
                  title="Preferences"
                  description="These choices are stored on your account and applied to the notification center."
                >
                  <div className="space-y-4">
                    <NotificationChoice
                      title="Application Updates"
                      description="Interview invites, status changes, shortlists, offers, and other application progress."
                      checked={notificationForm.applications}
                      onChange={() => setNotificationForm((currentForm) => ({ ...currentForm, applications: !currentForm.applications }))}
                    />
                    <NotificationChoice
                      title="Job Alerts"
                      description="Fresh openings and job discoveries that match your saved searches or recent activity."
                      checked={notificationForm.jobs}
                      onChange={() => setNotificationForm((currentForm) => ({ ...currentForm, jobs: !currentForm.jobs }))}
                    />
                    <NotificationChoice
                      title="Recommendations"
                      description="Personalized suggestions based on your profile, activity, and market relevance."
                      checked={notificationForm.recommendations}
                      onChange={() => setNotificationForm((currentForm) => ({ ...currentForm, recommendations: !currentForm.recommendations }))}
                    />
                  </div>

                  <div className="mt-6 flex justify-end gap-3">
                    <SecondaryButton
                      onClick={() => setNotificationForm(notificationPreferences)}
                      disabled={savingNotifications}
                    >
                      Reset
                    </SecondaryButton>
                    <ActionButton onClick={handleNotificationSave} disabled={savingNotifications}>
                      {savingNotifications ? 'Saving Preferences...' : 'Save Preferences'}
                    </ActionButton>
                  </div>
                </SettingsSection>
              </>
            )}
        </div>
      </div>
    </div>
  );
}
