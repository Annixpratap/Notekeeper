import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axiosInstance from '../api/axiosInstance';

export default function ShareModal({ isOpen, noteId, onClose, onShare }) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [sharedUsers, setSharedUsers] = useState([]);

  React.useEffect(() => {
    if (isOpen && noteId) {
      fetchSharedUsers();
    }
  }, [isOpen, noteId]);

  const fetchSharedUsers = async () => {
    try {
      const response = await axiosInstance.get(`/notes/${noteId}`);
      setSharedUsers(response.data.shared || []);
    } catch (err) {
      console.error('Failed to fetch shared users:', err);
    }
  };

  const handleShare = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    try {
      setIsLoading(true);
      setError(null);
      await axiosInstance.post(`/notes/${noteId}/share`, {
        share_with_email: email,
      });
      setSuccess(true);
      setEmail('');
      await fetchSharedUsers();
      onShare?.();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to share note');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevoke = async (userId) => {
    try {
      await axiosInstance.delete(`/notes/${noteId}/share/${userId}`);
      await fetchSharedUsers();
    } catch (err) {
      console.error('Failed to revoke share:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-charcoal border border-gray-800 rounded-lg p-6 max-w-md w-full mx-4"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-playfair font-bold mb-4">Share Note</h2>

        {/* Share form */}
        <form onSubmit={handleShare} className="mb-6">
          <div className="flex gap-2 mb-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              className="flex-1 px-3 py-2 bg-gray-900 border border-gray-800 rounded text-off-white placeholder-gray-600 focus:outline-none focus:border-amber transition-colors"
            />
            <motion.button
              type="submit"
              disabled={isLoading || !email.trim()}
              className="px-4 py-2 bg-amber text-charcoal font-semibold rounded hover:bg-amber/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isLoading ? 'Sharing...' : 'Share'}
            </motion.button>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}
          {success && <p className="text-green-400 text-sm">Shared successfully!</p>}
        </form>

        {/* Shared users list */}
        {sharedUsers.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-400 mb-3">Shared with</h3>
            <div className="space-y-2">
              {sharedUsers.map((share) => (
                <div
                  key={share.userId}
                  className="flex items-center justify-between p-2 bg-gray-900 rounded"
                >
                  <span className="text-sm text-off-white">{share.userId}</span>
                  <motion.button
                    onClick={() => handleRevoke(share.userId)}
                    className="text-xs text-red-400 hover:text-red-300 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    Remove
                  </motion.button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Close button */}
        <motion.button
          onClick={onClose}
          className="w-full py-2 text-off-white hover:text-amber transition-colors text-sm"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Close
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
