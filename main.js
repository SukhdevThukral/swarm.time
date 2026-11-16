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
    const sec = String(now.get)
}