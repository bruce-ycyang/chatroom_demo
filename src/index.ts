import devServer from "@/server/dev";
import prodServer from "@/server/prod";
import express from "express";
import { Server } from "socket.io";
import https from "http";
import UserService from "@/sevice/userService";
import moment from "moment";

const port = 3000;
const app = express();
const server = https.createServer(app);
const io = new Server(server);
const userService = new UserService();

//監測連接
io.on("connection", (socket) => {
  socket.emit("userID", socket.id);

  socket.on("join", ({ userName, roomName }: { userName: string; roomName: string }) => {
    const userData = userService.userDataInfoHandler(socket.id, userName, roomName);

    //建立特定房間名稱socket
    socket.join(userData.roomName);

    userService.addUser(userData);

    socket.broadcast.to(userData.roomName).emit("join", `${userName} 加入了 ${roomName} 聊天室`);
  });

  socket.on("chat", (msg) => {
    //後端接到，發回前端
    const time = moment.utc();
    const userData = userService.getUser(socket.id);
    if (userData) {
      io.to(userData.roomName).emit("chat", { userData, msg, time });
    }
  });
  // disconnet , socket 斷開連線事件
  socket.on("disconnect", () => {
    const userData = userService.getUser(socket.id);
    const userName = userData?.userName;
    if (userName) {
      socket.broadcast.to(userData.roomName).emit("leave", `${userData?.userName} 離開聊天室`);
    }
    userService.removeUser(socket.id);
  });
});

// 執行npm run dev本地開發 or 執行npm run start部署後啟動線上伺服器
if (process.env.NODE_ENV === "development") {
  devServer(app);
} else {
  prodServer(app);
}

server.listen(port, () => {
  console.log(`The application is running on port ${port}.`);
});
