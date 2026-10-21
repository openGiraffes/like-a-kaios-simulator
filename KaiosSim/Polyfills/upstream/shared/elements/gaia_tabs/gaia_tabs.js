class GaiaTabs extends HTMLElement{constructor(){super();const t=this.attachShadow({mode:"open"});t.innerHTML=`
      <style>
        :host {
          display: flex;
          position: relative;
          bottom: 0;
          width: 100%;
          margin: 0;
          padding: 0;
          z-index: 0;
          background: var(--color-gs00);
        }
        :host([position="top"]) {
          top: 0;
          bottom: auto;
          height: 3rem;
        }
        :host([skin="dark"]) {
          border-color: rgba(189,189,189, 0.1);
        }
        ::slotted(*) {
          box-sizing: content-box;
          position: relative;
          margin: 0;
          padding: 0 0.5rem 0 1rem;
          height: 3rem;
          border: 0;
          flex: 1 1 0;
          line-height: 3rem;
          text-align: center;
          font-family: sans-serif;
          text-decoration: none;
          color: var(--color-gs45);
          background-color: transparent;
          cursor: pointer;
          list-style: none;
          white-space: nowrap;
        }
        ::slotted(a),
        ::slotted(div),
        ::slotted(button) {
          background-repeat: no-repeat;
          background-position: top center;
        }
        ::slotted(a) {
          text-decoration: none;
          display: block;
        }
        ::slotted([position="top"] > *) {
          height: 3rem;
        }
        :host([skin="dark"]) ::slotted(*) {
          background-color: #000;
          color: #fff;
        }
        ::slotted(*):active {
          border-radius: 0;
          background-color: #b2f2ff;
        }
        ::slotted(.selected) {
          color: var(--color-gs90);
          font-weight: 700;
        }
        :host([skin="dark"]) ::slotted(.selected) {
          color: #00aacc;
        }
        ::slotted([disabled]) {
          color: #333;
          opacity: 0.25;
          pointer-events: none;
        }
        :host([skin="dark"]) ::slotted([disabled]) {
          color: rgba(255,255,255,0.4);
          opacity: 1;
        }
        :host ::slotted(.selected):after {
          content: "";
          position: absolute;
          left: 0;
          bottom: 0;
          width: 100%;
          border-bottom: 0.3rem solid #00aacc;
        }
      </style>
      <slot id="tabsSlot" name="tab"></slot>
    `}connectedCallback(){this.setAttribute("role","tablist");const t=this.shadowRoot.querySelector("slot");t.addEventListener("slotchange",t=>{this.tabs=t.target.assignedElements({flatten:!0});for(var[,e]of this.tabs.entries())e.setAttribute("role","tab")}),this.addEventListener("click",this.onClick),setTimeout(()=>{this.select(this.getAttribute("selected"))}),window.addEventListener("largetextenabledchanged",()=>{setTimeout(()=>{this._updateIndicator(this.selected||0)})})}attributeChangedCallback(t,e,s){"selected"===t&&this.select(s)}onClick(t){let e=t.target;var s;const{indexOf:o}=[];for(;e;){if(-1<(s=o.call(this.children,e)))return this.select(s);e=e.parentNode}}select(t){if(null!==t){t=Number(t);const s=this.children[t];this.deselect(this.selected),this.selected=t,s.classList.add("selected");var e=new CustomEvent("change");setTimeout(this.dispatchEvent.bind(this,e)),this._updateIndicator(t)}}addItem(t,e){var s=this.children.length;(e=e||s-1)<0||s-1<e||!t||this.insertBefore(t,this.children[e])}removeItem(t){t=document.getElementById(t);t&&this.removeChild(t)}_updateIndicator(t){var e="rtl"===document.documentElement.dir;let s=0;var o=this.children,i=this.offsetWidth,a=o[t].offsetLeft,n=o[t].offsetWidth,r=i-(a+n),l=o[o.length-1].offsetLeft,d=i-(l+o[o.length-1].offsetWidth);if(0===t)s=0;else if(t===o.length-1)s=e?Math.abs(l):0<d?0:d;else{o=(a+r)/2;let t=o-a;e?i<(n=r+n)&&(s=n<d?(t=Math.abs(o)-a,Math.abs(t)):Math.abs(l)):0<t||0<d?s=0:t<0&&t>d?s=t:t<0&&t<d&&(s=d)}this.style.transform=`translateX(${s}px)`}deselect(t){const e=this.children[t];e&&(e.classList.remove("selected"),this.current===e&&(this.selected=null))}}customElements.define("gaia-tabs",GaiaTabs);