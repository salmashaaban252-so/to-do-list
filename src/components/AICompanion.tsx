import { useState } from 'react';
import { X, Send, Bot } from 'lucide-react';
import { Mood, Task } from '../types';

interface AICompanionProps {
  tasks: Task[];
  streak: number;
  totalPoints: number;
  currentMood: Mood | null;
  onClose: () => void;
}

interface Message {
  id: string;
  from: 'user' | 'ai';
  text: string;
}

function generateAIResponse(input: string, tasks: Task[], streak: number, totalPoints: number, mood: Mood | null): string {
  const lower = input.toLowerCase();
  const completedToday = tasks.filter(t => t.completed).length;
  const pending = tasks.filter(t => !t.completed).length;

  // Mood-based responses
  if (lower.includes('تعبان') || lower.includes('مش قادر') || lower.includes('زهقت')) {
    return `😊 أنا فاهمك! إحساس التعب ده طبيعي جداً. بس فكر معايا، إنت عندك ${pending} مهمة بس! ابدأ بأصغل واحدة، وهتلاقي نفسك اتحمست. إنت ${streak > 0 ? `عندك streak ${streak} يوم!` : 'قادر تبدأ streak جديد النهارده!'} 💪`;
  }

  if (lower.includes('مرتاح') || lower.includes('سعيد') || lower.includes('تمام')) {
    return `🔥 ده الكلام! إنت في أفضل وقت دلوقتي تخلص مهامك! عندك ${pending} مهمة مستنياك. يلا نكمل! 🚀`;
  }

  if (lower.includes('إزيك') || lower.includes('عامل إيه') || lower.includes('هاي')) {
    return `مرحباً! أنا كويس والله، وجاهز أساعدك! 😊 إنت عندك ${completedToday} مهمة خلصتها، و${pending} مهمة لسه. ${streak > 0 ? `وعندك streak رهيب ${streak} يوم!` : ''} عايز أساعدك بإيه؟`;
  }

  if (lower.includes('نقط') || lower.includes('مكافأة') || lower.includes('reward')) {
    return `⭐ إنت عندك ${totalPoints} نقطة دلوقتي! كل مهمة بتخلصها بتكسب نقط حسب أولويتها. لما تكسب نقط أكتر هتفتح ثيمات وألوان جديدة! يلا كمّل! 🏆`;
  }

  if (lower.includes('streak') || lower.includes('سلسلة')) {
    if (streak === 0) {
      return `🌱 ابدأ streak جديد النهارده! خلص مهام النهارده وهيبدأ عداد الأيام. كل يوم بتكمل مهامك الـ streak بيزيد. لو قطعت يوم السلسلة بتبدأ من الأول!`;
    }
    return `🔥 Streak رهيب! إنت شغال ${streak} يوم متواصل! الاستمرارية دي أهم من أي حاجة تانية. محافظ على نفسك وكمل! 💪`;
  }

  if (lower.includes('focus') || lower.includes('تركيز') || lower.includes('تشتيت')) {
    return `🎯 فيه Focus Mode في التطبيق! اضغط على زرار Focus في الأعلى. تقدر تحدد وقت تركيز وتحجب المواقع اللي بتشتتك زي يوتيوب وانستجرام. جرب 25 دقيقة تركيز بدون تشتيت!`;
  }

  if (lower.includes('مهمة') || lower.includes('tasks') || lower.includes('شغل')) {
    if (pending === 0) {
      return `🎉 يا نجم! خلصت كل مهامك! استاهل تاخد راحة. إنت شاطر جداً! هتضيف مهام جديدة؟`;
    }
    const urgentTasks = tasks.filter(t => !t.completed && t.priority === 'high');
    if (urgentTasks.length > 0) {
      return `⚡ عندك ${urgentTasks.length} مهمة عالية الأولوية! ابدأ بـ "${urgentTasks[0].title}". ركز عليها الأول وبعدين كمل باقي المهام. إنت قادر! 💪`;
    }
    return `📋 عندك ${pending} مهمة مستنياك. ${mood === 'tired' ? 'ابدأ بالأسهل وخد نفسك!' : 'يلا نشدها ونخلصها!'}`;
  }

  if (lower.includes('شكر') || lower.includes('برافو') || lower.includes('عظيم')) {
    return `العفو! إنت اللي بتعمل الحاجات العظيمة! أنا بس هنا أشجعك. ${completedToday > 0 ? `وإنت خلصت ${completedToday} مهمة، ده إنجاز حقيقي!` : 'يلا نكمل مع بعض!'} 🌟`;
  }

  if (lower.includes('كيف') || lower.includes('إزاي') || lower.includes('ساعدني')) {
    return `بكل سرور! 😊 تقدر تسألني عن:\n• مهامك وأولوياتها\n• نقاطك والمكافآت\n• الـ streak بتاعك\n• نصايح للتركيز\n• إزاي تنظم يومك\nقولي إيه اللي عايز تعرفه!`;
  }

  // Default responses
  const defaults = [
    `أنا هنا معاك دايماً! 😊 إنت شغال كويس جداً. ${pending > 0 ? `جرب تخلص ${Math.min(3, pending)} مهمات دلوقتي.` : 'خلصت كل حاجة! برافو!'}`,
    `💪 كل خطوة صغيرة بتوصلك للهدف الكبير. ${streak > 0 ? `إنت عندك ${streak} يوم streak!` : 'ابدأ streak جديد النهارده!'}`,
    `🌟 إنت أقوى مما تتخيل! عندك ${totalPoints} نقطة دليل على كده. كمل!`,
    `اسألني أي حاجة! أنا هنا أساعدك تنظم يومك وتخلص مهامك. 🎯`,
  ];
  return defaults[Math.floor(Math.random() * defaults.length)];
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    from: 'ai',
    text: '👋 مرحباً! أنا مساعدك الذكي في TaskFlow! 🤖\n\nأنا هنا أشجعك وأساعدك. إزيك النهارده؟ عايز تسأل عن مهامك، نقاطك، أو محتاج نصيحة؟',
  },
];

export default function AICompanion({ tasks, streak, totalPoints, currentMood, onClose }: AICompanionProps) {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = () => {
    if (!input.trim()) return;
    const userMsg: Message = { id: crypto.randomUUID(), from: 'user', text: input.trim() };
    setMessages(m => [...m, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const response = generateAIResponse(userMsg.text, tasks, streak, totalPoints, currentMood);
      const aiMsg: Message = { id: crypto.randomUUID(), from: 'ai', text: response };
      setMessages(m => [...m, aiMsg]);
      setIsTyping(false);
    }, 800 + Math.random() * 400);
  };

  const QUICK_MESSAGES = ['إزيك؟', 'عندي مهام كتير 😩', 'كام نقطة عندي؟', 'نصيحة للتركيز', 'ال streak بتاعي إيه؟'];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-md border border-gray-200 dark:border-gray-700 flex flex-col"
        style={{ height: '80vh', maxHeight: '600px' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-gray-900 dark:text-white text-sm">مساعدك الذكي 🤖</p>
              <p className="text-xs text-emerald-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                متصل دايماً
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.from === 'ai' && (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0 mr-2 mt-auto">
                  <span className="text-xs">🤖</span>
                </div>
              )}
              <div
                className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.from === 'user'
                    ? 'bg-gradient-to-r from-violet-500 to-indigo-600 text-white rounded-br-sm'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-sm'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0 mr-2">
                <span className="text-xs">🤖</span>
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
        </div>

        {/* Quick Replies */}
        <div className="px-4 py-2 flex gap-2 overflow-x-auto flex-shrink-0 border-t border-gray-100 dark:border-gray-800">
          {QUICK_MESSAGES.map(q => (
            <button
              key={q}
              onClick={() => { setInput(q); }}
              className="flex-shrink-0 px-3 py-1.5 rounded-full bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 text-xs font-medium border border-violet-200 dark:border-violet-800 hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="px-4 pb-4 pt-2 flex gap-2 flex-shrink-0">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder="اكتب رسالة..."
            className="flex-1 px-4 py-2.5 rounded-2xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            className="w-10 h-10 rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-200 dark:shadow-violet-900/30 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
