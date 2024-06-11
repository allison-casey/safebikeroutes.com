     SELECT json_build_object(
     'type', 'FeatureCollection',
     'features', coalesce(json_agg(ST_AsGeoJSON(r.*)::json), '[]'::json)
     ) AS feature_collection
     FROM route r
     WHERE region = 'LA'::"Region"
