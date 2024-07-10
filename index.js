import express from "express";
import axios from "axios";
import bodyParser from "body-parser";

const app = express();
const port = 3000;
const API_URL = "https://the-trivia-api.com/v2/questions";

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const QUESTIONS_NUMBER = 10;
let data = undefined;
let correctAnswer = 0;
let validation = "";
let score = 0;
let questionCounter = 0;
let category = "";
let difficulty = "";

app.get("/", async (req, res) => {
    res.render("index.ejs", {});
});

async function checkData(){
  if (data == undefined){
    data = await getData();
  } 
}

async function getData() {
  try {
    const URL = createURL();
    const result = await axios.get(URL);
    return result.data;
  } catch (error) {
    data = undefined;
  }
}

app.get('/error', (req, res) => {
  res.render("error.ejs", {});
});


function createURL(){
  let url = API_URL;
  if (category != '' || difficulty != ''){
    url = url.concat('?')
  }
  if(category != ''){
    url = url.concat('categories=').concat(category).concat('&');
  }
  if(difficulty != ''){
    url = url.concat('difficulties=').concat(difficulty);
  }
  return url;
}

function shuffle(array) {
  let currentIndex = array.length;

  while (currentIndex != 0) {

    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
}

function checkGameEnd(){
  if (questionCounter >= QUESTIONS_NUMBER){ 
    questionCounter = 0;
    data = undefined;
    return true;
  }
  return false;
}

function resetGameParameters(){
  score = 0;
  questionCounter = 0;
  data = undefined;
}

app.post('/settings', (req, res) => {
  resetGameParameters();
  category = req.body.category;
  difficulty = req.body.difficulty;
  res.redirect('/quiz')
});

app.get('/home', (req, res) => {
  resetGameParameters();
  category = "";
  difficulty = "";
  res.redirect('/')
});

app.get("/quiz", async (req, res) => {
  await checkData();
  if (data == undefined){res.redirect('/error')}else{
      if (checkGameEnd()){res.redirect('/result');}else{
        let question = data[questionCounter].question.text;
        let answers = [];
        let correctAnswerText = data[questionCounter].correctAnswer;
        answers.push(data[questionCounter].correctAnswer)
        data[questionCounter].incorrectAnswers.forEach(answer => {
          answers.push(answer);
        });
        shuffle(answers);
        res.render("quiz.ejs", { question: question, 
          ans1: answers[0],
          ans2: answers[1],
          ans3: answers[2],
          ans4: answers[3],
          response: validation, 
          score: score,
          counter: questionCounter + 1
        });
          correctAnswer = answers.findIndex((ans) => ans == correctAnswerText) + 1;
      }
    }
});

app.post("/get-press", (req, res) => {
  const btnPressed = parseInt(req.body.button);
  if (btnPressed == correctAnswer){
    validation = true;
    score += 1;
  }else{
    validation = false;
  }
  res.json({ 
    validation: validation,
    correct: data[questionCounter].correctAnswer
   });
   questionCounter += 1;
});

app.post("/next", (req, res) => {
  res.redirect('/quiz');
});

function calculateScore(){
  let points = score;
  switch(difficulty) {
    case "easy":
      points *= 1;
      break;
    case "hard":
      points *= 3;
      break;
    default:
      points *= 2;
  }
  return points;
}

app.get("/result", (req, res) => {
  let points = calculateScore();
  res.render("result.ejs", {
    points: points,
    correctAnswers: score
  });
  score = 0;
});

app.listen(process.env.PORT || port, () => {
  console.log(`Server is running on port ${port}`);
});
