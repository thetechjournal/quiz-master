//Element locators Quiz-Setting section
const userName = document.getElementById('name');
const userNameDisplay = document.getElementById('user-name');
const category = document.getElementById('select-category');
const quantity = document.getElementById('quantity');
const difficulty = document.getElementById('difficulty');
const btnStart = document.getElementById('btn-start');
const sectionSettings = document.getElementById('settings');

//Element locators Quiz-Question section
const quiz = document.getElementById('quiz');
const loader = document.getElementById('loader');
const sectionQuestion = document.getElementById('questions');
const question = document.getElementById('question');
const choices = Array.from(document.getElementsByClassName('choice-text'));
const scoreText = document.getElementById('score');
const questionCounterText = document.getElementById('question-counter');
const progressBarIndicator =  document.getElementById('progressBarIndicator');

//Element locators Quiz-Result section
const btnRestart = document.getElementById('btn-restart');
const sectionResult = document.getElementById('result');
const finishScore = document.getElementById('finish-score');
const imgFinish = document.getElementById('img-finish');

// /////////////////// Variables /////////////// //
let score = 0;
let questionCounter = 0;
let totalQuestion = 5;
let questions = [];
let currentQuestion = {};
let availableQuesions = [];
let acceptingAnswers = false;
const CORRECT_BONUS = 10;

// /////////////////// Event Listeners /////////////// //
let quizSettingsForm = document.getElementById("quiz-settings")
quizSettingsForm.addEventListener("submit", event => {

    event.preventDefault()
    totalQuestion = quantity.value;
    sectionSettings.style.display = "none"
    sectionQuestion.style.display = "block"
    getQuestions();
})

btnRestart.addEventListener('click', function() {
    quantity.value = 5;
    sectionResult.style.display = "none";
    sectionSettings.style.display = "block"

})

// /////////////////////// Functions ///////////////////// //

startGame = () => {
    questionCounter = 0;
    score = 0;
    availableQuesions = [...questions];
    getNewQuestion();
    scoreText.innerText = score;
    loader.style.display = "none";
    quiz.style.display = "block";
}

getNewQuestion = () => {
    if (availableQuesions.length === 0 || questionCounter >= totalQuestion) {
            sectionQuestion.style.display = "none";
            userNameDisplay.innerText = userName.value ? userName.value: "Guest";
            if(score/totalQuestion*10 <= 50) {
                finishScore.innerText = `${score} out of ${totalQuestion*10}. 
                Your score is less than 50%`;
                imgFinish.src = "./images/sorry.gif"
            } 
            else {
                finishScore.innerText = `${score} out of ${totalQuestion*10} 
                Your score is more than 50%`;
                imgFinish.src = "./images/congrats1.gif"
            }
            sectionResult.style.display = "block"
            return;
        
    }
    questionCounter++;
    questionCounterText.innerText = `${questionCounter}/${totalQuestion}`;

    progressBarIndicator.style.width = `${(questionCounter/totalQuestion * 100)}%`

    const random = Math.floor(Math.random() * availableQuesions.length);
    currentQuestion = availableQuesions[random]
    question.textContent = currentQuestion.question;
    choices.forEach(choice => {
        const number = choice.dataset['number'];
        choice.innerText = currentQuestion['choice'+number];
    })
    availableQuesions.splice(random, 1); //remove the question that has already been displayed to the user
    acceptingAnswers = true;
}

choices.forEach(choice => {
    choice.addEventListener('click', function(e) {
        if (!acceptingAnswers) return;
            acceptingAnswers = false;
            const selectedChoice = e.target;

            const classToApply = currentQuestion.answer == selectedChoice.dataset['number'] ? "correct" : "incorrect";


        if (classToApply === "correct") {
        incrementScore(CORRECT_BONUS);
        }

        selectedChoice.parentElement.classList.add(classToApply);
        let answer = document.getElementById('answer')
        if (classToApply === "incorrect") {

            if(currentQuestion.answer == 1) {
                answer.innerText = "A"
            } else if(currentQuestion.answer == 2) {
                answer.innerText = "B"
            } else if(currentQuestion.answer == 3) {
                answer.innerText = "C" 
            } else answer.innerText = "D" 
            document.getElementById('correct-answer').style.display = "block"
            }

        setTimeout(() => {
            selectedChoice.parentElement.classList.remove(classToApply);
            document.getElementById('correct-answer').style.display = "none"
            getNewQuestion();
          }, 3000);
        });
})



incrementScore = num => {
    score += num;
    scoreText.innerText = score;
  };

async function getQuestions() {

    let quizCategory = {
        "General Knowledge" : 9,
        "Computer" : 18,
        "History" : 23,
        "Video Games" : 15,
    }
    
    let selectedCategory = quizCategory[category.value];
    let difficultyLevel = (difficulty.value).toLowerCase();

    const url = `https://opentdb.com/api.php?amount=${totalQuestion}&category=${selectedCategory}&difficulty=${difficultyLevel}&type=multiple`;

    let response = await fetch(url)
    let data = await response.json()

    questions = data.results.map(result => {
        let strQuestion = result.question;
        let formattedQuestion = "";
        formattedQuestion = {
            question: strQuestion
        }
        
        if(strQuestion.includes('&#039;')){ //This is to replace symbols returened in question by API
            let formattedStr = "";
            formattedStr = strQuestion.replace(/&#039;/g, "'");
            formattedQuestion = {
                question: formattedStr
            }
        }        
        const answerChoices = [...result.incorrect_answers];
        formattedQuestion.answer = Math.floor(Math.random() * 3) + 1;

        // console.log('Answer', result.correct_answer)

        answerChoices.splice(
            formattedQuestion.answer -1,
            0,
            result.correct_answer
        )

        answerChoices.forEach((choice, index) => {
            formattedQuestion["choice"+(index + 1)] = choice;
        });

        // console.log('questions: ', formattedQuestion);
        return formattedQuestion;
    })
    startGame();
}



