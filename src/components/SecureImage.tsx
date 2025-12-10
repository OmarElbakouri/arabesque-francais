import { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';
import { api } from '@/lib/api';
import { getFullUrl } from '@/lib/utils';

interface SecureImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  fallback?: React.ReactNode;
}

export function SecureImage({ src, alt, className, fallback }: SecureImageProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!src) {
      setLoading(false);
      return;
    }

    let active = true;
    let objectUrl: string | null = null;

    const fetchImage = async () => {
      try {
        setLoading(true);
        setError(false);
        const fullUrl = getFullUrl(src);
        const response = await api.get(fullUrl, { responseType: 'blob' });
        
        if (active) {
          objectUrl = URL.createObjectURL(response.data);
          setImageSrc(objectUrl);
        }
      } catch (e) {
        console.error('Failed to load image', e);
        if (active) setError(true);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchImage();

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [src]);

  if (loading) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center animate-pulse ${className}`}>
        <FileText className="h-8 w-8 text-gray-300" />
      </div>
    );
  }

  if (error || !imageSrc) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <div className={`bg-gray-100 flex items-center justify-center ${className}`}>
        <FileText className="h-8 w-8 text-gray-400" />
      </div>
    );
  }

  return (
    <img 
      src={imageSrc} 
      alt={alt} 
      className={className} 
    />
  );
}
