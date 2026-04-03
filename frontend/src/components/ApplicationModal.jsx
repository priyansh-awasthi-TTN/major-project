import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';
import {
  calculateApplicationDraftProgress,
  clearApplicationDraft,
  createApplicationBaseForm,
  getApplicationDraft,
  hasMeaningfulApplicationDraft,
  markApplicationSubmitted,
  saveApplicationDraft,
} from '../utils/applicationDrafts';

export default function ApplicationModal({ job, onClose, onSuccess }) {
  const { user } = useAuth();
  const draftStorageKey = `${user?.id ?? user?.email ?? 'guest'}:${job?.id ?? 'job'}`;
  const [form, setForm] = useState(() => createApplicationBaseForm(user));
  const [resume, setResume] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [loadedDraftKey, setLoadedDraftKey] = useState('');

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));
  const progressSnapshot = calculateApplicationDraftProgress(user, { form, resume });
  const showProgress = hasMeaningfulApplicationDraft(user, { form, resume });

  useEffect(() => {
    const draft = getApplicationDraft(user, job?.id);

    setForm({
      ...createApplicationBaseForm(user),
      ...(draft?.form || {}),
    });
    setResume(draft?.resume || null);
    setError('');
    setDone(false);
    setLoadedDraftKey(draftStorageKey);
  }, [draftStorageKey, job?.id, user]);

  useEffect(() => {
    if (loadedDraftKey !== draftStorageKey || !user || !job?.id || done) return;

    const timer = window.setTimeout(() => {
      const snapshot = {
        form,
        resume,
        updatedAt: new Date().toISOString(),
      };

      if (hasMeaningfulApplicationDraft(user, snapshot)) {
        saveApplicationDraft(user, job.id, snapshot);
      } else {
        clearApplicationDraft(user, job.id);
      }
    }, 250);

    return () => window.clearTimeout(timer);
  }, [done, draftStorageKey, form, job?.id, loadedDraftKey, resume, user]);

  const buildApplicationNote = () => {
    const details = [
      form.currentRole.trim() ? `Current Role: ${form.currentRole.trim()}` : null,
      form.phone.trim() ? `Phone: ${form.phone.trim()}` : null,
      form.linkedin.trim() ? `LinkedIn: ${form.linkedin.trim()}` : null,
      form.portfolio.trim() ? `Portfolio: ${form.portfolio.trim()}` : null,
    ].filter(Boolean);

    return details.length ? details.join('\n') : null;
  };

  const handleResumeChange = async (event) => {
    const nextFile = event.target.files?.[0];
    event.target.value = '';

    if (!nextFile) return;

    setUploadingResume(true);
    setError('');

    try {
      const uploadRes = await apiService.uploadFile(nextFile);
      setResume({
        name: uploadRes.fileName || nextFile.name,
        url: uploadRes.url,
        uploadedAt: new Date().toISOString(),
      });
    } catch {
      setError('Failed to upload your resume. Please try again.');
    } finally {
      setUploadingResume(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.fullName.trim() || !form.email.trim()) {
      setError('Full name and email are required.');
      return;
    }
    if (uploadingResume) {
      setError('Please wait for your resume upload to finish.');
      return;
    }
    if (!resume?.url) {
      setError('Please upload your resume (CV).');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const response = await apiService.createApplication({
        jobId:       job.id,
        company:     job.company,
        logo:        job.logo,
        color:       job.color,
        location:    job.location,
        title:       job.title,
        type:        job.type,
        salary:      job.salary ? `$${job.salary}` : null,
        status:      'In Review',
        note:        buildApplicationNote(),
        resumeUrl:   resume.url,
        coverLetter: form.coverLetter.trim() || null,
        dateApplied: new Date().toISOString().split('T')[0],
      });
      markApplicationSubmitted(user, job.id, {
        applicationId: response?.id,
        status: response?.status || 'In Review',
        submittedAt: new Date().toISOString(),
      });
      setDone(true);
      onSuccess?.();
    } catch (e) {
      setError(e?.message || 'Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

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

        {done ? (
          <div className="p-10 text-center">
            <div className="text-5xl mb-4">🎉</div>
            <h3 className="font-bold text-gray-900 text-lg mb-2">Application Submitted!</h3>
            <p className="text-sm text-gray-500 mb-6">Your application for <span className="font-medium">{job.title}</span> at <span className="font-medium">{job.company}</span> has been saved.</p>
            <button onClick={onClose} className="bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
              Done
            </button>
          </div>
        ) : (
          <div className="p-6">
            <h3 className="font-semibold text-gray-900 mb-1">Submit your application</h3>
            <p className="text-sm text-gray-500 mb-5">The following is required and will only be shared with {job.company}</p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-2.5 mb-4">{error}</div>
            )}

            {showProgress && (
              <div className="mb-5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-semibold text-gray-900">Application progress</span>
                  <span className="font-semibold text-blue-600">{progressSnapshot.progress}%</span>
                </div>
                <div className="mt-2 h-2 w-full rounded-full bg-white">
                  <div
                    className="h-2 rounded-full bg-blue-600 transition-[width] duration-300"
                    style={{ width: `${Math.max(progressSnapshot.progress, 6)}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-gray-600">
                  {progressSnapshot.completed} of {progressSnapshot.total} sections completed. Draft auto-saves for this job and account.
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Full name <span className="text-red-500">*</span></label>
                <input value={form.fullName} onChange={e => set('fullName', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" placeholder="Enter your full name" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Email address <span className="text-red-500">*</span></label>
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" placeholder="Enter your email" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Phone number</label>
                <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" placeholder="+1 (555) 000-0000" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Current or previous job title</label>
                <input value={form.currentRole} onChange={e => set('currentRole', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" placeholder="What's your current role?" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">LinkedIn URL</label>
                <input value={form.linkedin} onChange={e => set('linkedin', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" placeholder="linkedin.com/in/yourprofile" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Portfolio URL</label>
                <input value={form.portfolio} onChange={e => set('portfolio', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" placeholder="yourportfolio.com" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Cover letter / Additional information</label>
                <textarea rows={3} value={form.coverLetter} onChange={e => set('coverLetter', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 resize-none"
                  placeholder="Add a cover letter or anything else you want to share..." />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Attach your resume <span className="text-red-500">*</span></label>
                {resume ? (
                  <div className="flex items-center justify-between border border-green-300 bg-green-50 rounded-lg px-3 py-2 text-sm text-green-700">
                    <span className="truncate flex-1 font-medium mr-2">📎 {resume.name}</span>
                    <button onClick={() => setResume(null)} className="text-xl leading-none px-1 text-green-600 hover:text-green-800">×</button>
                  </div>
                ) : (
                  <input
                    type="file"
                    onChange={handleResumeChange}
                    accept=".pdf,.doc,.docx"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500"
                  />
                )}
                {uploadingResume && (
                  <p className="mt-2 text-xs text-blue-600">Uploading resume...</p>
                )}
              </div>
            </div>

            <p className="text-xs text-gray-400 mt-4 mb-4">
              By submitting you agree to our <Link to="/terms" target="_blank" className="text-blue-600 hover:underline">Terms of Service</Link> and <Link to="/privacy" target="_blank" className="text-blue-600 hover:underline">Privacy Policy</Link>
            </p>
            <button
              onClick={handleSubmit}
              disabled={submitting || uploadingResume}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : uploadingResume ? 'Uploading Resume...' : 'Submit Application'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
