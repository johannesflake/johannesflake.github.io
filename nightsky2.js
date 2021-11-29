if (CSS && CSS.supports && CSS.supports("filter", "blur(2px)")) {

var cssStyles = `
#bg { z-index:-1; position: fixed; top: 0; left: 0;
  width: 100vw; height: 100vw; animation: fadein 5s ease-in;}
#bg > * { position: absolute; color: #000; }
#bg > *::after { content: "*"; }
@keyframes blink { 50% { opacity: .1; } }
@keyframes fadein { 0% { opacity: 0; } }
@media only print  { #bg { display:none; } }
`;

var styles = document.createElement("style");
styles.innerHTML = cssStyles;
document.body.appendChild(styles);
var bg = document.createElement("div");
bg.id = "bg";
document.body.appendChild(bg);

for (var i = 0; i < 200; ++i) {
  var r = Math.pow(Math.random(), 2) * 1.5 + 0.5,
    ani = Math.random() > 0.3 ? "" :
      `blink ${Math.random() * 10 + 3}s ease infinite`;
  var el = document.createElement("span");
  el.style.left = `${Math.random() * 100}vw`;
  el.style.top = `${Math.random() * 100}vh`;
  el.style.fontSize = `${r}vmin`;
  el.style.filter = `blur(${r * (Math.random() * 0.15 + 0.05)}vmin)`;
  el.style.animation = ani;
  bg.appendChild(el);
}

} // if CSS.supports