import { useState } from 'react';
import { X, Plus, Calendar, Tag, AlertCircle, AlignLeft } from 'lucide-react';
import { Priority, Mood, Task } from '../types';

interface AddTaskModalProps {
  categories: string[];
  currentMood: Mood | null;
  onAdd: (task: Omit<Task, 'id' | 'createdAt' | 'completedAt' | 'completed' | 'points'>) => void;
  onAddCategory: (name: string) => void;
  onClose: () => void;
  editTask?: Task | null;
  onUpdate?: (id: string, updates: Partial<Task>) => void;
}

const priorityConfig = {
  high: { label: 'عالي 🔴', color: 'border-red-400 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' },
  medium: { label: 'متوسط 🟡', color: 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400' },
  low: { label: 'منخفض 🟢', color: 'border-green-400 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' },
};

export default function AddTaskModal({ categories, currentMood, onAdd, onAddCategory, onClose, editTask, onUpdate }: AddTaskModalProps) {
  const [title, setTitle] = useState(editTask?.title || '');
  const [notes, setNotes] = useState(editTask?.notes || '');
  const [priority, setPriority] = useState<Priority>(editTask?.priority || 'medium');
  const [category, setCategory] = useState(editTask?.category || categories[0] || '');
  const [dueDate, setDueDate] = useState(editTask?.dueDate || '');
  const [newCat, setNewCat] = useState('');
  const [showCatInput, setShowCatInput] = useState(false);

  const handleSubmit = () => {
    if (!title.trim()) return;
    if (editTask && onUpdate) {
      onUpdate(editTask.id, { title, notes, priority, category, dueDate: dueDate || null });
    } else {
      onAdd({ title: title.trim(), notes, priority, category, dueDate: dueDate || null, subTasks: [], mood: currentMood });
    }
    onClose();
  };

  const handleAddCategory = () => {
    if (newCat.trim()) {
      onAddCategory(newCat.trim());
      setCategory(newCat.trim());
      setNewCat('');
      setShowCatInput(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl w-full sm:max-w-lg border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {editTask ? '✏️ تعديل المهمة' : '✨ مهمة جديدة'}
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Title */}
        <div className="mb-4">
          <input
            autoFocus
            type="text"
            placeholder="اسم المهمة..."
            value={title}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 text-base font-medium"
          />
        </div>

        {/* Notes */}
        <div className="mb-4">
          <div className="relative">
            <AlignLeft className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
            <textarea
              placeholder="ملاحظات (اختياري)..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              className="w-full pr-10 pl-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm resize-none"
            />
          </div>
        </div>

        {/* Priority */}
        <div className="mb-4">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            <AlertCircle className="w-4 h-4" /> الأولوية
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(priorityConfig) as Priority[]).map(p => (
              <button
                key={p}
                onClick={() => setPriority(p)}
                className={`py-2 px-3 rounded-xl border-2 text-sm font-medium transition-all ${
                  priority === p ? priorityConfig[p].color + ' border-2' : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300'
                }`}
              >
                {priorityConfig[p].label}
              </button>
            ))}
          </div>
        </div>

        {/* Category */}
        <div className="mb-4">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            <Tag className="w-4 h-4" /> التصنيف
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
                  category === cat
                    ? 'bg-violet-500 text-white border-violet-500'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-violet-300'
                }`}
              >
                {cat}
              </button>
            ))}
            {showCatInput ? (
              <div className="flex items-center gap-1">
                <input
                  autoFocus
                  type="text"
                  value={newCat}
                  onChange={e => setNewCat(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
                  placeholder="اسم التصنيف"
                  className="w-28 px-2 py-1 rounded-lg border border-violet-300 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
                <button onClick={handleAddCategory} className="w-6 h-6 rounded-full bg-violet-500 text-white flex items-center justify-center text-xs">✓</button>
              </div>
            ) : (
              <button
                onClick={() => setShowCatInput(true)}
                className="px-3 py-1.5 rounded-full text-sm font-medium border border-dashed border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-violet-400 hover:text-violet-500 transition-colors flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> جديد
              </button>
            )}
          </div>
        </div>

        {/* Due Date */}
        <div className="mb-6">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            <Calendar className="w-4 h-4" /> تاريخ الاستحقاق
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
          />
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!title.trim()}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-bold text-base shadow-lg shadow-violet-200 dark:shadow-violet-900/30 hover:shadow-xl hover:scale-[1.01] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
        >
          {editTask ? '✅ حفظ التعديلات' : '🚀 إضافة المهمة'}
        </button>
      </div>
    </div>
  );
}
