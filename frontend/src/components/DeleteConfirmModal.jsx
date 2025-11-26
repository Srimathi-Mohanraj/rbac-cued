
import React from 'react';

export default function DeleteConfirmModal({ open, title = 'Are You Sure! Want to Delete ?', description, onCancel, onConfirm, loading = false }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />

      <div className="relative bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-[90%] max-w-xl p-6 z-60">
        <button onClick={onCancel} className="absolute top-3 right-3 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-full p-1">✕</button>

        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7L5 7M10 11v6m4-6v6M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
            </svg>
          </div>

          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 text-center">{title}</h3>
          <p className="text-sm text-slate-500 text-center">{description || "Do you really want to delete these records? You can't view this in your list anymore if you delete!"}</p>

          <div className="flex gap-3 w-full mt-2">
            <button onClick={onCancel} className="flex-1 py-2 border rounded-md bg-white text-slate-700 hover:bg-slate-50">No, Keep It</button>
            <button onClick={onConfirm} disabled={loading} className="flex-1 py-2 rounded-md bg-red-500 text-white hover:bg-red-600">
              {loading ? 'Deleting...' : 'Yes, Delete It'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
