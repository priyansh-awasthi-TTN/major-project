import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashTopBar from '../../components/DashTopBar';

// Square-with-pencil SVG icon matching the Figma
function EditIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M13.586 3.586a2 2 0 112.828 2.828L7.5 15.414 4 16l.586-3.5 9-8.914z"
        stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3 17h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  );
}

function EditBtn({ onClick }) {
  return (
    <button onClick={onClick}
      className="w-8 h-8 flex items-center justify-center rounded-lg text-blue-600 hover:bg-blue-50 border border-blue-100 transition">
      <EditIcon />
    </button>
  );
}

// Generic modal wrapper
function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', rows }) {
  return (
    <div className="mb-4">
      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">{label}</label>
      {rows ? (
        <textarea rows={rows} value={value} onChange={e => onChange(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 resize-none" />
      ) : (
        <input type={type} value={value} onChange={e => onChange(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
      )}
    </div>
  );
}

// ── Data ──────────────────────────────────────────────────────────────────────
const initExperiences = [
  { id: 1, role: 'Product Designer', company: 'Twitter', logo: '🐦', logoBg: 'bg-sky-100 text-sky-600', type: 'Full-Time', start: 'Jun 2019', end: 'Present', duration: '1y 1m', location: 'Manchester, UK', desc: 'Created and executed social media plan for 10 brands utilizing multiple features and content types to increase brand outreach, engagement, and leads.' },
  { id: 2, role: 'Growth Marketing Designer', company: 'GoDaddy', logo: '🌐', logoBg: 'bg-green-100 text-green-600', type: 'Full-Time', start: 'Jun 2011', end: 'May 2019', duration: '8y', location: 'Manchester, UK', desc: 'Developed digital marketing strategies, activation plans, proposals, contests and promotions for client initiatives.' },
  { id: 3, role: 'UI/UX Designer', company: 'Freelance', logo: '💼', logoBg: 'bg-purple-100 text-purple-600', type: 'Contract', start: 'Jan 2009', end: 'May 2011', duration: '2y 4m', location: 'Remote', desc: 'Designed user interfaces for various clients across fintech, healthcare, and e-commerce sectors.' },
  { id: 4, role: 'Junior Designer', company: 'Accenture', logo: '🏢', logoBg: 'bg-orange-100 text-orange-600', type: 'Full-Time', start: 'Mar 2007', end: 'Dec 2008', duration: '1y 9m', location: 'London, UK', desc: 'Assisted senior designers in creating wireframes, prototypes, and visual designs for enterprise clients.' },
  { id: 5, role: 'Design Intern', company: 'BBC', logo: '📺', logoBg: 'bg-red-100 text-red-600', type: 'Internship', start: 'Jun 2006', end: 'Feb 2007', duration: '8m', location: 'London, UK', desc: 'Supported the digital design team with asset creation and brand consistency across web properties.' },
];

const initEducations = [
  { id: 1, school: 'Harvard University', logo: '🎓', logoBg: 'bg-red-100 text-red-700', degree: 'Postgraduate degree, Applied Psychology', start: '2010', end: '2012', desc: 'As an Applied Psychologist in the field of Consumer and Society, I am specialized in creating business opportunities by observing, analysing, researching and changing behaviour.' },
  { id: 2, school: 'University of Toronto', logo: '🏛️', logoBg: 'bg-blue-100 text-blue-700', degree: 'Bachelor of Arts, Visual Communication', start: '2005', end: '2009', desc: 'Studied visual communication, typography, and design theory with a focus on digital media.' },
  { id: 3, school: 'Manchester Grammar School', logo: '📚', logoBg: 'bg-green-100 text-green-700', degree: 'A-Levels: Art, Mathematics, Psychology', start: '2003', end: '2005', desc: 'Achieved top grades in art and design subjects, laying the foundation for a career in design.' },
  { id: 4, school: 'Online — Coursera', logo: '💻', logoBg: 'bg-indigo-100 text-indigo-700', degree: 'UX Design Professional Certificate', start: '2020', end: '2021', desc: "Completed Google's UX Design certificate covering user research, wireframing, and prototyping." },
];

const PORTFOLIOS = [
  { id: 1, title: 'Clinically – clinic & health care website',   color: 'from-blue-400 to-cyan-300',    emoji: '🏥' },
  { id: 2, title: 'Growthy – SaaS Analytics & Sales Website',    color: 'from-purple-400 to-pink-300',  emoji: '📊' },
  { id: 3, title: 'Planna – Project Management App',             color: 'from-orange-400 to-yellow-300',emoji: '📋' },
  { id: 4, title: 'Furino – furniture e-commerce',               color: 'from-green-400 to-teal-300',   emoji: '🛋️' },
  { id: 5, title: 'Bankio – Digital Banking App',                color: 'from-indigo-400 to-blue-300',  emoji: '🏦' },
  { id: 6, title: 'Foody – Food Delivery App',                   color: 'from-red-400 to-orange-300',   emoji: '🍔' },
];

export default function Profile() {
  const { user } = useAuth();
  const displayName = user?.fullName || 'User Name';
  const userEmail = user?.email || 'user@email.com';
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  // Profile header state
  const [profile, setProfile] = useState({ name: displayName, title: 'Product Designer', company: 'Twitter', location: 'Manchester, UK' });
  const [about, setAbout]     = useState("I'm a product designer — filmmaker currently working remotely at Twitter from beautiful Manchester, United Kingdom. I'm passionate about designing digital products that have a positive impact on the world.\n\nFor 10 years, I've specialised in interface, experience & interaction design as well as working in user research and product strategy for product agencies, big tech companies & start-ups.");
  const [details, setDetails] = useState({ email: userEmail, phone: '+44 1245 572 135', languages: 'English, French' });
  const [socials, setSocials] = useState({ instagram: 'instagram.com/user', twitter: 'twitter.com/user', website: 'www.user.com' });
  const [skills, setSkills]   = useState(['Communication', 'Analytics', 'Facebook Ads', 'Content Planning', 'Community Manager', 'Figma', 'Prototyping', 'User Research']);
  const [experiences, setExperiences] = useState(initExperiences);
  const [educations, setEducations]   = useState(initEducations);
  const [openForOpp, setOpenForOpp]   = useState(true);
  const [showAllExp, setShowAllExp]   = useState(false);
  const [showAllEdu, setShowAllEdu]   = useState(false);
  const [coverImg, setCoverImg]       = useState(null);
  const [avatarImg, setAvatarImg]     = useState(null);
  const coverInputRef  = useRef(null);
  const avatarInputRef = useRef(null);

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) setCoverImg(URL.createObjectURL(file));
  };
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) setAvatarImg(URL.createObjectURL(file));
  };

  // Modal state
  const [modal, setModal] = useState(null); // 'profile' | 'about' | 'details' | 'socials' | 'skills' | 'exp-N' | 'edu-N' | 'add-exp' | 'add-edu'

  // Temp edit buffers
  const [tmp, setTmp] = useState({});
  const openModal = (key, initial) => { setTmp(initial); setModal(key); };
  const closeModal = () => setModal(null);

  const visibleExp = showAllExp ? experiences : experiences.slice(0, 2);
  const visibleEdu = showAllEdu ? educations  : educations.slice(0, 2);

  // Save handlers
  const saveProfile = () => { setProfile(tmp); closeModal(); };
  const saveAbout   = () => { setAbout(tmp.about); closeModal(); };
  const saveDetails = () => { setDetails(tmp); closeModal(); };
  const saveSocials = () => { setSocials(tmp); closeModal(); };
  const saveSkills  = () => { setSkills(tmp.skills.split(',').map(s => s.trim()).filter(Boolean)); closeModal(); };
  const saveExp = () => {
    if (modal === 'add-exp') {
      setExperiences(prev => [...prev, { ...tmp, id: Date.now(), logo: '💼', logoBg: 'bg-gray-100 text-gray-600' }]);
    } else {
      setExperiences(prev => prev.map(e => e.id === tmp.id ? tmp : e));
    }
    closeModal();
  };
  const saveEdu = () => {
    if (modal === 'add-edu') {
      setEducations(prev => [...prev, { ...tmp, id: Date.now(), logo: '🎓', logoBg: 'bg-gray-100 text-gray-600' }]);
    } else {
      setEducations(prev => prev.map(e => e.id === tmp.id ? tmp : e));
    }
    closeModal();
  };
  const deleteExp = (id) => { setExperiences(prev => prev.filter(e => e.id !== id)); closeModal(); };
  const deleteEdu = (id) => { setEducations(prev => prev.filter(e => e.id !== id)); closeModal(); };

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50">
      {/* Top bar */}
      <DashTopBar title="My Profile" />

      <div className="overflow-y-auto flex-1 px-8 py-6">
        <div className="grid grid-cols-3 gap-6">

          {/* ── LEFT ── */}
          <div className="col-span-2 space-y-5">

            {/* Header card */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {/* Cover — click edit icon to upload */}
              <div className="h-28 relative overflow-hidden">
                {coverImg
                  ? <img src={coverImg} alt="cover" className="w-full h-full object-cover" />
                  : <div className="w-full h-full bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-500" />
                }
                <button onClick={() => coverInputRef.current.click()}
                  className="absolute top-3 right-3 w-8 h-8 bg-white/20 hover:bg-white/50 border border-white/40 rounded-lg flex items-center justify-center text-white transition">
                  <EditIcon className="w-4 h-4" />
                </button>
                <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
              </div>

              <div className="px-6 pb-5">
                <div className="flex items-end justify-between -mt-10 mb-3">
                  {/* Avatar — click to upload */}
                  <div className="relative group cursor-pointer" onClick={() => avatarInputRef.current.click()}>
                    <div className="w-20 h-20 rounded-full border-4 border-white shadow-md overflow-hidden bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-2xl">
                      {avatarImg
                        ? <img src={avatarImg} alt="avatar" className="w-full h-full object-cover" />
                        : initials
                      }
                    </div>
                    {/* Hover overlay */}
                    <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                      <EditIcon className="w-5 h-5 text-white" />
                    </div>
                    <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                  </div>

                  <button onClick={() => openModal('profile', { ...profile })}
                    className="border border-blue-600 text-blue-600 text-sm px-4 py-1.5 rounded-lg hover:bg-blue-50 transition mb-1 flex items-center gap-1.5">
                    <EditIcon className="w-3.5 h-3.5" /> Edit Profile
                  </button>
                </div>
                <h2 className="text-xl font-bold text-gray-900">{profile.name}</h2>
                <p className="text-sm text-gray-500 mt-0.5">{profile.title} at {profile.company}</p>
                <p className="text-xs text-gray-400 mt-1">📍 {profile.location}</p>
                <button onClick={() => setOpenForOpp(o => !o)}
                  className={`mt-3 flex items-center gap-2 text-xs font-medium px-4 py-1.5 rounded-lg border transition ${openForOpp ? 'bg-green-50 border-green-300 text-green-700 hover:bg-green-100' : 'bg-gray-50 border-gray-300 text-gray-500 hover:bg-gray-100'}`}>
                  <span className={`w-2 h-2 rounded-full ${openForOpp ? 'bg-green-500' : 'bg-gray-400'}`} />
                  {openForOpp ? 'OPEN FOR OPPORTUNITIES' : 'NOT OPEN FOR OPPORTUNITIES'}
                </button>
              </div>
            </div>

            {/* About Me */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900">About Me</h3>
                <EditBtn onClick={() => openModal('about', { about })} />
              </div>
              {about.split('\n\n').map((p, i) => (
                <p key={i} className="text-sm text-gray-600 leading-relaxed mb-2 last:mb-0">{p}</p>
              ))}
            </div>

            {/* Experiences */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900">Experiences</h3>
                <div className="flex gap-2">
                  <button onClick={() => openModal('add-exp', { role: '', company: '', type: 'Full-Time', start: '', end: '', duration: '', location: '', desc: '' })}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-blue-600 hover:bg-blue-50 border border-blue-100 transition text-xl font-light">+</button>
                </div>
              </div>
              <div className="space-y-5">
                {visibleExp.map((exp, i) => (
                  <div key={exp.id} className={`flex gap-4 ${i < visibleExp.length - 1 ? 'pb-5 border-b border-gray-100' : ''}`}>
                    <div className={`w-11 h-11 rounded-xl ${exp.logoBg} flex items-center justify-center text-xl flex-shrink-0`}>{exp.logo}</div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{exp.role}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{exp.company} · {exp.type} · {exp.start} – {exp.end} ({exp.duration})</p>
                          <p className="text-xs text-gray-400">{exp.location}</p>
                        </div>
                        <EditBtn onClick={() => openModal(`exp-${exp.id}`, { ...exp })} />
                      </div>
                      <p className="text-sm text-gray-600 mt-2 leading-relaxed">{exp.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              {experiences.length > 2 && (
                <button onClick={() => setShowAllExp(s => !s)} className="mt-4 text-sm text-blue-600 hover:underline w-full text-center">
                  {showAllExp ? 'Show less' : `Show ${experiences.length - 2} more experiences`}
                </button>
              )}
            </div>

            {/* Educations */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900">Educations</h3>
                <div className="flex gap-2">
                  <button onClick={() => openModal('add-edu', { school: '', degree: '', start: '', end: '', desc: '' })}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-blue-600 hover:bg-blue-50 border border-blue-100 transition text-xl font-light">+</button>
                </div>
              </div>
              <div className="space-y-5">
                {visibleEdu.map((edu, i) => (
                  <div key={edu.id} className={`flex gap-4 ${i < visibleEdu.length - 1 ? 'pb-5 border-b border-gray-100' : ''}`}>
                    <div className={`w-11 h-11 rounded-xl ${edu.logoBg} flex items-center justify-center text-xl flex-shrink-0`}>{edu.logo}</div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{edu.school}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{edu.degree}</p>
                          <p className="text-xs text-gray-400">{edu.start} – {edu.end}</p>
                        </div>
                        <EditBtn onClick={() => openModal(`edu-${edu.id}`, { ...edu })} />
                      </div>
                      <p className="text-sm text-gray-600 mt-2 leading-relaxed">{edu.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              {educations.length > 2 && (
                <button onClick={() => setShowAllEdu(s => !s)} className="mt-4 text-sm text-blue-600 hover:underline w-full text-center">
                  {showAllEdu ? 'Show less' : `Show ${educations.length - 2} more educations`}
                </button>
              )}
            </div>

            {/* Skills */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900">Skills</h3>
                <EditBtn onClick={() => openModal('skills', { skills: skills.join(', ') })} />
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.map(s => (
                  <span key={s} className="bg-orange-50 text-orange-600 border border-orange-200 text-sm rounded px-3 py-1">{s}</span>
                ))}
              </div>
            </div>

            {/* Portfolios */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900">Portfolios</h3>
                <button className="w-8 h-8 flex items-center justify-center rounded-lg text-blue-600 hover:bg-blue-50 border border-blue-100 transition text-xl font-light">+</button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {PORTFOLIOS.map(p => (
                  <div key={p.id} className="rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition cursor-pointer group">
                    <div className={`h-24 bg-gradient-to-br ${p.color} flex items-center justify-center text-4xl`}>{p.emoji}</div>
                    <div className="p-2.5">
                      <p className="text-xs text-gray-700 font-medium line-clamp-2 leading-snug">{p.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT sidebar ── */}
          <div className="space-y-5">
            {/* Additional Details */}
            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900 text-sm">Additional Details</h3>
                <EditBtn onClick={() => openModal('details', { ...details })} />
              </div>
              <div className="space-y-3">
                <div><p className="text-xs text-gray-400 mb-0.5">✉️ Email</p><p className="text-sm text-gray-700">{details.email}</p></div>
                <div><p className="text-xs text-gray-400 mb-0.5">📞 Phone</p><p className="text-sm text-gray-700">{details.phone}</p></div>
                <div><p className="text-xs text-gray-400 mb-0.5">🌐 Languages</p><p className="text-sm text-gray-700">{details.languages}</p></div>
              </div>
            </div>

            {/* Social Links */}
            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900 text-sm">Social Links</h3>
                <EditBtn onClick={() => openModal('socials', { ...socials })} />
              </div>
              <div className="space-y-2.5">
                <div><p className="text-xs text-gray-400 mb-0.5">📸 Instagram</p><a href={`https://${socials.instagram}`} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline">{socials.instagram}</a></div>
                <div><p className="text-xs text-gray-400 mb-0.5">🐦 Twitter</p><a href={`https://${socials.twitter}`} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline">{socials.twitter}</a></div>
                <div><p className="text-xs text-gray-400 mb-0.5">🌐 Website</p><a href={`https://${socials.website}`} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline">{socials.website}</a></div>
              </div>
            </div>

            {/* Profile completeness */}
            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <h3 className="font-semibold text-gray-900 text-sm mb-3">Profile Completeness</h3>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">80% complete</span>
                <span className="text-xs text-blue-600 font-medium">4 items left</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 mb-3">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '80%' }} />
              </div>
              <div className="space-y-1.5">
                {['Add a profile photo', 'Add your resume', 'Add a cover letter', 'Verify email'].map(item => (
                  <div key={item} className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center text-gray-300 flex-shrink-0 text-xs">○</span>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── MODALS ── */}

      {/* Edit Profile */}
      {modal === 'profile' && (
        <Modal title="Edit Profile" onClose={closeModal}>
          <Field label="Full Name"  value={tmp.name}     onChange={v => setTmp(t => ({ ...t, name: v }))} />
          <Field label="Job Title"  value={tmp.title}    onChange={v => setTmp(t => ({ ...t, title: v }))} />
          <Field label="Company"    value={tmp.company}  onChange={v => setTmp(t => ({ ...t, company: v }))} />
          <Field label="Location"   value={tmp.location} onChange={v => setTmp(t => ({ ...t, location: v }))} />
          <div className="flex justify-end gap-3 mt-2">
            <button onClick={closeModal} className="border border-gray-300 text-gray-600 text-sm px-4 py-2 rounded-lg hover:bg-gray-50">Cancel</button>
            <button onClick={saveProfile} className="bg-blue-600 text-white text-sm px-5 py-2 rounded-lg hover:bg-blue-700">Save</button>
          </div>
        </Modal>
      )}

      {/* Edit About */}
      {modal === 'about' && (
        <Modal title="Edit About Me" onClose={closeModal}>
          <Field label="About Me" value={tmp.about} onChange={v => setTmp(t => ({ ...t, about: v }))} rows={6} />
          <div className="flex justify-end gap-3 mt-2">
            <button onClick={closeModal} className="border border-gray-300 text-gray-600 text-sm px-4 py-2 rounded-lg hover:bg-gray-50">Cancel</button>
            <button onClick={saveAbout} className="bg-blue-600 text-white text-sm px-5 py-2 rounded-lg hover:bg-blue-700">Save</button>
          </div>
        </Modal>
      )}

      {/* Edit Additional Details */}
      {modal === 'details' && (
        <Modal title="Edit Additional Details" onClose={closeModal}>
          <Field label="Email"     value={tmp.email}     onChange={v => setTmp(t => ({ ...t, email: v }))} type="email" />
          <Field label="Phone"     value={tmp.phone}     onChange={v => setTmp(t => ({ ...t, phone: v }))} />
          <Field label="Languages" value={tmp.languages} onChange={v => setTmp(t => ({ ...t, languages: v }))} />
          <div className="flex justify-end gap-3 mt-2">
            <button onClick={closeModal} className="border border-gray-300 text-gray-600 text-sm px-4 py-2 rounded-lg hover:bg-gray-50">Cancel</button>
            <button onClick={saveDetails} className="bg-blue-600 text-white text-sm px-5 py-2 rounded-lg hover:bg-blue-700">Save</button>
          </div>
        </Modal>
      )}

      {/* Edit Social Links */}
      {modal === 'socials' && (
        <Modal title="Edit Social Links" onClose={closeModal}>
          <Field label="Instagram" value={tmp.instagram} onChange={v => setTmp(t => ({ ...t, instagram: v }))} />
          <Field label="Twitter"   value={tmp.twitter}   onChange={v => setTmp(t => ({ ...t, twitter: v }))} />
          <Field label="Website"   value={tmp.website}   onChange={v => setTmp(t => ({ ...t, website: v }))} />
          <div className="flex justify-end gap-3 mt-2">
            <button onClick={closeModal} className="border border-gray-300 text-gray-600 text-sm px-4 py-2 rounded-lg hover:bg-gray-50">Cancel</button>
            <button onClick={saveSocials} className="bg-blue-600 text-white text-sm px-5 py-2 rounded-lg hover:bg-blue-700">Save</button>
          </div>
        </Modal>
      )}

      {/* Edit Skills */}
      {modal === 'skills' && (
        <Modal title="Edit Skills" onClose={closeModal}>
          <p className="text-xs text-gray-400 mb-3">Enter skills separated by commas</p>
          <Field label="Skills" value={tmp.skills} onChange={v => setTmp(t => ({ ...t, skills: v }))} rows={3} />
          <div className="flex justify-end gap-3 mt-2">
            <button onClick={closeModal} className="border border-gray-300 text-gray-600 text-sm px-4 py-2 rounded-lg hover:bg-gray-50">Cancel</button>
            <button onClick={saveSkills} className="bg-blue-600 text-white text-sm px-5 py-2 rounded-lg hover:bg-blue-700">Save</button>
          </div>
        </Modal>
      )}

      {/* Edit / Add Experience */}
      {(modal?.startsWith('exp-') || modal === 'add-exp') && (
        <Modal title={modal === 'add-exp' ? 'Add Experience' : 'Edit Experience'} onClose={closeModal}>
          <Field label="Job Title"  value={tmp.role}     onChange={v => setTmp(t => ({ ...t, role: v }))} />
          <Field label="Company"    value={tmp.company}  onChange={v => setTmp(t => ({ ...t, company: v }))} />
          <Field label="Job Type"   value={tmp.type}     onChange={v => setTmp(t => ({ ...t, type: v }))} />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Start"    value={tmp.start}    onChange={v => setTmp(t => ({ ...t, start: v }))} />
            <Field label="End"      value={tmp.end}      onChange={v => setTmp(t => ({ ...t, end: v }))} />
          </div>
          <Field label="Location"   value={tmp.location} onChange={v => setTmp(t => ({ ...t, location: v }))} />
          <Field label="Description" value={tmp.desc}   onChange={v => setTmp(t => ({ ...t, desc: v }))} rows={3} />
          <div className="flex justify-between mt-2">
            {modal !== 'add-exp' && (
              <button onClick={() => deleteExp(tmp.id)} className="text-sm text-red-500 hover:underline">Delete</button>
            )}
            <div className="flex gap-3 ml-auto">
              <button onClick={closeModal} className="border border-gray-300 text-gray-600 text-sm px-4 py-2 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={saveExp} className="bg-blue-600 text-white text-sm px-5 py-2 rounded-lg hover:bg-blue-700">Save</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit / Add Education */}
      {(modal?.startsWith('edu-') || modal === 'add-edu') && (
        <Modal title={modal === 'add-edu' ? 'Add Education' : 'Edit Education'} onClose={closeModal}>
          <Field label="School / University" value={tmp.school}  onChange={v => setTmp(t => ({ ...t, school: v }))} />
          <Field label="Degree / Certificate" value={tmp.degree} onChange={v => setTmp(t => ({ ...t, degree: v }))} />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Start Year" value={tmp.start} onChange={v => setTmp(t => ({ ...t, start: v }))} />
            <Field label="End Year"   value={tmp.end}   onChange={v => setTmp(t => ({ ...t, end: v }))} />
          </div>
          <Field label="Description" value={tmp.desc} onChange={v => setTmp(t => ({ ...t, desc: v }))} rows={3} />
          <div className="flex justify-between mt-2">
            {modal !== 'add-edu' && (
              <button onClick={() => deleteEdu(tmp.id)} className="text-sm text-red-500 hover:underline">Delete</button>
            )}
            <div className="flex gap-3 ml-auto">
              <button onClick={closeModal} className="border border-gray-300 text-gray-600 text-sm px-4 py-2 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={saveEdu} className="bg-blue-600 text-white text-sm px-5 py-2 rounded-lg hover:bg-blue-700">Save</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
