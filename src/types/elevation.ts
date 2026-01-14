export type ElevationPoint = {
  /** Distance from start in meters */
  distance: number;
  /** Elevation in meters above sea level */
  elevation: number;
};

export type ElevationStats = {
  min: number;
  max: number;
  ascent: number;
  descent: number;
  /** Total length in meters */
  length: number;
};
