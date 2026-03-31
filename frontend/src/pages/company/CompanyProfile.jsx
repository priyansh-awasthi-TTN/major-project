import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function CompanyProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Company data state
  const [companyData, setCompanyData] = useState({
    name: 'Nomad',
    website: 'https://nomad.com',
    email: 'hello@nomad.com',
    founded: 'July 31, 2011',
    employees: '4000+',
    locations: '20 countries',
    industry: 'Social & Non-Profit',
    bio: 'Nomad is a software platform for starting and running internet businesses. Millions of businesses rely on Stripe\'s software tools to accept payments, expand globally, and manage their businesses online. Stripe has been at the forefront of expanding internet commerce, powering new business models, and supporting the latest platforms, from marketplaces to mobile commerce sites. We believe that growing the GDP of the internet is a problem rooted in code and design, not finance. Stripe is built for developers, makers, and creators. We work on solving the hard technical problems necessary to build global economic infrastructure: from designing highly reliable systems to developing advanced machine learning algorithms to prevent fraud.',
    techStack: [
      { name: 'HTML 5', icon: '🌐', color: 'bg-orange-100 text-orange-700' },
      { name: 'CSS 3', icon: '🎨', color: 'bg-blue-100 text-blue-700' },
      { name: 'JavaScript', icon: '⚡', color: 'bg-yellow-100 text-yellow-700' },
      { name: 'Ruby', icon: '💎', color: 'bg-red-100 text-red-700' },
      { name: 'Mixpanel', icon: '📊', color: 'bg-purple-100 text-purple-700' },
      { name: 'Framer', icon: '🎯', color: 'bg-green-100 text-green-700' }
    ],
    contacts: [
      { type: 'twitter', value: 'twitter.com/Nomad', icon: '🐦', color: 'bg-blue-100 text-blue-700' },
      { type: 'facebook', value: 'facebook.com/NomadHQ', icon: '📘', color: 'bg-blue-100 text-blue-700' },
      { type: 'linkedin', value: 'linkedin.com/company/nomad', icon: '💼', color: 'bg-blue-100 text-blue-700' },
      { type: 'email', value: 'nomad@gmail.com', icon: '📧', color: 'bg-gray-100 text-gray-700' }
    ],
    offices: [
      { country: 'United States', flag: '🇺🇸', type: 'Head Quarters' },
      { country: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', type: 'Branch Office' }
    ]
  });

  const handlePostJob = () => {
    navigate('/company/jobs/post');
  };

  const toggleNotifications = (e) => {
    e.stopPropagation();
    setShowNotifications(!showNotifications);
  };

  const handlePublicView = () => {
    // Navigate to public company profile view
    window.open(`/company/${companyData.name.toLowerCase()}/public`, '_blank');
  };

  const handleProfileSettings = () => {
    setIsEditing(!isEditing);
  };

  const updateCompanyData = (field, value) => {
    setCompanyData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addTechStack = () => {
    const newTech = prompt('Enter new technology:');
    if (newTech) {
      setCompanyData(prev => ({
        ...prev,
        techStack: [...prev.techStack, { 
          name: newTech, 
          icon: '⚡', 
          color: 'bg-gray-100 text-gray-700' 
        }]
      }));
    }
  };

  const addContact = () => {
    const type = prompt('Contact type (twitter, facebook, linkedin, email):');
    const value = prompt('Contact value:');
    if (type && value) {
      setCompanyData(prev => ({
        ...prev,
        contacts: [...prev.contacts, { 
          type, 
          value, 
          icon: '🔗', 
          color: 'bg-gray-100 text-gray-700' 
        }]
      }));
    }
  };

  const addOffice = () => {
    const country = prompt('Country name:');
    const flag = prompt('Flag emoji:');
    const type = prompt('Office type (Head Quarters, Branch Office):');
    if (country && flag && type) {
      setCompanyData(prev => ({
        ...prev,
        offices: [...prev.offices, { country, flag, type }]
      }));
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50 min-h-screen">
      {/* Custom Top Bar */}
      <div className="fixed top-0 right-0 left-64 bg-white border-b border-gray-200 z-40">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="text-gray-600 font-medium">megha</span>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-gray-700 font-medium">Company Profile</span>
            
            {/* Bell Icon */}
            <div className="relative">
              <button 
                onClick={toggleNotifications}
                className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h10a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">3</span>
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {[1,2,3].map(i => (
                      <div key={i} className="p-4 border-b border-gray-100 hover:bg-gray-50">
                        <p className="text-sm text-gray-800">New application received for Frontend Developer position</p>
                        <p className="text-xs text-gray-500 mt-1">2 minutes ago</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Post a Job Button */}
            <button 
              onClick={handlePostJob}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
            >
              <span>+</span>
              Post a Job
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6" style={{ marginTop: '80px' }}>
        <div className="max-w-7xl mx-auto">
          {/* Company Header */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
            {/* Cover Image */}
            <div className="h-32 bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 relative">
              <div className="absolute inset-0 bg-black bg-opacity-10"></div>
            </div>
            
            {/* Company Info */}
            <div className="px-8 pb-6 -mt-16 relative">
              <div className="flex items-end justify-between">
                <div className="flex items-end gap-6">
                  {/* Company Logo */}
                  <div className="w-24 h-24 rounded-2xl bg-emerald-500 border-4 border-white shadow-lg flex items-center justify-center">
                    <span className="text-white font-bold text-3xl">N</span>
                  </div>
                  
                  {/* Company Details */}
                  <div className="pb-2">
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={companyData.name}
                        onChange={(e) => updateCompanyData('name', e.target.value)}
                        className="text-3xl font-bold text-gray-900 mb-1 border-b border-gray-300 bg-transparent"
                      />
                    ) : (
                      <h1 className="text-3xl font-bold text-gray-900 mb-1">{companyData.name}</h1>
                    )}
                    
                    {isEditing ? (
                      <input 
                        type="url" 
                        value={companyData.website}
                        onChange={(e) => updateCompanyData('website', e.target.value)}
                        className="text-lg text-blue-600 mb-2 border-b border-gray-300 bg-transparent"
                      />
                    ) : (
                      <a href={companyData.website} className="text-lg text-blue-600 mb-2 hover:underline">{companyData.website}</a>
                    )}
                    
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <span>💧</span>
                        <span>Founded</span>
                        {isEditing ? (
                          <input 
                            type="text" 
                            value={companyData.founded}
                            onChange={(e) => updateCompanyData('founded', e.target.value)}
                            className="border-b border-gray-300 bg-transparent w-24"
                          />
                        ) : (
                          <span>{companyData.founded}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span>👥</span>
                        <span>Employees</span>
                        {isEditing ? (
                          <input 
                            type="text" 
                            value={companyData.employees}
                            onChange={(e) => updateCompanyData('employees', e.target.value)}
                            className="border-b border-gray-300 bg-transparent w-16"
                          />
                        ) : (
                          <span>{companyData.employees}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span>📍</span>
                        <span>Location</span>
                        {isEditing ? (
                          <input 
                            type="text" 
                            value={companyData.locations}
                            onChange={(e) => updateCompanyData('locations', e.target.value)}
                            className="border-b border-gray-300 bg-transparent w-24"
                          />
                        ) : (
                          <span>{companyData.locations}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span>🏢</span>
                        <span>Industry</span>
                        {isEditing ? (
                          <input 
                            type="text" 
                            value={companyData.industry}
                            onChange={(e) => updateCompanyData('industry', e.target.value)}
                            className="border-b border-gray-300 bg-transparent w-32"
                          />
                        ) : (
                          <span>{companyData.industry}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-3 pb-2">
                  <button 
                    onClick={handlePublicView}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center gap-2"
                  >
                    <span>👁️</span>
                    Public View
                  </button>
                  <button 
                    onClick={handleProfileSettings}
                    className={`px-4 py-2 rounded-lg transition-colors font-medium flex items-center gap-2 ${
                      isEditing 
                        ? 'bg-green-600 text-white hover:bg-green-700' 
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    <span>{isEditing ? '💾' : '⚙️'}</span>
                    {isEditing ? 'Save Changes' : 'Profile Settings'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-6">
            {/* Main Content */}
            <div className="col-span-8 space-y-6">
              {/* Company Profile */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Company Profile</h2>
                  {isEditing && (
                    <button className="text-blue-600 hover:text-blue-700">
                      <span>✏️</span>
                    </button>
                  )}
                </div>
                {isEditing ? (
                  <textarea 
                    value={companyData.bio}
                    onChange={(e) => updateCompanyData('bio', e.target.value)}
                    className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none"
                    placeholder="Enter company description..."
                  />
                ) : (
                  <p className="text-gray-600 leading-relaxed">{companyData.bio}</p>
                )}
              </div>

              {/* Contact */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Contact</h2>
                  <div className="flex gap-2">
                    {isEditing && (
                      <button 
                        onClick={addContact}
                        className="text-blue-600 hover:text-blue-700 p-1"
                      >
                        <span>➕</span>
                      </button>
                    )}
                    <button className="text-blue-600 hover:text-blue-700">
                      <span>✏️</span>
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {companyData.contacts.map((contact, index) => (
                    <div key={index} className={`flex items-center gap-3 p-3 rounded-xl border border-gray-200 ${contact.color}`}>
                      <span className="text-xl">{contact.icon}</span>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500 capitalize">{contact.type}</p>
                        {isEditing ? (
                          <input 
                            type="text" 
                            value={contact.value}
                            onChange={(e) => {
                              const newContacts = [...companyData.contacts];
                              newContacts[index].value = e.target.value;
                              setCompanyData(prev => ({ ...prev, contacts: newContacts }));
                            }}
                            className="font-medium text-gray-900 bg-transparent border-b border-gray-300 w-full"
                          />
                        ) : (
                          <p className="font-medium text-gray-900">{contact.value}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="col-span-4 space-y-6">
              {/* Tech Stack */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Tech Stack</h3>
                  <div className="flex gap-2">
                    {isEditing && (
                      <button 
                        onClick={addTechStack}
                        className="text-blue-600 hover:text-blue-700 p-1"
                      >
                        <span>➕</span>
                      </button>
                    )}
                    <button className="text-blue-600 hover:text-blue-700">
                      <span>✏️</span>
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {companyData.techStack.map((tech, index) => (
                    <div key={index} className={`flex flex-col items-center p-3 rounded-xl ${tech.color}`}>
                      <span className="text-2xl mb-2">{tech.icon}</span>
                      <span className="text-sm font-medium">{tech.name}</span>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-4 text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center gap-2">
                  View tech stack <span>→</span>
                </button>
              </div>

              {/* Office Locations */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Office Locations</h3>
                  <div className="flex gap-2">
                    {isEditing && (
                      <button 
                        onClick={addOffice}
                        className="text-blue-600 hover:text-blue-700 p-1"
                      >
                        <span>➕</span>
                      </button>
                    )}
                    <button className="text-blue-600 hover:text-blue-700">
                      <span>✏️</span>
                    </button>
                  </div>
                </div>
                <div className="space-y-3">
                  {companyData.offices.map((office, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                      <span className="text-xl">{office.flag}</span>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{office.country}</p>
                        <p className="text-sm text-gray-500">{office.type}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Click outside to close notifications */}
      {showNotifications && (
        <div 
          className="fixed inset-0 z-30" 
          onClick={() => setShowNotifications(false)}
        />
      )}
    </div>
  );
}
