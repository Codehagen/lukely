"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Eye,
  Users,
  Target,
  Clock,
  TrendingUp,
  Smartphone,
  Monitor,
  Tablet,
  Mail,
  Share2,
  ExternalLink,
  MoreHorizontal
} from "lucide-react";

interface AnalyticsData {
  overview: {
    totalViews: number;
    uniqueVisitors: number;
    totalEntries: number;
    conversionRate: string;
    averageDuration: number;
    returningVisitorRate: string;
  };
  devices: {
    mobile: number;
    desktop: number;
    tablet: number;
  };
  trafficSources: {
    direct: number;
    social: number;
    email: number;
    other: number;
  };
  timeline: Array<{
    date: Date;
    views: number;
    visitors: number;
    entries: number;
  }>;
  doorPerformance: Array<{
    doorNumber: number;
    productName: string;
    totalViews: number;
    clicks: number;
    entries: number;
    clickRate: string;
    conversionRate: string;
  }>;
  topPerformers: Array<{
    doorNumber: number;
    productName: string;
    entries: number;
  }>;
}

interface CalendarAnalyticsProps {
  calendarId: string;
}

export function CalendarAnalytics({ calendarId }: CalendarAnalyticsProps) {
  const [period, setPeriod] = useState("7d");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/calendars/${calendarId}/analytics?period=${period}`);
        const analyticsData = await response.json();
        setData(analyticsData);
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAnalytics();
  }, [calendarId, period]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Ingen data tilgjengelig</p>
      </div>
    );
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const totalDeviceViews = data.devices.mobile + data.devices.desktop + data.devices.tablet;
  const totalTraffic = data.trafficSources.direct + data.trafficSources.social +
                      data.trafficSources.email + data.trafficSources.other;

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Analyser</h3>
          <p className="text-sm text-muted-foreground">
            Detaljert innsikt i kampanjens ytelse
          </p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
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
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totale visninger</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {data.overview.uniqueVisitors} unike besøkende
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unike besøkende</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.uniqueVisitors.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {data.overview.returningVisitorRate}% returnerende
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Konverteringsrate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.conversionRate}%</div>
            <p className="text-xs text-muted-foreground">
              {data.overview.totalEntries} totale deltakelser
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gjennomsnittlig tid</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDuration(data.overview.averageDuration)}
            </div>
            <p className="text-xs text-muted-foreground">
              Per besøk
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Device & Traffic Breakdown */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Enheter</CardTitle>
            <CardDescription>Fordeling av visninger etter enhetstype</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Mobil</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {totalDeviceViews > 0
                    ? ((data.devices.mobile / totalDeviceViews) * 100).toFixed(1)
                    : "0"}%
                </span>
                <span className="text-sm font-medium">{data.devices.mobile}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Monitor className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Desktop</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {totalDeviceViews > 0
                    ? ((data.devices.desktop / totalDeviceViews) * 100).toFixed(1)
                    : "0"}%
                </span>
                <span className="text-sm font-medium">{data.devices.desktop}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tablet className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Nettbrett</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {totalDeviceViews > 0
                    ? ((data.devices.tablet / totalDeviceViews) * 100).toFixed(1)
                    : "0"}%
                </span>
                <span className="text-sm font-medium">{data.devices.tablet}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Trafikkkilder</CardTitle>
            <CardDescription>Hvor besøkende kommer fra</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Direkte</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {totalTraffic > 0
                    ? ((data.trafficSources.direct / totalTraffic) * 100).toFixed(1)
                    : "0"}%
                </span>
                <span className="text-sm font-medium">{data.trafficSources.direct}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Share2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Sosiale medier</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {totalTraffic > 0
                    ? ((data.trafficSources.social / totalTraffic) * 100).toFixed(1)
                    : "0"}%
                </span>
                <span className="text-sm font-medium">{data.trafficSources.social}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">E-post</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {totalTraffic > 0
                    ? ((data.trafficSources.email / totalTraffic) * 100).toFixed(1)
                    : "0"}%
                </span>
                <span className="text-sm font-medium">{data.trafficSources.email}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Annet</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {totalTraffic > 0
                    ? ((data.trafficSources.other / totalTraffic) * 100).toFixed(1)
                    : "0"}%
                </span>
                <span className="text-sm font-medium">{data.trafficSources.other}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      {data.topPerformers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Topp 5 luker
            </CardTitle>
            <CardDescription>Luker med flest deltakelser</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.topPerformers.map((door, index) => (
                <div key={door.doorNumber} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                      {index + 1}
                    </Badge>
                    <div>
                      <p className="text-sm font-medium">Luke {door.doorNumber}</p>
                      <p className="text-xs text-muted-foreground">{door.productName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{door.entries} deltakelser</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Door Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Luke-ytelse</CardTitle>
          <CardDescription>Detaljert oversikt over hver luke</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Luke</TableHead>
                <TableHead>Produkt</TableHead>
                <TableHead className="text-right">Visninger</TableHead>
                <TableHead className="text-right">Klikk</TableHead>
                <TableHead className="text-right">Klikk-rate</TableHead>
                <TableHead className="text-right">Deltakelser</TableHead>
                <TableHead className="text-right">Konvertering</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.doorPerformance.map((door) => (
                <TableRow key={door.doorNumber}>
                  <TableCell className="font-medium">Luke {door.doorNumber}</TableCell>
                  <TableCell>{door.productName}</TableCell>
                  <TableCell className="text-right">{door.totalViews}</TableCell>
                  <TableCell className="text-right">{door.clicks}</TableCell>
                  <TableCell className="text-right">{door.clickRate}%</TableCell>
                  <TableCell className="text-right">{door.entries}</TableCell>
                  <TableCell className="text-right">{door.conversionRate}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
