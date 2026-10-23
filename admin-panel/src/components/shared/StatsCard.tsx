import { Users, Calendar, CheckCircle2, IndianRupee } from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  users: <Users size={20} className="text-blue-600" />,
  calendar: <Calendar size={20} className="text-blue-600" />,
  check: <CheckCircle2 size={20} className="text-blue-600" />,
  rupee: <IndianRupee size={20} className="text-blue-600" />,
};

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
}

export function StatsCard({
  title,
  value,
  icon,
  change,
  changeType = "neutral",
}: StatsCardProps) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-zinc-500">{title}</p>
          <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-white">
            {value}
          </p>
          {change && (
            <p
              className={`mt-1 text-xs font-medium ${
                changeType === "positive"
                  ? "text-green-600"
                  : changeType === "negative"
                    ? "text-red-600"
                    : "text-zinc-500"
              }`}
            >
              {change}
            </p>
          )}
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/20">
          {iconMap[icon]}
        </div>
      </div>
    </div>
  );
}
