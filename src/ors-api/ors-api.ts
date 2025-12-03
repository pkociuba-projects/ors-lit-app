import { LatLng } from "leaflet";
import config from "./config";

export class OrsApi {
  constructor() {}

  async geocode(
    searchTerm: string,
    coords: LatLng | undefined
  ): Promise<string[]> {
    const { apiKey, geocodeServiceUrl } = config;

    const apiUrl: string = `${geocodeServiceUrl}api_key=${apiKey}&text=${searchTerm}&layers=locality,address,region&boundary.country=PL&focus.point.lon=${
      coords ? coords.lng : ""}&focus.point.lat=${coords ? coords.lat : ""}`;

    try {
      const response = await fetch(apiUrl);
      const data = await response.json();

      return data.features;
    } catch (error) {
      console.error("Error fetching geocoding suggestions:", error);

      return [];
    }
  }
}
