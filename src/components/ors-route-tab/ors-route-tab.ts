import "@vaadin/icon";
import "@vaadin/icons";
import "@vaadin/tabs";
import "@vaadin/tabsheet";
import "@vaadin/text-field";
import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";

import { i18n } from "../../i18n";

@customElement("ors-route-tab")
export class OrsRouteTab extends LitElement {
  @property({ type: String }) routeStartLabel: string = "";
  @property({ type: String }) routeStopLabel: string = "";

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
    `;

    //   `<vaadin-text-field
    //   id="searchRouteStart"
    //   theme="small"
    //   clear-button-visible
    //   placeholder="Konstantynów 1A-1E, Lublin,LU,Polska"
    //   label="Punkt początkowy:"
    //   value=${this.routeStartLabel}
    // >
    //   <vaadin-icon
    //     icon="vaadin:search"
    //     slot="suffix"
    //     @click=${(e) => {
    //       console.log("klik");
    //     }}
    //   ></vaadin-icon>
    // </vaadin-text-field>
    // <vaadin-text-field
    //   id="searchRouteStop"
    //   theme="small"
    //   clear-button-visible
    //   placeholder="Konstantynów 1A-1E, Lublin,LU,Polska"
    //   label="Punkt końcowy:"
    //   value=${this.routeStopLabel}
    // >
    //   <vaadin-icon
    //     icon="vaadin:search"
    //     slot="suffix"
    //     @click=${(e) => {
    //       console.log("klik");
    //     }}
    //   ></vaadin-icon>
    // </vaadin-text-field>`;
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
