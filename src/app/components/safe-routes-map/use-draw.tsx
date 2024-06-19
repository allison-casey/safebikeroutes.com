import * as React from 'react';
import { useState, useCallback, useMemo, useContext } from 'react';

import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { DrawContext } from './draw-control';

type MountedDrawsContextValue = {
  draws: { [id: string]: MapboxDraw };
  onMapMount: (draw: MapboxDraw, id?: string) => void;
  onMapUnmount: (id?: string) => void;
};

export const MountedDrawsContext = React.createContext<MountedDrawsContextValue | null>(null);

export const DrawProvider: React.FC<{ children?: React.ReactNode }> = props => {
  const [draws, setDraws] = useState<{ [id: string]: MapboxDraw }>({});

  const onMapMount = useCallback((draw: MapboxDraw, id: string = 'default') => {
    setDraws(currDraws => {
      if (id === 'current') {
        throw new Error("'current' cannot be used as draw instance id");
      }
      if (currDraws[id]) {
        throw new Error(`Multiple draw instances with the same id: ${id}`);
      }
      return { ...currDraws, [id]: draw };
    });
  }, []);

  const onMapUnmount = useCallback((id: string = 'default') => {
    setDraws(currDraws => {
      if (currDraws[id]) {
        const nextDraws = { ...currDraws };
        delete nextDraws[id];
        return nextDraws;
      }
      return currDraws;
    });
  }, []);

  return (
    <MountedDrawsContext.Provider
      value={{
        draws,
        onMapMount,
        onMapUnmount
      }}
    >
      {props.children}
    </MountedDrawsContext.Provider>
  );
};

export type DrawCollection<DrawT extends MapboxDraw> = {
  [id: string]: DrawT | undefined;
  current?: DrawT;
};

export function useDraw<DrawT extends MapboxDraw>(): DrawCollection<DrawT> {
  const draws = useContext(MountedDrawsContext)?.draws;
  const currentDraw = useContext(DrawContext);

  const drawsWithCurrent = useMemo(() => {
    return { ...draws, current: currentDraw?.draw };
  }, [draws, currentDraw]);

  return drawsWithCurrent as DrawCollection<DrawT>;
}
