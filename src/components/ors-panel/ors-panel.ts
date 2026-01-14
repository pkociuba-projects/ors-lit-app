import "@vaadin/icon";
import "@vaadin/icons";
import "@vaadin/text-field";
import "@vaadin/tabsheet";
import "@vaadin/tabs";
import L from "leaflet";
import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "../ors-search";
import "../ors-route-tab";
import "../ors-place-details";
import "../elevation-profile";
import type { ElevationPoint, ElevationStats } from "../../types/elevation";

import { i18n } from "../../i18n";

@customElement("ors-panel")
export class OrsPanel extends LitElement {
  @property({ type: Object }) map?: L.Map;
  @property({ type: String}) routeStartLabel: string = "";
  @property({ type: String }) routeStopLabel: string = "";
  @property({ type: String }) searchLabel: string = "";
  @property({ type: Number }) currentTabIdx: number = 0;

  @state() elevationProfile: ElevationPoint[] = [];
@state() elevationStats?: ElevationStats;

  @state() selectedPlace: any = null;

  onPlaceSelected(e: any) {
    this.selectedPlace = e.detail.feature;
  }
  @state() language: string = i18n.language || "pl";

  connectedCallback() {
    super.connectedCallback();
    i18n.on("languageChanged", (lng) => {
      this.language = lng;
      this.requestUpdate();
    });
  }

  searchTab = () => {
    return  html`<vaadin-text-field
    id="searchAddress"
    theme="small"
    clear-button-visible
    placeholder=${i18n.t("search.placeholder")}
    label=${i18n.t("search.label")}
  >
    <vaadin-icon
      icon="vaadin:search"
      slot="suffix"
      @click=${(e: any) => {
        console.log("klik");
      }}
    ></vaadin-icon>
  </vaadin-text-field>`
  }

  routeTab = () => {
    return ;
  };

  render() {
    console.log(this.elevationProfile, this.elevationStats);
    return html`
      <div style="display:flex; align-items:center; justify-content:space-between;">
        <h4>${i18n.t("title")}</h4>
        <div>
          <label for="lang">${i18n.t("langLabel")}:</label>
          <select id="lang" @change=${(e:any)=>{ i18n.changeLanguage(e.target.value); }} .value=${this.language}>
            <option value="pl">PL</option>
            <option value="en">EN</option>
          </select>
        </div>
      </div>
      <vaadin-tabsheet>
        <vaadin-tabs
          slot="tabs"
          @selected-changed=${(e: any) => {
            const { value } = e.detail;
            this.currentTabIdx = value;
            this.dispatchEvent(
              new CustomEvent("tab-index-changed", {
                detail: {
                  idx: value,
                },
              })
            );
          }}
        >
          <vaadin-tab id="find-tab">${i18n.t("tabs.search")}</vaadin-tab>
          <vaadin-tab id="route-tab">${i18n.t("tabs.route")}</vaadin-tab>
          <vaadin-tab id="reach-tab">${i18n.t("tabs.reach")}</vaadin-tab>
        </vaadin-tabs>

        <div tab="find-tab">
          <ors-search .type=${"search"} .searchTerm=${this.searchLabel} @place-selected=${(e:any)=>this.onPlaceSelected(e)} @clear-place=${()=>{ this.selectedPlace = null; }}> </ors-search>
          ${this.selectedPlace ? html`<ors-place-details .feature=${this.selectedPlace} @clear-place=${()=>{ this.selectedPlace = null; }}></ors-place-details>` : ""}
        </div>
        <div tab="route-tab"><ors-route-tab .routeStartLabel=${this.routeStartLabel} routeStopLabel=${this.routeStopLabel} .elevationProfile=${this.elevationProfile} .elevationStats=${this.elevationStats}></ors-route-tab></div>
        <div tab="reach-tab">${i18n.t("reach.check")}</div>
      </vaadin-tabsheet>
      
    `;
  }

  static styles? = css`
    :host {
      position: absolute;
      top: 10px;
      right: 10px;
      padding: 10px;
      background-color: rgba(255, 255, 255, 0.9);
      width: 400px;
      height: 94%;
      overflow: auto;
    }

    h4 {
      text-align: center;
    }
    vaadin-text-field {
      width: 100%;
    }
    vaadin-tabsheet {
      height: 93%;
    }
  `;
}
