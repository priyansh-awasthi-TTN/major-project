import { useState } from 'react';
import CompanyTopBar from '../../components/CompanyTopBar';
import { teamMembers } from '../../data/companyMockData';

const tabs = ['Overview', 'Social Links', 'Team'];

export default function CompanySettings() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="flex-1 flex flex-col bg-gray-50 min-h-screen">
      <CompanyTopBar title="Settings" />
      <div className="p-8 max-w-4xl">
        <div className="flex gap-1 border-b border-gray-200 mb-6">
          {tabs.map((tab, i) => (
            <button key={tab} onClick={() => setActiveTab(i)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition ${activeTab === i ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {tab}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === 0 && (
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 space-y-6">
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-1">Basic Information</h3>
                <p className="text-sm text-gray-500 mb-4">This is company information that you can update anytime.</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Company Name</label>
                    <input defaultValue="Nomad" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Website</label>
                    <input defaultValue="https://nomad.com" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Location</label>
                    <div className="flex gap-2">
                      <select className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500">
                        <option>English</option>
                        <option>Japan</option>
                        <option>Australia</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Employee</label>
                    <div className="flex gap-2">
                      <select className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500">
                        <option>1 - 50</option>
                        <option>51 - 200</option>
                        <option>201 - 500</option>
                      </select>
                      <select className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500">
                        <option>Technology</option>
                        <option>Finance</option>
                        <option>Design</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Date Founded</label>
                    <input defaultValue="July 31, 2011" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Tech Stack</label>
                    <div className="flex flex-wrap gap-2 border border-gray-300 rounded-lg px-3 py-2">
                      {['HTML 5', 'CSS 3', 'Laravel NF'].map(t => (
                        <span key={t} className="text-xs bg-gray-100 text-gray-700 rounded px-2 py-0.5 flex items-center gap-1">
                          {t} <button className="text-gray-400 hover:text-gray-600">✕</button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="text-sm font-medium text-gray-700 block mb-1">About Company</label>
                  <textarea rows={4} defaultValue="Stripe is part of the Information Technology industry. Worldwide members work in experienced high-level limited businesses. It has over 50 small employees and builds all of its products and generates $3.5 million in sales." className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 resize-none" />
                </div>
                <button className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-blue-700">Save Changes</button>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 border border-gray-200 h-fit">
              <h3 className="font-semibold text-gray-900 mb-3">Company Logo</h3>
              <p className="text-xs text-gray-500 mb-3">This image will be shown publicly as your company logo.</p>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-blue-400">
                <div className="w-16 h-16 rounded-xl bg-emerald-500 flex items-center justify-center text-white font-bold text-2xl mx-auto mb-2">N</div>
                <p className="text-xs text-gray-500">Click to replace or drag and drop</p>
                <p className="text-xs text-gray-400 mt-1">SVG, PNG, JPG (max. 400x400px)</p>
              </div>
            </div>
          </div>
        )}

        {/* Social Links */}
        {activeTab === 1 && (
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-1">Basic Information</h3>
              <p className="text-sm text-gray-500 mb-4">Add elsewhere links to your company profile. You can add only username without full https links.</p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200 space-y-4">
              {[
                { label: 'Instagram', placeholder: 'https://www.instagram.com/nomad/' },
                { label: 'Twitter', placeholder: 'https://twitter.com/nomad/' },
                { label: 'Facebook', placeholder: 'https://web.facebook.com/nomad/' },
                { label: 'LinkedIn', placeholder: 'Enter your LinkedIn address' },
                { label: 'YouTube', placeholder: 'Enter your youtube link' },
              ].map(s => (
                <div key={s.label}>
                  <label className="text-sm font-medium text-gray-700 block mb-1">{s.label}</label>
                  <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" placeholder={s.placeholder} />
                </div>
              ))}
              <button className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700">Save Changes</button>
            </div>
          </div>
        )}

        {/* Team */}
        {activeTab === 2 && (
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-gray-900">Basic Information</h3>
              <div className="flex gap-2">
                <button className="bg-blue-600 text-white text-sm px-3 py-1.5 rounded-lg hover:bg-blue-700">+ Add Members</button>
                <button className="border border-gray-300 text-gray-600 text-sm px-2 py-1.5 rounded-lg">⊞</button>
                <button className="border border-gray-300 text-gray-600 text-sm px-2 py-1.5 rounded-lg">☰</button>
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-6">Add team members of your company</p>
            <p className="text-sm font-medium text-gray-700 mb-4">50 Members</p>
            <div className="grid grid-cols-3 gap-4">
              {teamMembers.map(member => (
                <div key={member.name} className="border border-gray-200 rounded-xl p-4 text-center">
                  <div className={`${member.color} text-white rounded-full w-14 h-14 flex items-center justify-center font-bold text-lg mx-auto mb-3`}>{member.avatar}</div>
                  <p className="font-medium text-gray-800 text-sm">{member.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{member.role}</p>
                  <div className="flex justify-center gap-2 mt-3">
                    <button className="text-gray-400 hover:text-gray-600 text-xs border border-gray-200 rounded px-2 py-1">✏️</button>
                    <button className="text-gray-400 hover:text-red-500 text-xs border border-gray-200 rounded px-2 py-1">🗑️</button>
                    <button className="text-gray-400 hover:text-gray-600 text-xs border border-gray-200 rounded px-2 py-1">👁️</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-6">
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-blue-700">Save Changes</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
