const gameboard = (() => {
    let _positions = new Array(9);
    //initialize array values with empty string so that it doesn't mess with checker logic
    _positions.fill('');
    const squares = document.querySelectorAll(".square");

    const _fill = () => {
        let winCheck = (playGame.winChecker(gameboard.getPosition()));
        if (winCheck) {
            displayController.showModal(winCheck);
        }
        for (let i= 0; i < _positions.length; i++) {
            if (_positions[i] !== '') {
                squares[i].textContent = _positions[i];
            }
        }
    }

    const insertPosition = (index, sign) => {
        if (_positions[index] === '') {
            _positions.splice(index, 1, sign);
            _fill(); 
        }
    }

    const reset = () => {
        for (i=0;i<_positions.length;i++) {
            _positions.splice(i, 1, '');
            squares[i].textContent = '';
        }
    }

    const getPosition = () => _positions;

    const emptys = () => {
        emptyIndexes = [];
        for (i=0;i<_positions.length;i++) {
            if (_positions[i] === '') {
                emptyIndexes.push(i);
            }
        }
        return emptyIndexes;
    }

    return { 
        squares, 
        insertPosition, 
        getPosition, 
        reset,
        emptys
    }
})();

const Player = (sign) => {
    this.sign = sign;

    return {sign};
};

const playGame = (() => {
    const _humanPlayer = Player('x');
    const _aiPlayer = Player('o');

    const setSign = (sign) => {
        if (sign=='o') {
            _humanPlayer.sign = sign;
            _aiPlayer.sign='x';
            aiTurn();
        }
    }

    const playerTurn = (index) => {
        let emptys = gameboard.emptys()
        if (emptys.includes(parseInt(index))) {
            gameboard.insertPosition(index, _humanPlayer.sign);
            aiTurn();
        }
    }

    const aiTurn = () => {
        let difficulty = document.querySelector('#difficulty').value;
        //pick random number between 0 and 100
        const randomValue = Math.floor(Math.random() * (100 + 1));

        //if it falls under threshold of difficulty use ai logic otherwise use random #
        if (randomValue <= difficulty) {
            aiLogic();
        }
        else {
            let emptys = gameboard.emptys();
            let randomPosition = emptys[Math.floor(Math.random() * emptys.length)];
            setTimeout(() => {
                //call real gameboard function to insert position to true board
                gameboard.insertPosition(randomPosition, _aiPlayer.sign);
            }, 200);
        }
    }

    const aiLogic = () => {
        //make copy of gameboard and pass to minimax for data preservation just in case!
        let array = [...gameboard.getPosition()];
        let bestScore = -Infinity;
        let move;
        for (let i=0;i<array.length;i++) {
            if (array[i] == '') {
                array.splice(i, 1, _aiPlayer.sign);
                let score = _minimax(array, 0, false);
                array.splice(i, 1, '');
                if (score > bestScore) {
                    bestScore = score;
                    move = i;
                }
            }
        }
        setTimeout(() => {
            //call real gameboard function to insert position to true board
            gameboard.insertPosition(move, _aiPlayer.sign);
        }, 200);
    }

    //save scores as opposite from human values
    const scores = {
        'win' : -1,
        'lose' : 1,
        'tie': 0
    }

    const _minimax = (array, depth, isMaximizing) => {
        let result = winChecker(array);
        if (result) {
            let score = scores[result];
            return score;
        }

        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i=0;i<array.length;i++) {
                if (array[i] === '') {
                    array.splice(i, 1, _aiPlayer.sign);
                    let score = _minimax(array, depth+1, false);
                    array.splice(i, 1, '');
                    bestScore = Math.max(score, bestScore);
                }
            }
            return bestScore;
        }  
        else {
            let bestScore = +Infinity;
            for (let i=0;i<array.length;i++) {
                if (array[i] === '') {
                    array.splice(i, 1, _humanPlayer.sign);
                    let score = _minimax(array, depth+1, true);
                    array.splice(i, 1, '');
                    bestScore = Math.min(score, bestScore);
                }
            }
            return bestScore;
        }
    }

    const _checkRow = (array) => {
        for (let i= 0; i < 7; i+=3) {
            if (array[i] !== '') {
                if (array[i] == array[i+1] && array[i] == array[i+2]) {
                    return array[i];
                }
            }
        }
    }

    const _checkColumn = (array) => {
        for (let i= 0; i < 3; i++) {
            if (array[i] !== '') {
                if (array[i] == array[i+3] && array[i] == array[i+6]) {
                    return array[i];
                }
            }
        }
    }

    const _checkDiagonal = (array) => {
        for (let i=0; i<3; i+=2) {
            if (array[i]!== '') {
                if (i == 0) {
                    if (array[i] == array[i+4] && array[i] == array[i+8]) {
                        return array[i];
                    }
                }
                else if (i==2) {
                    if (array[i] == array[i+2] && array[i] == array[i+4]) {
                        return array[i];
                    }
                }
            }
        }
    }

    const _tieChecker = (array) => {
        const isFull = (value) => value !== '';
        return array.every(isFull);
    }

    const winChecker = (array) => {
        let win = (_checkRow(array) || _checkColumn(array) || _checkDiagonal(array));
        if (win) {
            if (_humanPlayer.sign == win) {
                return 'win';
            }
            else if (_aiPlayer.sign == win) {
                return 'lose';
            }
        }
        else if (_tieChecker(array)) {
            return 'tie';
        }
        else { return false };
    }

    return { 
        setSign,
        playerTurn,
        winChecker,
        difficulty
    }

})();

const displayController = (() => {

    const setPlayerPick = () => {
        const pick = document.querySelector('#pick').value;
        playGame.setSign(pick);
        gameboard.reset();
    }
    const _symbolForm = document.querySelector('.symbol-form');
    _symbolForm.addEventListener('change', setPlayerPick);

    const _difficultyForm = document.querySelector('.difficulty-form');
    _difficultyForm.addEventListener('change', gameboard.reset());

    const _modal = document.querySelector('.modal');
    const displayResult = document.querySelector('.results-p');
    const showModal = (result) => {
        setTimeout(() => {
            if (result == 'win') {
                displayResult.innerText = 'Congrats you won!';
            }
            else if (result == 'lose') {
                displayResult.innerText = 'Awh, you lost :(';
            } else {
                displayResult.innerText = "It's a draw!";
            }
            _modal.style.display = 'block';
            gameboard.reset();
        }, 450);
    }

    gameboard.squares.forEach(square => {
        square.addEventListener('click', (e) => {
            let index = e.target.id;
            playGame.playerTurn(index);
        });
    });

    const _closers = document.querySelectorAll('.close');
    const _closeModal = () => {
        _modal.style.display = 'none';
    }
    _closers.forEach(close => {
        close.addEventListener('click', () => {
            _closeModal();
        })
    });

    return { 
        setPlayerPick,
        showModal
    }
})();