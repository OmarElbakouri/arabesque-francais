import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Users,
  Clock,
  BookOpen,
  Download,
  Upload,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { adminService } from '@/services/adminService';

// Interfaces TypeScript
interface Document {
  id: number;
  title: string;
  description: string;
  level: string;
  imageUrl?: string;
  fileUrl?: string;
  visibility: 'NORMAL_AND_VIP' | 'ALL';
  status: 'DRAFT' | 'PUBLISHED';
  durationHours: number;
  totalStudents: number;
  chaptersCount: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface DocumentFormData {
  title: string;
  description: string;
  level: string;
  visibility: 'NORMAL_AND_VIP' | 'ALL';
  imageUrl: string;
  fileUrl: string;
  durationHours: number;
}

export default function AdminDocuments() {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [visibilityFilter, setVisibilityFilter] = useState<string>('all');
  const [formData, setFormData] = useState<DocumentFormData>({
    title: '',
    description: '',
    level: '',
    visibility: 'NORMAL_AND_VIP',
    imageUrl: '',
    fileUrl: '',
    durationHours: 0,
  });

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllDocuments();
      setDocuments(Array.isArray(data) ? data : []);
    } catch (error: unknown) {
      console.error('Erreur lors du chargement des documents:', error);
      const axiosError = error as { response?: { status?: number; data?: { message?: string } } };
      const errorMessage = axiosError.response?.data?.message || 'Impossible de charger les documents';
      toast({
        title: 'Erreur',
        description: errorMessage,
        variant: 'destructive',
      });
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDocument = async () => {
    try {
      if (!formData.title || !formData.description || !formData.level) {
        toast({
          title: 'Erreur',
          description: 'Veuillez remplir tous les champs obligatoires',
          variant: 'destructive',
        });
        return;
      }

      await adminService.createDocument({
        title: formData.title,
        description: formData.description,
        level: formData.level,
        visibility: formData.visibility,
        imageUrl: formData.imageUrl || undefined,
        fileUrl: formData.fileUrl || undefined,
        durationHours: formData.durationHours,
      });

      toast({
        title: 'Succès',
        description: 'Document créé avec succès',
      });

      setIsCreateModalOpen(false);
      resetForm();
      loadDocuments();
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de créer le document',
        variant: 'destructive',
      });
    }
  };

  const handleEditDocument = async () => {
    if (!editingDocument) return;

    try {
      await adminService.updateDocument(editingDocument.id, {
        title: formData.title,
        description: formData.description,
        level: formData.level,
        visibility: formData.visibility,
        // Send null to clear the field, or the value if set
        imageUrl: formData.imageUrl === '' ? null : formData.imageUrl,
        fileUrl: formData.fileUrl === '' ? null : formData.fileUrl,
        durationHours: formData.durationHours,
      });

      toast({
        title: 'Succès',
        description: 'Document modifié avec succès',
      });

      setIsEditModalOpen(false);
      setEditingDocument(null);
      resetForm();
      loadDocuments();
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de modifier le document',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteDocument = async (id: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
      return;
    }

    try {
      await adminService.deleteDocument(id);
      toast({
        title: 'Succès',
        description: 'Document supprimé avec succès',
      });
      loadDocuments();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le document',
        variant: 'destructive',
      });
    }
  };

  const handlePublishDocument = async (id: number) => {
    try {
      await adminService.publishDocument(id);
      toast({
        title: 'Succès',
        description: 'Document publié avec succès',
      });
      loadDocuments();
    } catch (error) {
      console.error('Erreur lors de la publication:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de publier le document',
        variant: 'destructive',
      });
    }
  };

  const handleUnpublishDocument = async (id: number) => {
    try {
      await adminService.unpublishDocument(id);
      toast({
        title: 'Succès',
        description: 'Document dépublié avec succès',
      });
      loadDocuments();
    } catch (error) {
      console.error('Erreur lors de la dépublication:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de dépublier le document',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateVisibility = async (id: number, visibility: 'NORMAL_AND_VIP' | 'ALL') => {
    try {
      await adminService.updateDocumentVisibility(id, visibility);
      toast({
        title: 'Succès',
        description: 'Visibilité mise à jour avec succès',
      });
      loadDocuments();
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour la visibilité',
        variant: 'destructive',
      });
    }
  };

  const openEditModal = (document: Document) => {
    setEditingDocument(document);
    setFormData({
      title: document.title,
      description: document.description,
      level: document.level,
      visibility: document.visibility,
      imageUrl: document.imageUrl || '',
      fileUrl: document.fileUrl || '',
      durationHours: document.durationHours,
    });
    setIsEditModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      level: '',
      visibility: 'NORMAL_AND_VIP',
      imageUrl: '',
      fileUrl: '',
      durationHours: 0,
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const result = await adminService.uploadDocumentImage(file);
      setFormData({ ...formData, imageUrl: result.imagePath });
      toast({
        title: 'Succès',
        description: 'Image uploadée avec succès',
      });
    } catch (error) {
      console.error('Erreur upload image:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'uploader l\'image',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const result = await adminService.uploadDocumentPdf(file);
      setFormData({ ...formData, fileUrl: result.pdfPath });
      toast({
        title: 'Succès',
        description: 'PDF uploadé avec succès',
      });
    } catch (error) {
      console.error('Erreur upload PDF:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'uploader le PDF',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    return status === 'PUBLISHED' ? (
      <Badge className="bg-green-500 text-white">
        <Eye className="mr-1 h-3 w-3" />
        Publié
      </Badge>
    ) : (
      <Badge className="bg-gray-500 text-white">
        <EyeOff className="mr-1 h-3 w-3" />
        Brouillon
      </Badge>
    );
  };

  const getVisibilityBadge = (visibility: string) => {
    return visibility === 'ALL' ? (
      <Badge className="bg-blue-500 text-white">Tous (FREE+NORMAL+VIP)</Badge>
    ) : (
      <Badge className="bg-purple-500 text-white">NORMAL + VIP</Badge>
    );
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    const matchesVisibility = visibilityFilter === 'all' || doc.visibility === visibilityFilter;
    return matchesStatus && matchesVisibility;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Documents</h1>
          <p className="text-gray-500 mt-1">
            Documents et formations gratuits pour les utilisateurs NORMAL et VIP
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau Document
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="PUBLISHED">Publiés</SelectItem>
                <SelectItem value="DRAFT">Brouillons</SelectItem>
              </SelectContent>
            </Select>

            <Select value={visibilityFilter} onValueChange={setVisibilityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrer par visibilité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les visibilités</SelectItem>
                <SelectItem value="NORMAL_AND_VIP">NORMAL + VIP</SelectItem>
                <SelectItem value="ALL">Tous (FREE inclus)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Documents Table */}
      <Card>
        <CardContent className="p-6">
          {loading ? (
            <div className="text-center py-12">Chargement...</div>
          ) : filteredDocuments.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">Aucun document trouvé</h3>
              <p className="mt-2 text-sm text-gray-500">
                Commencez par créer un nouveau document
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Titre</TableHead>
                    <TableHead>Niveau</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Visibilité</TableHead>
                    <TableHead>
                      <Users className="inline h-4 w-4 mr-1" />
                      Étudiants
                    </TableHead>
                    <TableHead>
                      <Clock className="inline h-4 w-4 mr-1" />
                      Durée
                    </TableHead>
                    <TableHead>
                      <BookOpen className="inline h-4 w-4 mr-1" />
                      Chapitres
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{doc.title}</span>
                          <span className="text-xs text-gray-500 line-clamp-1">
                            {doc.description}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{doc.level}</TableCell>
                      <TableCell>{getStatusBadge(doc.status)}</TableCell>
                      <TableCell>{getVisibilityBadge(doc.visibility)}</TableCell>
                      <TableCell>{doc.totalStudents}</TableCell>
                      <TableCell>{doc.durationHours}h</TableCell>
                      <TableCell>{doc.chaptersCount}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          {doc.status === 'DRAFT' ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handlePublishDocument(doc.id)}
                            >
                              <Eye className="mr-1 h-4 w-4" />
                              Publier
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUnpublishDocument(doc.id)}
                            >
                              <EyeOff className="mr-1 h-4 w-4" />
                              Dépublier
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditModal(doc)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteDocument(doc.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Créer un nouveau document</DialogTitle>
            <DialogDescription>
              Les documents sont des ressources gratuites pour les utilisateurs NORMAL et VIP
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4 overflow-y-auto flex-1 pr-2">
            <div className="space-y-2">
              <Label htmlFor="title">Titre *</Label>
              <Input
                id="title"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Formation en français"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description complète du document..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="level">Niveau *</Label>
                <Input
                  id="level"
                  value={formData.level || ''}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  placeholder="Débutant, Intermédiaire, Avancé..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="durationHours">Durée (heures)</Label>
                <Input
                  id="durationHours"
                  type="number"
                  min="0"
                  value={formData.durationHours || 0}
                  onChange={(e) =>
                    setFormData({ ...formData, durationHours: parseInt(e.target.value) || 0 })
                  }
                  placeholder="40"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="visibility">Visibilité *</Label>
              <Select
                value={formData.visibility}
                onValueChange={(value: 'NORMAL_AND_VIP' | 'ALL') =>
                  setFormData({ ...formData, visibility: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NORMAL_AND_VIP">NORMAL + VIP uniquement</SelectItem>
                  <SelectItem value="ALL">Tous (FREE + NORMAL + VIP)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image de couverture</Label>
              <Input
                id="imageUrl"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif"
                onChange={handleImageUpload}
                disabled={uploading}
              />
              {formData.imageUrl && (
                <div className="mt-2 p-2 bg-gray-100 rounded flex items-center justify-between">
                  <span className="text-sm text-gray-600">✓ Image: {formData.imageUrl}</span>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setFormData({ ...formData, imageUrl: '' })}
                  >
                    Supprimer
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="pdfUrl">Document PDF</Label>
              <Input
                id="pdfUrl"
                type="file"
                accept="application/pdf"
                onChange={handlePdfUpload}
                disabled={uploading}
              />
              {formData.fileUrl && (
                <div className="mt-2 p-2 bg-gray-100 rounded flex items-center justify-between">
                  <span className="text-sm text-gray-600">✓ PDF: {formData.fileUrl}</span>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setFormData({ ...formData, fileUrl: '' })}
                  >
                    Supprimer
                  </Button>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateModalOpen(false);
                resetForm();
              }}
              disabled={uploading}
            >
              Annuler
            </Button>
            <Button onClick={handleCreateDocument} disabled={uploading}>
              {uploading ? (
                <>
                  <Upload className="mr-2 h-4 w-4 animate-spin" />
                  Upload...
                </>
              ) : (
                'Créer'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Modifier le document</DialogTitle>
            <DialogDescription>
              Modifiez les informations du document
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4 overflow-y-auto flex-1 pr-2">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Titre *</Label>
              <Input
                id="edit-title"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description *</Label>
              <Textarea
                id="edit-description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-level">Niveau *</Label>
                <Input
                  id="edit-level"
                  value={formData.level || ''}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-durationHours">Durée (heures)</Label>
                <Input
                  id="edit-durationHours"
                  type="number"
                  min="0"
                  value={formData.durationHours || 0}
                  onChange={(e) =>
                    setFormData({ ...formData, durationHours: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-visibility">Visibilité *</Label>
              <Select
                value={formData.visibility}
                onValueChange={(value: 'NORMAL_AND_VIP' | 'ALL') =>
                  setFormData({ ...formData, visibility: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NORMAL_AND_VIP">NORMAL + VIP uniquement</SelectItem>
                  <SelectItem value="ALL">Tous (FREE + NORMAL + VIP)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-imageUrl">Image de couverture</Label>
              <Input
                id="edit-imageUrl"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif"
                onChange={handleImageUpload}
                disabled={uploading}
              />
              {formData.imageUrl && (
                <div className="mt-2 p-2 bg-gray-100 rounded flex items-center justify-between">
                  <span className="text-sm text-gray-600">✓ Image: {formData.imageUrl}</span>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setFormData({ ...formData, imageUrl: '' })}
                  >
                    Supprimer
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-pdfUrl">Document PDF</Label>
              <Input
                id="edit-pdfUrl"
                type="file"
                accept="application/pdf"
                onChange={handlePdfUpload}
                disabled={uploading}
              />
              {formData.fileUrl && (
                <div className="mt-2 p-2 bg-gray-100 rounded flex items-center justify-between">
                  <span className="text-sm text-gray-600">✓ PDF: {formData.fileUrl}</span>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setFormData({ ...formData, fileUrl: '' })}
                  >
                    Supprimer
                  </Button>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditModalOpen(false);
                setEditingDocument(null);
                resetForm();
              }}
              disabled={uploading}
            >
              Annuler
            </Button>
            <Button onClick={handleEditDocument} disabled={uploading}>
              {uploading ? (
                <>
                  <Upload className="mr-2 h-4 w-4 animate-spin" />
                  Upload...
                </>
              ) : (
                'Enregistrer'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
