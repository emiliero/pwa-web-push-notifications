const express = require("express");
const cors = require("cors");
const publisher = require("./publisher");
const app = express();
const port = 3000;

app.use(express.json());

app.use(cors());

const subscribers = new Map();

app.post("/addSubscriber", function(req, res) {
    const pushSubscription = req.body;
    const id = pushSubscription.keys.auth;

    subscribers.set(id, pushSubscription);
    console.log(`New subscriber added. Total subscribers: ${subscribers.size}`);
    res.send("OK!");
});

app.post("/removeSubscriber", function(req, res) {
    const id = req.body.subscription;

    subscribers.delete(id);
    console.log(`Subscriber unsubscribed. Total subscribers: ${subscribers.size}`);
    res.send("OK!");
});

setInterval(() => publisher.notify(subscribers), 5000) // Notify subscribers every 5 seconds

app.listen(port, () => console.log(`Server App is running at http://localhost:${port}`));