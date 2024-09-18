"use strict";

function svgToDataUrl(el) {
  var t = new XMLSerializer().serializeToString(el);
  t = btoa(t);
  t = `url(data:image/svg+xml;base64,${t})`;
  return t;
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


var dunit = 8, apert = 0.2, wline = 0.85, wouterline = 4*wline;

function makeGrid(w,h,pm=false)  {
  var qvacuum = 0.02, qgrowx = 0.2, qgrowy = 0.2, qpm = 0.04;
  var nsteps = 20;
  
  var arr = [...new Array(w)].map(() => new Array(h).fill(false));
  var box = (x,y) => arr[(x+w)%w][(y+h)%h];
  var r=() => Math.random();
  for (var i=0; i<nsteps; ++i) for (var x=0; x<w; ++x) for (var y=0; y<h; ++y) {
    if (box(x,y)) continue;
    
    if (
      (box(x-1,y) && !box(x+1,y) && !box(x+1,y-1) && !box(x+1,y+1) && (box(x,y-1) || !box(x-1,y-1)) && r()<qgrowx) ||
      (box(x+1,y) && !box(x-1,y) && !box(x-1,y-1) && !box(x-1,y+1) && (box(x,y+1) || !box(x+1,y+1)) && r()<qgrowx) ||
      (box(x,y-1) && !box(x,y+1) && !box(x-1,y+1) && !box(x+1,y+1) && (box(x-1,y) || !box(x-1,y-1)) && r()<qgrowy) ||
      (box(x,y+1) && !box(x,y-1) && !box(x-1,y-1) && !box(x+1,y-1) && (box(x+1,y) || !box(x+1,y+1)) && r()<qgrowy) ||
      (!box(x-1,y) && !box(x+1,y) && !box(x,y-1) && !box(x,y+1) && !box(x-1,y-1) && !box(x+1,y+1) && !box(x+1,y-1) && !box(x-1,y+1) && r()<qvacuum) )
        arr[x][y] = true;
  }
  // ////////////////////// ///////////////////
  function perturbation(amp)  {
    return (2*Math.random()-1)*amp;
  }
  var pert = Array(w).fill().map(
    () => Array(h).fill().map(() => [perturbation(apert),perturbation(apert)] ) );

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
  var am = dunit*.12;
  var rr=()=>2*Math.random()-1.;
  for (var i=0; i<lines.length; i+=2) {
    var rat1 = 1/3 + rr()*0.1,
      rat2 = 2/3 + rr()*0.1;
    var x = lines[i][0]*dunit,
      y=lines[i][1]*dunit,
      dx = (lines[i+1][0]-lines[i][0])*dunit,
      dy = (lines[i+1][1]-lines[i][1])*dunit,
      px = dx*rat1 + rr()*am,
      py = dy*rat1 + rr()*am,
      qx = dx*rat2 + rr()*am,
      qy = dy*rat2 + rr()*am;
      
    var path = `M ${x} ${y} c ${px} ${py}, ${qx} ${qy}, ${dx} ${dy}`;
    result.append(makePath(path));
  }
  // /////////// ////////////////
  if (pm) for (var xx=0;xx<w;++xx) for (var yy=0;yy<h;++yy) {
    if (box(xx,yy) || r()>qpm) continue;
    var dirs=[];
    if (box(xx-1,yy) || box(xx+1,y))  dirs.push(90,270);
    if (box(xx,yy-1) || box(xx,y+1))  dirs.push(0,180);
    var x = (xx+0.5)*dunit, y=(yy+0.5)*dunit, ra=0.3*dunit, ang = 35+rr()*20, dir = dirs[Math.floor(r()*dirs.length)];
    var ang1 = dir+ang, ang2 = dir-ang;
    var path = `M ${x} ${y} l ${ra*Math.cos(ang1*Math.PI/180)} ${ra*Math.sin(ang1*Math.PI/180)} A ${ra} ${ra} ${ang} 1 1 ${x+ra*Math.cos(ang2*Math.PI/180)} ${y+ra*Math.sin(ang2*Math.PI/180)} L ${x} ${y}`;
    result.append(makePath(path));
  }
  
  return result;
}

function makeDiag(rows, cols, bg = "white", fg = "#eee", pm = false) {
  var svg = createSvgEl("svg");
  svg.setAttribute("viewBox", `0 0 ${cols*dunit} ${rows*dunit}`);

  var style = createSvgEl("style");
  style.innerHTML = `path {fill: transparent; stroke-linecap:butt; stroke:${fg}; stroke-width:${wline};} path.outer {stroke:${bg}; stroke-width:${wouterline};}`;
  svg.append(style);

  svg.append(makeGrid(rows,cols,pm));
  return svg;
  
}


// var circ = createSvgEl("circle");
// circ.setAttribute("cx", cols*dunit);
// circ.setAttribute("cy", rows*dunit);
// circ.setAttribute("r", dunit);
// svg.append(circ);

function setDiagAsBg(rows, cols, bg, fg, pm=false) {
  var svg = makeDiag(rows, cols, bg, fg, pm);
  document.body.style.background = `${bg} ${svgToDataUrl(svg)} repeat top left / ${cols*1.6}em`;
}

//document.body.append(svg);