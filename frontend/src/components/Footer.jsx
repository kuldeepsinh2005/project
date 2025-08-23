import React from 'react';

// --- Reusable Icon Components ---
const Icon = ({ id, className, brand = false }) => <i className={`${brand ? 'fab' : 'fas'} fa-${id} ${className}`}></i>;

export default function Footer() {
  return (
    <footer className="bg-[#1a2138] border-t border-[#6366f1]/20 pt-12 pb-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="hexagon w-8 h-8 bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center">
                <Icon id="video" className="text-white text-sm" />
              </div>
              <h3 className="text-xl text-white font-['Orbitron'] font-bold">COSMO<span className="gradient-text">MEET</span></h3>
            </div>
            <p className="text-[#e2e8f0]/70 mb-4">Connecting teams across the universe with premium video technology.</p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white text-[#1a2138] border border-[#6366f1]/20 flex items-center justify-center hover:bg-gray-200 transition-colors">
                <Icon id="twitter" brand />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white text-[#1a2138] border border-[#6366f1]/20 flex items-center justify-center hover:bg-gray-200 transition-colors">
                <Icon id="linkedin" brand />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white text-[#1a2138] border border-[#6366f1]/20 flex items-center justify-center hover:bg-gray-200 transition-colors">
                <Icon id="github" brand />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-lg text-white font-bold mb-4">Product</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-[#e2e8f0]/70 hover:text-[#6366f1] transition">Features</a></li>
              <li><a href="#" className="text-[#e2e8f0]/70 hover:text-[#6366f1] transition">Solutions</a></li>
              <li><a href="#" className="text-[#e2e8f0]/70 hover:text-[#6366f1] transition">Enterprise</a></li>
              <li><a href="#" className="text-[#e2e8f0]/70 hover:text-[#6366f1] transition">Pricing</a></li>
              <li><a href="#" className="text-[#e2e8f0]/70 hover:text-[#6366f1] transition">Download</a></li>
            </ul>
          </div>
          
          {/* Resources Links */}
          <div>
            <h4 className="text-lg text-white font-bold mb-4">Resources</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-[#e2e8f0]/70 hover:text-[#6366f1] transition">Blog</a></li>
              <li><a href="#" className="text-[#e2e8f0]/70 hover:text-[#6366f1] transition">Tutorials</a></li>
              <li><a href="#" className="text-[#e2e8f0]/70 hover:text-[#6366f1] transition">Support</a></li>
              <li><a href="#" className="text-[#e2e8f0]/70 hover:text-[#6366f1] transition">Community</a></li>
              <li><a href="#" className="text-[#e2e8f0]/70 hover:text-[#6366f1] transition">Events</a></li>
            </ul>
          </div>
          
          {/* Company Links */}
          <div>
            <h4 className="text-lg text-white font-bold mb-4">Company</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-[#e2e8f0]/70 hover:text-[#6366f1] transition">About Us</a></li>
              <li><a href="#" className="text-[#e2e8f0]/70 hover:text-[#6366f1] transition">Careers</a></li>
              <li><a href="#" className="text-[#e2e8f0]/70 hover:text-[#6366f1] transition">Contact</a></li>
              <li><a href="#" className="text-[#e2e8f0]/70 hover:text-[#6366f1] transition">Partners</a></li>
              <li><a href="#" className="text-[#e2e8f0]/70 hover:text-[#6366f1] transition">Legal</a></li>
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
