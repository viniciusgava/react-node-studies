import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
    const className = props.isOverBtnOnHistory || props.isWinner ? 'square highlight' : 'square';
    return (
        <button className={className} onClick={props.onClick}>
            {props.value}
        </button>
    );
}

class Board extends React.Component {
    renderSquare(i) {
        return (
            <Square
                key={i}
                value={this.props.squares[i]}
                onClick={() => this.props.onClick(i)}
                isOverBtnOnHistory={this.props.overBtnOnHistory === i}
                isWinner={this.props.winnerPositions.includes(i)}
            />
        );
    }

    renderLine(line) {
        const lowerBound = 3 * line;
        const squares = Array.from(new Array(3), (x,i) => i + lowerBound)
        .map((value, index) => {
            return this.renderSquare(value);
        });

        return (
            <div className="board-row" key={"line" + line}>
                {squares}
            </div>
        );
    }

    render() {
        const lines = Array.from({length: 3}, (x,i) => i)
            .map((value, index) => {
                return this.renderLine(value);
            });

        return (<div>{lines}</div>);
    }
}

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            history: [{
                squares: Array(9).fill(null),
                overBtnOnHistory: null,
            }],
            stepNumber: 0,
            winnerPositions: Array(3).fill(null),
            overBtnOnHistory: null,
            xIsNext: true,
        }
    }

    handleClick(i) {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();

        if (calculateWinner(squares) || squares[i]) {
            return;
        }

        squares[i] = this.state.xIsNext ? 'X' : 'O';
        this.setState({
            history: history.concat([{
                originEvent: i,
                squares: squares,
            }]),
            stepNumber: history.length,
            xIsNext: !this.state.xIsNext,
        });
    }

    jumpTo(step) {
        this.setState({
           stepNumber: step,
            xIsNext: (step % 2) === 0,
        });
    }

    highlightHistoryMouseOver(step) {
        const overStep =  this.state.history[step];

        this.setState({
            overBtnOnHistory: overStep.originEvent
        });
    }

    highlightHistoryMouseOut(step) {
        this.setState({
            overBtnOnHistory: null
        });
    }

    render() {
        const history = this.state.history;
        const current = history[this.state.stepNumber];
        const winner = calculateWinner(current.squares);

        let status;
        let winnerPositions = [];
        if (winner) {
            status = 'Winner: ' + winner.winner;
            winnerPositions = winner.positions;
        } else if (this.state.stepNumber === 9) {
            status = 'No one wins';
        }else {
            status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
        }

        const moves = history.map((step, move) => {
            const line = Math.ceil((step.originEvent + 1) / 3);
            const column = step.originEvent % 3 + 1;
            const desc = move ?
                `Go to move #${move}(${column}, ${line})`:
                'Go to game start';

            return (
              <li key={move}>
                <button
                    onClick={() => this.jumpTo(move)}
                    onMouseOver={() => this.highlightHistoryMouseOver(move)}
                    onMouseOut={() => this.highlightHistoryMouseOut(move)}
                >
                    {desc}
                </button>
              </li>
            );
        });

        return (
            <div className="game">
                <div className="game-board">
                    <Board
                        squares={current.squares}
                        onClick={(i) => this.handleClick(i)}
                        overBtnOnHistory={this.state.overBtnOnHistory}
                        winnerPositions ={winnerPositions}
                    />
                </div>
                <div className="game-info">
                    <div>{status}</div>
                    <ol>{moves}</ol>
                </div>
            </div>
        );
    }
}

// ========================================

ReactDOM.render(
    <Game />,
    document.getElementById('root')
);

function calculateWinner(squares) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return {
                winner: squares[a],
                positions: lines[i]
            };
        }
    }
    return null;
}