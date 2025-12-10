import { useEffect, useRef } from 'react';
import Hls from 'hls.js';

interface HLSVideoPlayerProps {
  src: string;
  title?: string;
  className?: string;
  autoPlay?: boolean;
  controls?: boolean;
}

export default function HLSVideoPlayer({
  src,
  title,
  className = 'w-full h-full',
  autoPlay = false,
  controls = true,
}: HLSVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    // Check if the source is an HLS stream
    const isHLS = src.includes('.m3u8');

    if (isHLS) {
      if (Hls.isSupported()) {
        // Use hls.js for browsers that don't natively support HLS
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 90,
        });

        hlsRef.current = hls;
        hls.loadSource(src);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          if (autoPlay) {
            video.play().catch(() => {
              // Autoplay was prevented, user needs to interact
              console.log('Autoplay prevented by browser');
            });
          }
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.error('HLS Network error, trying to recover...');
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.error('HLS Media error, trying to recover...');
                hls.recoverMediaError();
                break;
              default:
                console.error('HLS Fatal error, cannot recover');
                hls.destroy();
                break;
            }
          }
        });

        return () => {
          hls.destroy();
          hlsRef.current = null;
        };
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS support (Safari)
        video.src = src;
        if (autoPlay) {
          video.play().catch(() => {
            console.log('Autoplay prevented by browser');
          });
        }
      } else {
        console.error('HLS is not supported in this browser');
      }
    } else {
      // Regular video file
      video.src = src;
      if (autoPlay) {
        video.play().catch(() => {
          console.log('Autoplay prevented by browser');
        });
      }
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src, autoPlay]);

  return (
    <video
      ref={videoRef}
      title={title}
      className={className}
      controls={controls}
      controlsList="nodownload"
      playsInline
      crossOrigin="anonymous"
    >
      Votre navigateur ne supporte pas la lecture vidéo.
    </video>
  );
}
