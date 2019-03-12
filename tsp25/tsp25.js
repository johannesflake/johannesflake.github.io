var canvas, w = 0, h = 0, em, div, rect, t0;

window.onload = function () {
  div = document.createElement('div');
  canvas = document.createElement('canvas');
  if (!canvas.getContext) return;
  em = parseFloat(getComputedStyle(document.body).fontSize);

  canvas.width = 0;
  canvas.height = 0;
  canvas.style.cssText = 'position: fixed; z-index:-1; top: 0; left: 0;';
  div.style.cssText = 'border-radius: 2rem; padding: 1.5rem; height: 1rem; width: 10rem; background-color: #fffe; font-size:1.2rem; display: inline-block; position:absolute;top:30vh;left:30vw; box-shadow: 0 0 1rem black; font-family: monospace;';
  document.body.style.cssText= 'padding: 0; margin: 0; background: white;';
  document.body.appendChild(canvas);
  document.body.appendChild(div);
  
  rect = div.getBoundingClientRect();
  
  window.onresize = redraw;
  redraw();
};


var pts, dist, next, prev;
function connect(i,j) { next[i] = j; prev[j] = i; }
function redraw() {
  w = Math.max(w, window.innerWidth);
  h = Math.max(h, window.innerHeight);
  if (w == canvas.width && h == canvas.height)  return;
  canvas.width  = w;
  canvas.height = h;

  // generate points
  const npts = Math.round(w*h*0.003);
  const margin = em;
  pts = []; dist = new Array(npts);
  for (var i = 0; i<npts; ++i)  dist[i] = new Array(npts);
  
  var lst = [];
  for (var i = 0; i<npts; ++i)  {
    var pt;
    do { pt = [Math.random() * w, Math.random()*h];
    } while (!(pt[0] < rect.left-margin || pt[1] < rect.top-margin || pt[0] > rect.right+margin || pt[1] > rect.bottom+margin)
      || pt[0] < margin || pt[1] < margin || pt[0] > w-margin || pt[1] > h-margin);
    pts.push(pt);
    dist[i][i] = Math.hypot(w,h);
    for (var j = 0; j<i; ++j) {
      const d = Math.hypot(pts[i][0]-pts[j][0],pts[i][1]-pts[j][1]);
      dist[i][j] = d;
      dist[j][i] = d;
    }
    lst.push(i);
  }

  // nearest-neighbor heuristic
  next = []; prev = [];
  for (var i = 0; i<npts-1; ++i)  {
    var dmin, imin;
    for (var j = i+1; j<npts; ++j)  {
      const d = dist[lst[i]][lst[j]];
      if (j == i+1 || d < dmin) {
        dmin = d;
        imin = j;
      }
    }
    const swp = lst[i+1];
    lst[i+1] = lst[imin];
    lst[imin] = swp;
    
    connect(lst[i], lst[i+1]);
  }
  connect(lst[npts-1], lst[0]);
  
  // setup
  iCurrent = 0;
  t0 = new Date().getTime() / 1000;
  update();
}

var iCurrent;
function do2opt(i,j)  {
  const ni0 = next[i], nj0 = next[j];
  var from = i, to = j, ne = prev[to];
  connect(from, to);
  while (to != ni0) {
    from = to; to = ne; ne = prev[to];
    connect(from, to);
  }
  connect(ni0, nj0)
}
function fixOne25opt()  {
  var ii = iCurrent, jj;
  for (var i = 0; i < pts.length; ++i, ii=next[ii])  {
    const ni = next[ii];
    jj = next[ni];
    
    for (var j = 2; j < pts.length; ++j, jj=next[jj])  {
      const nj = next[jj];
      
      // opt-2
      if (dist[ii][ni]  + dist[jj][nj]
        > dist[ii][jj]  + dist[ni][nj] ) {
        do2opt(ii, jj);
        iCurrent = ii;
        return true;
      }
      
      // node shifts
      const nni = next[ni];
      if (dist[ii][ni]  + dist[jj][nj]  + dist[ni][nni]
        > dist[ii][nni]  + dist[jj][ni]  + dist[ni][nj]  ) {
      
        connect(ii,nni); connect(jj, ni); connect(ni, nj);
        iCurrent = ii;
        return true;
      }
      
      const pj = prev[jj];
      if (dist[ii][ni]  + dist[jj][nj]  + dist[pj][jj]
        > dist[ii][jj]  + dist[jj][ni]  + dist[pj][nj]  ) {
      
        connect(ii,jj); connect(jj, ni); connect(pj, nj);
        iCurrent = ii;
        return true;
      }
    }
  }
  return false;
}


function noise()  {
  const i = Math.floor(Math.random() * pts.length);
  pts[i][0] += (Math.random() - 0.5) * em;
  pts[i][1] += (Math.random() - 0.5) * em;
  for (var j = 0; j < pts.length; ++j)  {
    if (j == i) continue;
    const d = Math.hypot(pts[i][0]-pts[j][0], pts[i][1]-pts[j][1]);
    dist[i][j] = d;
    dist[j][i] = d;
  }
}

function update() {
  var ctx = canvas.getContext('2d');
  ctx.lineWidth = 0.1*em;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.clearRect(0, 0, w, h);
  
  ctx.beginPath();
  ctx.strokeStyle = '#048';

  var ipt = 0;
  ctx.moveTo(pts[ipt][0], pts[ipt][1]);
  for (var i=0; i<pts.length; ++i)  {
    ipt = next[ipt];
    ctx.lineTo(pts[ipt][0], pts[ipt][1]);
  }
  ctx.stroke();
  
  const dt = Math.round(new Date().getTime()/1000 - t0);
  const keep = fixOne25opt();
  div.innerHTML = dt + (keep ? '...' :  ', done!');
  
  //noise();

  /*
  ctx.strokeStyle = 'orange';
  for (const pt of pts) {
    ctx.beginPath();
    ctx.arc(pt[0], pt[1], 0.1*em, 0, 2*Math.PI);
    ctx.stroke();
  }
  */
  
  if (keep)  window.setTimeout(update, 100);
}