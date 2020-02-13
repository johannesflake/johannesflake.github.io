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
  document.body.appendChild(div);
  
  if (!canvas.getContext) {
    div.style.fontSize = '0.8rem';
    div.innerHTML = 'Browser not supported.';
    return;
  }
  
  window.onresize = redraw;
  redraw();
};


var pts, dist, next, prev;
function connect(i,j) { next[i] = j; prev[j] = i; }
function redraw() {
  // width and height
  w = window.innerWidth;
  h = window.innerHeight;
  canvas.width  = w;
  canvas.height = h;
  rect = div.getBoundingClientRect();

  // setup...
  const margin = em;
  var i, j;
  
  // generate pts
  const npts = Math.round((w-2*margin)*(h-2*margin)*density);
  pts = [];
  
  const min_dist = min_dist_em*em;
  dist = new Array(npts);
  for (i = 0; i<npts; ++i)  dist[i] = new Array(npts);
  var lst = [];
  
  const letter = location.search.length > 1 ? location.search[1] : null;
  const raster = letter ? textRaster(letter) : null;
  for (i = 0; i < (letter ? 3*npts : npts); ++i)  {
    const pt = [margin + Math.random() * (w-2*margin),
                margin + Math.random() * (h-2*margin)];
    
    if ((pt[0] > rect.left-margin && pt[1] > rect.top-margin
      && pt[0] < rect.right+margin && pt[1] < rect.bottom+margin)
      )  continue;
      
    if (letter) {
      const ipt = [Math.floor(pt[0]*raster.width / w),
                  Math.floor(pt[1]*raster.height / h)];
      if (raster.data[ 4*( ipt[0] + ipt[1] * raster.width ) ] === 0
        && Math.random() < 0.95) continue;
    }

    const mpts = pts.length;
    for (j = 0; j<mpts; ++j) {
      const d = Math.hypot(pt[0]-pts[j][0], pt[1]-pts[j][1]);
      if (d < min_dist) break;
      dist[j][mpts] = d;
    }
    if (j<mpts) continue;
    
    pts.push(pt);
    lst.push(mpts);
  }
  
  // complete distance array
  for (i=0; i<pts.length; ++i)
    for(j=i+1; j<pts.length; ++j)
      dist[j][i] = dist[i][j];
  
  // nearest-neighbor heuristic
  next = []; prev = [];
  var lastPt = lst[0];
  for (i = 0; i<lst.length-1; ++i)  {
    var dmin, imin;
    for (j = i+1; j<lst.length; ++j)  {
      const d = dist[lst[i]][lst[j]];
      if (j == i+1 ||  d < dmin) {
        dmin = d;
        imin = j;
      }
    }

    const swp = lst[i+1];
    lst[i+1] = lst[imin];
    lst[imin] = swp;
    
    connect(lastPt, lst[i+1]);
    lastPt = lst[i+1];
  }
  connect(lastPt, lst[0]);
  
  // ini for and start of heuristics
  iCurrent = lst[0];
  t0 = new Date().getTime() / 1000;
  update();
}

function computeDists() {
 for (var i = 0; i<pts.length; ++i)  {
    for (var j = 0; j<i; ++j) {
      const d = Math.hypot(pts[i][0]-pts[j][0],pts[i][1]-pts[j][1]);
      dist[i][j] = d;
      dist[j][i] = d;
    }
  }
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
  connect(ni0, nj0);
}
function fixOne25opt()  {
  var ii = iCurrent, jj;
  for (var i = 0; i < pts.length; ++i, ii=next[ii])  {
    const ni = next[ii];
    jj = ni;
    
    for (var j = 1; j < pts.length; ++j, jj=next[jj])  {
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
  ctx.strokeStyle = '#048';

  ctx.clearRect(0, 0, w, h);
  
  // lines
  ctx.beginPath();
  var ipt = 0;
  ctx.moveTo(pts[ipt][0], pts[ipt][1]);
  for (var i=0; i < pts.length; ++i)  {
    ipt = next[ipt];
    ctx.lineTo(pts[ipt][0], pts[ipt][1]);
  }
  ctx.stroke();
  
  const dt = Math.round(new Date().getTime()/1000 - t0);
  const keepGoing = fixOne25opt();
  div.innerHTML = dt + (keepGoing ? '...' :  ', done!');
  
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
  
  if (keepGoing)  window.setTimeout(update, time_step_ms);
}

function textRaster(text) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
  
    let fontSize = 56;
    ctx.font = `${fontSize}px monospace`;
  
    const textMetrics = ctx.measureText(text);
    
    let width = textMetrics.width;
    let height = fontSize;

    canvas.width = width;
    canvas.height = height;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    
    ctx.font = `${fontSize}px monospace`;
    ctx.textAlign = "center" ;
    ctx.textBaseline = "middle";
    
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = "white";
    ctx.fillText(text, width / 2, height / 2);
    
    const data = ctx.getImageData(0, 0, width, height);
    return data;
}