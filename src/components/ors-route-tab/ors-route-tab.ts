import "@vaadin/icon";
import "@vaadin/icons";
import "@vaadin/tabs";
import "@vaadin/tabsheet";
import "@vaadin/text-field";
import "../elevation-profile";
import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { ElevationPoint, ElevationStats } from "../../types/elevation";

import { i18n } from "../../i18n";

@customElement("ors-route-tab")
export class OrsRouteTab extends LitElement {
  @property({ type: String }) routeStartLabel: string = "";
  @property({ type: String }) routeStopLabel: string = "";

@property({ type: Array }) elevationProfile: ElevationPoint[] = [];
@property({ type: Object }) elevationStats?: ElevationStats;

  connectedCallback() {
    super.connectedCallback();
    // re-render on language changes so i18n.t in render() returns updated strings
    i18n.on("languageChanged", () => this.requestUpdate());
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    i18n.off("languageChanged", () => this.requestUpdate());
  }

  firstUpdated(props: any) {
    super.firstUpdated(props);
 
    
  }

  render() {
       console.log(this.elevationProfile, this.elevationStats);
    return html`
      <ors-search
        id=${"searchRouteStart"}
        .searchTerm=${this.routeStartLabel}
        .type=${"start"}
        .label=${i18n.t("route.startLabel")}
      ></ors-search>
      <ors-search
        id=${"searchRouteStop"}
        .searchTerm=${this.routeStopLabel}
        .type=${"end"}
        .label=${i18n.t("route.stopLabel")}
      ></ors-search>
      <elevation-profile .profile=${this.elevationProfile} .stats=${this.elevationStats}></elevation-profile>
    `;
  }

  static styles? = css`
    :host {
      height: 100%;
    }
    vaadin-text-field {
      width: 100%;
    }
  `;
}
