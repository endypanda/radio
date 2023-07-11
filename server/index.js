import express from 'express';
import http from 'http';
import {Server as IOServer} from "socket.io";
import player from "./player";

const PORT = 8000;
const app = express();
const server = http.createServer(app);
const io = new IOServer(server);

(async () => {
    await player.loadTracks("tracks");
    player.play()

    io.on("connection", (socket) => {
        console.log("New listener connected");

        // Every new streamer must receive the header
        if (player.bufferHeader) {
            socket.emit("bufferHeader", player.bufferHeader);
        }

        socket.on("bufferHeader", (header) => {
            player.bufferHeader = header;
            socket.broadcast.emit("bufferHeader", player.bufferHeader);
        });

        socket.on("stream", (packet) => {
            // Only broadcast microphone if a header has been received
            if (!player.bufferHeader) return;

            // Audio stream from host microphone
            socket.broadcast.emit("stream", packet);
        });

        socket.on("control", (command) => {
            switch (command) {
                case "pause":
                    player.pause();
                    break;
                case "resume":
                    player.resume();
                    break;
            }
        });
    })

    server.listen(PORT, (req, res) => {
        console.log(`listening ${PORT}`)
    })

    app.get('/stream', (req, res) => {
        const { id, client } = player.addClient();

        res.set({
            "Content-Type": "audio/mp3",
            "Transfer-Encoding": "chunked",
        }).status(200);

        client.pipe(res);

        req.on("close", () => {
            queue.removeClient(id);
        });
        res.status(200).json({Message: "Success"})
    })
})()