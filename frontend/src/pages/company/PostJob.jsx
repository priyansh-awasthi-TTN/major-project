import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CompanyTopBar from '../../components/CompanyTopBar';
import apiService from '../../services/api';

const TYPES = ['Full-Time', 'Part-Time', 'Remote', 'Internship', 'Contract'];
const ALL_CATS = ['Design', 'Sales', 'Marketing', 'Finance', 'Technology', 'Engineering', 'Business', 'Human Resource'];
const ALL_SKILLS = ['Graphic Design', 'Communication', 'Illustration', 'UI/UX', 'Figma', 'React', 'Node.js', 'Python', 'Java', 'SQL', 'Project Management', 'Copywriting', 'SEO', 'Data Analysis'];

const PERKS = [
  { id: 'healthcare',  icon: '🩺', label: 'Full Healthcare',    desc: 'We believe in thriving communities and that starts with our team being happy and healthy.' },
  { id: 'vacation',   icon: '🏖️', label: 'Unlimited Vacation',  desc: 'We believe you should have a flexible schedule that makes space for family, wellness, and fun.' },
  { id: 'skills',     icon: '📚', label: 'Skill Development',   desc: 'We believe in always learning and leveling up our skills. Whether it\'s a conference or online course.' },
  { id: 'summits',    icon: '🏔️', label: 'Team Summits',        desc: 'Every 6 months we have a full team summit where we have fun and connect with the team.' },
  { id: 'remote',     icon: '🏠', label: 'Remote Working',      desc: 'You know how you work best. Work from home, a coffee shop, or anywhere that works for you.' },
  { id: 'commuter',   icon: '🚌', label: 'Commuter Benefits',   desc: 'We\'re grateful for all the time and energy each team member puts into getting to work every day.' },
  { id: 'giveback',   icon: '🤝', label: 'We give back',        desc: 'We anonymously match any donation our employees make (up to $/€ 600) so they can support the causes they love.' },
  { id: 'flexible',   icon: '⏰', label: 'Flexible Team',       desc: 'We believe in a healthy work-life balance and offer flexible working hours to all our team members.' },
];

// Rich text area with toolbar (visual only — stores plain text)
function RichTextArea({ value, onChange, placeholder, maxLen = 500 }) {
  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-200 transition">
      <textarea
        value={value}
        onChange={e => onChange(e.target.value.slice(0, maxLen))}
        rows={4}
        placeholder={placeholder}
        className="w-full px-4 py-3 text-sm outline-none resize-none text-gray-700 placeholder-gray-400"
      />
      <div className="flex items-center justify-between px-3 py-2 border-t border-gray-100 bg-gray-50">
        <div className="flex items-center gap-3 text-gray-400">
          <button type="button" className="hover:text-gray-600 text-sm">😊</button>
          <button type="button" className="hover:text-gray-600 font-bold text-sm">B</button>
          <button type="button" className="hover:text-gray-600 italic text-sm">I</button>
          <button type="button" className="hover:text-gray-600 text-sm">≡</button>
          <button type="button" className="hover:text-gray-600 text-sm">☰</button>
          <button type="button" className="hover:text-gray-600 text-sm">🔗</button>
        </div>
        <span className="text-xs text-gray-400">Maximum {maxLen} characters &nbsp; {value.length} / {maxLen}</span>
      </div>
    </div>
  );
}

// Two-column form row
function FormRow({ label, hint, children }) {
  return (
    <div className="grid grid-cols-5 gap-8 py-6 border-b border-gray-100 last:border-0">
      <div className="col-span-2">
        <p className="text-sm font-semibold text-gray-900">{label}</p>
        {hint && <p className="text-xs text-gray-400 mt-1 leading-relaxed">{hint}</p>}
      </div>
      <div className="col-span-3">{children}</div>
    </div>
  );
}

export default function PostJob() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  // Step 0
  const [title, setTitle]           = useState('');
  const [selTypes, setSelTypes]     = useState([]);
  const [salaryMin, setSalaryMin]   = useState(5000);
  const [salaryMax, setSalaryMax]   = useState(22000);
  const [selCats, setSelCats]       = useState([]);
  const [catOpen, setCatOpen]       = useState(false);
  const [skills, setSkills]         = useState(['Graphic Design', 'Communication', 'Illustrator']);
  const [skillInput, setSkillInput] = useState('');
  const [skillSugg, setSkillSugg]   = useState([]);

  // Step 1
  const [desc, setDesc]             = useState('');
  const [resp, setResp]             = useState('');
  const [who, setWho]               = useState('');
  const [nice, setNice]             = useState('');

  // Step 2
  const [selPerks, setSelPerks]     = useState(['healthcare', 'vacation', 'skills']);

  const toggleType = (t) => setSelTypes(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t]);
  const toggleCat  = (c) => setSelCats(p => p.includes(c) ? p.filter(x => x !== c) : [...p, c]);
  const togglePerk = (id) => setSelPerks(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const addSkill = (s) => {
    const v = s.trim();
    if (v && !skills.includes(v)) setSkills(p => [...p, v]);
    setSkillInput(''); setSkillSugg([]);
  };
  const removeSkill = (s) => setSkills(p => p.filter(x => x !== s));
  const onSkillInput = (v) => {
    setSkillInput(v);
    setSkillSugg(v.trim() ? ALL_SKILLS.filter(s => s.toLowerCase().includes(v.toLowerCase()) && !skills.includes(s)) : []);
  };

  const handleSubmit = async () => {
    if (!title.trim()) { setError('Job title is required.'); return; }
    setSubmitting(true); setError('');
    try {
      await apiService.createJob({
        title,
        type: selTypes[0] || 'Full-Time',
        categories: selCats.join(','),
        salary: salaryMin,
        description: [
          desc && `Description:\n${desc}`,
          resp && `Responsibilities:\n${resp}`,
          who  && `Who You Are:\n${who}`,
          nice && `Nice-To-Haves:\n${nice}`,
          selPerks.length && `Perks: ${selPerks.map(id => PERKS.find(p => p.id === id)?.label).join(', ')}`,
        ].filter(Boolean).join('\n\n'),
        logo: title.substring(0, 2).toUpperCase(),
        color: 'bg-indigo-600',
        capacity: 10,
      });
      setDone(true);
    } catch (e) {
      setError(e.message || 'Failed to post job.');
    } finally {
      setSubmitting(false);
    }
  };

  const stepIcons = ['💼', '📋', '🎁'];
  const stepLabels = ['Job Information', 'Job Description', 'Perks & Benefit'];

  if (done) return (
    <div className="flex-1 flex flex-col bg-white min-h-screen">
      <CompanyTopBar title="Post a Job" />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl p-12 border border-gray-200 shadow-sm max-w-md">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Job Posted Successfully!</h2>
          <p className="text-sm text-gray-500 mb-6">Your job listing is now live and visible to all job seekers.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => { setDone(false); setStep(0); setTitle(''); setSelTypes([]); setSelCats([]); setDesc(''); setResp(''); setWho(''); setNice(''); setSelPerks(['healthcare','vacation','skills']); }}
              className="border border-gray-300 text-gray-600 px-5 py-2 rounded-lg text-sm hover:bg-gray-50">Post Another</button>
            <button onClick={() => navigate('/company/jobs')}
              className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-indigo-700">View Listings</button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
      <CompanyTopBar title="Post a Job" />

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-10 py-8 w-full">

          {/* Page title */}
          <div className="flex items-center gap-3 mb-8">
            <button onClick={() => step > 0 ? setStep(s => s - 1) : navigate('/company/jobs')}
              className="text-gray-500 hover:text-gray-800 flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 transition">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Post a Job</h1>
          </div>

          {/* Stepper */}
          <div className="flex rounded-xl border border-gray-200 overflow-hidden mb-8">
            {stepLabels.map((label, i) => (
              <div key={i} className={`flex-1 flex items-center gap-3 px-5 py-4 ${i < stepLabels.length - 1 ? 'border-r border-gray-200' : ''} ${i <= step ? 'bg-indigo-600' : 'bg-white'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 ${i <= step ? 'bg-white/20' : 'bg-gray-100'}`}>
                  <span>{stepIcons[i]}</span>
                </div>
                <div>
                  <p className={`text-xs font-medium ${i <= step ? 'text-indigo-200' : 'text-gray-400'}`}>Step {i + 1}/3</p>
                  <p className={`text-sm font-bold ${i <= step ? 'text-white' : 'text-gray-500'}`}>{label}</p>
                </div>
              </div>
            ))}
          </div>

          {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-6">{error}</div>}

          {/* Step 0 */}
          {step === 0 && (
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="px-8 py-5 border-b border-gray-100">
                <h2 className="font-bold text-gray-900">Basic Information</h2>
                <p className="text-sm text-gray-400 mt-0.5">This information will be displayed publicly</p>
              </div>
              <div className="px-8">
                <FormRow label="Job Title" hint="Job titles must be describe one position">
                  <input value={title} onChange={e => setTitle(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200"
                    placeholder="e.g. Software Engineer" />
                  <p className="text-xs text-gray-400 mt-1">At least 80 characters</p>
                </FormRow>
                <FormRow label="Type of Employment" hint="You can select multiple type of employment">
                  <div className="space-y-3">
                    {TYPES.map(t => (
                      <label key={t} className="flex items-center gap-3 cursor-pointer" onClick={() => toggleType(t)}>
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition ${selTypes.includes(t) ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300 hover:border-indigo-400'}`}>
                          {selTypes.includes(t) && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                        </div>
                        <span className="text-sm text-gray-700">{t}</span>
                      </label>
                    ))}
                  </div>
                </FormRow>
                <FormRow label="Salary" hint="Please specify the estimated salary range for the role. *You can leave this blank">
                  <div className="space-y-3">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 w-36">
                        <span className="text-gray-400 text-sm">$</span>
                        <input type="number" value={salaryMin} onChange={e => setSalaryMin(Math.min(Number(e.target.value), salaryMax - 500))} className="flex-1 text-sm outline-none text-gray-700 w-full" />
                      </div>
                      <span className="text-gray-400 text-sm">to</span>
                      <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 w-36">
                        <span className="text-gray-400 text-sm">$</span>
                        <input type="number" value={salaryMax} onChange={e => setSalaryMax(Math.max(Number(e.target.value), salaryMin + 500))} className="flex-1 text-sm outline-none text-gray-700 w-full" />
                      </div>
                    </div>
                    <div className="relative h-5 flex items-center">
                      <div className="w-full h-1.5 bg-gray-200 rounded-full relative">
                        <div className="absolute h-1.5 bg-indigo-600 rounded-full" style={{ left: `${(salaryMin / 50000) * 100}%`, right: `${100 - (salaryMax / 50000) * 100}%` }} />
                      </div>
                      <input type="range" min="0" max="50000" step="500" value={salaryMin} onChange={e => setSalaryMin(Math.min(Number(e.target.value), salaryMax - 500))} className="absolute w-full h-1.5 opacity-0 cursor-pointer" />
                      <input type="range" min="0" max="50000" step="500" value={salaryMax} onChange={e => setSalaryMax(Math.max(Number(e.target.value), salaryMin + 500))} className="absolute w-full h-1.5 opacity-0 cursor-pointer" />
                    </div>
                  </div>
                </FormRow>
                <FormRow label="Categories" hint="You can select multiple job categories">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Select Job Categories</p>
                    <div className="relative">
                      <button type="button" onClick={() => setCatOpen(o => !o)}
                        className="w-72 flex items-center justify-between border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-500 hover:border-indigo-400 transition">
                        <span>{selCats.length ? selCats.join(', ') : 'Select Job Categories'}</span>
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>
                      </button>
                      {catOpen && (
                        <div className="absolute top-full mt-1 w-72 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-2">
                          {ALL_CATS.map(c => (
                            <label key={c} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer" onClick={() => toggleCat(c)}>
                              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${selCats.includes(c) ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300'}`}>
                                {selCats.includes(c) && <svg width="8" height="6" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                              </div>
                              <span className="text-sm text-gray-700">{c}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </FormRow>
                <FormRow label="Required Skills" hint="Add required skills for the job">
                  <div>
                    <button type="button" onClick={() => document.getElementById('skill-input').focus()}
                      className="flex items-center gap-1.5 border border-indigo-500 text-indigo-600 text-sm px-4 py-1.5 rounded-lg hover:bg-indigo-50 transition mb-3">
                      <span className="text-lg leading-none">+</span> Add Skills
                    </button>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {skills.map(s => (
                        <span key={s} className="flex items-center gap-1.5 text-sm text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-full px-3 py-1">
                          {s}
                          <button type="button" onClick={() => removeSkill(s)} className="text-indigo-400 hover:text-indigo-700 leading-none">×</button>
                        </span>
                      ))}
                    </div>
                    <div className="relative">
                      <input id="skill-input" value={skillInput} onChange={e => onSkillInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(skillInput); } }}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 w-64"
                        placeholder="Type a skill and press Enter" />
                      {skillSugg.length > 0 && (
                        <div className="absolute top-full mt-1 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-1">
                          {skillSugg.slice(0, 5).map(s => (
                            <button key={s} type="button" onClick={() => addSkill(s)}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600">{s}</button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </FormRow>
              </div>
            </div>
          )}

          {/* Step 1 */}
          {step === 1 && (
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="px-8 py-5 border-b border-gray-100">
                <h2 className="font-bold text-gray-900">Details</h2>
                <p className="text-sm text-gray-400 mt-0.5">Add the description of the job, responsibilities, who you are, and nice-to-haves.</p>
              </div>
              <div className="px-8">
                {[
                  { label: 'Job Descriptions', hint: 'Job titles must be describe one position', value: desc, set: setDesc, ph: 'Enter job description' },
                  { label: 'Responsibilities', hint: 'Outline the core responsibilities of the position', value: resp, set: setResp, ph: 'Enter job responsibilities' },
                  { label: 'Who You Are', hint: 'Add your preferred candidates qualifications', value: who, set: setWho, ph: 'Enter qualifications' },
                  { label: 'Nice-To-Haves', hint: 'Add nice-to-have skills and qualifications for the role to encourage a more diverse set of candidates to apply', value: nice, set: setNice, ph: 'Enter nice-to-haves' },
                ].map(({ label, hint, value, set, ph }) => (
                  <FormRow key={label} label={label} hint={hint}>
                    <RichTextArea value={value} onChange={set} placeholder={ph} />
                  </FormRow>
                ))}
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="px-8 py-5 border-b border-gray-100">
                <h2 className="font-bold text-gray-900">Basic Information</h2>
                <p className="text-sm text-gray-400 mt-0.5">List out your top perks and benefits.</p>
              </div>
              <div className="px-8 py-6">
                <div className="grid grid-cols-5 gap-8">
                  <div className="col-span-2">
                    <p className="text-sm font-semibold text-gray-900">Perks and Benefits</p>
                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">Encourage more people to apply by sharing the attractive rewards and benefits you offer your employees</p>
                  </div>
                  <div className="col-span-3">
                    <div className="mb-4">
                      <button type="button" onClick={() => { const next = PERKS.find(p => !selPerks.includes(p.id)); if (next) togglePerk(next.id); }}
                        className="flex items-center gap-1.5 border border-indigo-500 text-indigo-600 text-sm px-4 py-1.5 rounded-lg hover:bg-indigo-50 transition">
                        <span className="text-lg leading-none">+</span> Add Benefit
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {PERKS.filter(p => selPerks.includes(p.id)).map(p => (
                        <div key={p.id} className="border border-gray-200 rounded-xl p-4 relative">
                          <button type="button" onClick={() => togglePerk(p.id)}
                            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
                          <div className="text-2xl mb-3">{p.icon}</div>
                          <p className="font-semibold text-gray-900 text-sm mb-1">{p.label}</p>
                          <p className="text-xs text-gray-500 leading-relaxed">{p.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Sticky bottom action bar */}
      <div className="flex-shrink-0 flex items-center justify-between px-10 py-4 border-t border-gray-200 bg-white">
        <div>
          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)}
              className="border border-gray-300 text-gray-600 px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
              Back
            </button>
          )}
        </div>
        <div>
          {step < 2 ? (
            <button onClick={() => {
              setError('');
              if (step === 0 && !title.trim()) { setError('Job title is required.'); return; }
              setStep(s => s + 1);
            }} className="bg-indigo-600 text-white px-8 py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition">
              Next Step
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={submitting}
              className="bg-indigo-600 text-white px-8 py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-60 disabled:cursor-not-allowed">
              {submitting ? 'Posting...' : 'Do a Review'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
