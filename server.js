const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 3000;

const WINDOW_SIZE = 10;
const API_URL = 'http://20.244.56.144/numbers/';
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzE0MDQ3MTIzLCJpYXQiOjE3MTQwNDY4MjMsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6ImFkYjRkNzFmLTRkMmEtNGQ2Zi1hZTBkLTdhNjg0NDljODZlNCIsInN1YiI6ImUyMWNzZXUwNzYzM0BiZW5uZXR0LmVkdS5pbiJ9LCJjb21wYW55TmFtZSI6InNpZFN0b3JlIiwiY2xpZW50SUQiOiJhZGI0ZDcxZi00ZDJhLTRkNmYtYWUwZC03YTY4NDQ5Yzg2ZTQiLCJjbGllbnRTZWNyZXQiOiJma0xxZGZlT2p6THllTU5WIiwib3duZXJOYW1lIjoic2lkZGhhayIsIm93bmVyRW1haWwiOiJlMjFjc2V1MDc2MzNAYmVubmV0dC5lZHUuaW4iLCJyb2xsTm8iOiJFMjFDU0VVMDc2MyJ9.PvNxghll1DH5ALKtZinxmi6mPQaXjnPCfxoC7jNTzYo'; 

let numbersBuffer = [];
let lastRequestTime = Date.now();


function authorize(req, res, next) {
    const authToken = req.headers.authorization;
    if (authToken !== AUTH_TOKEN) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    next();
}

async function fetchNumbers(numberId) {
    try {
        const response = await axios.get(API_URL + numberId);
        if (response.status === 200) {
            lastRequestTime = Date.now();
            console.log(response.data);
            return response.data;
        }
        return null;
    } catch (error) {
        console.error('Error fetching numbers:', error.message);
        return null;
    }
}

function calculateAverage(numbers) {
    if (numbers.length === 0) return null;
    const sum = numbers.reduce((acc, curr) => acc + curr, 0);
    return parseFloat((sum / numbers.length).toFixed(2)); // Fixed to two decimal places
}


app.use(express.json());

app.get('/numbers/:numberId', authorize, async (req, res) => {
    const { numberId } = req.params;
    
 
    if (Date.now() - lastRequestTime > 500) {
        res.status(500).json({ error: 'Request took too long' });
        return;
    }

   
    const numbers = await fetchNumbers(numberId);
    if (!numbers) {
        res.status(500).json({ error: 'Failed to fetch numbers' });
        return;
    }
  
    numbers.forEach((num) => {
        if (!numbersBuffer.includes(num)) {
            numbersBuffer.push(num);
        }
    });

    while (numbersBuffer.length > WINDOW_SIZE) {
        numbersBuffer.shift();
    }

    const average = calculateAverage(numbersBuffer);

    const response = {
        windowPrevState: [...numbersBuffer],
        windowCurrState: [...numbersBuffer, ...numbers], 
        numbers: [...numbersBuffer, ...numbers],
        avg: average
    };

    res.json(response);
    console.log(response);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
