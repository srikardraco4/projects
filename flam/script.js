document.addEventListener('DOMContentLoaded', () => {
    const name1Input = document.getElementById('name1');
    const name2Input = document.getElementById('name2');
    const calculateBtn = document.getElementById('calculateBtn');
    const resultDiv = document.getElementById('result');

    const flames = ['F', 'L', 'A', 'M', 'E', 'S'];
    const relationshipMap = {
        'F': 'Friends',
        'L': 'Love',
        'A': 'Affection',
        'M': 'Marriage',
        'E': 'Enemies',
        'S': 'Siblings'
    };
    const emojiMap = {
        'Friends': '🤝',
        'Love': '❤️',
        'Affection': '😊',
        'Marriage': '💍',
        'Enemies': '😡',
        'Siblings': '🧑‍🤝‍🧑'
    };

    calculateBtn.addEventListener('click', () => {
        let name1 = name1Input.value.toLowerCase().replace(/\s/g, '');
        let name2 = name2Input.value.toLowerCase().replace(/\s/g, '');

        if (!name1 || !name2) {
            resultDiv.innerHTML = 'Please enter both names!';
            return;
        }

        const nameRegex = /^[a-zA-Z]+$/;
        if (!nameRegex.test(name1)) {
            resultDiv.innerHTML = 'Name 1 should only contain alphabetic characters!';
            return;
        }
        if (!nameRegex.test(name2)) {
            resultDiv.innerHTML = 'Name 2 should only contain alphabetic characters!';
            return;
        }

        let name1Arr = name1.split('');
        let name2Arr = name2.split('');

        // Remove common letters
        for (let i = 0; i < name1Arr.length; i++) {
            for (let j = 0; j < name2Arr.length; j++) {
                if (name1Arr[i] === name2Arr[j]) {
                    name1Arr.splice(i, 1);
                    name2Arr.splice(j, 1);
                    i--; // Adjust index after removal
                    break;
                }
            }
        }

        const remainingCount = name1Arr.length + name2Arr.length;

        if (remainingCount === 0) {
            resultDiv.innerHTML = '<span>It\'s complicated!</span>';
            return;
        }

        let currentFlames = [...flames];
        let currentIndex = 0;

        while (currentFlames.length > 1) {
            currentIndex = (currentIndex + remainingCount - 1) % currentFlames.length;
            currentFlames.splice(currentIndex, 1);
        }

        const finalFlamesLetter = currentFlames[0];
        const relationship = relationshipMap[finalFlamesLetter];
        const emoji = emojiMap[relationship];

        resultDiv.innerHTML = `<span>${relationship}</span><span class="emoji">${emoji}</span>`;
    });
});