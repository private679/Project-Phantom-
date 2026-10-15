const boot = document.getElementById("boot");
const app = document.getElementById("app");
const progressBar = document.getElementById("progressBar");
const bootText = document.getElementById("bootText");

let progress = 0;

const bootMessages = [
  "INITIALIZING SYSTEM...",
  "LOADING PHANTOM CORE...",
  "ESTABLISHING CONNECTION...",
  "SYSTEM READY."
];

const bootTimer = setInterval(() => {
  progress += 2;

  if (progressBar) {
    progressBar.style.width = progress + "%";
  }

  if (progress === 20) bootText.textContent = bootMessages[1];
  if (progress === 50) bootText.textContent = bootMessages[2];
  if (progress === 80) bootText.textContent = bootMessages[3];

  if (progress >= 100) {
    clearInterval(bootTimer);
    boot.style.display = "none";
    app.classList.remove("hidden");
  }
}, 40);

const output = document.getElementById("output");
const commandInput = document.getElementById("command");
const orb = document.getElementById("orb");
const aiStatus = document.getElementById("aiStatus");

// PHANTOM VOICE
function speak(message) {
  if (!("speechSynthesis" in window)) {
    print("Voice output is not supported by this browser.");
    return;
  }

  window.speechSynthesis.cancel();

  const speech = new SpeechSynthesisUtterance(message);
  const voices = window.speechSynthesis.getVoices();

  const maleVoice = voices.find(v =>
    /male|david|mark|daniel|james|alex|fred/i.test(v.name)
  );

  if (maleVoice) {
    speech.voice = maleVoice;
  }

  speech.pitch = 0.72;
  speech.rate = 0.88;
  speech.volume = 1;

  window.speechSynthesis.speak(speech);
}

function print(message) {
  if (!output) return;

  const line = document.createElement("p");
  line.textContent = "> " + message;
  output.appendChild(line);
  output.scrollTop = output.scrollHeight;
}

// PHANTOM PERSONALITY
async function respond(message) {
  try {
    print("PHANTOM: Thinking, Operator...");

    const response = await fetch(
      "https://project-phantom-3ao7.vercel.app/api/chat",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Connection failed");
    }

    print("PHANTOM: " + data.reply);
    speak(data.reply);
    return data.reply;

  } catch (error) {
    print("PHANTOM: My AI connection failed, Operator.");
    return "Connection failed.";
  }
}
// TERMINAL COMMANDS
function runCommand(value) {
  const command = value.trim().toLowerCase();

  if (!command) return;

  print(command);

  switch (command) {
    case "help":
      print("Commands: help, about, scan, secret, time, clear, hello");
      break;

    case "about":
      print("PHANTOM OS: Your futuristic digital companion.");
      break;

    case "scan":
      print("Scanning...");
      setTimeout(() => print("Scan complete. Interface operational."), 600);
      break;

    case "secret":
      print("SECRET PROTOCOL UNLOCKED. Welcome, Operator.");
      break;

    case "time":
      print(new Date().toLocaleTimeString());
      break;

    case "hello":
      respond("hello");
      break;

    case "clear":
      output.replaceChildren();
      print("Terminal cleared.");
      return;

    default:
      respond(command);
  }
}

if (document.getElementById("commandForm")) {
  document.getElementById("commandForm").addEventListener("submit", event => {
    event.preventDefault();
    runCommand(commandInput.value);
    commandInput.value = "";
  });
}

document.querySelectorAll("[data-cmd]").forEach(button => {
  button.addEventListener("click", () => {
    runCommand(button.dataset.cmd);
  });
});

// AI ORB
function activateAI() {
  orb.classList.add("active");
  aiStatus.textContent = "PHANTOM AWAKE";

  speak("I am online, Operator. How can I assist you?");

  print("Phantom activated.");

  setTimeout(() => {
    orb.classList.remove("active");
    aiStatus.textContent = "PHANTOM AI STANDBY";
  }, 3000);
}

if (orb) {
  orb.addEventListener("click", activateAI);
}

// VOICE INPUT
const voiceBtn = document.getElementById("voiceBtn");

if (voiceBtn) {
  voiceBtn.addEventListener("click", () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      print("Voice recognition is unavailable in this browser.");
      speak("Please try a browser that supports voice recognition.");
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    aiStatus.textContent = "LISTENING...";

    recognition.onresult = event => {
      const spoken = event.results[0][0].transcript;

      print("YOU: " + spoken);
      respond(spoken);

      aiStatus.textContent = "PHANTOM AI STANDBY";
    };

    recognition.onerror = () => {
      aiStatus.textContent = "PHANTOM AI STANDBY";
      print("Microphone error. Check browser permissions.");
    };

    recognition.onend = () => {
      if (aiStatus.textContent === "LISTENING...") {
        aiStatus.textContent = "PHANTOM AI STANDBY";
      }
    };

    try {
      recognition.start();
    } catch (error) {
      print("Could not start microphone. Please try again.");
    }
  });
}

// LIVE CLOCK
function updateClock() {
  const clock = document.getElementById("clock");

  if (clock) {
    clock.textContent = new Date().toLocaleTimeString();
  }
}

updateClock();
setInterval(updateClock, 1000);
