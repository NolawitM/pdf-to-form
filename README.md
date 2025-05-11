**PDF Quiz App**

A simple, static web application that lets users upload a PDF containing multiple-choice questions and renders an in-page, Google-Form–style quiz interface entirely on the client side—no server or backend required.

Features

PDF Parsing: Extracts text from uploaded PDFs using PDF.js.

Question Parsing: Uses regex to identify question text, options, and correct answers (**Answer: x**).

In-Page Quiz UI: Dynamically builds a styled HTML quiz interface with radio-button options.

Automatic Grading: Calculates and displays the user’s score and per-question feedback immediately upon submission.

etting Started

**Clone or download the repository to your machine.**

-- Open index.html in your browser.

-- Upload a PDF file containing numbered multiple-choice questions formatted like:

1. Question text here?
A. Option 1
B. Option 2
C. Option 3
D. Option 4
**Answer: B**
-- Take the quiz: select answers and click Submit.

-- View your score and detailed feedback directly under the quiz.



**License**

This project is released under the MIT License. Feel free to use, modify, and distribute!
