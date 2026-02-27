import { useState } from 'react';
import AIProofreadButton from './AIProofreadButton';

export default function ReviewModal({ isOpen, onClose, trade, reviewee, onSubmit }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating < 1 || rating > 5) {
      alert('Please select a rating');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(rating, comment);
      setRating(5);
      setComment('');
      onClose();
    } catch (error) {
      alert('Failed to submit review: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Leave a Review</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Reviewing</p>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg">
              {reviewee?.name?.split(' ').map(n => n[0]).join('').substring(0, 2)}
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white">{reviewee?.name}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {trade?.skill} • {trade?.hours}h
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Rating Stars */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
              How was your experience?
            </label>
            <div className="flex items-center gap-2 justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  <span
                    className={`material-symbols-outlined text-4xl ${
                      star <= (hoveredRating || rating)
                        ? 'text-yellow-500'
                        : 'text-slate-300 dark:text-slate-700'
                    }`}
                    style={{ fontVariationSettings: star <= (hoveredRating || rating) ? '"FILL" 1' : '"FILL" 0' }}
                  >
                    star
                  </span>
                </button>
              ))}
            </div>
            <p className="text-center mt-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
              {rating === 5 && 'Excellent!'}
              {rating === 4 && 'Great!'}
              {rating === 3 && 'Good'}
              {rating === 2 && 'Fair'}
              {rating === 1 && 'Needs Improvement'}
            </p>
          </div>

          {/* Comment */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Share your experience (optional)
              </label>
              <AIProofreadButton
                text={comment}
                context="review"
                onApprove={(improvedText) => setComment(improvedText)}
              />
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What made this trade great? Any tips for others?"
              rows={4}
              maxLength={500}
              className="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary resize-none"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 text-right">
              {comment.length}/500
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || rating < 1}
              className="flex-1 px-6 py-3 rounded-lg bg-primary text-slate-900 font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                  Submitting...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">rate_review</span>
                  Submit Review
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
