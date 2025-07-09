import { drop, dropLast } from "remeda";

const UNDO_HISTORY_SIZE = 10;

export const pushDrawHistory = (
  history: GeoJSON.FeatureCollection[],
  features: GeoJSON.FeatureCollection,
) => {
  return history.length >= UNDO_HISTORY_SIZE
    ? [...drop(history, 1), features]
    : [...history, features];
};

export const popDrawHistory = (
  history: GeoJSON.FeatureCollection[],
): [GeoJSON.FeatureCollection[], GeoJSON.FeatureCollection] => [
  dropLast(history, 1),
  history[history.length - 2],
];
