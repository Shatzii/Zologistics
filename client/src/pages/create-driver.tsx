import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, UserPlus, Truck, Phone, Mail, MapPin } from "lucide-react";
import { Link } from "wouter";
import { insertDriverSchema, type InsertDriver } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const createDriverSchema = insertDriverSchema.extend({
  phoneNumber: insertDriverSchema.shape.phoneNumber.optional(),
  email: insertDriverSchema.shape.email.optional(),
  licenseNumber: insertDriverSchema.shape.licenseNumber.optional(),
});

export default function CreateDriverPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertDriver>({
    resolver: zodResolver(createDriverSchema),
    defaultValues: {
      name: "",
      initials: "",
      currentLocation: "",
      status: "available",
      phoneNumber: "",
      email: "",
      licenseNumber: "",
      companyId: 1, // Default company
      isActive: true,
    },
  });

  const createDriverMutation = useMutation({
    mutationFn: async (driverData: InsertDriver) => {
      return await apiRequest("POST", "/api/drivers", driverData);
    },
    onSuccess: () => {
      toast({
        title: "Driver Added Successfully",
        description: "The new driver has been added to your fleet.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/drivers"] });
      setLocation("/drivers");
    },
    onError: (error) => {
      toast({
        title: "Error Adding Driver",
        description: error.message || "Failed to add driver. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertDriver) => {
    // Generate initials from name if not provided
    if (!data.initials && data.name) {
      const names = data.name.split(' ');
      data.initials = names.map(name => name.charAt(0).toUpperCase()).join('');
    }
    
    createDriverMutation.mutate(data);
  };

  const generateInitials = () => {
    const name = form.getValues("name");
    if (name) {
      const names = name.split(' ');
      const initials = names.map(name => name.charAt(0).toUpperCase()).join('');
      form.setValue("initials", initials);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href="/drivers">
            <Button variant="outline" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Drivers
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <UserPlus className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Add New Driver</h1>
              <p className="text-gray-600">Add a driver to your fleet and start optimizing their loads</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="w-5 h-5" />
              Driver Information
            </CardTitle>
            <CardDescription>
              Enter the driver's details to add them to your fleet management system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="John Doe" 
                            {...field}
                            onBlur={(e) => {
                              field.onBlur(e);
                              generateInitials();
                            }}
                          />
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
                          <Input 
                            placeholder="JD" 
                            {...field}
                            maxLength={5}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          Phone Number
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="+1 (555) 123-4567" 
                            {...field}
                          />
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
                        <FormLabel className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          Email Address
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="email"
                            placeholder="john.doe@email.com" 
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Location and Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="currentLocation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          Current Location *
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Atlanta, GA" 
                            {...field}
                          />
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
                            <SelectItem value="maintenance">Maintenance</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* License Information */}
                <FormField
                  control={form.control}
                  name="licenseNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CDL License Number</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="D123456789" 
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Submit Buttons */}
                <div className="flex gap-4 pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setLocation("/drivers")}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={createDriverMutation.isPending}
                  >
                    {createDriverMutation.isPending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Adding Driver...
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add Driver
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Feature Benefits */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Truck className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="font-semibold text-sm">Smart Load Matching</h3>
              <p className="text-xs text-gray-600 mt-1">AI finds the best loads for each driver</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <MapPin className="w-4 h-4 text-green-600" />
              </div>
              <h3 className="font-semibold text-sm">GPS Tracking</h3>
              <p className="text-xs text-gray-600 mt-1">Real-time location and route optimization</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Phone className="w-4 h-4 text-purple-600" />
              </div>
              <h3 className="font-semibold text-sm">Instant Notifications</h3>
              <p className="text-xs text-gray-600 mt-1">SMS and push alerts for new loads</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}