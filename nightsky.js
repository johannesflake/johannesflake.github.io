var canvas, ctx, w = 0, h = 0, em;

window.onload = function () {
  canvas = document.createElement('canvas');
  canvas.style.cssText = 'position: fixed; z-index: -1; top: 0; left: 0;';
  
  if (!canvas.getContext) return;
  ctx = canvas.getContext('2d');
  ctx.fillStyle = '#555';

  em = parseFloat(getComputedStyle(document.body).fontSize);

  window.onresize = redraw;

  redraw();
  document.body.appendChild(canvas);
  window.requestAnimationFrame(pt);
};

var ct = 0, ctGoal = 0;
function redraw() {
  var fExtra = 1.2;
  w = Math.max(w, window.innerWidth);
  h = Math.max(h, window.innerHeight);
  if (w <= canvas.width && h <= canvas.height)  return;
  w = Math.round(fExtra*w);
  h = Math.round(fExtra*h);
  canvas.width  = w;
  canvas.height = h;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  ct = 0;
  ctGoal = w*h*0.001;
}

function pt()  {
  var npts = 3;
  if (ct < ctGoal) {
    ct += npts;
    
    var r = 0.03 * em + Math.pow(Math.random(), 5) * 0.1 * em,
      b = 0.04 * em + 0.5 * Math.random() * r;
  
    ctx.filter = 'blur(' + b + 'px)';
      
    for (var i = 0; i < npts; ++i)  {
      var x = Math.random() * w, y = Math.random() * h;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, 2*Math.PI);
      ctx.fill();
    }
  
    window.requestAnimationFrame(pt);
  }
}