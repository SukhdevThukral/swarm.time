const particle_s = 2000;
const accent_color = '#E8FF47'


const palettes = [
    {bg: '#050508', color: '#E8FF47'},
    {bg: '#050508', color: '#FF4757'},
    { bg: '#050508', color: '#FFFFFF' },
    {bg:'#F0EDE6', color: '#0A0A14'},
];

let currentPalette  = 0;
class Particle {
    constructor(w,h){
        this.w = w;
        this.h = h;
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.vx = (Math.random() - 0.5) * 3;
        this.vy = (Math.random() - 0.5) * 3;
        this.tx = this.x;
        this.ty = this.y;

        this.size = Math.random() < 0.7 ? 2.5 : 4;
        this.alpha = Math.random() * 0.4 + 0.6;
    }

    update(scattered, frozen){
        if (frozen){
            return;
        }

        if (scattered) {
            this.vx += (Math.random() -  0.5) *1.2;
            this.vy += (Math.random() -  0.5) *1.2;
            this.vx += 0.97;
            this.vy += 0.97;
        } else{ 
            const dx = this.tx - this.x;
            const dy = this.ty - this.y;

            this.vx += dx * 0.06;
            this.vy += dy*0.06;
            this.vx *= 0.82;
            this.vy*=0.82;
        }
        this.x += this.vx;
        this.y += this.vy;
    }

    draw(ctx){
        const cols = palettes[currentPalette].color;
        ctx.globalAlpha =  this.alpha;
        ctx.fillStyle = cols;

        ctx.fillRect(this.x -  this.size/2, this.y - this.size/2,  this.size, this.size);
    }
}

class ParticleSystem{
    constructor(canvas){
        this.canvas = canvas;
        this.w = canvas.width;
        this.h = canvas.height;
        this.particles = Array.from({length: particle_s}, ()=>  new Particle(this.w, this.h));

        this.scattered = false;
        this.frozen = false;
        
        this.textCanvas = document.createElement('canvas');
        this.textCanvas.width = this.w;
        this.textCanvas.height = this.h;
        this.textCtx = this.textCanvas.getContext('2d');
    
    }

    resize(w,h){
        this.w = w;
        this.h = h;
        this.textCanvas.width = w;
        this.textCanvas.height = h;
        this.particles.forEach(p=>{
            p.w = w;
            p.h = h;
        });
    }

    sampleTargets(timeStr){
        const tc = this.textCtx;
        tc.clearRect(0,0, this.w, this.h);
        tc.fillStyle = '#fff'

        const fontSize = Math.floor(Math.min(this.w / 5.5, this.h * 0.35));
        tc.font = `700 ${fontSize}px 'Space Mono', monospace`;
        tc.textAlign = 'center';
        tc.textBaseline = 'middle';
        tc.fillText(timeStr, this.w/2, this.h/2);

        const data = tc.getImageData(0,0, this.w, this.h).data;
        const points = [];
        const step = 4;

        for (let y=0; y<this.h; y+= step){
            for (let x = 0; x < this.w; x+= step){
                const idx = (y*this.w + x) * 4;
                if (data[idx + 3] > 128) {
                    points.push({x, y});
                }
            }
        }
        return points;
    }

    setTargets(timeStr){
        const points = this.sampleTargets(timeStr);
        if (points.length === 0){
            return;
        }

        for (let i = 0; i < this.particles.length; i++){
            const p = points[i].tx = p.x + (Math.random() - 0.5) * 3;
            this.particles[i].tx = p.x + (Math.random()  - 0.5) * 3;
            this.particles[i].ty = p.x + (Math.random()  - 0.5) * 3;
        }
    }

    scatter(){
        this.scattered = true;
        setTimeout(() => {
            this.scattered = false;
        }, 1800);
    }

    freeze(){
        this.frozen = !this.frozen;
    }

    nextPalette(){
        currentPalette = (currentPalette + 1) % palettes.length;
        return palettes[currentPalette];
    }

    currentBg(){
        return palettes[currentPalette].bg;
    }

    update(){
        for (const p of this.particles){
            p.update(this.scattered ,  this.frozen);
        }
    }

    draw(ctx){
        for (const p of this.particles){
            p.draw(ctx);
        }
        ctx.globalAlpha = 1;
    }
}