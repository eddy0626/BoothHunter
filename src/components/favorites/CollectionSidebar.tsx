import { useState } from 'react';
import { FolderPlus, Trash2, Pencil, Check, X } from 'lucide-react';
import { clsx } from 'clsx';
import { useCollections } from '../../hooks/useCollections';
import { useI18n } from '../../lib/i18n';

const COLORS = [
  '#6366f1',
  '#ec4899',
  '#f59e0b',
  '#10b981',
  '#3b82f6',
  '#8b5cf6',
  '#ef4444',
  '#6b7280',
];

interface Props {
  selected: number | null;
  onSelect: (id: number | null) => void;
  totalCount: number;
}

export default function CollectionSidebar({ selected, onSelect, totalCount }: Props) {
  const { collections, create, rename, remove } = useCollections();
  const { t, language } = useI18n();
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(COLORS[0]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');

  const handleCreate = async () => {
    const name = newName.trim();
    if (!name) return;
    try {
      await create({ name, color: newColor });
      setNewName('');
      setIsCreating(false);
    } catch (e) {
      console.error('Create collection failed:', e);
    }
  };

  const handleRename = async (id: number) => {
    const name = editName.trim();
    if (!name) return;
    try {
      await rename({ id, name });
      setEditingId(null);
    } catch (e) {
      console.error('Rename collection failed:', e);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await remove(id);
      if (selected === id) onSelect(null);
    } catch (e) {
      console.error('Delete collection failed:', e);
    }
  };

  return (
    <div className="w-48 shrink-0">
      {/* All items */}
      <button
        onClick={() => onSelect(null)}
        className={clsx(
          'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
          selected === null
            ? 'bg-indigo-50 text-indigo-700 font-medium'
            : 'text-gray-700 hover:bg-gray-100',
        )}
      >
        {language === 'ko' ? `전체 (${totalCount})` : `All (${totalCount})`}
      </button>

      {/* Collection list */}
      <div className="mt-2 space-y-0.5">
        {collections.map((col) => (
          <div key={col.id} className="group flex items-center">
            {editingId === col.id ? (
              <div className="flex items-center gap-1 w-full px-1">
                <input
                  autoFocus
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  maxLength={200}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRename(col.id);
                    if (e.key === 'Escape') setEditingId(null);
                  }}
                  className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button onClick={() => handleRename(col.id)} className="p-0.5 text-green-600">
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setEditingId(null)} className="p-0.5 text-gray-400">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => onSelect(col.id)}
                  className={clsx(
                    'flex-1 text-left px-3 py-2 rounded-lg text-sm truncate transition-colors flex items-center gap-2',
                    selected === col.id
                      ? 'bg-indigo-50 text-indigo-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100',
                  )}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: col.color }}
                  />
                  <span className="truncate">{col.name}</span>
                  <span className="text-xs text-gray-400 ml-auto shrink-0">{col.item_count}</span>
                </button>
                <div className="hidden group-hover:flex items-center shrink-0">
                  <button
                    onClick={() => {
                      setEditingId(col.id);
                      setEditName(col.name);
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleDelete(col.id)}
                    className="p-1 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Create new */}
      {isCreating ? (
        <div className="mt-3 space-y-2">
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreate();
              if (e.key === 'Escape') setIsCreating(false);
            }}
            placeholder={t.collections.namePlaceholder}
            maxLength={200}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <div className="flex gap-1">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setNewColor(c)}
                className={clsx(
                  'w-5 h-5 rounded-full border-2',
                  newColor === c ? 'border-gray-800' : 'border-transparent',
                )}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <div className="flex gap-1">
            <button
              onClick={handleCreate}
              className="px-3 py-1 bg-indigo-600 text-white rounded text-xs hover:bg-indigo-700"
            >
              {language === 'ko' ? '생성' : 'Create'}
            </button>
            <button
              onClick={() => setIsCreating(false)}
              className="px-3 py-1 text-gray-600 rounded text-xs hover:bg-gray-100"
            >
              {language === 'ko' ? '취소' : 'Cancel'}
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsCreating(true)}
          className="mt-3 flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-500 hover:text-indigo-600 w-full"
        >
          <FolderPlus className="w-3.5 h-3.5" />
          {t.collections.create}
        </button>
      )}
    </div>
  );
}
