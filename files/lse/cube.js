export default {
    baseState: function() {
        return 0x12345600
    },

    simpleBaseState: function() {
        // Because you can't only swap two edges, this state is sufficient to describe every possible state
        return 0x12345500
    },

    simplifyState: function(state) {
        for(let i = 2; i < 8; i++) {
            if(((state >> (i * 4)) & 0x7) == 6) {
                // 6 XOR 3 = 5
                state ^= 3 << (i * 4)
            }
        }
        return state
    },
    
    doMove: function(cube, move) {
        // We do a little
        // a little bitwise hacking
        //
        // A cube state is represented as 0xLRABCDMU, where:
        // - LR are the obvious UL and UR edges.
        // - ABCD are UB, UF, DF, DB respectively.
        // - MU are the M move count and U move count respectively.
        switch (move) {
            case 'U':
                cube += 0x01
                cube = ((cube & 0xFF000000) >>> 8)
                    | ((cube & 0x00F00000) << 4)
                    | ((cube & 0x000F0000) << 12)
                    | ((cube & 0x0000FFFF))
                break
            case 'U\'':
                cube += 0x03
                cube = ((cube & 0x00FF0000) << 8)
                    | ((cube & 0x0F000000) >>> 4)
                    | ((cube & 0xF0000000) >>> 12)
                    | ((cube & 0x0000FFFF))
                break
            case 'U2':
                cube += 0x02
                cube = ((cube & 0x000F0000) << 4)
                    | ((cube & 0x00F00000) >>> 4)
                    | ((cube & 0x0F000000) << 4)
                    | ((cube & 0xF0000000) >>> 4)
                    | ((cube & 0x0000FFFF))
                break
    
            case 'M':
                cube += 0x10
                cube = ((cube & 0x00FFF000) >>> 4)
                    | ((cube & 0x00000F00) << 12)
                    | ((cube & 0xFF0000FF))
                cube ^= 0x00888800
                break
            case 'M\'':
                cube += 0x30
                cube = ((cube & 0x000FFF00) << 4)
                    | ((cube & 0x00F00000) >>> 12)
                    | ((cube & 0xFF0000FF))
                cube ^= 0x00888800
                break
            case 'M2':
                cube += 0x20
                cube = ((cube & 0x0000FF00) << 8)
                    | ((cube & 0x00FF0000) >>> 8)
                    | ((cube & 0xFF0000FF))
                break
        }
        return cube & 0xFFFFFF33
    },
    
    doMoves: function(cube, moves) {
        return moves.reduce((cube, move) => this.doMove(cube, move), cube)
    },
    
    cancelMoves: function(a, b) {
        // Lazy, assumes A and B are same move direction
        let types = (a[1] ?? ' ') + (b[1] ?? ' ')
        switch(types) {
            case ` '`: return ``
            case ` 2`: return `${a[0]}'`
            case `  `: return `${a[0]}2`
    
            case `' `: return ``
            case `'2`: return `${a[0]}`
            case `''`: return `${a[0]}2`
    
            case `22`: return ``
            case `2'`: return `${a[0]} `
            case `2 `: return `${a[0]}'`
        }
    },
    
    reduceMoves: function(moves) {
        for(let i = 0; i < moves.length - 1; i++) {
            if (moves[i][0] == moves[i + 1][0]) {
                moves[i] = this.cancelMoves(moves[i], moves[i + 1])
                if(moves[i] == '') {
                    moves.splice(i, 2)
                    i -= 2
                    if(i < -1) i = -1
                } else {
                    moves.splice(i + 1, 1)
                }
            }
        }
        return moves
    },

    reverseMoves: function(moves) {
        let list = []
        moves.forEach(move => list.unshift(this.reverseMove(move)))
        return list
    },
    
    reverseMove: function(move) {
        switch(move) {
            case 'M': return 'M\''
            case 'M\'': return 'M'
            case 'M2': return 'M2'
            case 'U': return 'U\''
            case 'U\'': return 'U'
            case 'U2': return 'U2'
            default: return ''
        }
    }
}