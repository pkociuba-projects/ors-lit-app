import "@vaadin/icon";
import "@vaadin/icons";
import "@vaadin/item";
import "@vaadin/list-box";
import "@vaadin/tabs";
import "@vaadin/tabsheet";
import "@vaadin/text-field";
import { LatLng } from "leaflet";
import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { OrsApi } from "../../ors-api/ors-api";

@customElement("ors-search")
export class OrsSearchTab extends LitElement {
  @property({ type: Object }) map?: L.Map;

  @property({ type: String }) searchTerm = "";
  @property({ type: String }) id: string = "";
  @property({ type: String }) label: string = "Wpisz adres:";
  @property({ type: String }) placeholder: string =
    "Konstantynów 1A-1E, Lublin,LU,Polska";

  @state() orsApi: OrsApi = new OrsApi();
  @state() suggestions: any[] = [];
  @state() inputTimeout: number | null = null;

  render() {
    return html`
      <vaadin-text-field
        id=${this.id}
        theme="small"
        clear-button-visible
        placeholder=${this.placeholder}
        label=${this.label}
        value=${this.searchTerm}
        @value-changed=${(e: CustomEvent) => {
          const searchTerm: string = e.detail.value;

          if (this.inputTimeout) {
            clearInterval(this.inputTimeout);
          }

          if (searchTerm.trim().length === 0) {
            this.searchTerm = "";
            this.suggestions = [];
            return;
          }

          if (this.searchTerm === searchTerm) return;

          this.inputTimeout = setTimeout(async () => {
            const coords: LatLng | undefined = this.map?.getCenter();
            const suggestions = await this.orsApi.geocode(searchTerm, coords);
            console.log(suggestions);
            this.suggestions = suggestions;
          }, 1000);
        }}
      ></vaadin-text-field>
      <vaadin-list-box ?hidden=${!(this.suggestions.length > 0)}>
        ${this.suggestions.map(
          (suggestion) =>
            html`<vaadin-item
              @click=${() => {
                console.log(suggestion);
                this.searchTerm = suggestion.properties.label;
                this.suggestions = [];
                const coords = suggestion.geometry.coordinates;

                this.map?.panTo(new LatLng(coords[1], coords[0]));
              }}
              >${suggestion.properties.label}</vaadin-item
            >`
        )}
      </vaadin-list-box>
    `;
  }

  static styles? = css`
    vaadin-text-field {
      width: 100%;
    }
    vaadin-list-box {
      width: 92%;
      overflow-y: auto;
      border: 1px;
      background-color: white;
      z-index: 1;
      position: absolute;
      margin-right: var(--lumo-space-m);
    }

    vaadin-item {
      cursor: pointer;
    }

    vaadin-item:hover {
      background-color: #f4f4f4;
    }
  `;
}
