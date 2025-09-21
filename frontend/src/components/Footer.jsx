import React from 'react';
import { Link } from 'react-router-dom';

// --- Reusable Icon Components ---
const Icon = ({ id, className, brand = false }) => <i className={`${brand ? 'fab' : 'fas'} fa-${id} ${className}`}></i>;

export default function Footer() {

  return (
    <footer className="bg-[#1a2138] border-t border-[#6366f1]/20 pt-12 pb-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">

          <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="hexagon w-8 h-8 bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center">
                  <Icon id="video" className="text-white text-sm" />
                </div>
                <h3 className="text-xl text-white font-['Orbitron'] font-bold">COSMO<span className="gradient-text">MEET</span></h3>
              </div>
              <p className="text-[#e2e8f0]/70 mb-4">Connecting teams across the universe with premium video technology.</p>
              <div className="flex space-x-4">
                {/* Twitter Link */}
                <Link to="https://x.com/Kuldeepsinh69" 
                      className="w-10 h-10 rounded-full bg-white text-[#1a2138] border border-[#6366f1]/20 flex items-center justify-center hover:bg-gray-200 transition-colors" 
                      target="_blank" 
                      rel="noopener noreferrer">
                  <Icon id="twitter" brand />
                </Link>

                {/* LinkedIn Link */}
                <Link to="https://www.linkedin.com/in/kuldeepsinh-dabhi-b78a36330/" 
                      className="w-10 h-10 rounded-full bg-white text-[#1a2138] border border-[#6366f1]/20 flex items-center justify-center hover:bg-gray-200 transition-colors" 
                      target="_blank" 
                      rel="noopener noreferrer">
                  <Icon id="linkedin" brand />
                </Link>

                {/* GitHub Link */}
                <Link to="https://github.com/kuldeepsinh2005" 
                      className="w-10 h-10 rounded-full bg-white text-[#1a2138] border border-[#6366f1]/20 flex items-center justify-center hover:bg-gray-200 transition-colors" 
                      target="_blank" 
                      rel="noopener noreferrer">
                  <Icon id="github" brand />
                </Link>
              </div>
            </div>

          {/* Product Links */}
          <div>
            <h4 className="text-lg text-white font-bold mb-4">Product</h4>
            <ul className="space-y-3">
              <li><Link to="#" className="text-[#e2e8f0]/70 hover:text-[#6366f1] transition" rel="noopener noreferrer">Features</Link></li>
              <li><Link to="#" className="text-[#e2e8f0]/70 hover:text-[#6366f1] transition" rel="noopener noreferrer">Solutions</Link></li>
              <li><Link to="#" className="text-[#e2e8f0]/70 hover:text-[#6366f1] transition" rel="noopener noreferrer">Enterprise</Link></li>
              <li><Link to="#" className="text-[#e2e8f0]/70 hover:text-[#6366f1] transition" rel="noopener noreferrer">Pricing</Link></li>
              <li><Link to="#" className="text-[#e2e8f0]/70 hover:text-[#6366f1] transition" rel="noopener noreferrer">Download</Link></li>
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h4 className="text-lg text-white font-bold mb-4">Resources</h4>
            <ul className="space-y-3">
              <li><Link to="#" className="text-[#e2e8f0]/70 hover:text-[#6366f1] transition" rel="noopener noreferrer">Blog</Link></li>
              <li><Link to="#" className="text-[#e2e8f0]/70 hover:text-[#6366f1] transition" rel="noopener noreferrer">Tutorials</Link></li>
              <li><Link to="#" className="text-[#e2e8f0]/70 hover:text-[#6366f1] transition" rel="noopener noreferrer">Support</Link></li>
              <li><Link to="#" className="text-[#e2e8f0]/70 hover:text-[#6366f1] transition" rel="noopener noreferrer">Community</Link></li>
              <li><Link to="#" className="text-[#e2e8f0]/70 hover:text-[#6366f1] transition" rel="noopener noreferrer">Events</Link></li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-lg text-white font-bold mb-4">Company</h4>
            <ul className="space-y-3">
              <li><Link to="#" className="text-[#e2e8f0]/70 hover:text-[#6366f1] transition" rel="noopener noreferrer">About Us</Link></li>
              <li><Link to="#" className="text-[#e2e8f0]/70 hover:text-[#6366f1] transition" rel="noopener noreferrer">Careers</Link></li>
              <li><Link to="#" className="text-[#e2e8f0]/70 hover:text-[#6366f1] transition" rel="noopener noreferrer">Contact</Link></li>
              <li><Link to="#" className="text-[#e2e8f0]/70 hover:text-[#6366f1] transition" rel="noopener noreferrer">Partners</Link></li>
              <li><Link to="#" className="text-[#e2e8f0]/70 hover:text-[#6366f1] transition" rel="noopener noreferrer">Legal</Link></li>
            </ul>
          </div>

        </div>

        <div className="border-t border-[#6366f1]/20 pt-8 text-center text-[#e2e8f0]/50 text-sm">
          <p>&copy; {new Date().getFullYear()} CosmoMeet Technologies. All rights reserved across the cosmos.</p>
        </div>

      </div>
    </footer>
  );
}
