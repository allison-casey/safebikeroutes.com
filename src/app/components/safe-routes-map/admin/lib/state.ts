"use client";

import type { IRouteFeatureCollection } from "@/types/map";
import { createContext, useContext } from "react";
import * as R from "remeda";
import { createStore, useStore } from "zustand";
import { popDrawHistory, pushDrawHistory } from "./history";
import { getFeaturesByType } from "./utils";

const toFeatureCollection = (
  routes: Record<string, GeoJSON.Feature<GeoJSON.LineString>>,
): GeoJSON.FeatureCollection => ({
  type: "FeatureCollection",
  features: Object.values(routes),
});

interface RouteAdminProps {
  routes: IRouteFeatureCollection;
}

interface RouteAdminState {
  // Properties
  //// Map Feature State
  routes: Record<string, GeoJSON.Feature<GeoJSON.LineString>>;

  //// Edit Metadata State
  selectedFeatures: GeoJSON.Feature[];
  deletedRouteIDs: Set<string>;
  featureIDsToUpdate: Set<string>;

  //// History State
  history: GeoJSON.FeatureCollection[];
  canPopHistory: () => boolean;

  // Functions
  selectFeatures: (features: GeoJSON.Feature[]) => void;
  createFeatures: (features: GeoJSON.Feature[]) => void;
  deleteFeatures: (features: GeoJSON.Feature[]) => void;
  updateFeatures: (features: GeoJSON.Feature[]) => void;

  popHistory: (
    onPopHistory: (features: GeoJSON.FeatureCollection) => void,
  ) => void;

  handleSubmit: (handler: (features: GeoJSON.Feature[]) => void) => void;
}

type RouteAdminStore = ReturnType<typeof createRouteAdminStore>;

export const createRouteAdminStore = (initProps: RouteAdminProps) => {
  return createStore<RouteAdminState>()((set, get) => ({
    // Properties
    //// Map Feature state
    routes: R.indexBy(initProps.routes.features, (f) => f.id),

    //// Edit Metadata State
    selectedFeatures: [],
    deletedRouteIDs: new Set<string>(),
    featureIDsToUpdate: new Set<string>(),

    //// History State
    history: [initProps.routes],

    // Functions
    selectFeatures: (features) => set(() => ({ selectedFeatures: features })),
    createFeatures: (features) =>
      set((state) => {
        const featuresByType = getFeaturesByType(features);
        const newRoutes = {
          ...state.routes,
          ...R.indexBy(featuresByType.LineString ?? [], (f) => f.id as string),
        };
        return {
          history: pushDrawHistory(
            state.history,
            toFeatureCollection(newRoutes),
          ),
          routes: newRoutes,
        };
      }),
    deleteFeatures: (features) =>
      set((state) => {
        const featuresByType = getFeaturesByType(features);
        const newRoutes = R.omit(
          state.routes,
          featuresByType.LineString?.map((f) => f.id as string) ?? [],
        );

        return {
          history: pushDrawHistory(
            state.history,
            toFeatureCollection(newRoutes),
          ),
          routes: newRoutes,
          deletedRouteIDs: new Set([
            ...state.deletedRouteIDs,
            ...features.map((f) => f.id as string),
          ]),
        };
      }),
    updateFeatures: (features) =>
      set((state) => {
        const featuresByType = getFeaturesByType(features);
        const newRoutes = {
          ...state.routes,
          ...R.indexBy(featuresByType.LineString ?? [], (f) => f.id as string),
        };
        return {
          history: pushDrawHistory(
            state.history,
            toFeatureCollection(newRoutes),
          ),
          routes: newRoutes,
          featureIDsToUpdate: new Set([
            ...state.featureIDsToUpdate,
            ...features.map((f) => f.id as string),
          ]),
        };
      }),

    canPopHistory: () => get().history.length > 1,
    popHistory: (onPopHistory) => {
      // TODO: figure out how to deal with deleted ids getting undone by history change
      const [newHistory, newState] = popDrawHistory(get().history);
      const featuresByType = getFeaturesByType(newState.features);
      onPopHistory(newState);
      set(() => ({
        routes: R.indexBy(
          featuresByType.LineString ?? [],
          (f) => f.id as string,
        ),
        history: newHistory,
      }));
    },

    handleSubmit: (handler) => {
      const features = get().routes;
      handler(Object.values(features));
      set(() => ({
        selectedFeatures: [],
        deletedRouteIDs: new Set(),
        featureIDsToUpdate: new Set(),
      }));
    },
  }));
};

export const RouteAdminContext = createContext<RouteAdminStore | null>(null);

export const useRouteAdminContext = <T>(
  selector: (state: RouteAdminState) => T,
): T => {
  const store = useContext(RouteAdminContext);
  if (!store) throw new Error("Missing RouteAdminContext.Provider in the tree");
  return useStore(store, selector);
};
