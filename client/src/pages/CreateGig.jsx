import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createGig } from '../store/slices/gigSlice.js';

const CreateGig = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.gigs);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(
      createGig({
        ...formData,
        budget: parseFloat(formData.budget),
      })
    );
    if (createGig.fulfilled.match(result)) {
      navigate(`/gigs/${result.payload._id}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Post a New Gig</h1>
      <div className="bg-white shadow-md rounded-lg px-8 pt-6 pb-8">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              maxLength={200}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              maxLength={2000}
              rows={6}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Budget ($)
            </label>
            <input
              type="number"
              name="budget"
              value={formData.budget}
              onChange={handleChange}
              required
              min="1"
              step="0.01"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-indigo-600 text-white font-bold py-2 px-6 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 hover:bg-indigo-700 disabled:opacity-50"
            >
              {isLoading ? 'Creating...' : 'Create Gig'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/gigs')}
              className="bg-gray-300 text-gray-700 font-bold py-2 px-6 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGig;
