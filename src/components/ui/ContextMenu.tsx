/**
 * Context menu component for right-click actions
 */
import React, { useState, useRef, useEffect } from 'react';
import { ContextMenuItem } from '../../types';
import { 
  Copy, 
  RefreshCw, 
  Printer, 
  Download, 
  Upload 
} from 'lucide-react';

interface ContextMenuProps {
  items: ContextMenuItem[];
  trigger?: 'click' | 'right-click';
  children: React.ReactNode;
}

export default function ContextMenu({ items, trigger = 'right-click', children }: ContextMenuProps) {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const menuRef = useRef<HTMLDivElement>(null);

  const handleContextMenu = (e: React.MouseEvent) => {
    if (trigger === 'right-click') {
      e.preventDefault();
      setPosition({ x: e.clientX, y: e.clientY });
      setVisible(true);
    }
  };

  const handleClick = () => {
    if (trigger === 'click') {
      setPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
      setVisible(true);
    }
  };

  const handleOutsideClick = (e: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
      setVisible(false);
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'copy': return <Copy className="h-4 w-4" />;
      case 'refresh-cw': return <RefreshCw className="h-4 w-4" />;
      case 'printer': return <Printer className="h-4 w-4" />;
      case 'file-down': return <Download className="h-4 w-4" />;
      case 'file-up': return <Upload className="h-4 w-4" />;
      default: return null;
    }
  };

  return (
    <>
      <div
        onContextMenu={handleContextMenu}
        onClick={handleClick}
        style={{ display: 'contents' }}
      >
        {children}
      </div>

      {visible && (
        <div
          ref={menuRef}
          className="fixed z-50 bg-white border border-gray-200 rounded-md shadow-lg py-1 min-w-[200px]"
          style={{
            left: position.x,
            top: position.y,
          }}
        >
          {items.map((item) => (
            <button
              key={item.id}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              onClick={() => {
                item.action();
                setVisible(false);
              }}
            >
              {item.icon && getIcon(item.icon)}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
