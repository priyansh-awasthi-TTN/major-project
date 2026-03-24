import { useState } from 'react';
import CompanyTopBar from '../../components/CompanyTopBar';

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const hours = ['8 AM', '9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM'];

const events = [
  { day: 2, hour: 1, title: 'Interview - Jake Gyll', color: 'bg-blue-100 border-blue-400 text-blue-800' },
  { day: 4, hour: 3, title: 'Interview - Jenny Wilson', color: 'bg-purple-100 border-purple-400 text-purple-800' },
  { day: 5, hour: 2, title: 'Team Meeting', color: 'bg-green-100 border-green-400 text-green-800' },
];

const categories = [
  { label: 'Interview Schedule', color: 'bg-blue-400' },
  { label: 'Finance Meeting', color: 'bg-purple-400' },
  { label: 'My Task', color: 'bg-green-400' },
  { label: 'Reminders', color: 'bg-yellow-400' },
];

export default function MySchedule() {
  const [view, setView] = useState('week');

  return (
    <div className="flex-1 flex flex-col bg-gray-50 min-h-screen">
      <CompanyTopBar title="My Schedule" />
      <div className="flex flex-1">
        {/* Left panel */}
        <div className="w-64 bg-white border-r border-gray-200 p-4 flex-shrink-0">
          <button className="w-full bg-blue-600 text-white text-sm py-2 rounded-lg mb-4 hover:bg-blue-700">+ Create Event</button>

          {/* Mini calendar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-semibold text-gray-800">November 2021</p>
              <div className="flex gap-1">
                <button className="text-gray-400 hover:text-gray-600 text-xs">◀</button>
                <button className="text-gray-400 hover:text-gray-600 text-xs">▶</button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-xs text-center">
              {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <div key={d} className="text-gray-400 py-1">{d}</div>)}
              {Array.from({ length: 30 }, (_, i) => i + 1).map(d => (
                <div key={d} className={`py-1 rounded cursor-pointer hover:bg-blue-50 ${d === 15 ? 'bg-blue-600 text-white rounded-full' : 'text-gray-600'}`}>{d}</div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Categories</p>
            <button className="text-blue-600 text-xs mb-2 hover:underline">+ Add Category</button>
            {categories.map(c => (
              <div key={c.label} className="flex items-center gap-2 mb-2">
                <div className={`w-3 h-3 rounded-sm ${c.color}`} />
                <span className="text-xs text-gray-600">{c.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Calendar */}
        <div className="flex-1 p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <button className="text-gray-400 hover:text-gray-600">◀</button>
              <h2 className="font-semibold text-gray-900">Today</h2>
              <button className="text-gray-400 hover:text-gray-600">▶</button>
              <span className="text-sm text-gray-500">November 2021</span>
            </div>
            <div className="flex gap-1">
              {['Day', 'Week', 'Month'].map(v => (
                <button key={v} onClick={() => setView(v.toLowerCase())}
                  className={`px-3 py-1.5 text-sm rounded-lg ${view === v.toLowerCase() ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>{v}</button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Day headers */}
            <div className="grid grid-cols-8 border-b border-gray-200">
              <div className="p-3 text-xs text-gray-400" />
              {days.map((d, i) => (
                <div key={d} className={`p-3 text-center text-xs font-medium ${i === 4 ? 'bg-blue-600 text-white' : 'text-gray-600'}`}>
                  <p>{d}</p>
                  <p className={`text-lg font-bold mt-0.5 ${i === 4 ? 'text-white' : 'text-gray-800'}`}>{14 + i}</p>
                </div>
              ))}
            </div>
            {/* Time slots */}
            {hours.map((hour, hi) => (
              <div key={hour} className="grid grid-cols-8 border-b border-gray-100 min-h-12">
                <div className="p-2 text-xs text-gray-400 border-r border-gray-100">{hour}</div>
                {days.map((_, di) => {
                  const event = events.find(e => e.day === di && e.hour === hi);
                  return (
                    <div key={di} className={`border-r border-gray-100 p-1 ${di === 4 ? 'bg-blue-50' : ''}`}>
                      {event && (
                        <div className={`text-xs p-1.5 rounded border-l-2 ${event.color}`}>
                          {event.title}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
