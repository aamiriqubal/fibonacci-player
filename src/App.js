import React from "react";
import { get, set, isEmpty } from "lodash";
import "./styles.scss";

const GRID_SIZE = 7;
const FIBONACCI_SIZE_CHECK = 5;
// This function contains the logic to initialise and update the grid values
const getGridValues = (objectGrid, updateIndexes) => {
  const gridValues = {};
  objectGrid.forEach((x, rowIndex) =>
    objectGrid.forEach((y, columnIndex) => {
      if (isEmpty(updateIndexes)) {
        set(gridValues, `${rowIndex}.${columnIndex}.value`, 0);
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
          0
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
          set(gridValues, `${rowIndex}.${columnIndex}.value`, 0);
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

  const checkFibonacciAndReset = updatedGridValues => {
    const fibonacciArray = getFibonacci(GRID_SIZE);
    const newGridValues = updatedGridValues;
    objectGrid.forEach((val, rowIndex) => {
      let startPoint = 0;
      let hasMatch = false;
      while (startPoint < GRID_SIZE) {
        const extractedArray = [];
        let endPoint = startPoint + FIBONACCI_SIZE_CHECK - 1;
        if (endPoint < GRID_SIZE) {
          for (let i = startPoint; i <= endPoint; i++) {
            const value = get(updatedGridValues, `${rowIndex}.${i}.value`);
            extractedArray.push(value);
          }
          const isFibonacci = containsArrayInSameSequence(
            fibonacciArray,
            extractedArray
          );
          if (isFibonacci) {
            hasMatch = true;
            for (let i = startPoint; i <= endPoint; i++) {
              set(newGridValues, `${rowIndex}.${i}.isTrue`, true);
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
      }
    });
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
    <div className="change-numbers">
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
                  {gridValue === 0 ? null : gridValue}
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
