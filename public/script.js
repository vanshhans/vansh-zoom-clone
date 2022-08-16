const socket = io('/');
const videoGrid = document.querySelector("#video-grid");
const myVideo = document.createElement("video");
let peer = new Peer(undefined, {
    path: "/peerjs",
    host: "/",
    port: "443"
});
myVideo.muted = true;

let myVideoStream;
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    peer.on("call", (call) => {
        console.log("hello");
        call.answer(stream);
        const video = document.createElement("video");
        call.on("stream", (userVideoStream) => {
            addVideoStream(video, userVideoStream);
        });
    });

    socket.on("user-connected", (userID) => {
        connectToNewUser(userID, stream);
    });
});

peer.on("open", (id) => {
    socket.emit("join-room", roomID, id);
})


const connectToNewUser = (userID, stream) => {
    const call = peer.call(userID, stream);
    const video = document.createElement("video");
    call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
    });
    console.log(userID);
}

const addVideoStream = (video, stream) => {
    video.srcObject = stream;
    video.addEventListener("canplay", () => {
        video.play();
    });
    videoGrid.append(video);
}

let msg = document.querySelector("#chat-message");

msg.addEventListener("keydown", (e) => {
    if (e.key == "Enter" && msg.value.length != 0) {
        socket.emit("message", msg.value);
        msg.value = "";
    }
})

socket.on("createMessage", (message) => {
    const ul = document.querySelector("ul");
    ul.innerHTML += `<li class="message"><b>USER</b><br>${message}</li>`;
    document.querySelector(".main__chat_window").scrollTop = ul.scrollHeight;
})

document.querySelector(".main__mute_button").addEventListener("click", () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false;
        setUnmuteButton();
    } else {
        myVideoStream.getAudioTracks()[0].enabled = true;
        setMuteButton();
    }
})

const setMuteButton = () => {
    const html = `
        <i style="display:flex;  flex-direction:column; justify-content:center; align-items: center; "  class="fas fa-microphone"</i> 
        <span style="font-weight:500; padding-top:4px; font-size:17px; display:flex;  flex-direction:column; justify-content:center; align-items: center;">Mute</span>
    `
    document.querySelector(".main__mute_button").innerHTML = html;
}

const setUnmuteButton = () => {
    const html = `
        <i style="display:flex;  flex-direction:column; justify-content:center; align-items: center; " class="unmute fas fa-microphone-slash"</i> 
        <span style="font-weight:500; padding-top:4px;  font-size:17px; display:flex; flex-direction:column; justify-content:center; align-items: center;">Unmute</span>
    `
    document.querySelector(".main__mute_button").innerHTML = html;
}

document.querySelector(".main__video_button").addEventListener("click", () => {
    const enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false;
        setPlayVideo();
    } else {
        myVideoStream.getVideoTracks()[0].enabled = true;
        setStopVideo();
    }
})

const setStopVideo = () => {
    const html = `
        <i style="display:flex;  flex-direction:column; justify-content:center; align-items: center; "  class="fas fa-video"</i> 
        <span style="font-weight:500; padding-top:4px; font-size:17px; display:flex;  flex-direction:column; justify-content:center; align-items: center;">Stop Video</span>
    `
    document.querySelector(".main__video_button").innerHTML = html;
}

const setPlayVideo = () => {
    const html = `
        <i style="display:flex;  flex-direction:column; justify-content:center; align-items: center; " class="unmute fas fa-video-slash"</i> 
        <span style="font-weight:500; padding-top:4px;  font-size:17px; display:flex; flex-direction:column; justify-content:center; align-items: center;">Play Video</span>
    `
    document.querySelector(".main__video_button").innerHTML = html;
}