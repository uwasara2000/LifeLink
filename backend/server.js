const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();


// ==============================
// MIDDLEWARE
// ==============================

app.use(cors());
app.use(express.json());

// Prevent stale JS file caching during development
app.use((req, res, next) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    next();
});

// Serve frontend static files
app.use(express.static(path.join(__dirname, "../frontend")));


// ==============================
// TEST ROUTE
// ==============================

app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "LifeLink Backend API is running",
        timestamp: new Date().toISOString()
    });
});


// ==============================
// SERVER
// ==============================

const PORT = 5000;

app.listen(PORT, () => {

    console.log(
        `LifeLink Backend running on http://localhost:${PORT}`
    );

});