import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, onValue,remove } from "firebase/database";

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

    addButton.addEventListener("click", function () {
        let inputValue = inputFieldEl.value.trim(); // Trim to remove whitespace
        
        if (inputValue === "") {
            console.warn("Input is empty. Please enter a value.");
            return;
        }

        push(animeListInDB, inputValue)
            .then(() => {
                console.log("Successfully added: " + inputValue);
                inputFieldEl.value = ""; // Clear the input field
            })
            .catch((error) => {
                console.error("Error adding to database:", error);
            });
        });

    // Listen for changes in the database and update the list
    onValue(animeListInDB, (snapshot) => {
        // Clear the list to avoid duplication
        animeListEl.innerHTML = "";

        if (snapshot.exists()) {
            const data = snapshot.val();

            // Iterate over the list of anime and add each item to the HTML
            Object.entries(data).forEach(([key, value]) => {
                const listItem = document.createElement("li");
                listItem.textContent = value;
                listItem.setAttribute("data-key", key); // Store the unique key (Firebase ID) as a data-key attribute on the <li> element
                
                // Add click event to remove the item when clicked
                listItem.addEventListener("click", () => {
                    const itemKey = listItem.getAttribute("data-key");
                    const itemRef = ref(database, `animeList/${itemKey}`);
                    remove(itemRef)
                        .then(() => {
                            console.log(`Item with key: ${itemKey} removed successfully`);
                        })
                        .catch((error) => {
                            console.error("Error removing item:", error);
                        });
                });


                animeListEl.appendChild(listItem);
            });
        } else {
            console.log("No data available");
        }
    });
});
