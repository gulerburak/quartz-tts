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
      stop: "Stop reading",
      voice: "Choose voice",
      automaticVoice: "Automatic (recommended)"
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
var textToSpeech_default = ".tts {\n  display: inline-flex;\n  align-items: center;\n  gap: 0.25rem;\n  flex-shrink: 0;\n  position: relative;\n}\n.tts[data-tts-supported=false] {\n  display: none;\n}\n\n.tts-toggle,\n.tts-stop {\n  cursor: pointer;\n  padding: 0;\n  position: relative;\n  background: none;\n  border: none;\n  width: 20px;\n  height: 32px;\n  margin: 0;\n  flex-shrink: 0;\n}\n.tts-toggle svg,\n.tts-stop svg {\n  position: absolute;\n  width: 20px;\n  height: 20px;\n  top: calc(50% - 10px);\n  left: 0;\n  fill: var(--darkgray);\n  transition: opacity 0.1s ease;\n}\n.tts-toggle:hover svg,\n.tts-stop:hover svg {\n  fill: var(--dark);\n}\n\n.tts-stop {\n  display: none;\n}\n\n.tts[data-tts-state=playing] .tts-stop,\n.tts[data-tts-state=paused] .tts-stop {\n  display: inline-block;\n}\n\n.tts-icon-pause {\n  display: none;\n}\n\n.tts[data-tts-state=playing] .tts-icon-play {\n  display: none;\n}\n\n.tts[data-tts-state=playing] .tts-icon-pause {\n  display: inline;\n}\n\n.tts-voice {\n  cursor: pointer;\n  padding: 0;\n  position: relative;\n  background: none;\n  border: none;\n  width: 20px;\n  height: 32px;\n  margin: 0;\n  flex-shrink: 0;\n}\n.tts-voice svg {\n  position: absolute;\n  width: 16px;\n  height: 16px;\n  top: calc(50% - 8px);\n  left: 2px;\n  fill: var(--darkgray);\n  transition: fill 0.1s ease;\n}\n.tts-voice:hover svg, .tts-voice[aria-expanded=true] svg {\n  fill: var(--dark);\n}\n\n.tts-voice-menu {\n  position: fixed;\n  z-index: 10000;\n  min-width: 12rem;\n  max-height: 16rem;\n  overflow-y: auto;\n  background: var(--light);\n  border: 1px solid var(--lightgray);\n  border-radius: 4px;\n  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);\n  padding: 0.25rem;\n}\n.tts-voice-menu[hidden] {\n  display: none;\n}\n\n.tts-voice-option {\n  display: block;\n  width: 100%;\n  text-align: left;\n  padding: 0.35rem 0.5rem;\n  background: none;\n  border: none;\n  border-radius: 3px;\n  font-size: 0.85rem;\n  color: var(--dark);\n  cursor: pointer;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n.tts-voice-option:hover {\n  background: var(--lightgray);\n}\n.tts-voice-option[aria-selected=true] {\n  font-weight: 600;\n  color: var(--secondary);\n}\n\n.tts-word {\n  cursor: pointer;\n}\n\n.tts-word-active {\n  background: var(--textHighlight);\n  border-radius: 2px;\n}";

// src/components/scripts/textToSpeech.inline.ts
var textToSpeech_inline_default = 'var le=new Set(["P","LI","H1","H2","H3","H4","H5","H6","BLOCKQUOTE","TD","TH","FIGCAPTION","DT","DD"]),fe=["pre",".clipboard-button",".katex",".footnote-ref","a[role=\'anchor\']",".mermaid","svg"].join(","),_="tts-word",z="tts-alt-words";function Y(e){return le.has(e.tagName)?!0:Array.from(e.children).some(Y)}function me(e,r){if(!e.data.trim())return;let d=e.data.split(/(\\s+)/),a=document.createDocumentFragment();for(let t of d){if(t==="")continue;if(/^\\s+$/.test(t)){a.appendChild(document.createTextNode(t));continue}let o=document.createElement("span");o.className=_,o.textContent=t,a.appendChild(o),r.push(o)}e.replaceWith(a)}function pe(e,r){let d=e.getAttribute("alt")?.trim();if(!d)return;let a=d.split(/\\s+/).filter(Boolean);if(a.length===0)return;let t=document.createElement("span");t.className=z,t.setAttribute("aria-hidden","true"),t.style.cssText="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;",a.forEach((o,u)=>{u>0&&t.appendChild(document.createTextNode(" "));let f=document.createElement("span");f.className=_,f.textContent=o,t.appendChild(f),r.push(f)}),e.insertAdjacentElement("afterend",t)}function Q(e,r){let d=[],a=()=>{d.length>0&&r.push(d),d=[]};function t(o){if(o.nodeType===Node.TEXT_NODE){me(o,d);return}if(o.nodeType!==Node.ELEMENT_NODE)return;let u=o;if(!u.matches(fe)){if(u.tagName==="IMG"){pe(u,d);return}if(Y(u)){a(),Q(u,r);return}Array.from(u.childNodes).forEach(t)}}Array.from(e.childNodes).forEach(t),a()}function X(e){R(e);let r=[];return Q(e,r),r.forEach((d,a)=>{d.forEach((t,o)=>{t.dataset.ttsChunk=String(a),t.dataset.ttsWord=String(o)})}),r}function R(e){e.querySelectorAll(`.${z}`).forEach(r=>r.remove()),e.querySelectorAll(`.${_}`).forEach(r=>{r.replaceWith(document.createTextNode(r.textContent??""))}),e.normalize()}function J(e){let r=[],d=0;for(let a of e)r.push(d),d+=a.length+1;return r}function Z(e,r){let d=0,a=e.length-1,t=0;for(;d<=a;){let o=d+a>>1;e[o]<=r?(t=o,d=o+1):a=o-1}return t}var he=60,Ee=120;function ee(e,r){let d=he/(r>0?r:1);return e.map(a=>Math.max(Ee,a.length*d))}var B="quartz-tts:voice",te="tts-word-active",ve=350;function Se(){try{return window.localStorage.getItem(B)??void 0}catch{return}}function ge(e){try{e?window.localStorage.setItem(B,e):window.localStorage.removeItem(B)}catch{}}function ne(){let e=document.querySelector(".tts");if(!e)return;let r=e.querySelector(".tts-toggle"),d=e.querySelector(".tts-stop");if(!r||!d)return;if(!("speechSynthesis"in window)){e.dataset.ttsSupported="false";return}e.dataset.ttsSupported="true";let a=e.querySelector(".tts-voice"),t=e.querySelector(".tts-voice-menu"),o="idle",u=0,f=[],S=0,g,b,x=[],v,w=[],y=Se();function H(){let n=window.speechSynthesis.getVoices();n.length>0&&(w=n)}H(),window.speechSynthesis.addEventListener("voiceschanged",H);let ie=/espeak|pico|festival/i;function D(n){let i=(n??"").toLowerCase();if(!i)return w;let s=i.split("-")[0],c=w.filter(l=>{let p=l.lang.toLowerCase();return p===i||p===s||p.startsWith(`${s}-`)});return c.length>0?c:w}function se(n){if(w.length===0)return;if(y){let s=w.find(c=>c.voiceURI===y);if(s)return s}function i(s){let c=0;return s.localService||(c+=2),ie.test(s.name)||(c+=1),s.default&&(c+=1),c}return[...D(n)].sort((s,c)=>i(c)-i(s))[0]}let C={play:r.dataset.labelPlay??r.getAttribute("aria-label")??"Play",pause:r.dataset.labelPause??"Pause",resume:r.dataset.labelResume??"Resume",automaticVoice:t?.dataset.automaticLabel??"Automatic"};function L(){e.dataset.ttsState=o,r.setAttribute("aria-pressed",o==="idle"?"false":"true"),r.setAttribute("aria-label",o==="playing"?C.pause:o==="paused"?C.resume:C.play)}function W(n){b!==n&&(b?.classList.remove(te),b=n,b?.classList.add(te))}function T(){x.forEach(clearTimeout),x=[]}function q(n,i,s){let c=n.words.map(h=>h.textContent??""),l=ee(c,i),p=0;n.words.forEach((h,V)=>{let M=setTimeout(()=>{s===u&&v===!1&&W(h)},p);x.push(M),p+=l[V]??0})}function I(){g&&(g.removeEventListener("click",$),R(g)),g=void 0,f=[],W(void 0)}function P(){window.speechSynthesis.cancel(),T(),o="idle",S=0,I(),L()}function A(n,i){let s=[],c=f[n];if(c){let l=c.slice(i);l.length>0&&s.push({chunkIndex:n,words:l})}for(let l=n+1;l<f.length;l++)s.push({chunkIndex:l,words:f[l]});return s}function N(n){window.speechSynthesis.cancel(),T();let i=++u,s=Number(e.dataset.ttsRate??"1")||1,c=Number(e.dataset.ttsPitch??"1")||1,l=document.documentElement.lang||void 0,p=se(l);n.forEach((h,V)=>{let M=h.words.map(m=>m.textContent??""),ue=J(M),E=new SpeechSynthesisUtterance(M.join(" "));if(E.rate=s,E.pitch=c,l&&(E.lang=l),p&&(E.voice=p),E.addEventListener("start",()=>{if(i===u){if(S=h.chunkIndex,v===!1)q(h,s,i);else if(v===void 0){let m=setTimeout(()=>{i===u&&v===void 0&&(v=!1,q(h,s,i))},ve);x.push(m)}}}),E.addEventListener("boundary",m=>{i===u&&(m.name&&m.name!=="word"||(v!==!0&&(v=!0,T()),W(h.words[Z(ue,m.charIndex)])))}),V===n.length-1){let m=()=>{i===u&&o!=="paused"&&(o="idle",S=0,T(),I(),L())};E.addEventListener("end",m),E.addEventListener("error",m)}window.speechSynthesis.speak(E)}),o="playing",L()}let $=n=>{if(o==="idle")return;let i=n.target.closest?.(".tts-word");if(!i)return;let s=Number(i.dataset.ttsChunk),c=Number(i.dataset.ttsWord);Number.isNaN(s)||Number.isNaN(c)||N(A(s,c))};function ce(){let n=document.querySelector(".center > article")??document.querySelector("article");n&&(f=X(n),f.length!==0&&(g=n,g.addEventListener("click",$),v=void 0,S=0,N(A(0,0))))}function ae(){if(!t)return;let n=document.documentElement.lang||void 0;t.textContent="";let i=document.createElement("button");i.type="button",i.className="tts-voice-option",i.setAttribute("role","option"),i.setAttribute("aria-selected",y?"false":"true"),i.textContent=C.automaticVoice,i.addEventListener("click",()=>F(void 0)),t.appendChild(i),D(n).forEach(s=>{let c=document.createElement("button");c.type="button",c.className="tts-voice-option",c.setAttribute("role","option"),c.setAttribute("aria-selected",s.voiceURI===y?"true":"false"),c.textContent=`${s.name} (${s.lang})`,c.addEventListener("click",()=>F(s.voiceURI)),t.appendChild(c)})}function F(n){y=n,ge(n),k(),o!=="idle"&&N(A(S,0))}let O=n=>{let i=n.target;!e.contains(i)&&!t?.contains(i)&&k()};function de(){if(!t||!a)return;ae(),document.body.appendChild(t);let n=a.getBoundingClientRect();t.style.position="fixed",t.style.top=`${n.bottom+4}px`,t.style.left=`${n.left}px`,t.hidden=!1,a.setAttribute("aria-expanded","true"),document.addEventListener("click",O,{capture:!0})}function k(){!t||!a||(t.hidden=!0,a.setAttribute("aria-expanded","false"),e.appendChild(t),document.removeEventListener("click",O,{capture:!0}))}let K=()=>{t&&(t.hidden?de():k())},U=()=>{o==="idle"?ce():o==="playing"?(window.speechSynthesis.cancel(),T(),o="paused",L()):N(A(S,0))},j=()=>P(),G=n=>{if(n.key==="Escape"){if(t&&!t.hidden){k();return}o!=="idle"&&P()}};return r.addEventListener("click",U),d.addEventListener("click",j),a?.addEventListener("click",K),document.addEventListener("keydown",G),o="idle",L(),()=>{r.removeEventListener("click",U),d.removeEventListener("click",j),a?.removeEventListener("click",K),document.removeEventListener("keydown",G),document.removeEventListener("click",O,{capture:!0}),window.speechSynthesis.removeEventListener("voiceschanged",H),T(),I(),t?.remove()}}function oe(){"speechSynthesis"in window&&window.speechSynthesis.cancel()}function re(){let e=ne();e&&window.addCleanup(e)}document.addEventListener("nav",re);document.addEventListener("render",re);document.addEventListener("prenav",oe);\n';
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
        /* @__PURE__ */ u2(
          "button",
          {
            class: "tts-voice",
            type: "button",
            "aria-haspopup": "listbox",
            "aria-expanded": "false",
            "aria-label": t2.voice,
            children: /* @__PURE__ */ u2("svg", { viewBox: "0 0 24 24", "aria-hidden": "true", children: /* @__PURE__ */ u2("path", { d: "M12 14a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-3.08A7 7 0 0 0 19 11z" }) })
          }
        ),
        /* @__PURE__ */ u2(
          "div",
          {
            class: "tts-voice-menu",
            role: "listbox",
            "aria-label": t2.voice,
            "data-automatic-label": t2.automaticVoice,
            hidden: true
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