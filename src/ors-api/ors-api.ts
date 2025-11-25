import config from "./config"

export class OrsApi {
    constructor(){}

    async geocode(searchTerm: string): Promise<string[]> {
        const {apiKey, geocodeServiceUrl} = config;

        const apiUrl: string = `${geocodeServiceUrl}api_key=${apiKey}&text=${searchTerm}`

        try {
            const response = await fetch(apiUrl);
            const data = await response.json();

            return data.features;
        } catch ( error) {
            console.error("Error fetching geocoding suggestions:", error);           

            return []
        }
    }
}