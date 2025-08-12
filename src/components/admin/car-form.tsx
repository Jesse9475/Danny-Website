'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Car, Upload, X } from 'lucide-react';

interface CarFormProps {
  onCarAdded?: () => void;
}

interface CarSpecs {
  make?: string;
  model?: string;
  year?: string | number;
  bodyStyle?: string;
  engine?: string;
  fuelType?: string;
  transmission?: string;
  driveType?: string;
  vehicleType?: string;
  horsepower?: number;
  torque?: number;
  mpgCity?: number;
  mpgHighway?: number;
  mpgCombined?: number;
  acceleration?: number;
  topSpeed?: number;
  fuelCapacity?: number;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  wheelbase?: number;
  groundClearance?: number;
  cargoVolume?: number;
  towingCapacity?: number;
}

export function CarForm({ onCarAdded }: CarFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [specs, setSpecs] = useState<CarSpecs>({});
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isPrimaryImage, setIsPrimaryImage] = useState(0);
  
  const [formData, setFormData] = useState({
    vin: '',
    price: '',
    mileage: '',
    stockNumber: '',
    description: '',
    exteriorColor: '',
    interiorColor: '',
    doors: '',
    passengers: '',
    features: '',
    transmission: '',
    engine: '',
    fuelType: '',
    driveType: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    if (isPrimaryImage >= index && isPrimaryImage > 0) {
      setIsPrimaryImage(prev => prev - 1);
    }
  };

  const fetchSpecs = async () => {
    if (!formData.vin || formData.vin.length !== 17) {
      toast({
        title: 'Invalid VIN',
        description: 'Please enter a valid 17-character VIN',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/cars/specifications?vin=${encodeURIComponent(formData.vin)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.specs) {
        setSpecs(data.specs);
        
        // Pre-populate form fields with fetched specs
        setFormData(prev => ({
          ...prev,
          transmission: data.specs.transmission || '',
          engine: data.specs.engine || '',
          fuelType: data.specs.fuelType || '',
          driveType: data.specs.driveType || ''
        }));
        
        toast({
          title: 'Specifications Found',
          description: `Found specifications for ${data.specs.make} ${data.specs.model} ${data.specs.year}`,
        });
      } else {
        throw new Error('No specifications found for this VIN');
      }
    } catch (error) {
      console.error('Error fetching specs:', error);
      toast({
        title: 'Specifications Lookup Failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!specs.make || !specs.model || !specs.year) {
      toast({
        title: 'Missing Specifications',
        description: 'Please fetch car specifications from VIN before submitting',
        variant: 'destructive'
      });
      return;
    }

    if (!isFormValid()) {
      toast({
        title: 'Form Validation Failed',
        description: 'Please check all required fields and ensure valid data',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);

    try {
      const carResponse = await fetch('/api/cars', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          make: specs.make,
          model: specs.model,
          year: typeof specs.year === 'string' ? parseInt(specs.year) : specs.year,
          price: parseFloat(formData.price),
          mileage: parseInt(formData.mileage),
          doors: formData.doors ? parseInt(formData.doors) : null,
          passengers: formData.passengers ? parseInt(formData.passengers) : null,
          features: formData.features || '',
          bodyStyle: specs.bodyStyle || null,
          engine: formData.engine || specs.engine || null,
          fuelType: formData.fuelType || specs.fuelType || null,
          transmission: formData.transmission || specs.transmission || null,
          driveType: formData.driveType || specs.driveType || null,
          vehicleType: specs.vehicleType || null,
          horsepower: specs.horsepower || null,
          torque: specs.torque || null,
          mpgCity: specs.mpgCity || null,
          mpgHighway: specs.mpgHighway || null,
          mpgCombined: specs.mpgCombined || null,
          acceleration: specs.acceleration || null,
          topSpeed: specs.topSpeed || null,
          fuelCapacity: specs.fuelCapacity || null,
          weight: specs.weight || null,
          length: specs.length || null,
          width: specs.width || null,
          height: specs.height || null,
          wheelbase: specs.wheelbase || null,
          groundClearance: specs.groundClearance || null,
          cargoVolume: specs.cargoVolume || null,
          towingCapacity: specs.towingCapacity || null
        }),
      });

      if (!carResponse.ok) {
        const errorData = await carResponse.json().catch(() => ({}));
        throw new Error(`Failed to create car: ${errorData.error || carResponse.statusText || carResponse.status}`);
      }

      const car = await carResponse.json();

      // Upload images if any
      if (selectedFiles.length > 0) {
        for (let i = 0; i < selectedFiles.length; i++) {
          const imageFormData = new FormData();
          imageFormData.append('carId', car.id);
          imageFormData.append('image', selectedFiles[i]);
          imageFormData.append('isPrimary', (i === isPrimaryImage).toString());

          await fetch('/api/cars/images', {
            method: 'POST',
            body: imageFormData,
          });
        }
      }

      toast({
        title: 'Success',
        description: 'Car added successfully!',
      });
      
      // Reset form
      setFormData({
        vin: '',
        price: '',
        mileage: '',
        stockNumber: '',
        description: '',
        exteriorColor: '',
        interiorColor: '',
        doors: '',
        passengers: '',
        features: '',
        transmission: '',
        engine: '',
        fuelType: '',
        driveType: ''
      });
      setSelectedFiles([]);
      setSpecs({});
      setIsPrimaryImage(0);
      
      if (onCarAdded) {
        onCarAdded();
      }
    } catch (error) {
      console.error('Error creating car:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create car',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = () => {
    return (
      formData.vin.length === 17 &&
      parseFloat(formData.price) > 0 &&
      parseInt(formData.mileage) >= 0
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <Car className="h-8 w-8 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">Add New Car</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* VIN Input and Fetch Button */}
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <Label htmlFor="vin">VIN Number *</Label>
            <Input
              id="vin"
              name="vin"
              placeholder="Enter 17-character VIN"
              value={formData.vin}
              onChange={handleInputChange}
              maxLength={17}
              className="text-sm font-mono tracking-wider"
              required
            />
          </div>
          <Button
            type="button"
            onClick={fetchSpecs}
            disabled={isLoading || formData.vin.length !== 17}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? 'Fetching...' : 'Fetch Specs'}
          </Button>
        </div>

        {/* Auto-populated Specifications Display */}
        {specs.make && specs.model && specs.year && (
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h3 className="text-lg font-semibold text-green-800 mb-4">Vehicle Specifications</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-green-700">Make</Label>
                <div className="p-2 bg-white rounded border border-green-200 text-green-800 font-medium">
                  {specs.make}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-green-700">Model</Label>
                <div className="p-2 bg-white rounded border border-green-200 text-green-800 font-medium">
                  {specs.model}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-green-700">Year</Label>
                <div className="p-2 bg-white rounded border border-green-200 text-green-800 font-medium">
                  {specs.year}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="space-y-2">
                <Label className="text-green-700">Body Style</Label>
                <div className="p-2 bg-white rounded border border-green-200 text-green-800 font-medium">
                  {specs.bodyStyle || 'N/A'}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-green-700">Transmission</Label>
                <div className="p-2 bg-white rounded border border-green-200 text-green-800 font-medium">
                  {specs.transmission || 'N/A'}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-green-700">Fuel Type</Label>
                <div className="p-2 bg-white rounded border border-green-200 text-green-800 font-medium">
                  {specs.fuelType || 'N/A'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Required Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price">Price *</Label>
            <Input
              id="price"
              name="price"
              type="number"
              value={formData.price}
              onChange={handleInputChange}
              step="0.01"
              min="0"
              required
              placeholder="0.00"
              className="bg-white border-gray-300 text-gray-900"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mileage">Mileage *</Label>
            <Input
              id="mileage"
              name="mileage"
              type="number"
              value={formData.mileage}
              onChange={handleInputChange}
              min="0"
              required
              placeholder="0"
              className="bg-white border-gray-300 text-gray-900"
            />
          </div>
        </div>

        {/* Optional Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="stockNumber">Stock Number</Label>
            <Input
              id="stockNumber"
              name="stockNumber"
              value={formData.stockNumber}
              onChange={handleInputChange}
              placeholder="e.g., STK001"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="exteriorColor">Exterior Color</Label>
            <Input
              id="exteriorColor"
              name="exteriorColor"
              value={formData.exteriorColor}
              onChange={handleInputChange}
              placeholder="e.g., Red, Blue, Silver"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="interiorColor">Interior Color</Label>
            <Input
              id="interiorColor"
              name="interiorColor"
              value={formData.interiorColor}
              onChange={handleInputChange}
              placeholder="e.g., Black, Tan, Gray"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="doors">Number of Doors</Label>
            <Input
              id="doors"
              name="doors"
              type="number"
              value={formData.doors}
              onChange={handleInputChange}
              min="2"
              max="5"
              placeholder="4"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="passengers">Passenger Capacity</Label>
            <Input
              id="passengers"
              name="passengers"
              type="number"
              value={formData.passengers}
              onChange={handleInputChange}
              min="2"
              max="8"
              placeholder="5"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="features">Features</Label>
            <Input
              id="features"
              name="features"
              value={formData.features}
              onChange={handleInputChange}
              placeholder="e.g., Bluetooth, Backup Camera, Navigation"
            />
          </div>
        </div>

        {/* Manual Specification Fields */}
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 text-blue-700">
            <span className="text-sm font-medium">Manual Specifications (Optional)</span>
          </div>
          <p className="text-xs text-blue-600 mt-1">
            These fields are auto-populated from VIN lookup but can be manually edited if needed.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="transmission">Transmission</Label>
            <Input
              id="transmission"
              name="transmission"
              value={formData.transmission}
              onChange={handleInputChange}
              placeholder="e.g., Automatic, Manual, CVT"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="engine">Engine</Label>
            <Input
              id="engine"
              name="engine"
              value={formData.engine}
              onChange={handleInputChange}
              placeholder="e.g., 2.0L Turbo, V6, Electric"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fuelType">Fuel Type</Label>
            <Input
              id="fuelType"
              name="fuelType"
              value={formData.fuelType}
              onChange={handleInputChange}
              placeholder="e.g., Gasoline, Diesel, Electric, Hybrid"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="driveType">Drive Type</Label>
            <Input
              id="driveType"
              name="driveType"
              value={formData.driveType}
              onChange={handleInputChange}
              placeholder="e.g., FWD, RWD, AWD, 4WD"
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Enter detailed description of the car..."
            rows={4}
            className="bg-white border-gray-300 text-gray-900"
          />
        </div>

        {/* Image Upload */}
        <div className="space-y-4">
          <Label>Car Images</Label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Select Images
              </label>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Upload multiple images. First image will be the primary image.
            </p>
          </div>

          {/* Selected Files Display */}
          {selectedFiles.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {selectedFiles.map((file, index) => (
                <div key={index} className="relative group">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <div className="mt-2 text-center">
                    <input
                      type="radio"
                      name="primaryImage"
                      checked={isPrimaryImage === index}
                      onChange={() => setIsPrimaryImage(index)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-600">Primary</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isLoading || !isFormValid()}
            className="bg-green-600 hover:bg-green-700 px-8 py-3"
          >
            {isLoading ? 'Adding Car...' : 'Add Car'}
          </Button>
        </div>
      </form>
    </div>
  );
}
