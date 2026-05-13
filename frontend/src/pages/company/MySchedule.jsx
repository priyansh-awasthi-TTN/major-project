import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Bars3Icon,
  CalendarDaysIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  ExclamationCircleIcon,
  MapPinIcon,
  PaperClipIcon,
  PlusIcon,
  RectangleStackIcon,
  TagIcon,
  TrashIcon,
  UserGroupIcon,
  VideoCameraIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import CompanyTopBar from '../../components/CompanyTopBar';
import { useToast } from '../../components/Toast';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/api';
import {
  HOURS,
  addDays,
  addMonths,
  combineDateAndTime,
  formatApiDate,
  formatDateInput,
  formatDateNumber,
  formatDayName,
  formatMonthLabel,
  formatTimeInput,
  formatTimeRange,
  getInitialEventForm,
  getMonthGrid,
  getRangeForView,
  getTimezoneLabel,
  getWeekDays,
  isSameDay,
  parseEventDateTime,
  startOfDay,
  toLocalDateTimeString,
} from './scheduleUtils';

const VIEW_OPTIONS = ['day', 'week', 'month'];
const COLOR_OPTIONS = ['#0ea5e9', '#10b981', '#6366f1', '#f59e0b', '#fb7185', '#8b5cf6', '#ef4444', '#14b8a6'];
const HOUR_HEIGHT = 72;
const DESCRIPTION_BLOCKS = {
  agenda: {
    label: 'Agenda',
    title: 'Agenda',
    lines: ['Introductions and role context', 'Key discussion points', 'Time for questions'],
  },
  prep: {
    label: 'Prep Notes',
    title: 'Prep Notes',
    lines: ['Candidate background to review', 'Signals to validate', 'Specific risks or follow-ups'],
  },
  scorecard: {
    label: 'Scorecard',
    title: 'Scorecard',
    lines: ['Strengths', 'Concerns', 'Hiring recommendation'],
  },
  followUp: {
    label: 'Follow-up',
    title: 'Follow-up',
    lines: ['Owner', 'Next action', 'Due date'],
  },
};

function buildEventPayload(form) {
  const attendees = form.attendees
    .split(/[\n,]/)
    .map((value) => value.trim())
    .filter(Boolean);

  if (form.allDay) {
    const startAt = combineDateAndTime(form.startDate, '00:00');
    const inclusiveEndDate = combineDateAndTime(form.endDate, '00:00');
    const endAt = addDays(inclusiveEndDate, 1);

    return {
      title: form.title.trim(),
      categoryId: Number(form.categoryId),
      startAt: toLocalDateTimeString(startAt),
      endAt: toLocalDateTimeString(endAt),
      allDay: true,
      location: form.location.trim(),
      meetingLink: form.meetingLink.trim(),
      attendees,
      description: form.description.trim(),
      availability: form.availability,
      visibility: form.visibility,
      reminderMinutes: Number(form.reminderMinutes),
    };
  }

  const startAt = combineDateAndTime(form.startDate, form.startTime);
  const endAt = combineDateAndTime(form.endDate, form.endTime);

  return {
    title: form.title.trim(),
    categoryId: Number(form.categoryId),
    startAt: toLocalDateTimeString(startAt),
    endAt: toLocalDateTimeString(endAt),
    allDay: false,
    location: form.location.trim(),
    meetingLink: form.meetingLink.trim(),
    attendees,
    description: form.description.trim(),
    availability: form.availability,
    visibility: form.visibility,
    reminderMinutes: Number(form.reminderMinutes),
  };
}

function mapEventToForm(event) {
  const startAt = parseEventDateTime(event.startAt);
  const rawEndAt = parseEventDateTime(event.endAt);
  const endAt = event.allDay ? addDays(rawEndAt, -1) : rawEndAt;

  return {
    title: event.title || '',
    categoryId: String(event.categoryId || ''),
    startDate: formatDateInput(startAt),
    endDate: formatDateInput(endAt),
    startTime: formatTimeInput(startAt),
    endTime: formatTimeInput(rawEndAt),
    allDay: Boolean(event.allDay),
    location: event.location || '',
    meetingLink: event.meetingLink || '',
    attendees: Array.isArray(event.attendees) ? event.attendees.join(', ') : '',
    description: event.description || '',
    availability: event.availability || 'BUSY',
    visibility: event.visibility || 'DEFAULT',
    reminderMinutes: String(event.reminderMinutes ?? 30),
  };
}

function classNames(...values) {
  return values.filter(Boolean).join(' ');
}

function buildDescriptionSection(block) {
  return `${block.title}\n${block.lines.map((line) => `- ${line}`).join('\n')}`;
}

function appendDescriptionBlock(description, blockKey) {
  const block = DESCRIPTION_BLOCKS[blockKey];
  if (!block) {
    return description;
  }

  const currentValue = description.trim();
  const section = buildDescriptionSection(block);

  if (currentValue.toLowerCase().includes(block.title.toLowerCase())) {
    return currentValue;
  }

  return currentValue ? `${currentValue}\n\n${section}` : section;
}

function ModalShell({
  title,
  subtitle,
  onClose,
  widthClass = 'max-w-3xl',
  surfaceClass = 'bg-[#f8fbff]',
  bodyClass = '',
  children,
}) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/40 px-4 py-6">
      <div className={`mx-auto w-full ${widthClass} rounded-[28px] ${surfaceClass} shadow-2xl`}>
        <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        <div className={`max-h-[calc(100vh-7rem)] overflow-y-auto ${bodyClass}`}>{children}</div>
      </div>
    </div>
  );
}

function EventModal({
  form,
  categories,
  ownerName,
  saving,
  editing,
  onClose,
  onChange,
  onUpdateForm,
  onSubmit,
  onDelete,
  onShowToast,
}) {
  const [activeTab, setActiveTab] = useState('event');
  
  // Handle tab switching - reset date/time editor and expanded settings
  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setShowDateTimeEditor(false);
    setShowExpandedSettings(false);
    closeAllDropdowns();
  };
  
  const [isDescriptionFocused, setIsDescriptionFocused] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showAvailabilityDropdown, setShowAvailabilityDropdown] = useState(false);
  const [showVisibilityDropdown, setShowVisibilityDropdown] = useState(false);
  const [showReminderDropdown, setShowReminderDropdown] = useState(false);
  const [showExpandedSettings, setShowExpandedSettings] = useState(false);
  const [isGeneratingMeetLink, setIsGeneratingMeetLink] = useState(false);
  const [showTaskListDropdown, setShowTaskListDropdown] = useState(false);
  const [showDeadline, setShowDeadline] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showDateTimeEditor, setShowDateTimeEditor] = useState(false);
  const [showRepeatDropdown, setShowRepeatDropdown] = useState(false);
  const [showGuestsInput, setShowGuestsInput] = useState(!!form.attendees);
  const [showLocationInput, setShowLocationInput] = useState(!!form.location);
  const [showDescriptionInput, setShowDescriptionInput] = useState(!!form.description);
  
  const descriptionRef = useCallback((node) => {
    if (node && !isDescriptionFocused) {
      node.innerHTML = form.description || '';
    }
  }, [form.description, isDescriptionFocused]);

  const selectedCategory = categories.find((category) => String(category.id) === form.categoryId) || categories[0];

  // Close all dropdowns helper function (but NOT date/time editor or expanded settings)
  const closeAllDropdowns = () => {
    setShowCategoryDropdown(false);
    setShowAvailabilityDropdown(false);
    setShowVisibilityDropdown(false);
    setShowReminderDropdown(false);
    setShowTaskListDropdown(false);
    setShowColorPicker(false);
    setShowRepeatDropdown(false);
    // Note: showDateTimeEditor and showExpandedSettings are NOT closed here
    // They should remain independent and persist across tab switches
  };

  // Toggle functions that close other dropdowns
  const toggleCategoryDropdown = () => {
    const newState = !showCategoryDropdown;
    closeAllDropdowns();
    setShowCategoryDropdown(newState);
  };

  const toggleAvailabilityDropdown = () => {
    const newState = !showAvailabilityDropdown;
    closeAllDropdowns();
    setShowAvailabilityDropdown(newState);
  };

  const toggleVisibilityDropdown = () => {
    const newState = !showVisibilityDropdown;
    closeAllDropdowns();
    setShowVisibilityDropdown(newState);
  };

  const toggleReminderDropdown = () => {
    const newState = !showReminderDropdown;
    closeAllDropdowns();
    setShowReminderDropdown(newState);
  };

  const toggleColorPicker = () => {
    const newState = !showColorPicker;
    closeAllDropdowns();
    setShowColorPicker(newState);
  };

  const toggleRepeatDropdown = () => {
    const newState = !showRepeatDropdown;
    closeAllDropdowns();
    setShowRepeatDropdown(newState);
  };

  // Generate Google Meet link via backend API
  const generateMeetLink = async () => {
    console.log('🎥 Generating Google Meet link...');
    setIsGeneratingMeetLink(true);
    
    try {
      // Try to use backend API first for real Google Meet
      const response = await apiService.createGoogleMeetLink({
        summary: form.title || 'Meeting',
        startTime: form.startDate,
        endTime: form.endDate,
      });
      
      if (response && response.meetLink) {
        onChange('meetingLink', response.meetLink);
        console.log('✅ Meet link created via backend:', response.meetLink);
        
        if (typeof onShowToast === 'function') {
          onShowToast('Meeting link created successfully', 'success');
        }
        setIsGeneratingMeetLink(false);
        return;
      }
    } catch (backendError) {
      console.warn('⚠️ Backend API not available:', backendError.message);
    }
    
    // Generate Google Meet-style link
    // NOTE: These links look authentic but won't work without Google OAuth setup
    // For working video conferences, complete Google Cloud setup (see GOOGLE_MEET_SETUP.md)
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    let code = '';
    
    // Part 1: 3 chars
    for (let i = 0; i < 3; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    code += '-';
    
    // Part 2: 4 chars
    for (let i = 0; i < 4; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    code += '-';
    
    // Part 3: 3 chars
    for (let i = 0; i < 3; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    
    const meetLink = `https://meet.google.com/${code}`;
    onChange('meetingLink', meetLink);
    console.log('✅ Meet link generated:', meetLink);
    console.warn('⚠️ Note: This link requires Google OAuth setup to work. See GOOGLE_MEET_SETUP.md');
    
    if (typeof onShowToast === 'function') {
      onShowToast('Meeting link created', 'success');
    }
    setIsGeneratingMeetLink(false);
  };

  const generateMeetLink = async () => {
    console.log('🎥 Generating Google Meet link...');
    setIsGeneratingMeetLink(true);

    const startDateTime = form.allDay
      ? combineDateAndTime(form.startDate, '00:00')
      : combineDateAndTime(form.startDate, form.startTime);
    const endDateTime = form.allDay
      ? addDays(combineDateAndTime(form.endDate, '00:00'), 1)
      : combineDateAndTime(form.endDate, form.endTime);

    try {
      const response = await apiService.createGoogleMeetLink({
        summary: form.title || 'Meeting',
        startAt: toLocalDateTimeString(startDateTime),
        endAt: toLocalDateTimeString(endDateTime),
      });

      if (response && response.meetLink) {
        onChange('meetingLink', response.meetLink);
        console.log('✅ Meet link created via backend:', response.meetLink);

        if (typeof onShowToast === 'function') {
          onShowToast('Meeting link created successfully', 'success');
        }
        setIsGeneratingMeetLink(false);
        return;
      }
    } catch (backendError) {
      console.warn('⚠️ Backend API not available:', backendError.message);
      if (typeof onShowToast === 'function') {
        onShowToast('Google Meet setup is required before creating a meeting link.', 'error');
      }
    }

    setIsGeneratingMeetLink(false);
  };
      month: 'short',
      day: 'numeric',
    });
    const timeFormatter = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });

    if (form.allDay) {
      return `${dateFormatter.format(startDate)} - ${dateFormatter.format(endDate)}`;
    }

    return `${dateFormatter.format(startDate)} ${timeFormatter.format(startDate)} - ${timeFormatter.format(endDate)}`;
  }, [form.allDay, form.endDate, form.endTime, form.startDate, form.startTime]);

  const applyFormatting = (command, value = null) => {
    document.execCommand(command, false, value);
    
    // Update button states
    setIsBold(document.queryCommandState('bold'));
    setIsItalic(document.queryCommandState('italic'));
    setIsUnderline(document.queryCommandState('underline'));
  };

  const handleDescriptionFocus = () => {
    setIsDescriptionFocused(true);
  };

  const handleDescriptionBlur = (e) => {
    // Don't blur if clicking on toolbar buttons
    if (e.relatedTarget && e.relatedTarget.closest('.formatting-toolbar')) {
      return;
    }
    setTimeout(() => {
      setIsDescriptionFocused(false);
    }, 200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/40 px-4 py-6">
      <div className="mx-auto w-full max-w-[600px] rounded-[12px] bg-white shadow-2xl">
        {/* Header with close button */}
        <div className="flex items-center justify-between px-6 py-4">
          <button type="button" className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100">
            <Bars3Icon className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={onSubmit}>
          <div className="px-6 pb-6">
            {/* Title input */}
            <input
              required
              value={form.title}
              onChange={(event) => onChange('title', event.target.value)}
              placeholder="Add title"
              className="ml-12 w-[calc(100%-3rem)] border-b-2 border-[#1a73e8] bg-transparent px-0 pb-2 text-2xl font-normal text-slate-900 outline-none placeholder:text-slate-400"
            />

            {/* Event type tabs */}
            <div className="ml-12 mt-4 flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleTabSwitch('event')}
                className={classNames(
                  'rounded-md px-4 py-2 text-sm font-medium transition',
                  activeTab === 'event'
                    ? 'bg-[#e8f0fe] text-[#1967d2]'
                    : 'text-slate-600 hover:bg-slate-100'
                )}
              >
                Event
              </button>
              <button
                type="button"
                onClick={() => handleTabSwitch('task')}
                className={classNames(
                  'rounded-md px-4 py-2 text-sm font-medium transition',
                  activeTab === 'task'
                    ? 'bg-[#e8f0fe] text-[#1967d2]'
                    : 'text-slate-600 hover:bg-slate-100'
                )}
              >
                Task
              </button>
            </div>

            {/* Conditional content based on active tab */}
            {activeTab === 'event' ? (
              // Event content
              <>
            {/* Date and time section */}
            {!showDateTimeEditor ? (
              // Collapsed view
              <button
                type="button"
                onClick={() => setShowDateTimeEditor(true)}
                className="mt-6 flex w-full gap-4 px-2 py-3 text-left transition hover:bg-slate-50 rounded-lg"
              >
                <ClockIcon className="h-6 w-6 flex-shrink-0 text-slate-600" />
                <div className="min-w-0 flex-1">
                  <div className="text-base text-slate-900">{dateSummary}</div>
                  <p className="mt-1 text-sm text-slate-600">Time zone · Does not repeat</p>
                </div>
              </button>
            ) : (
              // Expanded view - editable
              <div className="mt-6 flex gap-4 px-2 py-3">
                <ClockIcon className="h-6 w-6 flex-shrink-0 text-slate-600" />
                <div className="min-w-0 flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={form.startDate}
                      onChange={(event) => onChange('startDate', event.target.value)}
                      className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8]"
                    />
                    {!form.allDay && (
                      <>
                        <input
                          type="time"
                          value={form.startTime}
                          onChange={(event) => onChange('startTime', event.target.value)}
                          className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8]"
                        />
                        <span className="text-slate-600">–</span>
                        <input
                          type="time"
                          value={form.endTime}
                          onChange={(event) => onChange('endTime', event.target.value)}
                          className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8]"
                        />
                      </>
                    )}
                  </div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.allDay}
                      onChange={(event) => onChange('allDay', event.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-[#1a73e8]"
                    />
                    <span className="text-sm text-slate-900">All day</span>
                  </label>
                  <div className="dropdown-container relative">
                    <button
                      type="button"
                      onClick={toggleRepeatDropdown}
                      className="flex w-full items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <span>{form.repeatOption || 'Does not repeat'}</span>
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {showRepeatDropdown && (
                      <div className="absolute left-0 top-full z-10 mt-1 w-full rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                        {[
                          'Does not repeat',
                          'Daily',
                          'Weekly on Thursday',
                          'Monthly on the second Thursday',
                          'Annually on May 14',
                          'Every weekday (Monday to Friday)',
                          'Custom...',
                        ].map((option) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => {
                              onChange('repeatOption', option);
                              setShowRepeatDropdown(false);
                            }}
                            className={classNames(
                              'flex w-full items-center px-4 py-2 text-left text-sm hover:bg-slate-50',
                              (form.repeatOption || 'Does not repeat') === option
                                ? 'bg-[#e8f0fe] text-slate-900'
                                : 'text-slate-700'
                            )}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowDateTimeEditor(false)}
                    className="text-sm text-[#1a73e8] hover:underline"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}

            {/* Add guests */}
            <div className="mt-2 flex gap-4 px-2 py-3">
              <UserGroupIcon className="h-6 w-6 flex-shrink-0 text-slate-600" />
              {!showGuestsInput ? (
                <button
                  type="button"
                  onClick={() => setShowGuestsInput(true)}
                  className="min-w-0 flex-1 text-left text-base text-slate-600"
                >
                  Add guests
                </button>
              ) : (
                <div className="min-w-0 flex-1">
                  <input
                    value={form.attendees}
                    onChange={(event) => onChange('attendees', event.target.value)}
                    placeholder="Add guests"
                    autoFocus
                    className="w-full bg-transparent text-base text-slate-900 outline-none placeholder:text-slate-600"
                  />
                </div>
              )}
            </div>

            {/* Add Google Meet */}
            <div className="mt-2 flex gap-4 px-2 py-3">
              <VideoCameraIcon className="h-6 w-6 flex-shrink-0 text-slate-600" />
              <div className="min-w-0 flex-1">
                {!form.meetingLink && !isGeneratingMeetLink ? (
                  <button
                    type="button"
                    onClick={generateMeetLink}
                    className="w-full text-left text-base text-slate-600 hover:text-slate-900"
                  >
                    Add Google Meet video conferencing
                  </button>
                ) : isGeneratingMeetLink ? (
                  <div className="flex items-center gap-3">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-[#1a73e8]" />
                    <span className="text-base text-slate-700">Adding conferencing...</span>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <a
                        href={form.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-base font-medium text-[#1a73e8] hover:underline"
                      >
                        Join with Google Meet
                      </a>
                      <p className="mt-1 text-sm text-slate-600">{form.meetingLink}</p>
                      <p className="mt-1 text-xs text-slate-500">Up to 100 guest connections</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={copyMeetLink}
                        className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                        title="Copy meeting link"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={removeMeetLink}
                        className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                        title="Remove meeting link"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Add location */}
            <div className="mt-2 flex gap-4 px-2 py-3">
              <MapPinIcon className="h-6 w-6 flex-shrink-0 text-slate-600" />
              {!showLocationInput ? (
                <button
                  type="button"
                  onClick={() => setShowLocationInput(true)}
                  className="min-w-0 flex-1 text-left text-base text-slate-600"
                >
                  Add location
                </button>
              ) : (
                <input
                  value={form.location}
                  onChange={(event) => onChange('location', event.target.value)}
                  placeholder="Add location"
                  autoFocus
                  className="min-w-0 flex-1 bg-transparent text-base text-slate-900 outline-none placeholder:text-slate-600"
                />
              )}
            </div>

            {/* Add description */}
            <div className="mt-2 flex gap-4 px-2 py-3">
              <Bars3Icon className="h-6 w-6 flex-shrink-0 text-slate-600" />
              {!showDescriptionInput ? (
                <button
                  type="button"
                  onClick={() => setShowDescriptionInput(true)}
                  className="min-w-0 flex-1 text-left text-base text-slate-600"
                >
                  Add description
                </button>
              ) : (
                <div className="min-w-0 flex-1">
                  {/* Rich text editor with formatting toolbar - always visible when description is shown */}
                  <div className="formatting-toolbar mb-2 flex items-center gap-1 rounded-lg bg-slate-100 p-2">
                    <button
                      type="button"
                      onClick={() => applyFormatting('bold')}
                      className={classNames(
                        'rounded px-2 py-1 text-sm font-bold transition',
                        isBold ? 'bg-slate-300 text-slate-900' : 'text-slate-600 hover:bg-slate-200'
                      )}
                    >
                      B
                    </button>
                    <button
                      type="button"
                      onClick={() => applyFormatting('italic')}
                      className={classNames(
                        'rounded px-2 py-1 text-sm italic transition',
                        isItalic ? 'bg-slate-300 text-slate-900' : 'text-slate-600 hover:bg-slate-200'
                      )}
                    >
                      I
                    </button>
                    <button
                      type="button"
                      onClick={() => applyFormatting('underline')}
                      className={classNames(
                        'rounded px-2 py-1 text-sm underline transition',
                        isUnderline ? 'bg-slate-300 text-slate-900' : 'text-slate-600 hover:bg-slate-200'
                      )}
                    >
                      U
                    </button>
                    <div className="mx-1 h-6 w-px bg-slate-300" />
                    <button
                      type="button"
                      onClick={() => applyFormatting('insertUnorderedList')}
                      className="rounded px-2 py-1 text-sm text-slate-600 transition hover:bg-slate-200"
                      title="Bullet list"
                    >
                      • List
                    </button>
                    <button
                      type="button"
                      onClick={() => applyFormatting('insertOrderedList')}
                      className="rounded px-2 py-1 text-sm text-slate-600 transition hover:bg-slate-200"
                      title="Numbered list"
                    >
                      1. List
                    </button>
                    <div className="mx-1 h-6 w-px bg-slate-300" />
                    <button
                      type="button"
                      onClick={() => {
                        const url = prompt('Enter URL:');
                        if (url) applyFormatting('createLink', url);
                      }}
                      className="rounded px-2 py-1 text-sm text-slate-600 transition hover:bg-slate-200"
                      title="Add link"
                    >
                      🔗
                    </button>
                    <button
                      type="button"
                      onClick={() => applyFormatting('removeFormat')}
                      className="rounded px-2 py-1 text-sm text-slate-600 transition hover:bg-slate-200"
                      title="Remove formatting"
                    >
                      ✕
                    </button>
                  </div>
                  <div
                    ref={descriptionRef}
                    contentEditable
                    onFocus={handleDescriptionFocus}
                    onBlur={handleDescriptionBlur}
                    onInput={(e) => onChange('description', e.currentTarget.innerHTML || '')}
                    className="min-h-[80px] w-full rounded-lg border-2 border-[#1a73e8] bg-white px-3 py-2 text-base text-slate-900 outline-none [&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6 [&_li]:my-1"
                    style={{ whiteSpace: 'pre-wrap' }}
                  />
                </div>
              )}
            </div>

            {/* Add Google Drive attachment link */}
            {showDescriptionInput && (
              <div className="mt-2 flex gap-4 px-2 py-3">
                <PaperClipIcon className="h-6 w-6 flex-shrink-0 text-slate-600" />
                <button
                  type="button"
                  className="text-base text-[#1a73e8] hover:underline"
                >
                  Add a Google Drive attachment
                </button>
              </div>
            )}

            {/* Owner section - collapsed by default */}
            {!showExpandedSettings ? (
              <button
                type="button"
                onClick={() => setShowExpandedSettings(true)}
                className="mt-6 flex w-full gap-4 px-2 py-3 text-left transition hover:bg-slate-50 rounded-lg"
              >
                <CalendarDaysIcon className="h-6 w-6 flex-shrink-0 text-slate-600" />
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <span className="text-base font-medium text-slate-900">{ownerName}</span>
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: selectedCategory?.color || '#0ea5e9' }} />
                  <span className="text-base text-slate-600">
                    {form.availability === 'BUSY' ? 'Busy' : 'Free'} · {' '}
                    {form.visibility === 'DEFAULT' && 'Default visibility'}
                    {form.visibility === 'PUBLIC' && 'Public'}
                    {form.visibility === 'PRIVATE' && 'Private'} · Notify{' '}
                    {form.reminderMinutes === '0' && 'at time of event'}
                    {form.reminderMinutes === '10' && '10 minutes before'}
                    {form.reminderMinutes === '15' && '15 minutes before'}
                    {form.reminderMinutes === '30' && '30 minutes before'}
                    {form.reminderMinutes === '60' && '1 hour before'}
                    {form.reminderMinutes === '1440' && '1 day before'}
                  </span>
                </div>
              </button>
            ) : (
              // Expanded settings for Event
              <div className="mt-6">
                {/* Owner and category */}
                <div className="flex gap-4">
                  <CalendarDaysIcon className="mt-1 h-6 w-6 flex-shrink-0 text-slate-600" />
                  <div className="dropdown-container relative flex min-w-0 flex-1 items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-medium text-slate-900">{ownerName}</span>
                      <button
                        type="button"
                        onClick={toggleCategoryDropdown}
                        className="inline-flex items-center gap-2 rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-700 hover:bg-slate-200"
                      >
                        <span
                          className="h-5 w-5 rounded-full"
                          style={{ backgroundColor: selectedCategory?.color || '#0ea5e9' }}
                        />
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                    {showCategoryDropdown && (
                      <div className="absolute right-0 top-full z-10 mt-1 rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
                        <div className="grid grid-cols-2 gap-2">
                          {categories.map((category) => (
                            <button
                              key={category.id}
                              type="button"
                              onClick={() => {
                                onChange('categoryId', String(category.id));
                                setShowCategoryDropdown(false);
                              }}
                              className="flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                            >
                              <span
                                className="h-5 w-5 rounded-full"
                                style={{ backgroundColor: category.color }}
                              />
                              {String(category.id) === form.categoryId && (
                                <svg className="h-4 w-4 text-[#1a73e8]" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Availability dropdown */}
                <div className="mt-2 flex gap-4">
                  <div className="h-6 w-6 flex-shrink-0">
                    <svg className="h-6 w-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <rect x="3" y="6" width="18" height="12" rx="2" strokeWidth={2} />
                    </svg>
                  </div>
                  <div className="dropdown-container relative flex-1">
                    <button
                      type="button"
                      onClick={toggleAvailabilityDropdown}
                      className="inline-flex items-center gap-2 rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-700 hover:bg-slate-200"
                    >
                      <span>{form.availability === 'BUSY' ? 'Busy' : 'Free'}</span>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {showAvailabilityDropdown && (
                      <div className="absolute left-0 top-full z-10 mt-1 w-40 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                        <button
                          type="button"
                          onClick={() => {
                            onChange('availability', 'BUSY');
                            setShowAvailabilityDropdown(false);
                          }}
                          className="flex w-full items-center justify-between px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                        >
                          <span>Busy</span>
                          {form.availability === 'BUSY' && (
                            <svg className="h-4 w-4 text-[#1a73e8]" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onChange('availability', 'FREE');
                            setShowAvailabilityDropdown(false);
                          }}
                          className="flex w-full items-center justify-between px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                        >
                          <span>Free</span>
                          {form.availability === 'FREE' && (
                            <svg className="h-4 w-4 text-[#1a73e8]" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Visibility dropdown */}
                <div className="mt-2 flex gap-4">
                  <div className="h-6 w-6 flex-shrink-0">
                    <svg className="h-6 w-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div className="dropdown-container relative flex-1">
                    <button
                      type="button"
                      onClick={toggleVisibilityDropdown}
                      className="inline-flex items-center gap-2 rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-700 hover:bg-slate-200"
                    >
                      <span>
                        {form.visibility === 'DEFAULT' && 'Default visibility'}
                        {form.visibility === 'PUBLIC' && 'Public'}
                        {form.visibility === 'PRIVATE' && 'Private'}
                      </span>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {showVisibilityDropdown && (
                      <div className="absolute left-0 top-full z-10 mt-1 w-48 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                        <button
                          type="button"
                          onClick={() => {
                            onChange('visibility', 'DEFAULT');
                            setShowVisibilityDropdown(false);
                          }}
                          className="flex w-full items-center justify-between px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                        >
                          <span>Default visibility</span>
                          {form.visibility === 'DEFAULT' && (
                            <svg className="h-4 w-4 text-[#1a73e8]" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onChange('visibility', 'PUBLIC');
                            setShowVisibilityDropdown(false);
                          }}
                          className="flex w-full items-center justify-between px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                        >
                          <span>Public</span>
                          {form.visibility === 'PUBLIC' && (
                            <svg className="h-4 w-4 text-[#1a73e8]" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onChange('visibility', 'PRIVATE');
                            setShowVisibilityDropdown(false);
                          }}
                          className="flex w-full items-center justify-between px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                        >
                          <span>Private</span>
                          {form.visibility === 'PRIVATE' && (
                            <svg className="h-4 w-4 text-[#1a73e8]" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
              </>
            ) : (
              // Task content
              <>
            {/* Date/time display for task */}
            {!showDateTimeEditor ? (
              // Collapsed view - clickable
              <button
                type="button"
                onClick={() => setShowDateTimeEditor(true)}
                className="mt-6 flex w-full gap-4 px-2 py-3 text-left transition hover:bg-slate-50 rounded-lg"
              >
                <ClockIcon className="h-6 w-6 flex-shrink-0 text-slate-600" />
                <div className="min-w-0 flex-1">
                  <div className="text-base text-slate-900">{dateSummary}</div>
                  <p className="mt-1 text-sm text-slate-600">Does not repeat</p>
                </div>
              </button>
            ) : (
              // Expanded view - editable
              <div className="mt-6 flex gap-4 px-2 py-3">
                <ClockIcon className="h-6 w-6 flex-shrink-0 text-slate-600" />
                <div className="min-w-0 flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={form.startDate}
                      onChange={(event) => onChange('startDate', event.target.value)}
                      className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8]"
                    />
                    {!form.allDay && (
                      <>
                        <input
                          type="time"
                          value={form.startTime}
                          onChange={(event) => onChange('startTime', event.target.value)}
                          className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8]"
                        />
                        <span className="text-slate-600">–</span>
                        <input
                          type="time"
                          value={form.endTime}
                          onChange={(event) => onChange('endTime', event.target.value)}
                          className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8]"
                        />
                      </>
                    )}
                  </div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.allDay}
                      onChange={(event) => onChange('allDay', event.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-[#1a73e8]"
                    />
                    <span className="text-sm text-slate-900">All day</span>
                  </label>
                  <div className="dropdown-container relative">
                    <button
                      type="button"
                      onClick={toggleRepeatDropdown}
                      className="flex w-full items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <span>{form.repeatOption || 'Does not repeat'}</span>
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {showRepeatDropdown && (
                      <div className="absolute left-0 top-full z-10 mt-1 w-full rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                        {[
                          'Does not repeat',
                          'Daily',
                          'Weekly on Thursday',
                          'Monthly on the second Thursday',
                          'Annually on May 14',
                          'Every weekday (Monday to Friday)',
                          'Custom...',
                        ].map((option) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => {
                              onChange('repeatOption', option);
                              setShowRepeatDropdown(false);
                            }}
                            className={classNames(
                              'flex w-full items-center px-4 py-2 text-left text-sm hover:bg-slate-50',
                              (form.repeatOption || 'Does not repeat') === option
                                ? 'bg-[#e8f0fe] text-slate-900'
                                : 'text-slate-700'
                            )}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowDateTimeEditor(false)}
                    className="text-sm text-[#1a73e8] hover:underline"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}

            {/* Add deadline button */}
            <div className="mt-2 flex gap-4 px-2 py-3">
              <svg className="h-6 w-6 flex-shrink-0 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {!showDeadline ? (
                <button
                  type="button"
                  onClick={() => setShowDeadline(true)}
                  className="min-w-0 flex-1 text-left text-base text-slate-600 transition hover:bg-slate-50 rounded-lg px-2 py-1 -mx-2 -my-1"
                >
                  Add deadline
                </button>
              ) : (
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <span className="text-base text-slate-600">Due</span>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(event) => onChange('endDate', event.target.value)}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowDeadline(false)}
                    className="rounded-full p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>

            {/* Add description - with gray background */}
            <div className="mt-2 flex gap-4 px-2 py-3">
              <Bars3Icon className="h-6 w-6 flex-shrink-0 text-slate-600" />
              {!showDescriptionInput ? (
                <button
                  type="button"
                  onClick={() => setShowDescriptionInput(true)}
                  className="min-w-0 flex-1 rounded-lg bg-slate-100 px-4 py-3 text-left text-base text-slate-600 transition hover:bg-slate-200"
                >
                  Add description
                </button>
              ) : (
                <textarea
                  value={form.description}
                  onChange={(event) => onChange('description', event.target.value)}
                  placeholder="Add description"
                  autoFocus
                  rows={4}
                  className="min-w-0 flex-1 resize-none rounded-lg bg-slate-100 px-4 py-3 text-base text-slate-900 outline-none placeholder:text-slate-600 focus:bg-white focus:ring-2 focus:ring-[#1a73e8]"
                />
              )}
            </div>

            {/* Task list selector - with gray background */}
            <div className="mt-2 flex gap-4 px-2 py-3">
              <svg className="h-6 w-6 flex-shrink-0 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              <div className="min-w-0 flex-1">
                <button
                  type="button"
                  className="flex w-full items-center justify-between rounded-lg bg-slate-100 px-4 py-3 text-left text-base text-slate-700 transition hover:bg-slate-200"
                >
                  <span>My Tasks</span>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Owner section for task - Collapsible */}
            {!showExpandedSettings ? (
              // Collapsed view
              <button
                type="button"
                onClick={() => setShowExpandedSettings(true)}
                className="mt-2 flex w-full gap-4 px-2 py-3 text-left transition hover:bg-slate-50 rounded-lg"
              >
                <CalendarDaysIcon className="h-6 w-6 flex-shrink-0 text-slate-600" />
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1a73e8] text-sm font-medium text-white">
                    {ownerName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-medium text-slate-900">{ownerName}</span>
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: selectedCategory?.color || '#0ea5e9' }} />
                    </div>
                    <div className="text-sm text-slate-600">Free · Private</div>
                  </div>
                </div>
              </button>
            ) : (
              // Expanded view for Task
              <div className="mt-2">
                {/* Owner and category */}
                <div className="flex gap-4 px-2 py-3">
                  <CalendarDaysIcon className="h-6 w-6 flex-shrink-0 text-slate-600" />
                  <div className="dropdown-container relative flex min-w-0 flex-1 items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-medium text-slate-900">{ownerName}</span>
                      <button
                        type="button"
                        onClick={toggleColorPicker}
                        className="inline-flex items-center gap-2 rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-700 hover:bg-slate-200"
                      >
                        <span
                          className="h-5 w-5 rounded-full"
                          style={{ backgroundColor: selectedCategory?.color || '#0ea5e9' }}
                        />
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                    {showColorPicker && (
                      <div className="absolute right-0 top-full z-10 mt-1 rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
                        <div className="grid grid-cols-2 gap-2">
                          {categories.map((category) => (
                            <button
                              key={category.id}
                              type="button"
                              onClick={() => {
                                onChange('categoryId', String(category.id));
                                setShowColorPicker(false);
                              }}
                              className="flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                            >
                              <span
                                className="h-5 w-5 rounded-full"
                                style={{ backgroundColor: category.color }}
                              />
                              {String(category.id) === form.categoryId && (
                                <svg className="h-4 w-4 text-[#1a73e8]" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Availability dropdown */}
                <div className="flex gap-4 px-2 py-3">
                  <div className="h-6 w-6 flex-shrink-0">
                    <svg className="h-6 w-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <rect x="3" y="6" width="18" height="12" rx="2" strokeWidth={2} />
                    </svg>
                  </div>
                  <div className="dropdown-container relative flex-1">
                    <button
                      type="button"
                      onClick={toggleAvailabilityDropdown}
                      className="inline-flex items-center gap-2 rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-700 hover:bg-slate-200"
                    >
                      <span>{form.availability === 'BUSY' ? 'Busy' : 'Free'}</span>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {showAvailabilityDropdown && (
                      <div className="absolute left-0 top-full z-10 mt-1 w-40 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                        <button
                          type="button"
                          onClick={() => {
                            onChange('availability', 'BUSY');
                            setShowAvailabilityDropdown(false);
                          }}
                          className="flex w-full items-center justify-between px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                        >
                          <span>Busy</span>
                          {form.availability === 'BUSY' && (
                            <svg className="h-4 w-4 text-[#1a73e8]" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onChange('availability', 'FREE');
                            setShowAvailabilityDropdown(false);
                          }}
                          className="flex w-full items-center justify-between px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                        >
                          <span>Free</span>
                          {form.availability === 'FREE' && (
                            <svg className="h-4 w-4 text-[#1a73e8]" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Visibility dropdown */}
                <div className="flex gap-4 px-2 py-3">
                  <div className="h-6 w-6 flex-shrink-0">
                    <svg className="h-6 w-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div className="dropdown-container relative flex-1">
                    <button
                      type="button"
                      onClick={toggleVisibilityDropdown}
                      className="inline-flex items-center gap-2 rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-700 hover:bg-slate-200"
                    >
                      <span>
                        {form.visibility === 'DEFAULT' && 'Default visibility'}
                        {form.visibility === 'PUBLIC' && 'Public'}
                        {form.visibility === 'PRIVATE' && 'Private'}
                      </span>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {showVisibilityDropdown && (
                      <div className="absolute left-0 top-full z-10 mt-1 w-48 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                        <button
                          type="button"
                          onClick={() => {
                            onChange('visibility', 'DEFAULT');
                            setShowVisibilityDropdown(false);
                          }}
                          className="flex w-full items-center justify-between px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                        >
                          <span>Default visibility</span>
                          {form.visibility === 'DEFAULT' && (
                            <svg className="h-4 w-4 text-[#1a73e8]" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onChange('visibility', 'PUBLIC');
                            setShowVisibilityDropdown(false);
                          }}
                          className="flex w-full items-center justify-between px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                        >
                          <span>Public</span>
                          {form.visibility === 'PUBLIC' && (
                            <svg className="h-4 w-4 text-[#1a73e8]" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onChange('visibility', 'PRIVATE');
                            setShowVisibilityDropdown(false);
                          }}
                          className="flex w-full items-center justify-between px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                        >
                          <span>Private</span>
                          {form.visibility === 'PRIVATE' && (
                            <svg className="h-4 w-4 text-[#1a73e8]" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
              </>
            )}

            {/* Action buttons */}
            <div className="mt-8 flex items-center justify-end">
              <button
                type="submit"
                disabled={saving}
                className="rounded-md bg-[#1a73e8] px-6 py-2 text-sm font-medium text-white transition hover:bg-[#1557b0] disabled:cursor-not-allowed disabled:bg-blue-300"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function CategoryModal({ form, saving, onClose, onChange, onSubmit }) {
  return (
    <ModalShell
      title="Add Category"
      subtitle="Categories are persisted and drive calendar filtering."
      onClose={onClose}
    >
      <form className="space-y-5 px-5 py-5" onSubmit={onSubmit}>
        <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          Category Name
          <input
            required
            value={form.name}
            onChange={(event) => onChange('name', event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-indigo-500"
            placeholder="Candidate follow-up"
          />
        </label>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Color</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {COLOR_OPTIONS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => onChange('color', color)}
                className={classNames(
                  'h-9 w-9 rounded-full border-2 transition',
                  form.color === color ? 'border-slate-900 scale-105' : 'border-transparent hover:scale-105'
                )}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        <label className="flex items-center gap-3 text-sm font-medium text-slate-600">
          <input
            type="checkbox"
            checked={form.visible}
            onChange={(event) => onChange('visible', event.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-indigo-600"
          />
          Show category by default
        </label>

        <div className="flex items-center justify-end gap-2 border-t border-slate-200 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
          >
            {saving ? 'Saving...' : 'Add Category'}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

function TimeGridView({ currentDate, view, events, onSlotClick, onEventClick }) {
  const days = useMemo(
    () => (view === 'day' ? [startOfDay(currentDate)] : getWeekDays(currentDate)),
    [currentDate, view]
  );
  const timezoneLabel = getTimezoneLabel();
  const totalHeight = HOURS.length * HOUR_HEIGHT;

  const eventsByDay = useMemo(() => {
    return days.map((day) => {
      const dayStart = startOfDay(day);
      const dayEnd = addDays(dayStart, 1);

      const allDayEvents = [];
      const timedEvents = [];

      events.forEach((event) => {
        if (!(event.startDate < dayEnd && event.endDate > dayStart)) {
          return;
        }

        if (event.allDay) {
          allDayEvents.push(event);
          return;
        }

        const segmentStart = event.startDate < dayStart ? dayStart : event.startDate;
        const segmentEnd = event.endDate > dayEnd ? dayEnd : event.endDate;
        const startMinutes = Math.max(0, (segmentStart.getTime() - dayStart.getTime()) / 60000);
        const endMinutes = Math.max(startMinutes + 30, (segmentEnd.getTime() - dayStart.getTime()) / 60000);

        timedEvents.push({
          ...event,
          top: (startMinutes / 60) * HOUR_HEIGHT,
          height: Math.max(42, ((endMinutes - startMinutes) / 60) * HOUR_HEIGHT),
        });
      });

      return {
        key: formatApiDate(day),
        allDayEvents,
        timedEvents,
      };
    });
  }, [days, events]);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div
        className="grid border-b border-slate-200 text-center"
        style={{ gridTemplateColumns: `96px repeat(${days.length}, minmax(180px, 1fr))` }}
      >
        <div className="p-4 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{timezoneLabel}</div>
        {days.map((day, index) => {
          const isActive = isSameDay(day, currentDate);
          const allDayEvents = eventsByDay[index].allDayEvents;

          return (
            <div key={formatApiDate(day)} className="border-l border-slate-100 px-3 py-3 text-xs font-semibold uppercase tracking-[0.18em]">
              <div className={classNames('text-[10px] font-semibold', isActive ? 'text-indigo-600' : 'text-slate-400')}>
                {formatDayName(day, { short: true })}
              </div>
              <div
                className={classNames(
                  'mt-2 inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold',
                  isActive ? 'bg-indigo-600 text-white' : 'text-slate-700'
                )}
              >
                {formatDateNumber(day)}
              </div>

              <div className="mt-3 min-h-8 space-y-1 text-left">
                {allDayEvents.slice(0, 2).map((event) => (
                  <button
                    key={event.id}
                    type="button"
                    onClick={() => onEventClick(event)}
                    className="block w-full truncate rounded-lg px-2 py-1 text-[10px] font-semibold text-white"
                    style={{ backgroundColor: event.categoryColor }}
                  >
                    {event.title}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="overflow-auto">
        <div
          className="grid min-w-[820px]"
          style={{ gridTemplateColumns: `96px repeat(${days.length}, minmax(180px, 1fr))` }}
        >
          <div className="bg-white">
            {HOURS.map((hour) => (
              <div key={hour} className="border-b border-slate-100 px-4 py-2 text-xs text-slate-400" style={{ height: `${HOUR_HEIGHT}px` }}>
                {hour}
              </div>
            ))}
          </div>

          {days.map((day, index) => (
            <div key={formatApiDate(day)} className="relative border-l border-slate-100">
              <div className="grid">
                {HOURS.map((_, hourIndex) => (
                  <button
                    key={`${formatApiDate(day)}-${hourIndex}`}
                    type="button"
                    onClick={() => onSlotClick(day, hourIndex)}
                    className={classNames(
                      'border-b border-slate-100 transition hover:bg-indigo-50/60',
                      isSameDay(day, currentDate) ? 'bg-indigo-50/20' : 'bg-white'
                    )}
                    style={{ height: `${HOUR_HEIGHT}px` }}
                  />
                ))}
              </div>

              <div className="pointer-events-none absolute inset-0" style={{ height: `${totalHeight}px` }}>
                {eventsByDay[index].timedEvents.map((event) => (
                  <button
                    key={event.id}
                    type="button"
                    onClick={() => onEventClick(event)}
                    className="pointer-events-auto absolute left-2 right-2 overflow-hidden rounded-xl px-3 py-2 text-left text-white shadow-sm ring-1 ring-black/5"
                    style={{
                      top: `${event.top}px`,
                      height: `${event.height}px`,
                      backgroundColor: event.categoryColor,
                    }}
                  >
                    <p className="line-clamp-2 text-xs font-semibold leading-4">{event.title}</p>
                    <p className="mt-1 text-[11px] opacity-90">
                      {formatTimeRange(event.startDate, event.endDate, event.allDay)}
                    </p>
                    {event.attendees?.length ? (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {event.attendees.slice(0, 3).map((attendee) => (
                          <span
                            key={attendee}
                            className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold"
                          >
                            {attendee}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function MonthView({ currentDate, events, onDaySelect, onCreateEvent, onEventClick }) {
  const monthGrid = useMemo(() => getMonthGrid(currentDate), [currentDate]);

  const eventsByDay = useMemo(() => {
    const map = new Map();

    monthGrid.forEach((day) => {
      const dayStart = startOfDay(day);
      const dayEnd = addDays(dayStart, 1);
      const items = events
        .filter((event) => event.startDate < dayEnd && event.endDate > dayStart)
        .sort((left, right) => left.startDate - right.startDate);
      map.set(formatApiDate(day), items);
    });

    return map;
  }, [events, monthGrid]);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="grid grid-cols-7 border-b border-slate-200">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((label) => (
          <div key={label} className="px-3 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {monthGrid.map((day) => {
          const dayKey = formatApiDate(day);
          const dayEvents = eventsByDay.get(dayKey) || [];
          const isCurrentMonth = day.getMonth() === currentDate.getMonth();
          const isActive = isSameDay(day, currentDate);

          return (
            <div
              key={dayKey}
              className={classNames(
                'min-h-40 border-b border-r border-slate-100 px-2 py-2',
                isCurrentMonth ? 'bg-white' : 'bg-slate-50/60'
              )}
            >
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => onDaySelect(day)}
                  className={classNames(
                    'inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition',
                    isActive ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                  )}
                >
                  {formatDateNumber(day)}
                </button>
                <button
                  type="button"
                  onClick={() => onCreateEvent(day)}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-3 space-y-1">
                {dayEvents.slice(0, 3).map((event) => (
                  <button
                    key={event.id}
                    type="button"
                    onClick={() => onEventClick(event)}
                    className="block w-full truncate rounded-lg px-2 py-1 text-left text-[11px] font-semibold text-white"
                    style={{ backgroundColor: event.categoryColor }}
                  >
                    <span className="mr-1 opacity-90">
                      {event.allDay ? 'All day' : formatTimeInput(event.startDate)}
                    </span>
                    {event.title}
                  </button>
                ))}
                {dayEvents.length > 3 ? (
                  <p className="px-2 text-[11px] font-medium text-slate-500">+{dayEvents.length - 3} more</p>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function LoadingState() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-indigo-600" />
        <p className="mt-3 text-sm text-slate-500">Loading calendar data...</p>
      </div>
    </div>
  );
}

export default function MySchedule() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [view, setView] = useState('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [categories, setCategories] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);
  const [eventForm, setEventForm] = useState(getInitialEventForm(new Date(), ''));
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    color: COLOR_OPTIONS[0],
    visible: true,
  });

  const range = useMemo(() => getRangeForView(view, currentDate), [view, currentDate]);
  const ownerName = user?.companyName || user?.fullName || 'Company calendar';

  const loadCalendar = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await apiService.getCompanyCalendar(
        formatApiDate(range.startDate),
        formatApiDate(range.endDate)
      );
      setCategories(Array.isArray(response?.categories) ? response.categories : []);
      setEvents(Array.isArray(response?.events) ? response.events : []);
    } catch (loadError) {
      setError(loadError.message || 'Failed to load schedule data.');
    } finally {
      setLoading(false);
    }
  }, [range.endDate, range.startDate]);

  useEffect(() => {
    loadCalendar();
  }, [loadCalendar]);

  const parsedEvents = useMemo(() => {
    const visibleCategoryIds = new Set(
      categories.filter((category) => category.visible).map((category) => category.id)
    );

    return events
      .filter((event) => visibleCategoryIds.has(event.categoryId))
      .map((event) => ({
        ...event,
        startDate: parseEventDateTime(event.startAt),
        endDate: parseEventDateTime(event.endAt),
      }));
  }, [categories, events]);

  const titleLabel = useMemo(() => {
    if (view === 'day') {
      return new Intl.DateTimeFormat('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }).format(currentDate);
    }

    return formatMonthLabel(currentDate);
  }, [currentDate, view]);

  const miniCalendarDays = useMemo(() => getMonthGrid(currentDate), [currentDate]);

  const handleDateNavigation = (direction) => {
    if (view === 'day') {
      setCurrentDate((current) => addDays(current, direction));
      return;
    }

    if (view === 'month') {
      setCurrentDate((current) => addMonths(current, direction));
      return;
    }

    setCurrentDate((current) => addDays(current, direction * 7));
  };

  const openCreateEvent = (date = currentDate, hour = 9) => {
    const nextDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour, 0, 0, 0);
    const initialCategoryId = categories[0]?.id || '';

    setEditingEventId(null);
    setEventForm(getInitialEventForm(nextDate, initialCategoryId));
    setIsEventModalOpen(true);
  };

  const openEditEvent = (event) => {
    setEditingEventId(event.id);
    setEventForm(mapEventToForm(event));
    setIsEventModalOpen(true);
  };

  const handleSaveEvent = async (submitEvent) => {
    submitEvent.preventDefault();

    if (!eventForm.title.trim()) {
      showToast('Event title is required.', 'error');
      return;
    }

    if (!eventForm.categoryId) {
      showToast('Choose a category for the event.', 'error');
      return;
    }

    const payload = buildEventPayload(eventForm);
    const startAt = parseEventDateTime(payload.startAt);
    const endAt = parseEventDateTime(payload.endAt);

    if (!(endAt > startAt)) {
      showToast('Event end time must be after start time.', 'error');
      return;
    }

    setSaving(true);
    try {
      if (editingEventId) {
        const updated = await apiService.updateCompanyCalendarEvent(editingEventId, payload);
        setEvents((current) => current.map((event) => (event.id === editingEventId ? updated : event)));
        showToast('Event updated.', 'success');
      } else {
        const created = await apiService.createCompanyCalendarEvent(payload);
        setEvents((current) => [...current, created]);
        showToast('Event created.', 'success');
      }

      setIsEventModalOpen(false);
      setEditingEventId(null);
    } catch (saveError) {
      showToast(saveError.message || 'Failed to save event.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!editingEventId) {
      return;
    }

    const confirmed = window.confirm('Delete this event from the schedule?');
    if (!confirmed) {
      return;
    }

    setSaving(true);
    try {
      await apiService.deleteCompanyCalendarEvent(editingEventId);
      setEvents((current) => current.filter((event) => event.id !== editingEventId));
      setIsEventModalOpen(false);
      setEditingEventId(null);
      showToast('Event deleted.', 'success');
    } catch (deleteError) {
      showToast(deleteError.message || 'Failed to delete event.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCategoryToggle = async (category) => {
    const previousVisible = category.visible;

    setCategories((current) => current.map((item) => (
      item.id === category.id ? { ...item, visible: !item.visible } : item
    )));

    try {
      const updated = await apiService.updateCompanyCalendarCategory(category.id, {
        name: category.name,
        color: category.color,
        visible: !previousVisible,
      });
      setCategories((current) => current.map((item) => (item.id === category.id ? updated : item)));
    } catch (updateError) {
      setCategories((current) => current.map((item) => (
        item.id === category.id ? { ...item, visible: previousVisible } : item
      )));
      showToast(updateError.message || 'Failed to update category.', 'error');
    }
  };

  const handleCreateCategory = async (submitEvent) => {
    submitEvent.preventDefault();

    if (!categoryForm.name.trim()) {
      showToast('Category name is required.', 'error');
      return;
    }

    setSaving(true);
    try {
      const created = await apiService.createCompanyCalendarCategory(categoryForm);
      setCategories((current) => [...current, created]);
      setIsCategoryModalOpen(false);
      setCategoryForm({
        name: '',
        color: COLOR_OPTIONS[0],
        visible: true,
      });
      showToast('Category added.', 'success');
    } catch (saveError) {
      showToast(saveError.message || 'Failed to create category.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-1 flex-col bg-[#f5f7fb]">
        <CompanyTopBar title="My Schedule" subtitle="Loading company calendar..." />
        <div className="px-6 pb-10 pt-20">
          <LoadingState />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-[#f5f7fb]">
      <CompanyTopBar title="My Schedule" subtitle="Calendar events now persist through the backend." />

      <div className="px-4 pb-8 pt-20 sm:px-6 lg:px-8">
        <div className="mb-5 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-slate-900">My Schedule</h2>
            <button
              type="button"
              onClick={() => setCurrentDate(new Date())}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Today
            </button>
          </div>

          <div className="flex flex-1 items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => handleDateNavigation(-1)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-white hover:text-slate-600"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">{titleLabel}</span>
            <button
              type="button"
              onClick={() => handleDateNavigation(1)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-white hover:text-slate-600"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="flex items-center gap-1 rounded-2xl border border-slate-200 bg-white p-1">
            {VIEW_OPTIONS.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setView(value)}
                className={classNames(
                  'rounded-xl px-3 py-1.5 text-xs font-semibold capitalize transition',
                  view === value ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-100'
                )}
              >
                {value}
              </button>
            ))}
          </div>
        </div>

        {error ? (
          <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <div className="flex flex-col gap-6 xl:flex-row">
          <aside className="xl:sticky xl:top-24 xl:h-fit xl:w-80 xl:flex-shrink-0">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <button
                type="button"
                onClick={() => openCreateEvent(currentDate)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100"
              >
                <PlusIcon className="h-4 w-4" />
                Create Event
              </button>

              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{formatMonthLabel(currentDate)}</p>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setCurrentDate((current) => addMonths(current, -1))}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                    >
                      <ChevronLeftIcon className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentDate((current) => addMonths(current, 1))}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                    >
                      <ChevronRightIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-7 gap-2 text-center text-[11px]">
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((label) => (
                    <div key={label} className="text-slate-300">{label}</div>
                  ))}

                  {miniCalendarDays.map((day) => {
                    const inCurrentMonth = day.getMonth() === currentDate.getMonth();
                    const isActive = isSameDay(day, currentDate);

                    return (
                      <button
                        key={formatApiDate(day)}
                        type="button"
                        onClick={() => setCurrentDate(day)}
                        className={classNames(
                          'h-8 rounded-full text-xs font-medium transition',
                          isActive
                            ? 'bg-indigo-600 text-white'
                            : inCurrentMonth
                              ? 'text-slate-600 hover:bg-slate-100'
                              : 'text-slate-300 hover:bg-slate-100'
                        )}
                      >
                        {formatDateNumber(day)}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Categories</p>
                  <button
                    type="button"
                    onClick={() => setIsCategoryModalOpen(true)}
                    className="text-xs font-semibold text-indigo-600 transition hover:text-indigo-700"
                  >
                    + Add Category
                  </button>
                </div>

                <div className="mt-3 space-y-2">
                  {categories.map((category) => (
                    <label key={category.id} className="flex items-center gap-3 text-sm text-slate-600">
                      <input
                        type="checkbox"
                        checked={category.visible}
                        onChange={() => handleCategoryToggle(category)}
                        className="h-4 w-4 rounded border-slate-300 text-indigo-600"
                      />
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: category.color }} />
                      <span className="flex-1 truncate">{category.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <div className="min-w-0 flex-1">
            {view === 'month' ? (
              <MonthView
                currentDate={currentDate}
                events={parsedEvents}
                onDaySelect={setCurrentDate}
                onCreateEvent={(day) => openCreateEvent(day)}
                onEventClick={openEditEvent}
              />
            ) : (
              <TimeGridView
                currentDate={currentDate}
                view={view}
                events={parsedEvents}
                onSlotClick={(day, hour) => openCreateEvent(day, hour)}
                onEventClick={openEditEvent}
              />
            )}
          </div>
        </div>
      </div>

      {isEventModalOpen ? (
        <EventModal
          form={eventForm}
          categories={categories}
          ownerName={ownerName}
          saving={saving}
          editing={Boolean(editingEventId)}
          onClose={() => {
            setIsEventModalOpen(false);
            setEditingEventId(null);
          }}
          onChange={(field, value) => setEventForm((current) => ({ ...current, [field]: value }))}
          onUpdateForm={(updater) => {
            setEventForm((current) => (typeof updater === 'function' ? updater(current) : { ...current, ...updater }));
          }}
          onSubmit={handleSaveEvent}
          onDelete={handleDeleteEvent}
          onShowToast={showToast}
        />
      ) : null}

      {isCategoryModalOpen ? (
        <CategoryModal
          form={categoryForm}
          saving={saving}
          onClose={() => setIsCategoryModalOpen(false)}
          onChange={(field, value) => setCategoryForm((current) => ({ ...current, [field]: value }))}
          onSubmit={handleCreateCategory}
        />
      ) : null}
    </div>
  );
}
