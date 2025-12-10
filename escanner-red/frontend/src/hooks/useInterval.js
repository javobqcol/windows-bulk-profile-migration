import { useEffect, useRef } from 'react';

// Hook para intervalos que se limpian automáticamente
export const useInterval = (callback, delay) => {
  const savedCallback = useRef();

  // Recordar la última callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Configurar el intervalo
  useEffect(() => {
    const tick = () => {
      savedCallback.current?.();
    };

    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
};

export default useInterval;
