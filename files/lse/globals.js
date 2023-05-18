import solver from "./solver.js"

export default {
    currSolvedFunc: null,
    currMoveset: ['M', 'M\'', 'M2', 'U', 'U\'', 'U2'],

    settings: {
        laser: {
            name: 'General settings',
            practice: {
                name: 'Practice type',
                value: 0,
                options: [
                    'Full LSE',
                    'EOLR',
                    '4c',
                ]
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
            controls: {
                name: 'Cube controls',
                value: {
                    'Up': '8',
                    'U': '9',
                    'U2': '0',
                    'Mp': '3',
                    'M': '2',
                    'M2': '1',
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
            },
        },
        eolr: {
            name: 'EOLR trainer settings',
            eolrb: {
                name: 'Solve to EOLR-b',
                value: false,
            },
            eomc_scramble: {
                name: 'Allow misoriented centers in scrambles',
                value: false,
            },
            eomc_solve: {
                name: 'Allow misoriented centers in solved states',
                value: false,
            },
            random_auf: {
                name: 'Start with random AUF',
                value: false,
            },
            eostates: {
                name: 'Possible EO states',
                value: {
                    '0-0': 1,
                    'Arrow': 1,
                    '1F-1B': 1,
                    '4-0': 1,
                    '0-2': 1,
                    '2LR-2': 1,
                    '2FB-0': 1,
                    '2BL-2': 1,
                    '2BL-0': 1,
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

        this.currSolvedFunc = solver.fullSolved
    },
}