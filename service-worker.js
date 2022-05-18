self.addEventListener('notificationclose', event => {
    console.log("notification closed", event);
});

self.addEventListener("notificationclick", event => {
    if (event.action === "search") {
        const githubUser = event.notification.data.githubUser;
        clients.openWindow(`https://github.com/${githubUser}`);
    } else if (event.action === "close") {
        clients.openWindow(`https://rebrand.ly/funny-dog`);
    }
    console.log("notification clicked", event.notification.data);

    self.registration.getNotifications()
        .then(ns => ns.forEach(n => n.close()));
});

self.addEventListener("push", event => {
    const transaction = JSON.parse(event.data.text());
    const options = {
        body: transaction.business
    }

    const transactionType = transaction.type === "deposit" ? "+" : "-";

    event.waitUntil(
        clients.matchAll()
            .then(clients => {
                if (clients.length === 0) {
                    self.registration.showNotification(`${transactionType} ${transaction.amount}`, options)
                } else {
                    clients[0].postMessage(transaction);
                }
            })
        
    )
})