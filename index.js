const express = require('express');
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const userRoute = require("./routes/userRoute");
const badgeRoute = require("./routes/badgeRoute");
const imageRoute = require("./routes/imageRoute");
const cors = require("cors")

dotenv.config();

const PORT = process.env.PORT;
const CONNECTION_STRING = process.env.CONNECTION_STRING;

const app = express();

app.use(cors({origin: "*"}));

app.use(express.json());
app.use("/user",userRoute);
app.use("/badge",badgeRoute);
app.use("/image",imageRoute);


mongoose.connect(CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
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