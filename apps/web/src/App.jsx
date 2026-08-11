import { Navigate, Route, Routes } from 'react-router-dom';

function FoundationPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl items-center px-6">
      <section>
        <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">
          System foundation
        </p>
        <h1 className="mt-2 text-4xl font-bold">
          Automated Recruitment Management System
        </h1>
        <p className="mt-4 text-slate-600"></p>
      </section>
    </main>
  );
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<FoundationPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
