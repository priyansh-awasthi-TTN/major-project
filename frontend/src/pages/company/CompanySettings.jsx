import { useEffect, useState } from 'react';
import CompanyTopBar from '../../components/CompanyTopBar';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/api';

const tabs = ['Overview', 'Social Links', 'Notifications'];

function LoadingState() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-indigo-600" />
        <p className="mt-3 text-sm text-slate-500">Loading company settings...</p>
      </div>
    </div>
  );
}

export default function CompanySettings() {
  const { refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    website: '',
    location: '',
    companySize: '',
    industry: '',
    about: '',
  });
  const [socialForm, setSocialForm] = useState({
    instagram: '',
    twitter: '',
    website: '',
  });
  const [notificationForm, setNotificationForm] = useState({
    applicationNotifications: true,
    jobNotifications: true,
    recommendationNotifications: true,
  });

  useEffect(() => {
    let cancelled = false;

    const loadSettings = async () => {
      setLoading(true);
      setError('');

      try {
        const profile = await apiService.getMyProfile();
        if (cancelled) return;

        setProfileForm({
          fullName: profile?.fullName || '',
          website: profile?.website || '',
          location: profile?.location || '',
          companySize: profile?.companySize || '',
          industry: profile?.industry || '',
          about: profile?.description || '',
        });
        setSocialForm({
          instagram: profile?.instagram || '',
          twitter: profile?.twitter || '',
          website: profile?.website || '',
        });
        setNotificationForm({
          applicationNotifications: profile?.applicationNotifications ?? true,
          jobNotifications: profile?.jobNotifications ?? true,
          recommendationNotifications: profile?.recommendationNotifications ?? true,
        });
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError.message || 'Failed to load company settings.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadSettings();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleProfileSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await apiService.updateMyProfile({
        fullName: profileForm.fullName,
        website: profileForm.website,
        location: profileForm.location,
        companySize: profileForm.companySize,
        industry: profileForm.industry,
        about: profileForm.about,
      });
      await refreshUser();
      setSuccess('Company overview saved.');
    } catch (saveError) {
      setError(saveError.message || 'Failed to save company overview.');
    } finally {
      setSaving(false);
    }
  };

  const handleSocialSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await apiService.updateMyProfile({
        website: socialForm.website,
        instagram: socialForm.instagram,
        twitter: socialForm.twitter,
      });
      await refreshUser();
      setSuccess('Social links saved.');
    } catch (saveError) {
      setError(saveError.message || 'Failed to save social links.');
    } finally {
      setSaving(false);
    }
  };

  const handleNotificationSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await apiService.updateMyNotificationPreferences(notificationForm);
      setSuccess('Notification preferences saved.');
    } catch (saveError) {
      setError(saveError.message || 'Failed to save notification preferences.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-1 flex-col bg-[#f5f7fb]">
        <CompanyTopBar title="Settings" subtitle="Loading company settings..." />
        <div className="px-6 pb-10 pt-20">
          <LoadingState />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-[#f5f7fb]">
      <CompanyTopBar title="Settings" subtitle="All fields on this page now map to backend profile data." />
      <div className="px-6 pb-10 pt-20">
        <div className="w-full space-y-6">
          {error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          {success ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {success}
            </div>
          ) : null}

          <div className="flex items-center gap-6 border-b border-slate-200">
            {tabs.map((tab, index) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(index)}
                className={`-mb-px px-1 pb-3 text-sm font-semibold transition ${
                  activeTab === index ? 'border-b-2 border-indigo-600 text-indigo-600' : 'border-b-2 border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <h3 className="text-base font-semibold text-slate-900">Company Overview</h3>
              <p className="mt-1 text-sm text-slate-500">These values come from and save back to your company profile record.</p>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <label className="text-xs font-semibold text-slate-500">
                  Company Name
                  <input
                    value={profileForm.fullName}
                    onChange={(event) => setProfileForm((current) => ({ ...current, fullName: event.target.value }))}
                    className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-500"
                  />
                </label>
                <label className="text-xs font-semibold text-slate-500">
                  Website
                  <input
                    value={profileForm.website}
                    onChange={(event) => setProfileForm((current) => ({ ...current, website: event.target.value }))}
                    className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-500"
                  />
                </label>
                <label className="text-xs font-semibold text-slate-500">
                  Location
                  <input
                    value={profileForm.location}
                    onChange={(event) => setProfileForm((current) => ({ ...current, location: event.target.value }))}
                    className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-500"
                  />
                </label>
                <label className="text-xs font-semibold text-slate-500">
                  Industry
                  <input
                    value={profileForm.industry}
                    onChange={(event) => setProfileForm((current) => ({ ...current, industry: event.target.value }))}
                    className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-500"
                  />
                </label>
                <label className="text-xs font-semibold text-slate-500 md:col-span-2">
                  Company Size
                  <input
                    value={profileForm.companySize}
                    onChange={(event) => setProfileForm((current) => ({ ...current, companySize: event.target.value }))}
                    className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-500"
                    placeholder="e.g. 51-200"
                  />
                </label>
                <label className="text-xs font-semibold text-slate-500 md:col-span-2">
                  About Company
                  <textarea
                    rows={6}
                    value={profileForm.about}
                    onChange={(event) => setProfileForm((current) => ({ ...current, about: event.target.value }))}
                    className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-500"
                  />
                </label>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={handleProfileSave}
                  disabled={saving}
                  className="rounded-lg bg-indigo-600 px-6 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:bg-indigo-300"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          ) : null}

          {activeTab === 1 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <h3 className="text-base font-semibold text-slate-900">Social Links</h3>
              <p className="mt-1 text-sm text-slate-500">These links are saved in your backend profile record.</p>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <label className="text-xs font-semibold text-slate-500">
                  Website
                  <input
                    value={socialForm.website}
                    onChange={(event) => setSocialForm((current) => ({ ...current, website: event.target.value }))}
                    className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-500"
                  />
                </label>
                <label className="text-xs font-semibold text-slate-500">
                  Instagram
                  <input
                    value={socialForm.instagram}
                    onChange={(event) => setSocialForm((current) => ({ ...current, instagram: event.target.value }))}
                    className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-500"
                  />
                </label>
                <label className="text-xs font-semibold text-slate-500">
                  Twitter
                  <input
                    value={socialForm.twitter}
                    onChange={(event) => setSocialForm((current) => ({ ...current, twitter: event.target.value }))}
                    className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-500"
                  />
                </label>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={handleSocialSave}
                  disabled={saving}
                  className="rounded-lg bg-indigo-600 px-6 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:bg-indigo-300"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          ) : null}

          {activeTab === 2 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <h3 className="text-base font-semibold text-slate-900">Notification Preferences</h3>
              <p className="mt-1 text-sm text-slate-500">These toggles persist through the backend notification preference endpoint.</p>

              <div className="mt-6 space-y-4">
                {[
                  ['applicationNotifications', 'Application notifications'],
                  ['jobNotifications', 'Job notifications'],
                  ['recommendationNotifications', 'Recommendation notifications'],
                ].map(([key, label]) => (
                  <label key={key} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <span className="text-sm font-medium text-slate-700">{label}</span>
                    <input
                      type="checkbox"
                      checked={notificationForm[key]}
                      onChange={(event) => setNotificationForm((current) => ({ ...current, [key]: event.target.checked }))}
                      className="h-4 w-4 rounded border-slate-300 text-indigo-600"
                    />
                  </label>
                ))}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={handleNotificationSave}
                  disabled={saving}
                  className="rounded-lg bg-indigo-600 px-6 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:bg-indigo-300"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
