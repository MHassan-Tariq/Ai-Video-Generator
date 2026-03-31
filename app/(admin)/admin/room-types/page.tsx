"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { getCollection, addDocument, updateDocument, deleteDocument } from "@/lib/firestore"
import { DataTable } from "@/components/DataTable"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { StatusBadge } from "@/components/StatusBadge"
import { ConfirmDialog } from "@/components/ConfirmDialog"
import { ColumnDef } from "@tanstack/react-table"
import { Plus, Edit, Trash2, Loader2, Image as ImageIcon } from "lucide-react"
import { deleteFile } from "@/lib/storage"
import { UploadField } from "@/components/UploadField"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface RoomType {
  id: string
  name: string
  image: string
  order: number
  is_active: boolean
}

export default function RoomTypesPage() {
  const [data, setData] = useState<RoomType[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<RoomType | null>(null)
  
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [deletingItem, setDeletingItem] = useState<RoomType | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    image: "",
    order: 1,
    is_active: true
  })
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      const items = await getCollection("room_types")
      setData(items as RoomType[])
    } catch (error) {
      console.error("Failed to load records", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleOpenDialog = (item?: RoomType) => {
    if (item) {
      setEditingItem(item)
      setFormData({
        name: item.name || "",
        image: item.image || "",
        order: item.order || 1,
        is_active: item.is_active ?? true
      })
    } else {
      setEditingItem(null)
      const nextOrder = data.length > 0 ? Math.max(...data.map(d => Number(d.order) || 0)) + 1 : 1
      setFormData({ 
        name: "", 
        image: "",
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
        await updateDocument("room_types", editingItem.id, formData)
      } else {
        await addDocument("room_types", formData)
      }
      await loadData()
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error saving record:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteClick = (item: RoomType) => {
    setDeletingItem(item)
    setIsConfirmOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!deletingItem) return
    
    try {
      setIsDeleting(true)
      await deleteDocument("room_types", deletingItem.id)
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

  const columns: ColumnDef<RoomType>[] = [
    {
      accessorKey: "image",
      header: "Image",
      cell: ({ row }) => (
        <div className="w-12 h-12 rounded overflow-hidden bg-secondary flex items-center justify-center border border-border">
          {row.original.image ? (
            <img src={row.original.image} alt={row.original.name} className="w-full h-full object-cover" />
          ) : (
            <ImageIcon className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
      )
    },
    {
      accessorKey: "name",
      header: "Room Name",
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
          <h2 className="text-3xl font-bold tracking-tight">Room Types</h2>
          <p className="text-muted-foreground">Manage categories of rooms (e.g. Living Room, Bedroom).</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="font-semibold shadow-md">
          <Plus className="w-4 h-4 mr-2" /> Add Room Type
        </Button>
      </div>

      <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
         {loading ? (
             <div className="text-center p-8 text-muted-foreground">Loading room types...</div>
         ) : (
             <DataTable columns={columns} data={data} searchKey="name" />
         )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Room Type" : "Add Room Type"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-6 pt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Room Name</Label>
              <Input 
                id="name" 
                value={formData.name} 
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, name: e.target.value})} 
                required 
                placeholder="e.g. Master Bedroom"
              />
            </div>

            <div className="space-y-2">
              <Label>Room Image</Label>
              <UploadField 
                storagePath="room_types" 
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
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, order: parseInt(e.target.value) || 1})}
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
              <Button type="submit" disabled={isSaving || !formData.name || !formData.image}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSaving ? "Saving..." : "Save Room Type"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog 
        open={isConfirmOpen}
        onOpenChange={(open) => !isDeleting && setIsConfirmOpen(open)}
        title="Delete Room Type"
        description="Are you sure you want to delete this room type? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </div>
  )
}
