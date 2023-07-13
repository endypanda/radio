import { Play, Pause } from "react-feather";
import { Socket } from "socket.io-client";

const buttonClassName =
    "rounded-lg border-gray-200 bg-slate-700 hover:bg-slate-600 px-6 py-2";

const MusicControls = ({socket}:{ socket: Socket }) => {
    const execCommand = (command: string) => {
        socket.emit("control", command);
    };

    return (
        <div className="flex flex-col justify-center items-center w-full mt-8">
            <div className="flex flex-row justify-center space-x-3">
                <button
                    type="button"
                    onClick={() => execCommand("resume")}
                    className={buttonClassName}
                >
                    <Play size={28} />
                </button>
                <button
                    type="button"
                    onClick={() => execCommand("pause")}
                    className={buttonClassName}
                >
                    <Pause size={28} />
                </button>
            </div>
        </div>
    );
}
export default MusicControls