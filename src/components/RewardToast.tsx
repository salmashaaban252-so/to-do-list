import { useEffect } from 'react';
import { X } from 'lucide-react';

interface RewardToastProps {
  reward: { name: string; description: string; icon: string; pointsRequired: number } | null;
  onClose: () => void;
}

export default function RewardToast({ reward, onClose }: RewardToastProps) {
  useEffect(() => {
    if (!reward) return;
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [reward, onClose]);

  if (!reward) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] animate-bounce-once">
      <div className="bg-gradient-to-r from-amber-400 to-yellow-400 rounded-3xl p-5 shadow-2xl shadow-amber-200 dark:shadow-amber-900/40 flex items-center gap-4 max-w-sm border border-amber-300">
        <div className="text-5xl animate-spin-slow">{reward.icon}</div>
        <div className="flex-1">
          <p className="text-xs font-bold text-amber-900/70 uppercase tracking-wider">🏆 مكافأة جديدة!</p>
          <p className="text-lg font-black text-amber-900">{reward.name}</p>
          <p className="text-sm text-amber-800">{reward.description}</p>
        </div>
        <button onClick={onClose} className="flex-shrink-0">
          <X className="w-4 h-4 text-amber-700" />
        </button>
      </div>
    </div>
  );
}
