import { LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";
import L from "leaflet";

@customElement("ors-map")
export class OrsMap extends LitElement {
  @state() map?: L.Map;
  @state() basemap: L.TileLayer = new L.TileLayer(
    "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      attribution: "OpenStreetMap",
    }
  );


  initMap = (): void => {
    this.map = new L.Map("map", {
        center: new L.LatLng(51.2356541,22.5007548),
        zoom: 18
    })
  }

  addListeners = ():void => {
    this.map?.on("click", (e:any)=> {
        console.log(e.latlng);
        const marker: L.Marker = new L.Marker(e.latlng, {
            opacity: 1,
            draggable: true
        })
        marker.addTo(this.map!) 
    })
  } 

  firstUpdated(props: any) {
    super.firstUpdated(props);
    this.initMap();
    this.basemap.addTo(this.map!)
    this.addListeners();
  }
}
