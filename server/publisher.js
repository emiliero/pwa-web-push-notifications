const webPush = require('web-push');
const faker = require("faker");

const pushSubscription = {
    "endpoint": "https://fcm.googleapis.com/fcm/send/dsccc62mf_0:APA91bEdPVhx67XiIwt0xh9WrnRuaWnKW0mXSahkWUhGm5PA6BVOpno9G875EQvIE0cqEvcmde9auwQD3CXiEopAsm_qef4dZXwZ93Msc8pxCg1GJE3pfPIqEQCegv67ojCG1eoVzxd9",
    "expirationTime": null,
    "keys": {
        "p256dh": "BPQ6YCs_vvythFh_zbhOtYfy2Yg7O_YjkF3v00CwdOQOW1roOjTIOEEN_kQoGlARJahiImlJgHtTiiypqnkVUiM",
        "auth": "IG9A-c69_HV8S_nMECk16w"
    }
};

const vapidPublicKey = "BMMZ-619ACjxnbh1fwAPYsrAtEXPZ8YyoIGPHyqGfU7iTYTg45RWjKPzorG1_wP1WW5Y9SkEm4lHUyJv4wg5pHw";
const vapidPrivateKey = "HNvnI1VV6WlN5OIK1rQ6M9jlZep-9SeTyYDup-KnIvM";

const options = {
    TTL: 60,
    vapidDetails: {
        subject: "mailto: pusher@pushy.com",
        publicKey: vapidPublicKey,
        privateKey: vapidPrivateKey
    }
};

const notify = (subscribers) => {
    const transaction = faker.helpers.createTransaction();

    if (subscribers.size < 1) {
        console.log("No subscribers to notify");
        return;
    }

    subscribers.forEach((subscriber, id) => {
        webPush.sendNotification(subscriber, JSON.stringify(transaction), options)
            .then(() => console.log(`${subscribers.size} subscribers notified`))
            .catch(error => console.error("Error in pushing notification", error))
    });
}

module.exports = {
    notify: notify
}