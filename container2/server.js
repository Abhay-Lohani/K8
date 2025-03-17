const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(bodyParser.json());

const STORAGE_PATH = '/yourname_PV_dir';

if (!fs.existsSync(STORAGE_PATH)) {
    fs.mkdirSync(STORAGE_PATH, { recursive: true });
}

// API to Process File Data
app.post('/process-file', (req, res) => {
    const { file, product } = req.body;

    if (!file || !product) {
        return res.status(400).json({ file: null, error: "Invalid JSON input." });
    }

    const filePath = path.join(STORAGE_PATH, file);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ file, error: "File not found." });
    }

    const fileData = fs.readFileSync(filePath, 'utf8');
    const lines = fileData.trim().split("\n").slice(1);
    let sum = 0;

    for (let line of lines) {
        const [prod, amount] = line.split(",");
        if (prod.trim() === product.trim()) {
            sum += parseInt(amount.trim(), 10);
        }
    }

    return res.status(200).json({ file, sum });
});

const PORT = 8080;
app.listen(PORT, () => console.log(`Container 2 running on port ${PORT}`));
