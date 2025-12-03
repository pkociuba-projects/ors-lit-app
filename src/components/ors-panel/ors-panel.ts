import "@vaadin/icon";
import "@vaadin/icons";
import "@vaadin/tabs";
import "@vaadin/tabsheet";
import "@vaadin/text-field";
import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import "../ors-search"


@customElement("ors-panel")
export class OrsPanel extends LitElement {
     @property({ type: Object }) map?: L.Map;
     
    render() {
       return html`<h4>Open Route Service - sample</h4>
       <vaadin-tabsheet>
        <vaadin-tabs slot="tabs">
            <vaadin-tab id="search-tab">Wyszukaj</vaadin-tab>
            <vaadin-tab id="route-tab">Trasa</vaadin-tab>
            <vaadin-tab id="reach-tab">Izochrony</vaadin-tab>
        </vaadin-tabs>
        <div tab="search-tab"><ors-search .map=${this.map}></ors-search></div>  
        <div tab="route-tab">Wyznacz trasę</div>  
        <div tab="reach-tab">Wygeneruj izochorny</div>  
       </vaadin-tabsheet>

       

       `
    }

    static styles? = css`
        :host{
            position: absolute;
            top: 10px;
            right: 10px;
            background-color: rgba(255,255,255, 0.9);
            width: 400px;
            height:94%;
            overflow: auto;
        }

        h4 {
            text-align:center;
        }
        vaadin-tabsheet {
            height: 90%;  }
    `
}