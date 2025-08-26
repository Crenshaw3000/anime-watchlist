import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, onChildAdded, onChildRemoved, remove } from "firebase/database";

const appSettings = {
    databaseURL: "https://anime-watchlist-ca002-default-rtdb.firebaseio.com/",
};

const app = initializeApp(appSettings);
const database = getDatabase(app);
const animeListInDB = ref(database, "animeList");

document.addEventListener("DOMContentLoaded", function () {
    const addButton = document.getElementById("addButton");
    const inputFieldEl = document.getElementById("input-field");
    const animeListEl = document.getElementById("anime-list");

    if (!addButton || !inputFieldEl || !animeListEl) {
        console.error("Required HTML elements not found!");
        return;
    }

    function addAnime() {
        let inputValue = inputFieldEl.value.trim();
        if (!inputValue) return;

        addButton.disabled = true;
        addButton.textContent = "Adding...";

        push(animeListInDB, inputValue)
            .then((newItemRef) => {
                inputFieldEl.value = "";
            })
            .catch((error) => console.error("Error adding:", error))
            .finally(() => {
                addButton.disabled = false;
                addButton.textContent = "Add to List";
            });
    }

    addButton.addEventListener("click", addAnime);
    inputFieldEl.addEventListener("keypress", (event) => {
        if (event.key === "Enter") addAnime();
    });

    function removeItem(key, listItem) {
        const itemRef = ref(database, `animeList/${key}`);
        remove(itemRef)
            .then(() => listItem.remove())
            .catch((error) => console.error("Error removing item:", error));
    }

    // Listen for newly added items
    onChildAdded(animeListInDB, (snapshot) => {
        const key = snapshot.key;
        const value = snapshot.val();

        const listItem = document.createElement("li");
        listItem.textContent = value;
        listItem.setAttribute("data-key", key);
        listItem.title = "Click to remove";

        listItem.addEventListener("click", () => removeItem(key, listItem));

        animeListEl.appendChild(listItem);
    });

    // Listen for removed items
    onChildRemoved(animeListInDB, (snapshot) => {
        const removedKey = snapshot.key;
        const item = animeListEl.querySelector(`[data-key="${removedKey}"]`);
        if (item) item.remove();
    });
});
