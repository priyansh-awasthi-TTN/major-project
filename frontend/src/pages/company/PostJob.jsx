import { useState } from 'react';
import CompanyTopBar from '../../components/CompanyTopBar';

const steps = ['Job Information', 'Job Description', 'Perks & Benefit'];

const perksOptions = [
  { label: 'Full Healthcare', desc: 'We believe in providing full healthcare coverage for our team.' },
  { label: 'Unlimited Vacation', desc: 'We believe you should have a schedule that makes you happy and healthy.' },
  { label: 'Skill Development', desc: 'We believe in always learning and leveling up our skills.' },
  { label: 'Team Summits', desc: 'Every 6 months we have a full team summit where we have fun.' },
  { label: 'Remote Working', desc: 'You can work from anywhere that works for you.' },
  { label: 'Commuter Benefits', desc: "We're grateful for all the time you spend getting to work." },
];

export default function PostJob() {
  const [step, setStep] = useState(0);
  const [selectedPerks, setSelectedPerks] = useState([]);

  const togglePerk = (p) => setSelectedPerks(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);

  return (
    <div className="flex-1 flex flex-col bg-gray-50 min-h-screen">
      <CompanyTopBar title="Post a Job" />
      <div className="p-8 max-w-3xl">
        {/* Stepper */}
        <div className="flex items-center gap-4 mb-8">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i <= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>{i + 1}</div>
              <span className={`text-sm font-medium ${i === step ? 'text-blue-600' : 'text-gray-400'}`}>{s}</span>
              {i < steps.length - 1 && <div className="w-12 h-px bg-gray-300 ml-2" />}
            </div>
          ))}
        </div>

        {/* Step 0: Job Information */}
        {step === 0 && (
          <div className="bg-white rounded-xl p-6 border border-gray-200 space-y-5">
            <div>
              <h2 className="font-semibold text-gray-900 mb-1">Basic Information</h2>
              <p className="text-sm text-gray-500">This information will be displayed publicly</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Job Title</label>
              <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" placeholder="e.g. Software Engineer" />
              <p className="text-xs text-gray-400 mt-1">At least 80 characters</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Type of Employment</label>
              <div className="space-y-2">
                {['Full Time', 'Part Time', 'Remote', 'Internship', 'Contract'].map(t => (
                  <label key={t} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                    <input type="checkbox" className="accent-blue-600" />{t}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Salary</label>
              <p className="text-xs text-gray-400 mb-2">Please specify the estimated salary range for the role. You can leave this blank.</p>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">$1,000</span>
                <input type="range" min="1000" max="10000" defaultValue="5000" className="flex-1 accent-blue-600" />
                <span className="text-sm text-gray-500">$10,000</span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Categories</label>
              <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500">
                <option>Select job categories</option>
                <option>Design</option>
                <option>Engineering</option>
                <option>Marketing</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Required Skills</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {['Graphic Design', 'Communication', 'Illustration'].map(s => (
                  <span key={s} className="text-xs bg-orange-50 text-orange-600 border border-orange-200 rounded px-2 py-1 flex items-center gap-1">
                    {s} <button className="text-orange-400 hover:text-orange-600">✕</button>
                  </span>
                ))}
              </div>
              <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" placeholder="Add required skills for the job" />
            </div>
            <div className="flex justify-end">
              <button onClick={() => setStep(1)} className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-blue-700">Next Step</button>
            </div>
          </div>
        )}

        {/* Step 1: Job Description */}
        {step === 1 && (
          <div className="bg-white rounded-xl p-6 border border-gray-200 space-y-5">
            <div>
              <h2 className="font-semibold text-gray-900 mb-1">Details</h2>
              <p className="text-sm text-gray-500">Add the description of the job, responsibilities, who you are, and nice-to-haves.</p>
            </div>
            {['Job Descriptions', 'Responsibilities', 'Who You Are', 'Nice-To-Haves'].map(field => (
              <div key={field}>
                <label className="text-sm font-medium text-gray-700 block mb-1">{field}</label>
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  <div className="flex gap-2 px-3 py-2 border-b border-gray-200 bg-gray-50">
                    {['B', 'I', 'U', '≡', '🔗', '📎'].map(t => (
                      <button key={t} className="text-xs text-gray-500 hover:text-gray-800 px-1">{t}</button>
                    ))}
                  </div>
                  <textarea rows={3} className="w-full px-3 py-2 text-sm outline-none resize-none" placeholder={`Enter ${field.toLowerCase()}...`} />
                </div>
              </div>
            ))}
            <div className="flex justify-between">
              <button onClick={() => setStep(0)} className="border border-gray-300 text-gray-600 px-6 py-2 rounded-lg text-sm hover:bg-gray-50">Back</button>
              <button onClick={() => setStep(2)} className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-blue-700">Next Step</button>
            </div>
          </div>
        )}

        {/* Step 2: Perks & Benefits */}
        {step === 2 && (
          <div className="bg-white rounded-xl p-6 border border-gray-200 space-y-5">
            <div>
              <h2 className="font-semibold text-gray-900 mb-1">Perks & Benefits</h2>
              <p className="text-sm text-gray-500">Encourage more people to apply by sharing the attractive perks and benefits you offer your employees.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {perksOptions.map(perk => (
                <div key={perk.label} onClick={() => togglePerk(perk.label)}
                  className={`p-4 border-2 rounded-xl cursor-pointer transition ${selectedPerks.includes(perk.label) ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}>
                  <div className="text-2xl mb-2">🎁</div>
                  <p className="font-medium text-gray-800 text-sm">{perk.label}</p>
                  <p className="text-xs text-gray-500 mt-1">{perk.desc}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-between">
              <button onClick={() => setStep(1)} className="border border-gray-300 text-gray-600 px-6 py-2 rounded-lg text-sm hover:bg-gray-50">Back</button>
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-blue-700">Do a Review</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
