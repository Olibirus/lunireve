import { StoryGridSkeleton } from "@/components/story/StorySkeleton";

/** Shimmer skeleton shown while the library page loads. */
export default function LibraryLoading() {
  return (
    <div className="mx-auto max-w-[96rem] px-5 md:px-8 pt-8 md:pt-12 pb-16">
      <div className="skeleton h-10 w-72 max-w-full rounded-2xl" />
      <div className="skeleton mt-4 h-4 w-[28rem] max-w-full rounded-full" />
      <div className="skeleton mt-6 h-11 w-full max-w-md rounded-xl" />
      <div className="mt-10">
        <StoryGridSkeleton count={9} />
      </div>
    </div>
  );
}
