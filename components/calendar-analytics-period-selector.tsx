"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function CalendarAnalyticsPeriodSelector() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const period = searchParams.get("period") || "7d";

  const handlePeriodChange = (newPeriod: string) => {
    router.push(`${pathname}?period=${newPeriod}`);
  };

  return (
    <Select value={period} onValueChange={handlePeriodChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="24h">Siste 24 timer</SelectItem>
        <SelectItem value="7d">Siste 7 dager</SelectItem>
        <SelectItem value="30d">Siste 30 dager</SelectItem>
        <SelectItem value="90d">Siste 90 dager</SelectItem>
        <SelectItem value="all">Alle tid</SelectItem>
      </SelectContent>
    </Select>
  );
}
