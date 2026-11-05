
let nameList = [];
let minutesList = [];
let pointsList = [];
let reboundsList = [];
let assistsList = [];
let blocksList = [];
let stealsList = [];
let fieldGoalList = [];
let threePointList = [];

let textIds = [
    "MPtext",
    "PTStext",
    "TRBtext",
    "ASTtext",
    "BLKtext",
    "STLtext",
    "FGtext"
];

let statLabels = ["MP", "PTS", "TRB", "AST", "BLK", "STL", "FG%"];

let dataLists = [];

let correctAnswer = "";
let counter = 0;
let canClick = true;

document.addEventListener("DOMContentLoaded", async () => {
    try {
        let response = await fetch("data.csv");

        if (!response.ok) {
            throw new Error("Could not load data.csv");
        }

        let csvText = await response.text();

        parseCSV(csvText);

        if (nameList.length < 4) {
            throw new Error("Your CSV needs at least four players.");
        }

        initializeApp();

    } catch (error) {
        console.error("Error loading data:", error);
    }
});

function parseCSV(text) {
    let lines = text.trim().split(/\r?\n/);
    let headers = lines[0].split(",").map(h => h.trim());

    for (let i = 1; i < lines.length; i++) {
        let row = lines[i].split(",").map(val => val.trim());

        if (row.length < headers.length) continue;

        nameList.push(row[headers.indexOf("Player")]);
        minutesList.push(row[headers.indexOf("MP")]);
        pointsList.push(row[headers.indexOf("PTS")]);
        reboundsList.push(row[headers.indexOf("TRB")]);
        assistsList.push(row[headers.indexOf("AST")]);
        blocksList.push(row[headers.indexOf("BLK")]);
        stealsList.push(row[headers.indexOf("STL")]);
        fieldGoalList.push(row[headers.indexOf("FG%")]);
        threePointList.push(row[headers.indexOf("3P%")]);
    }

    dataLists = [
        minutesList,
        pointsList,
        reboundsList,
        assistsList,
        blocksList,
        stealsList,
        fieldGoalList
    ];
}

function initializeApp() {

    function setScreen(screenId) {
        document.querySelectorAll(".screen").forEach(screen => {
            screen.style.display = "none";
        });

        document.getElementById(screenId).style.display = "block";
    }

    function randomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function question(correctIndex) {
        correctAnswer = nameList[correctIndex];

        document.getElementById("nicework1").style.display = "none";
        document.getElementById("tryagain1").style.display = "none";

        // Restore entire legend
        document.getElementById("legend").style.display = "grid";

        // Display first seven statistics
        for (let i = 0; i < textIds.length; i++) {
            document.getElementById(textIds[i]).innerText =
                statLabels[i] + "\n" + dataLists[i][correctIndex];
        }

        // Update 3P% value without extra newline
        document.getElementById("threePvalue").innerText =
            threePointList[correctIndex];

        // Generate four answer choices
        let used = [correctIndex];
        let choices = [correctAnswer];

        while (choices.length < 4) {
            let r = randomNumber(0, nameList.length - 1);

            if (!used.includes(r)) {
                used.push(r);
                choices.push(nameList[r]);
            }
        }

        choices.sort(() => Math.random() - 0.5);

        let buttons = ["player1", "player2", "player3", "player4"];

        for (let j = 0; j < buttons.length; j++) {
            document.getElementById(buttons[j]).innerText = choices[j];
        }
    }

    function checkAnswer(buttonId) {
        if (!canClick) return;

        let selectedText = document.getElementById(buttonId).innerText;

        if (selectedText === correctAnswer) {
            rightButton();
        } else {
            wrongButton();
        }
    }

    function wrongButton() {
        document.getElementById("tryagain1").style.display = "block";

        // Hide entire legend, including KEY heading
        document.getElementById("legend").style.display = "none";
    }

    function rightButton() {
        if (counter < 1) {
            canClick = false;

            document.getElementById("nicework1").style.display = "block";

            // Hide entire legend
            document.getElementById("legend").style.display = "none";

            document.getElementById("tryagain1").style.display = "none";

            setTimeout(() => {
                let newIndex = randomNumber(0, nameList.length - 1);

                question(newIndex);

                canClick = true;
            }, 2000);

            counter++;

        } else {
            setScreen("end");
        }
    }

    document.getElementById("startButton").addEventListener("click", () => {
        counter = 0;
        canClick = true;

        setScreen("question1");

        question(randomNumber(0, nameList.length - 1));
    });

    ["player1", "player2", "player3", "player4"].forEach(btnId => {
        document.getElementById(btnId).addEventListener("click", () => {
            checkAnswer(btnId);
        });
    });
}
