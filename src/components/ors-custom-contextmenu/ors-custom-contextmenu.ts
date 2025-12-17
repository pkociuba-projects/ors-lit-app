import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("ors-custom-contextmenu")
export class OrsCustomContextmenu extends LitElement {
  @property({ type: Number }) currentTabIdx: number = 0;

  render() {
    switch (this.currentTabIdx) {
      case 0:
        return html`<p>Context menu zakładki Wyszukaj</p>`;
      case 1:
        return html`<p>Context menu zakładki Trasa</p>`;
      case 2:
        return html`<p>Context menu zakładki Izochrony</p>`;
    }
  }

  static styles? = css`
    :host {
        display: flex;
        flex-direction:column;
        padding:10px;
        width: 100%;
    }

    vaadin-button {
        width: 100%;
    }

    .context {
        display:flex;
        align-items: center;
    }

    .context-button-text {
        margin-left: 10px;
    }
  `
}
