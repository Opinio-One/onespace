"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Thermometer, Battery, Sun } from "lucide-react";
import Link from "next/link";

export default function CatalogPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Product Catalog</h1>
        <p className="text-gray-600">
          Browse our comprehensive range of energy-efficient products
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Thermometer className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Binnenunits</CardTitle>
                <CardDescription>Air conditioning indoor units</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Browse our collection of energy-efficient indoor air conditioning
              units with smart features and modern designs.
            </p>
            <Button asChild className="w-full">
              <Link href="/catalog/binnenunits">View Products</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Thermometer className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Heat Pumps</CardTitle>
                <CardDescription>
                  Energy-efficient heating solutions
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Discover our range of heat pumps for efficient home heating and
              cooling.
            </p>
            <Button asChild className="w-full" variant="outline">
              <Link href="#">Coming Soon</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Battery className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Thuisbatterijen</CardTitle>
                <CardDescription>
                  Home battery storage solutions
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Store excess energy with our reliable home battery systems.
            </p>
            <Button asChild className="w-full">
              <Link href="/catalog/thuisbatterijen">View Products</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Sun className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Solar Panels</CardTitle>
                <CardDescription>Renewable energy solutions</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Harness the power of the sun with our high-efficiency solar
              panels.
            </p>
            <Button asChild className="w-full" variant="outline">
              <Link href="#">Coming Soon</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
