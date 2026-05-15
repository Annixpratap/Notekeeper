import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCreateNote } from '../hooks/useNotes';
import { motion } from 'framer-motion';

export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const createNoteMutation = useCreateNote();
  const [isCreating, setIsCreating] = useState(false);

  const handleNewNote = async () => {
    try {
      setIsCreating(true);
      const response = await createNoteMutation.mutateAsync({
        title: 'Untitled Note',
      });
      navigate(`/notes/${response.id}`);
    } catch (error) {
      console.error('Failed to create note:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sidebarVariants = {
    hidden: { x: -300, opacity: 0 },
    visible: { x: 0, opacity: 1 },
    exit: { x: -300, opacity: 0 },
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        className={`fixed md:static top-0 left-0 h-screen w-64 bg-charcoal border-r border-gray-800 flex flex-col z-50 md:z-auto ${
          isOpen ? 'block' : 'hidden md:block'
        }`}
        variants={sidebarVariants}
        initial="hidden"
        animate={isOpen ? 'visible' : 'visible'}
        exit="exit"
        transition={{ duration: 0.3 }}
      >
        {/* Close button for mobile */}
        <button
          onClick={onClose}
          className="md:hidden absolute top-4 right-4 text-off-white hover:text-amber"
        >
          ✕
        </button>

        {/* User Info */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-amber flex items-center justify-center text-charcoal font-bold">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-off-white truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* New Note Button */}
        <div className="p-4">
          <motion.button
            onClick={handleNewNote}
            disabled={isCreating}
            className="w-full py-3 px-4 bg-amber text-charcoal font-semibold rounded-lg hover:bg-amber/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isCreating ? 'Creating...' : '+ New Note'}
          </motion.button>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-800">
          <motion.button
            onClick={handleLogout}
            className="w-full py-2 px-4 text-off-white hover:text-amber transition-colors text-sm"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Logout
          </motion.button>
        </div>
      </motion.aside>
    </>
  );
}
