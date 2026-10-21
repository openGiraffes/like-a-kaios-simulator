class GaiaSlider extends HTMLElement{constructor(){super();const t=this.attachShadow({mode:"open"});t.innerHTML=`
      <div class="inner">
        <input type="range" orient="vertical"/>
      </div>
      <style>
        ::-moz-focus-outer { border: 0; }
        div.inner {
          height: 100%;
        }
        :host {
          display: block;
          height: 100%;
        }
        input {
          width: 100%;
          height: 100%;
          margin: 0;
          padding: 0;
          background: none;
          border: 0;
        }
        ::-moz-range-progress {
          background: var(--highlight-color);
          width: 1.2rem;
          border-radius: 0 0 0.6rem 0.6rem;
        }
        .transparent::-moz-range-progress {
          opacity: 1;
          width: 0.6rem;
          background: var(--color-gs00);
        }
        .no-border-radius::-moz-range-progress {
          background: var(--highlight-color);
          width: 1.2rem;
          border-radius: 0;
        }
        input.max::-moz-range-progress {
          border-radius: 0.6rem;
        }
        input.max.no-border-radius::-moz-range-progress {
          border-radius: 0;
        }
        ::-moz-range-track {
          width: 1.2rem;
          height: 100%;
          border-radius: 0.6rem;
          background: var(--color-gs45);
        }
        .transparent::-moz-range-track {
          opacity: 0.5;
          width: 0.6rem;
          box-shadow: 0px 0px 3px 0px rgba(0,0,0,0.5);
          background: var(--color-gs00);
        }
        .no-border-radius::-moz-range-track {
          width: 1.2rem;
          height: 100%;
          background: var(--color-gs45);
          border-radius: 0;
        }
        ::-moz-range-thumb {
          width: 1.2rem;
          height: 0.3rem;
          background: var(--input-background);
          border: none;
          border-radius: 0;
          position: relative;
          z-index: 100;
          left: 50%;
          transition: all 0.2s;
        }
        .transparent::-moz-range-thumb {
          width: 0.6rem;
        }
        input.min::-moz-range-thumb,
        input.max::-moz-range-thumb {
          opacity: 0;
        }
      </style>
    `}connectedCallback(){this.els={input:this.shadowRoot.querySelector("input")},this.els.input.addEventListener("input",this._onInput.bind(this)),this.els.input.addEventListener("change",this._onChange.bind(this)),this.noborder=this.getAttribute("data-no-border")||"false";var t=this.getAttribute("transparent");t&&this.els.input.classList.toggle("transparent","true"===t)}setRange(t,e){this.min=t,this.max=e,this.els.input.min=t,this.els.input.max=e}_onInput(){this.dispatchEvent(new CustomEvent("input"))}_onChange(){this.dispatchEvent(new CustomEvent("change"))}get value(){return this._value||0}set value(t){var e=this.els.input.min||0,r=this.els.input.max||100;e<=t&&t<=r&&(this.els.input.value=t),this._value=parseInt(this.els.input.value,10),this.els.input.classList.toggle("min",this._value==e),this.els.input.classList.toggle("max",this._value==r)}get noborder(){return this._noborder||"false"}set noborder(t){this.els.input.classList.toggle("no-border-radius","true"===t),this._noborder=t}}customElements.define("gaia-slider",GaiaSlider);