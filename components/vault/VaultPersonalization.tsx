'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { 
  Edit3, 
  Tag, 
  Heart, 
  Bookmark, 
  Bell, 
  Palette,
  Save,
  X,
  Plus
} from 'lucide-react';
import { type VaultSummary } from '@/lib/contracts';

interface VaultPersonalizationProps {
  summary: VaultSummary;
  isOwner?: boolean;
  onSave?: (personalization: VaultPersonalizationData) => void;
}

interface VaultPersonalizationData {
  displayName: string;
  description: string;
  tags: string[];
  category: string;
  colorTheme: string;
  notifications: {
    activity: boolean;
    deadline: boolean;
    distribution: boolean;
    valueChange: boolean;
  };
  watchlist: boolean;
  notes: string;
}

const CATEGORIES = [
  'Personal',
  'Business',
  'Investment',
  'Emergency',
  'Legacy',
  'Other'
];

const COLOR_THEMES = [
  { id: 'default', name: 'Default', colors: ['#C11A29', '#FF2E3B'] },
  { id: 'ocean', name: 'Ocean', colors: ['#0066CC', '#4DA6FF'] },
  { id: 'forest', name: 'Forest', colors: ['#228B22', '#32CD32'] },
  { id: 'sunset', name: 'Sunset', colors: ['#FF6B35', '#FF9558'] },
  { id: 'purple', name: 'Purple', colors: ['#8B5CF6', '#A78BFA'] },
];

const SUGGESTED_TAGS = [
  'high-value',
  'long-term',
  'emergency',
  'family',
  'business',
  'investment',
  'backup',
  'retirement'
];

export function VaultPersonalization({ summary, isOwner, onSave }: VaultPersonalizationProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [personalization, setPersonalization] = useState<VaultPersonalizationData>({
    displayName: '',
    description: '',
    tags: [],
    category: 'Personal',
    colorTheme: 'default',
    notifications: {
      activity: true,
      deadline: true,
      distribution: true,
      valueChange: false
    },
    watchlist: false,
    notes: ''
  });

  const [newTag, setNewTag] = useState('');

  // Load saved personalization data
  useEffect(() => {
    // In a real implementation, you'd load this from local storage or API
    const saved = localStorage.getItem(`vault-${summary.vault}-personalization`);
    if (saved) {
      setPersonalization(JSON.parse(saved));
    } else {
      // Set default display name
      setPersonalization(prev => ({
        ...prev,
        displayName: `Vault ${summary.vault?.slice(0, 6)}...${summary.vault?.slice(-4)}`
      }));
    }
  }, [summary.vault]);

  const handleSave = () => {
    // Save to local storage
    localStorage.setItem(`vault-${summary.vault}-personalization`, JSON.stringify(personalization));
    
    // Notify parent
    if (onSave) {
      onSave(personalization);
    }
    
    setIsEditing(false);
  };

  const addTag = (tag: string) => {
    if (tag && !personalization.tags.includes(tag)) {
      setPersonalization(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setPersonalization(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const toggleNotification = (type: keyof VaultPersonalizationData['notifications']) => {
    setPersonalization(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: !prev.notifications[type]
      }
    }));
  };

  if (!isEditing) {
    return (
      <Card glass={true} className="border border-white/20">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-soul-red" />
              <h3 className="text-sm font-family-heading text-ghost-white">
                Personalization
              </h3>
            </div>
            {isOwner && (
              <Button
                variant="secondary"
                className="p-2"
                onClick={() => setIsEditing(true)}
              >
                <Edit3 className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Current Personalization Display */}
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-ghost-white mb-1">
                {personalization.displayName}
              </h4>
              {personalization.description && (
                <p className="text-xs text-silver-dust">
                  {personalization.description}
                </p>
              )}
            </div>

            {/* Category and Tags */}
            <div className="flex flex-wrap gap-2">
              {personalization.category && (
                <span className="px-2 py-1 text-xs rounded-full bg-soul-red/10 text-soul-red border border-soul-red/20">
                  {personalization.category}
                </span>
              )}
              {personalization.tags.map(tag => (
                <span key={tag} className="px-2 py-1 text-xs rounded-full bg-charcoal/50 text-silver-dust border border-white/10">
                  #{tag}
                </span>
              ))}
            </div>

            {/* Notes Preview */}
            {personalization.notes && (
              <div className="p-3 bg-charcoal/30 rounded-lg">
                <p className="text-xs text-silver-dust line-clamp-2">
                  {personalization.notes}
                </p>
              </div>
            )}

            {/* Quick Actions */}
            <div className="flex items-center gap-4 text-xs text-silver-dust">
              {personalization.watchlist && (
                <div className="flex items-center gap-1">
                  <Bookmark className="w-3 h-3 text-soul-red" />
                  <span>Watchlisted</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Bell className="w-3 h-3 text-soul-red" />
                <span>
                  {Object.values(personalization.notifications).filter(Boolean).length} notifications
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Edit Mode
  return (
    <Card glass={true} className="border border-white/20">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-soul-red" />
            <h3 className="text-sm font-family-heading text-ghost-white">
              Customize Vault
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              className="p-2"
              onClick={handleSave}
            >
              <Save className="w-4 h-4" />
            </Button>
            <Button
              variant="secondary"
              className="p-2"
              onClick={() => setIsEditing(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Edit Form */}
        <div className="space-y-4">
          {/* Display Name */}
          <div>
            <label className="text-xs text-silver-dust block mb-2">Display Name</label>
            <input
              type="text"
              value={personalization.displayName}
              onChange={(e) => setPersonalization(prev => ({ ...prev, displayName: e.target.value }))}
              className="w-full p-2 bg-charcoal border border-white/10 rounded text-sm text-ghost-white focus:border-soul-red/50 focus:outline-none"
              placeholder="Vault Name"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs text-silver-dust block mb-2">Description</label>
            <textarea
              value={personalization.description}
              onChange={(e) => setPersonalization(prev => ({ ...prev, description: e.target.value }))}
              className="w-full p-2 bg-charcoal border border-white/10 rounded text-sm text-ghost-white focus:border-soul-red/50 focus:outline-none resize-none"
              rows={3}
              placeholder="What's this vault for?"
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-xs text-silver-dust block mb-2">Category</label>
            <select
              value={personalization.category}
              onChange={(e) => setPersonalization(prev => ({ ...prev, category: e.target.value }))}
              className="w-full p-2 bg-charcoal border border-white/10 rounded text-sm text-ghost-white focus:border-soul-red/50 focus:outline-none"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Color Theme */}
          <div>
            <label className="text-xs text-silver-dust block mb-2">Color Theme</label>
            <div className="flex flex-wrap gap-2">
              {COLOR_THEMES.map(theme => (
                <button
                  key={theme.id}
                  onClick={() => setPersonalization(prev => ({ ...prev, colorTheme: theme.id }))}
                  className={`
                    p-2 rounded-lg border transition-all
                    ${personalization.colorTheme === theme.id 
                      ? 'border-soul-red bg-soul-red/10' 
                      : 'border-white/10 bg-charcoal/50 hover:border-white/20'
                    }
                  `}
                >
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.colors[0] }} />
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.colors[1] }} />
                    </div>
                    <span className="text-xs text-ghost-white">{theme.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="text-xs text-silver-dust block mb-2">Tags</label>
            <div className="space-y-2">
              {/* Current Tags */}
              <div className="flex flex-wrap gap-2">
                {personalization.tags.map(tag => (
                  <span 
                    key={tag} 
                    className="px-2 py-1 text-xs rounded-full bg-soul-red/10 text-soul-red border border-soul-red/20 flex items-center gap-1"
                  >
                    #{tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="hover:text-soul-red/80"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              
              {/* Add New Tag */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTag(newTag)}
                  className="flex-1 p-2 bg-charcoal border border-white/10 rounded text-sm text-ghost-white focus:border-soul-red/50 focus:outline-none"
                  placeholder="Add tag..."
                />
                <Button
                  variant="secondary"
                  onClick={() => addTag(newTag)}
                  disabled={!newTag}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Suggested Tags */}
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_TAGS.filter(tag => !personalization.tags.includes(tag)).slice(0, 4).map(tag => (
                  <button
                    key={tag}
                    onClick={() => addTag(tag)}
                    className="px-2 py-1 text-xs rounded-full bg-charcoal/50 text-silver-dust border border-white/10 hover:border-white/20 transition-colors"
                  >
                    +{tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div>
            <label className="text-xs text-silver-dust block mb-2">Notifications</label>
            <div className="space-y-2">
              {Object.entries(personalization.notifications).map(([key, value]) => (
                <label key={key} className="flex items-center justify-between">
                  <span className="text-sm text-ghost-white capitalize">
                    {key === 'activity' ? 'Activity Updates' :
                     key === 'deadline' ? 'Deadline Reminders' :
                     key === 'distribution' ? 'Distribution Events' :
                     'Value Changes'}
                  </span>
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={() => toggleNotification(key as keyof VaultPersonalizationData['notifications'])}
                    className="w-4 h-4 text-soul-red bg-charcoal border-white/10 rounded focus:ring-soul-red focus:ring-opacity-25"
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs text-silver-dust block mb-2">Private Notes</label>
            <textarea
              value={personalization.notes}
              onChange={(e) => setPersonalization(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full p-2 bg-charcoal border border-white/10 rounded text-sm text-ghost-white focus:border-soul-red/50 focus:outline-none resize-none"
              rows={4}
              placeholder="Add private notes about this vault..."
            />
          </div>

          {/* Watchlist */}
          <div>
            <label className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-soul-red" />
                <span className="text-sm text-ghost-white">Add to Watchlist</span>
              </div>
              <input
                type="checkbox"
                checked={personalization.watchlist}
                onChange={(e) => setPersonalization(prev => ({ ...prev, watchlist: e.target.checked }))}
                className="w-4 h-4 text-soul-red bg-charcoal border-white/10 rounded focus:ring-soul-red focus:ring-opacity-25"
              />
            </label>
          </div>
        </div>
      </div>
    </Card>
  );
}
