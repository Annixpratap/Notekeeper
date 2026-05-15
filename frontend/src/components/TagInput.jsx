import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function TagInput({ tags = [], onChange }) {
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = inputValue.trim();
      if (newTag && !tags.includes(newTag)) {
        onChange([...tags, newTag]);
        setInputValue('');
      }
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  };

  const removeTag = (tagToRemove) => {
    onChange(tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div className="flex flex-wrap items-center gap-2 px-3 py-2 rounded-lg border border-gray-800 focus-within:border-amber transition-colors">
      {tags.map((tag, idx) => (
        <motion.div
          key={idx}
          className="flex items-center gap-1 bg-amber/20 text-amber px-2 py-1 rounded text-sm"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
        >
          <span>#{tag}</span>
          <button
            onClick={() => removeTag(tag)}
            className="hover:text-amber/70 transition-colors"
          >
            ✕
          </button>
        </motion.div>
      ))}
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleInputKeyDown}
        placeholder={tags.length === 0 ? 'Add tags...' : ''}
        className="flex-1 min-w-[100px] bg-transparent text-off-white placeholder-gray-600 focus:outline-none text-sm"
      />
    </div>
  );
}
