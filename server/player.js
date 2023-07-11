import {readdir} from "fs/promises";
import {extname, join} from "path";
import {ffprobe} from "@dropb/ffprobe";
import ffprobeStatic from "ffprobe-static";

ffprobe.path = ffprobeStatic.path;

class Player {
    constructor() {
        this.clients = new Map();
        this.tracks = [];
    }

    async getTrackBitrate(filepath) {
        const data = await ffprobe(filepath);
        const bitrate = data?.format?.bit_rate;

        return bitrate ? parseInt(bitrate) : 128000;
    }

    async loadTracks(dir) {
        let filenames = await readdir(dir);
        filenames = filenames.filter((filename) => extname(filename) === '.mp3');

        const files = filenames.map((filename) => join(dir, filename));
        const promises = files.map(async filepath => {
            const bitrate = await this.getTrackBitrate(filepath)

            return {filepath, bitrate}
        });

        this.tracks = await Promise.all(promises);
    }

    broadcast(chunk) {
        this.clients.forEach((client) => {
            client.write(chunk);
        })
    }

    getNextTrack() {
        if (this.index >= this.tracks.length - 1) {
            this.index = 0;
        }

        const track = this.tracks[this.index++];
        this.currentTrack = track;
        return track;
    }

    loadTrackStream() {
        const track = this.currentTrack;
        if (!track) return;

        console.log("Starting audio stream");
        this.stream = createReadStream(track.filepath);
    }

    async start() {
        const track = this.currentTrack;
        if (!track) return;

        this.playing = true;
        this.throttle = new Throttle(track.bitrate / 8);

        this.stream
            .pipe(this.throttle)
            .on("data", (chunk) => this.broadcast(chunk))
            .on("end", () => this.play(true))
            .on("error", () => this.play(true));
    }

    play(useNewTrack = false) {
        if (useNewTrack || !this.currentTrack) {
            console.log("Playing new track");
            this.getNextTrack();
            this.loadTrackStream();
            this.start();
        } else {
            this.resume();
        }
    }

    resume() {
        if (!this.started() || this.playing) return;
        this.start();
    }

    pause() {
        if (!this.started() || !this.playing) return;
        this.playing = false;
        this.throttle.removeAllListeners("end");
        this.throttle.end();
    }

    started() {
        return this.stream && this.throttle && this.currentTrack;
    }

}

const player = new Player();
export default player;