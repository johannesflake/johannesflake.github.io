if (CSS && CSS.supports && CSS.supports("filter", "blur(2px)")) {

var cssStyles = `
#sky { z-index:-1; position: fixed; top: 0; left: 0;
  width: 100vw; height: 100vw; animation: fadein 5s ease-in;}
#sky > * { position: absolute; color: #000; }
#sky > *::after { content: "*"; }
@keyframes blink { 50% { opacity: .1; } }
@keyframes fadein { 0% { opacity: 0; } }
@media only print  { #sky { display:none; } }
`;

var styles = document.createElement("style");
styles.innerHTML = cssStyles;
document.head.appendChild(styles);
var sky = document.createElement("div");
sky.id = "sky";
document.body.appendChild(sky);

var n = window.innerHeight * window.innerHeight / 3000;
for (var i = 0; i < n; ++i) {
  var r = Math.pow(Math.random(), 2) * 1.5 + 0.5,
    ani = Math.random() > 0.3 ? "" :
      `blink ${Math.random() * 10 + 3}s ease infinite`;
  var el = document.createElement("span");
  el.style.left = `${Math.random() * 100}vw`;
  el.style.top = `${Math.random() * 100}vh`;
  el.style.fontSize = `${r}vmin`;
  el.style.filter = `blur(${r * (Math.random() * 0.15 + 0.05)}vmin)`;
  el.style.animation = ani;
  sky.appendChild(el);
}

} // if CSS.supports