let db;

const request = indexedDB.open("budget", 1);

request.onupgradeneeded = event => {
    db = event.target.result;
    const store = db.createObjectStore("pending", { keyPath: "name", autoincrement: true });
};

request.onsuccess = event => {
    db = event.target.result;

    if (navigator.onLine) {
        checkDatabase();
    }
};

request.onerror = event => {
    console.log(event.target.errorCode)
};

function checkDatabase() {
    const transaction = db.transaction(["pending"], 'readwrite');
    const store = transaction.objectStore("pending");
    const getAllTrans = store.getAll();

    getAllTrans.onsuccess = function () {
        if (getAllTrans.result.length > 0) {
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAllTrans.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                }
            })
                .then(response => response.json())
                .then(() => {
                    const transaction = db.transaction(["pending"], "readwrite");
                    const store = transaction.objectStore("pending");
                    store.clear();
                });
        }
    };
};

function saveRecord(record) {
    console.log("RECORD:", record)
    const transaction = db.transaction(["pending"], "readwrite");
    const store = transaction.objectStore("pending");
    store.add(record);
};

// listen for app coming back online
window.addEventListener("online", checkDatabase);