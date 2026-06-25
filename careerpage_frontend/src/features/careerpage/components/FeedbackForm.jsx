import { useState } from "react";
import { motion } from "motion/react";
import { MessageSquare, Star, Send } from "lucide-react";
import { MAROON, GOLD, CREAM } from "../../../lib/constants";

// Self-contained feedback form with star rating. Owns its own form state.
export function FeedbackForm() {
  const [feedback, setFeedback] = useState({
    name: "",
    email: "",
    category: "",
    rating: 0,
    hoverRating: 0,
    message: "",
    submitted: false,
  });

  const handleSubmit = () => {
    if (feedback.name && feedback.email && feedback.category && feedback.rating && feedback.message)
      setFeedback({ ...feedback, submitted: true });
  };

  return (
    <section style={{ background: "#fff" }} className="py-20 px-6">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <div style={{ background: `rgba(24,169,184,0.1)`, borderRadius: "50%", padding: "8px" }}>
              <MessageSquare size={18} style={{ color: MAROON }} />
            </div>
            <span style={{ color: "#1a0a0a", fontSize: "0.7rem", letterSpacing: "0.2em", fontWeight: 700 }} className="uppercase">
              We'd love to hear from you
            </span>
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", color: "#1a0a0a", fontSize: "clamp(1.8rem, 4vw, 2.4rem)", fontWeight: 700 }}>
            Share Your Feedback
          </h2>
          <p style={{ color: "#6b5c5c", fontSize: "0.9rem", marginTop: "8px" }}>
            Help us improve your experience. We value every opinion.
          </p>
        </motion.div>

        {feedback.submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ border: `1.5px solid rgba(107,26,26,0.15)`, borderRadius: "12px", background: CREAM, padding: "48px 32px", textAlign: "center" }}
          >
            <div style={{ background: `rgba(107,26,26,0.08)`, borderRadius: "50%", width: "56px", height: "56px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <Send size={22} style={{ color: MAROON }} />
            </div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", color: MAROON, fontSize: "1.4rem", fontWeight: 700 }}>Thank You!</h3>
            <p style={{ color: "#6b5c5c", fontSize: "0.9rem", marginTop: "8px" }}>Your feedback has been submitted successfully.</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            style={{ border: `1.5px solid rgba(107,26,26,0.12)`, borderRadius: "12px", background: "#fff", padding: "36px 32px", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}
          >
            <div className="grid sm:grid-cols-2 gap-5 mb-5">
              <div>
                <label style={{ color: "#1a0a0a", fontSize: "0.8rem", fontWeight: 600 }} className="block mb-1.5">
                  Full Name <span style={{ color: MAROON }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="Your name"
                  value={feedback.name}
                  onChange={(e) => setFeedback({ ...feedback, name: e.target.value })}
                  style={{ border: `1.5px solid rgba(107,26,26,0.18)`, borderRadius: "6px", background: "#faf8f5", color: "#1a0a0a", fontSize: "0.875rem", width: "100%", padding: "10px 14px", outline: "none" }}
                />
              </div>
              <div>
                <label style={{ color: "#1a0a0a", fontSize: "0.8rem", fontWeight: 600 }} className="block mb-1.5">
                  Email Address <span style={{ color: MAROON }}>*</span>
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={feedback.email}
                  onChange={(e) => setFeedback({ ...feedback, email: e.target.value })}
                  style={{ border: `1.5px solid rgba(107,26,26,0.18)`, borderRadius: "6px", background: "#faf8f5", color: "#1a0a0a", fontSize: "0.875rem", width: "100%", padding: "10px 14px", outline: "none" }}
                />
              </div>
            </div>
            <div className="mb-5">
              <label style={{ color: "#1a0a0a", fontSize: "0.8rem", fontWeight: 600 }} className="block mb-1.5">
                Category <span style={{ color: MAROON }}>*</span>
              </label>
              <select
                value={feedback.category}
                onChange={(e) => setFeedback({ ...feedback, category: e.target.value })}
                style={{ border: `1.5px solid rgba(107,26,26,0.18)`, borderRadius: "6px", background: "#faf8f5", color: feedback.category ? "#1a0a0a" : "#9a8a8a", fontSize: "0.875rem", width: "100%", padding: "10px 14px", outline: "none", appearance: "auto" }}
              >
                <option value="">Select a category</option>
                <option value="Academic">Academic</option>
                <option value="Administrative">Administrative</option>
                <option value="Operations">Operations & Support</option>
                <option value="General">General</option>
              </select>
            </div>
            <div className="mb-5">
              <label style={{ color: "#1a0a0a", fontSize: "0.8rem", fontWeight: 600 }} className="block mb-2">
                Overall Rating <span style={{ color: MAROON }}>*</span>
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={28}
                    onClick={() => setFeedback({ ...feedback, rating: star })}
                    onMouseEnter={() => setFeedback({ ...feedback, hoverRating: star })}
                    onMouseLeave={() => setFeedback({ ...feedback, hoverRating: 0 })}
                    style={{
                      cursor: "pointer",
                      fill: star <= (feedback.hoverRating || feedback.rating) ? GOLD : "transparent",
                      color: star <= (feedback.hoverRating || feedback.rating) ? GOLD : "#ccc",
                      transition: "all 0.15s",
                    }}
                  />
                ))}
              </div>
            </div>
            <div className="mb-6">
              <label style={{ color: "#1a0a0a", fontSize: "0.8rem", fontWeight: 600 }} className="block mb-1.5">
                Your Feedback <span style={{ color: MAROON }}>*</span>
              </label>
              <textarea
                rows={5}
                placeholder="Share your thoughts, suggestions, or experience..."
                value={feedback.message}
                onChange={(e) => setFeedback({ ...feedback, message: e.target.value })}
                style={{ border: `1.5px solid rgba(107,26,26,0.18)`, borderRadius: "6px", background: "#faf8f5", color: "#1a0a0a", fontSize: "0.875rem", width: "100%", padding: "10px 14px", outline: "none", resize: "none" }}
              />
              <div style={{ color: "#9a8a8a", fontSize: "0.75rem", textAlign: "right", marginTop: "4px" }}>
                {feedback.message.length} character{feedback.message.length !== 1 ? "s" : ""}
              </div>
            </div>
            <button
              onClick={handleSubmit}
              style={{ background: MAROON, color: "#fff", fontWeight: 600, fontSize: "0.9rem", letterSpacing: "0.05em", border: "none", borderRadius: "6px", width: "100%", padding: "14px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", transition: "opacity 0.2s" }}
              className="hover:opacity-90"
            >
              <Send size={16} /> Submit Feedback
            </button>
          </motion.div>
        )}
      </div>
    </section>
  );
}
