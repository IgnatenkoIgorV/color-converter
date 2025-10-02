class ColorConverter {
    constructor() {
        this.warningShown = false;
        this.initializing = false;
        this.initializeEventListeners();
        this.updateColorDisplay();
    }

    initializeEventListeners() {
        // RGB inputs
        ['rgbR', 'rgbG', 'rgbB'].forEach(id => {
            document.getElementById(id).addEventListener('input', (e) => this.fromRGB());
            document.getElementById(id + 'Range').addEventListener('input', (e) => {
                document.getElementById(id).value = e.target.value;
                this.fromRGB();
            });
        });

        // CMYK inputs
        ['cmykC', 'cmykM', 'cmykY', 'cmykK'].forEach(id => {
            document.getElementById(id).addEventListener('input', (e) => this.fromCMYK());
            document.getElementById(id + 'Range').addEventListener('input', (e) => {
                document.getElementById(id).value = e.target.value;
                this.fromCMYK();
            });
        });

        // HSV inputs
        ['hsvH', 'hsvS', 'hsvV'].forEach(id => {
            document.getElementById(id).addEventListener('input', (e) => this.fromHSV());
            document.getElementById(id + 'Range').addEventListener('input', (e) => {
                document.getElementById(id).value = e.target.value;
                this.fromHSV();
            });
        });

        // Color picker
        document.getElementById('applyColorPicker').addEventListener('click', () => this.fromColorPicker());
        
        // Action buttons
        document.getElementById('resetBtn').addEventListener('click', () => this.reset());
        document.getElementById('randomBtn').addEventListener('click', () => this.randomColor());
    }

    showWarning() {
        if (!this.warningShown) {
            const warning = document.getElementById('warningMessage');
            warning.style.display = 'block';
            this.warningShown = true;
            
            setTimeout(() => {
                warning.style.display = 'none';
                this.warningShown = false;
            }, 3000);
        }
    }

    // RGB to other models
    fromRGB() {
        if (this.initializing) return;
        
        const r = this.clampRGB(parseInt(document.getElementById('rgbR').value) || 0);
        const g = this.clampRGB(parseInt(document.getElementById('rgbG').value) || 0);
        const b = this.clampRGB(parseInt(document.getElementById('rgbB').value) || 0);

        this.updateSliders('rgb', { r, g, b });
        
        const cmyk = this.rgbToCmyk(r, g, b);
        const hsv = this.rgbToHsv(r, g, b);
        
        this.updateCMYK(cmyk);
        this.updateHSV(hsv);
        this.updateColorDisplay(r, g, b);
    }

    // CMYK to other models
    fromCMYK() {
        if (this.initializing) return;
        
        const c = this.clampPercentage(parseFloat(document.getElementById('cmykC').value) || 0);
        const m = this.clampPercentage(parseFloat(document.getElementById('cmykM').value) || 0);
        const y = this.clampPercentage(parseFloat(document.getElementById('cmykY').value) || 0);
        const k = this.clampPercentage(parseFloat(document.getElementById('cmykK').value) || 0);

        this.updateSliders('cmyk', { c, m, y, k });
        
        const rgb = this.cmykToRgb(c, m, y, k);
        const hsv = this.rgbToHsv(rgb.r, rgb.g, rgb.b);
        
        this.updateRGB(rgb);
        this.updateHSV(hsv);
        this.updateColorDisplay(rgb.r, rgb.g, rgb.b);
    }

    // HSV to other models
    fromHSV() {
        if (this.initializing) return;
        
        const h = this.clampHue(parseFloat(document.getElementById('hsvH').value) || 0);
        const s = this.clampPercentage(parseFloat(document.getElementById('hsvS').value) || 0);
        const v = this.clampPercentage(parseFloat(document.getElementById('hsvV').value) || 0);

        this.updateSliders('hsv', { h, s, v });
        
        const rgb = this.hsvToRgb(h, s, v);
        const cmyk = this.rgbToCmyk(rgb.r, rgb.g, rgb.b);
        
        this.updateRGB(rgb);
        this.updateCMYK(cmyk);
        this.updateColorDisplay(rgb.r, rgb.g, rgb.b);
    }

    // Color picker
    fromColorPicker() {
        const colorPicker = document.getElementById('colorPicker');
        const hex = colorPicker.value;
        
        const r = parseInt(hex.substr(1, 2), 16);
        const g = parseInt(hex.substr(3, 2), 16);
        const b = parseInt(hex.substr(5, 2), 16);
        
        this.setRGB(r, g, b);
    }

    // Conversion functions
    rgbToCmyk(r, g, b) {
        r = r / 255;
        g = g / 255;
        b = b / 255;
        
        const k = 1 - Math.max(r, g, b);
        
        if (k === 1) {
            return { c: 0, m: 0, y: 0, k: 100 };
        }
        
        const c = (1 - r - k) / (1 - k);
        const m = (1 - g - k) / (1 - k);
        const y = (1 - b - k) / (1 - k);
        
        return {
            c: Math.round(c * 1000) / 10,
            m: Math.round(m * 1000) / 10,
            y: Math.round(y * 1000) / 10,
            k: Math.round(k * 1000) / 10
        };
    }

    cmykToRgb(c, m, y, k) {
        c = c / 100;
        m = m / 100;
        y = y / 100;
        k = k / 100;
        
        const r = 255 * (1 - c) * (1 - k);
        const g = 255 * (1 - m) * (1 - k);
        const b = 255 * (1 - y) * (1 - k);
        
        return {
            r: Math.round(this.clampRGB(r)),
            g: Math.round(this.clampRGB(g)),
            b: Math.round(this.clampRGB(b))
        };
    }

    rgbToHsv(r, g, b) {
        r = r / 255;
        g = g / 255;
        b = b / 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const delta = max - min;
        
        let h = 0;
        let s = 0;
        let v = max;
        
        if (delta !== 0) {
            s = delta / max;
            
            if (max === r) {
                h = (g - b) / delta + (g < b ? 6 : 0);
            } else if (max === g) {
                h = (b - r) / delta + 2;
            } else {
                h = (r - g) / delta + 4;
            }
            
            h /= 6;
        }
        
        return {
            h: Math.round(h * 3600) / 10,
            s: Math.round(s * 1000) / 10,
            v: Math.round(v * 1000) / 10
        };
    }

    hsvToRgb(h, s, v) {
        h = h / 360;
        s = s / 100;
        v = v / 100;
        
        let r, g, b;
        
        const i = Math.floor(h * 6);
        const f = h * 6 - i;
        const p = v * (1 - s);
        const q = v * (1 - f * s);
        const t = v * (1 - (1 - f) * s);
        
        switch (i % 6) {
            case 0: r = v; g = t; b = p; break;
            case 1: r = q; g = v; b = p; break;
            case 2: r = p; g = v; b = t; break;
            case 3: r = p; g = q; b = v; break;
            case 4: r = t; g = p; b = v; break;
            case 5: r = v; g = p; b = q; break;
        }
        
        return {
            r: Math.round(this.clampRGB(r * 255)),
            g: Math.round(this.clampRGB(g * 255)),
            b: Math.round(this.clampRGB(b * 255))
        };
    }

    // Update functions
    updateRGB(rgb) {
        this.initializing = true;
        
        document.getElementById('rgbR').value = rgb.r;
        document.getElementById('rgbG').value = rgb.g;
        document.getElementById('rgbB').value = rgb.b;
        
        this.updateSliders('rgb', rgb);
        
        this.initializing = false;
    }

    updateCMYK(cmyk) {
        this.initializing = true;
        
        document.getElementById('cmykC').value = cmyk.c;
        document.getElementById('cmykM').value = cmyk.m;
        document.getElementById('cmykY').value = cmyk.y;
        document.getElementById('cmykK').value = cmyk.k;
        
        this.updateSliders('cmyk', cmyk);
        
        this.initializing = false;
    }

    updateHSV(hsv) {
        this.initializing = true;
        
        document.getElementById('hsvH').value = hsv.h;
        document.getElementById('hsvS').value = hsv.s;
        document.getElementById('hsvV').value = hsv.v;
        
        this.updateSliders('hsv', hsv);
        
        this.initializing = false;
    }

    updateSliders(model, values) {
        for (const [key, value] of Object.entries(values)) {
            const slider = document.getElementById(`${model}${key.toUpperCase()}Range`);
            if (slider) {
                slider.value = value;
            }
        }
    }

    updateColorDisplay(r = 0, g = 0, b = 0) {
        const display = document.getElementById('colorDisplay');
        const hexValue = document.getElementById('hexValue');
        
        const hex = this.rgbToHex(r, g, b);
        
        display.style.backgroundColor = hex;
        hexValue.textContent = hex;
        
        // Update color picker
        document.getElementById('colorPicker').value = hex;
        
        // Update text color for better contrast
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        hexValue.style.color = brightness > 128 ? '#000000' : '#ffffff';
    }

    // Utility functions
    clampRGB(value) {
        const clamped = Math.max(0, Math.min(255, value));
        if (clamped !== value) {
            this.showWarning();
        }
        return clamped;
    }

    clampPercentage(value) {
        const clamped = Math.max(0, Math.min(100, value));
        if (clamped !== value) {
            this.showWarning();
        }
        return clamped;
    }

    clampHue(value) {
        const clamped = Math.max(0, Math.min(360, value));
        if (clamped !== value) {
            this.showWarning();
        }
        return clamped;
    }

    rgbToHex(r, g, b) {
        return '#' + [r, g, b].map(x => {
            const hex = Math.round(x).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    }

    setRGB(r, g, b) {
        this.initializing = true;
        
        document.getElementById('rgbR').value = r;
        document.getElementById('rgbG').value = g;
        document.getElementById('rgbB').value = b;
        
        this.updateSliders('rgb', { r, g, b });
        
        const cmyk = this.rgbToCmyk(r, g, b);
        const hsv = this.rgbToHsv(r, g, b);
        
        this.updateCMYK(cmyk);
        this.updateHSV(hsv);
        this.updateColorDisplay(r, g, b);
        
        this.initializing = false;
    }

    reset() {
        this.setRGB(0, 0, 0);
    }

    randomColor() {
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        this.setRGB(r, g, b);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ColorConverter();
});