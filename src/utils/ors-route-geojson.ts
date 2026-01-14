import { decodeOrsPolyline } from "./ors-polyline";

/**
 * Convert ORS `/v2/directions/{profile}/json` response into a GeoJSON FeatureCollection
 * that can be consumed by Leaflet's `L.geoJSON().addData(...)`.
 */
export function orsDirectionsJsonToGeoJson(response: any): any {
  const route = response?.routes?.[0];
  if (!route) {
    return { type: "FeatureCollection", features: [] };
  }

  const geometry = route.geometry;
  if (typeof geometry !== "string" || !geometry.length) {
    return { type: "FeatureCollection", features: [] };
  }

  const includeElevation = !!response?.metadata?.query?.elevation;
  const coords = decodeOrsPolyline(geometry, includeElevation);

  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {
          summary: route.summary,
          segments: route.segments,
          way_points: route.way_points,
        },
        geometry: {
          type: "LineString",
          coordinates: coords,
        },
      },
    ],
  };
}
