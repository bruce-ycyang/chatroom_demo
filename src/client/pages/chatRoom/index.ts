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

clientIo.emit("join", { userName, roomName });

const textInput = document.getElementById("textInput") as HTMLInputElement;
const submitBtn = document.getElementById("submitBtn") as HTMLButtonElement;
const chatBoard = document.getElementById("chatBoard") as HTMLDivElement;
const headerRoomName = document.getElementById("headerRoomName") as HTMLParagraphElement;
const backBtn = document.getElementById("backBtn") as HTMLButtonElement;

headerRoomName.innerText = roomName || " - ";

function msgHandler(msg: string) {
  const divBox = document.createElement("div");
  divBox.classList.add("flex", "justify-end", "mb-4", "items-end");
  divBox.innerHTML = `
  <p class="text-xs text-gray-700 mr-4">00:00</p>
  <div>
    <p class="text-xs text-white mb-1 text-right">Bruce</p>
    <p
      class="mx-w-[50%] break-all bg-white px-4 py-2 rounded-bl-full rounded-br-full rounded-tl-full"
    >
      ${msg}
    </p>
  </div>
  `;
  chatBoard.appendChild(divBox);
  textInput.value = "";
  chatBoard.scrollTop = chatBoard.scrollHeight;
}

function roomMsgHandler(msg: string) {
  const divBox = document.createElement("div");
  divBox.classList.add("flex", "justify-center", "mb-4", "items-center");
  divBox.innerHTML = `<p class="text-gray-700 text-sm">${msg}</p>`;
  chatBoard.appendChild(divBox);
  chatBoard.scrollTop = chatBoard.scrollHeight;
}

submitBtn.addEventListener("click", () => {
  const textValue = textInput.value;
  //chat event
  clientIo.emit("chat", textValue);
});

backBtn.addEventListener("click", () => {
  location.href = "/main/main.html";
});

//監測連接
clientIo.on("join", (msg) => {
  console.log("msg", msg);
  roomMsgHandler(msg);
});

clientIo.on("chat", (msg) => {
  msgHandler(msg);
});

clientIo.on("leave", (msg) => {
  roomMsgHandler(msg);
});
