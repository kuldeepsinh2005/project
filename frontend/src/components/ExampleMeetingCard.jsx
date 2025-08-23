import React from 'react';

// --- Reusable Icon Component ---
const Icon = ({ id, className }) => <i className={`fas fa-${id} ${className}`}></i>;

// --- Reusable Participant Card ---
const ParticipantCard = ({ name, color }) => {
    const colors = {
        plasma: {
            bg: 'bg-gradient-to-br from-[#6366f1]/30 to-[#8b5cf6]/30',
            iconBg: 'bg-[#6366f1]/20',
            iconColor: 'text-[#6366f1]'
        },
        astral: {
            bg: 'bg-gradient-to-br from-[#0ea5e9]/30 to-[#6366f1]/30',
            iconBg: 'bg-[#0ea5e9]/20',
            iconColor: 'text-[#0ea5e9]'
        },
        quantum: {
            bg: 'bg-gradient-to-br from-[#8b5cf6]/30 to-[#0ea5e9]/30',
            iconBg: 'bg-[#8b5cf6]/20',
            iconColor: 'text-[#8b5cf6]'
        },
        purple: {
            bg: 'bg-gradient-to-br from-[#8b5cf6]/30 to-[#d946ef]/30',
            iconBg: 'bg-purple-500/20',
            iconColor: 'text-purple-400'
        }
    };
    const selectedColor = colors[color] || colors.plasma;

    return (
        <div className={`${selectedColor.bg} aspect-video rounded-lg overflow-hidden`}>
            <div className="bg-[#0a0e17]/50 h-full flex items-center justify-center">
                <div className="text-center">
                    <div className={`w-12 h-12 rounded-full ${selectedColor.iconBg} flex items-center justify-center mx-auto mb-2`}>
                        <Icon id="user" className={`${selectedColor.iconColor} text-xl`} />
                    </div>
                    <div className="text-sm font-medium text-white">{name}</div>
                </div>
            </div>
        </div>
    );
};


export default function ExampleMeetingCard() {
  return (
    <div className="relative">
      {/* This style tag ensures Font Awesome is loaded for the icons */}
      <style>{`
        @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');
        .floating {
          animation: floating 8s ease-in-out infinite;
        }
        @keyframes floating {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
      `}</style>

      <div className="floating">
        <div className="bg-[#1a2138]/60 backdrop-blur-xl border border-[#6366f1]/15 p-4 md:p-6 rounded-2xl shadow-2xl max-w-md mx-auto">
          <div className="bg-gradient-to-br from-[#070a12] to-[#1a2138] rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#6366f1]/20 to-[#8b5cf6]/20 p-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-2.5 h-2.5 bg-red-500 rounded-full mr-2 animate-pulse"></div>
                  <div className="text-xs font-bold text-white tracking-wider">LIVE</div>
                </div>
                <div className="text-xs text-white font-mono">00:25:18</div>
              </div>
            </div>
            
            {/* Participant Grid */}
            <div className="grid grid-cols-2 gap-2 p-3">
              <ParticipantCard name="Alex Morgan" color="plasma" />
              <ParticipantCard name="Taylor Kim" color="astral" />
              <ParticipantCard name="Jordan Lee" color="quantum" />
              <ParticipantCard name="Sam Rivera" color="purple" />
            </div>
            
            {/* Controls */}
            <div className="p-3 bg-[#1a2138] border-t border-[#6366f1]/20">
              <div className="flex justify-center space-x-4">
                <button className="w-10 h-10 rounded-full bg-[#0a0e17] border border-[#6366f1]/30 flex items-center justify-center text-white hover:bg-[#6366f1]/20 transition">
                  <Icon id="microphone" />
                </button>
                <button className="w-10 h-10 rounded-full bg-[#0a0e17] border border-[#6366f1]/30 flex items-center justify-center text-white hover:bg-[#6366f1]/20 transition">
                  <Icon id="video" />
                </button>
                <button className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white hover:bg-red-600 transition">
                  <Icon id="phone-slash" />
                </button>
                <button className="w-10 h-10 rounded-full bg-[#0a0e17] border border-[#6366f1]/30 flex items-center justify-center text-white hover:bg-[#6366f1]/20 transition">
                  <Icon id="share-alt" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
