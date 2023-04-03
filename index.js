(function () {
  "use strict";

  const repl = require("./repl.js");
  const Grid = require("./grid.js").grid;
  const gridSetLogLevel = require("./grid.js").setLogLevel;

  const readline = require("readline");

  //TODO: Rename findsingle to findOnlyOnce
  //TODO: Rename sets to peers
  //TODO: query for solved count
  //TODO: support modification of hint history
  //TODO: support replay of hint history
  //TODO: investigate why parser  error spew shown in stdout/stderr is not suppresed by try-catch - Don
  //TODO: add help command to the grammar
  //TODO: Enforce numbers to be int
  //TODO: Change internal cellIdx to be RowCol reference instead of array index reference

  var inputThroughConsole = "";
  var boolIsDoneReceiving = true;
  var gridFromConsoleInput;
  var hintHistory = [];
  var stash = [];
  var color = 32;
  function receiveInput(input) {
    inputThroughConsole += (input || "").toString().replace(/[^0-9]/g, "");

    boolIsDoneReceiving =
      inputThroughConsole.replace(/[ \n\t]/g, "").length == 81;

    if (boolIsDoneReceiving) {
      var formattedInput = inputThroughConsole;
      console.log(
        "Received Input",
        "\n\t" + inputThroughConsole.replace(/([0-9]{9})/g, "$1\n\t")
      );
      gridFromConsoleInput = new Grid(inputThroughConsole);
    }
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
  });

  rl.on("line", (line) => {
    if (line.indexOf("quit") > -1) {
      rl.close();
      return;
    }

    if (!boolIsDoneReceiving) {
      receiveInput(line);
      return;
    }

    try {
      var { commandId, command } = repl.parseInput(line);
      if (commandId != undefined) {
        runCommand(commandId, command);
      }
    } catch (e) {
      console.error("Error while parsing input", line);
      console.error(e);
      console.log("¯\\_(ツ)_/¯!");
    }
  });

  function runCommand(commandId, command) {
    const saveState = [
      "set_value",
      "remove_value",
      "use_hint",
      "use_naked_twins",
      "use_only_choice",
      "use_brute_force",
    ];
    const skipStatus = [
      "init_grid",
      "show_input",
      "show_unsolved_count",
      "show_hint_history",
      "is_it_solved",
      "is_it_stuck",
      "is_it_correct",
      "set_color",
      "set_debug",
    ];

    if (saveState.indexOf(commandId) != -1)
      stash.push(gridFromConsoleInput.serialize());

    switch (commandId) {
      case "init_grid":
        inputThroughConsole = "";
        hintHistory = [];
        receiveInput(command.numbers);
        break;
      case "show_grid":
        var formattedGrid = gridFromConsoleInput.getGridForDisplay();

        if (command.numbers != undefined) {
          //TODO: why is numbers not being post processed?
          //https://en.wikipedia.org/wiki/ANSI_escape_code#Colors
          //Highlighing number in red.
          var pattern = command.numbers.value;
          formattedGrid = formattedGrid.replaceAll(
            pattern,
            "\x1b[1m\x1b[" + color + "m" + pattern + "\x1b[0m"
          );
        }
        console.log(formattedGrid);
        break;
      case "rewind_grid":
        if (stash.length > 0) {
          var prevState = stash.pop();
          gridFromConsoleInput = new Grid(prevState);
        }
        break;
      case "reset_grid":
        if (inputThroughConsole.length != 81) {
          console.log("! No current grid");
          return;
        }
        gridFromConsoleInput = new Grid(inputThroughConsole);
        break;
      case "show_input":
        console.log(`\n\t${inputThroughConsole
          .replace(/([0-9]{3})/g, "$1 ")
          .replace(/([0-9 ]{12})/g, "$1\n\t")}
        `);
        break;
      case "show_unsolved_count":
        console.log(gridFromConsoleInput.unsolvedCount(), "unsolved cells");
        break;
      case "show_hint_history":
        console.log(JSON.stringify(hintHistory, null, 2));
        break;
      case "is_it_solved":
        console.log(gridFromConsoleInput.isSolved() ? "Yes" : "No");
        break;
      case "is_it_stuck":
        console.log(gridFromConsoleInput.isHalted() ? "Yes" : "No");
        break;
      case "is_it_correct":
        console.log(gridFromConsoleInput.checkForCorrectness() ? "Yes" : "No");
        break;
      case "use_naked_twins":
        var currentState = gridFromConsoleInput.serialize();
        stash.push(currentState);
        gridFromConsoleInput.useNakedTwins();
        break;
      case "use_only_choice":
        var currentState = gridFromConsoleInput.serialize();
        stash.push(currentState);
        gridFromConsoleInput.findSingleCandidates();
        break;
      case "use_brute_force":
        var currentState = gridFromConsoleInput.serialize();
        stash.push(currentState);
        var hints = gridFromConsoleInput.useBruteForce();
        console.log(`hints = ${JSON.stringify(hints)}`);
        break;
      case "set_color":
        console.log(command);
        color = parseInt(command.numbers.value);
        break;
      case "set_debug":
        gridSetLogLevel(command.qualifier == "on" ? "Debug" : "NOP");
        break;
      case "use_hint":
        var { cellIdx, value } = command;
        if (isNaN(cellIdx) || isNaN(value)) {
          console.log("could not parse hints", command);
        } else {
          cellIdx = inputToCellIdx(cellIdx);
          console.log(`Received hint.  ${cellIdx} = ${value}`);
          hintHistory.push([cellIdx, value]);

          gridFromConsoleInput.setValue(cellIdx, value);
        }
        break;
      case "set_value":
        var { cellIdx, value } = command;
        if (isNaN(cellIdx) || isNaN(value)) {
          console.log("could not parse command", command);
        } else {
          console.log(`Applying.  ${cellIdx} = ${value}`);

          gridFromConsoleInput.setValue(cellIdx, value);
        }
        break;
      case "remove_value":
        var { cellIdx, value } = command;
        if (isNaN(cellIdx) || isNaN(value)) {
          console.log("could not parse command", command);
        } else {
          console.log(`Applying.  ${cellIdx} != ${value}`);

          gridFromConsoleInput.removeCandidate(cellIdx, value);
        }
        break;
      default:
        console.log("¯\\_(ツ)_/¯");
    }

    if (skipStatus.indexOf(commandId) == -1) {
      console.log(
        "Unfilled cells",
        gridFromConsoleInput.unsolvedCount(),
        gridFromConsoleInput.isHalted() ? "Stuck" : ""
      );
    }
  }
})();
