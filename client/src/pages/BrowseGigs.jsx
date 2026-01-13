import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchGigs } from '../store/slices/gigSlice.js';

const BrowseGigs = () => {
  const dispatch = useDispatch();
  const { gigs, isLoading } = useSelector((state) => state.gigs);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchGigs(''));
  }, [dispatch]);

  const handleSearch = (e) => {
    e.preventDefault();
    dispatch(fetchGigs(searchTerm));
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Browse Gigs</h1>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search gigs by title..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
          >
            Search
          </button>
        </form>
      </div>

      {gigs.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500 text-lg">No gigs found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gigs.map((gig) => (
            <Link
              key={gig._id}
              to={`/gigs/${gig._id}`}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 block"
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {gig.title}
              </h3>
              <p className="text-gray-600 mb-4 line-clamp-3">
                {gig.description}
              </p>
              <div className="flex justify-between items-center">
                <span className="text-indigo-600 font-bold text-lg">
                  ${gig.budget}
                </span>
                <span className="text-sm text-gray-500">
                  by {gig.ownerId?.username}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default BrowseGigs;
