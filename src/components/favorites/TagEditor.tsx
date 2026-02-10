import { useState, useRef } from 'react';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { useI18n } from '../../lib/i18n';

interface Props {
  itemId: number;
  tags: string[];
  allUserTags: string[];
  onSetTags: (itemId: number, tags: string[]) => Promise<void>;
}

export default function TagEditor({ itemId, tags, allUserTags, onSetTags }: Props) {
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useI18n();

  const suggestions = allUserTags
    .filter((t) => t.toLowerCase().includes(input.toLowerCase()) && !tags.includes(t))
    .slice(0, 5);

  const addTag = async (tag: string) => {
    const trimmed = tag.trim();
    if (!trimmed || tags.includes(trimmed)) return;
    try {
      await onSetTags(itemId, [...tags, trimmed]);
      setInput('');
      setShowSuggestions(false);
    } catch (e) {
      console.error('Add tag failed:', e);
      toast.error(t.errors.tagAdd);
    }
  };

  const removeTag = async (tag: string) => {
    try {
      await onSetTags(
        itemId,
        tags.filter((t) => t !== tag),
      );
    } catch (e) {
      console.error('Remove tag failed:', e);
      toast.error(t.errors.tagRemove);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault();
      addTag(input);
    }
  };

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-1 items-center">
        {tags.map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className="gap-0.5 px-1.5 py-0.5 text-xs bg-indigo-100 text-indigo-700"
          >
            {tag}
            <button onClick={() => removeTag(tag)} className="hover:text-indigo-900">
              <X className="w-2.5 h-2.5" />
            </button>
          </Badge>
        ))}
        <div className="relative">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            onKeyDown={handleKeyDown}
            placeholder={tags.length === 0 ? t.tags.addTag : '+'}
            maxLength={100}
            className="w-20 px-1 py-0.5 text-xs border-none outline-none bg-transparent"
          />
          {showSuggestions && input && suggestions.length > 0 && (
            <div className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded shadow-lg z-10 min-w-[120px]">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onMouseDown={() => addTag(s)}
                  className="block w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-indigo-50"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
