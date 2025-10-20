# Server-Client Architecture Documentation

## Overview

This codebase implements a hybrid server-client architecture using Next.js App Router with clear separation between server and client code. This provides optimal performance, security, and developer experience.

## Architecture Pattern

### Directory Structure

```
src/
├── types/
│   └── catalog.ts                 # Shared TypeScript types
├── lib/
│   ├── services/
│   │   └── catalog.service.ts     # Server-side business logic (server-only)
│   └── supabase/
│       ├── server.ts               # Server-side Supabase client
│       └── client.ts               # Client-side Supabase client
├── app/
│   ├── api/                        # API Route Handlers (server-only)
│   │   └── catalog/
│   │       ├── zonnepanelen/route.ts
│   │       ├── thuisbatterijen/route.ts
│   │       ├── omvormers/route.ts
│   │       ├── binnenunits/route.ts
│   │       └── buitenunits/route.ts
│   └── (admin)/admin/catalog/      # Page routes (Server Components)
│       ├── zonnepanelen/page.tsx
│       ├── thuisbatterijen/page.tsx
│       └── ...
└── components/
    └── admin/
        └── catalog-table.tsx       # Client component for interactivity
```

## Key Principles

### 1. Server vs Client Code Separation

**Server-Only Code:**

- `src/lib/services/` - Business logic and data access
- `src/app/api/` - API route handlers
- Page components (unless marked with `"use client"`)

**Client-Only Code:**

- Components marked with `"use client"`
- Browser APIs and interactivity
- State management (useState, useEffect)

### 2. Data Flow

```
┌─────────────────────────────────────────────────────────┐
│                    Initial Page Load                    │
│                   (Server Component)                    │
│                                                         │
│  1. User requests page                                  │
│  2. Server Component fetches data via service layer     │
│  3. HTML rendered on server with initial data           │
│  4. Fast initial page load with SEO benefits            │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                Client-Side Interactions                 │
│                   (Client Component)                    │
│                                                         │
│  1. User searches/filters/paginates                     │
│  2. Client component calls API route                    │
│  3. API route uses service layer                        │
│  4. Results returned as JSON                            │
│  5. Client component updates UI                         │
└─────────────────────────────────────────────────────────┘
```

## How to Add a New Catalog Type

### Step 1: Define Types

Add your type to `src/types/catalog.ts`:

```typescript
export interface MyNewItem {
  Id: number;
  Product: string;
  // ... other fields
}
```

### Step 2: Create API Route

Create `src/app/api/catalog/mynewitem/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { getCatalogItems } from "@/lib/services/catalog.service";
import type { MyNewItem } from "@/types/catalog";

const SEARCHABLE_FIELDS = ["Product", "Merk"];
const FILTERABLE_FIELDS = ["Merk", "Category"];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "Id";
    const sortOrder = (searchParams.get("sortOrder") || "asc") as
      | "asc"
      | "desc";

    const filters: Record<string, string | string[]> = {};
    FILTERABLE_FIELDS.forEach((field) => {
      const value = searchParams.get(field);
      if (value) {
        filters[field] = value.includes(",") ? value.split(",") : value;
      }
    });

    const result = await getCatalogItems<MyNewItem>({
      tableName: "MyNewItems",
      page,
      limit,
      search,
      filters,
      sortBy,
      sortOrder,
      searchableFields: SEARCHABLE_FIELDS,
      filterableFields: FILTERABLE_FIELDS,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch items" },
      { status: 500 }
    );
  }
}
```

### Step 3: Create Page Component

Create `src/app/(admin)/admin/catalog/mynewitem/page.tsx`:

```typescript
import { getCatalogItems } from "@/lib/services/catalog.service";
import type { MyNewItem } from "@/types/catalog";
import { CatalogTable } from "@/components/admin/catalog-table";

const SEARCHABLE_FIELDS = ["Product", "Merk"];
const FILTERABLE_FIELDS = ["Merk", "Category"];
const FILTER_CONFIG = [
  { field: "Merk", label: "Brand" },
  { field: "Category", label: "Category" },
];

export default async function AdminMyNewItemPage() {
  const initialData = await getCatalogItems<MyNewItem>({
    tableName: "MyNewItems",
    page: 1,
    limit: 10,
    searchableFields: SEARCHABLE_FIELDS,
    filterableFields: FILTERABLE_FIELDS,
  });

  return (
    <CatalogTable<MyNewItem>
      initialData={initialData}
      tableName="mynewitem"
      displayName="My New Items"
      extractId={(item) => item.Id}
      filterConfig={FILTER_CONFIG}
      renderHeader={() => (
        <>
          <th className="text-left p-3 font-medium">ID</th>
          <th className="text-left p-3 font-medium">Product</th>
          {/* Add more headers */}
        </>
      )}
      renderRow={(item, onEdit, onDelete) => (
        <>
          <td className="p-3">{item.Id}</td>
          <td className="p-3">{item.Product}</td>
          {/* Add more cells */}
        </>
      )}
    />
  );
}
```

## Service Layer API

### getCatalogItems<T>

Fetches paginated catalog items with filters and search.

```typescript
const result = await getCatalogItems<MyType>({
  tableName: "MyTable", // Supabase table name
  page: 1, // Page number (1-based)
  limit: 10, // Items per page
  search: "search term", // Optional search query
  filters: {
    // Optional filters
    brand: "BrandName",
    category: ["Cat1", "Cat2"], // Arrays for multi-select
  },
  sortBy: "Id", // Column to sort by
  sortOrder: "asc", // "asc" or "desc"
  searchableFields: ["col1", "col2"], // Columns to search in
  filterableFields: ["col1", "col2"], // Columns to calculate filter options for
});
```

**Returns:**

```typescript
{
  data: T[],                    // Array of items
  pagination: {
    page: number,               // Current page
    limit: number,              // Items per page
    total: number,              // Total items
    totalPages: number          // Total pages
  },
  filterOptions: {              // Available filter values
    brand: ["Brand1", "Brand2"],
    category: ["Cat1", "Cat2"]
  }
}
```

### Other Service Functions

- `getCatalogItemById<T>(tableName, id)` - Fetch single item
- `updateCatalogItem<T>(tableName, id, updates)` - Update item
- `createCatalogItem<T>(tableName, item)` - Create new item
- `deleteCatalogItem(tableName, id)` - Delete item

## API Route Endpoints

All catalog API routes follow the same pattern:

```
GET /api/catalog/{catalog-type}?page=1&limit=10&search=term&Brand=value
```

**Query Parameters:**

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `search` - Search term (searches across configured fields)
- `sortBy` - Column to sort by (default: "Id")
- `sortOrder` - "asc" or "desc" (default: "asc")
- `{FilterField}` - Any filterable field (supports comma-separated values)

**Response:**

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  },
  "filterOptions": {
    "Brand": ["Brand1", "Brand2"],
    ...
  }
}
```

## Benefits

### 1. Performance

- **Fast Initial Load**: Server-side rendering with prefetched data
- **Efficient Updates**: Only fetch what's needed for client interactions
- **Server-side Pagination**: Handles large datasets efficiently

### 2. Security

- **No Client Exposure**: Database credentials never sent to browser
- **Centralized Logic**: Business rules enforced on server
- **Type Safety**: End-to-end TypeScript types

### 3. Developer Experience

- **Clear Separation**: Easy to understand where code runs
- **Reusable Components**: One table component for all catalog types
- **Consistent Patterns**: Same approach for all features

### 4. SEO

- **Server Rendering**: Content available to search engines
- **Fast First Paint**: Better user experience and ranking

## Best Practices

### DO:

✅ Keep data fetching in Server Components or API routes
✅ Use service layer for all database operations
✅ Mark interactive components with `"use client"`
✅ Use shared types from `src/types/`
✅ Implement server-side validation

### DON'T:

❌ Import server code into client components
❌ Use `createClient` from `@/lib/supabase/client` on server
❌ Fetch large datasets client-side
❌ Duplicate business logic between client and server
❌ Bypass the service layer to query database directly

## Troubleshooting

### Error: "You're importing a component that needs X"

**Solution**: Move the component to a client component or remove the dependency on client-only features.

### Data not updating after mutation

**Solution**: Use `revalidatePath()` in Server Actions or refetch via API route.

### Filter options not appearing

**Solution**: Ensure `filterableFields` includes the field name and it has data in the database.

## Future Enhancements

Consider adding:

- **Request Caching**: Cache filter options for 5-10 minutes
- **Server Actions**: For mutations instead of API routes
- **Optimistic Updates**: Immediate UI feedback before server response
- **Export Functionality**: Generate CSV/Excel exports
- **Bulk Operations**: Select and modify multiple items
