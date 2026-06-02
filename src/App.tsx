import { useState, useMemo, useEffect } from "react";
import { Search, Plus, Filter, Bot, Flame } from "lucide-react";
import { useAppStore } from "./store";
import { Task, Priority } from "./types";
import Header from "./components/Header";
import TaskCard from "./components/TaskCard";
import AddTaskModal from "./components/AddTaskModal";
import FocusMode from "./components/FocusMode";
import Dashboard from "./components/Dashboard";
import AICompanion from "./components/AICompanion";
import MoodChecker from "./components/MoodChecker";
import RewardToast from "./components/RewardToast";

type SortBy = "createdAt" | "priority" | "dueDate" | "title";
type FilterStatus = "all" | "active" | "completed";

const priorityOrder: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

// Smart Reminder component
function SmartReminder({ tasks }: { tasks: Task[] }) {
  const [dismissed, setDismissed] = useState<string[]>([]);

  const overdueTasks = tasks.filter((t) => {
    if (t.completed || !t.dueDate || dismissed.includes(t.id)) return false;
    const due = new Date(t.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return due <= today;
  });

  if (overdueTasks.length === 0) return null;

  return (
    <div className="mx-4 mb-4 p-3 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-3">
      <span className="text-lg flex-shrink-0">⏰</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-red-700 dark:text-red-400">
          {overdueTasks.length} مهمة متأخرة!
        </p>
        <p className="text-xs text-red-600 dark:text-red-400/80 truncate">
          {overdueTasks.map((t) => t.title).join(" • ")}
        </p>
      </div>
      <button
        onClick={() =>
          setDismissed((d) => [...d, ...overdueTasks.map((t) => t.id)])
        }
        className="flex-shrink-0 text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors text-xs"
      >
        ✕
      </button>
    </div>
  );
}

// Focus overlay
function FocusBlocker({
  active,
  blockedSites,
}: {
  active: boolean;
  blockedSites: string[];
}) {
  useEffect(() => {
    if (!active || blockedSites.length === 0) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLAnchorElement;
      if (target.tagName === "A" && target.href) {
        const url = new URL(target.href);
        if (blockedSites.some((s) => url.hostname.includes(s))) {
          e.preventDefault();
          alert("🚫 هذا الموقع محجوب أثناء وضع التركيز! خلص تايمرك الأول.");
        }
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [active, blockedSites]);

  return null;
}

export default function App() {
  const store = useAppStore();
  const { state, rewards, newReward, clearNewReward } = store;

  const [showAddModal, setShowAddModal] = useState(false);
  const [showFocus, setShowFocus] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [showMood, setShowMood] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterPriority, setFilterPriority] = useState<Priority | "all">("all");
  const [sortBy, setSortBy] = useState<SortBy>("createdAt");

  // Show mood check on first load of the day
  useEffect(() => {
    const today = new Date().toDateString();
    const lastMoodCheck = localStorage.getItem("lastMoodCheck");
    if (lastMoodCheck !== today && !state.currentMood) {
      const timer = setTimeout(() => setShowMood(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleMoodSet = (mood: Parameters<typeof store.setMood>[0]) => {
    store.setMood(mood);
    localStorage.setItem("lastMoodCheck", new Date().toDateString());
    setShowMood(false);
  };

  const filteredTasks = useMemo(() => {
    let tasks = state.tasks;

    if (search) {
      const q = search.toLowerCase();
      tasks = tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.notes.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q),
      );
    }

    if (filterStatus === "active") tasks = tasks.filter((t) => !t.completed);
    if (filterStatus === "completed") tasks = tasks.filter((t) => t.completed);
    if (filterCategory !== "all")
      tasks = tasks.filter((t) => t.category === filterCategory);
    if (filterPriority !== "all")
      tasks = tasks.filter((t) => t.priority === filterPriority);

    return [...tasks].sort((a, b) => {
      if (sortBy === "priority")
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      if (sortBy === "dueDate") {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      }
      if (sortBy === "title") return a.title.localeCompare(b.title);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [
    state.tasks,
    search,
    filterStatus,
    filterCategory,
    filterPriority,
    sortBy,
  ]);

  const activeCount = state.tasks.filter((t) => !t.completed).length;
  const completedCount = state.tasks.filter((t) => t.completed).length;
  const moodEmoji = state.currentMood
    ? {
        happy: "😊",
        motivated: "🔥",
        neutral: "😐",
        tired: "😴",
        stressed: "😤",
      }[state.currentMood]
    : "😶";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <FocusBlocker
        active={state.focusMode.active}
        blockedSites={state.focusMode.blockedSites}
      />

      {/* Focus Mode Active Banner */}
      {state.focusMode.active && (
        <div
          className="fixed top-0 left-0 right-0 z-[60] bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-center py-1.5 text-sm font-semibold cursor-pointer hover:from-violet-700 hover:to-indigo-700 transition-colors"
          onClick={() => setShowFocus(true)}
        >
          🎯 وضع التركيز نشط •{" "}
          {String(Math.floor(state.focusMode.timeLeft / 60)).padStart(2, "0")}:
          {String(state.focusMode.timeLeft % 60).padStart(2, "0")} متبقي • اضغط
          للتفاصيل
        </div>
      )}

      <div className={state.focusMode.active ? "pt-8" : ""}>
        <Header
          theme={state.theme}
          toggleTheme={store.toggleTheme}
          streak={state.streak}
          totalPoints={state.totalPoints}
          onOpenDashboard={() => setShowDashboard(true)}
          onOpenFocus={() => setShowFocus(true)}
        />

        <main className="max-w-5xl mx-auto px-4 py-6">
          {/* Welcome / Streak Banner */}
          {state.streak >= 3 && (
            <div className="mb-4 p-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white flex items-center gap-3 shadow-lg shadow-orange-200 dark:shadow-orange-900/30">
              <Flame className="w-6 h-6 flex-shrink-0" />
              <div>
                <p className="font-bold text-sm">
                  🔥 Streak رهيب! {state.streak} يوم متواصل!
                </p>
                <p className="text-xs text-orange-100">
                  محافظ على الاستمرارية دي!
                </p>
              </div>
            </div>
          )}

          {/* Smart Reminders */}
          <SmartReminder tasks={state.tasks} />

          {/* Search & Controls */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-4 mb-4">
            {/* Search Bar */}
            <div className="relative mb-3">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="ابحث في مهامك..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
              />
            </div>

            {/* Filter Row */}
            <div className="flex flex-wrap gap-2">
              {/* Status Filter */}
              <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                {(["all", "active", "completed"] as FilterStatus[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilterStatus(s)}
                    className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                      filterStatus === s
                        ? "bg-violet-500 text-white"
                        : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                  >
                    {s === "all"
                      ? `الكل (${state.tasks.length})`
                      : s === "active"
                        ? `نشطة (${activeCount})`
                        : `مكتملة (${completedCount})`}
                  </button>
                ))}
              </div>

              {/* Category Filter */}
              <select
                aria-label="اختر الفئة"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="all">📁 الكل</option>
                {state.categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              {/* Priority Filter */}
              <select
                aria-label="اختر الأولوية"
                value={filterPriority}
                onChange={(e) =>
                  setFilterPriority(e.target.value as Priority | "all")
                }
                className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="all">🎯 الأولوية</option>
                <option value="high">🔴 عالي</option>
                <option value="medium">🟡 متوسط</option>
                <option value="low">🟢 منخفض</option>
              </select>

              {/* Sort */}
              <select
                aria-label="ترتيب حسب"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500 flex items-center gap-1"
              >
                <option value="createdAt">⏱ الأحدث</option>
                <option value="priority">🎯 الأولوية</option>
                <option value="dueDate">📅 الاستحقاق</option>
                <option value="title">🔤 الاسم</option>
              </select>
            </div>
          </div>

          {/* Task List */}
          <div className="space-y-3">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">
                  {search ? "🔍" : state.tasks.length === 0 ? "✨" : "🎉"}
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">
                  {search
                    ? "مفيش نتايج!"
                    : state.tasks.length === 0
                      ? "ابدأ بإضافة أول مهمة!"
                      : "كل المهام خلصت! عظيم!"}
                </p>
                {!search && state.tasks.length === 0 && (
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="mt-4 px-6 py-2.5 rounded-xl bg-violet-500 text-white font-medium hover:bg-violet-600 transition-colors"
                  >
                    + أضف مهمتك الأولى
                  </button>
                )}
              </div>
            ) : (
              filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggle={store.toggleTask}
                  onDelete={store.deleteTask}
                  onEdit={(t) => {
                    setEditTask(t);
                    setShowAddModal(true);
                  }}
                  onAddSubTask={store.addSubTask}
                  onToggleSubTask={store.toggleSubTask}
                  onDeleteSubTask={store.deleteSubTask}
                />
              ))
            )}
          </div>
        </main>
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 items-end z-40">
        {/* Mood Button */}
        <button
          onClick={() => setShowMood(true)}
          className="w-11 h-11 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl flex items-center justify-center text-xl transition-all hover:scale-110"
          title="تغيير المزاج"
        >
          {moodEmoji}
        </button>

        {/* AI Button */}
        <button
          onClick={() => setShowAI(true)}
          className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg hover:shadow-xl shadow-indigo-200 dark:shadow-indigo-900/30 flex items-center justify-center transition-all hover:scale-110"
          title="المساعد الذكي"
        >
          <Bot className="w-5 h-5 text-white" />
        </button>

        {/* Dashboard Button */}
        <button
          onClick={() => setShowDashboard(true)}
          className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg hover:shadow-xl shadow-emerald-200 dark:shadow-emerald-900/30 flex items-center justify-center transition-all hover:scale-110"
          title="لوحة التقدم"
        >
          <Filter className="w-5 h-5 text-white" />
        </button>

        {/* Add Task Button */}
        <button
          onClick={() => {
            setEditTask(null);
            setShowAddModal(true);
          }}
          className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-xl hover:shadow-2xl shadow-violet-200 dark:shadow-violet-900/40 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
          title="إضافة مهمة"
        >
          <Plus className="w-7 h-7 text-white" />
        </button>
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddTaskModal
          categories={state.categories}
          currentMood={state.currentMood}
          onAdd={store.addTask}
          onAddCategory={store.addCategory}
          onClose={() => {
            setShowAddModal(false);
            setEditTask(null);
          }}
          editTask={editTask}
          onUpdate={store.updateTask}
        />
      )}

      {showFocus && (
        <FocusMode
          active={state.focusMode.active}
          duration={state.focusMode.duration}
          timeLeft={state.focusMode.timeLeft}
          taskId={state.focusMode.taskId}
          blockedSites={state.focusMode.blockedSites}
          tasks={state.tasks}
          onStart={store.startFocusMode}
          onStop={store.stopFocusMode}
          onTick={store.tickFocusMode}
          onToggleSite={store.toggleBlockedSite}
          onClose={() => setShowFocus(false)}
        />
      )}

      {showDashboard && (
        <Dashboard
          tasks={state.tasks}
          streak={state.streak}
          totalPoints={state.totalPoints}
          weekStats={state.weekStats}
          rewards={rewards}
          onClose={() => setShowDashboard(false)}
        />
      )}

      {showAI && (
        <AICompanion
          tasks={state.tasks}
          streak={state.streak}
          totalPoints={state.totalPoints}
          currentMood={state.currentMood}
          onClose={() => setShowAI(false)}
        />
      )}

      {showMood && (
        <MoodChecker
          currentMood={state.currentMood}
          onSetMood={handleMoodSet}
          onClose={() => setShowMood(false)}
        />
      )}

      {/* Reward Toast */}
      <RewardToast reward={newReward} onClose={clearNewReward} />
    </div>
  );
}
