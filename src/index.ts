import { OrsMap } from "./components/ors-map";
import { html } from "lit";
import { customElement } from "lit/decorators.js";
import "./components/ors-panel"



@customElement("ors-renderer") 
export class OrsRenderer extends OrsMap {
    render() {
       return html`<ors-panel .map=${this.map}></ors-panel>`
    }
}