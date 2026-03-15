
export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse">
      {/* Back Button Skeleton */}
      <div className="h-4 w-32 bg-gray-200 rounded mb-8"></div>

      {/* Image Skeleton */}
      <div className="w-full h-[400px] bg-gray-200 rounded-2xl mb-8"></div>

      {/* Title & Meta Skeleton */}
      <header className="mb-8 border-b pb-8">
        <div className="h-12 w-3/4 bg-gray-200 rounded mb-4"></div>
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-full bg-gray-200"></div>
          <div className="h-4 w-24 bg-gray-100 rounded"></div>
          <div className="h-4 w-4 bg-gray-100 rounded-full"></div>
          <div className="h-4 w-32 bg-gray-100 rounded"></div>
        </div>
      </header>

      {/* Content Skeleton */}
      <div className="space-y-4">
        <div className="h-4 w-full bg-gray-100 rounded"></div>
        <div className="h-4 w-full bg-gray-100 rounded"></div>
        <div className="h-4 w-5/6 bg-gray-100 rounded"></div>
        <div className="h-4 w-full bg-gray-100 rounded"></div>
        <div className="h-4 w-4/5 bg-gray-100 rounded"></div>
      </div>
    </div>
  );
}
