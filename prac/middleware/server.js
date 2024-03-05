const express = requires('express');

const app = express();
const port = 3000;

app.get('/', (req, res)) => {
    res.send('Home_page');
};

app.get('/dashboard', (req, res)) => {
    res.send('dashboard');
};