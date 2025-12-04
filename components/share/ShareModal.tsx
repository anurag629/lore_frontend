'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Twitter, Facebook, Link2, Mail } from 'lucide-react';
import { useState } from 'react';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { useClipboard } from '@/hooks/useClipboard';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  url: string;
  description?: string;
}

export default function ShareModal({
  isOpen,
  onClose,
  title,
  url,
  description,
}: ShareModalProps) {
  const { copy, copied } = useClipboard();
  const { showToast } = useToast();
  const [copiedUrl, setCopiedUrl] = useState(false);

  const fullUrl = typeof window !== 'undefined' ? `${window.location.origin}${url}` : url;
  const shareText = description ? `${title} - ${description}` : title;

  const handleCopy = async () => {
    await copy(fullUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const shareLinks = [
    {
      name: 'Twitter',
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(fullUrl)}`,
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      name: 'Facebook',
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`,
      color: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      name: 'Email',
      icon: Mail,
      url: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${shareText}\n\n${fullUrl}`)}`,
      color: 'bg-slate-700 hover:bg-slate-600',
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-slate-900 rounded-2xl border border-slate-800 w-full max-w-md shadow-2xl">
              {/* Header */}
              <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Share</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Share Links */}
                <div className="grid grid-cols-3 gap-4">
                  {shareLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <a
                        key={link.name}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${link.color} p-4 rounded-xl flex flex-col items-center gap-2 text-white transition-transform hover:scale-105`}
                        onClick={() => {
                          showToast(`Opening ${link.name}...`, 'info');
                        }}
                      >
                        <Icon className="w-6 h-6" />
                        <span className="text-sm font-medium">{link.name}</span>
                      </a>
                    );
                  })}
                </div>

                {/* Copy Link */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Link
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={fullUrl}
                      readOnly
                      className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                    <Button
                      onClick={handleCopy}
                      variant={copiedUrl ? 'success' : 'secondary'}
                    >
                      {copiedUrl ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Share Text Preview */}
                {description && (
                  <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                    <p className="text-sm text-slate-400 mb-2">Preview:</p>
                    <p className="text-white font-medium">{title}</p>
                    <p className="text-slate-300 text-sm mt-1 line-clamp-2">
                      {description}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

