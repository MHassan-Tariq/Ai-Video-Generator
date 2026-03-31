"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { getCollection, addDocument, updateDocument, deleteDocument } from "@/lib/firestore"
import { deleteFile } from "@/lib/storage"
import { DataTable } from "@/components/DataTable"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { StatusBadge } from "@/components/StatusBadge"
import { UploadField } from "@/components/UploadField"
import { ConfirmDialog } from "@/components/ConfirmDialog"
import { Select } from "@/components/ui/select"
import { ColumnDef } from "@tanstack/react-table"
import { Plus, Edit, Trash2, Compass, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

interface ExploreItem {
  id: string
  title: string
  description: string
  image: string
  category: string
  order: number
  is_active: boolean
}

interface RoomType {
  id: string
  name: string
  is_active: boolean
}

export default function ExplorePage() {
  const [data, setData] = useState<ExploreItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ExploreItem | null>(null)
  
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [deletingItem, setDeletingItem] = useState<ExploreItem | null>(null)
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([])

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: "",
    category: "",
    order: 1,
    is_active: true
  })
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      const [items, rooms] = await Promise.all([
        getCollection("explore"),
        getCollection("room_types")
      ])
      setData(items as ExploreItem[])
      setRoomTypes((rooms as RoomType[]).filter(r => r.is_active))
    } catch (error) {
      console.error("Failed to load records", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleOpenDialog = (item?: ExploreItem) => {
    if (item) {
      setEditingItem(item)
      setFormData({
        title: item.title || "",
        description: item.description || "",
        image: item.image || "",
        category: item.category || "",
        order: item.order || 1,
        is_active: item.is_active ?? true
      })
    } else {
      setEditingItem(null)
      const nextOrder = data.length > 0 ? Math.max(...data.map(d => Number(d.order) || 0)) + 1 : 1
      setFormData({ 
        title: "", 
        description: "",
        image: "", 
        category: "",
        order: nextOrder, 
        is_active: true 
      })
    }
    setIsDialogOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    
    try {
      if (editingItem) {
        await updateDocument("explore", editingItem.id, formData)
      } else {
        await addDocument("explore", formData)
      }
      await loadData()
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error saving record:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteClick = (item: ExploreItem) => {
    setDeletingItem(item)
    setIsConfirmOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!deletingItem) return
    
    try {
      setIsDeleting(true)
      await deleteDocument("explore", deletingItem.id)
      if (deletingItem.image) await deleteFile(deletingItem.image)
      await loadData()
      setIsConfirmOpen(false)
    } catch (error) {
      console.error("Error deleting record:", error)
    } finally {
      setIsDeleting(false)
      setDeletingItem(null)
    }
  }

  const columns: ColumnDef<ExploreItem>[] = [
    {
      accessorKey: "image",
      header: "Explore Image",
      cell: ({ row }) => (
        <div className="w-16 h-16 rounded overflow-hidden bg-secondary flex items-center justify-center">
          {row.original.image ? (
            <img src={row.original.image} alt={row.original.title} className="w-full h-full object-cover" />
          ) : (
            <Compass className="w-6 h-6 text-muted-foreground" />
          )}
        </div>
      )
    },
    {
      accessorKey: "title",
      header: "Title",
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => <Badge variant="outline">{row.original.category}</Badge>
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => <div className="max-w-[200px] truncate">{row.original.description}</div>
    },
    {
      accessorKey: "order",
      header: "Order",
    },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({ row }) => <StatusBadge active={row.original.is_active} />
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(row.original)}>
            <Edit className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteClick(row.original)}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-card p-6 rounded-xl border border-border shadow-sm">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Explore Section</h2>
          <p className="text-muted-foreground">Manage featured content and inspirations for the app.</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="font-semibold shadow-md">
          <Plus className="w-4 h-4 mr-2" /> Add Item
        </Button>
      </div>

      <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
         {loading ? (
             <div className="text-center p-8 text-muted-foreground">Loading items...</div>
         ) : (
             <DataTable columns={columns} data={data} searchKey="title" />
         )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Item" : "Add Item"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-6 pt-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input 
                id="title" 
                value={formData.title} 
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, title: e.target.value})} 
                required 
                placeholder="e.g. Minimalist Master Bedroom"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select 
                id="category" 
                value={formData.category} 
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({...formData, category: e.target.value})} 
                required
              >
                <option value="" disabled>Select a room type</option>
                {roomTypes.map((type) => (
                  <option key={type.id} value={type.name}>
                    {type.name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                value={formData.description} 
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({...formData, description: e.target.value})} 
                required 
                placeholder="Briefly describe this feature..."
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label>Featured Image</Label>
              <UploadField 
                storagePath="explore" 
                value={formData.image} 
                onChange={(url) => setFormData({...formData, image: url})} 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="order">Sort Order</Label>
              <Input 
                id="order" 
                type="number"
                value={formData.order} 
                onChange={e => setFormData({...formData, order: parseInt(e.target.value) || 1})}
                required
              />
            </div>

            <div className="flex items-center space-x-2 py-2">
              <Switch 
                id="active" 
                checked={formData.is_active} 
                onCheckedChange={c => setFormData({...formData, is_active: c})} 
              />
              <Label htmlFor="active">Active</Label>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-border mt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving || !formData.image}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSaving ? "Saving..." : "Save Item"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog 
        open={isConfirmOpen}
        onOpenChange={(open) => !isDeleting && setIsConfirmOpen(open)}
        title="Delete Item"
        description="Are you sure you want to delete this item? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </div>
  )
}
