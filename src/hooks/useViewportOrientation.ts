import { useEffect, useState } from 'react';

export type ViewportOrientation = 'portrait' | 'landscape';

function getViewportOrientation(): ViewportOrientation {
  return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
}

export function useViewportOrientation(): ViewportOrientation {
  const [orientation, setOrientation] = useState<ViewportOrientation>(() => getViewportOrientation());

  useEffect(() => {
    try {
      screen.orientation?.unlock();
    } catch {
      // Some browsers only allow unlock in installed contexts or not at all.
    }

    function syncOrientation() {
      setOrientation(getViewportOrientation());
    }

    syncOrientation();
    window.addEventListener('resize', syncOrientation);
    window.addEventListener('orientationchange', syncOrientation);
    screen.orientation?.addEventListener?.('change', syncOrientation);

    return () => {
      window.removeEventListener('resize', syncOrientation);
      window.removeEventListener('orientationchange', syncOrientation);
      screen.orientation?.removeEventListener?.('change', syncOrientation);
    };
  }, []);

  return orientation;
}
