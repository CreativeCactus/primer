
let markers = {}
let PRIMES = []
let ZOOM = 1
let XOFFSET = 0
let YOFFSET = 0

let XSIZE = 10;
let YSIZE = 10;

const BIN_LENGTH = 32

// Bit state ; Marked state
const color = {
    '0;0':'#000000',
    '1;0':'#FFFFFF',
    '0;1':'#00DD00',
    '1;1':'#FF22FF',
    'err':'#FF1111',
    '?:0':'#777777'
}

function renderHUD(e){
    var mousePos = getMousePos(e || lastMouse);
    var cell = {
        x:(mousePos.x+XOFFSET)/(XSIZE*ZOOM),
        y:(mousePos.y+YOFFSET)/(YSIZE*ZOOM)
    }
    var messages = [
        `Mouse: ${mousePos.x},${mousePos.y} `,
        `Cell: ${cell.x.toFixed(0)},${cell.y.toFixed(0)}: ${bin(~~cell.x,~~cell.y)}`,
        `Prime: ${PRIMES[~~cell.x]}`
    ];
    writeHUD(messages, {x:~~cell.x,y:~~cell.y});
}

$(document).ready(function(){
    canvas.addEventListener('mousedown', function(e) {
        var mousePos = getMousePos(e);
        var cell = {
            x:(mousePos.x+XOFFSET)/(XSIZE*ZOOM),
            y:(mousePos.y+YOFFSET)/(YSIZE*ZOOM)
        }

        markToggle(~~cell.x,~~cell.y)
    })
    canvas.addEventListener('mousemove', function(e) {
        renderHUD(e)
      }, false);

    $(canvas).bind('keypress',function(e){
        const key = e.originalEvent.key
        console.log(key)
        // Get primes from the server
        if(key == 'g') {
            reload()
        }
        // Diff one step
        if(key == 'q') {
            let last = 0;
            PRIMES=PRIMES.map(p=>{
                const diff = p-last
                last = p
                return diff
            })
            clear()
            redraw()
        }
        // Undiff one step
        if(key == 'e') {
            let last = 0;
            PRIMES=PRIMES.map((p,i)=>{
                last = p+last
                if(!i) return p;
                return last
            })
            clear()
            redraw()
        }
        // Log the runs
        if(key == 'r'){
            const mapp = new Array(BIN_LENGTH).fill([]).map((v,y)=>{
                return PRIMES
                    .map((p,i)=>bin(i,y))
                    .reduce((t,bit)=>{
                        if(bit==t.state)t.rle[t.rle.length-1]=(t.rle[t.rle.length-1]||0) +1;
                        else {
                            t.rle.push(1);
                            t.state = bit;
                        }
                        return t
                    },{rle:[],state:0})
            })
            .map(obj=>obj.rle)
            console.dir(mapp)
        }
        
        if(key=='ArrowUp' || key=='w'){ YOFFSET-=10; redraw(); }
        if(key=='ArrowDown' || key=='s'){ YOFFSET+=10; redraw(); }
        if(key=='ArrowLeft' || key=='a'){ XOFFSET-=10; redraw(); }
        if(key=='ArrowRight' || key=='d'){ XOFFSET+=10; redraw(); }
        if(key=='W'){ YOFFSET-=50; redraw(); }
        if(key=='S'){ YOFFSET+=50; redraw(); }
        if(key=='A'){ XOFFSET-=50; redraw(); }
        if(key=='D'){ XOFFSET+=50; redraw(); }
    })
  
    //FF doesn't recognize mousewheel as of FF3.x
    $(canvas).bind((/Firefox/i.test(navigator.userAgent)) ? "DOMMouseScroll" : "mousewheel", function(e){
        var evt = window.event || e //equalize event object     
        evt = evt.originalEvent ? evt.originalEvent : evt; //convert to originalEvent if possible               
        var delta = evt.detail ? evt.detail*(-40) : evt.wheelDelta //check for detail first, because it is used by Opera and FF

        if(delta > 0) {
            //scroll up
            ZOOM+=0.1
        } else{
            //scroll down
            ZOOM-=0.1
        }
        clear()
        redraw() // Dowble up on those wonky edges
        redraw()
        console.log(delta)   
    });
    
    resize();
    reload();

})

function reload(cb){
    $.getJSON( "/primes.json", data => {
        PRIMES = data.slice(0,10000).filter(p=>p)
        XSIZE = canvas.width/PRIMES.length
        YSIZE = canvas.height/BIN_LENGTH
        redraw()
        if(cb)cb();
    })
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
                color[b[x][y]+';'+mark(x,y)]||color.err
            )
        }
    }
    renderHUD()
}


function writeHUD(messages,xy) {
    c.clearRect(0, 0, 350, 80);
    c.font = '11pt Calibri';
    c.fillStyle = 'black';
    messages.map((msg,i)=>{
        c.fillText(msg, 10, 15+15*i);
    })

    // Render a magnification
    if(xy){
        cursor = {x:-5, X:5, y:-3, Y:3}
        let cursorSpace = {x:200, y:5, w:200, h:80}

        sq(
            cursorSpace.x-5,
            cursorSpace.y-5,
            cursorSpace.w+10,
            cursorSpace.h+10,
            '#BBBBBB'
        )

        let cursorCell = {
            w:1+cursor.X-cursor.x,
            h:1+cursor.Y-cursor.y
        }
        cursorCell.x = cursorSpace.w/cursorCell.w
        cursorCell.y = cursorSpace.h/cursorCell.h

        for(let x=0; x<cursorCell.w; x++) {
            for(let y=0; y<cursorCell.h; y++) {
                coord = {
                    x:cursor.x+x,
                    y:cursor.y+y,
                }
                sq(
                    cursorSpace.x+cursorCell.x*x,
                    cursorSpace.y+cursorCell.y*y,
                    cursorCell.x,
                    cursorCell.y,
                    color[bin(coord.x+xy.x,coord.y+xy.y)+';'+mark(coord.x+xy.x,coord.y+xy.y)]||'#FF0000'
                )
            }
        }
        // Render a midpoint
        sq(
            cursorSpace.x+cursorCell.x*cursorCell.w/2,
            cursorSpace.y+cursorCell.y*cursorCell.h/2,
            2,
            2,
            '#22EE22'
        )
    }
}
function bin(x,y){
    const primeToBin = (p='?')=>('0'.repeat(BIN_LENGTH)+p.toString(2)).slice(-BIN_LENGTH)

    if(!isNaN(x)) {
        const out = primeToBin(PRIMES[x])
        
        if(!isNaN(y)) {
            if(y<0) return '?'
            return out[y]
        }
        if(x<0)return new Array(BIN_LENGTH).fill('?')
        return out
    }
    const b = PRIMES.map(primeToBin)
    return b
}

function markToggle(x,y){
    markers[x+','+y]=!(markers[x+','+y])
    redraw()
}
function mark(x,y){
    if(x<0 || y<0) return 0
    return markers[x+','+y] || 0
}