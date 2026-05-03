import { useState } from 'react';
import CompanyTopBar from '../../components/CompanyTopBar';

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const dates = [23, 24, 25, 26, 27, 28, 29];
const hours = [
  '12 AM',
  '1 AM',
  '2 AM',
  '3 AM',
  '4 AM',
  '5 AM',
  '6 AM',
  '7 AM',
  '8 AM',
  '9 AM',
  '10 AM',
  '11 AM',
  '12 PM',
  '1 PM',
  '2 PM',
  '3 PM',
  '4 PM',
  '5 PM',
  '6 PM',
  '7 PM',
  '8 PM',
  '9 PM',
  '10 PM',
  '11 PM',
];

const events = [
  {
    day: 1,
    hour: 2,
    title: 'Interview session with Kathryn Murphy',
    time: '02:00 - 05:00 AM',
    color: 'bg-sky-500 text-white',
    attendees: ['KM', 'JR'],
  },
  {
    day: 1,
    hour: 8,
    title: 'Interview session',
    time: '08:00 - 09:00 AM',
    color: 'bg-sky-500 text-white',
  },
  {
    day: 3,
    hour: 9,
    title: 'Meeting with team',
    time: '09:00 - 10:00 AM',
    color: 'bg-emerald-500 text-white',
  },
];

const categories = [
  { label: 'Interview Schedule', color: 'bg-sky-500', checked: true },
  { label: 'Internal Meeting', color: 'bg-emerald-500', checked: true },
  { label: 'Team Schedule', color: 'bg-indigo-500', checked: false },
  { label: 'My Task', color: 'bg-amber-500', checked: false },
  { label: 'Reminders', color: 'bg-rose-400', checked: false },
];

const activeDayIndex = 1;
const holidayDayIndex = 4;

export default function MySchedule() {
  const [view, setView] = useState('week');

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-[#f5f7fb]">
      <CompanyTopBar title="My Schedule" />

      <div className="px-6 pb-8 pt-20">
        <div className="mb-5 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-slate-900">My Schedule</h2>
            <button className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">
              Today
            </button>
          </div>
          <div className="flex flex-1 items-center justify-center gap-3">
            <button className="text-slate-400 hover:text-slate-600">◀</button>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">November 2021</span>
            <button className="text-slate-400 hover:text-slate-600">▶</button>
          </div>
          <div className="flex items-center gap-1">
            {['Day', 'Week', 'Month'].map((value) => (
              <button
                key={value}
                onClick={() => setView(value.toLowerCase())}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                  view === value.toLowerCase()
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-6">
          <aside className="sticky top-24 h-fit w-72 flex-shrink-0 rounded-xl border border-slate-200 bg-white p-4">
            <button className="w-full rounded-lg border border-indigo-200 bg-indigo-50 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-100">
              + Create Event
            </button>

            <div className="mt-6">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">November 2021</p>
                <div className="flex gap-2 text-slate-400">
                  <button className="hover:text-slate-600">◀</button>
                  <button className="hover:text-slate-600">▶</button>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-7 gap-2 text-center text-[11px]">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((label) => (
                  <div key={label} className="text-slate-300">
                    {label}
                  </div>
                ))}
                {Array.from({ length: 30 }, (_, index) => index + 1).map((day) => (
                  <button
                    key={day}
                    className={`h-7 rounded-full text-xs font-medium ${
                      day === 24 ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Categories</p>
                <button className="text-xs font-semibold text-indigo-600 hover:underline">+ Add Category</button>
              </div>
              <div className="mt-3 space-y-2">
                {categories.map((category) => (
                  <label key={category.label} className="flex items-center gap-3 text-xs text-slate-600">
                    <input
                      type="checkbox"
                      defaultChecked={category.checked}
                      className="h-4 w-4 rounded border-slate-300 text-indigo-600"
                    />
                    <span className={`h-2.5 w-2.5 rounded ${category.color}`} />
                    {category.label}
                  </label>
                ))}
              </div>
            </div>
          </aside>

          <section className="flex-1 rounded-xl border border-slate-200 bg-white">
            <div className="grid grid-cols-[96px_repeat(7,minmax(0,1fr))] border-b border-slate-200 text-center">
              <div className="p-4 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">GMT +07</div>
              {days.map((day, index) => (
                <div
                  key={day}
                  className={`border-l border-slate-100 px-3 py-3 text-xs font-semibold uppercase tracking-[0.18em] ${
                    index === activeDayIndex ? 'text-indigo-600' : 'text-slate-400'
                  }`}
                >
                  <div className="text-[10px] font-semibold text-slate-400">{day}</div>
                  <div
                    className={`mt-2 inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold ${
                      index === activeDayIndex ? 'bg-indigo-600 text-white' : 'text-slate-700'
                    }`}
                  >
                    {dates[index]}
                  </div>
                  {index === holidayDayIndex ? (
                    <span className="mt-2 inline-flex rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-600">
                      Holiday
                    </span>
                  ) : null}
                </div>
              ))}
            </div>

            {hours.map((hour, hourIndex) => (
              <div
                key={hour}
                className="grid grid-cols-[96px_repeat(7,minmax(0,1fr))] border-b border-slate-100"
              >
                <div className="px-4 py-3 text-xs text-slate-400">{hour}</div>
                {days.map((_, dayIndex) => {
                  const event = events.find((item) => item.day === dayIndex && item.hour === hourIndex);
                  return (
                    <div
                      key={dayIndex}
                      className={`relative border-l border-slate-100 px-2 py-2 ${
                        dayIndex === holidayDayIndex ? 'bg-rose-50/60' : ''
                      }`}
                    >
                      {event ? (
                        <div className={`rounded-lg px-2 py-2 text-[11px] shadow-sm ${event.color}`}>
                          <p className="font-semibold leading-tight">{event.title}</p>
                          <p className="mt-1 text-[10px] opacity-90">{event.time}</p>
                          {event.attendees ? (
                            <div className="mt-2 flex items-center gap-1">
                              {event.attendees.map((attendee) => (
                                <span
                                  key={attendee}
                                  className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-[9px] font-semibold"
                                >
                                  {attendee}
                                </span>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            ))}
          </section>
        </div>
      </div>
    </div>
  );
}
