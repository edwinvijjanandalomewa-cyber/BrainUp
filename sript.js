const setupForm = document.querySelector("#setup-form");
const questionList = document.querySelector("#question-list");
const setupFeedback = document.querySelector("#setup-feedback");
const setupScreen = document.querySelector("#setup-screen");
const gameScreen = document.querySelector("#game-screen");
const resultScreen = document.querySelector("#result-screen");
const answerForm = document.querySelector("#answer-form");
const answerFeedback = document.querySelector("#answer-feedback");
const countdownBlock = document.querySelector("#countdown-block");
const themeInput = document.querySelector("#quiz-theme");
const themeDisplay = document.querySelector("#theme-display");
const questionTypeInput = document.querySelector("#question-type");
const questionHint = document.querySelector("#question-hint");
const choiceList = document.querySelector("#choice-list");

let questions = [];
let answers = [];
let currentQuestionIndex = 0;
let countdownInterval;
let playerName = "";
let questionType = questionTypeInput.value;

function addQuestionRow(question = "", acceptedAnswers = "", choices = ["", "", "", ""], correctChoice = 0) {
	const row = document.createElement("div");
	row.className = "question-row";
	row.innerHTML = `
		<div class="question-row-heading">
			<span class="question-number"></span>
			<button class="remove-question" type="button">Hapus soal</button>
		</div>
		<div class="question-fields">
			<div>
				<label class="field-label" for="question-input">Teks pertanyaan</label>
				<input class="text-input question-input" type="text" maxlength="180" placeholder="Contoh: Apa warna bendera Indonesia?" required>
			</div>
			<div>
				<label class="field-label" for="accepted-answer-input">Jawaban benar</label>
				<input class="text-input accepted-answer-input" type="text" maxlength="120" placeholder="Contoh: merah putih" required>
			</div>
			<div class="multiple-answer-fields" hidden>
				<span class="field-label">Pilihan jawaban A-D</span>
				<div class="choice-inputs">
					${["A", "B", "C", "D"].map((letter) => `
						<label class="choice-input-label"><span>${letter}</span><input class="text-input choice-input" type="text" maxlength="100" placeholder="Pilihan ${letter}" required></label>
					`).join("")}
				</div>
				<label class="field-label correct-choice-label" for="correct-choice-input">Kunci jawaban</label>
				<select class="text-input correct-choice-input">
					<option value="0">A</option>
					<option value="1">B</option>
					<option value="2">C</option>
					<option value="3">D</option>
				</select>
			</div>
		</div>
	`;
	row.querySelector(".question-input").value = question;
	row.querySelector(".accepted-answer-input").value = acceptedAnswers;
	row.querySelectorAll(".choice-input").forEach((input, index) => {
		input.value = choices[index] || "";
	});
	row.querySelector(".correct-choice-input").value = String(correctChoice);
	questionList.append(row);
	updateQuestionNumbers();
	updateQuestionTypeFields();
}

function updateQuestionNumbers() {
	questionList.querySelectorAll(".question-row").forEach((row, index) => {
		row.querySelector(".question-number").textContent = `PERTANYAAN ${String(index + 1).padStart(2, "0")}`;
		row.querySelector(".question-input").id = `question-input-${index + 1}`;
		row.querySelector(".accepted-answer-input").id = `accepted-answer-input-${index + 1}`;
		row.querySelector("label[for^='question-input']").htmlFor = `question-input-${index + 1}`;
		row.querySelector("label[for^='accepted-answer-input']").htmlFor = `accepted-answer-input-${index + 1}`;
		row.querySelector(".correct-choice-input").id = `correct-choice-input-${index + 1}`;
		row.querySelector(".correct-choice-label").htmlFor = `correct-choice-input-${index + 1}`;
	});
}

function updateQuestionTypeFields() {
	questionType = questionTypeInput.value;
	const isMultipleChoice = questionType === "multiple";
	questionHint.textContent = isMultipleChoice
		? "Isi empat pilihan, lalu pilih kunci jawaban yang benar."
		: "Tulis jawaban alternatif dengan pemisah koma.";

	questionList.querySelectorAll(".question-row").forEach((row) => {
		const shortAnswerField = row.querySelector(".accepted-answer-input");
		const multipleChoiceFields = row.querySelector(".multiple-answer-fields");
		shortAnswerField.closest("div").hidden = isMultipleChoice;
		shortAnswerField.required = !isMultipleChoice;
		multipleChoiceFields.hidden = !isMultipleChoice;
		row.querySelectorAll(".choice-input").forEach((input) => {
			input.required = isMultipleChoice;
		});
	});
}

function showScreen(screen) {
	setupScreen.hidden = screen !== setupScreen;
	gameScreen.hidden = screen !== gameScreen;
	resultScreen.hidden = screen !== resultScreen;
}

function normalizeAnswer(value) {
	return value.trim().toLocaleLowerCase("id-ID").replace(/\s+/g, " ");
}

function startGame() {
	answers = [];
	currentQuestionIndex = 0;
	document.querySelector("#player-label").textContent = playerName;
	showScreen(gameScreen);
	showQuestion();
}

function showQuestion() {
	window.clearInterval(countdownInterval);
	const question = questions[currentQuestionIndex];
	const questionNumber = currentQuestionIndex + 1;
	document.querySelector("#question-progress").textContent = `SOAL ${questionNumber} DARI ${questions.length}`;
	document.querySelector("#progress-fill").style.width = `${(currentQuestionIndex / questions.length) * 100}%`;
	document.querySelector("#game-question").textContent = question.text;
	document.querySelector("#countdown-number").textContent = "5";
	countdownBlock.hidden = false;
	answerForm.hidden = true;
	choiceList.hidden = true;
	choiceList.replaceChildren();
	answerFeedback.hidden = true;
	answerForm.reset();

	let remainingSeconds = 5;
	countdownInterval = window.setInterval(() => {
		remainingSeconds -= 1;
		document.querySelector("#countdown-number").textContent = String(remainingSeconds);
		if (remainingSeconds === 0) {
			window.clearInterval(countdownInterval);
			countdownBlock.hidden = true;
			if (questionType === "multiple") {
				showChoices(question);
			} else {
				answerForm.hidden = false;
				document.querySelector("#player-answer").focus();
			}
		}
	}, 1000);
}

function showChoices(question) {
	choiceList.replaceChildren();
	question.choices.forEach((choice, index) => {
		const button = document.createElement("button");
		button.className = "choice-button";
		button.type = "button";
		button.dataset.choiceIndex = String(index);
		button.innerHTML = `<span class="choice-letter">${String.fromCharCode(65 + index)}</span><span></span>`;
		button.querySelector("span:last-child").textContent = choice;
		choiceList.append(button);
	});
	choiceList.hidden = false;
}

function submitAnswer(submitted, isCorrect) {
	const question = questions[currentQuestionIndex];
	answers.push({ ...question, submitted, isCorrect });

	const feedbackMessage = document.querySelector("#feedback-message");
	feedbackMessage.textContent = isCorrect ? "Benar!" : "Belum tepat.";
	feedbackMessage.classList.toggle("is-wrong", !isCorrect);
	document.querySelector("#correct-answer").textContent = `Jawaban benar: ${question.acceptedAnswers.join(", ")}`;
	answerForm.hidden = true;
	choiceList.hidden = true;
	answerFeedback.hidden = false;
	document.querySelector("#continue-button").innerHTML = currentQuestionIndex === questions.length - 1
		? "Lihat skor <span aria-hidden=\"true\">-&gt;</span>"
		: "Soal berikutnya <span aria-hidden=\"true\">-&gt;</span>";
}

function showResults() {
	window.clearInterval(countdownInterval);
	const correctCount = answers.filter((answer) => answer.isCorrect).length;
	document.querySelector("#result-player").textContent = playerName;
	document.querySelector("#score-fraction").textContent = `${correctCount}/${questions.length}`;
	document.querySelector("#score-percent").textContent = `${Math.round((correctCount / questions.length) * 100)}%`;
	document.querySelector("#progress-fill").style.width = "100%";

	const review = document.querySelector("#result-review");
	review.replaceChildren();
	answers.forEach((answer, index) => {
		const item = document.createElement("article");
		item.className = answer.isCorrect ? "review-item is-correct" : "review-item is-wrong";

		const question = document.createElement("p");
		question.className = "review-question";
		question.textContent = `${index + 1}. ${answer.question}`;

		const submitted = document.createElement("p");
		submitted.className = "review-answer";
		submitted.textContent = `Jawabanmu: ${answer.submitted || "(kosong)"}`;

		const expected = document.createElement("p");
		expected.className = "review-answer";
		expected.textContent = `Jawaban benar: ${answer.acceptedAnswers.join(", ")}`;

		item.append(question, submitted, expected);
		review.append(item);
	});
	showScreen(resultScreen);
}

document.querySelector("#add-question").addEventListener("click", () => {
	addQuestionRow();
	setupFeedback.hidden = true;
	questionList.lastElementChild.querySelector(".question-input").focus();
});

questionList.addEventListener("click", (event) => {
	if (!event.target.matches(".remove-question")) return;
	event.target.closest(".question-row").remove();
	updateQuestionNumbers();
});

setupForm.addEventListener("submit", (event) => {
	event.preventDefault();
	const rows = [...questionList.querySelectorAll(".question-row")];
	if (rows.length === 0) {
		setupFeedback.textContent = "Tambahkan minimal satu pertanyaan sebelum memulai.";
		setupFeedback.hidden = false;
		return;
	}

	const nextQuestions = rows.map((row) => {
		const text = row.querySelector(".question-input").value.trim();
		if (questionType === "multiple") {
			const choices = [...row.querySelectorAll(".choice-input")].map((input) => input.value.trim());
			const correctChoice = Number(row.querySelector(".correct-choice-input").value);
			return { text, choices, correctChoice, acceptedAnswers: [choices[correctChoice]] };
		}
		const acceptedAnswers = row.querySelector(".accepted-answer-input").value
			.split(",")
			.map((answer) => answer.trim())
			.filter(Boolean);
		return { text, acceptedAnswers };
	});
	const hasInvalidQuestion = nextQuestions.some((question) => !question.text || question.acceptedAnswers.some((answer) => !answer)
		|| (questionType === "multiple" && question.choices.length !== 4));
	if (hasInvalidQuestion) {
		setupFeedback.textContent = questionType === "multiple"
			? "Isi teks soal dan keempat pilihan jawaban untuk setiap soal."
			: "Isi setiap pertanyaan dan minimal satu jawaban yang benar.";
		setupFeedback.hidden = false;
		return;
	}

	questions = nextQuestions;
	playerName = document.querySelector("#player-name").value.trim();
	setupFeedback.hidden = true;
	startGame();
});

answerForm.addEventListener("submit", (event) => {
	event.preventDefault();
	const question = questions[currentQuestionIndex];
	const submitted = document.querySelector("#player-answer").value.trim();
	const isCorrect = question.acceptedAnswers.some((answer) => normalizeAnswer(answer) === normalizeAnswer(submitted));
	submitAnswer(submitted, isCorrect);
});

choiceList.addEventListener("click", (event) => {
	const button = event.target.closest(".choice-button");
	if (!button) return;
	const question = questions[currentQuestionIndex];
	const choiceIndex = Number(button.dataset.choiceIndex);
	const letter = String.fromCharCode(65 + choiceIndex);
	submitAnswer(`${letter}. ${question.choices[choiceIndex]}`, choiceIndex === question.correctChoice);
});

document.querySelector("#continue-button").addEventListener("click", () => {
	if (currentQuestionIndex === questions.length - 1) {
		showResults();
		return;
	}
	currentQuestionIndex += 1;
	showQuestion();
});

document.querySelector("#play-again").addEventListener("click", startGame);
document.querySelector("#edit-game").addEventListener("click", () => showScreen(setupScreen));

themeInput.addEventListener("input", () => {
	themeDisplay.textContent = themeInput.value.trim() || "Tema belum ditentukan";
});

questionTypeInput.addEventListener("change", updateQuestionTypeFields);

addQuestionRow();
