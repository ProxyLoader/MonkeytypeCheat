// ==UserScript==
// @name         Monkeytype Auto Typer
// @match        https://monkeytype.com/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';
    console.log("Hit => Arrow Right key to enable/disable cheat.");

    const DELAY_MS = 20;
    const TOGGLE_KEY = "ArrowRight";

    let enabled = false;
    let typingTimeout = null;

    function getActiveWord() {
        return document.querySelector(".word.active");
    }

    function getCurrentLetters() {
        const activeWord = getActiveWord();
        if (!activeWord) return [];
        return Array.from(activeWord.querySelectorAll("letter"));
    }

    function simulateKey(char) {
        const input = document.getElementById("wordsInput");
        if (!input) return;

        const keydown = new KeyboardEvent("keydown", { key: char, bubbles: true });
        const keypress = new KeyboardEvent("keypress", { key: char, bubbles: true });
        const inputEvent = new InputEvent("input", {
            bubbles: true,
            cancelable: true,
            inputType: "insertText",
            data: char
        });
        const keyup = new KeyboardEvent("keyup", { key: char, bubbles: true });

        input.dispatchEvent(keydown);
        input.dispatchEvent(keypress);
        input.value += char;
        input.dispatchEvent(inputEvent);
        input.dispatchEvent(keyup);
    }

    async function typeActiveWord() {
        if (!enabled) return;

        const letters = getCurrentLetters();
        let i = 0;

        while (enabled && i < letters.length) {
            const letter = letters[i];

            if (!letter.classList.contains("correct") && !letter.classList.contains("incorrect")) {
                const char = letter.textContent;
                simulateKey(char);
            }

            i++;

            if (enabled && i < letters.length) {
                await new Promise(resolve => setTimeout(resolve, DELAY_MS));
            }
        }

        if (enabled) {
            simulateKey(" ");
        }

        if (enabled) {
            typingTimeout = setTimeout(typeActiveWord, 15);
        }
    }

    function toggleCheat() {
        enabled = !enabled;

        if (enabled) {
            console.log("Cheat activated.");
            typeActiveWord();
        } else {
            clearTimeout(typingTimeout);
            console.log("Cheat deactivated.");
        }
    }

    document.addEventListener("keydown", (e) => {
        if (e.code === TOGGLE_KEY && !e.repeat) {
            e.preventDefault();
            toggleCheat();
        }
    });

    const observer = new MutationObserver(() => {
        if (document.getElementById("wordsInput")) {
            console.log("Monkeytype Auto Typer ready.");
            observer.disconnect();
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });

})();
