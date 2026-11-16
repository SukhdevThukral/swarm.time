const canvas = document.getElementById('can');
const ctx = canvas.getContext('2d');
const flash = document.getElementById('flash');


function resize(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    if (swarm) {
        swarm.resize(canvas.width, canvas.height);
    }
}

window.addEventListener('resize',()=>{
    resize();
    swarm.setTargets(lastTime || getTime());
});
resize();

const swarm = new ParticleSystem(canvas);

const voice = new VoiceController((cmd) => {
    triggerFlash();
    if(cmd  === 'scatter'){
        swarm.scatter();
    }
    if (cmd === 'freeze') {
        swarm.freeze();
    }
    if(cmd === 'color'){
        swarm.nextPalette
    }
})
voice.start();

function triggerFlash(){
    flash.classList.add('on');
    setTimeout(()=> flash.classList.remove('on'), 120);
}

function getTime(){
    const now = new Date();

    const hrs = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    const sec = String(now.getSeconds()).padStart(2, '0');

    return `${hrs}:${min}:${sec}`
}

let lastTime = '';
let lastHour = -1;

function checkTime(){
    const now = new Date();
    const timeStr = getTime();

    if (timeStr !== lastTime){
        lastTime = timeStr;
        if (!swarm.scattered){
            swarm.setTargets(timeStr);
        }
    }

    const hrs = now.getHours();
    if (hrs !== lastHour && now.getMinutes() === 0  && now.getSeconds() === 0){
        lastHour = hrs;
        const hr12 = h % 12 || 12;
        const amPM = hrs < 12 ? 'AM' : 'PM';

        voice.speak(`It's ${h12} o'clock ${amPM}`);
    }
}

function loop(){
    const bg = swarm.currentBg();

    ctx.fillStyle = bg;
    ctx.globalAlpha = 0.12;
    ctx.fillRect(0,0,canvas.width, canvas.height);

    ctx.globalAlpha = 1;

    swarm.update();
    swarm.draw(ctx);
    checkTime();

    requestAnimationFrame(loop);
}

swarm.setTargets(getTime());
loop();

window.addEventListener('keydown',(e)=> {
    triggerFlash();
    if (e.key === 's'){
        swarm.scatter();
    }
    if(e.key === 'f'){
        swarm.freeze();
    }
    if (e.key === 'c'){
        swarm.nextPalette();
    }
});
