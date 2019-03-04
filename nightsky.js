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
  gradient.addColorStop(0, 'white');
  gradient.addColorStop(0.38, '#eee');
  gradient.addColorStop(1, '#bbb');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);
  
  ctx.fillStyle = "#aaa";
  ct = 0;
}

function pt()  {
    if (ct < w*h*0.001) {
      ++ct;
      
      var ctx = canvas.getContext('2d'),
        x = Math.random() * w,
        y = Math.random() * h,
        r = 0.5 + Math.pow(Math.random(), 5) * 0.15 * em,
        b = 0.5 + 0.25 * Math.random() * r;
      ctx.beginPath();
      ctx.filter = 'blur(' + b + 'px)';
      ctx.arc(x, y, r, 0, 2*Math.PI);
      ctx.fill();
  }
  window.requestAnimationFrame(pt);
}