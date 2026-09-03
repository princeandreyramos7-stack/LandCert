import{R as d,j as e}from"./app-C6fvZUh-.js";import{B as p}from"./button-CqalaHWV.js";import{F as h}from"./file-text-BRJDJRo5.js";import{P as u}from"./printer-_fvzQU9P.js";import{D as v}from"./download-C5SvYu-s.js";const w=`
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
`;function y(i){const s=i?.closest?.(".fit-viewport");return s?(s.classList.add("fit-suspended"),()=>s.classList.remove("fit-suspended")):()=>{}}function F({children:i}){const s=d.useRef(null),n=d.useRef(null);return d.useLayoutEffect(()=>{const t=s.current,r=n.current;if(!t||!r)return;let o=null;const l=()=>{const f=t.parentElement?.clientWidth??0,m=r.offsetWidth,x=r.offsetHeight;if(!f||!m)return;const a=Math.min(1,f/m);a!==o&&(o=a,t.style.setProperty("--fit-scale",String(a)),t.style.width=`${m*a}px`,t.style.height=`${x*a}px`)};l();const c=new ResizeObserver(l);return t.parentElement&&c.observe(t.parentElement),c.observe(r),()=>c.disconnect()},[]),e.jsxs(e.Fragment,{children:[e.jsx("style",{dangerouslySetInnerHTML:{__html:w}}),e.jsx("div",{ref:s,className:"fit-viewport",children:e.jsx("div",{ref:n,className:"fit-scaler",children:i})})]})}function R({eyebrow:i,title:s,subtitle:n,printLabel:t="Print",onPrint:r,onDownload:o,icon:l=h}){return e.jsx("div",{className:"relative overflow-hidden rounded-2xl text-white mb-6 no-print",style:{background:"linear-gradient(135deg,#0d1f5c 0%,#1a3a8f 60%,#112068 100%)"},children:e.jsxs("div",{className:"relative z-10 flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6",children:[e.jsxs("div",{className:"flex min-w-0 items-center gap-3 sm:gap-4",children:[e.jsx("div",{className:"shrink-0 rounded-xl border border-[#d4a017]/30 bg-[#d4a017]/20 p-2.5 sm:p-3",children:e.jsx(l,{className:"h-6 w-6 text-[#d4a017] sm:h-7 sm:w-7"})}),e.jsxs("div",{className:"min-w-0",children:[e.jsxs("div",{className:"mb-1 flex items-center gap-2",children:[e.jsx("div",{className:"h-4 w-1 shrink-0 rounded-full bg-[#d4a017]"}),e.jsx("p",{className:"truncate text-xs font-black uppercase tracking-widest text-[#d4a017]",children:i})]}),e.jsx("h1",{className:"text-lg font-black text-white sm:text-xl",children:s}),n&&e.jsx("p",{className:"truncate text-xs text-blue-200/70 sm:text-sm",children:n})]})]}),e.jsxs("div",{className:"flex shrink-0 gap-2 sm:gap-3",children:[e.jsxs(p,{onClick:r,className:"flex-1 bg-[#d4a017] text-white hover:bg-[#b8910f] sm:flex-none",children:[e.jsx(u,{className:"mr-2 h-4 w-4 shrink-0"}),t]}),e.jsxs(p,{onClick:o,className:"flex-1 border-white bg-white text-[#0d1f5c] hover:bg-gray-100 sm:flex-none",children:[e.jsx(v,{className:"mr-2 h-4 w-4 shrink-0"}),e.jsx("span",{className:"truncate",children:"Download PDF"})]})]})]})})}export{R as D,F,y as s};
