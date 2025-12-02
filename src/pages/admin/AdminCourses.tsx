import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  FileText,
  Upload,
  Image,
  BookOpen,
  Users,
  Clock,
  Layers,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { adminService } from '@/services/adminService';

// Interfaces TypeScript
interface Course {
  id: number;
  title?: string;
  name?: string; // Alternative field name from API
  description?: string;
  level?: string;
  imageUrl?: string;
  pdfUrl?: string;
  visibility?: 'NORMAL_AND_VIP' | 'ALL';
  status?: 'DRAFT' | 'PUBLISHED';
  price?: number;
  durationHours?: number;
  totalStudents?: number;
  chaptersCount?: number;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface CourseFormData {
  title: string;
  description: string;
  level: string;
  visibility: 'NORMAL_AND_VIP' | 'ALL';
  imageUrl: string;
  pdfUrl: string;
  price: number;
  durationHours: number;
}

export default function AdminCourses() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [visibilityFilter, setVisibilityFilter] = useState<string>('all');
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const [pendingPdfFile, setPendingPdfFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<CourseFormData>({
    title: '',
    description: '',
    level: '',
    visibility: 'NORMAL_AND_VIP',
    imageUrl: '',
    pdfUrl: '',
    price: 0,
    durationHours: 0,
  });

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllCourses();
      setCourses(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des cours:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les cours',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async () => {
    try {
      if (!formData.title || !formData.description || !formData.level) {
        toast({
          title: 'Erreur',
          description: 'Veuillez remplir tous les champs obligatoires',
          variant: 'destructive',
        });
        return;
      }

      // Créer le cours d'abord (sans les URLs de fichiers)
      const newCourse = await adminService.createCourse({
        title: formData.title,
        description: formData.description,
        level: formData.level,
        visibility: formData.visibility,
        price: formData.price,
        durationHours: formData.durationHours,
      });

      const courseId = newCourse?.id;

      // Si on a des fichiers en attente, les uploader maintenant
      if (courseId) {
        if (pendingImageFile) {
          try {
            await adminService.uploadCourseImage(courseId, pendingImageFile);
          } catch (err) {
            console.error('Erreur upload image:', err);
          }
        }
        if (pendingPdfFile) {
          try {
            await adminService.uploadCoursePdf(courseId, pendingPdfFile);
          } catch (err) {
            console.error('Erreur upload PDF:', err);
          }
        }
      }

      toast({
        title: 'Succès',
        description: 'Cours créé avec succès',
      });

      setIsCreateModalOpen(false);
      resetForm();
      loadCourses();
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de créer le cours',
        variant: 'destructive',
      });
    }
  };

  const handleEditCourse = async () => {
    if (!editingCourse) return;

    try {
      await adminService.updateCourse(editingCourse.id, {
        name: formData.title,
        description: formData.description,
        level: formData.level,
        visibility: formData.visibility,
        imageUrl: formData.imageUrl || undefined,
        pdfUrl: formData.pdfUrl || undefined,
        price: formData.price,
        durationHours: formData.durationHours,
      });

      toast({
        title: 'Succès',
        description: 'Cours modifié avec succès',
      });

      setIsEditModalOpen(false);
      setEditingCourse(null);
      resetForm();
      loadCourses();
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de modifier le cours',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteCourse = async (id: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce cours ?')) {
      return;
    }

    try {
      await adminService.deleteCourse(id);
      toast({
        title: 'Succès',
        description: 'Cours supprimé avec succès',
      });
      loadCourses();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le cours',
        variant: 'destructive',
      });
    }
  };

  const handlePublishCourse = async (id: number) => {
    try {
      await adminService.publishCourse(id);
      toast({
        title: 'Succès',
        description: 'Cours publié avec succès',
      });
      loadCourses();
    } catch (error) {
      console.error('Erreur lors de la publication:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de publier le cours',
        variant: 'destructive',
      });
    }
  };

  const handleUnpublishCourse = async (id: number) => {
    try {
      await adminService.unpublishCourse(id);
      toast({
        title: 'Succès',
        description: 'Cours dépublié avec succès',
      });
      loadCourses();
    } catch (error) {
      console.error('Erreur lors de la dépublication:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de dépublier le cours',
        variant: 'destructive',
      });
    }
  };

  const openEditModal = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title || course.name || '',
      description: course.description || '',
      level: course.level || '',
      visibility: course.visibility || 'NORMAL_AND_VIP',
      imageUrl: course.imageUrl || '',
      pdfUrl: course.pdfUrl || '',
      price: course.price ?? 0,
      durationHours: course.durationHours ?? 0,
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
      pdfUrl: '',
      price: 0,
      durationHours: 0,
    });
    setPendingImageFile(null);
    setPendingPdfFile(null);
  };

  // Pour la création: on stocke les fichiers localement
  // Pour l'édition: on upload directement car on a le courseId
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Si on est en mode édition, upload direct
    if (editingCourse) {
      try {
        setUploading(true);
        const result = await adminService.uploadCourseImage(editingCourse.id, file);
        setFormData({ ...formData, imageUrl: result.imagePath || result.imageUrl });
        toast({
          title: 'Succès',
          description: 'Image uploadée avec succès',
        });
      } catch (error) {
        console.error('Erreur upload image:', error);
        toast({
          title: 'Erreur',
          description: "Impossible d'uploader l'image",
          variant: 'destructive',
        });
      } finally {
        setUploading(false);
      }
    } else {
      // Mode création: stocker le fichier pour l'uploader après création
      setPendingImageFile(file);
      setFormData({ ...formData, imageUrl: file.name }); // Afficher le nom du fichier
      toast({
        title: 'Fichier sélectionné',
        description: `Image "${file.name}" sera uploadée après la création du cours`,
      });
    }
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Si on est en mode édition, upload direct
    if (editingCourse) {
      try {
        setUploading(true);
        const result = await adminService.uploadCoursePdf(editingCourse.id, file);
        setFormData({ ...formData, pdfUrl: result.pdfPath || result.pdfUrl });
        toast({
          title: 'Succès',
          description: 'PDF uploadé avec succès',
        });
      } catch (error) {
        console.error('Erreur upload PDF:', error);
        toast({
          title: 'Erreur',
          description: "Impossible d'uploader le PDF",
          variant: 'destructive',
        });
      } finally {
        setUploading(false);
      }
    } else {
      // Mode création: stocker le fichier pour l'uploader après création
      setPendingPdfFile(file);
      setFormData({ ...formData, pdfUrl: file.name }); // Afficher le nom du fichier
      toast({
        title: 'Fichier sélectionné',
        description: `PDF "${file.name}" sera uploadé après la création du cours`,
      });
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

  const filteredCourses = courses.filter((course) => {
    const courseTitle = course.title || course.name || '';
    const matchesSearch = courseTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || course.status === statusFilter;
    const matchesVisibility = visibilityFilter === 'all' || course.visibility === visibilityFilter;
    return matchesSearch && matchesStatus && matchesVisibility;
  });

  // Stats calculations
  const stats = {
    total: courses.length,
    published: courses.filter((c) => c.status === 'PUBLISHED').length,
    draft: courses.filter((c) => c.status === 'DRAFT').length,
    totalStudents: courses.reduce((sum, c) => sum + (c.totalStudents || 0), 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Cours</h1>
          <p className="text-gray-500 mt-1">Gérez les cours et leur contenu</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau Cours
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-gray-500">Total Cours</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-full">
                <Eye className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.published}</p>
                <p className="text-sm text-gray-500">Publiés</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-full">
                <EyeOff className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.draft}</p>
                <p className="text-sm text-gray-500">Brouillons</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-full">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalStudents}</p>
                <p className="text-sm text-gray-500">Total Étudiants</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Rechercher un cours..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
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
                <SelectItem value="ALL">Tous (FREE+NORMAL+VIP)</SelectItem>
                <SelectItem value="NORMAL_AND_VIP">NORMAL + VIP</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Courses Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Cours ({filteredCourses.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Chargement...</div>
          ) : filteredCourses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Aucun cours trouvé</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cours</TableHead>
                  <TableHead>Niveau</TableHead>
                  <TableHead>Prix</TableHead>
                  <TableHead>Chapitres</TableHead>
                  <TableHead>Étudiants</TableHead>
                  <TableHead>Visibilité</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCourses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {course.imageUrl ? (
                          <img
                            src={course.imageUrl}
                            alt={course.title || course.name || 'Course'}
                            className="w-12 h-12 rounded object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                            <BookOpen className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{course.title || course.name || 'Sans titre'}</p>
                          <p className="text-sm text-gray-500 line-clamp-1">
                            {course.description || 'Aucune description'}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{course.level || 'N/A'}</Badge>
                    </TableCell>
                    <TableCell>
                      {(course.price ?? 0) > 0 ? `${course.price} DH` : 'Gratuit'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Layers className="h-4 w-4 text-gray-400" />
                        {course.chaptersCount || 0}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-gray-400" />
                        {course.totalStudents || 0}
                      </div>
                    </TableCell>
                    <TableCell>{getVisibilityBadge(course.visibility || 'NORMAL_AND_VIP')}</TableCell>
                    <TableCell>{getStatusBadge(course.status || 'DRAFT')}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/admin/courses/${course.id}/chapters`)}
                          title="Gérer les chapitres"
                        >
                          <Layers className="h-4 w-4" />
                        </Button>
                        {(course.status || 'DRAFT') === 'DRAFT' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePublishCourse(course.id)}
                            title="Publier"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUnpublishCourse(course.id)}
                            title="Dépublier"
                          >
                            <EyeOff className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditModal(course)}
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteCourse(course.id)}
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Créer un nouveau cours</DialogTitle>
            <DialogDescription>
              Remplissez les informations du cours. Les champs marqués * sont obligatoires.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Titre du cours"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="level">Niveau *</Label>
                <Select
                  value={formData.level}
                  onValueChange={(value) => setFormData({ ...formData, level: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner le niveau" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Débutant">Débutant</SelectItem>
                    <SelectItem value="Intermédiaire">Intermédiaire</SelectItem>
                    <SelectItem value="Avancé">Avancé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description du cours"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Prix (DH)</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })
                  }
                  placeholder="0 pour gratuit"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Durée (heures)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="0"
                  value={formData.durationHours}
                  onChange={(e) =>
                    setFormData({ ...formData, durationHours: parseFloat(e.target.value) || 0 })
                  }
                  placeholder="Durée estimée"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="visibility">Visibilité</Label>
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Image du cours</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="w-full">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      disabled={uploading}
                      asChild
                    >
                      <span>
                        <Image className="mr-2 h-4 w-4" />
                        {uploading ? 'Upload...' : 'Uploader image'}
                      </span>
                    </Button>
                  </label>
                </div>
                {formData.imageUrl && (
                  <p className="text-xs text-green-600">✓ Image uploadée</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>PDF du cours</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept=".pdf"
                    onChange={handlePdfUpload}
                    disabled={uploading}
                    className="hidden"
                    id="pdf-upload"
                  />
                  <label htmlFor="pdf-upload" className="w-full">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      disabled={uploading}
                      asChild
                    >
                      <span>
                        <FileText className="mr-2 h-4 w-4" />
                        {uploading ? 'Upload...' : 'Uploader PDF'}
                      </span>
                    </Button>
                  </label>
                </div>
                {formData.pdfUrl && <p className="text-xs text-green-600">✓ PDF uploadé</p>}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreateCourse}>Créer le cours</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier le cours</DialogTitle>
            <DialogDescription>
              Modifiez les informations du cours.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Titre *</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Titre du cours"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-level">Niveau *</Label>
                <Select
                  value={formData.level}
                  onValueChange={(value) => setFormData({ ...formData, level: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner le niveau" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Débutant">Débutant</SelectItem>
                    <SelectItem value="Intermédiaire">Intermédiaire</SelectItem>
                    <SelectItem value="Avancé">Avancé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description *</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description du cours"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-price">Prix (DH)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  min="0"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })
                  }
                  placeholder="0 pour gratuit"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-duration">Durée (heures)</Label>
                <Input
                  id="edit-duration"
                  type="number"
                  min="0"
                  value={formData.durationHours}
                  onChange={(e) =>
                    setFormData({ ...formData, durationHours: parseFloat(e.target.value) || 0 })
                  }
                  placeholder="Durée estimée"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-visibility">Visibilité</Label>
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Image du cours</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="hidden"
                    id="edit-image-upload"
                  />
                  <label htmlFor="edit-image-upload" className="w-full">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      disabled={uploading}
                      asChild
                    >
                      <span>
                        <Image className="mr-2 h-4 w-4" />
                        {uploading ? 'Upload...' : 'Uploader image'}
                      </span>
                    </Button>
                  </label>
                </div>
                {formData.imageUrl && (
                  <p className="text-xs text-green-600">✓ Image: {formData.imageUrl}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>PDF du cours</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept=".pdf"
                    onChange={handlePdfUpload}
                    disabled={uploading}
                    className="hidden"
                    id="edit-pdf-upload"
                  />
                  <label htmlFor="edit-pdf-upload" className="w-full">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      disabled={uploading}
                      asChild
                    >
                      <span>
                        <FileText className="mr-2 h-4 w-4" />
                        {uploading ? 'Upload...' : 'Uploader PDF'}
                      </span>
                    </Button>
                  </label>
                </div>
                {formData.pdfUrl && (
                  <p className="text-xs text-green-600">✓ PDF: {formData.pdfUrl}</p>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleEditCourse}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
