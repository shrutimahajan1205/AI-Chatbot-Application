import React, { useState } from "react";
import { X, Star, Send } from "lucide-react";

export default function FeedbackModal({ isOpen, onClose, message, onSubmitFeedback }) {
  const [rating, setRating] = useState(message?.rating || 5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !message) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onSubmitFeedback(message._id, rating, comment);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">Rate AI Response</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-center py-2 space-y-2">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              How satisfied are you with this response?
            </p>
            <div className="flex justify-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 hover:scale-125 transition"
                >
                  <Star
                    className={`w-7 h-7 ${
                      rating >= star
                        ? "text-amber-400 fill-amber-400"
                        : "text-slate-300 dark:text-slate-600"
                    }`}
                  />
                </button>
              ))}
            </div>
            <span className="text-xs font-semibold text-amber-500">
              {rating === 5 && "⭐ Outstanding / Very Helpful"}
              {rating === 4 && "⭐ Good / Relevant"}
              {rating === 3 && "⭐ Average"}
              {rating === 2 && "⭐ Below Expectations"}
              {rating === 1 && "⭐ Needs Improvement"}
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Additional Feedback or Suggestions (Optional)
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us what worked well or what could be improved..."
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center space-x-1.5 px-4 py-2 text-sm rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-md shadow-indigo-600/20"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? "Submitting..." : "Submit Feedback"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
