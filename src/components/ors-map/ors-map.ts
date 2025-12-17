import { LitElement, html, render } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import L, { LeafletMouseEvent } from "leaflet";
import markerIconGreen from "./assets/img/marker-icon-green.png";
import markerIconRed from "./assets/img/marker-icon-red.png";
import "../ors-custom-contextmenu";

@customElement("ors-map")
export class OrsMap extends LitElement {
  @property({ type: Number }) currentTabIdx: number = 0;

  @state() map?: L.Map;
  @state() basemap: L.TileLayer = new L.TileLayer(
    "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      attribution: "OpenStreetMap",
    }
  );

  @state() contextMenu?: L.Popup;
  @state() currentLatLng?: L.LatLng;

  @state() markerSearch: L.Marker = new L.Marker([0, 0], {
    opacity: 0,
  });

  @state() startIcon = new L.Icon({
    iconUrl: markerIconGreen,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

  initMap = (): void => {
    this.map = new L.Map("map", {
      center: new L.LatLng(51.2356541, 22.5007548),
      zoom: 18,
    });
  };

  updated(changeProperties: Map<string, any>) {
    if(changeProperties.has("currentTabIdx")){
      if(this.currentLatLng){
        this.updateContextMenu();
      }
    }
  }

  updateContextMenu = (): void => {
    let orsCtxMenuContainer = document.createElement("div");

    render(
      html`<ors-custom-contextmenu
        .currentTabIdx=${this.currentTabIdx}
      ></ors-custom-contextmenu>`,
      orsCtxMenuContainer
    );

    this.contextMenu
      ?.setLatLng(this.currentLatLng!)
      .bindPopup(orsCtxMenuContainer, {
        closeButton: false,
        minWidth: 250,
      })
      .addTo(this.map!)
      .openPopup();
  };

  addListeners = (): void => {
    // this.map?.on("click", (e:any)=> {
    //     console.log(e.latlng);
    //     const marker: L.Marker = new L.Marker(e.latlng, {
    //         opacity: 1,
    //         draggable: true
    //     })
    //     marker.addTo(this.map!)
    // })
    this.map!.on("contextmenu", (e: LeafletMouseEvent) => {
      this.currentLatLng = e.latlng;
      this.updateContextMenu();
    });

    window.addEventListener(
      "add-marker-geocode",
      this._onAddMarkerGeocode as EventListener
    );
  };

  _onAddMarkerGeocode = async (e: Event) => {
    console.log("_onAddMarkerGeocode", e);

    const { detail } = e as CustomEvent;

    const coords: L.LatLng = new L.LatLng(detail.coords[1], detail.coords[0]);

    switch (detail.type) {
      case "search":
        this.markerSearch.setLatLng(coords).setOpacity(1);
    }
  };

  firstUpdated(props: any) {
    super.firstUpdated(props);
    this.initMap();
    this.contextMenu = new L.Popup();
    this.basemap.addTo(this.map!);
    this.markerSearch.addTo(this.map!).setIcon(this.startIcon);
    this.addListeners();
  }
}
