import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  BellIcon,
  BriefcaseIcon,
  CalendarDaysIcon,
  ChatBubbleLeftEllipsisIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DocumentTextIcon,
  EyeIcon,
  PlusIcon,
  UsersIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

const SUMMARY_CARDS = [
  {
    title: 'New candidates to review',
    value: 76,
    href: '/company/applicants',
    icon: UsersIcon,
    cardClass: 'from-[#5448f5] to-[#3b82f6]',
    iconClass: 'bg-white/15 text-white',
  },
  {
    title: 'Schedule for today',
    value: 3,
    href: '/company/schedule',
    icon: CalendarDaysIcon,
    cardClass: 'from-[#4ecdc4] to-[#34d399]',
    iconClass: 'bg-white/15 text-white',
  },
  {
    title: 'Messages received',
    value: 24,
    href: '/company/messages',
    icon: ChatBubbleLeftEllipsisIcon,
    cardClass: 'from-[#34a3ff] to-[#3b82f6]',
    iconClass: 'bg-white/15 text-white',
  },
];

const JOB_UPDATES = [
  {
    id: 1,
    title: 'Social Media Assistant',
    company: 'Nomad',
    location: 'Paris, France',
    type: 'Full-Time',
    logo: 'N',
    logoClass: 'bg-emerald-100 text-emerald-700',
    tags: ['Marketing', 'Design'],
    applied: 5,
    capacity: 10,
  },
  {
    id: 2,
    title: 'Brand Designer',
    company: 'Nomad',
    location: 'Paris, France',
    type: 'Full-Time',
    logo: 'B',
    logoClass: 'bg-sky-100 text-sky-700',
    tags: ['Business', 'Design'],
    applied: 5,
    capacity: 10,
  },
  {
    id: 3,
    title: 'Interactive Developer',
    company: 'Terraform',
    location: 'Berlin, Germany',
    type: 'Full-Time',
    logo: 'T',
    logoClass: 'bg-cyan-100 text-cyan-700',
    tags: ['Marketing', 'Design'],
    applied: 5,
    capacity: 10,
  },
  {
    id: 4,
    title: 'Product Designer',
    company: 'ClassPass',
    location: 'Berlin, Germany',
    type: 'Full-Time',
    logo: 'C',
    logoClass: 'bg-indigo-100 text-indigo-700',
    tags: ['Business', 'Design'],
    applied: 5,
    capacity: 10,
  },
];

const RANGE_DATA = {
  Week: {
    label: 'This Week',
    jobViews: 2342,
    jobViewsChange: 6.4,
    jobApplied: 654,
    jobAppliedChange: -0.5,
    chartData: [
      { label: 'Mon', jobView: 108, jobApplied: 72 },
      { label: 'Tue', jobView: 56, jobApplied: 96 },
      { label: 'Wed', jobView: 122, jobApplied: 34 },
      { label: 'Thu', jobView: 86, jobApplied: 118 },
      { label: 'Fri', jobView: 94, jobApplied: 64 },
      { label: 'Sat', jobView: 44, jobApplied: 30 },
      { label: 'Sun', jobView: 61, jobApplied: 49 },
    ],
  },
  Month: {
    label: 'This Month',
    jobViews: 9876,
    jobViewsChange: 12.3,
    jobApplied: 2341,
    jobAppliedChange: 8.7,
    chartData: [
      { label: 'W1', jobView: 640, jobApplied: 240 },
      { label: 'W2', jobView: 820, jobApplied: 412 },
      { label: 'W3', jobView: 760, jobApplied: 386 },
      { label: 'W4', jobView: 920, jobApplied: 442 },
    ],
  },
  Year: {
    label: 'This Year',
    jobViews: 45678,
    jobViewsChange: 23.1,
    jobApplied: 12345,
    jobAppliedChange: 15.6,
    chartData: [
      { label: 'Q1', jobView: 3200, jobApplied: 1280 },
      { label: 'Q2', jobView: 3640, jobApplied: 1760 },
      { label: 'Q3', jobView: 4210, jobApplied: 2240 },
      { label: 'Q4', jobView: 4680, jobApplied: 2640 },
    ],
  },
};

const APPLICANT_SEGMENTS = [
  { label: 'Full Time', value: 45, color: 'bg-indigo-500' },
  { label: 'Part-Time', value: 24, color: 'bg-emerald-400' },
  { label: 'Remote', value: 22, color: 'bg-sky-400' },
  { label: 'Internship', value: 32, color: 'bg-amber-400' },
  { label: 'Contract', value: 30, color: 'bg-rose-400' },
];

const TAG_STYLES = {
  Marketing: 'border-orange-200 bg-orange-50 text-orange-700',
  Design: 'border-indigo-200 bg-indigo-50 text-indigo-700',
  Business: 'border-emerald-200 bg-emerald-50 text-emerald-700',
};

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function formatDate(date) {
  return `${MONTHS_SHORT[date.getMonth()]} ${date.getDate()}`;
}

function formatFullDate(date) {
  return `${MONTHS_LONG[date.getMonth()]} ${date.getDate()}`;
}

function getStoredDateRange() {
  const today = new Date();
  const end = new Date(today);
  const start = new Date(today);
  start.setDate(today.getDate() - 6);

  try {
    const stored = localStorage.getItem('company_dashboard_date_range');
    if (!stored) {
      return { start, end };
    }

    const parsed = JSON.parse(stored);
    const storedStart = new Date(parsed.start);
    const storedEnd = new Date(parsed.end);

    if (Number.isNaN(storedStart.getTime()) || Number.isNaN(storedEnd.getTime())) {
      return { start, end };
    }

    return { start: storedStart, end: storedEnd };
  } catch {
    return { start, end };
  }
}

function storeDateRange(dateRange) {
  localStorage.setItem(
    'company_dashboard_date_range',
    JSON.stringify({
      start: dateRange.start.toISOString(),
      end: dateRange.end.toISOString(),
    })
  );
}

function Calendar({ isOpen, onClose, onDateSelect, selectedRange }) {
  const [currentDate, setCurrentDate] = useState(selectedRange.start);
  const [selectingStart, setSelectingStart] = useState(true);
  const [tempRange, setTempRange] = useState(selectedRange);

  useEffect(() => {
    setCurrentDate(selectedRange.start);
    setTempRange(selectedRange);
    setSelectingStart(true);
  }, [selectedRange, isOpen]);

  if (!isOpen) {
    return null;
  }

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    const days = [];

    const prevMonth = new Date(year, month, 0);
    const prevMonthDays = prevMonth.getDate();

    for (let i = startingDayOfWeek - 1; i >= 0; i -= 1) {
      days.push({
        date: new Date(year, month - 1, prevMonthDays - i),
        isCurrentMonth: false,
      });
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      days.push({
        date: new Date(year, month, day),
        isCurrentMonth: true,
      });
    }

    while (days.length < 42) {
      const day = days.length - (startingDayOfWeek + daysInMonth) + 1;
      days.push({
        date: new Date(year, month + 1, day),
        isCurrentMonth: false,
      });
    }

    return days;
  };

  const handleDateClick = (date) => {
    if (selectingStart) {
      setTempRange({ start: date, end: date });
      setSelectingStart(false);
      return;
    }

    const nextRange = {
      start: date < tempRange.start ? date : tempRange.start,
      end: date > tempRange.start ? date : tempRange.start,
    };

    setTempRange(nextRange);
    onDateSelect(nextRange);
    onClose();
    setSelectingStart(true);
  };

  const isToday = (date) => date.toDateString() === new Date().toDateString();

  const isDateSelected = (date) =>
    date.toDateString() === tempRange.start.toDateString() || date.toDateString() === tempRange.end.toDateString();

  const isDateInRange = (date) => date >= tempRange.start && date <= tempRange.end;

  return (
    <div className="absolute right-0 top-full z-30 mt-3 w-80 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.18)]">
      <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700">
            {formatDate(tempRange.start)} - {formatDate(tempRange.end)}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 transition hover:bg-white hover:text-slate-700"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
            className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>
          <h3 className="text-sm font-semibold text-slate-900">
            {MONTHS_LONG[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          <button
            type="button"
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
            className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          {DAYS_OF_WEEK.map((day) => (
            <div key={day} className="py-1">
              {day}
            </div>
          ))}
        </div>

        <div className="mt-2 grid grid-cols-7 gap-1">
          {getDaysInMonth(currentDate).map(({ date, isCurrentMonth }, index) => {
            const selected = isDateSelected(date);
            const inRange = isDateInRange(date);

            return (
              <button
                key={`${date.toISOString()}-${index}`}
                type="button"
                onClick={() => handleDateClick(date)}
                className={`h-9 rounded-2xl text-xs font-medium transition ${
                  selected
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : inRange
                      ? 'bg-indigo-50 text-indigo-700'
                      : isToday(date)
                        ? 'border border-indigo-200 bg-white text-indigo-700'
                        : isCurrentMonth
                          ? 'text-slate-700 hover:bg-slate-100'
                          : 'text-slate-300 hover:bg-slate-50'
                }`}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={() => {
              const today = new Date();
              const nextRange = { start: today, end: today };
              onDateSelect(nextRange);
              onClose();
            }}
            className="text-sm font-semibold text-indigo-600 transition hover:text-indigo-700"
          >
            Today
          </button>
        </div>
      </div>
    </div>
  );
}

function DateRangePicker({ dateRange, onDateRangeChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
      >
        <span>
          {formatDate(dateRange.start)} - {formatDate(dateRange.end)}
        </span>
        <CalendarDaysIcon className="h-4 w-4 text-slate-400" />
      </button>

      <Calendar
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onDateSelect={(range) => {
          onDateRangeChange(range);
          storeDateRange(range);
        }}
        selectedRange={dateRange}
      />
    </div>
  );
}

function ChangePill({ value }) {
  const positive = value >= 0;
  const Icon = positive ? ArrowTrendingUpIcon : ArrowTrendingDownIcon;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
        positive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      {positive ? '+' : ''}
      {value}%
    </span>
  );
}

function StatMiniCard({ icon: Icon, title, value, change, rangeLabel, iconClass }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center gap-3">
        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${iconClass}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-700">{title}</p>
          <p className="text-xs text-slate-400">{rangeLabel}</p>
        </div>
      </div>
      <div className="mt-4 flex items-end justify-between gap-4">
        <span className="text-3xl font-semibold tracking-tight text-slate-900">{value.toLocaleString()}</span>
        <ChangePill value={change} />
      </div>
    </div>
  );
}

function ChartBars({ data, statsTab }) {
  const maxValue = Math.max(...data.map((item) => Math.max(item.jobView, item.jobApplied)));
  const highlightIndex = Math.min(2, data.length - 1);

  return (
    <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${data.length}, minmax(0, 1fr))` }}>
      {data.map((item, index) => {
        const viewHeight = `${Math.max(12, (item.jobView / maxValue) * 100)}%`;
        const appliedHeight = `${Math.max(12, (item.jobApplied / maxValue) * 100)}%`;
        const showTooltip = index === highlightIndex;

        return (
          <div key={item.label} className="flex min-w-0 flex-col items-center gap-3">
            <div className="relative flex h-56 w-full items-end justify-center gap-1 rounded-[28px] bg-slate-50 px-2 pb-3 pt-6">
              {(statsTab === 'Overview' || statsTab === 'Jobs View') && (
                <div className="relative flex w-full flex-col justify-end">
                  <div className="rounded-t-[18px] bg-amber-400" style={{ height: viewHeight }} />
                  {showTooltip && statsTab !== 'Jobs Applied' ? (
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-xl bg-slate-900 px-2 py-1 text-[11px] font-semibold text-white shadow-lg">
                      {item.jobView}
                    </div>
                  ) : null}
                </div>
              )}
              {(statsTab === 'Overview' || statsTab === 'Jobs Applied') && (
                <div className="relative flex w-full flex-col justify-end">
                  <div className="rounded-t-[18px] bg-indigo-600" style={{ height: appliedHeight }} />
                  {showTooltip && statsTab === 'Jobs Applied' ? (
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-xl bg-slate-900 px-2 py-1 text-[11px] font-semibold text-white shadow-lg">
                      {item.jobApplied}
                    </div>
                  ) : null}
                </div>
              )}
            </div>
            <span className="truncate text-xs font-medium text-slate-500">{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function CompanyDashboard() {
  const { user } = useAuth();
  const { unreadCount = 0 } = useNotifications();
  const [activeTab, setActiveTab] = useState('Week');
  const [statsTab, setStatsTab] = useState('Overview');
  const [dateRange, setDateRange] = useState(getStoredDateRange);

  const companyName = user?.companyName || user?.fullName || 'Nomad';
  const greetingName = user?.fullName?.split(' ')[0] || 'Maria';
  const currentData = RANGE_DATA[activeTab];
  const totalApplicants = APPLICANT_SEGMENTS.reduce((sum, segment) => sum + segment.value, 0);

  const handleDateRangeChange = (nextRange) => {
    setDateRange(nextRange);
    storeDateRange(nextRange);
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-900">
      <div className="fixed inset-x-0 top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur lg:left-60">
        <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Company</p>
            <div className="mt-0.5 flex items-center gap-2">
              <h1 className="truncate text-sm font-semibold text-slate-900 sm:text-base">{companyName}</h1>
              <ChevronDownIcon className="h-4 w-4 text-slate-400" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="notifications"
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700"
            >
              <BellIcon className="h-5 w-5" />
              {unreadCount > 0 ? (
                <span className="absolute right-2 top-2 flex h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
              ) : null}
            </button>
            <Link
              to="/company/jobs/post"
              className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
              <PlusIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Post a job</span>
              <span className="sm:hidden">Post</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="px-4 pb-24 pt-20 sm:px-6 lg:px-8 lg:pb-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-[28px]">
              Good morning, {greetingName}
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-slate-500">
              Here is your job listings statistic report from {formatFullDate(dateRange.start)} - {formatFullDate(dateRange.end)}.
            </p>
          </div>
          <DateRangePicker dateRange={dateRange} onDateRangeChange={handleDateRangeChange} />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {SUMMARY_CARDS.map((card) => {
            const Icon = card.icon;

            return (
              <Link
                key={card.title}
                to={card.href}
                className={`group relative overflow-hidden rounded-[28px] bg-gradient-to-br ${card.cardClass} p-5 text-white shadow-[0_20px_45px_rgba(59,130,246,0.22)] transition hover:-translate-y-0.5 hover:shadow-[0_28px_55px_rgba(59,130,246,0.28)]`}
              >
                <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-white/10" />
                <div className="absolute -bottom-8 right-6 h-20 w-20 rounded-full bg-white/10" />
                <div className="relative flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[40px] font-semibold leading-none">{card.value}</p>
                    <p className="mt-3 max-w-[180px] text-sm font-medium text-white/90">{card.title}</p>
                  </div>
                  <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${card.iconClass}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <div className="relative mt-6 flex items-center gap-1 text-sm font-semibold text-white/90">
                  Review now
                  <ChevronRightIcon className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,2fr)_320px]">
          <section className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Job statistics</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Showing job statistics from {formatFullDate(dateRange.start)} - {formatFullDate(dateRange.end)}.
                </p>
              </div>

              <div className="inline-flex w-full rounded-2xl bg-slate-100 p-1 sm:w-auto">
                {Object.keys(RANGE_DATA).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 rounded-2xl px-4 py-2 text-sm font-semibold transition sm:flex-none ${
                      activeTab === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-5 border-b border-slate-100 pb-3">
              {['Overview', 'Jobs View', 'Jobs Applied'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setStatsTab(tab)}
                  className={`relative pb-2 text-sm font-semibold transition ${
                    statsTab === tab ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {tab}
                  {statsTab === tab ? <span className="absolute inset-x-0 -bottom-3 h-0.5 rounded-full bg-indigo-600" /> : null}
                </button>
              ))}
            </div>

            <div className="mt-6">
              <ChartBars data={currentData.chartData} statsTab={statsTab} />
            </div>

            <div className="mt-5 flex flex-wrap gap-5 text-sm">
              {(statsTab === 'Overview' || statsTab === 'Jobs View') && (
                <div className="flex items-center gap-2 text-slate-600">
                  <span className="h-3 w-3 rounded-full bg-amber-400" />
                  Job View
                </div>
              )}
              {(statsTab === 'Overview' || statsTab === 'Jobs Applied') && (
                <div className="flex items-center gap-2 text-slate-600">
                  <span className="h-3 w-3 rounded-full bg-indigo-600" />
                  Job Applied
                </div>
              )}
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <StatMiniCard
                icon={EyeIcon}
                title="Job Views"
                value={currentData.jobViews}
                change={currentData.jobViewsChange}
                rangeLabel={currentData.label}
                iconClass="bg-amber-100 text-amber-700"
              />
              <StatMiniCard
                icon={DocumentTextIcon}
                title="Job Applied"
                value={currentData.jobApplied}
                change={currentData.jobAppliedChange}
                rangeLabel={currentData.label}
                iconClass="bg-indigo-100 text-indigo-700"
              />
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Job Open</p>
                  <p className="mt-1 text-xs text-slate-400">Roles currently published</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                  <BriefcaseIcon className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-8 flex items-end gap-3">
                <span className="text-5xl font-semibold tracking-tight text-slate-900">12</span>
                <span className="pb-2 text-sm text-slate-500">Jobs Opened</span>
              </div>
            </section>

            <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Applicants Summary</p>
                  <p className="mt-1 text-xs text-slate-400">Distribution by role type</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                  <UsersIcon className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-end gap-3">
                  <span className="text-5xl font-semibold tracking-tight text-slate-900">{totalApplicants}</span>
                  <span className="pb-2 text-sm text-slate-500">Applicants</span>
                </div>
              </div>

              <div className="mt-5 flex h-2 overflow-hidden rounded-full bg-slate-100">
                {APPLICANT_SEGMENTS.map((segment) => (
                  <div
                    key={segment.label}
                    className={segment.color}
                    style={{ width: `${(segment.value / totalApplicants) * 100}%` }}
                  />
                ))}
              </div>

              <div className="mt-5 grid gap-2 text-xs text-slate-600 sm:grid-cols-2">
                {APPLICANT_SEGMENTS.map((segment) => (
                  <div key={segment.label} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${segment.color}`} />
                      <span>{segment.label}</span>
                    </div>
                    <span className="font-semibold text-slate-900">{segment.value}</span>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>

        <section className="mt-6 rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Job Updates</h3>
              <p className="mt-1 text-sm text-slate-500">A quick view of your active openings and current demand.</p>
            </div>
            <Link
              to="/company/jobs"
              className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 transition hover:text-indigo-700"
            >
              View All
              <ChevronRightIcon className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {JOB_UPDATES.map((job) => (
              <article
                key={job.id}
                className="rounded-[28px] border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-[0_16px_30px_rgba(15,23,42,0.08)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-2xl text-sm font-bold ${job.logoClass}`}>
                      {job.logo}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{job.title}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {job.company} • {job.location}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                    {job.type}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {job.tags.map((tag) => (
                    <span
                      key={tag}
                      className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                        TAG_STYLES[tag] || 'border-slate-200 bg-slate-50 text-slate-700'
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-6 border-t border-slate-100 pt-4 text-xs text-slate-500">
                  <span className="font-semibold text-slate-900">{job.applied} applied</span> of {job.capacity} capacity
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
