import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashTopBar from '../../components/DashTopBar';
import { useAuth } from '../../context/AuthContext';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

export default function DashNetwork() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { user: currentUser } = useAuth(); // or something to get JWT

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = sessionStorage.getItem('accessToken');
        const res = await fetch('http://localhost:8080/api/network/users', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setUsers(data);
        }
      } catch (err) {
        console.error('Failed to fetch network users', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((u) => {
    const term = search.toLowerCase();
    return u.fullName.toLowerCase().includes(term) || u.email.toLowerCase().includes(term);
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50 overflow-y-auto">
      <DashTopBar>
        <span className="text-xl font-bold text-gray-900">Network</span>
      </DashTopBar>

      <div className="p-8 max-w-5xl mx-auto w-full">
        <div className="flexjustify-between items-center mb-6">
          <input
            type="text"
            placeholder="Search by name or email..."
            className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="text-center py-10">Loading network...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((u) => (
              <div key={u.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold mb-4">
                  {u.fullName.charAt(0)}
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{u.fullName}</h3>
                <p className="text-sm text-gray-500 mb-6">{u.email}</p>
                <button
                  onClick={() => navigate(`/dashboard/messages?user=${u.id}`)}
                  className="w-full mt-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition"
                >
                  <ChatBubbleLeftRightIcon className="w-5 h-5" />
                  Message
                </button>
              </div>
            ))}
            {filteredUsers.length === 0 && (
              <div className="col-span-full text-center text-gray-500 py-10">
                No job seekers found matching your search.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
