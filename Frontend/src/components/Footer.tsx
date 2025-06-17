import { FaHospital, FaPhone, FaEnvelope, FaMapMarkerAlt, FaLinkedin, FaTwitter, FaGithub } from 'react-icons/fa';

export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white pt-12 pb-6">
      <div className="container mx-auto px-6">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* System Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <FaHospital className="text-teal-400 text-2xl" />
              <span className="text-xl font-bold">Health Info System</span>
            </div>
            <p className="text-gray-400">
              Advanced health information management system for medical professionals.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-teal-400 transition">
                <FaLinkedin className="text-xl" />
              </a>
              <a href="#" className="text-gray-400 hover:text-teal-400 transition">
                <FaTwitter className="text-xl" />
              </a>
              <a href="#" className="text-gray-400 hover:text-teal-400 transition">
                <FaGithub className="text-xl" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-teal-400">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition">Dashboard</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition">Patient Management</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition">Health Programs</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition">Reports & Analytics</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-teal-400">Resources</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition">Documentation</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition">API Reference</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition">Help Center</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition">Training Videos</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-teal-400">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2">
                <FaPhone className="text-gray-400" />
                <span className="text-gray-400">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center space-x-2">
                <FaEnvelope className="text-gray-400" />
                <span className="text-gray-400">support@healthtrackpro.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <FaMapMarkerAlt className="text-gray-400" />
                <span className="text-gray-400">123 Medical Drive, Boston, MA 02115</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 my-6"></div>

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} HealthTrack Pro. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <a href="#" className="text-gray-500 hover:text-white text-sm transition">Privacy Policy</a>
            <a href="#" className="text-gray-500 hover:text-white text-sm transition">Terms of Service</a>
            <a href="#" className="text-gray-500 hover:text-white text-sm transition">HIPAA Compliance</a>
          </div>
        </div>
      </div>
    </footer>
  );
};