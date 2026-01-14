import type L from "leaflet";
import config from "./config";

export class OrsApi {
  constructor() {}

  async reverseGeocode(point: L.LatLng): Promise<string> {
    const { apiKey, reverseGeocodeUrl } = config;

    const url: string = `${reverseGeocodeUrl}api_key=${apiKey}&point.lon=${point.lng}&point.lat=${point.lat}`;
    const json = await fetch(url).then((r) => r.json());

    return json.features[0].properties.label;
  }

  async route(
    startPoint: L.LatLng,
    endPoint: L.LatLng,
    profile: string = "driving-car"
  ): Promise<any> {
    const { apiKey, routeServiceUrl } = config;

    // Correct endpoint for JSON responses (routes[0].geometry is an encoded polyline)
    const url: string = `${routeServiceUrl}${profile}/json`;

    const body = {
      coordinates: [
        [startPoint.lng, startPoint.lat],
        [endPoint.lng, endPoint.lat]
      ],
      elevation: true,
      // keep geometry dense enough for a smooth chart
      geometry_simplify: false,
      // we want segments/steps (distance breakpoints) and ascent/descent
      instructions: true
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": apiKey
      },
      body: JSON.stringify(body)
    });

    const json = await response.json();

    if (!response.ok) {
      // ORS errors usually come with { error: { code, message } }
      const msg = (json && json.error && json.error.message) ? json.error.message : "Route request failed";
      throw new Error(msg);
    }

    return json;
  }

async geocode(searchTerm: string): Promise<string[]> {
    const { apiKey, geocodeServiceUrl } = config;
    const apiUrl = `${geocodeServiceUrl}api_key=${apiKey}&text=${searchTerm}`;

    try {
      const response = await fetch(apiUrl);
      const data = await response.json();
      console.log(data);
      
      return data.features
    } catch (error) {
      console.error("Error fetching geocoding suggestions:", error);
      return [];
    }

    return [];
  }
}
