"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { MatchupView } from "@/lib/matchups";
import type { SkinKey } from "@/lib/options";

const COPY: Record<SkinKey, { title: string; disputes: string; reply: string; history: string; agree: string; disagree: string; placeholder: string }> = {
  comic: { title: "Letters page", disputes: "Letters", reply: "Editor's reply", history: "Verdict history", agree: "I agree", disagree: "I disagree", placeholder: "What did the verdict miss? Name the feat." },
  arcade: { title: "Crowd verdict", disputes: "Challenges", reply: "AI judge", history: "Patch notes", agree: "Agree", disagree: "Disagree", placeholder: "Challenge the result. Name the feat or counter it missed." },
  broadcast: { title: "Do you agree?", disputes: "Appeals", reply: "Ruling", history: "Decision history", agree: "Agree with the decision", disagree: "Robbery", placeholder: "File an appeal. Which feat or counter did the judges miss?" },
};

const fmt = (n: number) => new Intl.NumberFormat("en-US").format(n);

const STATUS: Record<string, string> = {
  open: "Open",
  held: "Reviewed · verdict held",
  changed: "Reviewed · changed the verdict",
  accepted: "Reviewed · point accepted",
};

type Props = {
  skin: SkinKey;
  v: Pick<MatchupView, "id" | "votes" | "disputes" | "history" | "reviewing" | "reviewThreshold" | "verdictVersion">;
};

export function Community({ skin, v }: Props) {
  const router = useRouter();
  const copy = COPY[skin];
  const [mine, setMine] = useState(v.votes.mine);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [voted, setVoted] = useState<Record<string, boolean>>(() => Object.fromEntries(v.disputes.map((d) => [d.id, d.mine])));
  const [, startTransition] = useTransition();
  const [sending, setSending] = useState(false);

  const base = { agree: v.votes.agree - (v.votes.mine === "agree" ? 1 : 0), disagree: v.votes.disagree - (v.votes.mine === "disagree" ? 1 : 0) };
  const agree = base.agree + (mine === "agree" ? 1 : 0);
  const disagree = base.disagree + (mine === "disagree" ? 1 : 0);
  const total = agree + disagree;
  const agreePct = total ? Math.round((agree / total) * 100) : 0;

  const refresh = () => startTransition(() => router.refresh());

  async function post(url: string, body?: unknown) {
    const res = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error ?? "That didn't go through. Try again.");
    return data;
  }

  async function vote(next: "agree" | "disagree") {
    const value = mine === next ? null : next;
    setMine(value);
    setError(null);
    try {
      await post(`/api/matchups/${v.id}/vote`, { vote: value });
      refresh();
    } catch (e) {
      setMine(mine);
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  async function upvote(id: string) {
    setVoted((s) => ({ ...s, [id]: !s[id] }));
    try {
      await post(`/api/disputes/${id}/upvote`);
      refresh();
    } catch (e) {
      setVoted((s) => ({ ...s, [id]: !s[id] }));
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    setError(null);
    try {
      await post(`/api/matchups/${v.id}/disputes`, { text });
      setText("");
      setNotice(`Posted. It goes to the AI judge for review at ${v.reviewThreshold} votes.`);
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="community" aria-label="Community">
      <div className="community-main">
        <h2>{copy.title}</h2>
        <div className="vote-row">
          <button type="button" className="vote yes" aria-pressed={mine === "agree"} onClick={() => vote("agree")}>
            {copy.agree} <small>{fmt(agree)}</small>
          </button>
          <button type="button" className="vote no" aria-pressed={mine === "disagree"} onClick={() => vote("disagree")}>
            {copy.disagree} <small>{fmt(disagree)}</small>
          </button>
        </div>
        {total > 0 && (
          <div className="vote-split" role="img" aria-label={`${agreePct}% agree`}>
            <i className="y" style={{ width: `${agreePct}%` }} />
            <i className="n" style={{ width: `${100 - agreePct}%` }} />
          </div>
        )}
        {v.reviewing && <p className="review-banner">The AI judge is reviewing this fight now. Refresh in a minute for the ruling.</p>}

        <h3 className="disputes-title">{copy.disputes}</h3>
        {v.disputes.length === 0 && <p className="empty-note">No arguments yet. If you think the verdict is wrong, make your case below.</p>}
        <ul className="disputes">
          {v.disputes.map((d) => {
            const shown = d.votes - (d.mine ? 1 : 0) + (voted[d.id] ? 1 : 0);
            return (
              <li key={d.id} className="dispute">
                <button type="button" className="upvote" aria-pressed={Boolean(voted[d.id])} onClick={() => upvote(d.id)} aria-label={`Upvote, ${shown} votes`} disabled={d.status !== "open"}>
                  <svg viewBox="0 0 16 16" aria-hidden="true">
                    <path d="M8 2 14 10H2Z" fill="currentColor" />
                  </svg>
                  {shown}
                </button>
                <div className="dispute-body">
                  <q>{d.text}</q>
                  <span className="dispute-status">
                    {STATUS[d.status] ?? d.status}
                    {d.status === "open" && ` · ${Math.max(0, v.reviewThreshold - shown)} more votes for review`}
                    {d.own && " · yours"}
                  </span>
                  {d.reply && (
                    <div className="dispute-reply">
                      <b>{copy.reply}:</b> {d.reply}
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
        <form className="dispute-form" onSubmit={submit}>
          <label htmlFor="dispute-text" className="sr-only">
            Your argument
          </label>
          <textarea id="dispute-text" rows={2} maxLength={600} placeholder={copy.placeholder} value={text} onChange={(e) => setText(e.target.value)} />
          <button type="submit" disabled={sending || text.trim().length < 15}>
            {sending ? "Posting…" : "Post"}
          </button>
        </form>
        {notice && <p className="form-note" role="status">{notice}</p>}
        {error && <p className="form-error" role="alert">{error}</p>}
      </div>

      <aside className="community-side">
        <div className="history">
          <h3>{copy.history}</h3>
          <ol>
            {v.history.map((h) => (
              <li key={h.version}>
                <b>v{h.version}</b>
                <div>
                  {h.note}
                  {h.winnerChanged && <em> Winner changed.</em>}
                  <span>{h.date}</span>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <div className="animate-card">
          <span className="soon">LATER</span>
          <h3>Watch it happen</h3>
          <p>Turn this fight into a 30-second animated replay with faceless 3D fighters.</p>
          <button type="button" disabled>
            Animate this fight
          </button>
        </div>
      </aside>
    </section>
  );
}
