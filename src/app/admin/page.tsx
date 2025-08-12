'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { CarForm } from '@/components/admin/car-form';
import { CarGrid } from '@/components/admin/car-grid';
import { CarSpecsLookup } from '@/components/admin/car-specs-lookup';
import { ThemeLanguageDemo } from '@/components/ui/theme-language-demo';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, Car, Info, AlertCircle, CheckCircle } from 'lucide-react';

interface QuickActionCounts {
  featured: number;
  newArrivals: number;
  specialOffers: number;
  recentlyViewed: number;
  totalAvailable: number;
}

export default function AdminDashboard() {
  const [counts, setCounts] = useState<QuickActionCounts>({
    featured: 0,
    newArrivals: 0,
    specialOffers: 0,
    recentlyViewed: 0,
    totalAvailable: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isSpecsDialogOpen, setIsSpecsDialogOpen] = useState(false);

  useEffect(() => {
    fetchCounts();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchCounts();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const fetchCounts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/quick-actions/counts');
      if (response.ok) {
        const data = await response.json();
        // Only include the counts we want to display
        setCounts({
          featured: data.featured || 0,
          newArrivals: data.newArrivals || 0,
          specialOffers: data.specialOffers || 0,
          recentlyViewed: data.recentlyViewed || 0,
          totalAvailable: data.totalAvailable || 0
        });
        setLastUpdated(new Date());
        toast.success('Dashboard data refreshed successfully!');
      } else {
        throw new Error('Failed to fetch counts');
      }
    } catch (error) {
      console.error('Error fetching counts:', error);
      toast.error('Failed to fetch car statistics');
    } finally {
      setIsLoading(false);
    }
  };

  const formatLastUpdated = (date: Date | null) => {
    if (!date) return 'Never';
    return date.toLocaleString();
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex items-center gap-4">
          <Button 
            onClick={async () => {
              await new Promise(resolve => setTimeout(resolve, 100));
              fetchCounts();
            }}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            {isLoading ? 'Refreshing...' : 'Refresh Data'}
          </Button>
          <Button 
            onClick={async () => {
              await new Promise(resolve => setTimeout(resolve, 100));
              setAutoRefresh(!autoRefresh);
            }}
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
          >
            {autoRefresh ? 'Auto-Refresh On' : 'Auto-Refresh Off'}
          </Button>
          <div className="text-sm text-muted-foreground">
            Last updated: {formatLastUpdated(lastUpdated)}
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="add-car">Add Car</TabsTrigger>
          <TabsTrigger value="manage-cars">Manage Cars</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Available</CardTitle>
                <span className="text-2xl">🚗</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? '...' : counts.totalAvailable}
                </div>
                <p className="text-xs text-muted-foreground">Cars in inventory</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Featured Vehicles</CardTitle>
                <span className="text-2xl">⭐</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? '...' : counts.featured}
                </div>
                <p className="text-xs text-muted-foreground">Currently featured</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">New Arrivals</CardTitle>
                <span className="text-2xl">🆕</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? '...' : counts.newArrivals}
                </div>
                <p className="text-xs text-muted-foreground">Recently added</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Special Offers</CardTitle>
                <span className="text-2xl">🏷️</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? '...' : counts.specialOffers}
                </div>
                <p className="text-xs text-muted-foreground">Active offers</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recently Active</CardTitle>
                <span className="text-2xl">👁️</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? '...' : counts.recentlyViewed}
                </div>
                <p className="text-xs text-muted-foreground">Last 7 days</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">NHTSA Specs Lookup</CardTitle>
                <span className="text-2xl">🔍</span>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Auto-fetch car specifications from NHTSA database
                </p>
                <Dialog open={isSpecsDialogOpen} onOpenChange={setIsSpecsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full" variant="outline">
                      <Car className="w-4 h-4 mr-2" />
                      Auto Fetch Specs from NHTSA
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Car Specifications Lookup</DialogTitle>
                      <p className="text-sm text-muted-foreground">
                        Fetch detailed car specifications from the NHTSA vPIC database
                      </p>
                    </DialogHeader>
                    <CarSpecsLookup />
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Use the tabs above to manage your inventory, add new cars, and view detailed statistics.
              </p>
              <div className="flex gap-2">
                <Button onClick={async () => {
                  await new Promise(resolve => setTimeout(resolve, 100));
                  (document.querySelector('[data-value="add-car"]') as HTMLElement)?.click();
                }}>
                  Add New Car
                </Button>
                <Button variant="outline" onClick={async () => {
                  await new Promise(resolve => setTimeout(resolve, 100));
                  (document.querySelector('[data-value="manage-cars"]') as HTMLElement)?.click();
                }}>
                  View All Cars
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add-car" className="space-y-6">
          <CarForm onCarAdded={fetchCounts} />
        </TabsContent>

        <TabsContent value="manage-cars" className="space-y-6">
          <CarGrid onCarUpdated={fetchCounts} />
        </TabsContent>

        <TabsContent value="statistics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Real-Time Car Statistics</CardTitle>
              <p className="text-sm text-muted-foreground">
                These statistics are automatically calculated from your current car inventory and update in real-time.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Inventory Status</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <span className="font-medium">Total Available</span>
                      <span className="text-2xl font-bold text-blue-600">
                        {isLoading ? '...' : counts.totalAvailable}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <span className="font-medium">Featured</span>
                      <span className="text-2xl font-bold text-yellow-600">
                        {isLoading ? '...' : counts.featured}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <span className="font-medium">New Arrivals</span>
                      <span className="text-2xl font-bold text-green-600">
                        {isLoading ? '...' : counts.newArrivals}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <span className="font-medium">Special Offers</span>
                      <span className="text-2xl font-bold text-purple-600">
                        {isLoading ? '...' : counts.specialOffers}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Activity Status</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <span className="font-medium">Recently Active</span>
                      <span className="text-2xl font-bold text-blue-600">
                        {isLoading ? '...' : counts.recentlyViewed}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <span className="font-medium">Total Cars</span>
                      <span className="text-2xl font-bold text-gray-600">
                        {isLoading ? '...' : counts.totalAvailable}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Data automatically refreshes when you navigate between tabs or use the refresh button.
                  </p>
                  <Button onClick={async () => {
                    await new Promise(resolve => setTimeout(resolve, 100));
                    fetchCounts();
                  }} disabled={isLoading} size="sm">
                    {isLoading ? 'Refreshing...' : 'Refresh Now'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Theme & Language Settings</CardTitle>
              <p className="text-sm text-muted-foreground">
                Your website automatically detects your device's theme and language preferences. You can also manually override these settings.
              </p>
            </CardHeader>
            <CardContent>
              <ThemeLanguageDemo />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}