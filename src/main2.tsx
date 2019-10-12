import React from 'react'
import ReactDOM from 'react-dom'

enum Direction {
  LEFT = 37,
  DOWN = 38,
  RIGHT = 39,
  UP = 40,
}

const isOppsite = (dir1: Direction, dir2: Direction) => {
  switch (dir1) {
    case Direction.LEFT:
      return dir2 === Direction.RIGHT
    case Direction.RIGHT:
      return dir2 === Direction.LEFT
    case Direction.DOWN:
      return dir2 === Direction.UP
    case Direction.UP:
      return dir2 === Direction.DOWN
  }
}

interface Pos {
  x: number
  y: number
}

interface State {
  gridSize: number
  fruitIndex: number
  snake: {
    headPos: Pos
    bodyIndexes: (number | null)[]
    direction: Direction
    speed: number
  }
}

const genRandomIndex = (size: number) => Math.floor(Math.random() * size * size)
const initGridSize = 10

const initialState: State = {
  gridSize: initGridSize,
  fruitIndex: genRandomIndex(initGridSize),
  snake: {
    headPos: {
      x: 1,
      y: 3,
    },
    bodyIndexes: [30],
    direction: Direction.RIGHT,
    speed: 400,
  },
}

const setFruitIndex = (fruitIndex: number) =>
  ({
    type: 'SET_FRUIT_INDEX',
    payload: fruitIndex,
  } as const)

const moveHead = (direction: Direction) =>
  ({
    type: 'MOVE_HEAD',
    payload: direction,
  } as const)

const moveBody = (snakeHeadIndex: number | null) =>
  ({
    type: 'MOVE_BODY',
    payload: snakeHeadIndex,
  } as const)

const setDirection = (direction: Direction) =>
  ({
    type: 'SET_DIRECTION',
    payload: direction,
  } as const)

const growUpSnake = () =>
  ({
    type: 'GROW_UP_SNAKE',
  } as const)

type Action =
  | ReturnType<typeof setFruitIndex>
  | ReturnType<typeof setDirection>
  | ReturnType<typeof growUpSnake>
  | ReturnType<typeof moveHead>
  | ReturnType<typeof moveBody>

const reducer = (state: State = initialState, action: Action) => {
  switch (action.type) {
    case 'SET_FRUIT_INDEX':
      return {
        ...state,
        fruitIndex: action.payload,
      }
    case 'SET_DIRECTION':
      return {
        ...state,
        snake: {
          ...state.snake,
          direction: action.payload,
        },
      }
    case 'MOVE_BODY': {
      const body = state.snake.bodyIndexes
      body.shift()
      body.push(action.payload)

      return {
        ...state,
        snake: {
          ...state.snake,
          bodyIndexes: body,
        },
      }
    }
    case 'MOVE_HEAD':
      switch (action.payload) {
        case Direction.RIGHT:
          return {
            ...state,
            snake: {
              ...state.snake,
              headPos: {
                ...state.snake.headPos,
                x: state.snake.headPos.x + 1,
              },
            },
          }
        case Direction.LEFT:
          return {
            ...state,
            snake: {
              ...state.snake,
              headPos: {
                ...state.snake.headPos,
                x: state.snake.headPos.x - 1,
              },
            },
          }
        case Direction.UP:
          return {
            ...state,
            snake: {
              ...state.snake,
              headPos: {
                ...state.snake.headPos,
                y: state.snake.headPos.y + 1,
              },
            },
          }
        case Direction.DOWN:
          return {
            ...state,
            snake: {
              ...state.snake,
              headPos: {
                ...state.snake.headPos,
                y: state.snake.headPos.y - 1,
              },
            },
          }
        default:
          return state
      }
    case 'GROW_UP_SNAKE': {
      const bodyIndexes = state.snake.bodyIndexes
      bodyIndexes.unshift(bodyIndexes[0])

      return {
        ...state,
        snake: {
          ...state.snake,
          bodyIndexes: bodyIndexes,
        },
      }
    }
    default:
      return state
  }
}

const useSnake = (): [
  number,
  (number | null)[],
  number | null,
  number,
  boolean,
] => {
  const [state, dispatch] = React.useReducer(reducer, initialState)
  const { gridSize, fruitIndex, snake } = state
  const { headPos, bodyIndexes, direction, speed } = snake

  const isFrameout =
    headPos.x < 0 ||
    gridSize <= headPos.x ||
    headPos.y < 0 ||
    gridSize <= headPos.y
  const snakeHeadIndex = !isFrameout ? headPos.y * gridSize + headPos.x : null
  const isEatingFruit = snakeHeadIndex === fruitIndex
  const isSuicided = bodyIndexes.includes(snakeHeadIndex)
  const isGameover = isFrameout || isSuicided

  const directionRef = React.useRef(direction)
  directionRef.current = direction

  const forwardSnake = () => {
    dispatch(moveBody(snakeHeadIndex))
    dispatch(moveHead(directionRef.current))
  }

  const timeGoes = () => {
    if (!isGameover) {
      forwardSnake()
    }
  }

  React.useEffect(() => {
    const id = setTimeout(timeGoes, speed)

    return () => clearTimeout(id)
  }, [speed, isGameover, headPos, directionRef])

  React.useEffect(() => {
    if (isEatingFruit) {
      dispatch(growUpSnake())
      dispatch(setFruitIndex(genRandomIndex(gridSize)))
    }
  }, [isEatingFruit])

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!isOppsite(e.keyCode, direction)) dispatch(setDirection(e.keyCode))
    }
    window.addEventListener('keydown', onKeyDown)

    return () => window.removeEventListener('keydown', onKeyDown)
  }, [direction])

  return [gridSize, bodyIndexes, snakeHeadIndex, fruitIndex, isGameover]
}

const App = () => {
  const [
    gridSize,
    bodyIndexes,
    snakeHeadIndex,
    fruitIndex,
    isGameover,
  ] = useSnake()

  return (
    <div>
      <p>SCORE: {bodyIndexes.length - 1}</p>
      <div id="map">
        {Array.from({ length: gridSize * gridSize }, (_, i) => i).map(v => (
          <div
            className={`cell ${snakeHeadIndex === v ? 'head' : ''} ${
              bodyIndexes.includes(v) ? 'body' : ''
            } ${fruitIndex === v ? 'fruit' : ''}`}
          ></div>
        ))}
      </div>
      <>
        {isGameover && (
          <p>
            Gameover
            <br />
            <button onClick={() => location.reload()}>RETRY</button>
          </p>
        )}
      </>
    </div>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))
