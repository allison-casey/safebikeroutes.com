import { MapSkeleton } from './refactor';

export default function TestPage() {
  return <MapSkeleton accessToken={process.env.ACCESS_TOKEN} />;
}
