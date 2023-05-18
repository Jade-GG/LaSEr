import globals from './globals.js'
import cube from './cube.js'
import dict from './dict.js'

export default {
    solutions: [],
    oldStates: {},
    shortest: 20,

    fullSolved: function(state) {
        return state == 0x12345600 || state == 0x12347700
    },

    loopSolve: async function(states) {
        let newStates = []
        let found = false;
        await states.forEach(async ([state, movesDone]) => {
            // Don't repeat states
            if(state in this.oldStates) {
                return
            }
            this.oldStates[state] = true

            if(state in dict.dict) {
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

            // Solved state
            if(globals.currSolvedFunc(state)) {
                this.solutions.push(movesDone)
                this.shortest = movesDone.length
                return
            }

            // Don't look for longer solutions
            if(movesDone.length > this.shortest) {
                return
            }

            // Make new states
            globals.currMoveset.forEach(move => {
                if(movesDone.length > 0 && move[0] == movesDone[movesDone.length - 1][0]) {
                    return
                }
                newStates.push([cube.doMove(state, move), [...movesDone, move]])
            })
        })

        if(newStates.length && !found) {
            await this.loopSolve(newStates)
        }
    },

    solve: async function(state) {
        this.solutions = []
        this.oldStates = {}
        this.shortest = 20

        await dict.getDict()
        if(state in dict.dict) {
            let nextSolutions = await dict.getDictSolutions(state)
            nextSolutions.forEach(addMoves => {
                this.solutions.push(addMoves)
                this.shortest = addMoves.length
            })
            return this.solutions
        }

        await this.loopSolve([[state, []]])
        return this.solutions
    }
}