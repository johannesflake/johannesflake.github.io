"use strict";

function svgToDataUrl(el) {
  var t = new XMLSerializer().serializeToString(el);
  t = btoa(t);
  t = `url(data:image/svg+xml;base64,${t})`;
  return t;
}
function pickN(n) {
  return Math.floor(n*Math.random());
}
function pick(arr)  {
  return arr[pickN(arr.length)];
}
function randomArcs(k) {
  var arr = [];
  var randomInsert = (arr, it) => arr.splice(pickN(arr.length), 0, it);
  for (var i=0; i<k; ++i) {
    randomInsert(arr, [i,0]);
    randomInsert(arr, [i,1]);
  }
  return arr;
}
function createSvgEl(tag) {
  return document.createElementNS("http://www.w3.org/2000/svg", tag);
}
function makePath(d, cl="") {
  var el = createSvgEl("path");
  el.setAttribute("d", d);
  if (cl!=="") el.setAttribute("class", cl);
  return el;
}


var dunit = 8;
var ux = 10, uy = 12,
  axpert = 0.2, aypert = 0.1,
  wline = 0.85, wouterline = 4*wline;

function makeGrid(w,h)  {
  var qvacuum = 0.02, qgrowx = 0.25, qgrowy = 0.25;
  var nsteps = 20;
  
  var arr = [...new Array(w)].map(() => new Array(h).fill(false));
  var box = (x,y) => arr[(x+w)%w][(y+h)%h];
  for (var i=0; i<nsteps; ++i) for (var x=0; x<w; ++x) for (var y=0; y<h; ++y) {
    if (box(x,y)) continue;
    var r=Math.random();
    
    if (
      (box(x-1,y) && !box(x+1,y) && !box(x+1,y-1) && !box(x+1,y+1) && (box(x,y-1) || !box(x-1,y-1)) && r<qgrowx) ||
      (box(x+1,y) && !box(x-1,y) && !box(x-1,y-1) && !box(x-1,y+1) && (box(x,y+1) || !box(x+1,y+1)) && r<qgrowx) ||
      (box(x,y-1) && !box(x,y+1) && !box(x-1,y+1) && !box(x+1,y+1) && (box(x-1,y) || !box(x-1,y-1)) && r<qgrowy) ||
      (box(x,y+1) && !box(x,y-1) && !box(x-1,y-1) && !box(x+1,y-1) && (box(x+1,y) || !box(x+1,y+1)) && r<qgrowy) ||
      (!box(x-1,y) && !box(x+1,y) && !box(x,y-1) && !box(x,y+1) && !box(x-1,y-1) && !box(x+1,y+1) && !box(x+1,y-1) && !box(x-1,y+1) && r<qvacuum) )
        arr[x][y] = true;
  }
  // ////////////////////// ///////////////////
  function perturbation(amp)  {
    return (2*Math.random()-1)*amp;
  }
  var pert = Array(w).fill().map(
    () => Array(h).fill().map(() => [perturbation(axpert),perturbation(aypert)] ) );

  // /////////////// //////////////
  var lines = [], toggle=false;
  for (var x=0; x<=w; ++x) { for (var y=0; y<h; ++y)  {
      if ((box(x,y) || box(x-1,y)) == toggle) continue;
      lines.push([x,y]);
      toggle = !toggle;
    }
    if (toggle) {
      lines.push([x,h]);
      toggle = !toggle;
    }
  }
  for (var y=0; y<=h; ++y) { for (var x=0; x<=w; ++x)  {
      if ((box(x,y) || box(x,y-1)) == toggle) continue;
      lines.push([x,y]);
      toggle = !toggle;
    }
    if (toggle) {
      lines.push([w,y]);
      toggle = !toggle;
    }
  }
  
  // /////////// //////////////////
  var result = createSvgEl("g");
  for (var i=0; i<lines.length; i+=2) {
    var x = lines[i][0]*dunit, y=lines[i][1]*dunit,
      dx = (lines[i+1][0]-lines[i][0])*dunit,
      dy=(lines[i+1][1]-lines[i][1])*dunit;
    var path = `M ${x} ${y} c ${0} ${0}, ${0} ${0}, ${dx} ${dy}`;
    result.append(makePath(path));
  }
  return result;
}

function makeDiag(rows, cols, bg = "white", fg = "#eee") {
  var svg = createSvgEl("svg");
  svg.setAttribute("viewBox", `0 0 ${cols*dunit} ${rows*dunit}`);

  var style = createSvgEl("style");
  style.innerHTML = `path {fill: transparent; stroke-linecap:butt; stroke:${fg}; stroke-width:${wline};} path.outer {stroke:${bg}; stroke-width:${wouterline};}`;
  svg.append(style);

  svg.append(makeGrid(rows,cols));
  return svg;
  

  var pert = Array(rows).fill().map(
    () => Array(cols).fill().map(() => perturbation(axpert) ) );

  for (var i=0; i<rows; ++i) {
    var k0 = pick([1,2,3]);
    var arcs0 = randomArcs(k0);
    var offset = pickN(k0-1);
    var ypert0 = [];
    for (var j=-offset; j<cols; ++j) {
      var ks = [1,2,3].filter(k => j>-offset && j+k <= cols-offset);
      var k = (ks.length === 0) ? k0 : pick(ks);
      var arcs = (ks.length === 0) ? arcs0 : randomArcs(k);
      if (offset>0 && j==-offset) arcs0 = arcs;
      
      for(var ia=0; ia<arcs.length; ia+=2) {
        var arc = [arcs[ia], arcs[ia+1]];
        var xpert1 = pert[(i+arc[0][1])%rows][(j+arc[0][0]+cols)%cols],
            xpert2 = pert[(i+arc[1][1])%rows][(j+arc[1][0]+cols)%cols],
            ypert = [perturbation(aypert), perturbation(aypert)];
        if (j==-offset) ypert0[ia] = ypert;
        if (ks.length == 0) ypert = ypert0[ia];
        var px=j+arc[0][0]+xpert1,
            py=i+arc[0][1],
            dx=arc[1][0]-arc[0][0]+xpert2-xpert1,
            dy=arc[1][1]-arc[0][1],
            s=arc[0][1] == 1 ? -1 : 1;
        var path = `M ${ux/2+ux*px} ${uy*py} c 0 ${uy/2*s+uy*ypert[0]}, ${ux*dx} ${uy/2*s+uy*ypert[1]}, ${ux*dx} ${uy*dy}`;
        svg.append(makePath(path, "outer"), makePath(path));
      }
      j += k-1;
    }
  }
  return svg;
}


// var circ = createSvgEl("circle");
// circ.setAttribute("cx", cols*ux);
// circ.setAttribute("cy", rows*uy);
// circ.setAttribute("r", ux);
// svg.append(circ);

function setDiagAsBg(rows, cols, bg, fg) {
  var svg = makeDiag(rows, cols, bg, fg);
  document.body.style.background = `${bg} ${svgToDataUrl(svg)} repeat top left / ${cols*1.6}em`;
}

//document.body.append(svg);