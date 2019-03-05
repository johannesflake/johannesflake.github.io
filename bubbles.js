var canvas, w = 0, h = 0, em;

window.onload = function () {
  canvas = document.createElement('canvas');
  if (!canvas.getContext) return;
  em = parseFloat(getComputedStyle(document.body).fontSize);

  canvas.width = 0;
  canvas.height = 0;
  canvas.style.position = 'fixed';
  canvas.style.zIndex = -1;
  canvas.style.top = '0';
  canvas.style.left = '0';
  document.body.style.padding = '0';
  document.body.style.margin = '0';
  document.body.appendChild(canvas);
  
  window.onresize = redraw;
  redraw();
  window.requestAnimationFrame(pt);
};

var ct = 0;
function redraw() {
  w = Math.max(w, window.innerWidth);
  h = Math.max(h, window.innerHeight);
  if (w == canvas.width && h == canvas.height)  return;
  canvas.width  = w;
  canvas.height = h;

  var ctx = canvas.getContext("2d");
  var gradient = ctx.createLinearGradient(0, 0, 0, h);
  gradient.addColorStop(0, '#8df');
  gradient.addColorStop(0.7, '#28d');
  gradient.addColorStop(1, '#048');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);
  
  ct = 0;
}

function pt()  {
    if (ct < w*h*0.001) {
      ++ct;
      
      var ctx = canvas.getContext('2d'),
        x = Math.random() * w,
        y = Math.random() * h,
        r = 0.5 + Math.pow(Math.random(), 5) * 0.5 * em,
        b = 0.5 + 0.25 * Math.random() * r;
      ctx.beginPath();
      ctx.filter = 'blur(' + b + 'px)';
      ctx.arc(x, y, r, 0, 2*Math.PI);
      var gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
      gradient.addColorStop(0, "rgba(255,255,255,0.2)");
      gradient.addColorStop(0.9, "rgba(255,255,255,0.1)");
      gradient.addColorStop(1, "rgba(255,255,255,0.7)");
      ctx.fillStyle = gradient;
      ctx.fill();
//      ctx.lineWidth = 0.05*em;
//      ctx.strokeStyle = "rgba(255,255,255,0.8)";
//      ctx.stroke();
  }
  window.requestAnimationFrame(pt);
}