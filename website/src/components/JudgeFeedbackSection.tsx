import React, { useState, useEffect } from 'react';
import { 
  Star, 
  Send, 
  MessageSquare, 
  CheckCircle2, 
  Sparkles, 
  ThumbsUp, 
  ShieldAlert,
  Loader2
} from 'lucide-react';
import { AGENT_ROSTER } from '../data/agents';

interface Review {
  id?: number | string;
  reviewer_name: string;
  role_title: string;
  organization: string;
  rating: number;
  feedback: string;
  favorite_agent: string;
  created_at: string;
}

export const JudgeFeedbackSection: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [roleTitle, setRoleTitle] = useState('Hackathon Judge');
  const [organization, setOrganization] = useState('');
  const [rating, setRating] = useState(5);
  const [favoriteAgent, setFavoriteAgent] = useState('Triage Agent (gemini-3.1-pro)');
  const [feedback, setFeedback] = useState('');

  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/reviews');
      if (res.ok) {
        const data = await res.json();
        setReviews(data || []);
      }
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !feedback.trim()) {
      setErrorMessage('Please provide your name and review notes.');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewer_name: name,
          role_title: roleTitle,
          organization: organization || 'Hackathon Evaluator',
          rating,
          feedback,
          favorite_agent: favoriteAgent
        })
      });

      if (res.ok) {
        setSuccessMessage('Thank you for submitting your evaluation! Your review has been recorded.');
        setName('');
        setFeedback('');
        fetchReviews();
      } else {
        const err = await res.json();
        setErrorMessage(err.error || 'Failed to submit review.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error communicating with review service.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="reviews" className="py-24 bg-[#0B1120] relative border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-300 text-xs font-mono uppercase tracking-wider mb-4">
            <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
            <span>Judge & Evaluator Feedback</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Live Hackathon Review Board.
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-300">
            Hackathon judges, clinical advisors, and open-source testers can submit feedback and agent evaluations directly to our live Supabase database.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-6xl mx-auto items-start">
          
          {/* Left Col: Submit Review Form */}
          <div className="lg:col-span-5 p-6 rounded-2xl bg-[#0F172A] border border-cyan-950/80 shadow-2xl">
            <h3 className="text-lg font-bold text-white font-mono flex items-center space-x-2 mb-4">
              <MessageSquare className="w-5 h-5 text-cyan-400" />
              <span>Submit Your Evaluation</span>
            </h3>

            {successMessage && (
              <div className="p-3 mb-4 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-mono flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            {errorMessage && (
              <div className="p-3 mb-4 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs font-mono flex items-start space-x-2">
                <ShieldAlert className="w-4 h-4 flex-shrink-0 text-rose-400 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
              <div>
                <label className="block text-slate-400 uppercase tracking-wider mb-1">Your Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Jordan Vance / Judge #4"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 uppercase tracking-wider mb-1">Role / Title</label>
                  <select
                    value={roleTitle}
                    onChange={(e) => setRoleTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Hackathon Judge">Hackathon Judge</option>
                    <option value="Emergency Physician">Emergency Physician</option>
                    <option value="Paramedic / EMS Director">Paramedic / EMS</option>
                    <option value="AI / Systems Engineer">AI Engineer</option>
                    <option value="Open Source Contributor">Open Source Dev</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 uppercase tracking-wider mb-1">Organization</label>
                  <input
                    type="text"
                    placeholder="e.g. Google / Hospital"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 uppercase tracking-wider mb-1">Rating</label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 text-yellow-400 focus:outline-none"
                    >
                      <Star className={`w-6 h-6 ${star <= rating ? 'fill-yellow-400' : 'text-slate-700'}`} />
                    </button>
                  ))}
                  <span className="text-sm font-bold text-white ml-2">{rating} / 5 Stars</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 uppercase tracking-wider mb-1">Most Impressive Agent</label>
                <select
                  value={favoriteAgent}
                  onChange={(e) => setFavoriteAgent(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
                >
                  {AGENT_ROSTER.map((ag) => (
                    <option key={ag.id} value={`${ag.name} (${ag.model})`}>
                      {ag.name} ({ag.model})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 uppercase tracking-wider mb-1">Review & Comments *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Share your thoughts on the multi-agent architecture, NEWS2 clinical accuracy, latency, or UX..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl text-xs font-mono font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center space-x-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>RECORDING EVALUATION...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>SUBMIT JUDGE EVALUATION</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Col: Live Reviews Stream */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-mono">
              <span className="text-slate-400 font-bold uppercase tracking-wider">
                Live Recorded Evaluations ({reviews.length})
              </span>
              <span className="text-cyan-400">Synced with Supabase</span>
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-400 font-mono text-xs flex flex-col items-center justify-center space-y-2">
                <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
                <span>Loading real reviews from Postgres database...</span>
              </div>
            ) : reviews.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center font-mono text-xs text-slate-400">
                No reviews yet. Be the first judge to leave an evaluation!
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {reviews.map((rev, i) => (
                  <div
                    key={rev.id || i}
                    className="p-4 rounded-xl bg-[#0F172A] border border-slate-800 font-mono text-xs space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-bold text-white text-sm">{rev.reviewer_name}</span>
                        <div className="text-[11px] text-cyan-400">
                          {rev.role_title} • {rev.organization}
                        </div>
                      </div>
                      <div className="flex items-center text-yellow-400">
                        {Array.from({ length: rev.rating || 5 }).map((_, r) => (
                          <Star key={r} className="w-3.5 h-3.5 fill-yellow-400" />
                        ))}
                      </div>
                    </div>

                    <p className="text-slate-300 leading-relaxed pt-1">
                      "{rev.feedback}"
                    </p>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                      <span>Favorite: <strong className="text-slate-300">{rev.favorite_agent}</strong></span>
                      <span>{new Date(rev.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </section>
  );
};
