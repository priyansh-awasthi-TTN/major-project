import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function SignUp() {
  const [tab, setTab] = useState('jobseeker');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await register({
        fullName,
        email,
        password,
        userType: tab.toUpperCase()
      });
      navigate('/dashboard');
    } catch (error) {
      setError(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
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
            </div>
          </div>
        </div>
        <p className="text-gray-500 text-xs">1000+ People got hired</p>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Get more opportunities</h2>
          <p className="text-gray-500 text-sm mb-6">Create your account to start your job search journey.</p>

          <div className="flex gap-2 bg-gray-100 rounded-lg p-1 mb-6">
            <button onClick={() => setTab('jobseeker')} className={`flex-1 py-2 text-sm rounded-md font-medium transition ${tab === 'jobseeker' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>Job Seeker</button>
            <button onClick={() => setTab('company')} className={`flex-1 py-2 text-sm rounded-md font-medium transition ${tab === 'company' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>Company</button>
          </div>

          <button className="w-full border border-gray-300 rounded-lg py-2.5 text-sm flex items-center justify-center gap-2 hover:bg-gray-50 mb-4">
            <span>🔵</span> Sign Up with Google
          </button>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">Or sign up with email</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Full Name</label>
              <input 
                value={fullName} 
                onChange={e => setFullName(e.target.value)} 
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500" 
                placeholder="Enter your full name"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Email Address</label>
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500" 
                placeholder="example@email.com"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500" 
                placeholder="At least 8 characters"
                required
                minLength={8}
              />
            </div>
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : 'Continue'}
            </button>
          </form>
          <p className="text-xs text-gray-400 text-center mt-3">By clicking 'Continue', you acknowledge that you have read and accept the <span className="text-blue-600 cursor-pointer">Terms of Service</span> and <span className="text-blue-600 cursor-pointer">Privacy Policy</span>.</p>
          <p className="text-center text-sm text-gray-500 mt-4">Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Login</Link></p>
        </div>
      </div>
    </div>
  );
}
