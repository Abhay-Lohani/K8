// const express = require('express');
// const bodyParser = require('body-parser');
// const fs = require('fs');
// const path = require('path');

// const app = express();
// app.use(bodyParser.json());

// const STORAGE_PATH = '/yourname_PV_dir';  // Directory for storing files

// // Ensure the storage path exists
// if (!fs.existsSync(STORAGE_PATH)) {
//     fs.mkdirSync(STORAGE_PATH, { recursive: true });
// }

// // API to Process File Data
// app.post('/process-file', (req, res) => {
//     const { file, product } = req.body;
  
//     if (!file || !product) {
//       return res.status(400).json({ file: null, error: "Invalid JSON input." });
//     }
  
//     const filePath = path.join(STORAGE_PATH, file);
//     if (!fs.existsSync(filePath)) {
//       return res.status(404).json({ file, error: "File not found." });
//     }
  
//     const fileData = fs.readFileSync(filePath, 'utf8');
//     const lines = fileData.trim().split("\n");
  
//     // There must be at least a header and one data line.
//     if (lines.length < 2) {
//       return res.status(400).json({ file, error: "Input file not in CSV format." });
//     }
  
//     // Validate header - allow "product, amount" or "product,amount" (case-insensitive)
//     const header = lines[0].trim().toLowerCase();
//     if (header !== "product, amount" && header !== "product,amount") {
//       return res.status(400).json({ file, error: "Input file not in CSV format." });
//     }
  
//     let sum = 0;
//     try {
//       // Process each data row (skip header)
//       for (let i = 1; i < lines.length; i++) {
//         const line = lines[i].trim();
//         if (!line) continue; // skip empty lines
//         const parts = line.split(",");
//         // There should be exactly 2 parts per line.
//         if (parts.length !== 2) {
//           return res.status(400).json({ file, error: "Input file not in CSV format." });
//         }
//         const [prod, amount] = parts;
//         // Compare products (trimmed)
//         if (prod.trim() === product.trim()) {
//           const num = parseInt(amount.trim(), 10);
//           if (isNaN(num)) {
//             return res.status(400).json({ file, error: "Input file not in CSV format." });
//           }
//           sum += num;
//         }
//       }
//     } catch (error) {
//       return res.status(400).json({ file, error: "Input file not in CSV format." });
//     }
//     return res.status(200).json({ file, sum });
//   });
  

// // Start the server on port 8080
// const PORT = 8080;
// app.listen(PORT, () => console.log(`Container 2 running on port ${PORT}`));


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
        return res.status(400).json({ error: "Invalid JSON input." });
    }

    const filePath = path.join(STORAGE_PATH, file);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ file, error: "File not found." });
    }

    const fileData = fs.readFileSync(filePath, 'utf8');

    // Check if the file format is CSV (simple check for commas)
    if (!fileData.includes(',')) {
        return res.status(400).json({ error: "Input file not in CSV format." });
    }

    // Split by new line and process each line
    const lines = fileData.trim().split("\n").slice(1); // Skip the header
    let sum = 0;

    for (let line of lines) {
        const [prod, amount] = line.split(",");
        if (prod && amount) {
            if (prod.trim() === product.trim()) {
                sum += parseInt(amount.trim(), 10);
            }
        }
    }

    // Return sum or error if not found
    if (sum === 0) {
        return res.status(400).json({ error: `Product '${product}' not found in the file.` });
    }

    return res.status(200).json({ file, sum });
});

const PORT = 8080;
app.listen(PORT, () => console.log(`Container 2 running on port ${PORT}`));
