function r(i){const n=String(i||"").trim();if(!n)return"ENGR. CRISANTA D. CONCEPCION, EnP";const t=/^engr\.?\s/i.test(n)?n:`ENGR. ${n}`;return/,\s*enp\b/i.test(t)?t:`${t}, EnP`}export{r as z};
