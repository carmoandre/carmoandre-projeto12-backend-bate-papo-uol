import express from "express";
import cors from "cors";
import dayjs from "dayjs";

const server = express();
server.use(cors());
server.use(express.json());
console.log("server is running!");

let participants = [{ name: "João", lastStatus: 12313123 }];
let messages = [
    {
        from: "João",
        to: "Todos",
        text: "oi galera",
        type: "message",
        time: "20:04:37",
    },
];

server.post("/participants", (req, res) => {
    const body = req.body;
    if (isNameInvalid(body.name)) {
        res.sendStatus(400);
    } else {
        participants.push({ ...body, lastStatus: Date.now() });
        messages.push(entranceMessage(body.name));
        res.sendStatus(200);
    }
});

server.get("/participants", (req, res) => {
    res.send(participants);
});

server.post("/messages", (req, res) => {
    const body = { ...req.body, from: req.headers.user };
    console.log(body);

    if (isMessageInvalid(body)) {
        res.sendStatus(400);
    } else {
        messages.push({
            ...body,
            time: dayjs().locale("pt-br").format("HH:mm:ss"),
        });
        res.sendStatus(200);
    }
});

server.get("/messages", (req, res) => {
    const limit = parseInt(req.query.limit);
    const user = req.headers.user;
    const userMessages = messages.filter(
        (message) =>
            message.from === user ||
            message.to === user ||
            message.to === "Todos" ||
            message.type === "message"
    );
    if (limit) {
        res.send(userMessages.slice(-limit));
    } else {
        res.send(userMessages);
    }
});

server.post("/status", (req, res) => {
    const user = req.headers.user;
    if (participants.find((participant) => participant.name === user)) {
        participants.forEach((participant) =>
            participant.name === user
                ? (participant.lastStatus = Date.now())
                : null
        );
        res.sendStatus(200);
    } else {
        res.sendStatus(400);
    }
});

server.listen(4000);

function isNameInvalid(name) {
    return name === "" || participants.find((user) => user.name === name);
}

function entranceMessage(author) {
    return {
        from: author,
        to: "Todos",
        text: "entra na sala...",
        type: "status",
        time: dayjs().locale("pt-br").format("HH:mm:ss"),
    };
}

function isMessageInvalid(body) {
    return (
        body.to === "" &&
        body.text === "" &&
        (body.type !== "message" || body.type !== "private_message") &&
        participants.find((user) => user.name === body.from)
    );
}

setInterval(activityVerifier, 15000);

function activityVerifier() {
    console.log("Ta funcionando a função");
    participants.forEach((participant) => {
        if (Date.now() - participant.lastStatus > 10) {
            console.log(`${participant.name} vai sair`);
            messages.push(outgoingMessage(participant.name));
            participants = participants.filter(
                (user) => user.name !== participant.name
            );
        }
    });
}

function outgoingMessage(author) {
    return {
        from: author,
        to: "Todos",
        text: "saí na sala...",
        type: "status",
        time: dayjs().locale("pt-br").format("HH:mm:ss"),
    };
}
