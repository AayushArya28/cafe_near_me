// src/components/RatingStars.jsx
export default function RatingStars({ rating = 0, max = 5 }) {
  if (!rating) return <span className="text-sm text-gray-600">No rating</span>;

  const pct = Math.max(0, Math.min(rating / max, 1)) * 100;

  return (
    <span className="inline-flex items-center gap-1" aria-label={`Rating ${rating} of ${max}`}>
      <span className="relative leading-none">
        <span className="text-gray-300">★★★★★</span>
        <span
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${pct}%` }}
        >
          <span className="text-yellow-500">★★★★★</span>
        </span>
      </span>
      <span className="text-xs text-gray-600">{rating.toFixed(1)}</span>
    </span>
  );
}
