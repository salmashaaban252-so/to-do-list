import { Mood } from '../types';

interface MoodCheckerProps {
  currentMood: Mood | null;
  onSetMood: (mood: Mood) => void;
  onClose: () => void;
}

const moods: { value: Mood; emoji: string; label: string; color: string }[] = [
  { value: 'happy', emoji: '😊', label: 'سعيد', color: 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700' },
  { value: 'motivated', emoji: '🔥', label: 'متحمس', color: 'bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700' },
  { value: 'neutral', emoji: '😐', label: 'عادي', color: 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700' },
  { value: 'tired', emoji: '😴', label: 'تعبان', color: 'bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700' },
  { value: 'stressed', emoji: '😤', label: 'متضغط', color: 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700' },
];

const moodMessages: Record<Mood, string> = {
  happy: '🌟 عظيم! خليك في المود الجميل ده وخلص مهامك!',
  motivated: '🚀 إنت في أفضل حالاتك دلوقتي! ابدأ بالمهام الصعبة!',
  neutral: '💪 عادي، كل يوم بخير! ابدأ بخطوة واحدة!',
  tired: '🌙 خد نفسك، ابدأ بأصغر مهمة عندك!',
  stressed: '🌊 خد نفس عميق، وركز على مهمة واحدة بس!',
};

export default function MoodChecker({ currentMood, onSetMood, onClose }: MoodCheckerProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-2xl max-w-sm w-full border border-gray-200 dark:border-gray-700"
        onClick={e => e.stopPropagation()}
      >
        <div className="text-center mb-5">
          <div className="text-4xl mb-2">🤔</div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">إزيك النهارده؟</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">اختار المزاج اللي بتحس بيه</p>
        </div>

        <div className="grid grid-cols-5 gap-2 mb-4">
          {moods.map(m => (
            <button
              key={m.value}
              onClick={() => { onSetMood(m.value); onClose(); }}
              className={`flex flex-col items-center gap-1 p-2 rounded-2xl border-2 transition-all duration-200 hover:scale-105 ${
                currentMood === m.value
                  ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/30 scale-105'
                  : `border-transparent ${m.color}`
              }`}
            >
              <span className="text-2xl">{m.emoji}</span>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{m.label}</span>
            </button>
          ))}
        </div>

        {currentMood && (
          <div className="bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-900/20 dark:to-indigo-900/20 rounded-2xl p-3 text-center">
            <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">{moodMessages[currentMood]}</p>
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-4 w-full py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          متشكرش 👍
        </button>
      </div>
    </div>
  );
}
