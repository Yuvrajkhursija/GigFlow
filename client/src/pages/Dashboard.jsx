import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchMyGigs } from '../store/slices/gigSlice.js';
import { fetchMyBids } from '../store/slices/bidSlice.js';
import { fetchNotifications, markAsRead } from '../store/slices/notificationSlice.js';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { myGigs, isLoading: gigsLoading } = useSelector((state) => state.gigs);
  const { myBids, isLoading: bidsLoading } = useSelector((state) => state.bids);
  const { notifications, isLoading: notificationsLoading } = useSelector(
    (state) => state.notifications
  );

  const [activeTab, setActiveTab] = useState('gigs');

  useEffect(() => {
    dispatch(fetchMyGigs());
    dispatch(fetchMyBids());
    dispatch(fetchNotifications());
  }, [dispatch]);

  const handleMarkAsRead = async (notificationId) => {
    await dispatch(markAsRead(notificationId));
    dispatch(fetchNotifications());
  };

  const unreadNotifications = notifications.filter((n) => !n.isRead);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>

      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('gigs')}
              className={`py-4 px-6 font-medium text-sm ${
                activeTab === 'gigs'
                  ? 'border-b-2 border-indigo-500 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              My Posted Gigs ({myGigs.length})
            </button>
            <button
              onClick={() => setActiveTab('bids')}
              className={`py-4 px-6 font-medium text-sm ${
                activeTab === 'bids'
                  ? 'border-b-2 border-indigo-500 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              My Bids ({myBids.length})
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`py-4 px-6 font-medium text-sm relative ${
                activeTab === 'notifications'
                  ? 'border-b-2 border-indigo-500 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Notifications
              {unreadNotifications.length > 0 && (
                <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                  {unreadNotifications.length}
                </span>
              )}
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'gigs' && (
            <div>
              {gigsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="border rounded p-4 animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : myGigs.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">You haven't posted any gigs yet</p>
                  <Link
                    to="/gigs/new"
                    className="text-indigo-600 hover:text-indigo-800 font-semibold"
                  >
                    Post Your First Gig
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {myGigs.map((gig) => (
                    <Link
                      key={gig._id}
                      to={`/gigs/${gig._id}`}
                      className="block border rounded p-4 hover:bg-gray-50"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-800 mb-2">
                            {gig.title}
                          </h3>
                          <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                            {gig.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-indigo-600 font-bold">${gig.budget}</span>
                            <span
                              className={`px-2 py-1 rounded text-xs font-semibold ${
                                gig.status === 'open'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {gig.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'bids' && (
            <div>
              {bidsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="border rounded p-4 animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : myBids.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">You haven't placed any bids yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {myBids.map((bid) => (
                    <Link
                      key={bid._id}
                      to={`/gigs/${bid.gigId._id}`}
                      className="block border rounded p-4 hover:bg-gray-50"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold text-gray-800">
                          {bid.gigId.title}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            bid.status === 'hired'
                              ? 'bg-green-100 text-green-800'
                              : bid.status === 'rejected'
                              ? 'bg-gray-100 text-gray-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {bid.status}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                        {bid.message}
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-indigo-600 font-bold">Your Bid: ${bid.price}</span>
                        <span className="text-gray-500">
                          Budget: ${bid.gigId.budget}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'notifications' && (
            <div>
              {notificationsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="border rounded p-4 animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    </div>
                  ))}
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No notifications yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {notifications.map((notification) => (
                    <div
                      key={notification._id}
                      className={`border rounded p-4 ${
                        !notification.isRead ? 'bg-indigo-50 border-indigo-200' : 'bg-white'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="text-gray-800">{notification.message}</p>
                          <p className="text-gray-500 text-sm mt-1">
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>
                        </div>
                        {!notification.isRead && (
                          <button
                            onClick={() => handleMarkAsRead(notification._id)}
                            className="ml-4 text-indigo-600 hover:text-indigo-800 text-sm font-semibold"
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
