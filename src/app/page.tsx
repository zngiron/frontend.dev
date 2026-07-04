import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { SITE_NAME } from '@/lib/constants';

export default function Home() {
  return (
    <main className="flex min-h-dvh items-center justify-center p-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">{SITE_NAME}</CardTitle>
          <CardDescription>
            Lean Next.js starter. The rules live in CLAUDE.md.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-3">
          <Button>Get started</Button>
          <Button variant="outline">Read the docs</Button>
        </CardContent>
      </Card>
    </main>
  );
}
