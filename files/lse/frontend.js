import cube from './cube.js'
import globals from './globals.js'
import solver from './solver.js'

export default {
    lseState: cube.baseState(),
    movesDone: [],
    maxSolutions: 5,

    controls: {
        '8': 'U\'',
        '9': 'U',
        '0': 'U2',
        '3': 'M\'',
        '2': 'M',
        '1': 'M2',
    },

    colors: {
        U: 'white',
        F: 'green',
        D: 'yellow',
        B: 'blue',
        L: 'orange',
        R: 'red',
    },

    settings: {
        back: {
            name: 'Show backside',
            value: false,
        },
        bottom: {
            name: 'Show bottom',
            value: false,
        },
        highlight_ulur: {
            name: 'Highlight UL/UR edges',
            value: false,
        }
    },

    initialize: function() {
        document.addEventListener('DOMContentLoaded', () => {
            this.populateOptions()
            this.render()
        })
        
        document.addEventListener('keypress', (e) => {
            let move = this.controls[e.key]
            if(move) {
                this.control(move)
            }
        })
    },

    getColors: function() {
        return this.colors
    },
    
    cubeStyle: function(cube) {
        let style = this.styleSettings()
    
        style += this.styleOne(cube, 'DB', 0, false)
        style += this.styleOne(cube, 'BD', 0, true)
        style += this.styleOne(cube, 'DF', 1, false)
        style += this.styleOne(cube, 'FD', 1, true)
        style += this.styleOne(cube, 'UF', 2, false)
        style += this.styleOne(cube, 'FU', 2, true)
        style += this.styleOne(cube, 'UB', 3, false)
        style += this.styleOne(cube, 'BU', 3, true)
        style += this.styleOne(cube, 'UR', 4, false)
        style += this.styleOne(cube, 'RU', 4, true)
        style += this.styleOne(cube, 'UL', 5, false)
        style += this.styleOne(cube, 'LU', 5, true)
    
        style += this.styleCenter(cube, 'Um', 0)
        style += this.styleCenter(cube, 'Bm', 1)
        style += this.styleCenter(cube, 'Dm', 2)
        style += this.styleCenter(cube, 'Fm', 3)
    
        style += this.styleCorner(cube, 'Lc', 0)
        style += this.styleCorner(cube, 'Fc', 1)
        style += this.styleCorner(cube, 'Rc', 2)
        style += this.styleCorner(cube, 'Bc', 3)
    
        style += this.styleFace('Ufa', 0)
        style += this.styleFace('Bfa', 1)
        style += this.styleFace('Dfa', 2)
        style += this.styleFace('Ffa', 3)

        style += this.styleFaceLR('Lfa', 0)
        style += this.styleFaceLR('Rfa', 1)
    
        document.querySelector('#stylesheet').innerHTML = style
    },
    
    styleSettings: function() {
        let style = ''
        if(!this.settings.back.value) {
            style += '.back { opacity: 0 }'
        }
        if(!this.settings.bottom.value) {
            style += '.bottom { opacity: 0 }'
        }
        return style
    },
    
    styleFaceLR: function(pieceName, face) {
        let cc = this.getColors()
        let color = [cc.L, cc.R][face]
        return `.${pieceName} { background: ${color} }`
    },
    
    styleFace: function(pieceName, face) {
        let cc = this.getColors()
        let color = [cc.U, cc.B, cc.D, cc.F][face]
        return `.${pieceName} { background: ${color} }`
    },
    
    styleCenter: function(cube, pieceName, mface) {
        let ms = ((cube >>> 4) + mface) & 0x3
        let cc = this.getColors()
        let color = [cc.U, cc.B, cc.D, cc.F][ms]
        return `.${pieceName} { background: ${color} }`
    },
    
    styleCorner: function(cube, pieceName, uface) {
        let us = (cube + uface) & 0x3
        let cc = this.getColors()
        let color = [cc.L, cc.F, cc.R, cc.B][us]
        return `.${pieceName} { background: ${color} }`
    },
    
    styleOne: function(cube, pieceName, place, flip) {
        let piece = (cube >>> (place * 4 + 8)) & 0xF
        if (flip) {
            piece ^= 0x8
        }
        let cc = this.getColors();
        let color = [
            null, cc.U, cc.U, cc.U, cc.U, cc.D, cc.D, null,
            null, cc.L, cc.R, cc.B, cc.F, cc.F, cc.B, null,
        ][piece]
        if (this.settings.highlight_ulur.value && (piece & 0x7) < 3) {
            let hlcol = 'white'
            if(~piece & 0x8) {
                hlcol = (piece & 0x7) == 1 ? 'red' : 'orange'
            }
            return `.${pieceName} { box-shadow:0px 0px 10px ${hlcol}; border:2px solid ${hlcol}; z-index:10; background: ${color} }`
        }
        return `.${pieceName} { background: ${color} }`
    },

    update: function(id) {
        let cb = document.getElementById(id)
        this.settings[id].value = cb.checked
        localStorage.settings = JSON.stringify(this.settings)
        this.render()
    },

    populateOptions: function() {
        let options = document.querySelector('#options')
        Object.entries(this.settings).forEach(([id, entry]) => {
            options.innerHTML += `<label for="${id}" onclick="window.frontend.update('${id}')"><input type="checkbox" id="${id}" ${entry.value ? 'checked' : ''}> ${entry.name}</label>`
        })
    },

    loadSettings: function() {
        if(localStorage.settings) {
            let localSettings = JSON.parse(localStorage.settings)
            Object.entries(localSettings).forEach(([id, entry]) => {
                if(this.settings[id]) {
                    this.settings[id].value = entry.value
                }
            })
        }

        globals.currSolvedFunc = solver.FullSolved
    },

    fillMoves: function(id, moves) {
        document.getElementById(id).innerHTML = moves.reduce((str, move, i) => str + `<div class="move" onclick="window.frontend.clickMove('${id}',${i})">${move}</div>`, '')
    },

    clickMove: function(id, index) {
        if (id == 'moves') {
            this.movesDone.splice(index, 1)
            this.movesDone = cube.reduceMoves(this.movesDone)
            this.fillMoves('moves', this.movesDone)
            this.lseState = cube.doMoves(cube.baseState(), this.movesDone)

            this.render()
        }
    },

    printSolve: async function(state) {
        let solutions = await solver.solve(state);
        let elm = document.getElementById('solutions')
        elm.innerHTML = ''
        for(let i = 0; i < solutions.length; i++) {
            let solution = solutions[i]
            if(solution.length == 0) {
                break
            }
            if(i >= this.maxSolutions) {
                elm.innerHTML += `<span class="text-gray-500">${solutions.length - this.maxSolutions} more solutions not shown</span>`
                break
            }
            elm.innerHTML += `<div class="flex w-full justify-between"><div>${solution.join(' ')}</div><div>(${solution.length} moves)</div></div>`
        }
    },

    render: function() {
        this.cubeStyle(this.lseState)
        this.printSolve(this.lseState)
    },

    control: function(move) {
        this.movesDone.push(move)
        this.movesDone = cube.reduceMoves(this.movesDone)
        this.fillMoves('moves', this.movesDone)
        this.lseState = cube.doMove(this.lseState, move)
        this.render()
    }
}