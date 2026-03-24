export default function ApplicationModal({ job, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className={`${job.color} text-white rounded-xl w-10 h-10 flex items-center justify-center font-bold`}>{job.logo}</div>
            <div>
              <h2 className="font-bold text-gray-900">{job.title}</h2>
              <p className="text-sm text-gray-500">{job.company} • {job.location} • {job.type}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>
        <div className="p-6">
          <h3 className="font-semibold text-gray-900 mb-1">Submit your application</h3>
          <p className="text-sm text-gray-500 mb-5">The following is required and will only be shared with {job.company}</p>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Full name</label>
              <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" placeholder="Enter your full name" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Email address</label>
              <input type="email" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" placeholder="Enter your email" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Phone number</label>
              <input type="tel" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" placeholder="+1 (555) 000-0000" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Current or previous job title</label>
              <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" placeholder="What's your current role?" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">LinkedIn URL</label>
              <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" placeholder="linkedin.com/in/yourprofile" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Portfolio URL</label>
              <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" placeholder="yourportfolio.com" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Additional information</label>
              <textarea rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 resize-none" placeholder="Add a cover letter or anything else you want to share..." />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Attach your resume</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-400">
                <p className="text-sm text-gray-500">📎 Upload Resume (PDF, DOC)</p>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-4 mb-4">By submitting the application you are agreeing to our <span className="text-blue-600 cursor-pointer">Terms of Service</span> and <span className="text-blue-600 cursor-pointer">Privacy Policy</span></p>
          <button onClick={onClose} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700">Submit Application</button>
        </div>
      </div>
    </div>
  );
}
