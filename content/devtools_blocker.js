// scripts runs on every page

// disabling developer tools
function disableDevTools() {
    // Disable right-click
    window.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        alert("");
    });

    // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, and Ctrl+U
    window.addEventListener('keydown', (e) => {
        // F12
        if (e.key === 'F12') {
            e.preventDefault();
        }
        if (e.ctrlKey && e.shiftKey && e.key === 'I' || e.metaKey && e.altKey && e.key === 'I') {
            e.preventDefault();
        }
        if (e.ctrlKey && e.shiftKey && e.key === 'J' || e.metaKey && e.altKey && e.key === 'J') {
            e.preventDefault();
        }
        // Ctrl+U ...view-source
        if (e.ctrlKey && e.key === 'U') {
            e.preventDefault();
        }
    });

    Object.defineProperty(window, 'devtools', {
        get: () => {
            return { open: true };
        },
        set: () => {}
    });
    console.log("%cThis is a security protected page.", "color: red; font-size: 20px;");
}

// Check locked and  disable devtools
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "showLockScreen") {
        disableDevTools();
    }
});