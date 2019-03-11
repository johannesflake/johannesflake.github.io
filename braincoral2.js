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
};

function redraw() {
  w = Math.max(w, window.innerWidth);
  h = Math.max(h, window.innerHeight);
  if (w == canvas.width && h == canvas.height)  return;
  canvas.width  = w;
  canvas.height = h;

  var ctx = canvas.getContext('2d');
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 1.7*em;
  ctx.lineCap = 'round';
  ctx.filter = 'blur(' + (0.1*em) + 'px)';
  
  const u = 3*em,
        v = Math.sqrt(3)/2 * u;
  
  const margin = -0.5*em;
  
  var pts = [], ls = [];
  const nx = Math.ceil((w - 2*margin - u/2) / u) + 1,
        ny = Math.ceil((h - 2*margin) / v) + 1;

  for (var j = 0; j < ny; ++j) {
  for (var i = 0; i < nx; ++i) {
    pts.push( [margin + (i + (j % 2)/2) * u, margin + j*v] );
    const ind = nx*j+i;
    if (i > 0)
      ls.push( [ind-1, ind] );
    if (j > 0)
      ls.push( [ind-nx, ind] );
    if (j > 0 && ((i - Math.pow(-1, j) + 1) % (nx+1)) !== 0)
      ls.push( [ind-nx - Math.pow(-1, j), ind] );
  } }
  
  var counts = new Array(nx*ny);
  counts.fill(0);
  /*for (const l of ls) {
    ++counts[l[0]]; ++counts[l[1]];
  }
  */
  
  for (var i = 0; i < ls.length; ++i) {
    const j = i + Math.floor(Math.random() * (ls.length - i));
    const swp = ls[j];
    ls[j] = ls[i];
    ls[i] = swp;
  }
  
  var counts = new Array(nx*ny);
  counts.fill(0);

  var nls = [];
  for (const l of ls) {
    const c1 = counts[l[0]], c2 = counts[l[1]];
    if (Math.max(c1, c2) <= 1) {
      nls.push(l);
      ++counts[l[0]]; ++counts[l[1]];
    }
  }

  for (var i=0; i<100; ++i)  {
    const j = Math.floor(Math.random() * ls.length);
    if (!(ls[j] in nls))
      nls.push(ls[j]);
  }
  
  const a = 0.2*em;
  for (var i = 0; i < pts.length; ++i) {
    pts[i][0] += (Math.random()-0.5)*2*a;
    pts[i][1] += (Math.random()-0.5)*2*a;
  }

  for (const l of nls)  {
    if (!l.length) continue;
    const p = pts[l[0]], q = pts[l[1]];
    ctx.moveTo(p[0], p[1]);
    ctx.lineTo(q[0], q[1]);
    ctx.stroke();
  }
  
}