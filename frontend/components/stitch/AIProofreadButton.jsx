import { useState } from 'react';
import api from '../../lib/api';

export default function AIProofreadButton({ text, onApprove, context = 'general' }) {
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [result, setResult] = useState(null);

  const handleProofread = async () => {
    if (!text || text.trim().length === 0) {
      alert('Please enter some text first');
      return;
    }

    setLoading(true);
    try {
      const response = await api.proofreadText(text, context);
      setResult(response);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Failed to proofread:', error);
      if (error.message.includes('429')) {
        alert('⏱️ Rate limit exceeded. You can use AI proofreading up to 10 times per day.');
      } else if (error.message.includes('not configured')) {
        alert('ℹ️ AI proofreading is not configured on the server.');
      } else {
        alert('Failed to proofread text. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = () => {
    if (result?.improved) {
      onApprove(result.improved);
      setShowSuggestions(false);
      setResult(null);
    }
  };

  const handleReject = () => {
    setShowSuggestions(false);
    setResult(null);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleProofread}
        disabled={loading || !text || text.trim().length === 0}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
      >
        {loading ? (
          <>
            <span className="inline-block animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent" />
            <span>Improving...</span>
          </>
        ) : (
          <>
            <span className="material-symbols-outlined text-sm">auto_fix_high</span>
            <span>AI Improve</span>
          </>
        )}
      </button>

      {showSuggestions && result && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-purple-500">auto_fix_high</span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  AI Suggestions
                </h3>
              </div>
              <button
                onClick={handleReject}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Original vs Improved */}
            <div className="space-y-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                  Original Text
                </label>
                <div className="p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-800">
                  <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                    {result.original}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                  Improved Text
                </label>
                <div className="p-3 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                    {result.improved}
                  </p>
                </div>
              </div>
            </div>

            {/* Suggestions */}
            {result.suggestions && result.suggestions.length > 0 && (
              <div className="mb-6">
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                  Specific Suggestions
                </label>
                <div className="space-y-2">
                  {result.suggestions.map((suggestion, idx) => {
                    const typeColors = {
                      grammar: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
                      clarity: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
                      tone: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
                      style: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
                      info: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
                    };
                    const colorClass = typeColors[suggestion.type] || typeColors.info;

                    return (
                      <div
                        key={idx}
                        className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700"
                      >
                        <div className="flex items-start gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded font-semibold ${colorClass} uppercase`}>
                            {suggestion.type}
                          </span>
                          <p className="text-sm text-slate-700 dark:text-slate-300 flex-1">
                            {suggestion.message}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Rate limit info */}
            {result.remaining !== undefined && (
              <div className="mb-6 p-3 bg-slate-100 dark:bg-slate-900 rounded-lg text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">info</span>
                  <span>
                    📊 Daily usage: {result.remaining} AI improvements remaining today
                  </span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleApprove}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-lg transition-all"
              >
                ✨ Use Improved Text
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-semibold rounded-lg transition-all"
              >
                Keep Original
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
