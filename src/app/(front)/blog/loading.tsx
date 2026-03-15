
export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <header className="mb-10 text-center animate-pulse">
        <div className="h-10 w-48 bg-gray-200 rounded-lg mx-auto mb-4"></div>
        <div className="h-4 w-64 bg-gray-100 rounded mx-auto"></div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-sm border overflow-hidden flex flex-col animate-pulse">
            <div className="h-48 w-full bg-gray-200"></div>
            <div className="p-6 flex-1 flex flex-col gap-3">
              <div className="flex gap-2">
                <div className="h-3 w-16 bg-gray-100 rounded"></div>
                <div className="h-3 w-16 bg-gray-100 rounded"></div>
              </div>
              <div className="h-6 w-full bg-gray-200 rounded"></div>
              <div className="h-6 w-3/4 bg-gray-200 rounded"></div>
              <div className="mt-4 h-10 w-full bg-gray-100 rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
