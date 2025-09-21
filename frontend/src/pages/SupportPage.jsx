import React from 'react';
// import Header from '../components/Header.jsx';
// import Footer from '../components/Footer.jsx';
import Starfield from '../components/Starfield.jsx';

// Reusable Icon component for Font Awesome icons
const Icon = ({ id, brand, className }) => <i className={`${brand ? 'fab' : 'fas'} fa-${id} ${className}`}></i>;

// Reusable component for each contact card
const ContactCard = ({ icon, brandIcon, title, description, link, colorClass }) => (
  <a 
    href={link} 
    target="_blank" 
    rel="noopener noreferrer"
    className={`bg-[#1a2138]/80 backdrop-blur-md border ${colorClass}/20 p-8 rounded-2xl flex flex-col items-center text-center transition-all duration-300 hover:border-${colorClass}/40 hover:-translate-y-2`}
  >
    <div className={`w-20 h-20 rounded-full bg-gradient-to-br from-[#1a2138] to-[#0a0e17] flex items-center justify-center mb-6 border-2 ${colorClass}/30`}>
        <Icon id={icon} brand={brandIcon} className={`text-4xl ${colorClass}`} />
    </div>
    <h3 className="text-2xl font-['Orbitron'] font-bold mb-3">{title}</h3>
    <p className="text-[#e2e8f0]/70 mb-6 flex-grow">{description}</p>
    <span className={`w-full py-2 px-4 rounded-lg font-semibold bg-${colorClass}/10 text-${colorClass} border border-${colorClass}/30`}>
      Contact Us
    </span>
  </a>
);

export default function SupportPage() {
  return (
    <div className="bg-[#0a0e17] text-[#e2e8f0] font-['Exo_2'] min-h-screen">
      <Starfield />
      {/* <Header /> */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@300;400;500;600;700&family=Orbitron:wght@600;700&display=swap');
        @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');
        .gradient-text {
          background: linear-gradient(90deg, #8b5cf6, #6366f1, #0ea5e9);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
      `}</style>

      <main className="relative z-10 max-w-7xl mx-auto py-16 px-4 w-full">
        <div className="text-center">
            <h1 className="text-5xl font-['Orbitron'] font-bold">
                Get In <span className="gradient-text">Touch</span>
            </h1>
            <p className="text-xl text-[#e2e8f0]/70 mt-4 max-w-2xl mx-auto">
                Have questions, feedback, or need assistance? Reach out to us through any of our official channels. We're here to help you connect across the cosmos.
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-16">
            <ContactCard 
                icon="github"
                brandIcon={true}
                title="GitHub"
                description="Follow our development, report issues, or contribute to the project on our official GitHub repository."
                link="https://github.com/kuldeepsinh2005"
                colorClass="text-gray-300 border-gray-400"
            />
            <ContactCard 
                icon="linkedin-in"
                brandIcon={true}
                title="LinkedIn"
                description="Connect with our professional network for business inquiries, partnerships, and career opportunities."
                link="https://www.linkedin.com/in/kuldeepsinh-dabhi-b78a36330/"
                colorClass="text-sky-400 border-sky-500"
            />
            <ContactCard 
                icon="envelope"
                title="Email Support"
                description="For direct support inquiries, bug reports, or feedback, send us an email. We aim to respond within 24 hours."
                link="mailto:support@cosmomeet.com"
                colorClass="text-red-400 border-red-500"
            />
            <ContactCard 
                icon="facebook-f"
                brandIcon={true}
                title="Facebook"
                description="Join our community on Facebook for the latest news, updates, and to connect with other CosmoMeet users."
                link="https://facebook.com/your-page"
                colorClass="text-blue-500 border-blue-600"
            />
        </div>
      </main>
      {/* <Footer /> */}
    </div>
  );
}

