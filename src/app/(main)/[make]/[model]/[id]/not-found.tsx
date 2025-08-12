import { Car, Search, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="mb-8">
          <Car className="h-24 w-24 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-6xl font-bold text-muted-foreground mb-2">404</h1>
          <h2 className="text-2xl font-semibold mb-4">Car Not Found</h2>
          <p className="text-muted-foreground mb-8">
            Sorry, we couldn't find the vehicle you're looking for. It may have been sold or removed from our inventory.
          </p>
        </div>
        
        <div className="space-y-4">
          <Button asChild size="lg" className="w-full">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Homepage
            </Link>
          </Button>
          
          <Button asChild variant="outline" size="lg" className="w-full">
            <Link href="/inventory">
              <Search className="mr-2 h-4 w-4" />
              Browse All Vehicles
            </Link>
          </Button>
        </div>
        
        <div className="mt-8 p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            Looking for a specific vehicle? Contact our sales team at{' '}
            <a href="tel:555-123-4567" className="font-medium text-primary hover:underline">
              (555) 123-4567
            </a>{' '}
            and we'll help you find what you're looking for.
          </p>
        </div>
      </div>
    </div>
  );
}