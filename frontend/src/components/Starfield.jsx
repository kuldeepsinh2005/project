import React, { useEffect } from 'react';

export default function Starfield() {
  useEffect(() => {
    const starfield = document.getElementById('starfield-container');
    if (!starfield) return;

    // Clear any existing stars to prevent duplicates
    starfield.innerHTML = '';

    const createStar = () => {
      const star = document.createElement('div');
      star.classList.add('star');
      
      const size = Math.random() * 3 + 1;
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      
      star.style.top = `${Math.random() * 100}%`;
      star.style.left = `${Math.random() * 100}%`;

      const duration = Math.random() * 2 + 3;
      const opacity = Math.random() * 0.5 + 0.3;
      star.style.setProperty('--duration', `${duration}s`);
      star.style.setProperty('--opacity', opacity);

      starfield.appendChild(star);
    };

    for (let i = 0; i < 150; i++) {
      createStar();
    }
  }, []);

  return (
    <>
      <style>{`
        #starfield-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
          pointer-events: none;
        }
        .star {
          position: absolute;
          background-color: white;
          border-radius: 50%;
          animation: twinkle var(--duration, 4s) infinite ease-in-out;
          opacity: var(--opacity, 0.7);
        }
        @keyframes twinkle {
          0%, 100% { opacity: var(--opacity, 0.7); }
          50% { opacity: calc(var(--opacity, 0.7) * 0.3); }
        }
      `}</style>
      <div id="starfield-container" />
    </>
  );
}
