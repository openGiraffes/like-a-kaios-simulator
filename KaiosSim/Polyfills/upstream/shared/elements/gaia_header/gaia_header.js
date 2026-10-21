class GaiaHeader extends HTMLElement{constructor(){super();const e=this.attachShadow({mode:"open"});e.innerHTML=`
        <div class="inner">
          <slot name="text"></slot>
        </div>

        <style>
          :host {
            display: block;
          }

          :host[hidden] {
            display: none;
          }

          .inner {
            display: flex;
            flex-direction: row;
            align-items: center;
            height: var(--header-height, 2.8rem);;
            direction: ltr;

            background:
              var(--header-background,
              var(--background,
              #fff));
          }

          ::slotted(h1),
          ::slotted(h2) {
            flex: 1;
            margin: 0;
            padding: 0;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
            text-align: center;
            line-height: var(--header-height, 2.8rem);
            font-weight: 400;
            font-size: 1.7rem;
            color:
            var(--header-title-color,
            var(--header-color,
            var(--title-color,
            var(--text-color,
            inherit))));
          }

          :host-context([dir=rtl]) ::slotted(h1) {
            direction: rtl;
          }
        </style>
      `}}customElements.define("gaia-header",GaiaHeader);