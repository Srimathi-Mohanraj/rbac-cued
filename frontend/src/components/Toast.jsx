import React, { useEffect, useState } from 'react';

export default function Toast({ id, message = '', type = 'success', duration = 3500, onClose }) {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(100); 

  useEffect(() => {
    if (!visible) return;
    const start = Date.now();
    const tick = 50;
    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.max(0, 100 - Math.round((elapsed / duration) * 100));
      setProgress(pct);
      if (elapsed >= duration) {
        clearInterval(timer);
        setVisible(false);
        onClose && onClose(id);
      }
    }, tick);

    return () => clearInterval(timer);
  }, [visible, duration, id, onClose]);

  if (!visible) return null;

  const bg = type === 'success' ? 'bg-green-50' : 'bg-red-50';
  const border = type === 'success' ? 'border-green-200' : 'border-red-200';
  const icon = type === 'success' ? '✔️' : '❗';

  return (
    <div className={`max-w-md w-[420px] ${bg} border ${border} rounded-md shadow-lg overflow-hidden`}>
      <div className="p-3 flex items-start gap-3">
        <div className="shrink-0">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
            <span className="text-sm">{icon}</span>
          </div>
        </div>

        <div className="flex-1">
          <div className="font-semibold text-slate-800">{message}</div>
          <div className="text-xs text-slate-500 mt-1">You will be redirected shortly.</div>
        </div>

        <div className="ml-3">
          <button
            onClick={() => { setVisible(false); onClose && onClose(id); }}
            className="p-1 rounded text-slate-500 hover:text-slate-800"
            aria-label="close toast"
          >
            ✕
          </button>
        </div>
      </div>

      {/* progress bar */}
      <div className="h-1 bg-white/30">
        <div
          className={`h-full ${type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}
          style={{ width: `${progress}%`, transition: 'width 100ms linear' }}
        />
      </div>
    </div>
  );
}
