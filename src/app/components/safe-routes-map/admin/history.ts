import { drop, dropLast } from "remeda";

export const pushDrawHistory = (
  history: GeoJSON.FeatureCollection[],
  features: GeoJSON.FeatureCollection,
) => {
  return history.length >= 10
    ? [...drop(history, 1), features]
    : [...history, features];
};

export const popDrawHistory = (
  history: GeoJSON.FeatureCollection[],
): [GeoJSON.FeatureCollection[], GeoJSON.FeatureCollection] => [
    dropLast(history, 1),
    history[history.length - 2],
  ];
