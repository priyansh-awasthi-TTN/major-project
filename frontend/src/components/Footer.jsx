import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-[#1a1a2e] text-gray-400 px-8 py-12">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 text-white font-bold text-lg mb-3">
            <span className="bg-blue-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm">J</span>
            JobHuntly
          </div>
          <p className="text-sm">Great platform for the job seeker that passionate about startups. Find your dream job easier.</p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">About</h4>
          <ul className="space-y-2 text-sm">
            {['Companies', 'Pricing', 'Terms', 'Advice', 'Privacy Policy'].map(i => <li key={i}><Link to="#" className="hover:text-white">{i}</Link></li>)}
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Resources</h4>
          <ul className="space-y-2 text-sm">
            {['Help Docs', 'Guide', 'Updates', 'Contact Us'].map(i => <li key={i}><Link to="#" className="hover:text-white">{i}</Link></li>)}
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Get job notifications</h4>
          <p className="text-sm mb-3">The latest job news, articles, sent to your inbox weekly.</p>
          <div className="flex gap-2">
            <input type="email" placeholder="Email Address" className="bg-[#2a2a4a] text-white text-sm px-3 py-2 rounded flex-1 outline-none" />
            <button className="bg-blue-600 text-white text-sm px-4 py-2 rounded hover:bg-blue-700">Subscribe</button>
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-gray-700 text-sm text-center">
        2021 © JobHuntly. All rights reserved.
      </div>
    </footer>
  );
}
