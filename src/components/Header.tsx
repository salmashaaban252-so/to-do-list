import { Sun, Moon, Flame, Star, Zap } from 'lucide-react';
import { Theme } from '../types';

interface HeaderProps {
  theme: Theme;
  toggleTheme: () => void;
  streak: number;
  totalPoints: number;
  onOpenDashboard: () => void;
  onOpenFocus: () => void;
}

export default function Header({ theme, toggleTheme, streak, totalPoints, onOpenDashboard, onOpenFocus }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-200 dark:shadow-violet-900/30">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-none">TaskFlow</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Smart To-Do</p>
          </div>
        </div>

        {/* Stats & Actions */}
        <div className="flex items-center gap-2">
          {/* Streak */}
          <button
            onClick={onOpenDashboard}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700/50 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
          >
            <Flame className={`w-4 h-4 ${streak > 0 ? 'text-orange-500' : 'text-gray-400'}`} />
            <span className={`text-sm font-bold ${streak > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-gray-400'}`}>
              {streak}
            </span>
          </button>

          {/* Points */}
          <button
            onClick={onOpenDashboard}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-700/50 hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors"
          >
            <Star className="w-4 h-4 text-violet-500" />
            <span className="text-sm font-bold text-violet-600 dark:text-violet-400">{totalPoints}</span>
          </button>

          {/* Focus Mode */}
          <button
            onClick={onOpenFocus}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
            title="Focus Mode"
          >
            <span className="text-sm">🎯</span>
            <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 hidden sm:inline">Focus</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 border border-gray-200 dark:border-gray-700"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <Moon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            ) : (
              <Sun className="w-4 h-4 text-yellow-500" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
