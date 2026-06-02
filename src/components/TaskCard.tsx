import { useState } from "react";
import { Task } from "../types";
import {
  Trash2,
  Edit3,
  ChevronDown,
  ChevronUp,
  Plus,
  X,
  Clock,
  Tag,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { format, isToday, isTomorrow, isPast, parseISO } from "date-fns";

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  onAddSubTask: (taskId: string, text: string) => void;
  onToggleSubTask: (taskId: string, subId: string) => void;
  onDeleteSubTask: (taskId: string, subId: string) => void;
}

const priorityStyles = {
  high: "border-red-300 dark:border-red-800",
  medium: "border-yellow-300 dark:border-yellow-800",
  low: "border-green-300 dark:border-green-800",
};

const priorityDot = {
  high: "bg-red-500",
  medium: "bg-yellow-500",
  low: "bg-green-500",
};

const priorityLabel = {
  high: "عالي",
  medium: "متوسط",
  low: "منخفض",
};

function formatDueDate(dateStr: string) {
  const d = parseISO(dateStr);
  if (isToday(d)) return { label: "اليوم", urgent: true };
  if (isTomorrow(d)) return { label: "بكرة", urgent: false };
  if (isPast(d))
    return { label: `${format(d, "dd/MM")} (متأخر!)`, urgent: true };
  return { label: format(d, "dd/MM/yyyy"), urgent: false };
}

export default function TaskCard({
  task,
  onToggle,
  onDelete,
  onEdit,
  onAddSubTask,
  onToggleSubTask,
  onDeleteSubTask,
}: TaskCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [newSub, setNewSub] = useState("");
  const [showSubInput, setShowSubInput] = useState(false);

  const completedSubs = task.subTasks.filter((s) => s.completed).length;
  const subProgress =
    task.subTasks.length > 0 ? (completedSubs / task.subTasks.length) * 100 : 0;

  const handleAddSub = () => {
    if (newSub.trim()) {
      onAddSubTask(task.id, newSub.trim());
      setNewSub("");
    }
  };

  const dueDateInfo = task.dueDate ? formatDueDate(task.dueDate) : null;

  return (
    <div
      className={`group bg-white dark:bg-gray-900 rounded-2xl border-l-4 ${priorityStyles[task.priority]} border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-200 ${task.completed ? "opacity-60" : ""}`}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <button
            onClick={() => onToggle(task.id)}
            className="mt-0.5 flex-shrink-0 transition-transform hover:scale-110"
          >
            {task.completed ? (
              <CheckCircle2 className="w-5 h-5 text-violet-500" />
            ) : (
              <Circle className="w-5 h-5 text-gray-300 dark:text-gray-600 hover:text-violet-400 transition-colors" />
            )}
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3
                className={`font-semibold text-gray-900 dark:text-white text-sm leading-snug ${task.completed ? "line-through text-gray-400" : ""}`}
              >
                {task.title}
              </h3>
              {/* Points badge */}
              <span className="flex-shrink-0 text-xs px-1.5 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 font-medium">
                +{task.points}⭐
              </span>
            </div>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              {/* Priority */}
              <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${priorityDot[task.priority]}`}
                />
                {priorityLabel[task.priority]}
              </span>

              {/* Category */}
              {task.category && (
                <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400">
                  <Tag className="w-2.5 h-2.5" />
                  {task.category}
                </span>
              )}

              {/* Due Date */}
              {dueDateInfo && (
                <span
                  className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                    dueDateInfo.urgent
                      ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                  }`}
                >
                  <Clock className="w-2.5 h-2.5" />
                  {dueDateInfo.label}
                </span>
              )}

              {/* Mood */}
              {task.mood && (
                <span className="text-xs">
                  {task.mood === "happy"
                    ? "😊"
                    : task.mood === "motivated"
                      ? "🔥"
                      : task.mood === "neutral"
                        ? "😐"
                        : task.mood === "tired"
                          ? "😴"
                          : "😤"}
                </span>
              )}
            </div>

            {/* Sub-tasks progress */}
            {task.subTasks.length > 0 && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-400">
                    {completedSubs}/{task.subTasks.length} خطوات
                  </span>
                  <span className="text-xs text-gray-400">
                    {Math.round(subProgress)}%
                  </span>
                </div>
                <progress
                  value={completedSubs}
                  max={task.subTasks.length}
                  className="task-progress-bar"
                />
              </div>
            )}

            {/* Notes preview */}
            {task.notes && !expanded && (
              <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500 truncate">
                {task.notes}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              aria-label="تعديل المهمة"
              title="تعديل المهمة"
              onClick={() => onEdit(task)}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-blue-500 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              aria-label={expanded ? "إخفاء التفاصيل" : "عرض التفاصيل"}
              title={expanded ? "إخفاء التفاصيل" : "عرض التفاصيل"}
              onClick={() => setExpanded((e) => !e)}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-violet-500 transition-colors"
            >
              {expanded ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
            <button
              type="button"
              aria-label="حذف المهمة"
              title="حذف المهمة"
              onClick={() => onDelete(task.id)}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Expanded: Notes + SubTasks */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-800 pt-3">
          {task.notes && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 whitespace-pre-wrap">
              {task.notes}
            </p>
          )}

          {/* Sub-tasks */}
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              الخطوات الفرعية
            </p>
            {task.subTasks.map((sub) => (
              <div key={sub.id} className="flex items-center gap-2 group/sub">
                <button
                  type="button"
                  aria-label={
                    sub.completed
                      ? "إلغاء علامة الخطوة"
                      : "وضع علامة على الخطوة"
                  }
                  title={
                    sub.completed
                      ? "إلغاء علامة الخطوة"
                      : "وضع علامة على الخطوة"
                  }
                  onClick={() => onToggleSubTask(task.id, sub.id)}
                  className="flex-shrink-0"
                >
                  {sub.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-violet-500" />
                  ) : (
                    <Circle className="w-4 h-4 text-gray-300 dark:text-gray-600" />
                  )}
                </button>
                <span
                  className={`flex-1 text-sm ${sub.completed ? "line-through text-gray-400" : "text-gray-700 dark:text-gray-300"}`}
                >
                  {sub.text}
                </span>
                <button
                  type="button"
                  aria-label="حذف خطوة فرعية"
                  title="حذف خطوة فرعية"
                  onClick={() => onDeleteSubTask(task.id, sub.id)}
                  className="opacity-0 group-hover/sub:opacity-100 transition-opacity"
                >
                  <X className="w-3.5 h-3.5 text-gray-400 hover:text-red-500" />
                </button>
              </div>
            ))}

            {/* Add sub-task */}
            {showSubInput ? (
              <div className="flex items-center gap-2 mt-2">
                <input
                  autoFocus
                  type="text"
                  value={newSub}
                  onChange={(e) => setNewSub(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddSub();
                    if (e.key === "Escape") setShowSubInput(false);
                  }}
                  placeholder="أضف خطوة..."
                  className="flex-1 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
                <button
                  onClick={handleAddSub}
                  className="px-2 py-1.5 rounded-lg bg-violet-500 text-white text-xs font-medium hover:bg-violet-600"
                >
                  ✓
                </button>
                <button
                  onClick={() => setShowSubInput(false)}
                  className="px-2 py-1.5 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowSubInput(true)}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-violet-500 transition-colors mt-1 py-1"
              >
                <Plus className="w-3.5 h-3.5" /> أضف خطوة فرعية
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
