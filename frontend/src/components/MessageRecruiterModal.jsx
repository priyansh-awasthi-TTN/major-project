import { useState } from 'react';

function buildDefaultSubject({ initialSubject, jobTitle, company }) {
  if (initialSubject) return initialSubject;
  if (jobTitle && company) return `Regarding ${jobTitle} Position at ${company}`;
  if (company) return `Regarding opportunities at ${company}`;
  return 'Regarding your open role';
}

function buildDefaultBody({ initialBody, recruiterName, jobTitle, company, senderName }) {
  if (initialBody) return initialBody;

  const greeting = recruiterName || 'Hiring Manager';

  if (jobTitle && company) {
    return `Dear ${greeting},\n\nI hope this email finds you well. I am writing to follow up on my application for the ${jobTitle} position at ${company}.\n\nI am very excited about this opportunity and would love to discuss how my skills and experience align with your team's needs.\n\nThank you for your time and consideration.\n\nBest regards,\n${senderName || 'Applicant'}`;
  }

  return `Dear ${greeting},\n\nI hope this email finds you well. I am reaching out after viewing your company profile and would like to learn more about current opportunities.\n\nI would appreciate the chance to connect and understand where my background could be a strong fit.\n\nThank you for your time and consideration.\n\nBest regards,\n${senderName || 'Applicant'}`;
}

export default function MessageRecruiterModal({
  recruiterEmail,
  recruiterName,
  jobTitle,
  company,
  senderName,
  onClose,
  onSuccess,
  title = 'Message Recruiter',
  subtitle,
  initialSubject,
  initialBody,
  submitLabel = 'Send via Gmail',
}) {
  const [subject, setSubject] = useState(() => buildDefaultSubject({ initialSubject, jobTitle, company }));
  const [body, setBody] = useState(() => buildDefaultBody({ initialBody, recruiterName, jobTitle, company, senderName }));

  const handleSend = () => {
    const encodedSubject = encodeURIComponent(subject);
    const encodedBody = encodeURIComponent(body);
    const encodedTo = encodeURIComponent(recruiterEmail);
    const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodedTo}&su=${encodedSubject}&body=${encodedBody}`;
    const mailtoUrl = `mailto:${recruiterEmail}?subject=${encodedSubject}&body=${encodedBody}`;
    const composeWindow = window.open(gmailComposeUrl, '_blank', 'noopener,noreferrer');

    if (!composeWindow) {
      window.location.href = mailtoUrl;
    }

    onSuccess?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="font-bold text-gray-900">{title}</h2>
            <p className="text-xs text-gray-400 mt-0.5">{subtitle || `Sending to ${recruiterEmail}`}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase mb-1.5 block">To</label>
            <input
              value={recruiterEmail}
              readOnly
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500 outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase mb-1.5 block">Subject</label>
            <input
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase mb-1.5 block">Message</label>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              rows={7}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 transition">
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={!subject.trim() || !body.trim()}
            className="px-5 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" strokeLinejoin="round" strokeLinecap="round"/>
            </svg>
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
