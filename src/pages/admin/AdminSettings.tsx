import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { adminService } from '@/services/adminService';
import { Settings, Video, Save, Loader2, ExternalLink } from 'lucide-react';

export default function AdminSettings() {
  const { toast } = useToast();
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await adminService.getLandingVideo();
      if (data?.url) {
        setVideoUrl(data.url);
      }
    } catch (error) {
      // If setting doesn't exist yet, that's okay
      console.log('No existing video URL setting found');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveVideoUrl = async () => {
    try {
      setSaving(true);
      await adminService.updateLandingVideo(videoUrl);
      toast({
        title: 'Succès',
        description: 'URL de la vidéo mise à jour avec succès',
      });
    } catch (error) {
      console.error('Error saving video URL:', error);
      const errorMessage = error instanceof Error ? error.message : 'Impossible de sauvegarder l\'URL';
      toast({
        title: 'Erreur',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  // Extract video ID from Bunny URL for preview
  const getBunnyEmbedUrl = (url: string) => {
    if (!url) return null;
    // Handle various Bunny URL formats
    // Example: https://iframe.mediadelivery.net/embed/123456/video-id
    // or: https://video.bunnycdn.com/play/123456/video-id
    if (url.includes('iframe.mediadelivery.net') || url.includes('video.bunnycdn.com')) {
      return url;
    }
    return url;
  };

  const embedUrl = getBunnyEmbedUrl(videoUrl);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Paramètres du Site</h1>
          <p className="text-muted-foreground">
            Gérez les paramètres globaux de la plateforme
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="w-5 h-5" />
            Vidéo de la Page d'Accueil
          </CardTitle>
          <CardDescription>
            Configurez la vidéo qui sera affichée sur la landing page. Utilisez une URL Bunny CDN.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="videoUrl">URL de la Vidéo (Bunny CDN)</Label>
                <div className="flex gap-2">
                  <Input
                    id="videoUrl"
                    type="url"
                    placeholder="https://iframe.mediadelivery.net/embed/..."
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleSaveVideoUrl} 
                    disabled={saving}
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span className="ml-2">Sauvegarder</span>
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Exemple: https://iframe.mediadelivery.net/embed/123456/video-guid
                </p>
              </div>

              {/* Video Preview */}
              {embedUrl && (
                <div className="space-y-2">
                  <Label>Aperçu de la Vidéo</Label>
                  <div className="relative aspect-video bg-black rounded-lg overflow-hidden border">
                    <iframe
                      src={embedUrl}
                      title="Aperçu de la vidéo de la page d'accueil"
                      className="w-full h-full"
                      allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  <a 
                    href={videoUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Ouvrir dans un nouvel onglet
                  </a>
                </div>
              )}

              {!videoUrl && (
                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                  <Video className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Aucune vidéo configurée</p>
                  <p className="text-sm">Entrez une URL Bunny pour afficher une vidéo sur la landing page</p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
