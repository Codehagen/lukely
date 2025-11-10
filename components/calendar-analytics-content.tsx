import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  IconEye,
  IconUsers,
  IconTarget,
  IconClock,
  IconTrendingUp,
  IconDeviceMobile,
  IconDeviceDesktop,
  IconDeviceTablet,
  IconMail,
  IconShare,
  IconExternalLink,
  IconDots,
  IconGift,
  IconClipboard,
  IconAlertTriangle,
  IconArrowDownRight,
  IconArrowUpRight,
} from "@tabler/icons-react";

interface AnalyticsData {
  overview: {
    totalViews: number;
    uniqueVisitors: number;
    totalEntries: number;
    conversionRate: string;
    averageDuration: number;
    returningVisitorRate: string;
  };
  previousOverview: {
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
  benchmarks: {
    conversionPercentile: number;
    conversionMessage: string;
    hasComparisons: boolean;
  };
  alerts: Array<{
    metric: string;
    changePercent: string;
  }>;
}

interface CalendarAnalyticsContentProps {
  data: AnalyticsData;
  showDoorAnalytics?: boolean;
  variant?: "LANDING" | "QUIZ";
}

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

function getPercentChange(current: number, previous: number) {
  if (previous === 0) return null;
  const change = ((current - previous) / previous) * 100;
  return {
    change,
    formatted: `${change >= 0 ? "+" : ""}${change.toFixed(1)}%`,
    isPositive: change >= 0,
  };
}

export function CalendarAnalyticsContent({
  data,
  showDoorAnalytics = true,
  variant = "QUIZ",
}: CalendarAnalyticsContentProps) {
  const totalDeviceViews = data.devices.mobile + data.devices.desktop + data.devices.tablet;
  const totalTraffic = data.trafficSources.direct + data.trafficSources.social +
                      data.trafficSources.email + data.trafficSources.other;
  const isLanding = variant === "LANDING";
  const VariantIcon = isLanding ? IconClipboard : IconGift;
  const variantCopy = isLanding
    ? {
        title: "Landingside",
        description: "En landingsside som samler leads uten daglige luker.",
      }
    : {
        title: "Quiz / kalender",
        description: "En kampanje med daglige luker, spørsmål og premier.",
      };

  const viewsTrend = getPercentChange(data.overview.totalViews, data.previousOverview.totalViews);
  const visitorsTrend = getPercentChange(
    data.overview.uniqueVisitors,
    data.previousOverview.uniqueVisitors
  );
  const entriesTrend = getPercentChange(
    data.overview.totalEntries,
    data.previousOverview.totalEntries
  );
  const avgDurationTrend = getPercentChange(
    data.overview.averageDuration,
    data.previousOverview.averageDuration
  );
  const primaryMetricLabel = isLanding ? "Registrerte leads" : "Deltakelser";

  return (
    <div className="space-y-6">
      <Card className="border-dashed">
        <CardHeader className="flex flex-row items-start gap-3">
          <div className="rounded-full bg-muted p-2">
            <VariantIcon className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-base">{variantCopy.title}</CardTitle>
            <CardDescription>{variantCopy.description}</CardDescription>
          </div>
        </CardHeader>
      </Card>

      {data.alerts.length > 0 && (
        <Card className="border-orange-400/40 bg-orange-50 dark:bg-orange-950/30">
          <CardHeader className="flex flex-row items-start gap-3">
            <IconAlertTriangle className="h-5 w-5 text-orange-500" />
            <div>
              <CardTitle className="text-base">Varsler</CardTitle>
              <CardDescription>Signifikante dropp siden forrige periode</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {data.alerts.map((alert) => (
              <Badge key={alert.metric} variant="destructive" className="flex items-center gap-2">
                <IconArrowDownRight className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">
                  {alert.metric}: {alert.changePercent}% siden sist
                </span>
              </Badge>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totale visninger</CardTitle>
            <IconEye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {data.overview.uniqueVisitors} unike besøkende
            </p>
            {viewsTrend && (
              <p
                className={`mt-2 flex items-center gap-1 text-xs ${
                  viewsTrend.isPositive ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                {viewsTrend.isPositive ? (
                  <IconArrowUpRight className="h-3.5 w-3.5" />
                ) : (
                  <IconArrowDownRight className="h-3.5 w-3.5" />
                )}
                {viewsTrend.formatted} fra forrige periode
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unike besøkende</CardTitle>
            <IconUsers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.uniqueVisitors.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {data.overview.returningVisitorRate}% returnerende
            </p>
            {visitorsTrend && (
              <p
                className={`mt-2 flex items-center gap-1 text-xs ${
                  visitorsTrend.isPositive ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                {visitorsTrend.isPositive ? (
                  <IconArrowUpRight className="h-3.5 w-3.5" />
                ) : (
                  <IconArrowDownRight className="h-3.5 w-3.5" />
                )}
                {visitorsTrend.formatted} fra forrige periode
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{primaryMetricLabel}</CardTitle>
            <IconTarget className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.totalEntries.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {primaryMetricLabel} i perioden · {data.overview.conversionRate}% konvertering
            </p>
            {entriesTrend && (
              <p
                className={`mt-2 flex items-center gap-1 text-xs ${
                  entriesTrend.isPositive ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                {entriesTrend.isPositive ? (
                  <IconArrowUpRight className="h-3.5 w-3.5" />
                ) : (
                  <IconArrowDownRight className="h-3.5 w-3.5" />
                )}
                {entriesTrend.formatted} fra forrige periode
              </p>
            )}
            <div className="mt-3">
              <Badge variant="outline" className="text-[11px] font-medium">
                {data.benchmarks.conversionMessage}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gjennomsnittlig tid</CardTitle>
            <IconClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDuration(data.overview.averageDuration)}
            </div>
            <p className="text-xs text-muted-foreground">
              Per besøk
            </p>
            {avgDurationTrend && (
              <p
                className={`mt-2 flex items-center gap-1 text-xs ${
                  avgDurationTrend.isPositive ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                {avgDurationTrend.isPositive ? (
                  <IconArrowUpRight className="h-3.5 w-3.5" />
                ) : (
                  <IconArrowDownRight className="h-3.5 w-3.5" />
                )}
                {avgDurationTrend.formatted} fra forrige periode
              </p>
            )}
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
                <IconDeviceMobile className="h-4 w-4 text-muted-foreground" />
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
                <IconDeviceDesktop className="h-4 w-4 text-muted-foreground" />
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
                <IconDeviceTablet className="h-4 w-4 text-muted-foreground" />
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
                <IconExternalLink className="h-4 w-4 text-muted-foreground" />
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
                <IconShare className="h-4 w-4 text-muted-foreground" />
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
                <IconMail className="h-4 w-4 text-muted-foreground" />
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
                <IconDots className="h-4 w-4 text-muted-foreground" />
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
      {showDoorAnalytics && data.topPerformers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconTrendingUp className="h-5 w-5" />
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
      {showDoorAnalytics && (
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
      )}
    </div>
  );
}
