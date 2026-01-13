import "@vaadin/icon";
import "@vaadin/icons";
import "@vaadin/text-field";
import "@vaadin/tabsheet";
import "@vaadin/tabs";
import "@vaadin/list-box";
import "@vaadin/item";
import "@vaadin/button";
import L from "leaflet";
import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { OrsApi } from "../../ors-api/ors-api";

import { i18n } from "../../i18n";

@customElement("ors-search")
export class OrsSearchTab extends LitElement {
  @property({ type: String }) searchTerm = "";
  @property({type: String }) id: string = ""
  @property({type: String}) label: string = ""
  @property({type: String}) placeholder: string = ""
  @property({ type: Array }) suggestions: any[] = [];
  @property({type: String}) type: string = ""
  @state() orsApi: OrsApi = new OrsApi();
  @state() inputTimeout: number | null = null;

  connectedCallback() {
    super.connectedCallback();
    this.updateTranslations();
    i18n.on("languageChanged", this.updateTranslations);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    i18n.off("languageChanged", this.updateTranslations);
  }

  updateTranslations = () => {
    this.label = i18n.t("search.label");
    this.placeholder = i18n.t("search.placeholder");
    this.requestUpdate();
  }

  firstUpdated(props: any) {
    super.firstUpdated(props);
  }

  handleSuggestionClick(suggestion: string) {
    this.searchTerm = suggestion;
    this.suggestions = []; // Clear suggestions after selecting one
  }

  copyCoords(coords: number[]) {
    const text = `${coords && coords.length ? coords[0] + ',' + coords[1] : ''}`;
    if (navigator && (navigator as any).clipboard) {
      (navigator as any).clipboard.writeText(text).catch(() => {});
    }
  }

  render() {
    return html`<vaadin-text-field
        id=${this.id}
        theme="small"
        clear-button-visible
        placeholder=${this.placeholder}
        label=${this.label}
        value=${this.searchTerm}
        @value-changed=${(e: any) => {
          const searchTerm = e.detail.value;
          
          if(searchTerm === "") {
            this.searchTerm = "";
            this.dispatchEvent(new CustomEvent("hide-marker", { detail: { type: this.type }, bubbles: true, composed: true }));
            this.dispatchEvent(new CustomEvent("clear-place", { bubbles: true, composed: true }));
          }

          if (this.searchTerm === searchTerm) return;

          if (this.inputTimeout) {
            clearTimeout(this.inputTimeout);
          }
          if (searchTerm === "") {
            this.suggestions = [];
            this.dispatchEvent(new CustomEvent("clear-place", { bubbles: true, composed: true }));
            return;
          }
          this.inputTimeout = setTimeout(async () => {
            const suggestions = await this.orsApi.geocode(searchTerm);
            this.suggestions = suggestions;
          }, 500);
        }}
      >
        <vaadin-icon
          icon="vaadin:search"
          slot="suffix"
          @click=${(e: any) => {
            console.log("klik");
          }}
        ></vaadin-icon>
      </vaadin-text-field>
      <vaadin-list-box ?hidden=${!(this.suggestions.length > 0)}>
        ${this.suggestions.map(
          (suggestion) => html`<vaadin-item class="suggestion-item" @click=${() => {
                this.handleSuggestionClick(suggestion.properties.label);
                this.dispatchEvent(new CustomEvent("add-marker-geocode", {
                  detail: {
                    coords: suggestion.geometry.coordinates,
                    type: this.type,
                    label: suggestion.properties.label,
                  },
                  bubbles: true,
                  composed: true,
                }));

                // also emit full feature so other components can show details
                this.dispatchEvent(new CustomEvent("place-selected", {
                  detail: { feature: suggestion },
                  bubbles: true,
                  composed: true,
                }));
              }}>
              <div class="suggestion-left"><vaadin-icon icon="vaadin:map-marker"></vaadin-icon></div>
              <div class="suggestion-main">
                <div class="suggestion-label">${suggestion.properties.label}</div>
                <div class="suggestion-meta">${suggestion.properties.country || ''} • ${suggestion.properties.layer || ''}</div>
                <div class="suggestion-coords">Lon.: ${suggestion.geometry.coordinates[0]}, Lat.: ${suggestion.geometry.coordinates[1]}</div>
              </div>
              <div class="suggestion-actions">
                <vaadin-button theme="icon" @click=${(e: any) => { e.stopPropagation(); this.copyCoords(suggestion.geometry.coordinates); }}>
                  <vaadin-icon icon="vaadin:copy"></vaadin-icon>
                </vaadin-button>
                <vaadin-button theme="icon" @click=${(e: any) => { e.stopPropagation(); this.dispatchEvent(new CustomEvent('open-in-map', { detail: { feature: suggestion }, bubbles:true, composed:true })); }}>
                  <vaadin-icon icon="vaadin:external-link"></vaadin-icon>
                </vaadin-button>
              </div>
            </vaadin-item>`
        )}
      </vaadin-list-box> `;
  }

  static styles? = css`
    vaadin-text-field {
      width: 100%;
    }

    vaadin-list-box {
      max-height: 250px;
      overflow-y: auto;
      border: 1px solid #ccc;
      /* position: absolute;
      top:10; */
      background-color: white;
      z-index: 1;
      position: absolute;
      margin-right: var(--lumo-space-m);
    }

    vaadin-item {
      /* padding: 8px; */
      cursor: pointer;
    }

    vaadin-item:hover {
      background-color: #f4f4f4;
    }

    .suggestion-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 6px;
      box-sizing: border-box;
    }
    .suggestion-left {
      width: 52px;
      height: 48px;
      display:flex;
      align-items:center;
      justify-content:center;
    }
    .suggestion-main {
      flex: 1;
      min-width: 0;
    }
    .suggestion-label {
      font-weight: 600;
      margin-bottom: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .suggestion-meta {
      font-size: 12px;
      color: #666;
      margin-bottom: 4px;
    }
    .suggestion-coords {
      font-size: 12px;
      color: #666;
    }
    .suggestion-actions {
      display:flex;
      gap:6px;
    }
  `;
}
