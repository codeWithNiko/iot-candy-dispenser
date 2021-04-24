let fetch = require('node-fetch');

const getRandomQuestion = () => {
    return fetch("https://opentdb.com/api.php?amount=1", { timeout: 3000 })
        .then(res => res.json())
        .then(body => {
            let question = body.results[0].question;
            let answers = body.results[0].incorrect_answers;
            let correctAnswer = body.results[0].correct_answer;
            answers.push(correctAnswer);
            answers = shuffle(answers);
            return { question, answers, correctAnswer }
        })
}
const shuffle = (a) => {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

exports.getRandomQuestion = getRandomQuestion;