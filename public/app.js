//AKfycbx11SEADXZK-SpNeSgqfsEir277sTa4oUfCS7b-11KnGWe88wIcsXI2r98JSAZ5GkbkeQ

// app.js

// Tell pdf.js where its worker script lives:
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.12.313/pdf.worker.min.js";

// parseQuestions (unchanged)
function parseQuestions(text) {
  const questions = [];
  const blocks = text.split(/\s*(?:\d{1,3})\.\s+/).filter(Boolean);

  blocks.forEach((block) => {
    const optionRegex = /([a-dA-D])\.\s*(.*?)(?=\s+[a-dA-D]\.|$)/gs;
    const qtMatch = block.match(/^(.*?)(?=\s+[a-dA-D]\.)/s);
    const ansMatch = block.match(/\*\*Answer:\s*([a-d])\*\*/i);
    const questionText = qtMatch ? qtMatch[1].trim() : "";
    const options = [];
    const seen = new Set();

    for (const m of block.matchAll(optionRegex)) {
      const label = m[1].toLowerCase();
      let txt = m[2]
        .replace(/\s+/g, " ")
        .trim()
        .replace(/\*\*Answer:\s*[a-d]\*\*/i, "")
        .trim();
      if (!seen.has(label)) {
        options.push({ label, text: txt });
        seen.add(label);
      }
    }

    if (questionText && options.length === 4) {
      questions.push({
        question: questionText,
        options,
        correct: ansMatch ? ansMatch[1].toLowerCase() : null,
      });
    }
  });

  return questions;
}

// Extract, parse, and render form
document.getElementById("pdf-upload").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file || file.type !== "application/pdf") {
    return alert("Please upload a valid PDF file.");
  }

  document.getElementById("output").innerText = "Reading PDF…";
  const reader = new FileReader();
  reader.onload = async () => {
    const arr = new Uint8Array(reader.result);
    const pdf = await pdfjsLib.getDocument(arr).promise;

    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const txt = await page.getTextContent();
      text += txt.items.map((it) => it.str).join(" ") + "\n";
    }

    const questions = parseQuestions(text);
    renderForm(questions);
  };
  reader.readAsArrayBuffer(file);
});

// Render the quiz and grade on submit
function renderForm(questions) {
  const container = document.getElementById("form-container");
  container.innerHTML = ""; // clear
  document.getElementById("output").innerText = "";

  const formEl = document.createElement("form");
  questions.forEach((q, i) => {
    const wrapper = document.createElement("div");
    wrapper.className = "question";

    const p = document.createElement("p");
    p.innerText = `${i + 1}. ${q.question}`;
    wrapper.appendChild(p);

    const optsDiv = document.createElement("div");
    optsDiv.className = "options";

    q.options.forEach((opt) => {
      const label = document.createElement("label");
      const input = document.createElement("input");
      input.type = "radio";
      input.name = `q${i}`;
      input.value = opt.label;
      label.appendChild(input);
      label.appendChild(document.createTextNode(` ${opt.label}. ${opt.text}`));
      optsDiv.appendChild(label);
    });

    wrapper.appendChild(optsDiv);
    formEl.appendChild(wrapper);
  });

  // Submit button
  const btn = document.createElement("button");
  btn.type = "submit";
  btn.id = "submit-btn";
  btn.innerText = "Submit";
  formEl.appendChild(btn);

  // Grading handler
  formEl.addEventListener("submit", (e) => {
    e.preventDefault();
    let correctCount = 0;
    const feedback = [];

    questions.forEach((q, i) => {
      const selected = formEl.querySelector(`input[name="q${i}"]:checked`);
      const answer = selected ? selected.value : null;
      const isCorrect = answer === q.correct;
      if (isCorrect) correctCount++;

      feedback.push({
        question: q.question,
        selected: answer,
        correct: q.correct,
        result: isCorrect ? "Correct" : "Wrong",
      });
    });

    // Display score + detailed feedback
    const out = document.getElementById("output");
    out.innerHTML = `<strong>Your score: ${correctCount} / ${questions.length}</strong>\n\n`;
    feedback.forEach((f, idx) => {
      out.innerHTML +=
        `${idx + 1}. ${f.question}\n` +
        `Your answer: ${f.selected || "None"} — ${f.result}` +
        (f.result === "Wrong" ? ` (correct: ${f.correct})` : "") +
        "\n\n";
    });
  });

  container.appendChild(formEl);
}
