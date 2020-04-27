const request = budgetDB.open("budget", 1);
let db;
tx;
store;

request.onupgradeneeded = function (e) {
    const db = event.target.result;
    db.createObjectStore("pending", { autoIncrement: true });
};

request.onerror = function (e) {
    console.log("error");
};

request.onsuccess = function (e) {
    db = event.target.result;

    if (navigator.onLine) {
        checkDatabase();
    }

};

function saveRecord(record) {
    tx = db.transaction(["pending"], "readwrite");
    store = tx.objectStore("pending");

    store.add(record);
}

function checkDatabase() {
    tx = db.transaction(["pending"], "readwrite");
    store = tx.objectStore("pending");
    getAll = store.getAll();

    getAll.onsuccess = function () {
        if (getAll.result.length > 0) {
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                }
            }).then(response => response.json()).then(() => {
                tx = db.transaction(["pending"], "readwrite");
                store = transaction.objectStore("pending");
                store.clear();
            });
        };
    };
};

window.addEventListener("online", checkDatabase);