import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2, Copy, Users, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Commercial {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  couponCode: string;
  totalClients: number;
  monthlyClients: number;
  totalRevenue: number;
  monthlyRevenue: number;
  commission: number;
  dateAjout: string;
}

export default function AdminSales() {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newCommercial, setNewCommercial] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    commission: 10,
  });

  // Mock data
  const [commercials] = useState<Commercial[]>([
    {
      id: '1',
      nom: 'السعيد',
      prenom: 'أحمد',
      email: 'ahmed@bclt.com',
      telephone: '+212600000010',
      couponCode: 'AHMED2024',
      totalClients: 45,
      monthlyClients: 8,
      totalRevenue: 13470,
      monthlyRevenue: 2392,
      commission: 10,
      dateAjout: '2024-01-01',
    },
    {
      id: '2',
      nom: 'المنصوري',
      prenom: 'خالد',
      email: 'khaled@bclt.com',
      telephone: '+212600000011',
      couponCode: 'KHALED2024',
      totalClients: 38,
      monthlyClients: 5,
      totalRevenue: 11362,
      monthlyRevenue: 1495,
      commission: 10,
      dateAjout: '2024-01-15',
    },
    {
      id: '3',
      nom: 'الزهري',
      prenom: 'ياسين',
      email: 'yassine@bclt.com',
      telephone: '+212600000012',
      couponCode: 'YASSINE2024',
      totalClients: 52,
      monthlyClients: 12,
      totalRevenue: 15548,
      monthlyRevenue: 3588,
      commission: 12,
      dateAjout: '2024-02-01',
    },
  ]);

  const totalStats = {
    totalClients: commercials.reduce((sum, c) => sum + c.totalClients, 0),
    monthlyClients: commercials.reduce((sum, c) => sum + c.monthlyClients, 0),
    totalRevenue: commercials.reduce((sum, c) => sum + c.totalRevenue, 0),
    monthlyRevenue: commercials.reduce((sum, c) => sum + c.monthlyRevenue, 0),
  };

  const generateCouponCode = () => {
    const code = `${newCommercial.prenom.toUpperCase()}${new Date().getFullYear()}`;
    return code;
  };

  const handleAddCommercial = () => {
    // Mock add functionality
    toast({
      title: 'تم إضافة التجاري بنجاح',
      description: `كود الكوبون: ${generateCouponCode()}`,
    });
    setIsAddDialogOpen(false);
    setNewCommercial({
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      commission: 10,
    });
  };

  const copyCouponCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: 'تم النسخ',
      description: 'تم نسخ كود الكوبون إلى الحافظة',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestion de l'Équipe Commerciale</h1>
          <p className="text-muted-foreground mt-1">Gérer les commerciaux et leurs codes promo</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Ajouter Commercial
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter un nouveau commercial</DialogTitle>
              <DialogDescription>
                Ajoutez un commercial et un code promo sera généré automatiquement
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prenom">Prénom</Label>
                  <Input
                    id="prenom"
                    value={newCommercial.prenom}
                    onChange={(e) =>
                      setNewCommercial({ ...newCommercial, prenom: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nom">Nom</Label>
                  <Input
                    id="nom"
                    value={newCommercial.nom}
                    onChange={(e) =>
                      setNewCommercial({ ...newCommercial, nom: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newCommercial.email}
                  onChange={(e) =>
                    setNewCommercial({ ...newCommercial, email: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telephone">Téléphone</Label>
                <Input
                  id="telephone"
                  value={newCommercial.telephone}
                  onChange={(e) =>
                    setNewCommercial({ ...newCommercial, telephone: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="commission">Commission (%)</Label>
                <Input
                  id="commission"
                  type="number"
                  value={newCommercial.commission}
                  onChange={(e) =>
                    setNewCommercial({
                      ...newCommercial,
                      commission: parseInt(e.target.value),
                    })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleAddCommercial}>Ajouter</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Clients</p>
                <p className="text-3xl font-bold text-primary">{totalStats.totalClients}</p>
              </div>
              <Users className="h-10 w-10 text-primary/20" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Clients ce mois</p>
                <p className="text-3xl font-bold text-success">{totalStats.monthlyClients}</p>
              </div>
              <Users className="h-10 w-10 text-success/20" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Revenus Totaux</p>
                <p className="text-3xl font-bold text-secondary">{totalStats.totalRevenue} DH</p>
              </div>
              <DollarSign className="h-10 w-10 text-secondary/20" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Revenus du mois</p>
                <p className="text-3xl font-bold text-warning">{totalStats.monthlyRevenue} DH</p>
              </div>
              <DollarSign className="h-10 w-10 text-warning/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Commercials Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Commerciaux</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Commercial</TableHead>
                  <TableHead>Code Promo</TableHead>
                  <TableHead>Total Clients</TableHead>
                  <TableHead>Clients du mois</TableHead>
                  <TableHead>Revenus Totaux</TableHead>
                  <TableHead>Revenus du mois</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {commercials.map((commercial) => (
                  <TableRow key={commercial.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{commercial.prenom} {commercial.nom}</p>
                        <p className="text-sm text-muted-foreground">{commercial.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono">
                          {commercial.couponCode}
                        </Badge>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => copyCouponCode(commercial.couponCode)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-bold text-primary">{commercial.totalClients}</p>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-success text-white">
                        +{commercial.monthlyClients}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{commercial.totalRevenue} DH</p>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-success">
                        {commercial.monthlyRevenue} DH
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-secondary text-secondary-foreground">
                        {commercial.commission}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="icon" variant="ghost" onClick={() => console.log('Edit commercial', commercial.id)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => console.log('Delete commercial', commercial.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
