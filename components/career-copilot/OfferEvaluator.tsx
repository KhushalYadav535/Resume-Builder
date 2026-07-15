"use client";
import React, { useState } from "react";
import { Scale } from "lucide-react";

export default function OfferEvaluator() {
  const [offerSalary, setOfferSalary] = useState("");
  const [priority, setPriority] = useState("growth");
  const [result, setResult] = useState<string>("");

  const handleEvaluate = () => {
    if (!offerSalary) return;
    // Client-side quick eval for UI demo purposes (can be backed by AI if needed)
    let verdict = "";
    const numSalary = parseInt(offerSalary.replace(/[^0-9]/g, ''));
    if (priority === "growth") {
      verdict = `While the base salary of ${offerSalary} is important, since your priority is 'Growth & Learning', you should heavily weigh the mentorship opportunities and the tech stack. Make sure to ask about their engineering culture.`;
    } else if (priority === "wlb") {
      verdict = `With a priority on 'Work-Life Balance', evaluate if this ${offerSalary} offer includes flexible hours, remote options, and solid PTO. The base pay is only one part of the equation for you.`;
    } else {
      verdict = `Since 'Maximum Compensation' is your goal, ensure this ${offerSalary} offer includes strong equity, signing bonuses, and a clear path to promotion. Don't be afraid to use the Negotiation Script generator below!`;
    }
    setResult(verdict);
  };

  return (
    <div className="card" style={{ padding: "1.5rem", display: "grid", gap: "1.2rem" }}>
      <h3 style={{ margin: "0 0 0.5rem", fontSize: "1.1rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <Scale size={18} className="text-orange-400" />
        Offer Evaluator
      </h3>
      <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
        Quickly evaluate a job offer against your core career priorities.
      </p>

      <div style={{ display: "grid", gap: "1rem" }}>
        <input 
          className="input" 
          placeholder="Offer Base Salary (e.g. $120k)" 
          value={offerSalary} 
          onChange={e => setOfferSalary(e.target.value)} 
          style={{ width: "100%", padding: "0.6rem 1rem", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--bg-elevated)" }} 
        />
        <div>
          <label style={{ fontSize: "0.85rem", fontWeight: 600, display: "block", marginBottom: "0.5rem" }}>What is your top priority?</label>
          <select 
            className="input" 
            value={priority} 
            onChange={e => setPriority(e.target.value)}
            style={{ width: "100%", padding: "0.6rem 1rem", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--bg-elevated)" }}
          >
            <option value="growth">Growth & Learning</option>
            <option value="compensation">Maximum Compensation</option>
            <option value="wlb">Work-Life Balance</option>
          </select>
        </div>
        
        <button onClick={handleEvaluate} disabled={!offerSalary} className="btn-secondary" style={{ width: "fit-content" }}>
          Evaluate Offer
        </button>
      </div>

      {result && (
        <div style={{ background: "rgba(249, 115, 22, 0.05)", border: "1px solid rgba(249, 115, 22, 0.2)", borderRadius: "10px", padding: "1.2rem", marginTop: "0.5rem" }}>
          <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--text)", lineHeight: 1.6 }}>
            {result}
          </p>
        </div>
      )}
    </div>
  );
}
