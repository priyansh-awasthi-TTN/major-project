import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const { pathname } = useLocation();
  return (
    <nav className="bg-[#1a1a2e] text-white px-8 py-4 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-8">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg">
          <span className="bg-blue-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm">J</span>
          JobHuntly
        </Link>
        <div className="hidden md:flex gap-6 text-sm text-gray-300">
          <Link to="/find-jobs" className={`hover:text-white ${pathname === '/find-jobs' ? 'text-white border-b-2 border-blue-500 pb-1' : ''}`}>Find Jobs</Link>
          <Link to="/browse-companies" className={`hover:text-white ${pathname === '/browse-companies' ? 'text-white border-b-2 border-blue-500 pb-1' : ''}`}>Browse Companies</Link>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Link to="/login" className="text-sm text-gray-300 hover:text-white px-4 py-2">Login</Link>
        <Link to="/signup" className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-md">Sign Up</Link>
      </div>
    </nav>
  );
}
