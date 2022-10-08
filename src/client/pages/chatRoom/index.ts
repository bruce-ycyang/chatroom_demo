import "./index.css";
import { name } from "@/utils";
import { io } from "socket.io-client";

const url = new URL(location.href);
const userName = url.searchParams.get("user_name");
const roomName = url.searchParams.get("room_name");

if (!userName || !roomName) {
  location.href = "/main/main.html";
}

//1. 建立連接 -> node server
const clientIo = io();

const textInput = document.getElementById("textInput") as HTMLInputElement;
const submitBtn = document.getElementById("submitBtn") as HTMLButtonElement;

submitBtn.addEventListener("click", () => {
  const textValue = textInput.value;
  //chat event
  clientIo.emit("chat", textValue);
});

//監測連接
clientIo.on("join", (msg) => {
  console.log("msg", msg);
});

clientIo.on("chat", (msg) => {
  console.log("client", msg);
});
