import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page py-32 text-center">
      <p className="font-head font-extrabold uppercase text-pink text-7xl md:text-9xl leading-none">
        404
      </p>
      <h1 className="section-title mt-6 mb-4">This page wandered off</h1>
      <p className="text-muted max-w-md mx-auto mb-8">
        The story you&apos;re after isn&apos;t here — it may have moved or never
        existed. Here&apos;s the way back.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
        <Link href="/" className="meta text-pink hover:underline">
          Home →
        </Link>
        <Link href="/issues" className="meta text-pink hover:underline">
          Issues →
        </Link>
        <Link href="/about" className="meta text-pink hover:underline">
          About →
        </Link>
      </div>
    </div>
  );
}
