import { useState } from 'react';
import CompanyTopBar from '../../components/CompanyTopBar';
import { teamMembers } from '../../data/companyMockData';

const tabs = ['Overview', 'Social Links', 'Team'];

export default function CompanySettings() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-[#f5f7fb]">
      <CompanyTopBar title="Settings" />
      <div className="px-6 pb-10 pt-20">
        <div className="w-full space-y-6">
          <div className="flex items-center gap-6 border-b border-slate-200">
            {tabs.map((tab, i) => (
              <button
                key={tab}
                onClick={() => setActiveTab(i)}
                className={`-mb-px px-1 pb-3 text-sm font-semibold transition ${activeTab === i ? 'border-b-2 border-indigo-600 text-indigo-600' : 'border-b-2 border-transparent text-slate-400 hover:text-slate-600'}`}
              >
                {tab}
              </button>
            ))}
          </div>

        {/* Overview */}
        {activeTab === 0 && (
          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
            <h3 className="text-base font-semibold text-slate-900">Basic Information</h3>
            <p className="mt-1 text-sm text-slate-500">This is company information that you can update anytime.</p>

            <div className="mt-6 grid gap-6 border-t border-slate-200 pt-6 lg:grid-cols-[180px_minmax(0,1fr)]">
              <div>
                <p className="text-sm font-semibold text-slate-900">Company Logo</p>
                <p className="mt-1 text-xs text-slate-400">This image will be shown publicly as company logo.</p>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500 text-2xl font-semibold text-white">
                  N
                </div>
                <div className="flex-1 rounded-xl border border-dashed border-indigo-300 px-4 py-5 text-center">
                  <div className="mx-auto mb-2 flex h-7 w-7 items-center justify-center rounded-full border border-indigo-200 text-indigo-600">
                    ☐
                  </div>
                  <p className="text-xs font-semibold text-indigo-600">Click to replace</p>
                  <p className="mt-1 text-[11px] text-slate-400">or drag and drop</p>
                  <p className="mt-2 text-[11px] text-slate-400">SVG, PNG, JPG or GIF (max. 400 x 400px)</p>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-6 border-t border-slate-200 pt-6 lg:grid-cols-[180px_minmax(0,1fr)]">
              <div>
                <p className="text-sm font-semibold text-slate-900">Company Details</p>
                <p className="mt-1 text-xs text-slate-400">Introduce your company core info quickly to users by fill up company details.</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="text-xs font-semibold text-slate-500">
                  Company Name
                  <input
                    defaultValue="Nomad"
                    className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-500"
                  />
                </label>
                <label className="text-xs font-semibold text-slate-500">
                  Website
                  <input
                    defaultValue="https://www.nomad.com"
                    className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-500"
                  />
                </label>
                <label className="text-xs font-semibold text-slate-500">
                  Location
                  <div className="mt-2 flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs text-indigo-600">
                    {['England', 'Japan', 'Australia'].map((item) => (
                      <span key={item} className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-1">
                        {item}
                        <button className="text-indigo-400">×</button>
                      </span>
                    ))}
                    <button className="ml-auto text-slate-400">▾</button>
                  </div>
                </label>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="text-xs font-semibold text-slate-500">
                    Employee
                    <select className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-500">
                      <option>1 - 50</option>
                      <option>51 - 200</option>
                      <option>201 - 500</option>
                    </select>
                  </label>
                  <label className="text-xs font-semibold text-slate-500">
                    Industry
                    <select className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-500">
                      <option>Technology</option>
                      <option>Finance</option>
                      <option>Design</option>
                    </select>
                  </label>
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-semibold text-slate-500">Date Founded</label>
                  <div className="mt-2 grid grid-cols-3 gap-3">
                    <select className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-500">
                      <option>31</option>
                      <option>30</option>
                      <option>29</option>
                    </select>
                    <select className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-500">
                      <option>July</option>
                      <option>June</option>
                      <option>May</option>
                    </select>
                    <select className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-500">
                      <option>2021</option>
                      <option>2020</option>
                      <option>2019</option>
                    </select>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-semibold text-slate-500">Tech Stack</label>
                  <div className="mt-2 flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs text-indigo-600">
                    {['HTML 5', 'CSS 3', 'Javascript'].map((item) => (
                      <span key={item} className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-1">
                        {item}
                        <button className="text-indigo-400">×</button>
                      </span>
                    ))}
                    <button className="ml-auto text-slate-400">▾</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-6 border-t border-slate-200 pt-6 lg:grid-cols-[180px_minmax(0,1fr)]">
              <div>
                <p className="text-sm font-semibold text-slate-900">About Company</p>
                <p className="mt-1 text-xs text-slate-400">Brief description for your company. URLs are hyperlinked.</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">Description</label>
                <textarea
                  rows={5}
                  defaultValue="Nomad is part of the Information Technology industry. We believe travellers want to experience real life and meet local people. Nomad has 30 total employees across all of its locations and generates $1.50 million in sales."
                  className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-500"
                />
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Maximum 500 characters</span>
                  <span>0 / 500</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button className="rounded-lg bg-indigo-600 px-6 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
                Save Changes
              </button>
            </div>
          </div>
        )}

        {/* Social Links */}
        {activeTab === 1 && (
          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
            <div className="grid gap-6 lg:grid-cols-[180px_minmax(0,1fr)]">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Basic Information</h3>
                <p className="mt-1 text-xs text-slate-400">Add elsewhere links to your company profile. You can add only username without full https links.</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  { label: 'Instagram', placeholder: 'https://www.instagram.com/nomad/' },
                  { label: 'Twitter', placeholder: 'https://twitter.com/nomad/' },
                  { label: 'Facebook', placeholder: 'https://web.facebook.com/nomad/' },
                  { label: 'LinkedIn', placeholder: 'Enter your LinkedIn address' },
                  { label: 'Youtube', placeholder: 'Enter your youtube address' },
                ].map((item) => (
                  <label key={item.label} className="text-xs font-semibold text-slate-500">
                    {item.label}
                    <input
                      className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-500"
                      placeholder={item.placeholder}
                    />
                  </label>
                ))}
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button className="rounded-lg bg-indigo-600 px-6 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
                Save Changes
              </button>
            </div>
          </div>
        )}

        {/* Team */}
        {activeTab === 2 && (
          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Basic Information</h3>
                <p className="mt-1 text-xs text-slate-400">Add team members of your company</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">50 Members</span>
                <button className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700">+ Add Members</button>
                <button className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs text-slate-500">⊞</button>
                <button className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs text-slate-500">☰</button>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {teamMembers.map((member) => (
                <div key={member.name} className="rounded-xl border border-slate-200 bg-white p-4 text-center">
                  <div className={`${member.color} mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full text-lg font-semibold text-white`}>{member.avatar}</div>
                  <p className="text-sm font-semibold text-slate-900">{member.name}</p>
                  <p className="text-xs text-slate-400">{member.role}</p>
                  <div className="mt-3 flex items-center justify-center gap-2 text-xs text-slate-400">
                    <button className="rounded-md border border-slate-200 px-2 py-1">✏️</button>
                    <button className="rounded-md border border-slate-200 px-2 py-1">🗑️</button>
                    <button className="rounded-md border border-slate-200 px-2 py-1">👁️</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <button className="rounded-lg bg-indigo-600 px-6 py-2 text-sm font-semibold text-white hover:bg-indigo-700">Save Changes</button>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
