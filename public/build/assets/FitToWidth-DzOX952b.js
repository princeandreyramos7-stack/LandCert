import{R as l,j as i}from"./app-B_KJLvoH.js";const d=`
.fit-viewport {
    margin: 0 auto;
    overflow: hidden;
}

.fit-scaler {
    width: max-content;
    transform: scale(var(--fit-scale, 1));
    transform-origin: top left;
}

.fit-viewport.fit-suspended {
    width: auto !important;
    height: auto !important;
    overflow: visible !important;
}

.fit-viewport.fit-suspended .fit-scaler {
    transform: none !important;
}

@media print {
    .fit-viewport {
        width: auto !important;
        height: auto !important;
        margin: 0 !important;
        overflow: visible !important;
    }

    .fit-scaler {
        width: auto !important;
        transform: none !important;
    }
}
`;function h(n){const e=n?.closest?.(".fit-viewport");return e?(e.classList.add("fit-suspended"),()=>e.classList.remove("fit-suspended")):()=>{}}function w({children:n}){const e=l.useRef(null),f=l.useRef(null);return l.useLayoutEffect(()=>{const t=e.current,s=f.current;if(!t||!s)return;let c=null;const p=()=>{const u=t.parentElement?.clientWidth??0,a=s.offsetWidth,m=s.offsetHeight;if(!u||!a)return;const r=Math.min(1,u/a);r!==c&&(c=r,t.style.setProperty("--fit-scale",String(r)),t.style.width=`${a*r}px`,t.style.height=`${m*r}px`)};p();const o=new ResizeObserver(p);return t.parentElement&&o.observe(t.parentElement),o.observe(s),()=>o.disconnect()},[]),i.jsxs(i.Fragment,{children:[i.jsx("style",{dangerouslySetInnerHTML:{__html:d}}),i.jsx("div",{ref:e,className:"fit-viewport",children:i.jsx("div",{ref:f,className:"fit-scaler",children:n})})]})}export{w as F,h as s};
