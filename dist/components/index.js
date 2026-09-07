import { createRequire } from 'module';

createRequire(import.meta.url);

// node_modules/@quartz-community/utils/dist/lang.js
function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

// src/i18n/locales/en-US.ts
var en_US_default = {
  components: {
    textToSpeech: {
      play: "Read this page aloud",
      pause: "Pause reading",
      resume: "Resume reading",
      stop: "Stop reading"
    }
  }
};

// src/i18n/index.ts
var locales = {
  "en-US": en_US_default
};
function i18n(locale) {
  return locales[locale] || en_US_default;
}

// src/components/options.ts
var defaultOptions = { rate: 1, pitch: 1 };
var OPTIONS_KEY = /* @__PURE__ */ Symbol.for("quartz-tts:options");
function getOptions() {
  return globalThis[OPTIONS_KEY] ?? defaultOptions;
}

// src/components/styles/textToSpeech.scss
var textToSpeech_default = ".tts {\n  display: inline-flex;\n  align-items: center;\n  gap: 0.25rem;\n  flex-shrink: 0;\n}\n.tts[data-tts-supported=false] {\n  display: none;\n}\n\n.tts-toggle,\n.tts-stop {\n  cursor: pointer;\n  padding: 0;\n  position: relative;\n  background: none;\n  border: none;\n  width: 20px;\n  height: 32px;\n  margin: 0;\n  flex-shrink: 0;\n}\n.tts-toggle svg,\n.tts-stop svg {\n  position: absolute;\n  width: 20px;\n  height: 20px;\n  top: calc(50% - 10px);\n  left: 0;\n  fill: var(--darkgray);\n  transition: opacity 0.1s ease;\n}\n.tts-toggle:hover svg,\n.tts-stop:hover svg {\n  fill: var(--dark);\n}\n\n.tts-stop {\n  display: none;\n}\n\n.tts[data-tts-state=playing] .tts-stop,\n.tts[data-tts-state=paused] .tts-stop {\n  display: inline-block;\n}\n\n.tts-icon-pause {\n  display: none;\n}\n\n.tts[data-tts-state=playing] .tts-icon-play {\n  display: none;\n}\n\n.tts[data-tts-state=playing] .tts-icon-pause {\n  display: inline;\n}";

// src/components/scripts/textToSpeech.inline.ts
var textToSpeech_inline_default = 'var V=new Set(["P","LI","H1","H2","H3","H4","H5","H6","BLOCKQUOTE","TD","TH","FIGCAPTION","DT","DD"]),q=["pre",".clipboard-button",".katex",".footnote-ref","a[role=\'anchor\']",".mermaid","svg"].join(",");function D(t){return t.replace(/\\s+/g," ").trim()}function N(t){return V.has(t.tagName)?!0:Array.from(t.children).some(N)}function x(t,n){let r="",e=()=>{let s=D(r);s&&n.push(s),r=""};for(let s of Array.from(t.childNodes))if(s.nodeType===Node.TEXT_NODE)r+=s.textContent??"";else if(s.nodeType===Node.ELEMENT_NODE){let a=s;N(a)?(e(),x(a,n)):r+=a.textContent??""}e()}function A(t){let n=t.cloneNode(!0);n.querySelectorAll(q).forEach(e=>e.remove()),n.querySelectorAll("img").forEach(e=>{let s=e.getAttribute("alt")?.trim();e.replaceWith(s?document.createTextNode(s):"")});let r=[];return x(n,r),r}function H(){let t=document.querySelector(".tts");if(!t)return;let n=t.querySelector(".tts-toggle"),r=t.querySelector(".tts-stop");if(!n||!r)return;if(!("speechSynthesis"in window)){t.dataset.ttsSupported="false";return}t.dataset.ttsSupported="true";let e="idle",s=0,a=[],u=0,f=[];function E(){let o=window.speechSynthesis.getVoices();o.length>0&&(f=o)}E(),window.speechSynthesis.addEventListener("voiceschanged",E);let I=/espeak|pico|festival/i;function P(o){if(f.length===0)return;let l=(o??"").toLowerCase(),S=l.split("-")[0],y=l?f.filter(c=>{let i=c.lang.toLowerCase();return i===l||i===S||i.startsWith(`${S}-`)}):f,h=y.length>0?y:f;function m(c){let i=0;return c.localService||(i+=2),I.test(c.name)||(i+=1),c.default&&(i+=1),i}return[...h].sort((c,i)=>m(i)-m(c))[0]}let g={play:n.dataset.labelPlay??n.getAttribute("aria-label")??"Play",pause:n.dataset.labelPause??"Pause",resume:n.dataset.labelResume??"Resume"};function p(){t.dataset.ttsState=e,n.setAttribute("aria-pressed",e==="idle"?"false":"true"),n.setAttribute("aria-label",e==="playing"?g.pause:e==="paused"?g.resume:g.play)}function T(){window.speechSynthesis.cancel(),e="idle",u=0,p()}function w(o){window.speechSynthesis.cancel();let l=++s,S=Number(t.dataset.ttsRate??"1")||1,y=Number(t.dataset.ttsPitch??"1")||1,h=document.documentElement.lang||void 0,m=P(h);a.slice(o).forEach((c,i)=>{let k=o+i,d=new SpeechSynthesisUtterance(c);if(d.rate=S,d.pitch=y,h&&(d.lang=h),m&&(d.voice=m),d.addEventListener("start",()=>{l===s&&(u=k)}),k===a.length-1){let C=()=>{l===s&&e!=="paused"&&(e="idle",u=0,p())};d.addEventListener("end",C),d.addEventListener("error",C)}window.speechSynthesis.speak(d)}),e="playing",p()}function R(){let o=document.querySelector(".center > article")??document.querySelector("article");o&&(a=A(o),a.length!==0&&(u=0,w(0)))}let v=()=>{e==="idle"?R():e==="playing"?(window.speechSynthesis.cancel(),e="paused",p()):w(u)},L=()=>T(),b=o=>{o.key==="Escape"&&e!=="idle"&&T()};return n.addEventListener("click",v),r.addEventListener("click",L),document.addEventListener("keydown",b),e="idle",p(),()=>{n.removeEventListener("click",v),r.removeEventListener("click",L),document.removeEventListener("keydown",b),window.speechSynthesis.removeEventListener("voiceschanged",E)}}function O(){"speechSynthesis"in window&&window.speechSynthesis.cancel()}function B(){let t=H();t&&window.addCleanup(t)}document.addEventListener("nav",B);document.addEventListener("render",B);document.addEventListener("prenav",O);\n';
var l;
l = { __e: function(n2, l2, u3, t2) {
  for (var i2, r2, o2; l2 = l2.__; ) if ((i2 = l2.__c) && !i2.__) try {
    if ((r2 = i2.constructor) && null != r2.getDerivedStateFromError && (i2.setState(r2.getDerivedStateFromError(n2)), o2 = i2.__d), null != i2.componentDidCatch && (i2.componentDidCatch(n2, t2 || {}), o2 = i2.__d), o2) return i2.__E = i2;
  } catch (l3) {
    n2 = l3;
  }
  throw n2;
} }, "function" == typeof Promise ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout, Math.random().toString(8);

// node_modules/preact/jsx-runtime/dist/jsxRuntime.mjs
var f2 = 0;
function u2(e2, t2, n2, o2, i2, u3) {
  t2 || (t2 = {});
  var a2, c2, p2 = t2;
  if ("ref" in p2) for (c2 in p2 = {}, t2) "ref" == c2 ? a2 = t2[c2] : p2[c2] = t2[c2];
  var l2 = { type: e2, props: p2, key: n2, ref: a2, __k: null, __: null, __b: 0, __e: null, __c: null, constructor: void 0, __v: --f2, __i: -1, __u: 0, __source: i2, __self: u3 };
  if ("function" == typeof e2 && (a2 = e2.defaultProps)) for (c2 in a2) void 0 === p2[c2] && (p2[c2] = a2[c2]);
  return l.vnode && l.vnode(l2), l2;
}

// src/components/TextToSpeech.tsx
var TextToSpeech = ({ displayClass, cfg }) => {
  const t2 = i18n(cfg?.locale ?? "en-US").components.textToSpeech;
  const { rate, pitch } = getOptions();
  return /* @__PURE__ */ u2(
    "span",
    {
      class: classNames(displayClass, "tts"),
      "data-tts-state": "idle",
      "data-tts-rate": rate,
      "data-tts-pitch": pitch,
      children: [
        /* @__PURE__ */ u2(
          "button",
          {
            class: "tts-toggle",
            type: "button",
            "aria-label": t2.play,
            "aria-pressed": "false",
            "data-label-play": t2.play,
            "data-label-pause": t2.pause,
            "data-label-resume": t2.resume,
            children: [
              /* @__PURE__ */ u2("svg", { class: "tts-icon-play", viewBox: "0 0 24 24", "aria-hidden": "true", children: /* @__PURE__ */ u2("path", { d: "M8 5v14l11-7z" }) }),
              /* @__PURE__ */ u2("svg", { class: "tts-icon-pause", viewBox: "0 0 24 24", "aria-hidden": "true", children: /* @__PURE__ */ u2("path", { d: "M6 5h4v14H6zM14 5h4v14h-4z" }) })
            ]
          }
        ),
        /* @__PURE__ */ u2("button", { class: "tts-stop", type: "button", "aria-label": t2.stop, children: /* @__PURE__ */ u2("svg", { viewBox: "0 0 24 24", "aria-hidden": "true", children: /* @__PURE__ */ u2("path", { d: "M6 6h12v12H6z" }) }) })
      ]
    }
  );
};
TextToSpeech.css = textToSpeech_default;
TextToSpeech.afterDOMLoaded = textToSpeech_inline_default;
var TextToSpeech_default = (() => TextToSpeech);

export { TextToSpeech_default as TextToSpeech };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map