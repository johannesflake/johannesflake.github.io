var fMyWorker = function()  {

var dim = null;

var w, h, density, min_dist, margin, n_shots;

self.onmessage = function(e)  {
  w = e.data.w;
  h = e.data.h;
  density = e.data.density;
  min_dist = e.data.min_dist;
  margin = e.data.margin;
  n_shots = e.data.n_shots;
  
  setup();
  postMessage({px: px, py: py});
  
  shots = [];
  stamp = 0;
  dstamp = 1;
  shoot({next: next.slice()});
  postMessage({shots: shots.slice()});
  
  var i = 0;
  while( fixOne25opt() )  {
    shoot({next: next.slice()});
  }
  shoot({next: next.slice(), complete: true});
  postMessage({shots: shots.slice()});
}

//////
var shots, dstamp, stamp;
function shoot(d) {
  d.stamp = stamp++;
  if (!d.complete && d.stamp % dstamp !== 0) return;
    
  shots.push(d);
  if (shots.length < 2*n_shots)    return;
  
  dstamp *= 2;
  shots = shots.filter(function(s) {return s.stamp % dstamp === 0;});
}




//////////////////////////////////////////
var px, py, dist, next, prev;
function connect(i,j) { next[i] = j; prev[j] = i; }
function setup() {
  var i, j;
  
  // generate pts
  const npts = Math.round((w-2*margin)*(h-2*margin)*density);
  px = []; py = [];
  
  dist = new Array(npts);
  for (i = 0; i<npts; ++i)  dist[i] = new Array(npts);
  var lst = [];
  
  const f1 = function(x) { return 0.5 + 0.5*Math.sin(2*x*Math.PI); };
  const f2 = function(x) { return 0.5 + 0.5*Math.sin(2*x*Math.PI); };
  
  for (i = 0; i<npts; ++i)  {
    const x = margin + f1(Math.random()) * (w-2*margin),
          y = margin + f2(Math.random()) * (h-2*margin);
    
    /*
    if ((x > rect.left-margin && y > rect.top-margin
      && x < rect.right+margin && y < rect.bottom+margin)
      )  continue;
    */
    
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
  /*
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
  */
  for (i = 0; i<lst.length; ++i)  connect(lst[i], lst[(i+1)%lst.length]);

  // ini for and start of heuristics
  iCurrent = lst[0];
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

} // end tsp25_worker