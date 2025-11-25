import "@vaadin/icon";
import "@vaadin/icons";
import "@vaadin/tabs";
import "@vaadin/tabsheet";
import "@vaadin/text-field";
import "@vaadin/list-box";
import "@vaadin/item";
import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { OrsApi } from "../../ors-api/ors-api";

@customElement("ors-search")
export class OrsSearchTab extends LitElement {
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

          this.inputTimeout = setTimeout(async () => {
            const suggestions = await this.orsApi.geocode(searchTerm);
            console.log(suggestions);
            this.suggestions = suggestions;
          }, 500);
        }}
      ></vaadin-text-field>
      <vaadin-list-box ?hidden=${!(this.suggestions.length > 0)}>
        ${this.suggestions.map(
          (suggestion) =>
            html`<vaadin-item>${suggestion.properties.label}</vaadin-item>`
        )}
      </vaadin-list-box>
    `;
  }

  static styles? = css`
    vaadin-text-field {
      width: 100%;
    }
    vaadin-list-box {
      max-width: 250px;
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
