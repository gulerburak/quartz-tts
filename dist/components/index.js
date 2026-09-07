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

// src/components/options.ts
var defaultOptions = { rate: 1, pitch: 1 };
var OPTIONS_KEY = /* @__PURE__ */ Symbol.for("quartz-tts:options");
function getOptions() {
  return globalThis[OPTIONS_KEY] ?? defaultOptions;
}

// src/components/styles/textToSpeech.scss
var textToSpeech_default = ".tts {\n  display: inline-flex;\n  align-items: center;\n  gap: 0.25rem;\n  flex-shrink: 0;\n  position: relative;\n}\n.tts[data-tts-supported=false] {\n  display: none;\n}\n\n.tts-toggle,\n.tts-stop {\n  cursor: pointer;\n  padding: 0;\n  position: relative;\n  background: none;\n  border: none;\n  width: 20px;\n  height: 32px;\n  margin: 0;\n  flex-shrink: 0;\n}\n.tts-toggle svg,\n.tts-stop svg {\n  position: absolute;\n  width: 20px;\n  height: 20px;\n  top: calc(50% - 10px);\n  left: 0;\n  fill: var(--darkgray);\n  transition: opacity 0.1s ease;\n}\n.tts-toggle:hover svg,\n.tts-stop:hover svg {\n  fill: var(--dark);\n}\n\n.tts-stop {\n  display: none;\n}\n\n.tts[data-tts-state=playing] .tts-stop,\n.tts[data-tts-state=paused] .tts-stop {\n  display: inline-block;\n}\n\n.tts-icon-pause {\n  display: none;\n}\n\n.tts[data-tts-state=playing] .tts-icon-play {\n  display: none;\n}\n\n.tts[data-tts-state=playing] .tts-icon-pause {\n  display: inline;\n}\n\n.tts-voice {\n  cursor: pointer;\n  padding: 0;\n  position: relative;\n  background: none;\n  border: none;\n  width: 20px;\n  height: 32px;\n  margin: 0;\n  flex-shrink: 0;\n}\n.tts-voice svg {\n  position: absolute;\n  width: 16px;\n  height: 16px;\n  top: calc(50% - 8px);\n  left: 2px;\n  fill: var(--darkgray);\n  transition: fill 0.1s ease;\n}\n.tts-voice:hover svg, .tts-voice[aria-expanded=true] svg {\n  fill: var(--dark);\n}\n\n.tts-voice-menu {\n  position: absolute;\n  top: 100%;\n  left: 0;\n  z-index: 10;\n  margin-top: 0.25rem;\n  min-width: 12rem;\n  max-height: 16rem;\n  overflow-y: auto;\n  background: var(--light);\n  border: 1px solid var(--lightgray);\n  border-radius: 4px;\n  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);\n  padding: 0.25rem;\n}\n.tts-voice-menu[hidden] {\n  display: none;\n}\n\n.tts-voice-option {\n  display: block;\n  width: 100%;\n  text-align: left;\n  padding: 0.35rem 0.5rem;\n  background: none;\n  border: none;\n  border-radius: 3px;\n  font-size: 0.85rem;\n  color: var(--dark);\n  cursor: pointer;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n.tts-voice-option:hover {\n  background: var(--lightgray);\n}\n.tts-voice-option[aria-selected=true] {\n  font-weight: 600;\n  color: var(--secondary);\n}\n\n.tts-word {\n  cursor: pointer;\n}\n\n.tts-word-active {\n  background: var(--textHighlight);\n  border-radius: 2px;\n}";

// src/components/scripts/textToSpeech.inline.ts
var textToSpeech_inline_default = 'var le=new Set(["P","LI","H1","H2","H3","H4","H5","H6","BLOCKQUOTE","TD","TH","FIGCAPTION","DT","DD"]),fe=["pre",".clipboard-button",".katex",".footnote-ref","a[role=\'anchor\']",".mermaid","svg"].join(","),_="tts-word",z="tts-alt-words";function Y(e){return le.has(e.tagName)?!0:Array.from(e.children).some(Y)}function me(e,r){if(!e.data.trim())return;let d=e.data.split(/(\\s+)/),a=document.createDocumentFragment();for(let t of d){if(t==="")continue;if(/^\\s+$/.test(t)){a.appendChild(document.createTextNode(t));continue}let n=document.createElement("span");n.className=_,n.textContent=t,a.appendChild(n),r.push(n)}e.replaceWith(a)}function pe(e,r){let d=e.getAttribute("alt")?.trim();if(!d)return;let a=d.split(/\\s+/).filter(Boolean);if(a.length===0)return;let t=document.createElement("span");t.className=z,t.setAttribute("aria-hidden","true"),t.style.cssText="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;",a.forEach((n,u)=>{u>0&&t.appendChild(document.createTextNode(" "));let f=document.createElement("span");f.className=_,f.textContent=n,t.appendChild(f),r.push(f)}),e.insertAdjacentElement("afterend",t)}function Q(e,r){let d=[],a=()=>{d.length>0&&r.push(d),d=[]};function t(n){if(n.nodeType===Node.TEXT_NODE){me(n,d);return}if(n.nodeType!==Node.ELEMENT_NODE)return;let u=n;if(!u.matches(fe)){if(u.tagName==="IMG"){pe(u,d);return}if(Y(u)){a(),Q(u,r);return}Array.from(u.childNodes).forEach(t)}}Array.from(e.childNodes).forEach(t),a()}function X(e){R(e);let r=[];return Q(e,r),r.forEach((d,a)=>{d.forEach((t,n)=>{t.dataset.ttsChunk=String(a),t.dataset.ttsWord=String(n)})}),r}function R(e){e.querySelectorAll(`.${z}`).forEach(r=>r.remove()),e.querySelectorAll(`.${_}`).forEach(r=>{r.replaceWith(document.createTextNode(r.textContent??""))}),e.normalize()}function J(e){let r=[],d=0;for(let a of e)r.push(d),d+=a.length+1;return r}function Z(e,r){let d=0,a=e.length-1,t=0;for(;d<=a;){let n=d+a>>1;e[n]<=r?(t=n,d=n+1):a=n-1}return t}var he=60,Ee=120;function ee(e,r){let d=he/(r>0?r:1);return e.map(a=>Math.max(Ee,a.length*d))}var D="quartz-tts:voice",te="tts-word-active",Se=350;function ve(){try{return window.localStorage.getItem(D)??void 0}catch{return}}function ge(e){try{e?window.localStorage.setItem(D,e):window.localStorage.removeItem(D)}catch{}}function ne(){let e=document.querySelector(".tts");if(!e)return;let r=e.querySelector(".tts-toggle"),d=e.querySelector(".tts-stop");if(!r||!d)return;if(!("speechSynthesis"in window)){e.dataset.ttsSupported="false";return}e.dataset.ttsSupported="true";let a=e.querySelector(".tts-voice"),t=e.querySelector(".tts-voice-menu"),n="idle",u=0,f=[],v=0,g,b,x=[],S,w=[],L=ve();function H(){let o=window.speechSynthesis.getVoices();o.length>0&&(w=o)}H(),window.speechSynthesis.addEventListener("voiceschanged",H);let ie=/espeak|pico|festival/i;function B(o){let i=(o??"").toLowerCase();if(!i)return w;let s=i.split("-")[0],c=w.filter(l=>{let p=l.lang.toLowerCase();return p===i||p===s||p.startsWith(`${s}-`)});return c.length>0?c:w}function se(o){if(w.length===0)return;if(L){let s=w.find(c=>c.voiceURI===L);if(s)return s}function i(s){let c=0;return s.localService||(c+=2),ie.test(s.name)||(c+=1),s.default&&(c+=1),c}return[...B(o)].sort((s,c)=>i(c)-i(s))[0]}let A={play:r.dataset.labelPlay??r.getAttribute("aria-label")??"Play",pause:r.dataset.labelPause??"Pause",resume:r.dataset.labelResume??"Resume",automaticVoice:t?.dataset.automaticLabel??"Automatic"};function y(){e.dataset.ttsState=n,r.setAttribute("aria-pressed",n==="idle"?"false":"true"),r.setAttribute("aria-label",n==="playing"?A.pause:n==="paused"?A.resume:A.play)}function W(o){b!==o&&(b?.classList.remove(te),b=o,b?.classList.add(te))}function T(){x.forEach(clearTimeout),x=[]}function q(o,i,s){let c=o.words.map(h=>h.textContent??""),l=ee(c,i),p=0;o.words.forEach((h,V)=>{let M=setTimeout(()=>{s===u&&S===!1&&W(h)},p);x.push(M),p+=l[V]??0})}function I(){g&&(g.removeEventListener("click",$),R(g)),g=void 0,f=[],W(void 0)}function P(){window.speechSynthesis.cancel(),T(),n="idle",v=0,I(),y()}function C(o,i){let s=[],c=f[o];if(c){let l=c.slice(i);l.length>0&&s.push({chunkIndex:o,words:l})}for(let l=o+1;l<f.length;l++)s.push({chunkIndex:l,words:f[l]});return s}function N(o){window.speechSynthesis.cancel(),T();let i=++u,s=Number(e.dataset.ttsRate??"1")||1,c=Number(e.dataset.ttsPitch??"1")||1,l=document.documentElement.lang||void 0,p=se(l);o.forEach((h,V)=>{let M=h.words.map(m=>m.textContent??""),ue=J(M),E=new SpeechSynthesisUtterance(M.join(" "));if(E.rate=s,E.pitch=c,l&&(E.lang=l),p&&(E.voice=p),E.addEventListener("start",()=>{if(i===u){if(v=h.chunkIndex,S===!1)q(h,s,i);else if(S===void 0){let m=setTimeout(()=>{i===u&&S===void 0&&(S=!1,q(h,s,i))},Se);x.push(m)}}}),E.addEventListener("boundary",m=>{i===u&&(m.name&&m.name!=="word"||(S!==!0&&(S=!0,T()),W(h.words[Z(ue,m.charIndex)])))}),V===o.length-1){let m=()=>{i===u&&n!=="paused"&&(n="idle",v=0,T(),I(),y())};E.addEventListener("end",m),E.addEventListener("error",m)}window.speechSynthesis.speak(E)}),n="playing",y()}let $=o=>{if(n==="idle")return;let i=o.target.closest?.(".tts-word");if(!i)return;let s=Number(i.dataset.ttsChunk),c=Number(i.dataset.ttsWord);Number.isNaN(s)||Number.isNaN(c)||N(C(s,c))};function ce(){let o=document.querySelector(".center > article")??document.querySelector("article");o&&(f=X(o),f.length!==0&&(g=o,g.addEventListener("click",$),S=void 0,v=0,N(C(0,0))))}function ae(){if(!t)return;let o=document.documentElement.lang||void 0;t.textContent="";let i=document.createElement("button");i.type="button",i.className="tts-voice-option",i.setAttribute("role","option"),i.setAttribute("aria-selected",L?"false":"true"),i.textContent=A.automaticVoice,i.addEventListener("click",()=>F(void 0)),t.appendChild(i),B(o).forEach(s=>{let c=document.createElement("button");c.type="button",c.className="tts-voice-option",c.setAttribute("role","option"),c.setAttribute("aria-selected",s.voiceURI===L?"true":"false"),c.textContent=`${s.name} (${s.lang})`,c.addEventListener("click",()=>F(s.voiceURI)),t.appendChild(c)})}function F(o){L=o,ge(o),k(),n!=="idle"&&N(C(v,0))}let O=o=>{e.contains(o.target)||k()};function de(){!t||!a||(ae(),t.hidden=!1,a.setAttribute("aria-expanded","true"),document.addEventListener("click",O,{capture:!0}))}function k(){!t||!a||(t.hidden=!0,a.setAttribute("aria-expanded","false"),document.removeEventListener("click",O,{capture:!0}))}let K=()=>{t&&(t.hidden?de():k())},U=()=>{n==="idle"?ce():n==="playing"?(window.speechSynthesis.cancel(),T(),n="paused",y()):N(C(v,0))},j=()=>P(),G=o=>{if(o.key==="Escape"){if(t&&!t.hidden){k();return}n!=="idle"&&P()}};return r.addEventListener("click",U),d.addEventListener("click",j),a?.addEventListener("click",K),document.addEventListener("keydown",G),n="idle",y(),()=>{r.removeEventListener("click",U),d.removeEventListener("click",j),a?.removeEventListener("click",K),document.removeEventListener("keydown",G),document.removeEventListener("click",O,{capture:!0}),window.speechSynthesis.removeEventListener("voiceschanged",H),T(),I()}}function oe(){"speechSynthesis"in window&&window.speechSynthesis.cancel()}function re(){let e=ne();e&&window.addCleanup(e)}document.addEventListener("nav",re);document.addEventListener("render",re);document.addEventListener("prenav",oe);\n';
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

export { TextToSpeech_default as TextToSpeech };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map