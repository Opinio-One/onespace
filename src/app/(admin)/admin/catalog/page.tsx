"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Thermometer, Battery, Sun, Zap, Database } from "lucide-react";
import Link from "next/link";

export default function AdminCatalogPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Catalog Management</h1>
        <p className="text-gray-600">
          Manage your product catalog with table-based views
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Thermometer className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Binnenunits Table</CardTitle>
                <CardDescription>Manage indoor units data</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              View and edit indoor air conditioning units in table format.
            </p>
            <Button asChild className="w-full">
              <Link href="/admin/catalog/binnenunits">Manage Table</Link>
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
                <CardTitle className="text-lg">Buitenunits Table</CardTitle>
                <CardDescription>Manage outdoor units data</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              View and edit outdoor air conditioning units in table format.
            </p>
            <Button asChild className="w-full">
              <Link href="/admin/catalog/buitenunits">Manage Table</Link>
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
                <CardTitle className="text-lg">Thuisbatterijen Table</CardTitle>
                <CardDescription>Manage battery storage data</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              View and edit home battery systems in table format.
            </p>
            <Button asChild className="w-full">
              <Link href="/admin/catalog/thuisbatterijen">Manage Table</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Zap className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Omvormers Table</CardTitle>
                <CardDescription>Manage inverter data</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              View and edit solar inverters in table format.
            </p>
            <Button asChild className="w-full">
              <Link href="/admin/catalog/omvormers">Manage Table</Link>
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
                <CardTitle className="text-lg">Zonnepanelen Table</CardTitle>
                <CardDescription>Manage solar panel data</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              View and edit solar panels in table format.
            </p>
            <Button asChild className="w-full">
              <Link href="/admin/catalog/zonnepanelen">Manage Table</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-dashed">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Database className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Add New Category</CardTitle>
                <CardDescription>Create a new product category</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Add a new product category to your catalog.
            </p>
            <Button asChild className="w-full" variant="outline">
              <Link href="#">Add Category</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
