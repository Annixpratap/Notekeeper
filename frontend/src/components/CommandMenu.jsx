import React, { useState } from 'react';
import { motion } from 'framer-motion';

const BLOCK_TYPES = [
  { type: 'text', label: 'Text', icon: '📝' },
  { type: 'heading1', label: 'Heading 1', icon: 'H1' },
  { type: 'heading2', label: 'Heading 2', icon: 'H2' },
  { type: 'bullet', label: 'Bullet', icon: '•' },
  { type: 'todo', label: 'Todo', icon: '☐' },
  { type: 'code', label: 'Code', icon: '</>' },
  { type: 'divider', label: 'Divider', icon: '—' },
  { type: 'quote', label: 'Quote', icon: '"' },
];

export default function CommandMenu({ onSelect, onClose }) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % BLOCK_TYPES.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + BLOCK_TYPES.length) % BLOCK_TYPES.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      onSelect(BLOCK_TYPES[selectedIndex].type);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  React.useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex]);

  return (
    <motion.div
      className="absolute top-full left-0 mt-2 bg-gray-900 border border-gray-800 rounded-lg shadow-lg z-50 min-w-max"
      initial={{ opacity: 0, scale: 0.95, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <div className="p-2">
        {BLOCK_TYPES.map((item, idx) => (
          <motion.button
            key={item.type}
            onClick={() => onSelect(item.type)}
            className={`w-full text-left px-3 py-2 rounded transition-colors flex items-center gap-2 ${
              idx === selectedIndex
                ? 'bg-amber text-charcoal'
                : 'text-off-white hover:bg-gray-800'
            }`}
            whileHover={{ x: 4 }}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="text-sm">{item.label}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
