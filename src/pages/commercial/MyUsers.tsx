import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { getMyUsers } from '@/services/commercialService';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users } from 'lucide-react';

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  promoCodeUsed: string;
  createdAt: string;
  planName: string;
}

export default function MyUsers() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await getMyUsers();
      console.log('👥 Mes utilisateurs:', data);
      setUsers(data || []);
    } catch (error) {
      console.error('❌ Erreur chargement utilisateurs:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de charger la liste des utilisateurs'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { color: string; label: string }> = {
      'EN_ATTENTE': { color: 'bg-yellow-500', label: 'En Attente' },
      'VALIDE': { color: 'bg-green-500', label: 'Validé' },
      'REJETE': { color: 'bg-red-500', label: 'Rejeté' },
    };
    const { color, label } = variants[status] || { color: 'bg-gray-500', label: status };
    return <Badge className={`${color} text-white`}>{label}</Badge>;
  };

  const getPlanBadge = (plan: string) => {
    return (
      <Badge variant={plan === 'VIP' ? 'default' : 'secondary'}>
        {plan}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/commercial')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour au Dashboard
        </Button>
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8" />
          <div>
            <h1 className="text-3xl font-bold">Mes Utilisateurs</h1>
            <p className="text-gray-500 mt-1">Liste des utilisateurs créés par moi</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Utilisateurs créés ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Chargement...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Aucun utilisateur trouvé</p>
              <Button
                className="mt-4"
                onClick={() => navigate('/commercial/create-user')}
              >
                Créer un utilisateur
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom complet</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Code Promo</TableHead>
                    <TableHead>Date d'inscription</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.firstName} {user.lastName}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{getPlanBadge(user.planName)}</TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell>
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                          {user.promoCodeUsed || '-'}
                        </code>
                      </TableCell>
                      <TableCell>
                        {new Date(user.createdAt).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
