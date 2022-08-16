const express = require("express");
const {
    v4: uuidv4
} = require("uuid");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const {
    ExpressPeerServer
} = require("peer");
const peerServer = ExpressPeerServer(server, {
    debug: true
});


app.set("view engine", "ejs");
app.use(express.static("public"));
app.use("/peerjs", peerServer);

app.get("/", (req, res) => {
    res.redirect(`/${uuidv4()}`);
});

app.get("/:roomID", (req, res) => {
    const roomId = req.params.roomID;
    res.render("room", {
        roomId
    });
})

io.on("connection", (socket) => {
    socket.on("join-room", (roomID, userID) => {
        socket.join(roomID);
        socket.to(roomID).emit("user-connected", userID);

        socket.on("message", (message) => {
            io.to(roomID).emit("createMessage", message);
        })
    });
})

server.listen(process.env.PORT || 3000);