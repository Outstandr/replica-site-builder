import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface VideoPlayerProps {
  src: string;
  poster?: string;
  subtitles?: {
    src: string;
    label: string;
    language: string;
  }[];
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
  startTime?: number;
  endTime?: number;
  className?: string;
}

const VideoPlayer = ({
  src,
  poster,
  subtitles = [],
  onProgress,
  onComplete,
  startTime = 0,
  endTime,
  className,
}: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const current = video.currentTime;
      setCurrentTime(current);
      
      const effectiveDuration = endTime || video.duration;
      const effectiveStart = startTime || 0;
      const progress = ((current - effectiveStart) / (effectiveDuration - effectiveStart)) * 100;
      onProgress?.(Math.min(100, Math.max(0, progress)));

      if (endTime && current >= endTime) {
        video.pause();
        setIsPlaying(false);
        onComplete?.();
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(endTime || video.duration);
      if (startTime) {
        video.currentTime = startTime;
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      onComplete?.();
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
    };
  }, [startTime, endTime, onProgress, onComplete]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;
    
    const effectiveStart = startTime || 0;
    const effectiveDuration = endTime || video.duration;
    const newTime = effectiveStart + (value[0] / 100) * (effectiveDuration - effectiveStart);
    video.currentTime = newTime;
  };

  const handleVolumeChange = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;
    
    const newVolume = value[0] / 100;
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!isFullscreen) {
      container.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  const skip = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime += seconds;
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const effectiveStart = startTime || 0;
  const effectiveDuration = endTime || duration;
  const progressPercent = ((currentTime - effectiveStart) / (effectiveDuration - effectiveStart)) * 100;

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative group rounded-xl overflow-hidden bg-foreground/5",
        className
      )}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full aspect-video object-cover"
        onClick={togglePlay}
      >
        {subtitles.map((sub, index) => (
          <track
            key={index}
            kind="subtitles"
            src={sub.src}
            srcLang={sub.language}
            label={sub.label}
          />
        ))}
      </video>

      {/* Play overlay */}
      {!isPlaying && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-foreground/20 cursor-pointer"
          onClick={togglePlay}
        >
          <div className="w-20 h-20 rounded-full bg-primary/90 flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
            <Play className="w-10 h-10 text-primary-foreground ml-1" />
          </div>
        </div>
      )}

      {/* Controls */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-foreground/80 to-transparent p-4 transition-opacity duration-300",
          showControls || !isPlaying ? "opacity-100" : "opacity-0"
        )}
      >
        {/* Progress bar */}
        <div className="mb-3">
          <Slider
            value={[Math.max(0, Math.min(100, progressPercent))]}
            onValueChange={handleSeek}
            max={100}
            step={0.1}
            className="cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => skip(-10)}
              className="text-background hover:bg-background/20"
            >
              <SkipBack className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePlay}
              className="text-background hover:bg-background/20"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5" />
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => skip(10)}
              className="text-background hover:bg-background/20"
            >
              <SkipForward className="w-4 h-4" />
            </Button>

            <span className="text-sm text-background ml-2">
              {formatTime(currentTime)} / {formatTime(effectiveDuration)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 w-24">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMute}
                className="text-background hover:bg-background/20"
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </Button>
              <Slider
                value={[isMuted ? 0 : volume * 100]}
                onValueChange={handleVolumeChange}
                max={100}
                className="w-16"
              />
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
              className="text-background hover:bg-background/20"
            >
              <Maximize className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
