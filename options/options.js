const passwordInput = document.getElementById('passwordInput');
const confirmPasswordInput = document.getElementById('confirmPasswordInput');
const savePasswordBtn = document.getElementById('savePasswordBtn');
const passwordWarning = document.getElementById('passwordWarning');
const siteInput = document.getElementById('siteInput');
const addSiteBtn = document.getElementById('addSiteBtn');
const siteList = document.getElementById('siteList');

const accessPasswordInput = document.getElementById('accessPasswordInput');
const accessUnlockBtn = document.getElementById('accessUnlockBtn');
const accessWarning = document.getElementById('accessWarning');
const optionsLockScreen = document.getElementById('optionsLockScreen');
const mainSettings = document.getElementById('mainSettings');

// hashing
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

// options page lock
async function checkInitialSetup() {
    const { hashedPassword } = await chrome.storage.local.get('hashedPassword');
    if (!hashedPassword) {
        optionsLockScreen.style.display = 'none';
        mainSettings.style.display = 'block';
    }
}

accessUnlockBtn.addEventListener('click', async () => {
    const enteredPassword = accessPasswordInput.value;
    const { hashedPassword } = await chrome.storage.local.get('hashedPassword');
    
    if (hashedPassword) {
        const enteredPasswordHash = await hashPassword(enteredPassword);
        if (enteredPasswordHash === hashedPassword) {
            optionsLockScreen.style.display = 'none';
            mainSettings.style.display = 'block';
            accessWarning.style.display = 'none';
        } else {
            accessWarning.style.display = 'block';
            accessPasswordInput.value = '';
        }
    }
});

async function loadSettings() {
    const { lockedSites = [] } = await chrome.storage.local.get('lockedSites');
    lockedSites.forEach(site => displaySite(site));
}

function displaySite(site) {
    const li = document.createElement('li');
    li.textContent = site;
    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'Remove';
    removeBtn.onclick = async () => {
        let { lockedSites = [] } = await chrome.storage.local.get('lockedSites');
        lockedSites = lockedSites.filter(s => s !== site);
        await chrome.storage.local.set({ lockedSites });
        li.remove();
    };
    li.appendChild(removeBtn);
    siteList.appendChild(li);
}

savePasswordBtn.addEventListener('click', async () => {
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (password !== confirmPassword) {
        passwordWarning.style.display = 'block';
        passwordInput.value = '';
        confirmPasswordInput.value = '';
        return;
    } else {
        passwordWarning.style.display = 'none';
    }
    
    if (password) {
        const hashedPassword = await hashPassword(password);
        await chrome.storage.local.set({ hashedPassword });
        passwordInput.value = '';
        confirmPasswordInput.value = '';
        alert('Password saved successfully!');
        checkInitialSetup();
    }
});

addSiteBtn.addEventListener('click', async () => {
    const site = siteInput.value.trim();
    if (site) {
        try {
            const url = new URL(site.startsWith('http') ? site : 'https://' + site);
            const hostname = url.hostname;

            let { lockedSites = [] } = await chrome.storage.local.get('lockedSites');
            if (!lockedSites.includes(hostname)) {
                lockedSites.push(hostname);
                await chrome.storage.local.set({ lockedSites });
                displaySite(hostname);
            }
        } catch (e) {
            alert('Invalid site format. Please enter a valid URL or hostname (e.g., web.whatsapp.com).');
        }
        siteInput.value = '';
    }
});

// Initial load
checkInitialSetup();
loadSettings();