const density = 0.002;
const time_step_ms = 100;
const min_dist_em = 0.5;


var canvas, w = 0, h = 0, em, div, rect, t0;

window.onload = function () {
  div = document.createElement('div');
  canvas = document.createElement('canvas');
  em = parseFloat(getComputedStyle(document.body).fontSize);

  canvas.width = 0;
  canvas.height = 0;
  canvas.style.cssText = 'position: fixed; z-index:-1; top: 0; left: 0;';
  div.style.cssText = 'border-radius: 2rem; padding: 1.5rem; height: 1rem; width: 10rem; background-color: #fffe; font-size:1.2rem; display: inline-block; position:absolute;top:30vh;left:30vw; box-shadow: 0 0 0.5rem black; font-family: monospace;';
  document.body.style.cssText= 'padding: 0; margin: 0; background: white;';
  document.body.appendChild(canvas);
  //document.body.appendChild(div);
  
  if (!canvas.getContext) {
    body.innerHTML = 'Browser not supported.';
    return;
  }
  
  window.onresize = redraw;
  redraw();
};


var px, py;
var pts, dist, next, prev;
function connect(i,j) { next[i] = j; prev[j] = i; }
function redraw() {
  // width and height
  w = window.innerWidth;
  h = window.innerHeight;
  canvas.width  = w;
  canvas.height = h;
  //rect = div.getBoundingClientRect();

  // setup...
  const margin = em;
  var i, j;
  
  // generate pts
  const px0 = w/2, py0 = h/2;
  const r0 = Math.min(w,h)/4 - margin;
  
  const npts = 100;
  px = new Array(npts); py = new Array(npts);
  next = new Array(npts); prev = new Array(npts);
  for (i = 0; i<npts; ++i)  {
    const th = 2*Math.PI*i/npts;
    px[i] = px0 + r0*Math.cos(th);
    py[i] = py0 + r0*Math.sin(th);
    next[i] = (i+1) % npts;
    prev[i] = (i+npts-1) % npts;
  }
  
  // ini for and start of heuristics
  t_step = 0.002;
  
  f_att = t_step;
  d_att = Math.hypot(px[1]-px[0],py[1]-py[0]); //
  
  f_rep = f_att*1.5;
  d_rep = d_att*3;
  r_rep = d_rep*2; //
  
  d_add = d_att*1.5;

  d_noise = 0.01*d_att;
  
  rx = new Array(npts); ry = new Array(npts);
  update();
}

var rx, ry;
var f_rep, d_rep, r_rep, f_att, d_att, d_add, r_add, d_noise, d_min = 0.1*em, t_step;
var dx, dy, dist, alldist;

function addPt(i)  {
  const j = next[i];
  const t = 0.5;
  px.push(px[i]+(px[j]-px[i])*t);
  py.push(py[i]+(py[j]-py[i])*t);
  const ni = px.length-1;
  next[i] = ni; next[ni] = j;
  prev[j] = ni; prev[ni] = i;
}

function doStep() {
  const npts = px.length;
  rx.length = npts; ry.length = npts;
  rx.fill(0); ry.fill(0);
  
  d_rep *= 1.0001;
  
  const max_angle = 60;
  const min_curv = Math.cos(max_angle/180*Math.PI);
  
  // metric data
  alldist = new Array(npts);  dist = new Array(npts);
  dx = new Array(npts);  dy = new Array(npts);
  
  var i, j;
  for (i=0; i<npts; ++i)  {
    alldist[i] = new Array(npts);
    alldist[i][i] = 0;
    for (j=0; j<i; ++j)  {
        const d = Math.hypot(px[i]-px[j], py[i]-py[j]);
        alldist[i][j] = d;
        alldist[j][i] = d;
    }
  }
  for (i=0; i<npts; ++i)  {
    const ni = next[i];
    dx[i] = px[ni]-px[i];  dy[i] = py[ni]-py[i];
    dist[i] = alldist[i][ni];
  }
  
  // == forces and growth
  var addPts = [];
  for (i=0; i<npts; ++i)  {
    const ni = next[i], pi = prev[i];
    
    // repulsion
    for (j=0; j<npts; ++j)  {
      const d = alldist[i][j];
      if (i==j || j==ni || j==pi || d > d_rep) continue;
      const dxj = px[j]-px[i],  dyj = py[j]-py[i];
      const f = f_rep*(d - d_rep);
      rx[i] += dxj*f; ry[i] += dyj*f;
    }
    
    // attraction
    const fn = f_att*(dist[i] - d_att);
    rx[i] += dx[i]*fn; ry[i] += dy[i]*fn;
    
    const fp = f_att*(dist[pi] - d_att);
    rx[i] -= dx[pi]*fp; ry[i] -= dy[pi]*fp;
    
    // new points
    const base_p = 10*t_step;
    const curv = -(dx[ni]*dx[pi] + dy[ni]*dy[pi]) / (dist[ni]*dist[pi]);
    if ( (dist[i] > d_add && Math.random() < 0.3*base_p)
      || (dist[i] > d_add/2 && Math.random() < 0.7*base_p*curv)) {
      addPts.push(i);
    }
  }
  
  // add points
  for (const pt of addPts)  addPt(pt);
  
  // apply forces
  for (i=0; i<npts; ++i) {
    if (px[i]+rx[i]<0 || px[i]+rx[i]>w) rx[i] = 0;
    if (py[i]+ry[i]<0 || py[i]+ry[i]>h) ry[i] = 0;
    
    const dr = Math.hypot(rx[i],ry[i]);
    const max_force = 0.2*em;
    const fr = dr > max_force ? max_force/dr : 1;
    px[i] += rx[i]*fr + (Math.random()-0.5) * d_noise;
    py[i] += ry[i]*fr + (Math.random()-0.5) * d_noise;
  }
  
  return true;
}

function update() {
  var ctx = canvas.getContext('2d');
  ctx.lineWidth = 0.1*em;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#048';

  ctx.clearRect(0, 0, w, h);
  
  // lines
  ctx.beginPath();
  var ipt = 0;
  ctx.moveTo(px[ipt], py[ipt]);
  for (var i=0; i < px.length; ++i)  {
    ipt = next[ipt];
    ctx.lineTo(px[ipt], py[ipt]);
  }
  ctx.stroke();
  
  // const dt = Math.round(new Date().getTime()/1000 - t0);
  // const keepGoing = doStep();
  // div.innerHTML = dt + (keepGoing ? '...' :  ', done!');
  
  //noise();

  /*
  // points
  ctx.strokeStyle = 'orange';
  for (const pt of pts) {
    ctx.beginPath();
    ctx.arc(pt[0], pt[1], 0.1*em, 0, 2*Math.PI);
    ctx.stroke();
  }
  */
  
  //if (keepGoing)
  doStep();
  window.setTimeout(update, time_step_ms);
}