document.addEventListener('DOMContentLoaded', () => {
    const name1Input = document.getElementById('name1');
    const name2Input = document.getElementById('name2');
    const calculateBtn = document.getElementById('calculateBtn');
    const resultText = document.getElementById('resultText');
    const messageText = document.getElementById('messageText');
    const resultContainer = document.querySelector('.result-container');

    const messages = [
        "A match made in heaven! 😇",
        "Sparks are flying! 🔥",
        "Quite compatible, indeed! 😊",
        "A decent connection! 👍",
        "Room for growth! 🌱",
        "Opposites attract, sometimes! 😉",
        "Interesting combination! 🤔",
        "Maybe try again? 😅",
        "A unique pairing! ✨",
        "Destiny awaits! 💫"
    ];

    calculateBtn.addEventListener('click', () => {
        const name1 = name1Input.value.trim();
        const name2 = name2Input.value.trim();

        if (name1 === '' || name2 === '') {
            alert('Please enter both names!');
            return;
        }

        // Simple algorithm: sum of character codes modulo 100
        let score = 0;
        for (let i = 0; i < name1.length; i++) {
            score += name1.charCodeAt(i);
        }
        for (let i = 0; i < name2.length; i++) {
            score += name2.charCodeAt(i);
        }

        score = (score % 101); // Ensure score is between 0 and 100

        resultText.textContent = `${score}%`;
        messageText.textContent = messages[Math.floor(score / 10)]; // Map score to a message

        resultContainer.classList.add('show');
    });
});