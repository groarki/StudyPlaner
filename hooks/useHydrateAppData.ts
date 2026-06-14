import { useEffect } from 'react';
import { hydrateAppData } from '../utils/hydrate-app-data';

export function useHydrateAppData() {
  useEffect(() => {
    let isMounted = true;

    const runHydration = async () => {
      try {
        if (isMounted) {
          await hydrateAppData();
        }
      } catch (error) {
        console.warn('Unable to hydrate app data', error);
      }
    };

    runHydration();

    return () => {
      isMounted = false;
    };
  }, []);
}
