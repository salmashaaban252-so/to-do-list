import { X, Flame, Star, Trophy, TrendingUp, Calendar, Award } from 'lucide-react';
import { DayStats, Task } from '../types';
import { format } from 'date-fns';

interface DashboardProps {
  tasks: Task[];
  streak: number;
  totalPoints: number;
  weekStats: DayStats[];
  rewards: Array<{ id: string; name: string; description: string; pointsRequired: number; unlocked: boolean; icon: string; themeColor?: string }>;
  onClose: () => void;
}

const DAY_NAMES = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];

export default function Dashboard({ tasks, streak, totalPoints, weekStats, rewards, onClose }: DashboardProps) {
  const completedTasks = tasks.filter(t => t.completed);
  const pendingTasks = tasks.filter(t => !t.completed);
  const completionRate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

  // Best day
  const bestDay = weekStats.reduce((best, d) => (d.completed > (best?.completed || 0) ? d : best), weekStats[0]);
  const maxCompleted = Math.max(...weekStats.map(d => d.completed), 1);

  // Next reward
  const nextReward = rewards.filter(r => !r.unlocked).sort((a, b) => a.pointsRequired - b.pointsRequired)[0];
  const nextRewardProgress = nextReward ? Math.min(100, (totalPoints / nextReward.pointsRequired) * 100) : 100;

  // Priority breakdown
  const highCount = tasks.filter(t => t.priority === 'high').length;
  const medCount = tasks.filter(t => t.priority === 'medium').length;
  const lowCount = tasks.filter(t => t.priority === 'low').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-2xl border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between rounded-t-3xl">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-violet-500" /> لوحة التقدم
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Top Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-900/10 rounded-2xl p-4 border border-orange-200 dark:border-orange-800">
              <Flame className="w-6 h-6 text-orange-500 mb-2" />
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{streak}</p>
              <p className="text-xs text-orange-500/80 dark:text-orange-400/70">يوم streak</p>
            </div>
            <div className="bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-900/20 dark:to-violet-900/10 rounded-2xl p-4 border border-violet-200 dark:border-violet-800">
              <Star className="w-6 h-6 text-violet-500 mb-2" />
              <p className="text-2xl font-bold text-violet-600 dark:text-violet-400">{totalPoints}</p>
              <p className="text-xs text-violet-500/80 dark:text-violet-400/70">نقطة</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-900/10 rounded-2xl p-4 border border-emerald-200 dark:border-emerald-800">
              <Trophy className="w-6 h-6 text-emerald-500 mb-2" />
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{completedTasks.length}</p>
              <p className="text-xs text-emerald-500/80 dark:text-emerald-400/70">مكتملة</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 rounded-2xl p-4 border border-blue-200 dark:border-blue-800">
              <Calendar className="w-6 h-6 text-blue-500 mb-2" />
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{completionRate}%</p>
              <p className="text-xs text-blue-500/80 dark:text-blue-400/70">معدل الإنجاز</p>
            </div>
          </div>

          {/* Completion Rate Bar */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">الإجمالي</p>
              <p className="text-sm text-gray-500">{completedTasks.length} / {tasks.length}</p>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-violet-500 to-indigo-500 h-3 rounded-full transition-all duration-700"
                style={{ width: `${completionRate}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-400">
              <span>🔴 عالي: {highCount}</span>
              <span>🟡 متوسط: {medCount}</span>
              <span>🟢 منخفض: {lowCount}</span>
              <span>⏳ معلق: {pendingTasks.length}</span>
            </div>
          </div>

          {/* Weekly Chart */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
              📊 أداء الأسبوع
            </p>
            <div className="flex items-end justify-between gap-1 h-24">
              {weekStats.map((ds, i) => {
                const barHeight = ds.completed > 0 ? (ds.completed / maxCompleted) * 100 : 0;
                const isToday = ds.date === format(new Date(), 'yyyy-MM-dd');
                return (
                  <div key={ds.date} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex flex-col items-center justify-end" style={{ height: '80px' }}>
                      {ds.completed > 0 && (
                        <span className="text-xs font-bold text-violet-600 dark:text-violet-400 mb-1">{ds.completed}</span>
                      )}
                      <div
                        className={`w-full rounded-t-lg transition-all duration-700 ${
                          isToday
                            ? 'bg-gradient-to-t from-violet-500 to-indigo-400'
                            : 'bg-gradient-to-t from-violet-200 to-violet-100 dark:from-violet-800 dark:to-violet-700'
                        }`}
                        style={{ height: `${Math.max(barHeight, ds.total > 0 ? 8 : 4)}%` }}
                      />
                    </div>
                    <span className={`text-xs ${isToday ? 'font-bold text-violet-600 dark:text-violet-400' : 'text-gray-400'}`}>
                      {DAY_NAMES[i]?.slice(0, 2)}
                    </span>
                  </div>
                );
              })}
            </div>
            {bestDay && bestDay.completed > 0 && (
              <p className="text-xs text-center text-gray-500 mt-2">
                ⭐ أفضل يوم: {DAY_NAMES[weekStats.indexOf(bestDay)]} ({bestDay.completed} مهام)
              </p>
            )}
          </div>

          {/* Next Reward */}
          {nextReward && (
            <div className="bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-900/20 dark:to-indigo-900/20 rounded-2xl p-4 border border-violet-200 dark:border-violet-800">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{nextReward.icon}</span>
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{nextReward.name}</p>
                    <p className="text-xs text-gray-500">{nextReward.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">{totalPoints} / {nextReward.pointsRequired}</p>
                  <p className="text-xs font-bold text-violet-600 dark:text-violet-400">{Math.round(nextRewardProgress)}%</p>
                </div>
              </div>
              <div className="w-full bg-violet-200 dark:bg-violet-800 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-violet-500 to-indigo-500 h-2 rounded-full transition-all duration-700"
                  style={{ width: `${nextRewardProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Rewards */}
          <div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" /> المكافآت
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {rewards.map(r => (
                <div
                  key={r.id}
                  className={`rounded-2xl p-3 border transition-all ${
                    r.unlocked
                      ? 'border-amber-300 dark:border-amber-700 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20'
                      : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 opacity-60'
                  }`}
                >
                  <div className="text-2xl mb-1">{r.unlocked ? r.icon : '🔒'}</div>
                  <p className="text-xs font-bold text-gray-900 dark:text-white">{r.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{r.pointsRequired} ⭐</p>
                  {r.unlocked && (
                    <span className="inline-block mt-1 text-xs text-amber-600 dark:text-amber-400 font-medium">✅ مفتوح</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
