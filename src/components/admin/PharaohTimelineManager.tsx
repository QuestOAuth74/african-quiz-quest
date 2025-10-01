import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Upload, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface Pharaoh {
  id: string;
  name: string;
  dynasty: string;
  period: string;
  reign_start: number | null;
  reign_end: number | null;
  achievements: string | null;
  significance: string | null;
  burial_location: string | null;
  image_url: string | null;
  image_caption: string | null;
  sort_order: number;
  is_active: boolean;
}

export const PharaohTimelineManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingPharaoh, setEditingPharaoh] = useState<Pharaoh | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState<Partial<Pharaoh>>({
    name: "",
    dynasty: "",
    period: "",
    reign_start: null,
    reign_end: null,
    achievements: "",
    significance: "",
    burial_location: "",
    image_url: "",
    image_caption: "",
    sort_order: 0,
    is_active: true,
  });

  const { data: pharaohs, isLoading } = useQuery({
    queryKey: ["pharaohs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pharaoh_timeline")
        .select("*")
        .order("sort_order", { ascending: true });
      
      if (error) throw error;
      return data as Pharaoh[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (pharaoh: Partial<Pharaoh>) => {
      // Ensure required fields are present
      if (!pharaoh.name || !pharaoh.dynasty || !pharaoh.period) {
        throw new Error("Name, dynasty, and period are required");
      }

      if (editingPharaoh) {
        const { error } = await supabase
          .from("pharaoh_timeline")
          .update(pharaoh)
          .eq("id", editingPharaoh.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("pharaoh_timeline")
          .insert([pharaoh as any]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pharaohs"] });
      toast({
        title: "Success",
        description: `Pharaoh ${editingPharaoh ? "updated" : "created"} successfully.`,
      });
      handleClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("pharaoh_timeline")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pharaohs"] });
      toast({
        title: "Success",
        description: "Pharaoh deleted successfully.",
      });
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("pharaoh-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("pharaoh-images")
        .getPublicUrl(filePath);

      setFormData({ ...formData, image_url: publicUrl });
      toast({
        title: "Success",
        description: "Image uploaded successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (pharaoh: Pharaoh) => {
    setEditingPharaoh(pharaoh);
    setFormData(pharaoh);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingPharaoh(null);
    setFormData({
      name: "",
      dynasty: "",
      period: "",
      reign_start: null,
      reign_end: null,
      achievements: "",
      significance: "",
      burial_location: "",
      image_url: "",
      image_caption: "",
      sort_order: 0,
      is_active: true,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Pharaoh Timeline Manager</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingPharaoh(null)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Pharaoh
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPharaoh ? "Edit Pharaoh" : "Add New Pharaoh"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dynasty">Dynasty *</Label>
                  <Input
                    id="dynasty"
                    value={formData.dynasty}
                    onChange={(e) => setFormData({ ...formData, dynasty: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="period">Period *</Label>
                  <Input
                    id="period"
                    value={formData.period}
                    onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="reign_start">Reign Start (BCE)</Label>
                  <Input
                    id="reign_start"
                    type="number"
                    value={formData.reign_start || ""}
                    onChange={(e) => setFormData({ ...formData, reign_start: parseInt(e.target.value) || null })}
                  />
                </div>
                <div>
                  <Label htmlFor="reign_end">Reign End (BCE)</Label>
                  <Input
                    id="reign_end"
                    type="number"
                    value={formData.reign_end || ""}
                    onChange={(e) => setFormData({ ...formData, reign_end: parseInt(e.target.value) || null })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="achievements">Achievements</Label>
                <Textarea
                  id="achievements"
                  value={formData.achievements || ""}
                  onChange={(e) => setFormData({ ...formData, achievements: e.target.value })}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="significance">Significance</Label>
                <Textarea
                  id="significance"
                  value={formData.significance || ""}
                  onChange={(e) => setFormData({ ...formData, significance: e.target.value })}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="burial_location">Burial Location</Label>
                <Input
                  id="burial_location"
                  value={formData.burial_location || ""}
                  onChange={(e) => setFormData({ ...formData, burial_location: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="image">Pharaoh Image</Label>
                <div className="flex items-center gap-4 mt-2">
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                  {formData.image_url && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setFormData({ ...formData, image_url: "" })}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                {formData.image_url && (
                  <div className="mt-2">
                    <img
                      src={formData.image_url}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded border-2 border-[hsl(var(--theme-yellow))]"
                    />
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="image_caption">Image Caption</Label>
                <Input
                  id="image_caption"
                  value={formData.image_caption || ""}
                  onChange={(e) => setFormData({ ...formData, image_caption: e.target.value })}
                  placeholder="Optional caption for the image"
                />
              </div>

              <div>
                <Label htmlFor="sort_order">Sort Order</Label>
                <Input
                  id="sort_order"
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saveMutation.isPending || uploading}>
                  {saveMutation.isPending ? "Saving..." : "Save"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {pharaohs?.map((pharaoh) => (
          <div
            key={pharaoh.id}
            className="p-4 border rounded-lg flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              {pharaoh.image_url && (
                <img
                  src={pharaoh.image_url}
                  alt={pharaoh.name}
                  className="w-16 h-16 object-cover rounded border-2 border-[hsl(var(--theme-yellow))]"
                />
              )}
              <div>
                <h3 className="font-semibold">{pharaoh.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {pharaoh.dynasty} - {pharaoh.period}
                </p>
                {pharaoh.reign_start && pharaoh.reign_end && (
                  <p className="text-sm text-muted-foreground">
                    {pharaoh.reign_start} - {pharaoh.reign_end} BCE
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEdit(pharaoh)}
              >
                <Pencil className="w-4 h-4" />
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => deleteMutation.mutate(pharaoh.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
