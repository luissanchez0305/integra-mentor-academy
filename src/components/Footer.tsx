import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const footerLinks = {
    'About Us': ['Our Story', 'Careers', 'Press', 'Blog'],
    'For Students': ['How it Works', 'FAQs', 'Student Support', 'Success Stories'],
    'For Instructors': ['Become an Instructor', 'Instructor Guidelines', 'Revenue Share'],
    'Legal': ['Terms of Service', 'Privacy Policy', 'Cookie Policy'],
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-lg font-semibold mb-4">{category}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link}>
                    <Link to="#" className="text-gray-400 hover:text-white transition-colors">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 pt-8 border-t border-gray-800">
          <p className="text-center text-gray-400">
            © {new Date().getFullYear()} Integra Mentor Academy. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}