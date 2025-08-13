export const generateThumbnailVideo = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const videoElement = document.createElement('video');
    const canvasElement = document.createElement('canvas');
    const context = canvasElement.getContext('2d');

    videoElement.style.display = 'none';
    videoElement.muted = true;
    videoElement.autoplay = false;
    videoElement.preload = 'auto';
    videoElement.playsInline = true;

    videoElement.src = URL.createObjectURL(file);

    const handleCanPlay = () => {
      videoElement.currentTime = 1;
      videoElement.pause();
    };

    const handleSeeked = () => {
      requestAnimationFrame(() => {
        if (videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
          console.warn('Video dimensions not ready');
          reject(new Error('Video dimensions not available'));
          cleanup();
          return;
        }

        canvasElement.width = videoElement.videoWidth;
        canvasElement.height = videoElement.videoHeight;

        // Dummy draw to address Safari bug
        context?.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);

        // Short delay for Safari to render the frame properly
        setTimeout(() => {
          // Real draw
          context?.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
          const thumbnail = canvasElement.toDataURL('image/png');

          resolve(thumbnail);
          cleanup();
        }, 100);
      });
    };

    const handleError = (event: Event) => {
      const video = event.target as HTMLVideoElement;
      const errorCode = video.error?.code ?? 'Unknown code';
      const errorMessage = video.error?.message ?? 'Unknown message';
      console.error(`Video error: Code ${errorCode} - ${errorMessage}`);
      reject(new Error(`Video error: ${errorMessage}`));
      cleanup();
    };

    const handleUnexpectedPlay = () => {
      console.warn('Unexpected play event - pausing');
      videoElement.pause();
    };

    const cleanup = () => {
      videoElement.removeEventListener('canplay', handleCanPlay);
      videoElement.removeEventListener('seeked', handleSeeked);
      videoElement.removeEventListener('error', handleError);
      videoElement.removeEventListener('play', handleUnexpectedPlay);
      URL.revokeObjectURL(videoElement.src);
    };

    videoElement.addEventListener('canplay', handleCanPlay);
    videoElement.addEventListener('seeked', handleSeeked);
    videoElement.addEventListener('error', handleError);
    videoElement.addEventListener('play', handleUnexpectedPlay);

    videoElement.load();
    videoElement.pause();
  });
};
