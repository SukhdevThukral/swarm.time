const canvas = document.getElementById('can');
const ctx = canvas.getContext('2d');
const flash = document.getElementById('flash');

let swarm = null;

function hardClear(){
    ctx.globalAlpha = 1;
    ctx.fillStyle = swarm?swarm.currentBg(): '#050508';
    ctx.fillRect(0,0, canvas.width, canvas.height);
}

function resize(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    if (swarm) {
        swarm.resize(canvas.width, canvas.height);
    }
    hardClear();
}

window.addEventListener('resize',()=>{
    resize();
    if (swarm){
        swarm.setTargets(lastTime || getTime())
    }
});
resize();

// const voice = new VoiceController((cmd) => {
//     triggerFlash();
//     if(cmd  === 'scatter'){
//         swarm.scatter();
//     }
//     if (cmd === 'freeze') {
//         swarm.freeze();
//     }
//     if(cmd === 'color'){
//         swarm.nextPalette();
//     }
// })
// voice.start();

function triggerFlash(){
    flash.classList.add('on');
    setTimeout(()=> flash.classList.remove('on'), 120);
}

function getTime(){
    const now = new Date();

    const hrs = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    const sec = String(now.getSeconds()).padStart(2, '0');

    return `${hrs}:${min}`
}


function checkTime(){
    const timeStr = getTime();
    if (timeStr !== swarm.lastTimeStr && !swarm.scattered){
        swarm.setTargets(timeStr);
    }
}
function loop(){
    const bg = swarm.currentBg();

    ctx.fillStyle = bg;
    ctx.globalAlpha = 0.25;
    ctx.fillRect(0,0,canvas.width, canvas.height);

    ctx.globalAlpha = 1;

    swarm.update();
    swarm.draw(ctx);
    checkTime();

    requestAnimationFrame(loop);
}

function applyPalette(p){
    document.body.style.background = p.bg;
    const r = document.documentElement.style;
    r.setProperty('--accent', p.color);
    r.setProperty('--dim', `color-mix(in srgb, ${p.color} 30%, transparent)`);
    hardClear();
}

window.addEventListener('keydown',(e)=>{
    triggerFlash();
    const k = e.key.toLowerCase();
    if (k === 's'){
        swarm.scatter();
    }
    if (k === 'f'){
        swarm.freeze();
    }
    if (k === 'c'){
        applyPalette(swarm.nextPalette());
    } 
});

document.fonts.ready.then(async ()=>{
    await document.fonts.load("700 48px 'Space Mono'")
    swarm = new ParticleSystem(canvas);
    hardClear();
    swarm.setTargets(getTime());
    loop();
});
