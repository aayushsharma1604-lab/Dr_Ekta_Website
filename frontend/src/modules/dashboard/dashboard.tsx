import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LogoutButton from "@/shared/components/LogoutButton";

export function Dashboard() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <Card className="w-full max-w-md">
        <CardHeader><CardTitle>Dashboard</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-zinc-600 dark:text-zinc-400">This is a protected route. Only authenticated users can see this.</p>
          <LogoutButton />
        </CardContent>
      </Card>
    </div>
  );
}
