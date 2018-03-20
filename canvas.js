
var canvas = $('#canvas')[0]
let c = null ; 
let lastMouse = null;

$(document).ready(function(){
	c = canvas.getContext("2d")
    // c.imageSmoothingEnabled= false
    // c.mozImageSmoothingEnabled = false;

    canvas.addEventListener('mousemove', function(e) {
        lastMouse = e
    }, false);

    window.addEventListener("resize", resize);
})

function resize(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function sq(x,y,w,h,color){
	c.fillStyle=color||'#FF5555';
    c.fillRect(x, y, w, h);
}
function clear(){
    c.clearRect(-100, -100, canvas.width+100, canvas.height+100);
}

function getMousePos(e) {
    if(!e)return {x:0, y:0}

    var rect = canvas.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
}
