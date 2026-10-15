import Link from "next/link";

export default function NotFound() {
  return (
    <div className="not-found">
      <h1>No contest</h1>
      <p>That page doesn&rsquo;t exist. Maybe the fight was called off.</p>
      <Link href="/" className="fight-btn small">
        Book a new fight
      </Link>
    </div>
  );
}
