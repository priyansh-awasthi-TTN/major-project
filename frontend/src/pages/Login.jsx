import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [tab, setTab] = useState('jobseeker');
  const [email, setEmail] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = () => {
    const displayName = email.split('@')[0] || 'User';
    login(displayName, email || 'user@email.com');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden md:flex w-1/2 bg-[#1a1a2e] flex-col justify-between p-12">
        <Link to="/" className="flex items-center gap-2 font-bold text-white text-lg">
          <span className="bg-blue-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm">J</span>
          JobHuntly
        </Link>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-48 h-48 bg-blue-600/20 rounded-full mx-auto mb-6 flex items-center justify-center text-8xl">👔</div>
            <div className="bg-white/10 rounded-xl p-4 text-white max-w-xs">
              <p className="text-sm italic">"Great platform for the job seeker that passionate about startups. Find your dream job easier."</p>
              <div className="flex items-center gap-2 mt-3">
                <div className="w-8 h-8 rounded-full bg-blue-400" />
                <div>
                  <p className="text-xs font-semibold">Jassica Hanson</p>
                  <p className="text-xs text-gray-400">Product Designer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <p className="text-gray-500 text-xs">1000+ People got hired</p>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back, Dude</h2>
          <p className="text-gray-500 text-sm mb-6">Today is a new day. It's your day. You shape it. Sign in to start managing your projects.</p>

          <div className="flex gap-2 bg-gray-100 rounded-lg p-1 mb-6">
            <button onClick={() => setTab('jobseeker')} className={`flex-1 py-2 text-sm rounded-md font-medium transition ${tab === 'jobseeker' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>Job Seeker</button>
            <button onClick={() => setTab('company')} className={`flex-1 py-2 text-sm rounded-md font-medium transition ${tab === 'company' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>Company</button>
          </div>

          <button className="w-full border border-gray-300 rounded-lg py-2.5 text-sm flex items-center justify-center gap-2 hover:bg-gray-50 mb-4">
            <span>🔵</span> Login with Google
          </button>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">Or continue with email</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500" placeholder="example@email.com" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Password</label>
              <input type="password" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500" placeholder="At least 8 characters" />
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input type="checkbox" className="accent-blue-600" /> Remember me
              </label>
              <Link to="#" className="text-blue-600 text-sm hover:underline">Forgot password?</Link>
            </div>
            <button onClick={handleLogin} className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700">Login</button>
          </div>
          <p className="text-center text-sm text-gray-500 mt-4">Don't have an account? <Link to="/signup" className="text-blue-600 hover:underline">Sign Up</Link></p>
        </div>
      </div>
    </div>
  );
}
