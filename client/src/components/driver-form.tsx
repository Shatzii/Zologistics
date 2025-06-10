import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, Save, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Driver, InsertDriver } from "@shared/schema";

const driverFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  initials: z.string().min(2, "Initials must be at least 2 characters").max(4, "Initials must be 4 characters or less"),
  phoneNumber: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  licenseNumber: z.string().min(1, "License number is required"),
  licenseExpiry: z.date().optional(),
  currentLocation: z.string().min(1, "Current location is required"),
  status: z.enum(["available", "en_route", "off_duty", "break"]),
  preferences: z.object({
    preferredRoutes: z.array(z.string()).default([]),
    equipmentTypes: z.array(z.string()).default([]),
    maxDistance: z.number().optional(),
    homeBase: z.string().optional(),
    specializations: z.array(z.string()).default([])
  }).optional(),
});

type DriverFormData = z.infer<typeof driverFormSchema>;

interface DriverFormProps {
  driver?: Driver;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function DriverForm({ driver, onSuccess, onCancel }: DriverFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<DriverFormData>({
    resolver: zodResolver(driverFormSchema),
    defaultValues: {
      name: driver?.name || "",
      initials: driver?.initials || "",
      phoneNumber: driver?.phoneNumber || "",
      email: driver?.email || "",
      licenseNumber: driver?.licenseNumber || "",
      licenseExpiry: driver?.licenseExpiry ? new Date(driver.licenseExpiry) : undefined,
      currentLocation: driver?.currentLocation || "",
      status: (driver?.status as any) || "available",
      preferences: {
        preferredRoutes: (driver?.preferences as any)?.preferredRoutes || [],
        equipmentTypes: (driver?.preferences as any)?.equipmentTypes || [],
        maxDistance: (driver?.preferences as any)?.maxDistance,
        homeBase: (driver?.preferences as any)?.homeBase || "",
        specializations: (driver?.preferences as any)?.specializations || []
      }
    },
  });

  const createDriverMutation = useMutation({
    mutationFn: async (data: DriverFormData) => {
      const payload = {
        ...data,
        licenseExpiry: data.licenseExpiry?.toISOString(),
        preferences: data.preferences ? JSON.stringify(data.preferences) : null,
        companyId: 1, // Default company
        userId: null,
        deviceToken: null,
        gpsCoordinates: null,
        isActive: true
      };
      
      if (driver) {
        return apiRequest(`/api/drivers/${driver.id}`, 'PUT', payload);
      } else {
        return apiRequest('/api/drivers', 'POST', payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/drivers'] });
      toast({
        title: driver ? "Driver Updated" : "Driver Created",
        description: driver 
          ? "Driver information has been updated successfully."
          : "New driver has been added to your fleet.",
      });
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: DriverFormData) => {
    setIsSubmitting(true);
    try {
      await createDriverMutation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const equipmentOptions = [
    "Dry Van", "Refrigerated", "Flatbed", "Step Deck", "Lowboy", 
    "Tanker", "Auto Hauler", "Container", "Heavy Haul", "Specialized"
  ];

  const specializationOptions = [
    "Hazmat", "Oversized Loads", "Temperature Controlled", "High Value",
    "Expedited", "White Glove", "Team Driving", "Long Haul", "Regional", "Local"
  ];

  const routeOptions = [
    "East Coast", "West Coast", "Midwest", "Southwest", "Southeast", 
    "Northeast", "Cross Country", "Regional", "Local", "Canada", "Mexico"
  ];

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {driver ? (
            <>
              <Save className="w-5 h-5" />
              Edit Driver: {driver.name}
            </>
          ) : (
            <>
              <Plus className="w-5 h-5" />
              Add New Driver
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="John Smith" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="initials"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Initials *</FormLabel>
                    <FormControl>
                      <Input placeholder="JS" maxLength={4} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 (555) 123-4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john.smith@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="licenseNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CDL License Number *</FormLabel>
                    <FormControl>
                      <Input placeholder="CDL123456789" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="licenseExpiry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>License Expiry Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date()
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currentLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Location *</FormLabel>
                    <FormControl>
                      <Input placeholder="Atlanta, GA" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="en_route">En Route</SelectItem>
                        <SelectItem value="off_duty">Off Duty</SelectItem>
                        <SelectItem value="break">On Break</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Driver Preferences */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Driver Preferences</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="preferences.homeBase"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Home Base</FormLabel>
                      <FormControl>
                        <Input placeholder="Home terminal location" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="preferences.maxDistance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Distance (miles)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="500" 
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Equipment Types */}
              <FormField
                control={form.control}
                name="preferences.equipmentTypes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Equipment Types</FormLabel>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {equipmentOptions.map((equipment) => (
                        <Badge
                          key={equipment}
                          variant={field.value?.includes(equipment) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => {
                            const current = field.value || [];
                            if (current.includes(equipment)) {
                              field.onChange(current.filter(item => item !== equipment));
                            } else {
                              field.onChange([...current, equipment]);
                            }
                          }}
                        >
                          {equipment}
                        </Badge>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Specializations */}
              <FormField
                control={form.control}
                name="preferences.specializations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specializations</FormLabel>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {specializationOptions.map((specialization) => (
                        <Badge
                          key={specialization}
                          variant={field.value?.includes(specialization) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => {
                            const current = field.value || [];
                            if (current.includes(specialization)) {
                              field.onChange(current.filter(item => item !== specialization));
                            } else {
                              field.onChange([...current, specialization]);
                            }
                          }}
                        >
                          {specialization}
                        </Badge>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Preferred Routes */}
              <FormField
                control={form.control}
                name="preferences.preferredRoutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Routes</FormLabel>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {routeOptions.map((route) => (
                        <Badge
                          key={route}
                          variant={field.value?.includes(route) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => {
                            const current = field.value || [];
                            if (current.includes(route)) {
                              field.onChange(current.filter(item => item !== route));
                            } else {
                              field.onChange([...current, route]);
                            }
                          }}
                        >
                          {route}
                        </Badge>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-4 pt-6 border-t">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={isSubmitting}>
                <Save className="w-4 h-4 mr-2" />
                {isSubmitting ? "Saving..." : driver ? "Update Driver" : "Create Driver"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}