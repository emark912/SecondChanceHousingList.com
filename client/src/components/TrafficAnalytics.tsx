import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TrafficStats {
  totalViews: number;
  uniqueVisitors: number;
  viewsByPage: Array<{
    pagePath: string;
    pageTitle: string;
    views: number;
  }>;
  trafficByDevice: Array<{
    deviceType: string;
    views: number;
  }>;
  topEvents: Array<{
    eventName: string;
    eventType: string;
    count: number;
  }>;
  dateRange: {
    start: string;
    end: string;
  };
}

const COLORS = ['#0891b2', '#06b6d4', '#22d3ee', '#67e8f9', '#cffafe'];
const DEVICE_COLORS = {
  desktop: '#0891b2',
  mobile: '#06b6d4',
  tablet: '#22d3ee',
};

interface TrafficAnalyticsProps {
  stats: TrafficStats;
  isLoading?: boolean;
}

export function TrafficAnalytics({ stats, isLoading }: TrafficAnalyticsProps) {
  const [timeRange, setTimeRange] = useState<7 | 30 | 90>(7);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-20 bg-muted animate-pulse rounded-lg" />
        <div className="h-64 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  const avgViewsPerVisitor = stats.uniqueVisitors > 0 
    ? (stats.totalViews / stats.uniqueVisitors).toFixed(2)
    : '0';

  const pageViewsData = stats.viewsByPage.slice(0, 5).map(page => ({
    name: page.pageTitle || page.pagePath.split('/')[1] || 'Home',
    views: page.views,
  }));

  const deviceData = stats.trafficByDevice.map(device => ({
    name: device.deviceType?.charAt(0).toUpperCase() + device.deviceType?.slice(1) || 'Unknown',
    value: device.views,
  }));

  const eventsData = stats.topEvents.slice(0, 5).map(event => ({
    name: event.eventName,
    count: event.count,
  }));

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex gap-2">
        <Button
          variant={timeRange === 7 ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTimeRange(7)}
        >
          7 Days
        </Button>
        <Button
          variant={timeRange === 30 ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTimeRange(30)}
        >
          30 Days
        </Button>
        <Button
          variant={timeRange === 90 ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTimeRange(90)}
        >
          90 Days
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Page Views
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Last {timeRange} days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Unique Visitors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.uniqueVisitors.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Unique sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Views/Visitor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{avgViewsPerVisitor}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Pages per session
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Top Device
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {deviceData.length > 0 ? deviceData[0].name : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Most used device
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Page Views Chart */}
      {pageViewsData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Pages</CardTitle>
            <CardDescription>Most viewed pages in the last {timeRange} days</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={pageViewsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="views" fill="#0891b2" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Device Distribution */}
      {deviceData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Traffic by Device</CardTitle>
            <CardDescription>Device type distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={deviceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }) => 
                    `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {deviceData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={DEVICE_COLORS[entry.name.toLowerCase() as keyof typeof DEVICE_COLORS] || COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Top Events */}
      {eventsData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Events</CardTitle>
            <CardDescription>Most tracked user interactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {eventsData.map((event, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{event.name}</span>
                  <span className="text-sm text-muted-foreground">{event.count} events</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Data Message */}
      {stats.totalViews === 0 && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No traffic data available for the selected period.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
