import React from 'react';

// --- Reusable Icon Component ---
const Icon = ({ id, className }) => <i className={`fas fa-${id} ${className}`}></i>;

// --- Glass Card Component for reuse ---
const FeatureCard = ({ icon, title, description, color }) => {
  const colors = {
    plasma: {
      border: 'hover:border-[#6366f1]/50',
      iconBg: 'bg-gradient-to-br from-[#6366f1]/20 to-[#6366f1]/10 group-hover:from-[#6366f1]/30 group-hover:to-[#6366f1]/20',
      iconColor: 'text-[#6366f1]',
      linkColor: 'text-[#6366f1]'
    },
    quantum: {
      border: 'hover:border-[#8b5cf6]/50',
      iconBg: 'bg-gradient-to-br from-[#8b5cf6]/20 to-[#8b5cf6]/10 group-hover:from-[#8b5cf6]/30 group-hover:to-[#8b5cf6]/20',
      iconColor: 'text-[#8b5cf6]',
      linkColor: 'text-[#8b5cf6]'
    },
    astral: {
      border: 'hover:border-[#0ea5e9]/50',
      iconBg: 'bg-gradient-to-br from-[#0ea5e9]/20 to-[#0ea5e9]/10 group-hover:from-[#0ea5e9]/30 group-hover:to-[#0ea5e9]/20',
      iconColor: 'text-[#0ea5e9]',
      linkColor: 'text-[#0ea5e9]'
    }
  };

  const selectedColor = colors[color] || colors.plasma;

  return (
    <div className={`bg-[#1a2138]/60 backdrop-blur-xl border border-[#6366f1]/15 p-8 rounded-2xl group ${selectedColor.border} transition-all`}>
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${selectedColor.iconBg} transition-all`}>
        <Icon id={icon} className={`${selectedColor.iconColor} text-2xl`} />
      </div>
      <h3 className="text-xl font-bold mb-3 text-white">{title}</h3>
      <p className="text-[#e2e8f0]/70 mb-4">{description}</p>
      <a href="#" className={`${selectedColor.linkColor} font-medium flex items-center group-hover:underline`}>
        Learn more <Icon id="arrow-right" className="ml-2 text-sm" />
      </a>
    </div>
  );
};

export default function Features() {
  return (
    <section className="relative py-16 px-4">
       {/* This style tag ensures Font Awesome is loaded for the icons */}
       <style>{`
        @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');
      `}</style>
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-['Orbitron'] font-bold mb-4 text-white">STELLAR FEATURES</h2>
          <p className="text-[#e2e8f0]/80 text-xl">Advanced technology for seamless collaboration across galaxies</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard 
            icon="shield-alt"
            title="Quantum Encryption"
            description="Military-grade security with end-to-end encryption for all your meetings."
            color="plasma"
          />
          <FeatureCard 
            icon="vr-cardboard"
            title="Holographic Presence"
            description="Next-gen spatial audio and video for immersive meeting experiences."
            color="quantum"
          />
          <FeatureCard 
            icon="robot"
            title="AI-Powered Assistance"
            description="Smart meeting notes, real-time translation, and automated summaries."
            color="astral"
          />
        </div>
      </div>
    </section>
  );
}
