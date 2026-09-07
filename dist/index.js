import { createRequire } from 'module';

createRequire(import.meta.url);

// src/components/options.ts
var defaultOptions = { rate: 1, pitch: 1 };
var OPTIONS_KEY = /* @__PURE__ */ Symbol.for("quartz-tts:options");
function setOptions(options) {
  globalThis[OPTIONS_KEY] = {
    rate: typeof options?.rate === "number" ? options.rate : defaultOptions.rate,
    pitch: typeof options?.pitch === "number" ? options.pitch : defaultOptions.pitch
  };
}
function getOptions() {
  return globalThis[OPTIONS_KEY] ?? defaultOptions;
}

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

// src/components/styles/textToSpeech.scss
var textToSpeech_default = ".tts {\n  display: inline-flex;\n  align-items: center;\n  gap: 0.25rem;\n  flex-shrink: 0;\n}\n.tts[data-tts-supported=false] {\n  display: none;\n}\n\n.tts-toggle,\n.tts-stop {\n  cursor: pointer;\n  padding: 0;\n  position: relative;\n  background: none;\n  border: none;\n  width: 20px;\n  height: 32px;\n  margin: 0;\n  flex-shrink: 0;\n}\n.tts-toggle svg,\n.tts-stop svg {\n  position: absolute;\n  width: 20px;\n  height: 20px;\n  top: calc(50% - 10px);\n  left: 0;\n  fill: var(--darkgray);\n  transition: opacity 0.1s ease;\n}\n.tts-toggle:hover svg,\n.tts-stop:hover svg {\n  fill: var(--dark);\n}\n\n.tts-stop {\n  display: none;\n}\n\n.tts[data-tts-state=playing] .tts-stop,\n.tts[data-tts-state=paused] .tts-stop {\n  display: inline-block;\n}\n\n.tts-icon-pause {\n  display: none;\n}\n\n.tts[data-tts-state=playing] .tts-icon-play {\n  display: none;\n}\n\n.tts[data-tts-state=playing] .tts-icon-pause {\n  display: inline;\n}";

// src/components/scripts/textToSpeech.inline.ts
var textToSpeech_inline_default = `var H=new Set(["P","LI","H1","H2","H3","H4","H5","H6","BLOCKQUOTE","TD","TH","FIGCAPTION","DT","DD"]),x=["pre",".clipboard-button",".katex",".footnote-ref","a[role='anchor']",".mermaid","svg"].join(",");function A(t){return t.replace(/\\s+/g," ").trim()}function y(t){return H.has(t.tagName)?!0:Array.from(t.children).some(y)}function S(t,n){let o="",e=()=>{let s=A(o);s&&n.push(s),o=""};for(let s of Array.from(t.childNodes))if(s.nodeType===Node.TEXT_NODE)o+=s.textContent??"";else if(s.nodeType===Node.ELEMENT_NODE){let r=s;y(r)?(e(),S(r,n)):o+=r.textContent??""}e()}function E(t){let n=t.cloneNode(!0);n.querySelectorAll(x).forEach(e=>e.remove()),n.querySelectorAll("img").forEach(e=>{let s=e.getAttribute("alt")?.trim();e.replaceWith(s?document.createTextNode(s):"")});let o=[];return S(n,o),o}function T(){let t=document.querySelector(".tts");if(!t)return;let n=t.querySelector(".tts-toggle"),o=t.querySelector(".tts-stop");if(!n||!o)return;if(!("speechSynthesis"in window)){t.dataset.ttsSupported="false";return}t.dataset.ttsSupported="true";let e="idle",s=0,r={play:n.dataset.labelPlay??n.getAttribute("aria-label")??"Play",pause:n.dataset.labelPause??"Pause",resume:n.dataset.labelResume??"Resume"};function i(){t.dataset.ttsState=e,n.setAttribute("aria-pressed",e==="idle"?"false":"true"),n.setAttribute("aria-label",e==="playing"?r.pause:e==="paused"?r.resume:r.play)}function l(){window.speechSynthesis.cancel(),e="idle",i()}function v(){let c=document.querySelector(".center > article")??document.querySelector("article");if(!c)return;let d=E(c);if(d.length===0)return;window.speechSynthesis.cancel();let L=++s,b=Number(t.dataset.ttsRate??"1")||1,k=Number(t.dataset.ttsPitch??"1")||1,m=document.documentElement.lang||void 0;d.forEach((N,C)=>{let a=new SpeechSynthesisUtterance(N);if(a.rate=b,a.pitch=k,m&&(a.lang=m),C===d.length-1){let h=()=>{L===s&&(e="idle",i())};a.addEventListener("end",h),a.addEventListener("error",h)}window.speechSynthesis.speak(a)}),e="playing",i()}let u=()=>{e==="idle"?v():e==="playing"?(window.speechSynthesis.pause(),e="paused",i()):(window.speechSynthesis.resume(),e="playing",i())},p=()=>l(),f=c=>{c.key==="Escape"&&e!=="idle"&&l()};return n.addEventListener("click",u),o.addEventListener("click",p),document.addEventListener("keydown",f),e="idle",i(),()=>{n.removeEventListener("click",u),o.removeEventListener("click",p),document.removeEventListener("keydown",f)}}function g(){"speechSynthesis"in window&&window.speechSynthesis.cancel()}function w(){let t=T();t&&window.addCleanup(t)}document.addEventListener("nav",w);document.addEventListener("render",w);document.addEventListener("prenav",g);
`;
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

// src/index.ts
function init(options) {
  setOptions(options);
}

export { TextToSpeech_default as TextToSpeech, init };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map