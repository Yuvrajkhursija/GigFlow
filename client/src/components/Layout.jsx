import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice.js';
import { fetchNotifications } from '../store/slices/notificationSlice.js';
import { useEffect } from 'react';

const Layout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { unreadCount } = useSelector((state) => state.notifications);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchNotifications());
    }
  }, [isAuthenticated, dispatch]);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/gigs');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/gigs" className="text-2xl font-bold text-indigo-600">
                GigFlow
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/gigs"
                    className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Browse Gigs
                  </Link>
                  <Link
                    to="/gigs/new"
                    className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Post Gig
                  </Link>
                  <Link
                    to="/dashboard"
                    className="relative text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Dashboard
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                  <span className="text-gray-700 px-3 py-2 text-sm">
                    {user?.username}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/gigs"
                    className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Browse Gigs
                  </Link>
                  <Link
                    to="/login"
                    className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
