import { LitElement, css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { ElevationPoint, ElevationStats } from "../../types/elevation";

@customElement("elevation-profile")
export class ElevationProfile extends LitElement {
  @property({ attribute: false }) profile: ElevationPoint[] = [];
  @property({ attribute: false }) stats?: ElevationStats;

  static styles = css`
  :host {
    display: block;
    font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
  }

  .wrap {
    border-top: 4px solid #d32f2f; /* jak na screenie */
    padding: 10px 12px 12px;
    background: #fff;
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 6px;
  }

  .title {
    font-size: 22px;
    font-weight: 600;
    letter-spacing: 0.2px;
  }

  .iconBtn {
    width: 28px;
    height: 28px;
    border: 0;
    background: transparent;
    cursor: pointer;
    opacity: 0.85;
  }

  .chartRow {
    display: grid;
    grid-template-columns: 46px 1fr;
    gap: 8px;
    align-items: start;
  }

  .yLabels {
    padding-top: 20px;
    color: #666;
    font-size: 14px;
    line-height: 1;
  }

  .yLabels div {
    height: 34px; /* dopasowane do H=110 i 3 ticków */
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding-right: 4px;
  }

  .legend {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    color: #666;
    font-size: 16px;
    margin: 4px 0 6px;
  }

  .legendBox {
    width: 54px;
    height: 16px;
    border: 3px solid #1e88e5;
    background: rgba(30, 136, 229, 0.18);
    box-sizing: border-box;
  }

  svg {
    width: 100%;
    height: 120px;
    display: block;
  }

  .grid line {
    stroke: #e6e6e6;
    stroke-width: 1;
    shape-rendering: crispEdges;
  }

  .axisBase {
    stroke: #d9d9d9;
    stroke-width: 1;
    shape-rendering: crispEdges;
  }

  .area {
    fill: rgba(30, 136, 229, 0.20);
  }

  .line {
    fill: none;
    stroke: #1e88e5;
    stroke-width: 4;
    stroke-linejoin: round;
    stroke-linecap: round;
  }

  .stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: center;
    margin-top: 10px;
    color: #222;
    font-size: 20px;
    gap: 10px;
  }

  .stat {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .stat svg {
    width: 26px;
    height: 26px;
  }

  .mutedUnit {
    color: #444;
    margin-left: 6px;
  }
`;

private niceTickStep(range: number, ticks: number) {
  const rough = range / Math.max(1, ticks);
  const pow10 = Math.pow(10, Math.floor(Math.log10(Math.max(rough, 1))));
  const r = rough / pow10;

  let step = 1;
  if (r >= 5) step = 5;
  else if (r >= 2) step = 2;

  return step * pow10;
}

private buildTicks(min: number, max: number, tickCount = 3) {
  const range = Math.max(1, max - min);
  const step = this.niceTickStep(range, tickCount);

  const niceMax = Math.ceil(max / step) * step;
  const niceMin = Math.floor(min / step) * step;

  // 3 ticki jak na screenie (np. 250,200,150)
  const ticks: number[] = [];
  const top = niceMax;
  for (let i = 0; i < tickCount; i++) {
    ticks.push(top - i * step);
  }
  return { ticks, niceMin, niceMax };
}

private clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}


  private buildPolylinePoints(profile: ElevationPoint[], stats: ElevationStats): string {
    const max = Math.max(...profile.map(p => p.elevation));
    const min = Math.min(...profile.map(p => p.elevation));
    const span = max - min || 1;

    return profile.map(p => {
      const x = (p.distance / (stats.length || 1)) * 100;
      const y = 100 - ((p.elevation - min) / span) * 100;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    }).join(" ");
  }

render() {
  if (!this.profile?.length || !this.stats) return nothing;

  // Wymiary wykresu (bez etykiet Y — one są w kolumnie obok)
  const W = 520;
  const H = 110;
  const PAD_T = 10;
  const PAD_B = 8;

  const rawMin = this.stats.min;
  const rawMax = this.stats.max;

  const { ticks, niceMin, niceMax } = this.buildTicks(rawMin, rawMax, 3);

  const y = (ele: number) => {
    const t = (ele - niceMin) / Math.max(1e-6, niceMax - niceMin);
    const yy = (H - PAD_B) - t * (H - PAD_T - PAD_B);
    return this.clamp(yy, PAD_T, H - PAD_B);
  };

  const x = (dist: number) => {
    const t = dist / Math.max(1, this.stats!.length);
    return this.clamp(t * W, 0, W);
  };

  // Linia
  const lineD = this.profile
    .map((p, i) => `${i === 0 ? "M" : "L"} ${x(p.distance).toFixed(1)} ${y(p.elevation).toFixed(1)}`)
    .join(" ");

  // Obszar (zamknięty do linii bazowej)
  const baseY = H - PAD_B;
  const areaD = `${lineD} L ${x(this.profile[this.profile.length - 1].distance).toFixed(1)} ${baseY} L 0 ${baseY} Z`;

  // Linie siatki w miejscach ticków
  const gridLines = ticks.map(tk => {
    const yy = y(tk);
    return html`<line x1="0" y1="${yy}" x2="${W}" y2="${yy}" />`;
  });

  // Y-labels w kolumnie obok (jak na screenie)
  const yLabels = ticks.map(tk => html`<div>${Math.round(tk)}</div>`);

  return html`
    <div class="wrap">
      <div class="header">
        <div class="title">Altitude</div>
        <button class="iconBtn" title="Open">
          <!-- prosta ikonka jak na screenie -->
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 3h7v7"></path>
            <path d="M10 14L21 3"></path>
            <path d="M21 14v7h-7"></path>
            <path d="M3 10V3h7"></path>
          </svg>
        </button>
      </div>

      <div class="legend">
        <span class="legendBox"></span>
        <span>meters</span>
      </div>

      <div class="chartRow">
        <div class="yLabels">${yLabels}</div>

        <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-label="Elevation chart">
          <g class="grid">${gridLines}</g>
          <line class="axisBase" x1="0" y1="${baseY}" x2="${W}" y2="${baseY}"></line>

          <path class="area" d="${areaD}"></path>
          <path class="line" d="${lineD}"></path>
        </svg>
      </div>

      <div class="stats">
        <div class="stat">
          <svg viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2">
            <path d="M12 19V5"></path>
            <path d="M5 12l7-7 7 7"></path>
          </svg>
          <div>${this.stats.ascent.toFixed(1)}<span class="mutedUnit">m</span></div>
        </div>

        <div class="stat" style="justify-content:flex-start;">
          <svg viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2">
            <path d="M12 5v14"></path>
            <path d="M5 12l7 7 7-7"></path>
          </svg>
          <div>${this.stats.descent.toFixed(1)}<span class="mutedUnit">m</span></div>
        </div>
      </div>
    </div>
  `;
}
}
