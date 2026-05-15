import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CommandMenu from './CommandMenu';

const BLOCK_TYPES = ['text', 'heading1', 'heading2', 'bullet', 'todo', 'code', 'divider', 'quote'];

export default function BlockEditor({ blocks = [], onChange, onSave }) {
  const [commandMenuOpen, setCommandMenuOpen] = useState(false);
  const [commandMenuPosition, setCommandMenuPosition] = useState(null);
  const [activeBlockId, setActiveBlockId] = useState(null);
  const blockRefsRef = useRef({});

  // Auto-expand textareas
  const autoExpandTextarea = (textarea) => {
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 500) + 'px';
    }
  };

  const handleBlockChange = (blockId, content) => {
    const updatedBlocks = blocks.map((b) =>
      b.id === blockId ? { ...b, content } : b
    );
    onChange(updatedBlocks);
    
    // Auto-expand textarea
    setTimeout(() => {
      autoExpandTextarea(blockRefsRef.current[blockId]);
    }, 0);
  };

  const handleBlockTypeChange = (blockId, newType) => {
    const updatedBlocks = blocks.map((b) =>
      b.id === blockId ? { ...b, type: newType } : b
    );
    onChange(updatedBlocks);
    onSave?.(updatedBlocks);
    setCommandMenuOpen(false);
  };

  const handleKeyDown = (e, blockId, blockIndex) => {
    const block = blocks.find((b) => b.id === blockId);
    const isAtStart = e.currentTarget.selectionStart === 0;
    const isAtEnd = e.currentTarget.selectionEnd === e.currentTarget.value.length;

    // Enter: create new block
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const newBlock = {
        id: `block-${Date.now()}`,
        type: 'text',
        content: '',
      };
      const newBlocks = [
        ...blocks.slice(0, blockIndex + 1),
        newBlock,
        ...blocks.slice(blockIndex + 1),
      ];
      onChange(newBlocks);
      setTimeout(() => {
        blockRefsRef.current[newBlock.id]?.focus();
      }, 0);
    }

    // Backspace on empty block: delete it
    if (e.key === 'Backspace' && block.content === '' && blocks.length > 1) {
      e.preventDefault();
      const newBlocks = blocks.filter((b) => b.id !== blockId);
      onChange(newBlocks);
      if (blockIndex > 0) {
        setTimeout(() => {
          blockRefsRef.current[blocks[blockIndex - 1].id]?.focus();
        }, 0);
      }
    }

    // Slash at start: open command menu
    if (e.key === '/' && isAtStart && block.content === '') {
      e.preventDefault();
      setActiveBlockId(blockId);
      setCommandMenuPosition({ x: 0, y: 0 });
      setCommandMenuOpen(true);
    }

    // Escape: close command menu
    if (e.key === 'Escape') {
      setCommandMenuOpen(false);
    }
  };

  const handleAddBlock = () => {
    const newBlock = {
      id: `block-${Date.now()}`,
      type: 'text',
      content: '',
    };
    onChange([...blocks, newBlock]);
    setTimeout(() => {
      blockRefsRef.current[newBlock.id]?.focus();
    }, 0);
  };

  const handleDeleteBlock = (blockId) => {
    if (blocks.length > 1) {
      const newBlocks = blocks.filter((b) => b.id !== blockId);
      onChange(newBlocks);
    }
  };

  const handleDragStart = (e, blockId) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('blockId', blockId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetBlockId) => {
    e.preventDefault();
    const sourceBlockId = e.dataTransfer.getData('blockId');
    if (sourceBlockId === targetBlockId) return;

    const sourceIndex = blocks.findIndex((b) => b.id === sourceBlockId);
    const targetIndex = blocks.findIndex((b) => b.id === targetBlockId);

    const newBlocks = [...blocks];
    const [movedBlock] = newBlocks.splice(sourceIndex, 1);
    newBlocks.splice(targetIndex, 0, movedBlock);

    onChange(newBlocks);
    onSave?.(newBlocks);
  };

  const getBlockPlaceholder = (type) => {
    const placeholders = {
      text: 'Type something...',
      heading1: 'Heading 1',
      heading2: 'Heading 2',
      bullet: 'Bullet point',
      todo: 'Todo item',
      code: 'Code...',
      divider: '---',
      quote: 'Quote...',
    };
    return placeholders[type] || 'Type something...';
  };

  const getBlockStyles = (type) => {
    const styles = {
      text: 'text-base',
      heading1: 'text-3xl font-playfair font-bold',
      heading2: 'text-2xl font-playfair font-bold',
      bullet: 'text-base ml-4 before:content-["•"] before:mr-2',
      todo: 'text-base',
      code: 'font-dm-mono text-sm bg-gray-900 p-2 rounded',
      divider: 'text-center text-gray-600',
      quote: 'text-base italic border-l-4 border-amber pl-4',
    };
    return styles[type] || styles.text;
  };

  return (
    <div className="space-y-0">
      <AnimatePresence>
        {blocks.map((block, idx) => (
          <motion.div
            key={block.id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="group flex items-start gap-2 py-1"
            draggable
            onDragStart={(e) => handleDragStart(e, block.id)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, block.id)}
          >
            {/* Drag handle */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity pt-2 text-gray-600 cursor-grab active:cursor-grabbing text-sm">
              ⠿
            </div>

            {/* Block input */}
            <div className="flex-1 relative">
              {block.type === 'todo' && (
                <input
                  type="checkbox"
                  className="mr-2 mt-1"
                  defaultChecked={block.checked}
                  onChange={(e) => {
                    const updatedBlocks = blocks.map((b) =>
                      b.id === block.id ? { ...b, checked: e.target.checked } : b
                    );
                    onChange(updatedBlocks);
                  }}
                />
              )}

              <textarea
                ref={(el) => {
                  if (el) {
                    blockRefsRef.current[block.id] = el;
                    autoExpandTextarea(el);
                  }
                }}
                value={block.content}
                onChange={(e) => handleBlockChange(block.id, e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, block.id, idx)}
                onFocus={() => setActiveBlockId(block.id)}
                placeholder={getBlockPlaceholder(block.type)}
                className={`w-full bg-transparent text-off-white placeholder-gray-600 focus:outline-none resize-none overflow-hidden ${getBlockStyles(
                  block.type
                )}`}
                rows={1}
              />

              {/* Command menu */}
              {commandMenuOpen && activeBlockId === block.id && (
                <CommandMenu
                  onSelect={(type) => handleBlockTypeChange(block.id, type)}
                  onClose={() => setCommandMenuOpen(false)}
                />
              )}
            </div>

            {/* Delete button */}
            <button
              onClick={() => handleDeleteBlock(block.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-600 hover:text-red-400 pt-2 text-sm"
              title="Delete block"
            >
              ✕
            </button>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Add block button - only show if no blocks or as hint */}
      {blocks.length === 0 && (
        <motion.button
          onClick={handleAddBlock}
          className="text-gray-600 hover:text-amber transition-colors text-sm py-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          + Add block
        </motion.button>
      )}
    </div>
  );
}
