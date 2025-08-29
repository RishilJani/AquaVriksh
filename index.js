const express = require('express');
const mongoose = require('mongoose');
const dotenv =  require("dotenv");

dotenv.config();
const PORT = process.env.PORT;
const CONNECTION_STRING = process.env.CONNECTION_STRING;

const app = express();

app.listen(PORT, ()=>{
    console.log("Server is running");
});