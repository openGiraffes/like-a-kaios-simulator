class GaiaConfirm extends HTMLElement{constructor(){super();const t=this.attachShadow({mode:"open"});t.innerHTML=`
      <div class="container">
        <form role="dialog" class="confirm">
          <section>
            <slot name="title"></slot>
            <slot name="content"></slot>
          </section>
        </form>
      </div>

      <style>
        :host {
          background-color: rgba(0, 0, 0, 0.8);
          overflow: auto;
          position: absolute;
          height: calc(100% - var(--softkeybar-height));
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          padding-bottom: 0;
          display: flex;
          align-items: stretch;
          flex-direction: column;
          transition: transform ease-in-out 0.3s, visibility 0.3s;
          z-index: 1023;
        }
        div.container {
          height: 100%;
          display: flex;
          align-items: flex-end;
        }
        .container .confirm {
          width: 100%;
        }
        :host(.insystem) {
          margin-top: 3rem;
        }
        html[dir="ltr"] :host {
          text-align: left;
        }
        html[dir="rtl"] :host {
          text-align: right;
        }
        :host([hidden]) {
          transform: translateY(100%);
          visibility: hidden;
          pointer-events: none;
        }
        :host button {
          width: 50%;
          border-radius: 0;
        }
        :host button.blank {
          visibility: hidden;
        }
        ::slotted(.content) {
          overflow-y: auto;
        }
        ::slotted(h1) {
          font-weight: 300;
          margin: 0;
          padding: 0.5rem 1rem;
          word-wrap: break-word;
          color: var(--color-gs90);
          background-color: var(--color-gs20);
        }
        ::slotted(p) {
          font-weight: normal;
          word-wrap: break-word;
          margin: 0;
          padding: 1rem;
          line-height: 2.4rem;
          color: var(--color-gs90);
          background: var(--color-gs10);
        }

        p.noborder {
          border: none;
        }
      </style>
    `}}customElements.define("gaia-confirm",GaiaConfirm);