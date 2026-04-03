import { useEffect, useRef, useState } from 'react';
import DashTopBar from '../../components/DashTopBar';
import { useAuth } from '../../context/AuthContext';
import BlockedUsersList from '../../components/messaging/BlockedUsersList';
import apiService from '../../services/api';

const tabs = ['My Profile', 'Login Details', 'Notifications', 'Blocked Users'];

function ProfilePhotoSection({ user }) {
  const [photo, setPhoto] = useState('');
  const [dragging, setDragging] = useState(false);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef();

  useEffect(() => {
    let ignore = false;

    const fetchProfile = async () => {
      try {
        const data = await apiService.getMyProfile();
        if (!ignore) {
          setPhoto(data?.profilePhotoUrl ? apiService.resolveFileUrl(data.profilePhotoUrl) : '');
        }
      } catch (error) {
        if (!ignore) {
          setPhoto('');
        }
      }
    };

    fetchProfile();
    return () => {
      ignore = true;
    };
  }, []);

  const handleFile = async (file) => {
    if (!file || !file.type.startsWith('image/')) return;

    setSaving(true);
    try {
      const uploadResponse = await apiService.uploadFile(file);
      const savedProfile = await apiService.updateMyProfile({ profilePhotoUrl: uploadResponse.url });
      setPhoto(savedProfile?.profilePhotoUrl ? apiService.resolveFileUrl(savedProfile.profilePhotoUrl) : '');
    } catch (error) {
      console.error('Failed to update profile photo', error);
    } finally {
      setSaving(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Profile Photo</h3>
        <p className="text-xs text-gray-500 mb-4">This image will be shown publicly as your profile picture, it will help recruiters recognize you!</p>
        
        <div className="flex items-start gap-6">
          {/* Current photo */}
          <div className="flex-shrink-0">
            {photo ? (
              <img src={photo} alt="Profile" className="w-20 h-20 rounded-full object-cover" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold text-lg">
                  {(user?.fullName || 'User')
                    .split(' ')
                    .map((part) => part[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
              </div>
            )}
          </div>

          {/* Upload area */}
          <div
            onClick={() => inputRef.current.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={`flex-1 border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition ${
              dragging ? 'border-indigo-400 bg-indigo-50' : 'border-gray-300 hover:border-indigo-300 hover:bg-gray-50'
            }`}
          >
            <div className="text-gray-400 mb-2">
              <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm text-gray-600 mb-1">{saving ? 'Uploading profile photo...' : 'Click to replace or drag and drop'}</p>
            <p className="text-xs text-gray-400">SVG, PNG, JPG or GIF (max. 400 x 400px)</p>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files[0])}
          />
        </div>
      </div>
    </div>
  );
}

function PersonalDetailsForm({ user }) {
  const [accountType, setAccountType] = useState('jobSeeker');

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Personal Details</h3>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input 
              defaultValue={user?.fullName || ''} 
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" 
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input 
              defaultValue="+44 1245 572 135" 
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" 
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input 
              defaultValue={user?.email || ''} 
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" 
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Date of Birth <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input 
                defaultValue="09/08/1997" 
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 pr-10 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" 
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="col-span-1">
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Gender <span className="text-red-500">*</span>
            </label>
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white">
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
              <option>Prefer not to say</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Account Type</h3>
        <p className="text-xs text-gray-500 mb-4">You can update your account type</p>
        
        <div className="space-y-3">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="radio"
              name="accountType"
              value="jobSeeker"
              checked={accountType === 'jobSeeker'}
              onChange={(e) => setAccountType(e.target.value)}
              className="mt-0.5 w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
            />
            <div>
              <p className="text-sm font-medium text-gray-900">Job Seeker</p>
              <p className="text-xs text-gray-500">Looking for a job</p>
            </div>
          </label>
          
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="radio"
              name="accountType"
              value="employer"
              checked={accountType === 'employer'}
              onChange={(e) => setAccountType(e.target.value)}
              className="mt-0.5 w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
            />
            <div>
              <p className="text-sm font-medium text-gray-900">Employer</p>
              <p className="text-xs text-gray-500">Hiring, sourcing candidates, or posting a jobs</p>
            </div>
          </label>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition">
          Save Profile
        </button>
      </div>
    </div>
  );
}

function NotificationsTab() {
  const [checks, setChecks] = useState({ applications: true, jobs: false, recommendations: false });
  const toggle = key => setChecks(prev => ({ ...prev, [key]: !prev[key] }));

  const items = [
    { key: 'applications', label: 'Applications', desc: 'These are notifications for jobs that you have applied to' },
    { key: 'jobs', label: 'Jobs', desc: 'These are notifications for job posts that might be relevant to you' },
    { key: 'recommendations', label: 'Recommendations', desc: 'These are notifications for personalized recommendations based on your profile' },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900">Basic Information</h3>
        <p className="text-sm text-gray-500 mt-0.5">This is notifications preferences that you can update anytime.</p>
      </div>
      <div className="grid grid-cols-3 divide-x divide-gray-200">
        <div className="p-6">
          <p className="text-sm font-semibold text-gray-900">Notifications</p>
          <p className="text-xs text-gray-500 mt-1">Customize your preferred notification settings</p>
        </div>
        <div className="col-span-2 p-6 space-y-5">
          {items.map(item => (
            <label key={item.key} className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={checks[item.key]}
                onChange={() => toggle(item.key)}
                className="mt-0.5 w-4 h-4 accent-indigo-600 cursor-pointer"
              />
              <div>
                <p className="text-sm font-medium text-gray-800">{item.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
              </div>
            </label>
          ))}
          <div className="pt-2">
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition">
              Update Email
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Settings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50">
      <DashTopBar title="Settings" />

      <div className="overflow-y-auto flex-1 p-8">
        <div className="flex gap-1 border-b border-gray-200 mb-8">
          {tabs.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
                activeTab === i ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 0 && (
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
              <p className="text-sm text-gray-500 mt-1">This is your personal information that you can update anytime.</p>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-5 gap-8">
                <div className="col-span-2">
                  <ProfilePhotoSection user={user} />
                </div>
                <div className="col-span-3">
                  <PersonalDetailsForm user={user} />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 1 && (
          <div className="max-w-lg space-y-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">Update Email</h3>
              <input defaultValue={user?.email || ''} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400 mb-3" />
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">Update Email</button>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">Change Password</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Old Password</label>
                  <input type="password" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">New Password</label>
                  <input type="password" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Confirm Password</label>
                  <input type="password" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400" />
                </div>
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">Change Password</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 2 && <NotificationsTab />}

        {activeTab === 3 && (
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Blocked Users</h2>
              <p className="text-sm text-gray-500 mt-1">Users you have blocked will no longer appear in your Messages inbox. You can unblock them at any time.</p>
            </div>
            <div className="p-6">
              <BlockedUsersList />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
