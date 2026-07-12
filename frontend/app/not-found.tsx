import Link from "next/link";
import { ROUTES } from "@/libs/constant";

const NotFound = () => (
  <div className="flex h-screen w-full flex-col items-center justify-center gap-4">
    <h1 className="text-3xl font-bold text-gray-800">404 — Page Not Found</h1>
    <p className="text-gray-500">The page you&apos;re looking for doesn&apos;t exist.</p>
    <Link
      href={ROUTES.HOME}
      className="rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
    >
      Return Home
    </Link>
  </div>
);

export default NotFound;
