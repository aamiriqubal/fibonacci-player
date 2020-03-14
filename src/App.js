import React from "react";
import { get, set, isEmpty } from "lodash";
import "./styles.scss";

const GRID_SIZE = 10;
const FIBONACCI_SIZE_CHECK = 5;
const DEFAULT_GRID_VALUE = -1;
const POINTS_PER_NUMBER = 5;
// This function contains the logic to initialise and update the grid values
const getGridValues = (objectGrid, updateIndexes) => {
  const gridValues = {};
  objectGrid.forEach((x, rowIndex) =>
    objectGrid.forEach((y, columnIndex) => {
      if (isEmpty(updateIndexes)) {
        set(gridValues, `${rowIndex}.${columnIndex}.value`, DEFAULT_GRID_VALUE);
      } else {
        const {
          clickedRowIndex,
          clickedColumnIndex,
          currentGridValues
        } = updateIndexes;

        const isPartOfFibonacci = get(
          currentGridValues,
          `${rowIndex}.${columnIndex}.isTrue`,
          false
        );
        const value = get(
          currentGridValues,
          `${rowIndex}.${columnIndex}.value`,
          DEFAULT_GRID_VALUE
        );
        if (
          rowIndex === clickedRowIndex ||
          columnIndex === clickedColumnIndex
        ) {
          set(gridValues, `${rowIndex}.${columnIndex}.value`, value + 1);
        } else {
          set(gridValues, `${rowIndex}.${columnIndex}.value`, value);
        }
        // if the content matched Fibonnaci then set to zero
        if (isPartOfFibonacci) {
          set(gridValues, `${rowIndex}.${columnIndex}.isTrue`, undefined);
          set(
            gridValues,
            `${rowIndex}.${columnIndex}.value`,
            DEFAULT_GRID_VALUE
          );
        }
      }
    })
  );
  return gridValues;
};

const getFibonacci = (size = 0) => {
  let a = 0;
  let b = 1;
  let counter = 2;
  const fibonacciArray = [0, 1];
  while (counter < size) {
    const sum = a + b;
    fibonacciArray.push(sum);
    a = b;
    b = sum;
    counter++;
  }
  return fibonacciArray;
};

const containsArrayInSameSequence = (array1 = [], array2 = []) => {
  let isPresent = false;
  for (let i = 0; i < array1.length; i++) {
    if (array1[i] === array2[0] && i + array2.length <= array1.length) {
      for (let j = 1; j < array2.length; j++) {
        if (array2[j] !== array1[i + j]) {
          isPresent = false;
          break;
        }
        isPresent = true;
      }
    }
    if (isPresent) break;
  }
  return isPresent;
};

let prevGridValues = {};
const getPrevGridValues = () => prevGridValues;
const setPrevGridValues = values => (prevGridValues = values);

const App = () => {
  const objectGrid = new Array(GRID_SIZE).fill("");
  const initialGridValues = getGridValues(objectGrid);
  const [gridValues, setGridValues] = React.useState(initialGridValues);
  const [className, setClassName] = React.useState("");
  const [score, setScore] = React.useState(0);

  const checkFibonacciAndReset = updatedGridValues => {
    const fibonacciArray = getFibonacci(GRID_SIZE);
    const newGridValues = updatedGridValues;
    let currentScore = 0;
    objectGrid.forEach((val, rowIndex) => {
      let startPoint = 0;
      let hasMatch = false;
      while (startPoint < GRID_SIZE) {
        const extractedRowArray = [];
        const extractedColumnArray = [];
        let endPoint = startPoint + FIBONACCI_SIZE_CHECK - 1;
        if (endPoint < GRID_SIZE) {
          for (let i = startPoint; i <= endPoint; i++) {
            const rowValue = get(updatedGridValues, `${rowIndex}.${i}.value`);
            const columnValue = get(
              updatedGridValues,
              `${i}.${rowIndex}.value`
            );
            extractedRowArray.push(rowValue);
            extractedColumnArray.push(columnValue);
          }
          const isRowFibonacci = containsArrayInSameSequence(
            fibonacciArray,
            extractedRowArray
          );
          const isColumnFibonacci = containsArrayInSameSequence(
            fibonacciArray,
            extractedColumnArray
          );
          if (isRowFibonacci) {
            hasMatch = true;
            currentScore += extractedRowArray.length + POINTS_PER_NUMBER;
          }
          if (isColumnFibonacci) {
            hasMatch = true;
            currentScore += extractedColumnArray.length + POINTS_PER_NUMBER;
          }
          for (let i = startPoint; i <= endPoint; i++) {
            if (isRowFibonacci) {
              set(newGridValues, `${rowIndex}.${i}.isTrue`, true);
            }
            if (isColumnFibonacci) {
              set(newGridValues, `${i}.${rowIndex}.isTrue`, true);
            }
          }
        }
        startPoint++;
      }
      if (hasMatch) {
        setGridValues(newGridValues);
        setTimeout(() => {
          const resetGridValues = getGridValues(objectGrid, {
            clickedColumnIndex: -1,
            clickedRowIndex: -1,
            currentGridValues: newGridValues
          });
          setGridValues(resetGridValues);
        }, 1000);
        setTimeout(() => setScore(currentScore + score), 1000);
      }
    });
  };

  const resetGame = () => {
    const newGridValues = getGridValues(objectGrid);
    setScore(0);
    setGridValues(newGridValues);
  };

  const onClickGrid = (clickedRowIndex, clickedColumnIndex) => {
    setPrevGridValues(gridValues);
    setClassName("");

    /* HACK:- this timeout helps to reset the className and
     * then show the yellow color on change.
     */
    const newGridValues = getGridValues(objectGrid, {
      clickedRowIndex,
      clickedColumnIndex,
      currentGridValues: gridValues
    });
    setGridValues(newGridValues);
    setClassName("column--yellow");
    setTimeout(() => setClassName(""), 2000);
    checkFibonacciAndReset(newGridValues);
  };
  const prevGridValues = getPrevGridValues();
  return (
    <div className="fibonacci-player">
      <h1>Fibonacci Player</h1>
      <div className="fibonacci-player__container">
        <p>
          When you click on a cell, all values in the cells in the same row and
          column are increased by 1 or, if a cell was empty, it will get a value
          of 1. After each change a cell will briefly turn yellow. If 5
          consecutive numbers in the Fibonacci sequence are next to each other,
          these cells will briefly turn green and will be cleared.
        </p>
        <div className="fibonacci-player__score-board">
          <h1>Score</h1>
          <div className="fibonacci-player__score-board--score">{score}</div>
        </div>
        <button onClick={resetGame}>RESET</button>
      </div>

      {objectGrid.map((value, rowIndex) => (
        <React.Fragment key={rowIndex}>
          <div className="row" key={`row-${rowIndex}`}>
            {objectGrid.map((x, columnIndex) => {
              const gridValue = get(
                gridValues,
                `${rowIndex}.${columnIndex}.value`,
                0
              );
              const prevGridValue = get(
                prevGridValues,
                `${rowIndex}.${columnIndex}.value`,
                0
              );
              const isPartOfFibonacci = get(
                gridValues,
                `${rowIndex}.${columnIndex}.isTrue`,
                false
              );

              return (
                <div
                  key={`column-${columnIndex}`}
                  className={`column ${
                    isPartOfFibonacci
                      ? "column--green"
                      : gridValue !== prevGridValue
                      ? className
                      : ""
                  }`}
                  onClick={() => onClickGrid(rowIndex, columnIndex)}
                >
                  {/* `${rowIndex}, ${columnIndex}` */} {/* <br /> */}
                  {gridValue === DEFAULT_GRID_VALUE ? null : gridValue}
                </div>
              );
            })}
          </div>
          <br />
        </React.Fragment>
      ))}
    </div>
  );
};

export default App;
