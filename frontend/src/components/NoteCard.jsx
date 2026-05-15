import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useUpdateNote, useDeleteNote } from '../hooks/useNotes';

export default function NoteCard({ note, onDelete }) {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const updateNoteMutation = useUpdateNote();
  const deleteNoteMutation = useDeleteNote();

  const handleClick = () => {
    navigate(`/notes/${note.id}`);
  };

  const handlePin = async (e) => {
    e.stopPropagation();
    try {
      await updateNoteMutation.mutateAsync({
        noteId: note.id,
        data: { isPinned: !note.isPinned },
      });
    } catch (error) {
      console.error('Failed to pin note:', error);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await deleteNoteMutation.mutateAsync(note.id);
        onDelete?.(note.id);
      } catch (error) {
        console.error('Failed to delete note:', error);
      }
    }
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    setShowMenu(!showMenu);
  };

  // Extract preview text from blocks or content
  const getPreview = () => {
    if (note.content) {
      return note.content.substring(0, 100);
    }
    if (note.blocks && note.blocks.length > 0) {
      return note.blocks
        .map((b) => b.content)
        .join(' ')
        .substring(0, 100);
    }
    return 'No content';
  };

  const preview = getPreview();

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
    >
      <div
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        className="h-full p-4 rounded-lg border border-gray-800 cursor-pointer transition-all hover:border-amber hover:shadow-lg hover:shadow-amber/20"
        style={{
          backgroundColor: note.color || '#ffffff',
          opacity: note.color === '#ffffff' ? 1 : 0.95,
        }}
      >
        {/* Pin indicator */}
        {note.isPinned && (
          <div className="absolute top-2 right-2 text-amber text-lg">📌</div>
        )}

        {/* Shared badge */}
        {note.shared && note.shared.length > 0 && (
          <div className="absolute top-2 left-2 bg-amber/20 text-amber text-xs px-2 py-1 rounded">
            Shared
          </div>
        )}

        {/* Title */}
        <h3
          className="font-playfair font-bold text-lg mb-2 line-clamp-2"
          style={{
            color: note.color === '#ffffff' ? '#0f0f0f' : '#f0ede6',
          }}
        >
          {note.title || 'Untitled'}
        </h3>

        {/* Preview */}
        <p
          className="text-sm mb-3 line-clamp-3"
          style={{
            color: note.color === '#ffffff' ? '#666' : 'rgba(240, 237, 230, 0.7)',
          }}
        >
          {preview}
        </p>

        {/* Tags */}
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {note.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="text-xs px-2 py-1 rounded-full bg-black/10"
                style={{
                  color: note.color === '#ffffff' ? '#0f0f0f' : '#f0ede6',
                }}
              >
                #{tag}
              </span>
            ))}
            {note.tags.length > 3 && (
              <span
                className="text-xs px-2 py-1"
                style={{
                  color: note.color === '#ffffff' ? '#0f0f0f' : '#f0ede6',
                }}
              >
                +{note.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Context menu */}
        {showMenu && (
          <motion.div
            className="absolute top-full right-0 mt-2 bg-charcoal border border-gray-800 rounded-lg shadow-lg z-10 min-w-max"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <button
              onClick={handlePin}
              className="block w-full text-left px-4 py-2 text-off-white hover:bg-gray-800 hover:text-amber transition-colors text-sm"
            >
              {note.isPinned ? '📌 Unpin' : '📌 Pin'}
            </button>
            <button
              onClick={handleDelete}
              className="block w-full text-left px-4 py-2 text-off-white hover:bg-gray-800 hover:text-red-400 transition-colors text-sm border-t border-gray-800"
            >
              🗑️ Delete
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
