import { LoadingSkeleton } from "@/components/LoadingSkeleton";

export default function Loading() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <LoadingSkeleton />
    </main>
  );
}

