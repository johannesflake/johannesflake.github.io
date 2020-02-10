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
  document.body.style.backgroundColor = '#048';
  document.body.appendChild(canvas);
  
  window.onresize = redraw;
  redraw();
  window.requestAnimationFrame(pt);
};

var ct = 0, ctGoal = 0;
function redraw() {
  w = Math.max(w, window.innerWidth);
  h = Math.max(h, window.innerHeight);
  if (w == canvas.width && h == canvas.height)  return;
  canvas.width  = w;
  canvas.height = h;

  /*
  var ctx = canvas.getContext('2d');
  var gradient = ctx.createLinearGradient(0, 0, 0, h);
  gradient.addColorStop(0, '#eee');
  gradient.addColorStop(0.7, '#ddd');
  gradient.addColorStop(1, '#888');
  ctx.fillStyle = gradient;
  //ctx.fillRect(0, 0, w, h);
  */
  
  ct = 0;
  ctGoal = 800000; //w*h*0.001;
}

// p, d
// | t d - p |²
// t² <d, d> - t <d, p> + ...
// t <d, d> = <d, p>
// t = <d, p> / <d, d>

function myclamp(t) { return Math.max(0.0, Math.min(1.0, t)); }
function dot(v, w)  { return v[0]*w[0] + v[1]*w[1]; }
function dist(p, d) {
  var t = myclamp(dot(d, p) / dot(d, d) );
  return Math.hypot(p[0] - d[0] * t, p[1] - d[1] * t);
}
function dLines_(p,q, r,s) {
  var v = [r[0] - p[0], r[1] - p[1]],
    w = [s[0] - p[0], s[1] - p[1]],
    d = [q[0] - p[0], q[1] - p[1]];
  
  return Math.min(dist(v, d), dist(w, d));
}
function dLines(p,q, r,s) {
  return Math.min(dLines_(p,q,r,s), dLines_(r,s,p,q));
}

var r0em = 1;
function intLines(k, l) {
  return dLines(k[0], k[1], l[0], l[1]) <= 2.5*r0em*em;
}

var lines = [];
function pt()  {
    if (true || ct < ctGoal) {
      ++ct;
      
      var ctx = canvas.getContext('2d'), x,y,r,th,dx,dy,l;
      
      var checkInt = function(k) {return intLines(k, this);};
    
      x = Math.random() * w;
      y = Math.random() * h;
      r = 2*em + Math.random() * 5*em;
      th = Math.random() * 2*Math.PI;
      dx = r*Math.cos(th);
      dy = r*Math.sin(th);
      l = [[x,y],[x+dx,y+dy]];
      if ( lines.some(checkInt, l) )  {
        window.requestAnimationFrame(pt); return;
      }
      lines.push(l);
      
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x+dx, y+dy);
      
      ctx.lineCap = 'round';
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2*r0em*em;
      //ctx.filter = 'blur(' + 0.1*em + 'px)';
      ctx.stroke();
      
      var alpha = Math.pow(ct/ctGoal, 0.5);
      //canvas.style.opacity = alpha;
  }
  window.requestAnimationFrame(pt);
}