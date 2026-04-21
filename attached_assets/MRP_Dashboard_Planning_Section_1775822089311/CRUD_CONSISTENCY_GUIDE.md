# CRUD Naming & Pattern Consistency Guide

## Overview
This document outlines the consistent naming conventions and patterns used across all CRUD operations in the MRP Dashboard application.

## Pages with Full CRUD

### 1. Products Page (`/products`)
- **Entity**: Finished Products (FinishedProduct)
- **Route**: `/products`
- **File**: `/src/app/pages/ProductsPage.tsx`

### 2. Inventory Page (`/inventory`) 
- **Entity**: Raw Materials (InventoryItem)
- **Route**: `/inventory`
- **File**: `/src/app/pages/InventoryPage.tsx`

### 3. Manufacturing Orders Page (`/orders`)
- **Entity**: Manufacturing Orders (ManufacturingOrder)
- **Route**: `/orders`
- **File**: `/src/app/pages/ManufacturingOrdersPage.tsx`

---

## Consistent Naming Conventions

### State Variables
```typescript
const [items, setItems] = useState<EntityType[]>(initialData);
const [searchTerm, setSearchTerm] = useState('');
const [categoryFilter, setCategoryFilter] = useState('all'); // or statusFilter, departmentFilter, etc.
const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
const [selectedItem, setSelectedItem] = useState<EntityType | null>(null);
const [formData, setFormData] = useState<Partial<EntityType>>({});
```

### CRUD Function Names
```typescript
// Always use these exact names:
const handleCreate = () => { ... };      // Opens create dialog
const handleEdit = (item) => { ... };    // Opens edit dialog with pre-filled data
const handleDelete = (item) => { ... };  // Opens delete confirmation dialog
const confirmDelete = () => { ... };     // Actually performs the deletion
const saveItem = () => { ... };          // Handles both create and update
const updateFormField = (field, value) => { ... }; // Updates form data
```

### Dialog Titles & Descriptions
- **Create**: 
  - Title: `"Create New {Entity}"`
  - Description: `"Add a new {entity} to the {context}."`
- **Edit**: 
  - Title: `"Edit {Entity}"`
  - Description: `"Update the details of the {entity}."`
- **Delete**: 
  - Title: `"Are you absolutely sure?"`
  - Description: `"This action cannot be undone. This will permanently delete the {entity} from the {context}."`

### Button Labels
- **Create**: `"Create"` (in dialog footer)
- **Update**: `"Update"` (in edit dialog footer)
- **Delete**: `"Delete"` (in delete dialog footer)
- **Cancel**: `"Cancel"` (in all dialogs)
- **Action Buttons**: 
  - Create button in header: `<Plus icon> "Add {Entity}"`
  - Edit button in table: `<Pencil icon>` (icon only)
  - Delete button in table: `<Trash2 icon>` (icon only)

### Toast Messages
```typescript
// Success messages
toast.success(`{Entity} "{name/id}" created successfully`);
toast.success(`{Entity} "{name/id}" updated successfully`);
toast.success(`{Entity} "{name/id}" deleted successfully`);

// Error messages
toast.error('Please fill in all required fields');
```

### Icons
- **Create/Add**: `Plus` from lucide-react
- **Edit**: `Pencil` from lucide-react
- **Delete**: `Trash2` from lucide-react
- **Search**: `Search` from lucide-react

---

## Component Structure Pattern

### 1. Page Header
```tsx
<div className="mb-8 flex items-center justify-between">
  <div>
    <h1 className="text-3xl font-bold text-gray-900">{Page Title}</h1>
    <p className="text-gray-600 mt-2">{Description}</p>
  </div>
  <Button onClick={handleCreate}>
    <Plus className="w-4 h-4 mr-2" />
    Add {Entity}
  </Button>
</div>
```

### 2. Filters Card
```tsx
<Card className="mb-6">
  <CardContent className="p-4">
    <div className="flex gap-4">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input placeholder="Search..." value={searchTerm} onChange={...} className="pl-9" />
      </div>
      <Select value={filter} onValueChange={setFilter}>...</Select>
    </div>
  </CardContent>
</Card>
```

### 3. Action Buttons in Table
```tsx
<td className="p-4">
  <div className="flex gap-2">
    {conditionalButton && (
      <Button size="sm" variant="default">Action</Button>
    )}
    <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
      <Pencil className="w-4 h-4" />
    </Button>
    <Button size="sm" variant="outline" onClick={() => handleDelete(item)}>
      <Trash2 className="w-4 h-4" />
    </Button>
  </div>
</td>
```

### 4. Dialog Structure
```tsx
<Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
  <DialogContent className="sm:max-w-[600px]">
    <DialogHeader>
      <DialogTitle>Create New {Entity}</DialogTitle>
      <DialogDescription>Description text</DialogDescription>
    </DialogHeader>
    <div className="grid gap-4 py-4">
      {/* Form fields */}
    </div>
    <DialogFooter>
      <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
        Cancel
      </Button>
      <Button type="button" onClick={saveItem}>
        Create
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### 5. Form Fields Pattern
```tsx
<div className="grid grid-cols-4 items-center gap-4">
  <Label htmlFor="fieldName" className="text-right">
    Field Label
  </Label>
  <Input
    id="fieldName"
    value={formData.fieldName || ''}
    onChange={(e) => updateFormField('fieldName', e.target.value)}
    className="col-span-3"
  />
</div>
```

---

## Validation Pattern

```typescript
const saveItem = () => {
  // Check required fields
  if (!formData.field1 || !formData.field2) {
    toast.error('Please fill in all required fields');
    return;
  }

  if (isEditDialogOpen && selectedItem) {
    // Update existing
    setItems(items.map(i => 
      i.id === selectedItem.id ? { ...formData as EntityType, id: selectedItem.id } : i
    ));
    toast.success(`{Entity} "${formData.name}" updated successfully`);
    setIsEditDialogOpen(false);
  } else {
    // Create new
    const newItem: EntityType = {
      ...formData as EntityType,
      id: generateId(), // Use appropriate ID generation
    };
    setItems([...items, newItem]);
    toast.success(`{Entity} "${formData.name}" created successfully`);
    setIsCreateDialogOpen(false);
  }
  
  setFormData({});
  setSelectedItem(null);
};
```

---

## File Organization

### Pages
- All page files end with `Page.tsx`
- Default export: `export default function {Name}Page() { ... }`

### Components
- Reusable components in `/src/app/components/`
- Named exports for components: `export function {Name}() { ... }`

### Data
- Mock data in `/src/app/data/mockData.ts`
- Export interfaces and data arrays

---

## Testing Checklist

Before implementing backend:
- [ ] All entity names are consistent
- [ ] Dialog titles follow pattern
- [ ] Toast messages are descriptive
- [ ] Form validation works
- [ ] Edit pre-fills form data correctly
- [ ] Delete shows confirmation
- [ ] Create generates proper IDs
- [ ] Filters work correctly
- [ ] Search functionality works
- [ ] Buttons have correct icons and labels
- [ ] State updates properly after operations
- [ ] No console errors

---

## Next Steps

When implementing backend:
1. Replace `useState` with API calls
2. Use React Query or similar for state management
3. Implement proper error handling
4. Add loading states
5. Implement optimistic updates
6. Add proper ID generation from backend
7. Implement proper validation (client + server)
8. Add pagination for large datasets
