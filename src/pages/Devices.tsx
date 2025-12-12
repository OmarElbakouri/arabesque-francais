import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Smartphone,
    Tablet,
    Laptop,
    Monitor,
    HelpCircle,
    Trash2,
    LogOut,
    Shield,
    Clock,
    Wifi
} from 'lucide-react';
import { deviceSessionService, DeviceInfo } from '@/services/deviceSessionService';
import { useAuthStore } from '@/stores/authStore';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from 'sonner';

// Get device icon based on type
function getDeviceIcon(type: string) {
    switch (type?.toUpperCase()) {
        case 'PHONE':
            return <Smartphone className="h-8 w-8" />;
        case 'TABLET':
            return <Tablet className="h-8 w-8" />;
        case 'LAPTOP':
            return <Laptop className="h-8 w-8" />;
        case 'DESKTOP':
            return <Monitor className="h-8 w-8" />;
        default:
            return <HelpCircle className="h-8 w-8" />;
    }
}

// Format date to readable format
function formatDate(dateString: string): string {
    if (!dateString) return 'Jamais';

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} minute${diffMins > 1 ? 's' : ''}`;
    if (diffHours < 24) return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
    if (diffDays < 7) return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;

    return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

export default function DevicesPage() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuthStore();
    const [devices, setDevices] = useState<DeviceInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [removing, setRemoving] = useState<number | null>(null);

    // Redirect if not authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, navigate]);

    // Fetch devices on mount
    useEffect(() => {
        fetchDevices();
    }, []);

    const fetchDevices = async () => {
        try {
            setLoading(true);
            const devicesList = await deviceSessionService.getUserDevices();
            setDevices(devicesList);
        } catch (error) {
            console.error('Failed to fetch devices:', error);
            toast.error('Impossible de charger vos appareils');
        } finally {
            setLoading(false);
        }
    };

    const removeDevice = async (deviceId: number) => {
        try {
            setRemoving(deviceId);
            await deviceSessionService.removeDevice(deviceId);
            toast.success('Appareil supprimé avec succès');
            // Refresh devices list
            await fetchDevices();
        } catch (error: any) {
            console.error('Failed to remove device:', error);
            toast.error(error.message || 'Impossible de supprimer l\'appareil');
        } finally {
            setRemoving(null);
        }
    };

    const logoutFromAllDevices = async () => {
        try {
            setLoading(true);
            await deviceSessionService.logoutFromAllDevices();
            toast.success('Déconnecté de tous les appareils');
            // Logout current user
            useAuthStore.getState().logout();
            navigate('/login');
        } catch (error) {
            console.error('Failed to logout from all devices:', error);
            toast.error('Erreur lors de la déconnexion');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Mes Appareils
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Gérez les appareils connectés à votre compte. Maximum 3 appareils autorisés.
                </p>
            </div>

            {/* Info Card */}
            <Card className="mb-6 border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
                <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                        <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                        <div>
                            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                                Sécurité du compte
                            </h3>
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                                Vous pouvez vous connecter sur <strong>maximum 3 appareils</strong> différents.
                                Si vous vous connectez sur un 4ème appareil, le plus ancien sera automatiquement déconnecté.
                                <br /><br />
                                <strong>Note :</strong> Pendant un cours, une seule session peut être active à la fois.
                                Si vous commencez un cours sur un autre appareil, l'ancienne session sera terminée.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Devices Count */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Badge variant={devices.length >= 3 ? "destructive" : "secondary"}>
                        {devices.length} / 3 appareils
                    </Badge>
                </div>

                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                            <LogOut className="h-4 w-4 mr-2" />
                            Déconnecter tous les appareils
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Déconnecter tous les appareils ?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Vous serez déconnecté de tous vos appareils, y compris celui-ci.
                                Vous devrez vous reconnecter.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={logoutFromAllDevices}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                Déconnecter tout
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>

            {/* Devices List */}
            {loading ? (
                <div className="grid gap-4">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="animate-pulse">
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
                                    <div className="flex-1">
                                        <div className="h-5 w-32 bg-gray-200 rounded mb-2"></div>
                                        <div className="h-4 w-48 bg-gray-200 rounded"></div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : devices.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <Smartphone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            Aucun appareil enregistré
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Les appareils apparaîtront ici après votre connexion.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {devices.map((device) => (
                        <Card
                            key={device.id}
                            className={`transition-all ${device.isCurrentDevice
                                    ? 'border-green-500 bg-green-50/50 dark:bg-green-900/10'
                                    : ''
                                }`}
                        >
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-4">
                                    {/* Device Icon */}
                                    <div className={`p-3 rounded-lg ${device.isCurrentDevice
                                            ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
                                            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                        }`}>
                                        {getDeviceIcon(device.deviceType)}
                                    </div>

                                    {/* Device Info */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                                {device.deviceName || 'Appareil inconnu'}
                                            </h3>
                                            {device.isCurrentDevice && (
                                                <Badge className="bg-green-500 text-white">
                                                    Cet appareil
                                                </Badge>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {formatDate(device.lastLoginAt)}
                                            </span>
                                            {device.ipAddress && (
                                                <span className="flex items-center gap-1">
                                                    <Wifi className="h-3 w-3" />
                                                    {device.ipAddress}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    {!device.isCurrentDevice && (
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    disabled={removing === device.id}
                                                >
                                                    {removing === device.id ? (
                                                        <span className="animate-spin">⏳</span>
                                                    ) : (
                                                        <Trash2 className="h-5 w-5" />
                                                    )}
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Supprimer cet appareil ?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        L'appareil "{device.deviceName}" sera déconnecté de votre compte.
                                                        Pour le réutiliser, vous devrez vous reconnecter.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => removeDevice(device.id)}
                                                        className="bg-red-600 hover:bg-red-700"
                                                    >
                                                        Supprimer
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Back Button */}
            <div className="mt-8">
                <Button variant="outline" onClick={() => navigate(-1)}>
                    ← Retour
                </Button>
            </div>
        </div>
    );
}
