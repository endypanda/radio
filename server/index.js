import express from 'express';
import http from 'http';
import {Server as IOServer} from "socket.io";

const PORT = 8000;
const app = express();
const server = http.createServer(app);
const io = new IOServer(server);

(async () => {
    io.on("connection", (socket) => {
        console.log('connected io')
    })
    server.listen(PORT, (req, res) => {
        console.log(`listening ${PORT}`)
    })
    app.get('/stream', (req, res) => {
        res.status(200).json({Message: "Success"})
    })
})()