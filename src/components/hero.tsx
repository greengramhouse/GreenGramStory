import { ArrowUpRight, CirclePlay } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type propsHero = {
  version: string;
  title: string;
  pretitle: string;
  btnLink: string;
  btnsecondary: boolean;
  btnText: string;
};

export default function Hero({
  version,
  title,
  pretitle,
  btnLink,
  btnsecondary,
  btnText,
}: propsHero) {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-3xl text-center">
        <Badge
          asChild
          className="rounded-full border-border py-1"
          variant="secondary"
        >
          <Link href="#">
            {version} <ArrowUpRight className="ml-1 size-4" />
          </Link>
        </Badge>
        <h1 className="mt-6 font-semibold text-4xl tracking-tighter sm:text-5xl md:text-6xl md:leading-[1.2] lg:text-7xl">
          {title}
        </h1>
        <p className="mt-6 text-foreground/80 md:text-lg">{pretitle}</p>
        <div className="mt-12 flex items-center justify-center gap-4">
          <Link href={btnLink}>
            <Button className="rounded-full text-base" size="lg">
              {btnText} <ArrowUpRight className="size-5" />
            </Button>
          </Link>
          {btnsecondary && (
            <Button
              className="rounded-full text-base shadow-none"
              size="lg"
              variant="outline"
            >
              <CirclePlay className="size-5" /> Watch Demo
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
