// hashingg password 
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

// password verification
async function verifyPassword() {
    const passwordInput = document.getElementById('siteLockerPasswordInput');
    const enteredPassword = passwordInput.value;
    const { hashedPassword } = await chrome.storage.local.get('hashedPassword');
    
    const enteredPasswordHash = await hashPassword(enteredPassword);

    if (enteredPasswordHash === hashedPassword) {
        document.getElementById('siteLockerOverlay').remove();
    } else {
        alert('Incorrect password!');
        passwordInput.value = '';
    }
}

// lock screen
function showLockScreen() {
    const lockScreenHtml = `
      <div id="siteLockerOverlay">
        <div class="lock-card">
          <h1>Site Locked</h1>
          <p>Enter password to unlock.</p>
          <input type="password" id="siteLockerPasswordInput" placeholder="Password">
          <button id="siteLockerUnlockBtn">Unlock</button>
        </div>
      </div>
    `;

    if (document.getElementById('siteLockerOverlay')) return;

    const overlay = document.createElement('div');
    overlay.innerHTML = lockScreenHtml;
    document.body.appendChild(overlay.firstElementChild);

    const unlockBtn = document.getElementById('siteLockerUnlockBtn');
    const passwordInput = document.getElementById('siteLockerPasswordInput');

    unlockBtn.addEventListener('click', verifyPassword);

    passwordInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            verifyPassword();
        }
    });

    passwordInput.focus();
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "showLockScreen") {
        showLockScreen();
    }
});