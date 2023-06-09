import globals from './globals.js'
import cube from './cube.js'
import solver from './solver.js'
import scrambler from './scrambler.js'
import dict from './dict.js'

export default {
    lseState: cube.baseState(),
    movesDone: [],
    solved: false,
    solves: [],

    stats: function() {
        let count = this.solves.length;
        let avg = Math.round(this.solves.reduce((s, v) => s + v.solution.length, 0) / count * 100) / 100;
        let scram = Math.round(this.solves.reduce((s, v) => s + v.topsolve.length, 0) / count * 100) / 100;
        let efficiency = Math.round(this.solves.reduce((s, v) => s + v.topsolve.length / v.solution.length, 0) / count * 1000) / 10;

        if(count == 0) {
            return [{ name: 'Solved', value: count, denomination: ' solves' }]
        }
        return [
            { name: 'Solved', value: count, denomination: ' solves' },
            { name: 'Average solve', value: avg, denomination: ' moves' },
            { name: 'Average optimum', value: scram, denomination: ' moves' },
            { name: 'Average efficiency', value: efficiency, denomination: '%' },
        ]
    },

    initialize: function() {
        globals.loadSettings()

        document.addEventListener('DOMContentLoaded', () => {
            this.populateOptions()
            this.renderCube()
            this.renderMovesDone()
            this.renderStats()
        })
        
        document.addEventListener('keypress', (e) => {
            let control = Object.entries(globals.getSetting('cube.controls')).find(([move, button]) => button == e.key)
            if(control) {
                if(['M', 'Mp', 'M2', 'U', 'Up', 'U2'].includes(control[0])) {
                    this.control(control[0].replace('p', '\''))
                } else {
                    switch(control[0]) {
                        case 'Reset':
                            this.reset()
                            break
                        case 'New':
                            this.scramble()
                            break
                        default:
                            break
                    }
                }
            }
        })
    },

    scramble: async function() {
        await scrambler.generateEOLRScramble()
        solver.solutions = scrambler.solutions
        this.solved = false
        this.reset()
    },

    reset: async function() {
        this.lseState = cube.doMoves(cube.baseState(), scrambler.scramble)
        this.movesDone = []
        this.renderCube()
        this.renderSolutions(scrambler.solutions)
        this.renderMovesDone()
    },

    getColors: function() {
        return globals.getSetting('cube.colors')
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
        if(!globals.getSetting('cube.back')) {
            style += '.back { opacity: 0 }'
        }
        if(!globals.getSetting('cube.bottom')) {
            style += '.bottom { opacity: 0 }'
        }
        if(!globals.getSetting('laser.alwaysshow') && !this.solved) {
            style += '.solutions { display: none !important }'
        }
        if(!globals.getSetting('cube.buttons')) {
            style += ' .controls { display: none !important }'
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
        if (globals.getSetting('cube.highlight_ulur') && (piece & 0x7) < 3) {
            let hlcol = cc.U
            if(~piece & 0x8) {
                hlcol = (piece & 0x7) == 1 ? cc.R : cc.L
            }
            return `.${pieceName} { box-shadow:0px 0px 10px ${hlcol}; border:2px solid ${hlcol}; z-index:10; background: ${color} }`
        }
        return `.${pieceName} { background: ${color} }`
    },

    idFrom: function(str) {
        let seed = 0
        let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed
        for(let i = 0, ch; i < str.length; i++) {
            ch = str.charCodeAt(i)
            h1 = Math.imul(h1 ^ ch, 2654435761)
            h2 = Math.imul(h2 ^ ch, 1597334677)
        }
        h1  = Math.imul(h1 ^ (h1 >>> 16), 2246822507)
        h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909)
        h2  = Math.imul(h2 ^ (h2 >>> 16), 2246822507)
        h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909)
        
        return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16)
    },

    clear: function() {
        this.solves = []
        this.movesDone = []
        scrambler.solutions = []
        scrambler.scramble = []
        this.lseState = cube.baseState()
        this.renderStats()
        this.renderMovesDone()
        this.renderSolutions([])
        this.renderCube()
    },

    updateInp: function(config) {
        let input = document.getElementById(this.idFrom(config))
        let val = ''
        if(input.type == 'checkbox') {
            val = input.checked
        } else if(input.type == 'number') {
            val = parseInt(input.value)
        } else {
            val = input.value
        }

        if(val != globals.getSetting(config)) {
            if(config == 'laser.qstm') {
                dict.dict = null
                this.clear()
                globals.currMoveset = globals.getMoveSet(val)
            }

            if(config == 'laser.practice') {
                this.clear()
                globals.setSolvedFunc(val)
            }
        }

        globals.setSetting(config, val)
        globals.saveSettings()
        this.renderCube()
        this.renderSolutions(scrambler.solutions)
    },

    setControl: function(config, event) {
        let input = document.getElementById(this.idFrom(config))
        input.value = event.key
        globals.setSetting(config, event.key)
        globals.saveSettings()
        event.preventDefault()
    },

    populateOptions: function() {
        let options = document.querySelector('#options')
        Object.entries(globals.settings).forEach(([section, settings]) => {
            let wrapper = document.createElement('label')
            wrapper.className = 'h-fit'
            wrapper.setAttribute('for', this.idFrom(section))

            // Add invisible checkbox to click
            let cb = document.createElement('input')
            cb.type = 'checkbox'
            cb.id = this.idFrom(section)
            cb.className = 'hidden peer'
            wrapper.appendChild(cb)

            // Create ul
            let wnd = document.createElement('ul')
            wnd.className = 'peer-checked:max-h-max max-h-8 overflow-hidden bg-gray-800/50 px-2 py-[0.2rem] rounded w-fit min-w-[200px] hover:bg-gray-800 peer-checked:bg-gray-800 transition'

            // Give it a title
            let title = document.createElement('div')
            title.className = 'mb-2 font-bold'
            title.innerText = settings.name
            wnd.appendChild(title)

            // Add individual settings
            Object.entries(settings).forEach(([id, data]) => {
                if(id == 'name') {
                    return
                }
                let opt = document.createElement('li')
                opt.innerHTML = this.settingFrom(`${section}.${id}`, data)
                wnd.appendChild(opt)
            })
            
            // Add section to options
            wrapper.appendChild(wnd)
            options.appendChild(wrapper)
        })
    },

    settingFrom: function(config, data) {
        if(data.options) {
            return this.selectSetting(config, data)
        }

        let id = this.idFrom(config)
        switch(typeof data.value) {
            case 'boolean': return `<label for="${id}" onclick="window.frontend.updateInp('${config}')" class="w-full"><input type="checkbox" id="${id}" ${data.value ? 'checked' : ''}> ${data.name}</label>`

            case 'object': return this.objectSetting(config, data.name, data.value)

            case 'string':
            case 'number':
                let itype = (typeof data.value == 'string') ? 'type="text"' : 'type="number"'
                let event = `oninput="window.frontend.updateInp('${config}')"`
                let classes = ''
                if(config.startsWith('cube.colors')) {
                    itype = 'type="color"'
                    classes = '!p-0 overflow-hidden h-[24px] w-[36px] !bg-transparent'
                }
                if(config.startsWith('cube.controls')) {
                    event = `onKeyDown="window.frontend.setControl('${config}', event)"`
                }
                if(config.startsWith('eolr.eostates')) {
                    itype += ' min="0"'
                }
                return `<div class="flex">${data.name}: <input id="${id}" ${itype} ${event} class="bg-gray-600 w-[80px] rounded px-1 ml-1 mb-1 ${classes}" value="${data.value}"/></div>`

            default: return `<span class="text-11 text-gray-500">${typeof data.value} not supported yet</span>`
        }
    },

    objectSetting: function(config, name, data) {
        let wnd = document.createElement('ul')
        wnd.className = 'px-2 mt-2 relative before:bg-white/10 before:w-1 before:absolute before:left-0 before:inset-y-0'
        let title = document.createElement('div')
        title.className = 'mb-2 font-bold'
        title.innerText = name
        wnd.appendChild(title)

        Object.entries(data).forEach(([id, val]) => {
            let opt = document.createElement('li')
            opt.innerHTML = this.settingFrom(`${config}.${id}`, {
                name: id,
                value: val
            })
            wnd.appendChild(opt)
        })

        return wnd.outerHTML
    },

    selectSetting: function(config, data) {
        let wrapper = document.createElement('div')
        wrapper.className = 'flex items-center gap-2'

        let title = document.createElement('div')
        title.className = 'whitespace-nowrap'
        title.innerText = data.name
        wrapper.appendChild(title)

        let sel = document.createElement('select')
        sel.setAttribute('onchange', `window.frontend.updateInp('${config}')`)
        sel.id = this.idFrom(config)
        sel.value = data.value
        sel.className = 'rounded bg-gray-600 px-2 py-1'

        data.options.forEach((opt, i) => {
            let elm = document.createElement('option')
            elm.innerText = opt
            elm.value = i
            if(i == data.value) {
                elm.setAttribute('selected', 'selected')
            }
            sel.appendChild(elm)
        })

        wrapper.appendChild(sel)
        return wrapper.outerHTML
    },

    renderSolutions: function(solutions) {
        let elm = document.getElementById('solutions')
        elm.innerHTML = ''
        let maxSolutions = globals.getSetting('laser.maxsolutions')
        for(let i = 0; i < solutions.length && i < maxSolutions; i++) {
            let solution = solutions[i];
            elm.innerHTML += `<div class="flex justify-between"><div>${solution.join(' ')}</div><div class="ml-auto">(${solution.length} moves)</div></div>`
        }
        if(solutions.length > maxSolutions) {
            let notshown = solutions.length - maxSolutions;
            elm.innerHTML += `<div class="text-11 text-gray-500">${notshown} solution${notshown != 1 ? 's' : ''} not shown</div>`
        }
    },

    renderMovesDone: function() {
        let elm = document.getElementById('movesdone')
        elm.innerHTML = `<div class="${globals.currSolvedFunc(this.lseState)?'font-bold':''}">${this.movesDone.join(' ')}</div><div class="ml-auto">(${this.movesDone.length} moves)</div>`
    },

    renderCube: function() {
        this.cubeStyle(this.lseState)
    },

    renderStats: function() {
        let stats = this.stats()
        let elm = document.getElementById('stats')
        elm.innerHTML = stats.reduce((s, v) => s + `<div class="flex justify-between"><div>${v.name}:</div><div>${v.value}${v.denomination}</div></div>`, '')
    },

    control: function(move) {
        if(globals.currSolvedFunc(this.lseState)) {
            return
        }

        this.movesDone.push(move)

        this.movesDone = cube.simplifyMoves(this.movesDone)
        this.lseState = cube.doMove(this.lseState, move)

        if(!this.solved && globals.currSolvedFunc(this.lseState)) {
            this.solved = true
            this.solves.push({
                topsolve: cube.reverseMoves(scrambler.solutions[0]),
                solution: this.movesDone,
            })
            this.renderStats()
        }

        this.renderCube()
        this.renderMovesDone()
    }
}