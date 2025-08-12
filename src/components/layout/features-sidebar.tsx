'use client';

import { useState } from 'react';
import { 
  Car, 
  Filter, 
  Star, 
  TrendingUp, 
  Clock, 
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useLanguage } from '@/lib/language-context';

interface FeaturesSidebarProps {
  isVisible: boolean;
  onQuickAction?: (action: string) => void;
  onFilterChange?: (filterType: string, value: any) => void;
  onClearFilters?: () => void;
  quickActionCounts?: {
    featured: number;
    newArrivals: number;
    specialOffers: number;
    recentlyViewed: number;
  };
}

export default function FeaturesSidebar({ isVisible, onQuickAction, onFilterChange, onClearFilters, quickActionCounts }: FeaturesSidebarProps) {
  const { t } = useLanguage();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    priceRange: [0, 100000],
    yearRange: [1990, 2024],
    bodyStyle: '',
    fuelType: ''
  });

  const defaultFilters = {
    priceRange: [0, 100000],
    yearRange: [1990, 2024],
    bodyStyle: '',
    fuelType: ''
  };

  const bodyStyles = [
    'Sedan', 'SUV', 'Truck', 'Coupe', 'Convertible', 'Wagon', 'Hatchback', 'Minivan'
  ];

  const fuelTypes = ['Gasoline', 'Electric'];

  const handleQuickAction = (action: string) => {
    if (onQuickAction) {
      onQuickAction(action);
    }
  };

  const handleFilterChange = (filterType: string, value: any) => {
    const newFilters = { ...filters, [filterType]: value };
    setFilters(newFilters);
    if (onFilterChange) {
      onFilterChange(filterType, value);
    }
  };

  const handleClearFilters = () => {
    setFilters(defaultFilters);
    if (onClearFilters) {
      onClearFilters();
    }
  };

  const features = [
    {
      id: 'quick-actions',
      title: t('common.quickActions'),
      icon: Zap,
      items: [
        { label: t('inventory.featured'), icon: Star, count: quickActionCounts?.featured || 0, action: 'featured' },
        { label: t('inventory.newArrivals'), icon: Car, count: quickActionCounts?.newArrivals || 0, action: 'newArrivals' },
        { label: t('inventory.specialOffers'), icon: TrendingUp, count: quickActionCounts?.specialOffers || 0, action: 'specialOffers' },
        { label: t('inventory.recentlyViewed'), icon: Clock, count: quickActionCounts?.recentlyViewed || 0, action: 'recentlyViewed' }
      ]
    },
    {
      id: 'filters',
      title: t('common.filters'),
      icon: Filter,
      items: [
        { label: t('inventory.priceRange'), icon: TrendingUp, count: null, type: 'priceRange' },
        { label: t('inventory.yearRange'), icon: Clock, count: null, type: 'yearRange' },
        { label: t('inventory.bodyStyle'), icon: Car, count: null, type: 'bodyStyle' },
        { label: t('inventory.fuelType'), icon: Zap, count: null, type: 'fuelType' }
      ]
    }
  ];

  return (
    <div 
      className={`fixed left-0 top-0 h-full w-80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-r border-border shadow-xl transition-transform duration-300 ease-in-out z-50 ${
        isVisible ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <Car className="h-8 w-8 text-primary" />
            <div>
              <h2 className="text-xl font-bold">{t('common.features')}</h2>
              <p className="text-sm text-muted-foreground">Quick access to tools & services</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {features.map((section) => (
            <div key={section.id} className="space-y-3">
              <div className="flex items-center space-x-2">
                <section.icon className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-sm">{section.title}</h3>
              </div>
              
              <div className="space-y-2">
                {section.items.map((item, index) => (
                  <div key={index}>
                    {item.action ? (
                      // Quick Action Items
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start h-auto p-3 hover:bg-accent"
                        onClick={() => handleQuickAction(item.action!)}
                      >
                        <div className="flex items-center space-x-3 w-full">
                          <item.icon className="h-4 w-4 text-muted-foreground" />
                          <span className="flex-1 text-left">{item.label}</span>
                          {item.count !== null && (
                            <Badge variant="secondary" className="ml-auto">
                              {item.count}
                            </Badge>
                          )}
                        </div>
                      </Button>
                    ) : (
                      // Filter Items
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <item.icon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{item.label}</span>
                        </div>
                        
                        {item.type === 'priceRange' && (
                          <div className="px-2">
                            <Slider
                              value={filters.priceRange}
                              onValueChange={(value) => handleFilterChange('priceRange', value)}
                              max={100000}
                              min={0}
                              step={1000}
                              className="w-full"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground mt-1">
                              <span>${filters.priceRange[0].toLocaleString()}</span>
                              <span>${filters.priceRange[1].toLocaleString()}</span>
                            </div>
                          </div>
                        )}
                        
                        {item.type === 'yearRange' && (
                          <div className="px-2">
                            <Slider
                              value={filters.yearRange}
                              onValueChange={(value) => handleFilterChange('yearRange', value)}
                              max={2024}
                              min={1990}
                              step={1}
                              className="w-full"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground mt-1">
                              <span>{filters.yearRange[0]}</span>
                              <span>{filters.yearRange[1]}</span>
                            </div>
                          </div>
                        )}
                        
                        {item.type === 'bodyStyle' && (
                          <div className="relative mb-4">
                            <Select value={filters.bodyStyle} onValueChange={(value) => handleFilterChange('bodyStyle', value)}>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select body style" />
                              </SelectTrigger>
                              <SelectContent 
                                className="w-full min-w-[200px]" 
                                position="popper"
                                side="right"
                                align="start"
                                sideOffset={8}
                              >
                                {bodyStyles.map((style) => (
                                  <SelectItem key={style} value={style}>
                                    {style}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                        
                        {item.type === 'fuelType' && (
                          <div className="flex flex-wrap gap-2">
                            {fuelTypes.map((fuel) => (
                              <Button
                                key={fuel}
                                variant={filters.fuelType === fuel ? "default" : "outline"}
                                size="sm"
                                onClick={() => handleFilterChange('fuelType', fuel)}
                                className="text-xs"
                              >
                                {fuel}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        {/* Clear Filters Button */}
        {onClearFilters && (
          <div className="p-4 border-t border-border">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleClearFilters}
              className="w-full"
            >
              {t('common.clearFilters')}
            </Button>
          </div>
        )}

        {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-2">
            {t('common.hoverToShow')}
          </p>
          <div className="flex justify-center">
            <div className="w-16 h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent rounded-full"></div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
