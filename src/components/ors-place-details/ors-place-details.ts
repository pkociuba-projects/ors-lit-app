import '@vaadin/button';
import '@vaadin/icon';
import '@vaadin/icons';
import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { i18n } from '../../i18n';

@customElement('ors-place-details')
export class OrsPlaceDetails extends LitElement {
  @property({ type: Object }) feature: any = null;

  connectedCallback() {
    super.connectedCallback();
    i18n.on('languageChanged', this.langChanged);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    i18n.off('languageChanged', this.langChanged);
  }

  langChanged = () => this.requestUpdate();

  copyCoords() {
    const coords = this.feature?.geometry?.coordinates || [];
    const text = `${coords[0] ?? ''},${coords[1] ?? ''}`;
    if (navigator && navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
  }

  clear() {
    this.dispatchEvent(new CustomEvent('clear-place', { bubbles: true, composed: true }));
  }

  render() {
    const p = this.feature?.properties || {};
    const coords = this.feature?.geometry?.coordinates || [];
    return html`
      <div class="card">
        <div class="image"></div>
        <div class="content">
          <div class="title">${i18n.t('placeDetails.title')}</div>
          <div><strong>${i18n.t('placeDetails.name')}</strong> ${p.label || p.name || ''}</div>
          <div><strong>${i18n.t('placeDetails.country')}</strong> ${p.country || ''}</div>
          <div><strong>${i18n.t('placeDetails.layer')}</strong> ${p.layer || ''}</div>
          <div><strong>${i18n.t('placeDetails.lon')}</strong> ${coords[0] ?? ''}</div>
          <div><strong>${i18n.t('placeDetails.lat')}</strong> ${coords[1] ?? ''}</div>

          <div class="actions">
            <vaadin-button theme="tertiary" @click=${this.copyCoords}><vaadin-icon icon="vaadin:copy"></vaadin-icon>&nbsp;${i18n.t('placeDetails.copyCoords')}</vaadin-button>
            <vaadin-button theme="error tertiary" @click=${this.clear}><vaadin-icon icon="vaadin:trash"></vaadin-icon>&nbsp;${i18n.t('placeDetails.clear')}</vaadin-button>
          </div>
        </div>
      </div>
    `;
  }

  static styles = css`
    .card {
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      overflow: hidden;
      background: white;
      margin-top: 12px;
    }
    .image {
      width: 100%;
      height: 160px;
      background: linear-gradient(90deg,#eee,#ddd);
    }
    .content {
      padding: 12px;
    }
    .title {
      font-weight: 600;
      margin-bottom: 8px;
    }
    .actions {
      margin-top: 12px;
      display: flex;
      gap: 8px;
    }
    vaadin-button[theme~="tertiary"] {
      --vaadin-button-padding: 6px 10px;
    }
  `;
}
