const particle_s = 2000;
const accent_color = '#E8FF47'


const palettes = [
    {bg: '#050508', color: '#E8FF47'},  
    {bg: '#050508', color: '#FF4757'}, 
    {bg: '#F0EDE6', color: '#0A0A14'},  
    {bg: '#050508', color: '#00F5FF'},  
    {bg: '#050508', color: '#FF6B35'},  
    {bg: '#050508', color: '#B388FF'},  
    {bg: '#050508', color: '#00FF88'}, 
    {bg: '#0F0A1E', color: '#FF2D78'}, // generated the last 4 colors because i ran out of ideas
    {bg: '#0D0D0D', color: '#FFD700'},  
    {bg: '#FFFFFF', color: '#1A1A2E'}, 
    {bg: '#FFF5E6', color: '#FF4500'}, 
    {bg: '#E8F4F8', color: '#0077B6'}, 
    {bg: '#1A0A2E', color: '#E040FB'},  
    {bg: '#0A1628', color: '#4FC3F7'}, 
    {bg: '#1A1A1A', color: '#39FF14'},  
    {bg: '#2D1B00', color: '#FF8C00'}, 
    {bg: '#F5F5F5', color: '#E91E63'}, 
    {bg: '#0D2818', color: '#ADFF2F'},  
];

let currentPalette  = 0;
class Particle {
    constructor(w,h){
        this.w = w;
        this.h = h;
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.vx = (Math.random() - 0.5) * 1;
        this.vy = (Math.random() - 0.5) * 1;
        this.tx = this.x;
        this.ty = this.y;

        this.size = Math.random() * 2+2;
        this.alpha = Math.random() * 0.3 + 0.7;
        this.wobble = Math.random() * Math.PI * 2;
    }

    update(scattered, frozen){
        if (frozen){
            return;
        }

        this.wobble += 0.018;

        if (scattered) {
            this.vx += (Math.random() -  0.5) *1.2;
            this.vy += (Math.random() -  0.5) *1.2;
            this.vx *= 0.96;
            this.vy *= 0.96;
        } else{ 
            const wx = Math.sin(this.wobble) * 1.5;
            const wy = Math.cos(this.wobble * 0.7) * 1.5;
            const dx = (this.tx + wx) - this.x;
            const dy = (this.ty + wy) - this.y;

            this.vx += dx * 0.025;
            this.vy += dy*0.025;
            this.vx *= 0.9;
            this.vy*=0.9;
        }
        this.x += this.vx;
        this.y += this.vy;
    }

    draw(ctx){
        const cols = palettes[currentPalette].color;
        ctx.globalAlpha =  this.alpha;
        ctx.fillStyle = cols;

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
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
        this.lastTimeStr = '';
        
        this.textCanvas = document.createElement('canvas');
        this.textCanvas.width = this.w;
        this.textCanvas.height = this.h;
        this.textCtx = this.textCanvas.getContext('2d', { willReadFrequently: true });
    
    }

    resize(w,h){
        this.w = w;
        this.h = h;
        this.textCanvas.width = w;
        this.textCanvas.height = h;
        this.lastTimeStr = '';
        this.particles.forEach(p=>{
            p.w = w;
            p.h = h;
        });
    }

    getFontSize(){
        const tc = this.textCtx;
        let size = Math.min(this.w,  this.h) * 0.18;
        size = Math.min(size, 160);
        tc.font = `700 ${size}px 'Space Mono', monospace`;
        const testWidth = tc.measureText('00:00').width;
        if (testWidth > this.w * 0.75){
            size *= (this.w * 0.75) / testWidth;
        }
        return size;
    }

    sampleChar(timeStr){
        const tc = this.textCtx;
        const fontSize = this.getFontSize();

        tc.font = `700 ${fontSize}px 'Space Mono', monospace`;
        tc.textBaseline = 'alphabetic';
        tc.textAlign = 'center';

        const centerY = this.h * 0.5;
        const step = 3;

        const charWidths = [];
        let totalWidth = 0;
        for (let i =0; i< timeStr.length; i++){
            const cw = tc.measureText(timeStr[i]).width;
            charWidths.push(cw);
            totalWidth+=cw;
        }

        let offsetX = (this.w - totalWidth) / 2;

        const charPoint = [];

        for (let i = 0; i<timeStr.length; i++){
            const ch = timeStr[i];
            const chWidth = tc.measureText(ch).width;

            tc.clearRect(0, 0, this.w, this.h);
            tc.fillStyle = '#fff';
            tc.textAlign = 'left';
            tc.fillText(ch, offsetX, centerY);

            const data = tc.getImageData(0,0, this.w, this.h).data;
            const pts = [];
            for (let y = 0; y < this.h; y += step){ 
                for (let x = 0; x < this.w; x+= step){
                    const idx = (y * this.w + x) * 4;
                    if (data[idx+3] > 128){
                        pts.push({x,y});
                    }
                }
            }
            charPoint.push(pts);
            offsetX += chWidth;
        }
        return charPoint;
    }

    setTargets(timeStr){
        const charPoint = this.sampleChar(timeStr);
        const nChars = timeStr.length;

        const perChar = Math.floor(particle_s/nChars);

        for (let c = 0; c < nChars; c++){
            if (this.lastTimeStr && timeStr[c] === this.lastTimeStr[c]){
                continue;
            }

            const pts = charPoint[c];
            if (!pts || pts.length === 0){
                continue;
            }

            const start = c * perChar;
            const end = c === nChars - 1? particle_s : start + perChar;
            const count = end -start;

            for (let i = start; i < end; i++){
                const  k = Math.floor(((i-start) / count) * pts.length);
                const pt = pts[k]
                this.particles[i].tx = pt.x + (Math.random() - 0.5) *3;
                this.particles[i].ty = pt.y + (Math.random() - 0.5) *3;
            }
        }
        this.lastTimeStr = timeStr;
    }

    scatter(){
        clearTimeout(this._scatterTimer);
        this.scattered = true;
        this._scatterTimer = setTimeout(() => {
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