import { useState, useEffect, useCallback } from 'react';
import { AppState, Task, SubTask, Mood, DayStats } from './types';
import { format, isToday, isYesterday, parseISO, startOfWeek, addDays } from 'date-fns';

const REWARDS = [
  { id: 'r1', name: 'Dark Warrior', description: 'فتحت ثيم الـ Dark Warrior', pointsRequired: 50, unlocked: false, icon: '⚔️', themeColor: '#6366f1' },
  { id: 'r2', name: 'Ocean Vibes', description: 'فتحت ثيم Ocean Vibes', pointsRequired: 100, unlocked: false, icon: '🌊', themeColor: '#0ea5e9' },
  { id: 'r3', name: 'Forest Spirit', description: 'فتحت ثيم Forest Spirit', pointsRequired: 200, unlocked: false, icon: '🌿', themeColor: '#10b981' },
  { id: 'r4', name: 'Sunset Glow', description: 'فتحت ثيم Sunset Glow', pointsRequired: 350, unlocked: false, icon: '🌅', themeColor: '#f97316' },
  { id: 'r5', name: 'Galaxy Master', description: 'فتحت ثيم Galaxy Master', pointsRequired: 500, unlocked: false, icon: '🌌', themeColor: '#8b5cf6' },
];

const DEFAULT_CATEGORIES = ['شغل', 'شخصي', 'صحة', 'تعلم', 'عائلة'];

function getDefaultState(): AppState {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 6 });
  const weekStats: DayStats[] = Array.from({ length: 7 }, (_, i) => ({
    date: format(addDays(weekStart, i), 'yyyy-MM-dd'),
    completed: 0,
    total: 0,
  }));

  return {
    tasks: [],
    categories: DEFAULT_CATEGORIES,
    streak: 0,
    lastCompletedDate: null,
    totalPoints: 0,
    unlockedRewards: [],
    weekStats,
    currentMood: null,
    theme: 'light',
    focusMode: {
      active: false,
      duration: 25,
      timeLeft: 25 * 60,
      taskId: null,
      blockedSites: ['facebook.com', 'twitter.com', 'instagram.com', 'youtube.com', 'tiktok.com'],
    },
  };
}

function loadState(): AppState {
  try {
    const saved = localStorage.getItem('taskflow_state');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Merge with defaults to handle new fields
      return { ...getDefaultState(), ...parsed };
    }
  } catch (e) {
    console.error('Failed to load state', e);
  }
  return getDefaultState();
}

function saveState(state: AppState) {
  try {
    localStorage.setItem('taskflow_state', JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state', e);
  }
}

export function useAppStore() {
  const [state, setState] = useState<AppState>(loadState);
  const [rewards] = useState(REWARDS);
  const [newReward, setNewReward] = useState<typeof REWARDS[0] | null>(null);

  useEffect(() => {
    saveState(state);
  }, [state]);

  // Apply theme to document
  useEffect(() => {
    if (state.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.theme]);

  const toggleTheme = useCallback(() => {
    setState(s => ({ ...s, theme: s.theme === 'light' ? 'dark' : 'light' }));
  }, []);

  const updateStreak = useCallback((state: AppState): AppState => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const todayTasks = state.tasks.filter(t => t.dueDate === today || (!t.dueDate && isToday(parseISO(t.createdAt))));
    const allDone = todayTasks.length > 0 && todayTasks.every(t => t.completed);

    if (!allDone) return state;

    const last = state.lastCompletedDate;
    let newStreak = state.streak;

    if (!last) {
      newStreak = 1;
    } else if (isYesterday(parseISO(last))) {
      newStreak = state.streak + 1;
    } else if (last === today) {
      newStreak = state.streak;
    } else {
      newStreak = 1;
    }

    return { ...state, streak: newStreak, lastCompletedDate: today };
  }, []);

  const checkRewards = useCallback((totalPoints: number, currentUnlocked: string[]) => {
    const newlyUnlocked = REWARDS.filter(
      r => totalPoints >= r.pointsRequired && !currentUnlocked.includes(r.id)
    );
    if (newlyUnlocked.length > 0) {
      setNewReward(newlyUnlocked[newlyUnlocked.length - 1]);
      return [...currentUnlocked, ...newlyUnlocked.map(r => r.id)];
    }
    return currentUnlocked;
  }, []);

  const addTask = useCallback((task: Omit<Task, 'id' | 'createdAt' | 'completedAt' | 'completed' | 'points'>) => {
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      completedAt: null,
      completed: false,
      points: task.priority === 'high' ? 15 : task.priority === 'medium' ? 10 : 5,
    };
    setState(s => {
      const updated = { ...s, tasks: [newTask, ...s.tasks] };
      return updateStreak(updated);
    });
  }, [updateStreak]);

  const toggleTask = useCallback((id: string) => {
    setState(s => {
      const task = s.tasks.find(t => t.id === id);
      if (!task) return s;
      const wasCompleted = task.completed;
      const newCompleted = !wasCompleted;
      const pointsDelta = newCompleted ? task.points : -task.points;
      const newPoints = Math.max(0, s.totalPoints + pointsDelta);
      const newTasks = s.tasks.map(t =>
        t.id === id
          ? { ...t, completed: newCompleted, completedAt: newCompleted ? new Date().toISOString() : null }
          : t
      );

      // Update week stats
      const today = format(new Date(), 'yyyy-MM-dd');
      const newWeekStats = s.weekStats.map(ds => {
        if (ds.date === today) {
          return {
            ...ds,
            completed: Math.max(0, ds.completed + (newCompleted ? 1 : -1)),
            total: ds.total,
          };
        }
        return ds;
      });

      const newUnlocked = newCompleted ? checkRewards(newPoints, s.unlockedRewards) : s.unlockedRewards;

      const newState = {
        ...s,
        tasks: newTasks,
        totalPoints: newPoints,
        unlockedRewards: newUnlocked,
        weekStats: newWeekStats,
      };
      return updateStreak(newState);
    });
  }, [updateStreak, checkRewards]);

  const deleteTask = useCallback((id: string) => {
    setState(s => ({ ...s, tasks: s.tasks.filter(t => t.id !== id) }));
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setState(s => ({
      ...s,
      tasks: s.tasks.map(t => t.id === id ? { ...t, ...updates } : t),
    }));
  }, []);

  const addSubTask = useCallback((taskId: string, text: string) => {
    const sub: SubTask = { id: crypto.randomUUID(), text, completed: false };
    setState(s => ({
      ...s,
      tasks: s.tasks.map(t => t.id === taskId ? { ...t, subTasks: [...t.subTasks, sub] } : t),
    }));
  }, []);

  const toggleSubTask = useCallback((taskId: string, subId: string) => {
    setState(s => ({
      ...s,
      tasks: s.tasks.map(t =>
        t.id === taskId
          ? { ...t, subTasks: t.subTasks.map(st => st.id === subId ? { ...st, completed: !st.completed } : st) }
          : t
      ),
    }));
  }, []);

  const deleteSubTask = useCallback((taskId: string, subId: string) => {
    setState(s => ({
      ...s,
      tasks: s.tasks.map(t =>
        t.id === taskId ? { ...t, subTasks: t.subTasks.filter(st => st.id !== subId) } : t
      ),
    }));
  }, []);

  const addCategory = useCallback((name: string) => {
    setState(s => ({
      ...s,
      categories: s.categories.includes(name) ? s.categories : [...s.categories, name],
    }));
  }, []);

  const setMood = useCallback((mood: Mood) => {
    setState(s => ({ ...s, currentMood: mood }));
  }, []);

  const startFocusMode = useCallback((duration: number, taskId: string | null) => {
    setState(s => ({
      ...s,
      focusMode: { ...s.focusMode, active: true, duration, timeLeft: duration * 60, taskId },
    }));
  }, []);

  const stopFocusMode = useCallback(() => {
    setState(s => ({
      ...s,
      focusMode: { ...s.focusMode, active: false, timeLeft: s.focusMode.duration * 60, taskId: null },
    }));
  }, []);

  const tickFocusMode = useCallback(() => {
    setState(s => {
      if (!s.focusMode.active || s.focusMode.timeLeft <= 0) return s;
      const newTime = s.focusMode.timeLeft - 1;
      if (newTime <= 0) {
        return { ...s, focusMode: { ...s.focusMode, active: false, timeLeft: 0 } };
      }
      return { ...s, focusMode: { ...s.focusMode, timeLeft: newTime } };
    });
  }, []);

  const toggleBlockedSite = useCallback((site: string) => {
    setState(s => {
      const blocked = s.focusMode.blockedSites;
      const newBlocked = blocked.includes(site) ? blocked.filter(b => b !== site) : [...blocked, site];
      return { ...s, focusMode: { ...s.focusMode, blockedSites: newBlocked } };
    });
  }, []);

  const clearNewReward = useCallback(() => setNewReward(null), []);

  const getComputedRewards = () =>
    rewards.map(r => ({ ...r, unlocked: state.unlockedRewards.includes(r.id) }));

  // Sync weekStats totals with tasks
  useEffect(() => {
    setState(s => {
      const newWeekStats = s.weekStats.map(ds => {
        const dayTasks = s.tasks.filter(t => {
          const taskDate = t.dueDate || format(parseISO(t.createdAt), 'yyyy-MM-dd');
          return taskDate === ds.date;
        });
        return { ...ds, total: dayTasks.length, completed: dayTasks.filter(t => t.completed).length };
      });
      return { ...s, weekStats: newWeekStats };
    });
  }, [state.tasks.length]);

  return {
    state,
    rewards: getComputedRewards(),
    newReward,
    clearNewReward,
    toggleTheme,
    addTask,
    toggleTask,
    deleteTask,
    updateTask,
    addSubTask,
    toggleSubTask,
    deleteSubTask,
    addCategory,
    setMood,
    startFocusMode,
    stopFocusMode,
    tickFocusMode,
    toggleBlockedSite,
  };
}
