import globals from './globals.js'
import cube from './cube.js'
import dict from './dict.js'

export default {
    solutions: [],
    oldStates: {},
    shortest: 20,

    fullSolved: function(state) {
        return state == 0x12345600 || state == 0x12345500
    },

    badEdgesSolved: function(state) {
        let m = (state >> 4) & 3
        let flip = m % 2 == 1

        if(!globals.getSetting('eolr.eomc_solve') && flip) {
            return false
        }

        for(let i = 2; i < 8; i++) {
            let piece = (state >> (i * 4) & 0xF)
            if(piece > 8 && piece < 11) {
                // Bad LR edge
                return false
            }
            if(!flip && piece > 10) {
                // Bad non-LR edge w/o misoriented centers
                return false
            }
            if(flip && piece > 2 && piece < 8) {
                // Bad non-LR edge with misoriented centers
                return false
            }
        }

        return true
    },

    EOLRSolved: function(state) {
        if(!this.badEdgesSolved(state)) {
            return false
        }

        for(let i = 2; i < 8; i += 2) {
            let pieces = (state >> (i * 4)) & 0xFF

            if(pieces == 0x21 || pieces == 0x12) {
                return true
            }
        }

        return false
    },

    EOLRBSolved: function(state) {
        if(!this.badEdgesSolved(state)) {
            return false
        }

        let u = state & 3
        if(u == 0 && ((state & 0xff000000) == 0x12000000)) {
            return true
        }
        if(u == 1 && ((state & 0x00ff0000) == 0x00120000)) {
            return true
        }
        if(u == 2 && ((state & 0xff000000) == 0x21000000)) {
            return true
        }
        if(u == 3 && ((state & 0x00ff0000) == 0x00210000)) {
            return true
        }
        
        return false
    },

    loopSolve: async function(states, solveFunc, solvesToEnd) {
        let newStates = []
        let found = false;
        let qstm = globals.getSetting('laser.qstm')
        await states.forEach(async ([state, movesDone]) => {
            // Don't repeat states
            if(state in this.oldStates) {
                return
            }
            this.oldStates[state] = true

            if(solvesToEnd && state in dict.dict) {
                let nextSolutions = await dict.getDictSolutions(state)
                nextSolutions.forEach(addMoves => {
                    let newMoves = [...movesDone, ...addMoves];
                    if(this.solutions.length > 0) {
                        if(newMoves.length > this.solutions[0].length) {
                            return
                        }
                        if(newMoves.length < this.solutions[0].length) {
                            this.solutions = [];
                        }
                    }
                    this.solutions.push(newMoves)
                })
                this.shortest = movesDone.length
                found = true;
                return
            }

            if(found) return

            // Don't look for longer solutions
            if(movesDone.length > this.shortest) {
                return
            }

            // Solved state
            if(solveFunc(state)) {
                this.solutions.push(movesDone)
                this.shortest = movesDone.length
                return
            }

            // Make new states
            globals.currMoveset.forEach(move => {
                if(movesDone.length > 0 && (!qstm && move[0] == movesDone[movesDone.length - 1][0])) {
                    return
                }
                newStates.push([cube.doMove(state, move), [...movesDone, move]])
            })
        })

        if(newStates.length && !found) {
            await this.loopSolve(newStates, solveFunc, solvesToEnd)
        }
    },

    solve: async function(cubeState, solveFunc) {
        this.solutions = []
        this.oldStates = {}
        this.shortest = 20

        let state = cube.simplifyState(cubeState);

        let solvesToEnd = globals.solvesToEnd

        if(!solveFunc) {
            await dict.getDict()
            if(state in dict.dict) {
                let nextSolutions = await dict.getDictSolutions(state)
                nextSolutions.forEach(addMoves => {
                    this.solutions.push(addMoves)
                    this.shortest = addMoves.length
                })
                return this.solutions
            }

            solveFunc = (state) => this.fullSolved(state)
            solvesToEnd = true
        }

        await this.loopSolve([[state, []]], solveFunc, solvesToEnd)
        return this.solutions
    }
}