const express = require('express');
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors")

const userRoute = require("./routes/userRoute");
const badgeRoute = require("./routes/badgeRoute");
const imageRoute = require("./routes/imageRoute");

const dashboardRoute = require("./routes/dashboardRoute");
const leaderboardRoute = require("./routes/leaderboardRoute");


dotenv.config();

const PORT = process.env.PORT;
const CONNECTION_STRING = process.env.CONNECTION_STRING;

const app = express();

app.use(cors({origin: "*"}));

app.use(express.json());
app.use("/user",userRoute);
app.use("/badge",badgeRoute);
app.use("/image",imageRoute);

app.use("/dashboard", dashboardRoute);
app.use("/leaderboard", leaderboardRoute);

mongoose.connect(CONNECTION_STRING).then(() => {
        console.log("MongoDB connected successfully");
    
    })
    .catch((err) => {
        console.error("MongoDB connection error:", err);
    });

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

/*
DASHBOARD :


*/