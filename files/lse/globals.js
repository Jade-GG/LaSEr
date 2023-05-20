import solver from "./solver.js"

export default {
    currSolvedFunc: null,
    solvesToEnd: false,
    currMoveset: ['M', 'M\'', 'M2', 'U', 'U\'', 'U2'],

    settings: {
        laser: {
            name: 'General settings',
            practice: {
                name: 'Practice type',
                value: 0,
                options: [
                    'Full LSE',
                    '4a',
                    'EOLR',
                    'EOLR-b (4a + 4b)',
                    '4c',
                ]
            },
            qstm: {
                name: 'Only use quarter turns',
                value: false,
            },
            alwaysshow: {
                name: 'Always show solution',
                value: false,
            },
            maxsolutions: {
                name: 'Max solutions',
                value: 8,
            },
        },
        cube: {
            name: 'Virtual cube settings',
            colors: {
                name: 'Color scheme',
                value: {
                    U: '#FFFFFF',
                    F: '#00FF00',
                    D: '#FFFF00',
                    B: '#0000FF',
                    L: '#FF9900',
                    R: '#FF0000',
                },
            },
            buttons: {
                name: 'Show button controls',
                value: true
            },
            controls: {
                name: 'Cube controls',
                value: {
                    'Up': '8',
                    'U': '9',
                    'U2': '0',
                    'Mp': '3',
                    'M': '2',
                    'M2': '1',
                    'Reset': 'j',
                    'New': 'Enter',
                },
            },
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
        eolr: {
            name: 'EOLR trainer settings',
            eomc_scramble: {
                name: 'Allow misoriented centers in scrambles',
                value: true,
            },
            eomc_solve: {
                name: 'Allow misoriented centers in solved states',
                value: true,
            },
            random_auf: {
                name: 'Start with random AUF',
                value: true,
            },
            eostates: {
                name: 'Possible EO states',
                value: {
                    '0-0': 1,
                    'Arrow': 8,
                    '1F-1B': 8,
                    '4-0': 1,
                    '0-2': 1,
                    '2LR-2': 2,
                    '2FB-0': 2,
                    '2BL-2': 4,
                    '2BL-0': 4,
                    '6-flip': 1,
                },
            },
        },
    },

    getSetting: function(config) {
        let traverse = this.settings
        let spl = config.split('.')
        for(let i = 0; i < spl.length; i++) {
            let path = spl[i]
            if(!traverse[path]) {
                if(traverse.value) {
                    return traverse.value[path]
                }
                console.error(`Setting ${config} not found!`)
                return null
            }
            traverse = traverse[path]
        }
        
        return traverse.value
    },

    setSetting: function(config, value) {
        let traverse = this.settings
        let spl = config.split('.')
        for(let i = 0; i < spl.length; i++) {
            let path = spl[i]
            if(!traverse[path]) {
                if(traverse.value) {
                    traverse.value[path] = value
                    return
                }
                console.error(`Setting ${config} not found!`)
                return
            }
            traverse = traverse[path]
        }

        traverse.value = value
    },

    saveSettings: function() {
        let accumulated = {}
        Object.entries(this.settings).forEach(([prefix, options]) => {
            Object.entries(options).forEach(([option, data]) => {
                if(option == 'name') {
                    return
                }
                accumulated[`${prefix}.${option}`] = data.value
            })
        })

        localStorage.settings = JSON.stringify(accumulated)
    },

    loadSettings: function() {
        if(localStorage.settings) {
            let localSettings = JSON.parse(localStorage.settings)
            Object.entries(localSettings).forEach(([config, value]) => {
                this.setSetting(config, value)
            })
        }

        this.currMoveset = this.getMoveSet(this.getSetting('laser.qstm'))
        this.setSolvedFunc(this.getSetting('laser.practice'))
    },

    setSolvedFunc: function(id) {
        if(id == 0 || id == 4) {
            this.currSolvedFunc = (state) => solver.fullSolved(state)
            this.solvesToEnd = true
            return
        }
        if(id == 1) {
            this.currSolvedFunc = (state) => solver.badEdgesSolved(state)
            this.solvesToEnd = false
            return
        }
        if(id == 2) {
            this.currSolvedFunc = (state) => solver.EOLRSolved(state)
            this.solvesToEnd = false
            return
        }
        if(id == 3) {
            this.currSolvedFunc = (state) => solver.EOLRBSolved(state)
            this.solvesToEnd = false
            return
        }

        this.currSolvedFunc = (state) => solver.fullSolved(state)
        this.solvesToEnd = true
    },

    getMoveSet: function(qstm) {
        if(qstm) {
            return ['M', 'M\'', 'U', 'U\'']
        } else {
            return ['M', 'M\'', 'M2', 'U', 'U\'', 'U2']
        }
    }
}