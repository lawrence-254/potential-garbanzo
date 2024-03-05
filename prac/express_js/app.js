#!/usr/bin/env node
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

//middlewares
app.use(express.json());

//path to json
const usersFilePath = path.join(__dirname, 'data', 'users.json');

//routes

//all users route
app.get('/users', (req, res) => {
    fs.readFile(usersFilePath, (err, data) => {
        if (err) {
            return res.status(500).json({ error: "internal server error" });
        }
        const users = JSON.parse(data);
        res.json(users);
    });
});

//add user route
app.post('/users', (req, res) => {
    const newUser = req.body;
    fs.readFile(usersFilePath, (err, data) => {
        if (err) {
            return res.status(500).json({ error: "internal server error" });
        }
        const users = JSON.parse(data);
        users.push(newUser);
        fs.writeFile(usersFilePath, JSON.stringify(users), err => {
            if (err) {
                return res.status(500).json({ error: "internal server error" });
            }
            res.json(newUser);
        });
    })
});

//start the server

app.listen(port, () => {
    console.log(`hello xpress from port ${port}`);
})

