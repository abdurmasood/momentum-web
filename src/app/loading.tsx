export default function Loading() {
  // Stack uses React Suspense, which will render this page while user data is being fetched.
  // See: https://nextjs.org/docs/app/api-reference/file-conventions/loading
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto border-3 border-blue-500 border-t-transparent rounded-full animate-spin mb-6"></div>
        <h2 className="text-xl font-light text-slate-100 mb-2">
          Loading <span className="font-medium italic instrument">Momentum</span>
        </h2>
        <p className="text-sm text-slate-300 font-light">
          Preparing your experience...
        </p>
      </div>
    </div>
  );
}
