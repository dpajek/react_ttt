import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';


//function components are a simpler way to write components that only have a render method
//need to remove the "this" from function components; can also remove => and () brackets
function Square(props) {
  return (
    <button
      className={props.highlight ? "square-highlight" : "square"}
      onClick={props.onClick}
    >
      {props.value}
    </button>
  );
}

class Board extends React.Component {

  renderSquare(i) {

    let highlight = false;

    if (this.props.winLine !== null)
      if (this.props.winLine[0] === i || this.props.winLine[1] === i || this.props.winLine[2] === i)
        highlight = true;

    return (
      <Square
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
        highlight={highlight}
      />
    );
  }


  render() {

    let elements = [];
    for (var row = 0; row < 3; row++) {

      let children = [];

      for (var col = 0; col < 3; col++) {
        children.push(this.renderSquare(col + 3 * row));
      }

      elements.push(<div className="board-row">{children}</div>)
    }

    return (
      <div>
        <div className="status">{this.props.status}</div>
        {elements}
      </div>
    );
  }
}

class Game extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
        coord: null,
      }],
      xIsNext: true,
      stepNumber: 0,
      sortAsc: true,
    }
  }

  handleClick(i) {

    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    const coord = calculateRowCol(i);

    if (calculateWinner(squares).winner || squares[i]) {
      return;
    }


    if (this.state.xIsNext)
      squares[i] = 'X';
    else
      squares[i] = 'O';

    this.setState({
      history: history.concat([{
        squares: squares,
        coord: coord,
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    }); // when the state changes, this component automatically re-renders
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    });
  }

  toggleOrder() {
    this.setState({
      sortAsc: !this.state.sortAsc,
    });
  }

  render() {

    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const resp = calculateWinner(current.squares);
    const winner = resp.winner;
    const line = resp.line;

    const moves = history.map((step, move) => {
      const desc = move ?
        'Go to move #' + move + ' (' + step.coord.col + ',' + step.coord.row + ')' :
        'Go to game start';
      return (
        <li key={move}>
          <button
            onClick={() => this.jumpTo(move)}
            className={this.state.stepNumber === move ? 'bold' : ''}
          >
            {desc}
          </button>
        </li>
      );
    })

    let status;

    if (winner) {
      status = 'Winner: ' + winner;
    } else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            onClick={(i) => this.handleClick(i)}
            status={status}
            //putting i in the brackets means that the argument 
            //is passed from the Board component, otherwise it 
            //comes fom the current component
            winLine={line}
            squares={current.squares}
          />
        </div>
        <div className="game-info">
          <div>{/* status */}</div>
          <button onClick={() => this.toggleOrder()}>
            {this.state.sortAsc ? 'Change to Desc' : 'Change to Asc'}
          </button>
          <ol>{this.state.sortAsc ? moves : moves.reverse()}</ol>
        </div>
      </div>
    );
  }
}

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
      return { winner: squares[a], line: [a, b, c] };
    }
  }
  return { winner: null, line: null };
}

function calculateRowCol(i) {
  let col = (i % 3);
  let row = (i - col) / 3;

  return { col: col + 1, row: row + 1 };
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);
