import React from 'react'
import ReactDOM from 'react-dom'

const gridSize = 10

const useSnake = (): [(number | null)[], number | null, number, boolean] => {
  const [fruitIndex, setFruitIndex] = React.useState(
    Math.floor(Math.random() * gridSize * gridSize),
  )
  const [headPos, setHeadPos] = React.useState({ x: 1, y: 3 })
  const [bodyIndexes, setBodyIndexes] = React.useState([30] as (
    | number
    | null)[])
  const [direction, setDirection] = React.useState('→')
  const [speed] = React.useState(400)

  const isFrameout =
    headPos.x < 0 ||
    gridSize <= headPos.x ||
    headPos.y < 0 ||
    gridSize <= headPos.y
  const snakeHeadIndex = !isFrameout ? headPos.y * gridSize + headPos.x : null
  const isEatingFruit = snakeHeadIndex === fruitIndex
  const isSuicided = bodyIndexes.includes(snakeHeadIndex)
  const isGameover = isFrameout || isSuicided

  const growUpSnake = () => {
    setBodyIndexes(preBodyIndexes =>
      (() => {
        preBodyIndexes.unshift(preBodyIndexes[0])

        return preBodyIndexes
      })(),
    )
  }

  const countRef = React.useRef(direction)
  countRef.current = direction

  const forwardSnake = () => {
    setBodyIndexes(preBodyIndexes =>
      ((body, head) => {
        body.shift()
        body.push(head)

        return body
      })(preBodyIndexes, snakeHeadIndex),
    )
    switch (countRef.current) {
      case '←':
        setHeadPos(preHeadPos => ({ ...preHeadPos, x: preHeadPos.x - 1 }))
        break
      case '↑':
        setHeadPos(preHeadPos => ({ ...preHeadPos, y: preHeadPos.y - 1 }))
        break
      case '→':
        setHeadPos(preHeadPos => ({ ...preHeadPos, x: preHeadPos.x + 1 }))
        break
      case '↓':
        setHeadPos(preHeadPos => ({ ...preHeadPos, y: preHeadPos.y + 1 }))
        break
    }
  }

  const timeGoes = () => {
    if (!isGameover) {
      forwardSnake()
    }
  }

  React.useEffect(() => {
    const id = setTimeout(timeGoes, speed)

    return () => clearTimeout(id)
  }, [speed, isGameover, headPos, countRef])

  React.useEffect(() => {
    if (isEatingFruit) {
      growUpSnake()
      setFruitIndex(Math.floor(Math.random() * gridSize * gridSize))
    }
  }, [isEatingFruit])

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      switch (e.keyCode) {
        case 37: // 「←」キーが押された
          if (direction !== '→') setDirection('←')
          break
        case 38: // 「↑」キーが押された
          if (direction !== '↓') setDirection('↑')
          break
        case 39: // 「→」キーが押された
          if (direction !== '←') setDirection('→')
          break
        case 40: // 「↓」キーが押された
          if (direction !== '↑') setDirection('↓')
          break
      }
    }

    window.addEventListener('keydown', onKeyDown)

    return () => window.removeEventListener('keydown', onKeyDown)
  }, [direction])

  return [bodyIndexes, snakeHeadIndex, fruitIndex, isGameover]
}

const App = () => {
  const [bodyIndexes, snakeHeadIndex, fruitIndex, isGameover] = useSnake()

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
