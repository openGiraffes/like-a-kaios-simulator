class GaiaProgress extends HTMLElement{constructor(){super();const e=this.attachShadow({mode:"open"});e.innerHTML=`
    <div class="inner">
      <div class="bar"></div>
    </div>
    <style>
      :host {
        display: block;
        overflow: hidden;
        height: 0.6rem;
        border-radius: 0.3rem;
        width: 100%;
      }
      .inner {
        height: 100%;
        background: var(--color-gs45, #aaa)
      }
      .bar {
        position: relative;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: var(--highlight-color);
        transition: transform 0ms linear;
      }
      .bar:after {
        position: absolute;
        left: 100%;
        display: block;
        content: '';
        width: 0;
        height: 0;
        border-top: 0.6rem solid var(--color-gs00, #fff);
        border-left: 0.3rem solid var(--color-gs00, #fff);
      }
      .focus.bar {
        background-color: var(--color-gs00);
      }
      .focus.bar::after {
        border-top: 0.6rem solid var(--highlight-color);
        border-left: 0.3rem solid var(--highlight-color);
      }
      .bar:before {
        position: absolute;
        left: -0.3rem;
        display: block;
        content: '';
        width: 0;
        height: 0;
        border-top: 0.6rem solid var(--color-gs00, #fff);
        border-left: 0.3rem solid var(--color-gs00, #fff);
      }
      .no-value .bar {
        left: 0;
        width: 100%;
      }
      .no-value.increasing  .bar {
        animation: moving-in 1520ms cubic-bezier(0.3, 0, 0.4, 1);
      }
      .no-value.decreasing  .bar {
        animation: moving-out 1520ms cubic-bezier(0.6, 0, 0.3, 1);
      }
      :dir(rtl) {
        transform: rotateY(180deg);
      }

      @keyframes moving-in {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(0%); }
      }

      @keyframes moving-out {
        0% { transform: translateX(0%); }
        100% { transform: translateX(100%); }
      }
    </style>
  `}connectedCallback(){this.els={inner:this.shadowRoot.querySelector(".inner"),bar:this.shadowRoot.querySelector(".bar")},this.els.inner.setAttribute("role","progressbar"),this.els.inner.setAttribute("aria-valuemin","0"),this.els.inner.setAttribute("aria-valuemax","100"),this.els.bar.classList.toggle("focus","true"===this.getAttribute("selected")),this.value=this.getAttribute("value")||0,this.handleAnimationEnd=()=>{const{classList:e}=this.els.inner;e.contains("no-value")&&(e.contains("increasing")?(e.remove("increasing"),e.add("decreasing")):(e.remove("decreasing"),e.add("increasing")))},this.els.inner.addEventListener("animationend",this.handleAnimationEnd)}disconnectedCallback(){this.els.inner.removeEventListener("animationend",this.handleAnimationEnd)}get value(){return this._value||0}set value(e){var t;(e=Math.min(100,Math.max(0,Number(e))))?(t=Math.abs(this.value-e)/100*2e3,this.els.bar.style.transform=`translateX(${e}%)`,this.els.bar.style.transitionDuration=`${t}ms`,this.els.inner.setAttribute("aria-valuenow",e)):this.els.inner.removeAttribute("aria-valuenow"),this.els.inner.classList.toggle("no-value",!e),this.els.inner.classList.toggle("increasing",!e),this._value=e}get selected(){return this._selected||0}set selected(e){this.els.bar.classList.toggle("focus","true"===e),this._selected=e}}customElements.define("gaia-progress",GaiaProgress);