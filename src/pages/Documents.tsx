import { useState, useEffect } from 'react';
import { FileText, Download, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/authStore';
import { documentService, DocumentDTO } from '@/services/documentService';
import { api } from '@/lib/api';
import { SecureImage } from '@/components/SecureImage';
import { getFullUrl } from '@/lib/utils';

export default function Documents() {
  const { toast } = useToast();
  const { user } = useAuthStore();
  const [documents, setDocuments] = useState<DocumentDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  useEffect(() => {
    const loadDocuments = async () => {
      try {
        setLoading(true);
        const data = await documentService.getPublishedDocuments();
        console.log('Documents received:', data);
        
        // Ensure data is an array
        setDocuments(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Erreur lors du chargement des documents:', error);
        toast({
          title: 'خطأ',
          description: 'تعذر تحميل المستندات',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadDocuments();
  }, [toast]);

  const isLocked = (doc: DocumentDTO) => {
    if (!doc.visibility || doc.visibility === 'ALL') return false;
    if (user?.role === 'ADMIN' || user?.role === 'COMMERCIAL') return false;
    // Check if user has a paid plan (NORMAL or VIP)
    if (user?.plan === 'NORMAL' || user?.plan === 'VIP') return false;
    return true;
  };

  const handleDownload = async (doc: DocumentDTO) => {
    if (!doc.fileUrl) return;
    
    try {
      setDownloadingId(doc.id);
      const url = getFullUrl(doc.fileUrl);
      const response = await api.get(url, { responseType: 'blob' });
      
      // Create a blob URL and trigger download
      const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', doc.title + (doc.fileUrl.endsWith('.pdf') ? '.pdf' : ''));
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
      
      toast({
        title: 'نجاح',
        description: 'تم تحميل الملف بنجاح',
      });
    } catch (error) {
      console.error('Download failed', error);
      toast({
        title: 'خطأ',
        description: 'فشل تحميل الملف. تأكد من صلاحياتك.',
        variant: 'destructive',
      });
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      <h1 className="text-3xl font-bold mb-8 text-primary">المستندات</h1>
      
      {documents.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
          <p>لا توجد مستندات متاحة حالياً.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc) => {
            const locked = isLocked(doc);
            return (
              <Card key={doc.id} className={`flex flex-col h-full hover:shadow-lg transition-shadow duration-300 overflow-hidden ${locked ? 'opacity-90' : ''}`}>
                {/* Image Section */}
                <div className="relative h-48 w-full bg-gray-100 flex items-center justify-center overflow-hidden">
                  {doc.imageUrl ? (
                    <SecureImage 
                      src={doc.imageUrl} 
                      alt={doc.title} 
                      className={`object-cover w-full h-full transition-transform duration-300 ${locked ? '' : 'hover:scale-105'}`}
                    />
                  ) : (
                    <FileText className="h-16 w-16 text-gray-400" />
                  )}
                  
                  {locked && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10 backdrop-blur-[2px]">
                      <Lock className="h-12 w-12 text-white drop-shadow-lg" />
                    </div>
                  )}

                  <Badge className="absolute top-2 right-2 z-20" variant="secondary">
                    {doc.category}
                  </Badge>
                </div>

                <CardHeader>
                  <CardTitle className="text-xl font-bold line-clamp-1">{doc.title}</CardTitle>
                </CardHeader>
                
                <CardContent className="flex-grow">
                  <p className="text-muted-foreground line-clamp-3 text-sm">
                    {doc.description}
                  </p>
                  {doc.fileSize && (
                    <p className="text-xs text-gray-400 mt-2">
                      الحجم: {doc.fileSize}
                    </p>
                  )}
                </CardContent>

                <CardFooter className="pt-4 border-t">
                  {locked ? (
                    <Button className="w-full gap-2" variant="secondary" disabled>
                      <Lock className="h-4 w-4" />
                      متاح للمشتركين فقط
                    </Button>
                  ) : (
                    <Button 
                      className="w-full gap-2" 
                      onClick={() => handleDownload(doc)}
                      disabled={downloadingId === doc.id}
                    >
                      {downloadingId === doc.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Download className="h-4 w-4 ml-2" />
                      )}
                      {downloadingId === doc.id ? 'جاري التحميل...' : 'تحميل'}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
