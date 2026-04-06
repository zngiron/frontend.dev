import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center gap-4">
      <h1 className="text-2xl font-semibold">Page Not Found</h1>
      <p className="text-muted-foreground">
        The page you are looking for does not exist.
      </p>
      <Link
        href="/"
        className="rounded-lg px-4 py-2 bg-primary text-sm text-primary-foreground transition-colors hover:bg-primary/80"
      >
        Go Home
      </Link>
    </div>
  );
}
