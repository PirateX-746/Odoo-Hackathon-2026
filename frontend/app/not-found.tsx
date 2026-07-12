import Link from "next/link";
import { MapPinOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/libs/constant";

const NotFound = () => (
  <div className="flex h-screen w-full flex-col items-center justify-center gap-4 text-center">
    <MapPinOff className="text-muted-foreground size-8" />
    <h1 className="text-foreground text-2xl font-semibold">Page not found</h1>
    <p className="text-muted-foreground max-w-md text-sm">
      The page you&apos;re looking for doesn&apos;t exist.
    </p>
    <Button render={<Link href={ROUTES.HOME} />} nativeButton={false}>
      Return home
    </Button>
  </div>
);

export default NotFound;
