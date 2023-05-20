import globals from './globals.js'
import cube from './cube.js'

export default {
    dict: null,
    solvedStates: {},

    getDict: async function() {
        if(this.dict) {
            return this.dict
        }
        this.dict = {}
        this.solvedStates = {};
        this.loopDict([[cube.simpleBaseState(), []]], 0)

        return this.dict
    },

    getDictSolutions: async function(state) {
        await this.getDict()
        let revs = this.dict[state]
        if(!revs) return [];
        let sols = []
        revs.forEach(rev => {
            sols.push(cube.reverseMoves(rev))
        })
        return sols
    },

    loopDict: function(states, depth) {
        if(depth > 10) {
            return
        }
        let newStates = []
        states.forEach(([state, movesDone]) => {
            if(state in this.dict) {
                if(this.dict[state][0].length < movesDone.length) {
                    return
                }
                this.dict[state].push(movesDone)
            } else {
                this.dict[state] = [movesDone]
            }

            globals.currMoveset.forEach(move => {
                if(movesDone.length > 0 && move[0] == movesDone[movesDone.length - 1][0]) {
                    return
                }
                let next = cube.doMove(state, move)
                let stillSolved = globals.currSolvedFunc(next)
                if(stillSolved) {
                    if(next in this.solvedStates) {
                        return
                    }
                    this.solvedStates[next] = true
                }
                newStates.push([next, stillSolved ? [] : [...movesDone, move]])
            })
        })
        this.loopDict(newStates, depth + 1)
    }
}