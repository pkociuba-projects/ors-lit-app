import type { ElevationPoint, ElevationStats } from "../types/elevation";
import { decodeOrsPolyline } from "./ors-polyline";



type GeoJsonLike = any;

function extractCoordinates(feature: GeoJsonLike): number[][] {
  if (!feature) return [];

  // ORS JSON: routes[0].geometry is an encoded polyline string
  const enc = feature?.routes?.[0]?.geometry;
  if (typeof enc === "string" && enc.length) {
    const includeElevation = !!feature?.metadata?.query?.elevation;
    // Decode into GeoJSON order: [lng, lat] or [lng, lat, ele]
    return decodeOrsPolyline(enc, includeElevation);
  }

  // FeatureCollection
  if (feature.type === "FeatureCollection" && Array.isArray(feature.features) && feature.features.length) {
    return extractCoordinates(feature.features[0]);
  }

  // Feature
  const geom = feature.type === "Feature" ? feature.geometry : feature;
  if (!geom) return [];

  const coords = geom.coordinates;

  // LineString: [ [lng,lat,ele?], ... ]
  if (geom.type === "LineString" && Array.isArray(coords)) {
    return coords as number[][];
  }

  // MultiLineString: [ [ [lng,lat,ele?], ... ], ... ]
  if (geom.type === "MultiLineString" && Array.isArray(coords)) {
    return (coords as number[][][]).flat();
  }

  return [];
}

export function buildElevationProfileFromGeoJson(
  feature: GeoJsonLike
): { profile: ElevationPoint[]; stats: ElevationStats } | null {
  const coords = extractCoordinates(feature);

  if (!coords.length) return null;

  // Require at least one elevation value
  const hasElevation = coords.some((c) => typeof c[2] === "number");
  if (!hasElevation) return null;

  // Prefer ORS-provided distances from segments/steps (matches the API "distance" numbers)
  const distances = buildDistanceAxisFromSegments(feature, coords.length);

  // Prefer ORS-provided ascent/descent if present (summary or segments)
  const provided = extractAscentDescent(feature);
  let ascent = provided.ascent ?? 0;
  let descent = provided.descent ?? 0;

  const profile: ElevationPoint[] = [];

  for (let i = 0; i < coords.length; i++) {
    const c = coords[i]!;
    const eleRaw = c[2];
    const ele = typeof eleRaw === "number" ? eleRaw : NaN;

    const d = distances[i] ?? 0;

    // If ORS did not provide ascent/descent, derive it from elevations
    if (i > 0 && provided.ascent == null && provided.descent == null) {
      const prev = coords[i - 1]!;
      const prevEleRaw = prev[2];
      const prevEle = typeof prevEleRaw === "number" ? prevEleRaw : NaN;
      if (!Number.isNaN(ele) && !Number.isNaN(prevEle)) {
        const dz = ele - prevEle;
        if (dz > 0) ascent += dz;
        if (dz < 0) descent += Math.abs(dz);
      }
    }

    if (!Number.isNaN(ele)) {
      profile.push({ distance: d, elevation: ele });
    }
  }

  if (!profile.length) return null;

  const elevations = profile.map((p) => p.elevation);
  const length = distances[distances.length - 1] ?? 0;

  return {
    profile,
    stats: {
      min: Math.round(Math.min(...elevations)),
      max: Math.round(Math.max(...elevations)),
      ascent: Math.round(ascent),
      descent: Math.round(descent),
      length: Math.round(length),
    },
  };
}

function extractAscentDescent(feature: any): { ascent: number | null; descent: number | null } {
  // JSON: routes[0].summary
  const summary = feature?.routes?.[0]?.summary;
  if (summary && (typeof summary.ascent === "number" || typeof summary.descent === "number")) {
    return {
      ascent: typeof summary.ascent === "number" ? summary.ascent : null,
      descent: typeof summary.descent === "number" ? summary.descent : null,
    };
  }

  // GeoJSON: features[0].properties.segments (no ascent/descent there usually)
  // JSON: sum segments
  const segments = feature?.routes?.[0]?.segments ?? feature?.features?.[0]?.properties?.segments;
  if (Array.isArray(segments)) {
    let a = 0;
    let d = 0;
    let hasAny = false;
    for (const seg of segments) {
      if (typeof seg?.ascent === "number") {
        a += seg.ascent;
        hasAny = true;
      }
      if (typeof seg?.descent === "number") {
        d += seg.descent;
        hasAny = true;
      }
    }
    if (hasAny) {
      return { ascent: a, descent: d };
    }
  }

  return { ascent: null, descent: null };
}

/**
 * Build a cumulative distance axis in meters using ORS `segments[].steps[].distance`
 * and `way_points` indices, so chart X matches ORS' reported distances.
 *
 * Works for:
 * - ORS GeoJSON response: FeatureCollection.features[0].properties.segments
 * - ORS JSON response: routes[0].segments
 */
function buildDistanceAxisFromSegments(feature: any, coordCount: number): number[] {
  const distances = new Array<number>(coordCount).fill(NaN);

  const steps = extractSteps(feature);

  if (!steps.length) {
    // Fallback: flat axis
    distances[0] = 0;
    for (let i = 1; i < coordCount; i++) distances[i] = distances[i - 1] ?? 0;
    return distances;
  }

  let cum = 0;

  for (const step of steps) {
    const wp = step.way_points;
    const stepDist = typeof step.distance === "number" ? step.distance : 0;

    if (!Array.isArray(wp) || wp.length < 2) continue;

    const a = Math.max(0, Math.min(coordCount - 1, wp[0]));
    const b = Math.max(0, Math.min(coordCount - 1, wp[1]));

    // Ensure start distance is set
    if (Number.isNaN(distances[a])) distances[a] = cum;

    if (b <= a) {
      // Zero-length step or bad indices
      distances[b] = cum;
      continue;
    }

    // Linear interpolation between a..b for this step
    for (let i = a; i <= b; i++) {
      const t = (i - a) / (b - a);
      distances[i] = (distances[a] ?? cum) + stepDist * t;
    }

    cum += stepDist;
    distances[b] = cum;
  }

  // Fill any remaining NaNs with last known value
  let last = 0;
  for (let i = 0; i < distances.length; i++) {
    const v = distances[i] ?? NaN;
    if (Number.isNaN(v)) {
      distances[i] = last;
    } else {
      last = v;
    }
  }

  return distances;
}

function extractSteps(feature: any): any[] {
  // GeoJSON: FeatureCollection.features[0].properties.segments
  const geojsonSegments =
    feature?.features?.[0]?.properties?.segments ??
    feature?.properties?.segments;

  // JSON: routes[0].segments
  const jsonSegments = feature?.routes?.[0]?.segments;

  const segments = geojsonSegments ?? jsonSegments;

  if (!Array.isArray(segments)) return [];

  const out: any[] = [];
  for (const seg of segments) {
    if (seg?.steps && Array.isArray(seg.steps)) {
      for (const st of seg.steps) out.push(st);
    }
  }
  return out;
}
