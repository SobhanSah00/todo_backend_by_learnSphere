import express from "express";
import cors from "cors"
import cookieParser from "cookie-parser";

const app = express();

app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true
    })
);

app.get("/", (req, res) => {
    res.send("yaa the todo backend is running")
})

app.use(express.json({ limit: "16mb" }))
app.use(express.urlencoded({ extended: true, limit: "16mb" }))
app.use(express.static("public"))
app.use(cookieParser());

// route imports

import TodoRouter from "./routes/Todo.route.js"

// declaration

app.use("/api/v1/todos",TodoRouter)

export {
    app
}