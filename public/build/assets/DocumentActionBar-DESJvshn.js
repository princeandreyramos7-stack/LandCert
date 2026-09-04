import{R as d,j as e,B as x}from"./app-DgFlZSON.js";import{F as p}from"./file-text-BW5IWZH4.js";import{P as u}from"./printer-Bt0oPIAG.js";import{D as w}from"./download-coL1FBtF.js";const v=`
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
`;function k(r){const s=r?.closest?.(".fit-viewport");return s?(s.classList.add("fit-suspended"),()=>s.classList.remove("fit-suspended")):()=>{}}function y({children:r}){const s=d.useRef(null),n=d.useRef(null);return d.useLayoutEffect(()=>{const t=s.current,i=n.current;if(!t||!i)return;let l=null;const o=()=>{const f=t.parentElement?.clientWidth??0,m=i.offsetWidth,h=i.offsetHeight;if(!f||!m)return;const a=Math.min(1,f/m);a!==l&&(l=a,t.style.setProperty("--fit-scale",String(a)),t.style.width=`${m*a}px`,t.style.height=`${h*a}px`)};o();const c=new ResizeObserver(o);return t.parentElement&&c.observe(t.parentElement),c.observe(i),()=>c.disconnect()},[]),e.jsxs(e.Fragment,{children:[e.jsx("style",{dangerouslySetInnerHTML:{__html:v}}),e.jsx("div",{ref:s,className:"fit-viewport",children:e.jsx("div",{ref:n,className:"fit-scaler",children:r})})]})}function D({eyebrow:r,title:s,subtitle:n,printLabel:t="Print",onPrint:i,onDownload:l,icon:o=p}){return e.jsx("div",{className:"relative overflow-hidden rounded-2xl text-white mb-6 no-print",style:{background:"linear-gradient(135deg,#0d1f5c 0%,#1a3a8f 60%,#112068 100%)"},children:e.jsxs("div",{className:"relative z-10 flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6",children:[e.jsxs("div",{className:"flex min-w-0 items-center gap-3 sm:gap-4",children:[e.jsx("div",{className:"shrink-0 rounded-xl border border-[#d4a017]/30 bg-[#d4a017]/20 p-2.5 sm:p-3",children:e.jsx(o,{className:"h-6 w-6 text-[#d4a017] sm:h-7 sm:w-7"})}),e.jsxs("div",{className:"min-w-0",children:[e.jsxs("div",{className:"mb-1 flex items-center gap-2",children:[e.jsx("div",{className:"h-4 w-1 shrink-0 rounded-full bg-[#d4a017]"}),e.jsx("p",{className:"truncate text-xs font-black uppercase tracking-widest text-[#d4a017]",children:r})]}),e.jsx("h1",{className:"text-lg font-black text-white sm:text-xl",children:s}),n&&e.jsx("p",{className:"truncate text-xs text-blue-200/70 sm:text-sm",children:n})]})]}),e.jsxs("div",{className:"flex shrink-0 gap-2 sm:gap-3",children:[e.jsxs(x,{onClick:i,title:t,"aria-label":t,className:"flex-1 bg-[#d4a017] px-3 text-white hover:bg-[#b8910f] sm:flex-none sm:px-4",children:[e.jsx(u,{className:"h-4 w-4 shrink-0 sm:mr-2"}),e.jsx("span",{className:"hidden sm:inline",children:t})]}),e.jsxs(x,{onClick:l,title:"Download PDF","aria-label":"Download PDF",className:"flex-1 border-white bg-white px-3 text-[#0d1f5c] hover:bg-gray-100 sm:flex-none sm:px-4",children:[e.jsx(w,{className:"h-4 w-4 shrink-0 sm:mr-2"}),e.jsx("span",{className:"hidden sm:inline",children:"Download PDF"})]})]})]})})}export{D,y as F,k as s};
