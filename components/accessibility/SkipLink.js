'use client';

import { useState, useEffect, useRef } from 'react';

export function SkipLink({ children = "Skip to main content" }) {
  return (
    <a 
      href="#main-content" 
      className="skip-to-content"
      aria-label={children}
    >
      {children}
    </a>
  );
}

export function Announcer({ message }) {
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    if (message) {
      setAnnouncement(message);
      const timer = setTimeout(() => setAnnouncement(""), 1000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div 
      aria-live="polite" 
      aria-atomic="true"
      className="sr-only"
    >
      {announcement}
    </div>
  );
}

export function FocusTrap({ children, isActive }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const focusableElements = containerRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    containerRef.current.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      containerRef.current?.removeEventListener('keydown', handleTabKey);
    };
  }, [isActive]);

  return <div ref={containerRef}>{children}</div>;
}
