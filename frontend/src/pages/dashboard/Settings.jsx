import { useState } from 'react';
import { Link } from 'react-router-dom';
const tabs = ['My Profile', 'Login Details', 'Notifications'];
export default function Settings() {
  const [activeTab, setActiveTab] = useState(0);
  return (
    <div className="flex-1 p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <Link to="/" className="border border-gray-300 text-gray-600 text-sm px-4 py-2 rounded-lg">Back to homepage</Link>
      </div>
      <div className="flex gap-1 border-b border-gray-200 mb-6">
        {tabs.map((tab, i) => (
          <button key={tab} onClick={() => setActiveTab(i)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition ${activeTab === i ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}>
            {tab}
          </button>
        ))}
      </div>
      {activeTab === 0 && (
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm font-medium text-gray-700 block mb-1">Full Name</label><input defaultValue="Jake Gyll" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none" /></div>
                <div><label className="text-sm font-medium text-gray-700 block mb-1">Phone</label><input defaultValue="+44 1245 572 135" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none" /></div>
                <div><label className="text-sm font-medium text-gray-700 block mb-1">Email</label><input defaultValue="jakegyll@email.com" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none" /></div>
                <div><label className="text-sm font-medium text-gray-700 block mb-1">Date of Birth</label><input defaultValue="14 July 1987" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none" /></div>
              </div>
              <button className="mt-5 bg-blue-600 text-white px-6 py-2 rounded-lg text-sm">Save Profile</button>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-200 h-fit">
            <h3 className="font-semibold text-gray-900 mb-3">Profile Photo</h3>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold text-xl mx-auto mb-2">JG</div>
              <p className="text-xs text-gray-500">Click to replace or drag and drop</p>
            </div>
          </div>
        </div>
      )}
      {activeTab === 1 && (
        <div className="max-w-lg space-y-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3">Update Email</h3>
            <input defaultValue="jakegyll@email.com" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none mb-3" />
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">Update Email</button>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Change Password</h3>
            <div className="space-y-3">
              <div><label className="text-sm font-medium text-gray-700 block mb-1">Old Password</label><input type="password" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none" /></div>
              <div><label className="text-sm font-medium text-gray-700 block mb-1">New Password</label><input type="password" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none" /></div>
              <div><label className="text-sm font-medium text-gray-700 block mb-1">Confirm Password</label><input type="password" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none" /></div>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">Change Password</button>
            </div>
          </div>
        </div>
      )}
      {activeTab === 2 && (
        <div className="max-w-lg">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-6">Notifications</h3>
            {[{label:'Applications',desc:'Notifications for jobs you applied to.'},{label:'Recommendations',desc:'Personalized recommendations based on your profile.'}].map(n => (
              <div key={n.label} className="flex items-start justify-between gap-4 pb-5 border-b border-gray-100 last:border-0 last:pb-0 mb-5">
                <div><p className="text-sm font-medium text-gray-800">{n.label}</p><p className="text-xs text-gray-500 mt-0.5">{n.desc}</p></div>
                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-10 h-5 bg-gray-200 peer-checked:bg-blue-600 rounded-full peer peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
                </label>
              </div>
            ))}
            <button className="mt-2 bg-blue-600 text-white px-6 py-2 rounded-lg text-sm">Save Changes</button>
          </div>
        </div>
      )}
    </div>
  );
}
