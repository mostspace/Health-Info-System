import { Link, useLocation, useNavigate } from 'react-router-dom';
import {  
  FaCog, 
  FaBell, 
  FaSignOutAlt, 
  FaChartBar, 
  FaUsers,
  FaClipboardList,
  FaUser
} from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { logout } from '../features/auth/authSlice';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated, loading } = useSelector((state: RootState) => state.auth);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  if (loading) {
    return null; // or a loading spinner
  }

  return (
    <nav className="bg-teal-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left side - Logo and main navigation */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <img
                className="h-8 w-auto"
                src="https://cdn.pixabay.com/photo/2015/11/12/13/13/heart-care-1040248_1280.png"
                alt="Health Info System"
              />
              <span className="ml-2 text-xl font-bold hidden md:inline">
                Health Info System
              </span>
            </Link>
            
            {isAuthenticated && (
              <div className="hidden md:ml-10 md:flex md:space-x-8">
                <Link
                  to="/dashboard"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive('/dashboard') 
                      ? 'border-teal-300 text-white' 
                      : 'border-transparent text-teal-100 hover:border-teal-200 hover:text-white'
                  }`}
                >
                  <FaChartBar className="h-4 w-4 mr-1" />
                  Dashboard
                </Link>
                
                <Link
                  to="/clients"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive('/clients')
                      ? 'border-teal-300 text-white'
                      : 'border-transparent text-teal-100 hover:border-teal-200 hover:text-white'
                  }`}
                >
                  <FaUsers className="h-4 w-4 mr-1" />
                  Clients
                </Link>
                
                <Link
                  to="/programs"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive('/programs')
                      ? 'border-teal-300 text-white'
                      : 'border-transparent text-teal-100 hover:border-teal-200 hover:text-white'
                  }`}
                >
                  <FaClipboardList className="h-4 w-4 mr-1" />
                  Programs
                </Link>
              </div>
            )}
          </div>

          {/* Right side - User controls */}
          <div className="flex items-center">
            {isAuthenticated ? (
              <>
                <button className="p-1 rounded-full text-teal-200 hover:text-white focus:outline-none">
                  <FaBell className="h-5 w-5" />
                  <span className="sr-only">Notifications</span>
                  <span className="absolute top-2 right-28 h-2 w-2 rounded-full bg-red-500"></span>
                </button>
                
                {/* User dropdown */}
                <div className="ml-4 relative flex-shrink-0">
                  <div className="relative">
                    <button 
                      className="flex items-center text-sm rounded-full focus:outline-none"
                      onMouseEnter={(e) => {
                        // Show dropdown on hover
                        const dropdown = e.currentTarget.nextElementSibling as HTMLElement;
                        if (dropdown) dropdown.style.display = 'block';
                      }}
                      onMouseLeave={(e) => {
                        // Hide dropdown after a small delay to allow cursor to move to dropdown
                        const dropdown = e.currentTarget.nextElementSibling as HTMLElement;
                        setTimeout(() => {
                          if (dropdown && !dropdown.matches(':hover')) {
                            dropdown.style.display = 'none';
                          }
                        }, 100);
                      }}
                    >
                      <img
                        className="h-8 w-8 rounded-full"
                        src={user?.imageUrl || "https://cdn.pixabay.com/photo/2018/04/18/18/56/user-3331256_1280.png"}
                        alt="User profile"
                      />
                      <span className="ml-2 hidden md:inline text-white font-medium">
                        {user?.profile?.firstName} {user?.profile?.lastName}
                      </span>
                      <svg className="ml-1 h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                    
                    {/* Dropdown menu */}
                    <div 
                      className="hidden absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 py-1 z-50"
                      onMouseEnter={(e) => {
                        // Keep dropdown visible when hovering over it
                        e.currentTarget.style.display = 'block';
                      }}
                      onMouseLeave={(e) => {
                        // Hide dropdown when leaving
                        e.currentTarget.style.display = 'none';
                      }}
                    >
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-800"
                      >
                        <FaUser className="inline h-4 w-4 mr-2" />
                        Profile
                      </Link>
                      <Link
                        to="/settings"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-800"
                      >
                        <FaCog className="inline h-4 w-4 mr-2" />
                        Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-800"
                      >
                        <FaSignOutAlt className="inline h-4 w-4 mr-2" />
                        Sign out
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex space-x-4">
                <Link
                  to="/login"
                  className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/login')
                      ? 'bg-teal-800 text-white'
                      : 'text-teal-100 hover:bg-teal-600 hover:text-white'
                  }`}
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/register')
                      ? 'bg-teal-800 text-white'
                      : 'text-teal-100 hover:bg-teal-600 hover:text-white'
                  }`}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isAuthenticated && (
        <div className="md:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              to="/dashboard"
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                isActive('/dashboard')
                  ? 'bg-teal-800 border-teal-300 text-white'
                  : 'border-transparent text-teal-100 hover:bg-teal-800 hover:border-teal-200 hover:text-white'
              }`}
            >
              <FaChartBar className="inline h-4 w-4 mr-2" />
              Dashboard
            </Link>
            <Link
              to="/clients"
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                isActive('/clients')
                  ? 'bg-teal-800 border-teal-300 text-white'
                  : 'border-transparent text-teal-100 hover:bg-teal-800 hover:border-teal-200 hover:text-white'
              }`}
            >
              <FaUsers className="inline h-4 w-4 mr-2" />
              Clients
            </Link>
            <Link
              to="/programs"
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                isActive('/programs')
                  ? 'bg-teal-800 border-teal-300 text-white'
                  : 'border-transparent text-teal-100 hover:bg-teal-800 hover:border-teal-200 hover:text-white'
              }`}
            >
              <FaClipboardList className="inline h-4 w-4 mr-2" />
              Programs
            </Link>
            <Link
              to="/profile"
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                isActive('/profile')
                  ? 'bg-teal-800 border-teal-300 text-white'
                  : 'border-transparent text-teal-100 hover:bg-teal-800 hover:border-teal-200 hover:text-white'
              }`}
            >
              <FaUser className="inline h-4 w-4 mr-2" />
              Profile
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

