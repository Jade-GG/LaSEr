import globals from "./globals.js"
import cube from "./cube.js";
import solver from "./solver.js";

export default {
    scramble: [],
    solutions: [],

    getEOSettings: function() {
        return globals.getSetting('eolr.eostates')
    },

    shuffle: function(a) {
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]]
        }
        return a
    },

    getEOFromName: function(name) {
        switch(name) {
            default:
            case '0-0':     return 0x00000000
            case 'Arrow':   return 0x88088000
            case '1F-1B':   return 0x00080800
            case '4-0':     return 0x88880000
            case '0-2':     return 0x00008800
            case '2LR-2':   return 0x88008800
            case '2FB-0':   return 0x00880000
            case '2BL-2':   return 0x80808800
            case '2BL-0':   return 0x80800000
            case '6-flip':  return 0x88888800
        }
    },

    getRandomEO: function() {
        let eos = this.getEOSettings()
        let total = Object.values(eos).reduce((s, v) => s + v, 0)
        if(total <= 0) {
            return 0x00000000
        }

        // Please forgive me.
        return this.getEOFromName(Object.entries(eos).reduce((s, [eo, amt]) => [...s, ...Array.from({length:amt}, () => eo)], [])[Math.floor(Math.random() * total)])
    },

    getRandomEdges: function() {
        return this.shuffle([1,2,3,4,5,5]).reduce((s, v) => (s << 4) + v) << 8
    },

    getRandomAUF: function() {
        return Math.floor(Math.random() * 4)
    },

    getRandomAMF: function() {
        return this.getRandomAUF() << 4
    },

    getRandomMC: function(state) {
        if(!globals.getSetting('eolr.eomc_scramble')) {
            // only return M0 and M2
            return (Math.floor(Math.random() * 2) * 2) << 4
        }

        let rand = Math.floor(Math.random() * 4)
        if(rand % 2 == 0) {
            return rand << 4
        }

        let mask = 0
        for(let i = 2; i < 8; i++) {
            // Flip non-LR edges
            if(((state >> (i * 4)) & 0x7) > 2) {
                mask |= 0x8 << (i * 4)
            }
        }
        return (rand << 4) | mask
    },

    generateEOLRScramble: async function() {
        // (weighted) random EO with random edge positions and random AUF
        let state = this.getRandomEO() ^ this.getRandomEdges()

        if(globals.getSetting('eolr.random_auf')) {
            state ^= this.getRandomAUF()
        }

        state ^= this.getRandomMC(state)

        let solutions = await solver.solve(state)
        this.scramble = cube.reverseMoves(solutions[0])
        return this.scramble
    },
}