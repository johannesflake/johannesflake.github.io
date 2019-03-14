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


var px, py, dist, next, prev;
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
  px = []; py = [];
  
  const min_dist = min_dist_em*em;
  dist = new Array(npts);
  for (i = 0; i<npts; ++i)  dist[i] = new Array(npts);
  var lst = [];
  
  for (i = 0; i<npts; ++i)  {
    const x = margin + Math.random() * (w-2*margin),
          y = margin + Math.random() * (h-2*margin);
    
    if ((x > rect.left-margin && y > rect.top-margin
      && x < rect.right+margin && y < rect.bottom+margin)
      )  continue;

    const mpts = px.length;
    for (j = 0; j<mpts; ++j) {
      const d = Math.hypot(x-px[j], y-py[j]);
      if (d < min_dist) break;
      dist[j][mpts] = d;
    }
    if (j<mpts) continue;
    
    px.push(x); py.push(y);
    lst.push(mpts);
  }
  
  // complete distance array
  const mpts = px.length;
  for (i=0; i<mpts; ++i)
    for(j=i+1; j<mpts; ++j)
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
 for (var i = 0; i<px.length; ++i)  {
    for (var j = 0; j<i; ++j) {
      const d = Math.hypot(px[i]-px[j],py[i]-py[j]);
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
  for (var i = 0; i < px.length; ++i, ii=next[ii])  {
    const ni = next[ii];
    jj = ni;
    
    for (var j = 1; j < px.length; ++j, jj=next[jj])  {
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
  const i = Math.floor(Math.random() * px.length);
  px[i] += (Math.random() - 0.5) * em;
  py[i] += (Math.random() - 0.5) * em;
  for (var j = 0; j < px.length; ++j)  {
    if (j == i) continue;
    const d = Math.hypot(px[i]-px[j], py[i]-py[j]);
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
  ctx.moveTo(px[ipt], py[ipt]);
  for (var i=0; i < px.length; ++i)  {
    ipt = next[ipt];
    ctx.lineTo(px[ipt], py[ipt]);
  }
  ctx.stroke();
  
  const dt = Math.round(new Date().getTime()/1000 - t0);
  const keepGoing = fixOne25opt();
  div.innerHTML = dt + (keepGoing ? '...' :  ', done!');
  
  //noise();

  /*
  // points
  ctx.strokeStyle = 'orange';
  for (var i=0; i < px.length; ++i)  {
    ctx.beginPath();
    ctx.arc(px[i], py[i], 0.1*em, 0, 2*Math.PI);
    ctx.stroke();
  }
  */
  
  if (keepGoing)  window.setTimeout(update, time_step_ms);
}