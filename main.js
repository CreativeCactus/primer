
let PRIMES = []
let ZOOM = 1
let XOFFSET = 0
let YOFFSET = 0

let XSIZE = 10;
let YSIZE = 10;

const BIN_LENGTH = 32
const canvas = $('#canvas')[0]
let c = null ; 

$(document).ready(function(){
	c = canvas.getContext("2d")
    // c.imageSmoothingEnabled= false
    // c.mozImageSmoothingEnabled = false;

    canvas.addEventListener('mousemove', function(e) {
        var mousePos = getMousePos(e);
        var cell = {
            x:(mousePos.x+XOFFSET)/(XSIZE*ZOOM),
            y:(mousePos.y+YOFFSET)/(YSIZE*ZOOM)
        }
        var messages = [
            `Mouse: ${mousePos.x},${mousePos.y} `,
            `Cell: ${cell.x.toFixed(1)},${cell.y.toFixed(1)}: ${bin(~~cell.x,~~cell.y)}`,
            `Prime: ${PRIMES[~~cell.x]}`
        ];
        writeHUD(messages);
      }, false);

    $(canvas).bind('keypress',function(e){
        const key = e.originalEvent.key
        console.log(key)
        if(key == 'g') {
    		$.getJSON( "/primes.json", data => {
                PRIMES = data.slice(0,10000)
                XSIZE = canvas.width/PRIMES.length
                YSIZE = canvas.height/BIN_LENGTH
			    redraw()
            })
        }
        if(key == 'r'){
            const mapp = new Array(BIN_LENGTH).fill([]).map((v,y)=>{
                PRIMES
                    .map((p,i)=>bin(i,y))
                    .reduce((t,bit)=>{
                        if(bit==t.state)t.rle[t.rle.length]=(t.rle[t.rle.length]||0) +1;
                        else {
                            t.rle.push(1);
                            t.state = bit;
                        }
                        return t
                    },{rle:[],state:null})
            })
            console.dir(mapp)
        }
    })
  
    //FF doesn't recognize mousewheel as of FF3.x
    $(canvas).bind((/Firefox/i.test(navigator.userAgent)) ? "DOMMouseScroll" : "mousewheel", function(e){
        var evt = window.event || e //equalize event object     
        evt = evt.originalEvent ? evt.originalEvent : evt; //convert to originalEvent if possible               
        var delta = evt.detail ? evt.detail*(-40) : evt.wheelDelta //check for detail first, because it is used by Opera and FF

        if(delta > 0) {
            //scroll up
        } else{
            //scroll down
        }
        console.log(delta)   
    });

    window.addEventListener("resize", resize);
    resize();



    canvas.onmousedown = clear;
    redraw();

})

function resize(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function redraw(){
    const b = bin()
    for(let x=0; x<b.length; x++){
        for(let y=0; y<b[x].length; y++){
            sq(
                xpos=(XSIZE*x*ZOOM-XOFFSET),
                ypos=(YSIZE*y*ZOOM-YOFFSET),
                XSIZE*ZOOM, 
                YSIZE*ZOOM,
                b[x][y]=='1'?'#FFFFFF':'#000000'
            )
        }
    }
}

function sq(x,y,w,h,color){
	c.fillStyle=color||"#000000";
    c.fillRect(x, y, w, h);
}
function clear(){
    c.clearRect(0, 0, canvas.width, canvas.height);
}

function getMousePos(e) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
}


function writeHUD(messages) {
    c.clearRect(0, 0, 350, 50);
    c.font = '11pt Calibri';
    c.fillStyle = 'black';
    messages.map((msg,i)=>{
        c.fillText(msg, 10, 15+15*i);
    })
}
function bin(x,y){
    const primeToBin = p=>('0'.repeat(BIN_LENGTH)+p.toString(2)).slice(-BIN_LENGTH)

    if(!isNaN(x)) {
        const out = primeToBin(PRIMES[x])
        
        if(!isNaN(y)) {
            return out[y]
        }
        return out
    }
    const b = PRIMES.map(primeToBin)
    return b
}