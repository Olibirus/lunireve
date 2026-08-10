/** Shimmer skeleton shown while a story page loads. */
export default function StoryLoading() {
  return (
    <div>
      <div className="skeleton h-[60svh] w-full md:h-[72svh]" />
      <div className="relative z-10 mx-auto -mt-7 max-w-3xl px-5 md:px-8">
        <div className="skeleton h-36 rounded-3xl" />
      </div>
      <div className="mx-auto max-w-4xl px-5 md:px-8 py-10 md:py-14">
        <div className="mx-auto max-w-[74ch] space-y-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="skeleton h-4 rounded-full"
              style={{ width: `${[96, 88, 92, 70, 84, 90, 76, 94, 60][i]}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
