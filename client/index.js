const client = (() => {
    let serviceWorkerRegObj = undefined;
    const notificationButton = document.getElementById("btn-notify");
    const pushButton = document.getElementById("btn-push");
    const pushNotification = document.getElementById("push-notification");
    let isUserSubscribed = false;

    const showNotificationButton = () => {
        notificationButton.style.display = "block";
        notificationButton.addEventListener("click", showNotification)
    }

    const notifyInApp = (transaction) => {
        const html = `<div>
            <div>Amount     :   <b>${transaction.amount}</b></div>
            <div>Business   :   <b>${transaction.business}</b></div>
            <div>Name       :   <b>${transaction.name}</b></div>
            <div>Type       :   <b>${transaction.type}</b></div>
            <div>Account    :   <b>${transaction.account}</b></div>
        </div>`;

        pushNotification.style.display = `flex`;
        pushNotification.innerHTML = html;
    }

    let count = 1;
    const showNotification = () => {
        const simpleTextNotification = reg => reg.showNotification("My first notification");

        const customizedNotification = reg => {
            const options = {
                body: "This is an important body!",
                icon: "imgs/notification.png",
                tag: "group-1",
                actions: [
                    {action: "search", title: "Try searching"},
                    {action: "close", title: "Forget it!"},
                ],
                data: {
                    notificationTime: Date.now(),
                    githubUser: "emiliero",
                }
            }
            reg.showNotification("Second Notification - " + count++, options)
        }

        navigator.serviceWorker.getRegistration()
            .then(registration => customizedNotification(registration));
    }

    const checkNotificationSupport = () => {
        if (!('Notification' in window)) {
            return Promise.reject("The browser doesn@t support notifications.")
        }

        console.log("The browser supports notifications!")
        return Promise.resolve("Ok!")
    }

    const registerServiceWorker = () => {
        if (!('serviceWorker') in navigator) {
            return Promise.reject("ServiceWorker support is not available.")
        }

        return navigator.serviceWorker.register('service-worker.js')
            .then(regObj => {
                console.log("service worker is registered successfully!")
                serviceWorkerRegObj = regObj;
                showNotificationButton();

                serviceWorkerRegObj.pushManager.getSubscription()
                    .then(subs => {
                        if (subs) disablePushNotificationButton()
                        else enablePushNotificationButton()
                    });

                navigator.serviceWorker.addEventListener("message", e => notifyInApp(e.data));
            });
    }

    const requestNotificationPermissions = () => {
        return Notification.requestPermission(status => {
            console.log("Notification Permission Status:", status)
        });
    }

    checkNotificationSupport()
        .then(registerServiceWorker)
        .then(requestNotificationPermissions)
        .catch(err => console.error(err));

    const disablePushNotificationButton = () => {
        isUserSubscribed = true;
        pushButton.innerText = "DISABLE PUSH NOTIFICATIONS";
        pushButton.style.backgroundColor = "#EA9085";
    }

    const enablePushNotificationButton = () => {
        isUserSubscribed = false;
        pushButton.innerText = "ENABLE PUSH NOTIFICATIONS";
        pushButton.style.backgroundColor = "#EFB1FF";
    }

    const setupPush = () => {
        function url864ToUint8Array(url) {
            const padding = '='.repeat((4 - url.length % 4) % 4);
            const base64 = (url + padding).replace(/\-/g, '+').replace(/_/g, '/');

            const rawData = window.atob(base64);
            const outputArray = new Uint8Array(rawData.length);

            for (let i = 0; i < rawData.length; i++) {
                outputArray[i] = rawData.charCodeAt(i);
            }
            return outputArray;
        }

        const subscribeWithServer = (subscription) => {
            return fetch('http://localhost:3000/addSubscriber', {
                method: 'POST',
                body: JSON.stringify(subscription),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }

        const subscribeUser = () => {
            const appServerPublicKey = "BMMZ-619ACjxnbh1fwAPYsrAtEXPZ8YyoIGPHyqGfU7iTYTg45RWjKPzorG1_wP1WW5Y9SkEm4lHUyJv4wg5pHw";
            const publicKeyAsArray = url864ToUint8Array(appServerPublicKey);

            serviceWorkerRegObj.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: publicKeyAsArray
            }).then(subscription => {
                console.log(JSON.stringify(subscription, null, 4));
                subscribeWithServer(subscription);
                disablePushNotificationButton();
            }).catch(error => console.error("Failed to ubscribe to Push Service", error))
        }

        const unsubscribeWithServer = (subscription) => {
            return fetch('http://localhost:3000/removeSubscriber', {
                method: 'POST',
                body: JSON.stringify({subscription}),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }

        const unSubscribeUser = () => {
            console.log("un-subscribing user")
            serviceWorkerRegObj.pushManager.getSubscription()
                .then(subscription => {
                    let subAsString = JSON.stringify(subscription);
                    let subAsObject = JSON.parse(subAsString);
                    unsubscribeWithServer(subAsObject.keys.auth);
                    return subscription.unsubscribe();
                })
                .then(enablePushNotificationButton())
                .catch(error => console.error("Failed ot unsubscribe from Push Service", error))
        }

        pushButton.addEventListener("click", () => {
            if (isUserSubscribed) unSubscribeUser();
            else subscribeUser(); 
        })
    }
    setupPush();
})();