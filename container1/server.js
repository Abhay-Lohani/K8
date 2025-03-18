const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

const STORAGE_PATH = '/yourname_PV_dir';

if (!fs.existsSync(STORAGE_PATH)) {
    fs.mkdirSync(STORAGE_PATH, { recursive: true });
}

// API to Store a File
app.post('/store-file', (req, res) => {
    const { file, data } = req.body;

    if (!file || !data) {
        return res.status(400).json({ file: null, error: "Invalid JSON input." });
    }

    const filePath = path.join(STORAGE_PATH, file);

    fs.writeFile(filePath, data, (err) => {
        if (err) {
            return res.status(500).json({ file, error: "Error storing the file." });
        }
        return res.status(200).json({ file, message: "Success." });
    });
});

// API to Send File Data to Container 2//this is test by abhay
app.post('/calculate', async (req, res) => {
    const { file, product } = req.body;

    if (!file || !product) {
        return res.status(400).json({ error: "Invalid JSON input." });
    }

    const filePath = path.join(STORAGE_PATH, file);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ file, error: "File not found." });
    }

    const fileData = fs.readFileSync(filePath, 'utf8');
    
    try {
        const response = await axios.post('http://container2-service:8080/process-file', { file, product });

        // Check if sum exists in response
        if (response.data.sum !== undefined) {
            return res.status(200).json(response.data);
        } else {
            return res.status(500).json({ error: "Error processing file. Sum not calculated." });
        }
    } catch (error) {
        return res.status(500).json({ error: "Error communicating with Container 2." });
    }
});


const PORT = 80;
app.listen(PORT, () => console.log(`Container 1 running on port ${PORT}`));
