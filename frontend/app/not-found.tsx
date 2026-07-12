import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/libs/constant";

const NotFound = () => (
  <div className="flex h-screen w-full flex-col items-center justify-center gap-4">
    <h1 className="text-3xl font-bold text-foreground">404 — Page Not Found</h1>
    <p className="text-muted-foreground">The page you&apos;re looking for doesn&apos;t exist.</p>
    <Button render={<Link href={ROUTES.HOME} />} nativeButton={false}>
      Return Home
    </Button>
  </div>
);

export default NotFound;
