import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { exec } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 8080;

const MIME_TYPES = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "application/javascript",
    ".json": "application/json",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".ico": "image/x-icon"
};

const server = http.createServer((req, res) => {
    let filePath = path.join(__dirname, req.url === "/" ? "index.html" : req.url.split("?")[0]);
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === "ENOENT") {
                res.writeHead(404, { "Content-Type": "text/plain" });
                res.end("404 Not Found");
            } else {
                res.writeHead(500, { "Content-Type": "text/plain" });
                res.end(`Server Error: ${err.code}`);
            }
        } else {
            res.writeHead(200, {
                "Content-Type": contentType,
                "Cache-Control": "no-cache"
            });
            res.end(content, "utf-8");
        }
    });
});

server.listen(PORT, () => {
    const url = `http://localhost:${PORT}`;
    console.log(`\n🌼 POOKALAM.EXE local server running at: ${url}`);
    console.log(`Press Ctrl+C to stop.\n`);

    // Auto-open browser on Windows
    const startCmd = process.platform === "win32" ? `start ${url}` : `open ${url}`;
    exec(startCmd, (err) => {
        if (err) {
            console.log(`Open in browser: ${url}`);
        }
    });
});
