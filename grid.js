(function () {
  'use strict';
  const rowSet = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8],
    [9, 10, 11, 12, 13, 14, 15, 16, 17],
    [18, 19, 20, 21, 22, 23, 24, 25, 26],
    [27, 28, 29, 30, 31, 32, 33, 34, 35],
    [36, 37, 38, 39, 40, 41, 42, 43, 44],
    [45, 46, 47, 48, 49, 50, 51, 52, 53],
    [54, 55, 56, 57, 58, 59, 60, 61, 62],
    [63, 64, 65, 66, 67, 68, 69, 70, 71],
    [72, 73, 74, 75, 76, 77, 78, 79, 80]
  ];

  const colSet = [
    [0, 9, 18, 27, 36, 45, 54, 63, 72],
    [1, 10, 19, 28, 37, 46, 55, 64, 73],
    [2, 11, 20, 29, 38, 47, 56, 65, 74],
    [3, 12, 21, 30, 39, 48, 57, 66, 75],
    [4, 13, 22, 31, 40, 49, 58, 67, 76],
    [5, 14, 23, 32, 41, 50, 59, 68, 77],
    [6, 15, 24, 33, 42, 51, 60, 69, 78],
    [7, 16, 25, 34, 43, 52, 61, 70, 79],
    [8, 17, 26, 35, 44, 53, 62, 71, 80]
  ];

  const boxSet = [
    [0, 1, 2, 9, 10, 11, 18, 19, 20],
    [3, 4, 5, 12, 13, 14, 21, 22, 23],
    [6, 7, 8, 15, 16, 17, 24, 25, 26],
    [27, 28, 29, 36, 37, 38, 45, 46, 47],
    [30, 31, 32, 39, 40, 41, 48, 49, 50],
    [33, 34, 35, 42, 43, 44, 51, 52, 53],
    [54, 55, 56, 63, 64, 65, 72, 73, 74],
    [57, 58, 59, 66, 67, 68, 75, 76, 77],
    [60, 61, 62, 69, 70, 71, 78, 79, 80]
  ];

  const row_colToBoxIdx = (r, c) => parseInt(r / 3) * 3 + parseInt(c / 3);
  const row_colTocellIdx = (r, c) => r * 9 + c - 1;
  const cellIdxToRowIdx = (i) => parseInt(i / 9);
  const cellIdxToColIdx = (i) => i % 9;
  const cellIdxToBoxIdx = (i) =>
    parseInt(cellIdxToRowIdx(i) / 3) * 3 + parseInt(cellIdxToColIdx(i) / 3);
  const cellIdxToRowColIdx = (i) => (parseInt(i / 9) + 1) * 10 + ((i % 9) + 1);
  const rowColIdxToCellIdx = (i) => parseInt(i / 10 - 1) * 9 + (i % 10) - 1;

  const arrToObject = (arr, acc) =>
    arr.reduce((obj, currVal) => {
      obj[currVal] = '';
      return obj;
    }, acc);

  var isDebugLogging = false;
  var isHalted = false;
  var cellValue = Array(81).fill(123456789);
  var unsolvedSets = null;
  var propagatedTwins = {};
  var tabLevel = 0;
  var solvedCellCount = 0;

  function configLogLevel(logLevel) {
    isDebugLogging = logLevel === 'Debug';
  }

  function cellGetValueAsString(cellIdx) {
    if (isNaN(cellIdx))
      throw new Error(`cellIdx: Expected number, was ${typeof cellIdx}`);
    return cellValue[cellIdx].toString();
  }

  function cellIsSolved(cellIdx) {
    if (isNaN(cellIdx))
      throw new Error(`cellIdx: Expected number, was ${typeof cellIdx}`);
    return cellValue[cellIdx] < 10 && cellValue[cellIdx] > 0;
  }

  function cellIsValueACandidate(cellIdx, candidateValue) {
    if (isNaN(cellIdx))
      throw new Error(`cellIdx: Expected number, was ${typeof cellIdx}`);
    if (isNaN(candidateValue))
      throw new Error(
        `candidateValue: Expected number, was ${typeof candidateValue}`
      );
    return (
      cellGetValueAsString(cellIdx).toString().indexOf(candidateValue) !== -1
    );
  }

  function cellRemoveCandidate(cellIdx, valueToRemove) {
    tabLevel++;
    const diagInfo = `${''.repeat(
      tabLevel * 2
    )} cellRemoveCandidate( cellIdx=${cellIdx}, value=${valueToRemove} )`;
    if (isDebugLogging)
      console.log(diagInfo, `Entering.  Current value  ${cellValue[cellIdx]}`);

    if (isNaN(cellIdx))
      throw new Error(`cellIdx: Expected number, was ${typeof cellIdx}`);
    if (isNaN(valueToRemove))
      throw new Error(
        `valueToRemove: Expected number, was ${typeof valueToRemove}`
      );

    if (cellValue[cellIdx] == parseInt(valueToRemove)) {
      if (isDebugLogging) console.log(diagInfo, `Problem. Halting!`);
      isHalted = true;
      tabLevel--;
      return;
    }

    var valuesToRemove = valueToRemove
      .toString()
      .split('')
      .map((v) => parseInt(v));
    if (isDebugLogging)
      console.log(diagInfo, 'values to remove', JSON.stringify(valuesToRemove));

    valuesToRemove.forEach((v) => {
      if (!cellIsValueACandidate(cellIdx, v)) {
        if (isDebugLogging) console.log(diagInfo, 'Already removed. NoOp');
        return;
      }

      if (cellIsSolved(cellIdx)) {
        if (isDebugLogging) console.log(diagInfo, 'Already solved.  Exiting');
        return;
      }

      var cellValuesAfterRemoval = parseInt(
        cellGetValueAsString(cellIdx).replace(v, '')
      );
      if (isDebugLogging)
        console.log(
          diagInfo,
          `new value ${cellGetValueAsString(cellIdx).replace(v, '')}`
        );

      cellSetValue(cellIdx, parseInt(cellValuesAfterRemoval));
    });

    tabLevel--;
  }

  function cellSetValue(cellIdx, value) {
    var diagInfo = `cellSetValue ${cellIdx} = ${value}`;

    if (isNaN(cellIdx) || cellIdx == undefined)
      throw new Error(`cellIdx: Expected number, was ${typeof cellIdx}`);
    if (isNaN(value) || value == undefined)
      throw new Error(`value: Expected number, was ${typeof value}`);

    if (isDebugLogging)
      console.log(diagInfo, `Entering current=${cellValue[cellIdx]}`);
    if (isHalted || cellIsSolved(cellIdx)) return;

    cellValue[cellIdx] = parseInt(value);
    if (isDebugLogging) console.log(diagInfo, 'new value', cellValue[cellIdx]);

    if (!cellIsSolved(cellIdx)) return;

    solvedCellCount++;
    gridDropCellFromUnsolvedSets(cellIdx);
    gridPropagateCellValueToUnsolvedSets(cellIdx, value);
  }

  function Grid(input) {
    //console.log("isLoggingEnabled", isDebugLogging);
    var _self = this;

    _self.checkForCorrectness = gridCheckForCorrectness;
    _self.useOnlyChoice = useOnlyChoice;
    _self.serialize = gridSerialize;
    _self.deserialize = gridDeserialize;
    _self.getGridForDisplay = gridSerializeForDisplay;
    _self.getGridForSimpleDisplay = gridSerializeForSimpleDisplay;
    _self.isSolved = gridIsSolved;
    _self.isHalted = () => isHalted;
    _self.unsolvedCount = gridUnsolvedCount;
    _self.useBruteForce = gridUseBruteForce;
    _self.useNakedTwins = gridNakedTwins;
    _self.useHints = gridUseHints;
    _self.removeCandidate = (idx, v) =>
      cellRemoveCandidate(rowColIdxToCellIdx(idx), v);
    _self.setValue = (idx, v) => cellSetValue(rowColIdxToCellIdx(idx), v);

    input[0] !== '{' ? gridInit(input) : gridDeserialize(input);
  }

  function gridCheckForCorrectness() {
    const diagInfo = 'checkForCorrectness';
    var allSets = setsGetAll();

    var isCorrect = true;
    allSets.forEach((thisSet, setIdx) => {
      var thisSum = thisSet.reduce(
        (sum, cellIdx) => sum + parseInt(cellValue[cellIdx]),
        0
      );
      if (thisSum !== 45) {
        if (isDebugLogging)
          console.log(diagInfo, `sum of set[${setIdx}]=${thisSum}`);
        isCorrect = false;
      }
    });

    return isCorrect;
  }

  function gridDropCellFromUnsolvedSets(cellIdx) {
    const diagInfo = `gridDropCellFromUnsolvedSets ( ${cellIdx} )`;
    if (isDebugLogging) console.log(diagInfo, 'Entering');

    if (isNaN(cellIdx))
      throw new Error(`cellIdx: Expected number, was ${typeof cellIdx}`);

    if (isDebugLogging)
      console.log(
        diagInfo,
        'Dropping from sets',
        gridGetSetsWithCellAsMember(cellIdx)
      );

    gridGetSetsWithCellAsMember(cellIdx).forEach((setIdx) => {
      setsDropCellFromSet(setIdx, cellIdx);
    });
    if (isDebugLogging) console.log(diagInfo, 'Exiting');
  }

  function gridGetSetsWithCellAsMember(cellIdx) {
    if (isNaN(cellIdx))
      throw new Error(`cellIdx: Expected number, was ${typeof cellIdx}`);
    return new Array(
      cellIdxToRowIdx(cellIdx),
      cellIdxToColIdx(cellIdx) + 9,
      cellIdxToBoxIdx(cellIdx) + 18
    );
  }

  function gridInit(input) {
    isHalted = false;
    unsolvedSets = setsGetAll();
    solvedCellCount = 0;
    propagatedTwins = {};

    cellValue = Array(81).fill(123456789);

    var cleanInput = input.replace(/[\n\t \|]/g, '').split('');

    cleanInput.forEach((val, idx) => {
      if (isHalted) return;
      if (val == 0) return;
      if (isDebugLogging) console.log(`Initializing cell ${idx} to ${val}`);
      cellSetValue(idx, val);
    });
  }

  function gridIsSolved() {
    return solvedCellCount === 81;
  }

  function gridNakedTwins() {
    if (isDebugLogging) console.log('solving for Naked twins');
    var removalPropagationList = [];

    unsolvedSets.forEach((s, setIdx) => {
      var obj = {};

      if (isDebugLogging) console.log(setIdx, JSON.stringify(s));
      s.forEach((cellIdx) => {
        var candidateValues = cellValue[cellIdx];
        if (candidateValues.toString().length != 2) {
          return;
        }
        if (obj[candidateValues] == undefined) {
          obj[candidateValues] = [];
        }
        obj[candidateValues].push(cellIdx);
      });

      var twins = Object.keys(obj).filter((k) => {
        return k.length == 2 && obj[k].length == 2;
      });

      if (twins.length === 0) {
        return;
      }

      if (isDebugLogging)
        console.log(`Found twins.  Set ${setIdx}, values ${twins}`);

      twins.forEach((t) => {
        var twinKey = `Set${setIdx}_values${t}`;
        if (propagatedTwins[twinKey]) {
          if (isDebugLogging) console.log(`${twinKey} already propagated`);
          return;
        }

        propagatedTwins[twinKey] = true;
        if (isDebugLogging) console.log(propagatedTwins);

        var twinsCellIdxs = obj[t];
        if (isDebugLogging)
          console.log(setIdx, JSON.stringify(t), twinsCellIdxs);

        s.forEach((cellIdx) => {
          if (twinsCellIdxs.indexOf(cellIdx) == -1) {
            removalPropagationList.push([cellIdx, parseInt(t)]);
            console.log(`\t${cellIdxToRowColIdx(cellIdx)}!=${t}`);
          } else {
            if (isDebugLogging) console.log('\t skipping', cellIdx);
          }
        });
      });
    });
    if (isDebugLogging) console.log('Removal List', removalPropagationList);
    removalPropagationList.forEach((r) => {
      if (isDebugLogging)
        console.log(`Applying ${cellIdxToRowColIdx(r[0])} != ${r[1]}`);
      cellRemoveCandidate(r[0], r[1]);
    });
  }

  function gridPropagateCellValueToUnsolvedSets(cellIdx, cellValue) {
    const diagInfo = `gridPropagateCellValueToUnsolvedSets(${cellIdx}, ${cellValue}):`;
    if (isDebugLogging) console.log(diagInfo, 'Entering');
    if (isHalted) {
      if (isDebugLogging) console.log(diagInfo, 'Halted.  Not propagating');
    }

    if (isNaN(cellIdx))
      throw new Error(`cellIdx: Expected number, was ${typeof cellIdx}`);
    if (isNaN(cellValue))
      throw new Error(`cellValue: Expected number, was ${typeof cellValue}`);

    var setIdxs = gridGetSetsWithCellAsMember(cellIdx);
    if (isDebugLogging)
      console.log(diagInfo, 'Indexes of sets containing this cell', setIdxs);
    var thisObj = {};
    arrToObject(unsolvedSets[setIdxs[0]], thisObj);
    arrToObject(unsolvedSets[setIdxs[1]], thisObj);
    arrToObject(unsolvedSets[setIdxs[2]], thisObj);

    var propagationList = Object.keys(thisObj);
    if (isDebugLogging)
      console.log(diagInfo, 'Unsolved cells', propagationList.toString());
    propagationList.forEach(
      (cellIdx) =>
        !isHalted && cellRemoveCandidate(parseInt(cellIdx), cellValue)
    );
  }

  function gridDeserialize(stringState) {
    var thisState = JSON.parse(stringState);
    cellValue = thisState.cellValue;
    solvedCellCount = thisState.solvedCellCount;
    unsolvedSets = thisState.unsolvedSets;
    propagatedTwins = thisState.propagatedTwins;
    isHalted = thisState.isHalted;
  }

  function gridSerialize() {
    var thisState = {
      cellValue,
      solvedCellCount,
      unsolvedSets,
      propagatedTwins,
      isHalted
    };
    return JSON.stringify(thisState);
  }

  function gridSerializeForDisplay() {
    var rowVals = '';
    for (var idx = 0; idx < 81; idx++) {
      rowVals += `${idx % 27 === 0 ? '\n' + '='.repeat(96) : ''}`;
      rowVals += `${idx % 9 === 0 ? '\n||' : ''}`;
      rowVals +=
        ' '.repeat(9 - cellGetValueAsString(idx).length) + cellValue[idx];
      rowVals += idx % 3 === 2 ? '||' : '|';
    }
    rowVals += `\n${'='.repeat(96)}`;

    return rowVals;
  }

  function gridSerializeForSimpleDisplay() {
    var rowVals = '';
    for (var idx = 0; idx < 81; idx++) {
      if (idx % 9 === 0) {
        rowVals += '\n';
      }

      rowVals += '|';
      rowVals += cellGetValueAsString(idx);
    }
    return rowVals;
  }

  function gridUnsolvedCount() {
    return 81 - solvedCellCount;
  }

  function gridGetFirstUnsolvedCell() {
    return cellValue
      .reduce((acc, v) => {
        return acc + (v > 9 ? 0 : v);
      }, '')
      .indexOf(0);
  }

  function gridUseBruteForce() {
    var stash = [];
    var thisState = gridSerialize();
    var unsolvedIdx = gridGetFirstUnsolvedCell();

    cellGetValueAsString(unsolvedIdx)
      .split('')
      .forEach((num) => {
        stash.push({
          state: thisState,
          hints: [[unsolvedIdx, num]],
          tabLevel: 0
        });
      });

    var loopCount = 50;
    var valueToTry = null;
    var isGridSolvedAndCorrect = gridIsSolved() && gridCheckForCorrectness();

    while (!isGridSolvedAndCorrect && stash.length > 0 && loopCount > 0) {
      loopCount--;
      valueToTry = stash.shift();
      if (isDebugLogging)
        console.log('Trying :', JSON.stringify(valueToTry.hints));

      gridDeserialize(valueToTry.state);
      var hints2 = [...valueToTry.hints].pop();

      cellSetValue(hints2[0], hints2[1]);
      useOnlyChoice();

      isGridSolvedAndCorrect = gridIsSolved() && gridCheckForCorrectness();

      if (!isGridSolvedAndCorrect && !isHalted) {
        thisState = gridSerialize();
        unsolvedIdx = gridGetFirstUnsolvedCell();
        cellGetValueAsString(unsolvedIdx)
          .split('')
          .forEach((num) => {
            stash.push({
              state: thisState,
              hints: [...valueToTry.hints, [unsolvedIdx, num]],
              tabLevel: valueToTry.tabLevel + 1
            });
          });
      }
    }

    if (isDebugLogging) {
      if (loopCount === 0) console.log('Exceeded iteration count');
      console.log(
        'Hints :',
        isGridSolvedAndCorrect ? valueToTry.hints : "Couldn't generate hints"
      );
    }
    return isGridSolvedAndCorrect
      ? valueToTry.hints.map((h) => [cellIdxToRowColIdx(h[0]), parseInt(h[1])])
      : [];
  }

  function gridUseHints(hints) {
    hints.forEach((h) => {
      cellSetValue(h[0], h[1]);
      useOnlyChoice();
    });
  }

  function setsDropCellFromSet(setIdx, cellIdx) {
    const diagInfo = `setsDropCellFromSet(setIdx=${setIdx}, cellIdx=${cellIdx})`;
    if (isDebugLogging) console.log(diagInfo, `Entering`);

    if (isNaN(setIdx) || setIdx == undefined)
      throw new Error(`setIdx: Expected number, was ${typeof setIdx}`);
    if (isNaN(cellIdx) || cellIdx == undefined)
      throw new Error(`cellIdx: Expected number, was ${typeof cellIdx}`);

    const set = unsolvedSets[setIdx];
    if (isDebugLogging) console.log(diagInfo, `Set is ${JSON.stringify(set)}`);
    var posInSet = set.indexOf(cellIdx);
    if (posInSet === -1) {
      if (isDebugLogging)
        console.log(diagInfo, 'Cell index not in set. Nothing to remove');
      return;
    }

    set.splice(posInSet, 1);
    if (isDebugLogging)
      console.log(diagInfo, `Exiting.  Modified set is ${JSON.stringify(set)}`);
  }

  function useOnlyChoice() {
    var shouldContinue = true;

    while (shouldContinue && !isHalted && !gridIsSolved()) {
      if (isDebugLogging) console.log('setsFindSingleCandidates');
      var solves = {};
      if (isDebugLogging) console.log(gridSerializeForDisplay());
      unsolvedSets.forEach((set, idx) => {
        var candidates = setsGroupCellsByUnsolvedNumbers(set);
        if (isDebugLogging)
          console.log(`${idx}  ${JSON.stringify(candidates)}`);
        Object.keys(candidates).forEach((key) => {
          if (candidates[key].length === 1) {
            var cellIdx = candidates[key][0];
            solves[cellIdx] = { cellIdx, key };
          }
        });
      });

      var solvedList = Object.values(solves);
      solvedList.forEach((solve) => {
        if (isDebugLogging)
          console.log(`  Setting ${solve.cellIdx} = ${solve.key}`);
        cellSetValue(solve.cellIdx, solve.key);
      });
      shouldContinue = solvedList.length > 0;
    }
    if (isDebugLogging) console.log('Unsolved ', gridUnsolvedCount());
  }

  function setsGetAll() {
    var allSets = [].concat(rowSet).concat(colSet).concat(boxSet);
    var cloneOfAllSets = JSON.parse(JSON.stringify(allSets));
    return cloneOfAllSets;
  }

  function setsGroupCellsByUnsolvedNumbers(set) {
    return set.reduce((acc, cellIdx) => {
      cellGetValueAsString(cellIdx)
        .split('')
        .forEach((n) => {
          if (acc[n] === undefined) {
            acc[n] = [];
          }
          acc[n].push(cellIdx);
        });
      return acc;
    }, {});
  }

  module.exports = { grid: Grid, setLogLevel: configLogLevel };
})();
