import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchGig, clearCurrentGig } from '../store/slices/gigSlice.js';
import { fetchGigBids, createBid, hireBid, clearGigBids } from '../store/slices/bidSlice.js';

const GigDetail = () => {
  const { gigId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentGig, isLoading: gigLoading } = useSelector((state) => state.gigs);
  const { gigBids, isLoading: bidLoading } = useSelector((state) => state.bids);
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const [bidForm, setBidForm] = useState({
    message: '',
    price: '',
  });
  const [showBidForm, setShowBidForm] = useState(false);

  useEffect(() => {
    dispatch(fetchGig(gigId));
    return () => {
      dispatch(clearCurrentGig());
      dispatch(clearGigBids());
    };
  }, [gigId, dispatch]);

  useEffect(() => {
    if (currentGig && isAuthenticated && currentGig.ownerId._id === user?._id) {
      dispatch(fetchGigBids(gigId));
    }
  }, [currentGig, isAuthenticated, user, gigId, dispatch]);

  const isOwner = currentGig && isAuthenticated && currentGig.ownerId._id === user?._id;
  const isOpen = currentGig?.status === 'open';

  const handleBidSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(
      createBid({
        gigId,
        ...bidForm,
        price: parseFloat(bidForm.price),
      })
    );
    if (createBid.fulfilled.match(result)) {
      setBidForm({ message: '', price: '' });
      setShowBidForm(false);
      if (isOwner) {
        dispatch(fetchGigBids(gigId));
      }
    }
  };

  const handleHire = async (bidId) => {
    const result = await dispatch(hireBid(bidId));
    if (hireBid.fulfilled.match(result)) {
      dispatch(fetchGig(gigId));
      dispatch(fetchGigBids(gigId));
    }
  };

  if (gigLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-8 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      </div>
    );
  }

  if (!currentGig) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <p className="text-gray-500 text-lg">Gig not found</p>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white rounded-lg shadow p-8 mb-6">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-3xl font-bold text-gray-800">{currentGig.title}</h1>
          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold ${
              currentGig.status === 'open'
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {currentGig.status}
          </span>
        </div>
        <p className="text-gray-600 mb-4 whitespace-pre-wrap">{currentGig.description}</p>
        <div className="flex justify-between items-center">
          <div>
            <span className="text-gray-500">Budget: </span>
            <span className="text-indigo-600 font-bold text-2xl">${currentGig.budget}</span>
          </div>
          <div className="text-gray-500">
            Posted by <span className="font-semibold">{currentGig.ownerId.username}</span>
          </div>
        </div>
      </div>

      {isAuthenticated && !isOwner && isOpen && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          {!showBidForm ? (
            <button
              onClick={() => setShowBidForm(true)}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700"
            >
              Place a Bid
            </button>
          ) : (
            <form onSubmit={handleBidSubmit}>
              <h3 className="text-xl font-semibold mb-4">Submit Your Bid</h3>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Message
                </label>
                <textarea
                  value={bidForm.message}
                  onChange={(e) => setBidForm({ ...bidForm, message: e.target.value })}
                  required
                  maxLength={1000}
                  rows={4}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Your Price ($)
                </label>
                <input
                  type="number"
                  value={bidForm.price}
                  onChange={(e) => setBidForm({ ...bidForm, price: e.target.value })}
                  required
                  min="1"
                  step="0.01"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-indigo-600 text-white py-2 px-6 rounded-lg hover:bg-indigo-700"
                >
                  Submit Bid
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowBidForm(false);
                    setBidForm({ message: '', price: '' });
                  }}
                  className="bg-gray-300 text-gray-700 py-2 px-6 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {isOwner && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Bids for this Gig</h2>
          {bidLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="border rounded p-4 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                </div>
              ))}
            </div>
          ) : gigBids.length === 0 ? (
            <p className="text-gray-500">No bids yet</p>
          ) : (
            <div className="space-y-4">
              {gigBids.map((bid) => (
                <div
                  key={bid._id}
                  className={`border rounded p-4 ${
                    bid.status === 'hired'
                      ? 'bg-green-50 border-green-200'
                      : bid.status === 'rejected'
                      ? 'bg-gray-50 border-gray-200'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-semibold text-gray-800">
                        {bid.freelancerId.username}
                      </span>
                      <span className="text-indigo-600 font-bold ml-4">${bid.price}</span>
                    </div>
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
                  <p className="text-gray-600 mb-3">{bid.message}</p>
                  {isOpen && bid.status === 'pending' && (
                    <button
                      onClick={() => handleHire(bid._id)}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                      Hire This Freelancer
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GigDetail;
