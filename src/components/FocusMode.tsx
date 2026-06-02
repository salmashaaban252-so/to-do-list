import { useState, useEffect } from 'react';
import { X, Play, Square, Plus, Minus, AlertTriangle } from 'lucide-react';
import { Task } from '../types';

interface FocusModeProps {
  active: boolean;
  duration: number;
  timeLeft: number;
  taskId: string | null;
  blockedSites: string[];
  tasks: Task[];
  onStart: (duration: number, taskId: string | null) => void;
  onStop: () => void;
  onTick: () => void;
  onToggleSite: (site: string) => void;
  onClose: () => void;
}

const DEFAULT_SITES = ['facebook.com', 'twitter.com', 'instagram.com', 'youtube.com', 'tiktok.com', 'reddit.com'];

export default function FocusMode({ active, duration, timeLeft, taskId, blockedSites, tasks, onStart, onStop, onTick, onToggleSite, onClose }: FocusModeProps) {
  const [localDuration, setLocalDuration] = useState(duration);
  const [selectedTask, setSelectedTask] = useState(taskId || '');
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (!active) return;
    const interval = setInterval(onTick, 1000);
    return () => clearInterval(interval);
  }, [active, onTick]);

  useEffect(() => {
    if (active && timeLeft === 0) {
      setCompleted(true);
      // Browser notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('🎯 TaskFlow', { body: 'انتهى وقت الـ Focus! عظيم!' });
      }
    }
  }, [active, timeLeft]);

  const handleStart = () => {
    setCompleted(false);
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    onStart(localDuration, selectedTask || null);
  };

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const progress = active ? ((duration * 60 - timeLeft) / (duration * 60)) * 100 : 0;
  const pendingTasks = tasks.filter(t => !t.completed);

  const circumference = 2 * Math.PI * 54;
  const dashOffset = circumference - (progress / 100) * circumference;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">🎯 Focus Mode</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Timer Circle */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative w-36 h-36">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth="8" className="text-gray-100 dark:text-gray-800" />
              <circle
                cx="60" cy="60" r="54" fill="none"
                stroke="url(#focusGradient)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                className="transition-all duration-1000"
              />
              <defs>
                <linearGradient id="focusGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {active ? (
                <>
                  <span className="text-3xl font-bold text-gray-900 dark:text-white font-mono">
                    {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
                  </span>
                  <span className="text-xs text-gray-400 mt-0.5">متبقي</span>
                </>
              ) : (
                <span className="text-2xl font-bold text-gray-400">🎯</span>
              )}
            </div>
          </div>

          {completed && !active && (
            <div className="mt-3 text-center animate-bounce">
              <p className="text-2xl">🎉</p>
              <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">أنجزت! برافو عليك!</p>
            </div>
          )}
        </div>

        {!active ? (
          <>
            {/* Duration Selector */}
            <div className="mb-4">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">⏱ مدة التركيز (دقائق)</label>
              <div className="flex items-center gap-3 justify-center">
                <button onClick={() => setLocalDuration(d => Math.max(5, d - 5))} className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                  <Minus className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </button>
                <div className="flex gap-2">
                  {[15, 25, 45, 60].map(d => (
                    <button
                      key={d}
                      onClick={() => setLocalDuration(d)}
                      className={`px-3 py-1.5 rounded-xl text-sm font-bold transition-all ${
                        localDuration === d
                          ? 'bg-violet-500 text-white shadow-lg shadow-violet-200 dark:shadow-violet-900/30'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
                <button onClick={() => setLocalDuration(d => Math.min(120, d + 5))} className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                  <Plus className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
              <p className="text-center text-lg font-bold text-violet-600 dark:text-violet-400 mt-1">{localDuration} دقيقة</p>
            </div>

            {/* Task Selector */}
            {pendingTasks.length > 0 && (
              <div className="mb-4">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">📋 المهمة (اختياري)</label>
                <select
                  value={selectedTask}
                  onChange={e => setSelectedTask(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="">-- اختر مهمة --</option>
                  {pendingTasks.map(t => (
                    <option key={t.id} value={t.id}>{t.title}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Blocked Sites */}
            <div className="mb-5">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                مواقع محظورة أثناء التركيز
              </label>
              <div className="flex flex-wrap gap-2">
                {DEFAULT_SITES.map(site => (
                  <button
                    key={site}
                    onClick={() => onToggleSite(site)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all border ${
                      blockedSites.includes(site)
                        ? 'bg-red-100 dark:bg-red-900/20 border-red-300 dark:border-red-700 text-red-600 dark:text-red-400'
                        : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {blockedSites.includes(site) ? '🚫' : '✓'} {site}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                ⚠️ لو حاولت تفتح الموقع ده أثناء التركيز هيجيلك تحذير
              </p>
            </div>

            <button
              onClick={handleStart}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-violet-200 dark:shadow-violet-900/30 hover:shadow-xl hover:scale-[1.01] transition-all"
            >
              <Play className="w-5 h-5" /> ابدأ التركيز 🎯
            </button>
          </>
        ) : (
          <div className="text-center">
            {selectedTask && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                🎯 {pendingTasks.find(t => t.id === selectedTask)?.title || 'مهمة قيد التنفيذ'}
              </p>
            )}
            <p className="text-sm font-medium text-violet-600 dark:text-violet-400 mb-4">
              🔥 خليك مركز! إنت بتعمل حاجة عظيمة!
            </p>
            {blockedSites.length > 0 && (
              <p className="text-xs text-gray-400 mb-4">
                🚫 محجوب: {blockedSites.join(', ')}
              </p>
            )}
            <button
              onClick={onStop}
              className="w-full py-3 rounded-2xl bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold flex items-center justify-center gap-2 hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors border border-red-200 dark:border-red-800"
            >
              <Square className="w-5 h-5" /> إيقاف التركيز
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
