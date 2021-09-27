function hsl(r, g, b) {
  var cmin = Math.min(r, g, b),
      cmax = Math.max(r, g, b),
      delta = cmax - cmin;
  var h = delta === 0 ? 0 :
    cmax == r ? (g-b)/delta :
    cmax == g ? (b-r)/delta + 2 :
    (r-g)/delta + 4;
  h *= 60;
  if (h < 0) h += 360;
  var l = (cmax + cmin) / 2;
  var s = delta / (1 - Math.abs(2*l-1));
  return [h, s, l];
}
function rasterize(char)  {
  var w = 20, h = 20, x = 0, y = 15, font = '15px '+font;
  var canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  var ctx = canvas.getContext('2d');
  ctx.font = font; ctx.fillText(char, x, y);
  //document.body.appendChild(canvas);
  return ctx.getImageData(0, 0, canvas.width, canvas.height).data;
}
var missingCharData = rasterize('\uFFFF');
function isMissingCharData(arr) {
  if (arr.length != missingCharData.length) return false;
  for (var i=0; i<arr.length; ++i)
    if (arr[i] != missingCharData[i]) return false;
  return true;
}
function getColor(char) {
  var data = rasterize(char);
  if (isMissingCharData(data)) {
    console.log("can't render symbol '"+char+"' (\\u"+char.charCodeAt(0).toString(16)+")"); return null;
  }
  var r = 0, g = 0, b = 0, n = 0;
  for (var i=0; i<data.length/4; ++i) {
    var rr = data[i*4], gg = data[i*4+1], bb = data[i*4+2], aa = data[i*4+3];
    if (aa < 10) continue;
    r +=rr/255; g += gg/255; b += bb/255;
    ++n;
  }
  r /= n; g /= n; b /= n;
  return hsl(r, g, b);
}
function shuffle(arr) {
  var n = arr.length;
  for (var i=0; i<n-1; ++i) {
    var j = i + Math.floor(Math.random()*(n-i));
    var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
  }
  return arr;
}
function dataToString(data) {
  return data.map(function(e) { return e[2]; }).join("");
}


var el = document.getElementById("rainbow-symbols");
var str = el.dataset.content;
var timeout = el.dataset.time ? parseInt(el.dataset.time) : 100;
var hueOffset = el.dataset.hueOffset ? parseInt(el.dataset.hueOffset) : 0;
var font = window.getComputedStyle(el).fontFamily;
var sortData = [];
for (var c of str) {
  var res = getColor(c);
  if (res === null) continue;
  res[0] = (res[0] + 360 - hueOffset) % 360;
  sortData.push([res[1] < .2 ? res[2] < .5 ? -1 : 1 : 0, res[1] < .1 ? res[2] : res[0], c]);
}
shuffle(sortData);

var checkedPosition = -1;
function doSymbolsShuffle() {
  el.innerHTML = dataToString(sortData);
  
  var i = Math.floor(Math.random()*(sortData.length-1));
  var x = sortData[i], y = sortData[i+1];
  if (y[0] < x[0] || (y[0] == x[0] && y[1] < x[1])) {
    sortData[i] = y; sortData[i+1] = x;
    checkedPosition = -1;
  }
  else if (i == checkedPosition+1)  {
    ++checkedPosition;
  }
  
  if (checkedPosition < sortData.length-2) window.setTimeout(doSymbolsShuffle, timeout);
}
doSymbolsShuffle();