import { sql } from 'kysely';
import { db } from '../client';
import { deleteRoutes, getRoutes, saveRoutes } from '../routes';

const aRoute: GeoJSON.Feature = {
  type: 'Feature',
  properties: { route_type: 'STREET' },
  geometry: {
    coordinates: [
      [-118.36179, 34.05481],
      [-118.363347, 34.050866],
      [-118.363561, 34.050849],
      [-118.364012, 34.049089],
      [-118.36512, 34.04505],
    ],
    type: 'LineString',
  },
};

const anotherRoute: GeoJSON.Feature = {
  type: 'Feature',
  properties: { route_type: 'SIDEWALK' },
  geometry: {
    coordinates: [
      [-118.300259, 33.969369],
      [-118.300216, 33.967287],
    ],
    type: 'LineString',
  },
};

// TODO: move this to generic setup/teardown file
afterAll(async () => {
  db.destroy();
});

afterEach(async () => {
  await sql`TRUNCATE TABLE route`.execute(db);
});

describe(getRoutes, () => {
  it('should return routes in the proper shape', async () => {
    const savedRoutes = await saveRoutes('LA', {
      type: 'FeatureCollection',
      features: [aRoute, anotherRoute],
    });

    const routes = await getRoutes('LA');
    expect(routes).toMatchObject({
      type: 'FeatureCollection',
      features: [
        {
          ...aRoute,
          properties: { ...aRoute.properties },
          id: savedRoutes[0].id,
        },
        {
          ...anotherRoute,
          properties: { ...anotherRoute.properties },
          id: savedRoutes[1].id,
        },
      ],
    });
  });
});

describe(saveRoutes, () => {
  afterEach(async () => {
    await sql`TRUNCATE TABLE route`.execute(db);
  });

  it('should save routes happy path', async () => {
    const [savedRoute] = await saveRoutes('LA', {
      type: 'FeatureCollection',
      features: [aRoute],
    });

    expect((await db.selectFrom('route').selectAll().execute()).length).toBe(1);
    expect(savedRoute).toMatchObject({ route_type: 'STREET', region: 'LA' });
  });

  it('should update if route already exists', async () => {
    const [savedRoute] = await saveRoutes('LA', {
      type: 'FeatureCollection',
      features: [aRoute],
    });
    const [updatedRoute] = await saveRoutes('LA', {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          id: savedRoute.id,
          properties: { route_type: 'PROTECTED' },
          geometry: aRoute.geometry,
        },
      ],
    });

    expect((await db.selectFrom('route').execute()).length).toBe(1);
    expect(updatedRoute).toMatchObject({
      route_type: 'PROTECTED',
    });
  });

  it('should add routes to regions existing routes', async () => {
    await saveRoutes('LA', {
      type: 'FeatureCollection',
      features: [aRoute],
    });
    await saveRoutes('LA', {
      type: 'FeatureCollection',
      features: [anotherRoute],
    });

    expect((await getRoutes('LA')).features.length).toBe(2);
  });
});

describe(deleteRoutes, () => {
  it('should delete routes by ids', async () => {
    const routes = await saveRoutes('LA', {
      type: 'FeatureCollection',
      features: [aRoute, anotherRoute],
    });

    expect(await deleteRoutes('LA', [routes[0].id])).toBe(1);
    expect(await getRoutes('LA')).toMatchObject({ features: [anotherRoute] });
  });
});
