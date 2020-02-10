var canvas, w = 0, h = 0, em, div, rect, t0;

window.onload = function () {
  div = document.createElement('div');
  canvas = document.createElement('canvas');
  if (!canvas.getContext) return;
  em = parseFloat(getComputedStyle(document.body).fontSize);

  canvas.width = 0;
  canvas.height = 0;
  canvas.style.cssText = 'position: fixed; z-index:-1; top: 0; left: 0;';
  div.style.cssText = 'border-radius: 2rem; padding: 1.5rem; height: 1rem; width: 10rem; background-color: #fffe; font-size:1.2rem; display: inline-block; position:absolute;top:30vh;left:30vw; box-shadow: 0 0 1rem black;';
  document.body.style.cssText= 'padding: 0; margin: 0; background: white;';
  document.body.appendChild(canvas);
  document.body.appendChild(div);
  
  rect = div.getBoundingClientRect();
  
  window.onresize = redraw;
  redraw();
};


var pts, dist, lst;
function redraw() {
  w = Math.max(w, window.innerWidth);
  h = Math.max(h, window.innerHeight);
  if (w == canvas.width && h == canvas.height)  return;
  canvas.width  = w;
  canvas.height = h;

  // generate points
  const npts = 800;
  const margin = em;
  pts = []; dist = {}; lst = [];
  for (var i = 0; i<npts; ++i)  {
    var pt;
    do { pt = [Math.random() * w, Math.random()*h];
    } while (!(pt[0] < rect.left-margin || pt[1] < rect.top-margin || pt[0] > rect.right+margin || pt[1] > rect.bottom+margin));
    pts.push(pt);
    dist[[i,i]] = Math.hypot(w,h);
    for (var j = 0; j<i; ++j) {
      const d = Math.hypot(pts[i][0]-pts[j][0],pts[i][1]-pts[j][1]);
      dist[[i,j]] = d;
      dist[[j,i]] = d;
    }
    lst.push(i);
  }

  // nearest-neighbor heuristic
  for (var i = 0; i<lst.length-1; ++i)  {
    var dmin, imin;
    for (var j = i+1; j<lst.length; ++j)  {
      const d = dist[[lst[i],lst[j]]];
      if (j == i+1 || d < dmin) {
        dmin = d;
        imin = j;
      }
    }
    const swp = lst[i+1];
    lst[i+1] = lst[imin];
    lst[imin] = swp;
  }
  lst.push(lst[0]);
  lst.reverse();
  
  nChecked = 0;
  t0 = new Date().getTime() / 1000;
  update();
}

var nChecked;
function do2opt(j, len) {
  lst.splice(j, len, ...lst.slice(j, j+len).reverse());
}
function fixOne2opt()  {
  for (var i = nChecked+3; i < lst.length; ++i)  {
    for (var j = i-2; j >= 1; --j)  {
      if (dist[[ lst[j-1],lst[j] ]] + dist[[ lst[i-1],lst[i] ]]
      > dist[[ lst[j-1],lst[i-1] ]] + dist[[ lst[i],lst[j] ]]) {
        do2opt(j, i-j);
        nChecked = j-1;
        return true;
      }
    }
  }
  return false;
}

function update() {
  var ctx = canvas.getContext('2d');
  ctx.lineWidth = 0.1*em;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.clearRect(0, 0, w, h);
  
  ctx.beginPath();
  ctx.strokeStyle = '#048';

  ctx.moveTo(pts[lst[0]][0], pts[lst[0]][1]);
  for (var i=1; i<lst.length; ++i)  {
    ctx.lineTo(pts[lst[i]][0], pts[lst[i]][1]);
  }
  ctx.stroke();
  
  const dt = Math.round(new Date().getTime()/1000 - t0);
  const improved = fixOne2opt();
  div.innerHTML = dt + ' sec' + (improved ? '...' : '- done!');
  
  if (improved)  window.setTimeout(update, 100);
  return;
  
  ctx.strokeStyle = 'red';
  for (const pt of pts) {
    ctx.beginPath();
    ctx.arc(pt[0], pt[1], 0.1*em, 0, 2*Math.PI);
    ctx.stroke();
  }
  
}