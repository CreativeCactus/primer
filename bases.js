
let PRIMES = []
let ZOOM = 1
let XOFFSET = 0
let YOFFSET = 0

let BASE = 2
let BASES = 4
let CELL = 20
let SEPARATOR = 4

function renderHUD(e){
    var mousePos = getMousePos(e || lastMouse);
    var cell = {
        x:(mousePos.x+XOFFSET)/(CELL*ZOOM),
        y:(mousePos.y+YOFFSET)/(CELL*ZOOM)
    }
    var messages = [
        `Mouse: ${mousePos.x},${mousePos.y} `,
        `Configuration: ${BASES} sets of ${BASE} per row`
    ];
    writeHUD(messages, {x:~~cell.x,y:~~cell.y});
}

$(document).ready(function(){
    canvas.addEventListener('mousedown', function(e) {
        var mousePos = getMousePos(e);
        // var cell = {
        //     x:(mousePos.x+XOFFSET)/(XSIZE*ZOOM),
        //     y:(mousePos.y+YOFFSET)/(YSIZE*ZOOM)
        // }
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
        // Control BASE and BASES settings of viewer
        if(key == '{') { // Base down
            if(BASE==1)return
            BASE=PRIMES[PRIMES.indexOf(BASE)-1]
            redraw()
        }
        if(key == '}') { // Base up
            if(BASE>600)return
            BASE=PRIMES[PRIMES.indexOf(BASE)+1]
            redraw()
        }
        if(key == '[') { // Bases down
            if(BASES==1)return
            redraw(BASES--)
        }
        if(key == ']') { // Bases up
            if(BASES>60)return
            redraw(BASES++)
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
        redraw()
        if(cb)cb();
    })
}


function redraw(){
    clear()

    const MAX = PRIMES[PRIMES.length - 1] + 1
    const COL_WIDTH = ( CELL * BASE + SEPARATOR)*ZOOM
    const COL_HEIGHT = (SEPARATOR + CELL) * ~~( MAX / ( BASE * BASES ))*ZOOM

    const XCENTER = ( -COL_WIDTH * BASES + canvas.width ) / 2
    // Clear the plate
    sq(
        XCENTER + -10*ZOOM-XOFFSET,
        -10*ZOOM-YOFFSET,
        20+((BASE * BASES * CELL + BASES * SEPARATOR)* ZOOM), 
        20+COL_HEIGHT,
        '#888888'
    )

    // Draw the columns
    for(let c=0;c<BASES;c++) sq(
        XCENTER + c*COL_WIDTH-XOFFSET,
        0-YOFFSET,
        COL_WIDTH, 
        COL_HEIGHT,
        '#888888'
    )
    
    // Draw the rows
    for(i in PRIMES){
        const p = PRIMES[i]-1
        // y as an index
        y_literal = ~~(p / (BASE * BASES))
        // y as a position
        y = (SEPARATOR + CELL) * y_literal
        // as above
        x_literal = p % (BASE * BASES)
        x = CELL * x_literal + SEPARATOR * ~~(x_literal/BASE)

        sq(
            xpos=(x*ZOOM-XOFFSET) + XCENTER,
            ypos=(y*ZOOM-YOFFSET),
            CELL*ZOOM, 
            CELL*ZOOM,
            
        )
    }
    renderHUD()
}


function writeHUD(messages,xy) {
    c.clearRect(0, 0, 300, 60);
    c.font = '11pt Calibri';
    c.fillStyle = 'black';
    messages.map((msg,i)=>{
        c.fillText(msg, 10, 15+15*i);
    })
}
