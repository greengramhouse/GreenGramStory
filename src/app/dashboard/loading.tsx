export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-6 w-32 bg-gray-200 rounded-lg"></div>
          <div className="h-4 w-48 bg-gray-100 rounded-lg"></div>
        </div>
        <div className="w-10 h-10 bg-gray-100 rounded-xl"></div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-6 space-y-6">
        <div className="space-y-2">
          <div className="h-4 w-24 bg-gray-200 rounded-lg"></div>
          <div className="h-10 w-full bg-gray-50 rounded-xl"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 w-20 bg-gray-200 rounded-lg"></div>
          <div className="h-64 w-full bg-gray-50 rounded-xl"></div>
        </div>
      </div>
    </div>
  );
}
