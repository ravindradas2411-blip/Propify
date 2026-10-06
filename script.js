```javascript
// --- 1. HEADLINE TEXT CYCLING ---
document.addEventListener('DOMContentLoaded', () => {
    const wordTarget = document.getElementById('changingWord');
    const wordsArray = ["rented", "leased", "sold", "bought"];
    let currentWordIndex = 0;

    if (wordTarget) {
        setInterval(() => {
            wordTarget.classList.add('word-fade-out');
            setTimeout(() => {
                currentWordIndex = (currentWordIndex + 1) % wordsArray.length;
                wordTarget.textContent = wordsArray[currentWordIndex];
                wordTarget.classList.remove('word-fade-out');
            }, 300);
        }, 2500);
    }
});

// --- 2. POPUP MODAL STATE CONTROLS ---
const portalModal = document.getElementById('portalModal');
const openModalTriggers = document.querySelectorAll('.open-portal-trigger');
const closeModalBtn = document.getElementById('closePortalModal');
const formElement = document.getElementById('vacancyRegistrationForm');
const successCard = document.getElementById('successCard');

openModalTriggers.forEach(btn => {
    btn.addEventListener('click', () => {
        clearErrors();
        formElement.reset();
        document.getElementById('billPreviewList').innerHTML = '';
        document.getElementById('backupDocPreviewList').innerHTML = '';
        document.getElementById('filePreviewList').innerHTML = '';
        
        formElement.classList.remove('hidden-step');
        successCard.classList.add('hidden-step');
        
        portalModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
});

closeModalBtn.addEventListener('click', () => {
    portalModal.classList.remove('active');
    document.body.style.overflow = '';
});

portalModal.addEventListener('click', (e) => {
    if (e.target === portalModal) {
        portalModal.classList.remove('active');
        document.body.style.overflow = '';
    }
});

// --- 3. DARK MODE ENGINE ---
const toggleSwitch = document.querySelector('.theme-switch input[type="checkbox"]');
const currentTheme = localStorage.getItem('theme');

if (currentTheme) {
    document.documentElement.setAttribute('data-theme', currentTheme);
    if (currentTheme === 'dark') { toggleSwitch.checked = true; }
}
toggleSwitch.addEventListener('change', function(e) {
    const theme = e.target.checked ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
});

// --- 4. TOGGLE PASSWORD FIELDS ---
document.querySelectorAll('.toggle-password').forEach(icon => {
    icon.addEventListener('click', function() {
        const inputField = this.parentElement.querySelector('input');
        inputField.type = inputField.type === 'password' ? 'text' : 'password';
        this.classList.toggle('fa-eye-slash');
        this.classList.toggle('fa-eye');
    });
});

// --- 5. FILE UPLOAD SCANNER & BADGE PREVIEWS ---
const MAX_FILE_SIZE_MB = 15;

function wireFilePreviewEngine(inputId, previewListId, errorDivId) {
    const input = document.getElementById(inputId);
    const list = document.getElementById(previewListId);
    
    input.addEventListener('change', function() {
        list.innerHTML = '';
        const errContainer = document.getElementById(errorDivId);
        if(errContainer) errContainer.textContent = '';
        input.parentElement.parentElement.classList.remove('error');

        for (let i = 0; i < this.files.length; i++) {
            const file = this.files[i];
            const sizeMB = file.size / (1024 * 1024);

            if (sizeMB > MAX_FILE_SIZE_MB) {
                if(errContainer) errContainer.textContent = `File "${file.name}" exceeds the safe ${MAX_FILE_SIZE_MB}MB limit.`;
                this.value = '';
                list.innerHTML = '';
                return;
            }

            let icon = 'fa-file';
            if (file.type.startsWith('image/')) icon = 'fa-file-image';
            else if (file.type === 'application/pdf') icon = 'fa-file-pdf';

            const item = document.createElement('div');
            item.className = 'file-item';
            item.innerHTML = `<span><i class="fas ${icon}"></i> ${file.name} (${sizeMB.toFixed(2)} MB)</span><i class="fas fa-check-circle" style="color: #2ecc71;"></i>`;
            list.appendChild(item);
        }
    });
}

wireFilePreviewEngine('electricityBill', 'billPreviewList', 'electricityBillError');
wireFilePreviewEngine('backupDocInput', 'backupDocPreviewList', 'backupDocInputError');
wireFilePreviewEngine('propertyMedia', 'filePreviewList', 'propertyMediaError');

function generateUniqueRegistrationID() {
    return `PR-${Math.random().toString(36).substring(2, 7).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
}

const strictPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@\$!%*?&])[A-Za-z\d@\$!%*?&]{8,}\$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+\$/;
const mobileRegex = /^\d{10}\$/;

// --- 6. SUBMISSION DATA HANDLER ---
formElement.addEventListener('submit', async function(e) {
    e.preventDefault();
    clearErrors();

    const name = document.getElementById('regUsername');
    const contact = document.getElementById('regContact');
    const password = document.getElementById('regPassword');
    const propType = document.getElementById('propertyType');
    const intent = document.getElementById('listingIntent');
    const location = document.getElementById('propLocation');
    const price = document.getElementById('propPrice');
    const billInput = document.getElementById('electricityBill');
    const backupDocType = document.getElementById('backupDocType');
    const backupDocInput = document.getElementById('backupDocInput');
    const submitBtn = document.getElementById('submitBtn');

    let isValid = true;

    if (name.value.trim() === '') { showError(name, 'regUsernameError', 'Owner name required.'); isValid = false; }
    
    const cleanContact = contact.value.trim();
    if (!emailRegex.test(cleanContact) && !mobileRegex.test(cleanContact)) {
        showError(contact, 'regContactError', 'Enter a valid email or 10-digit mobile.');
        isValid = false;
    }
    if (!strictPasswordRegex.test(password.value)) {
        showError(password, 'regPasswordError', 'Requires 8+ characters containing an uppercase, lowercase, number, and symbol.');
        isValid = false;
    }
    if (propType.value === '') { showError(propType, 'propertyTypeError', 'Classification select required.'); isValid = false; }
    if (intent.value === '') { showError(intent, 'listingIntentError', 'Listing intent required.'); isValid = false; }
    if (location.value.trim() === '') { showError(location, 'propLocationError', 'Property address location required.'); isValid = false; }
    if (price.value.trim() === '') { showError(price, 'propPriceError', 'Target numerical valuation expected.'); isValid = false; }

    if (!billInput.files || billInput.files.length === 0) {
        showError(billInput, 'electricityBillError', 'Compulsory: Attach an Electricity Bill.');
        isValid = false;
    }
    if (backupDocType.value === '') { showError(backupDocType, 'backupDocTypeError', 'Compulsory: Select supporting ID type.'); isValid = false; }
    if (!backupDocInput.files || backupDocInput.files.length === 0) {
        showError(backupDocInput, 'backupDocInputError', 'Compulsory: Attach secondary identification.');
        isValid = false;
    }

    if (!isValid) return;

    const uniqueRegistrationId = generateUniqueRegistrationID();
    document.getElementById('hiddenRegistrationId').value = uniqueRegistrationId;

    submitBtn.disabled = true;
    submitBtn.textContent = "Processing listing data...";

    const dataPayload = new FormData(this);

    try {
        const response = await fetch(this.action, {
            method: this.method,
            body: dataPayload,
            headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
            document.getElementById('displayUniqueId').textContent = uniqueRegistrationId;
            formElement.classList.add('hidden-step');
            successCard.classList.remove('hidden-step');
            document.querySelector('.modal-form-adjustment').scrollTop = 0;
        } else {
            alert('Form service endpoint connection failed. Make sure to replace your endpoint string URL.');
        }
    } catch (err) {
        // Network fall-through simulation option for offline sandbox local testing
        document.getElementById('displayUniqueId').textContent = uniqueRegistrationId;
        formElement.classList.add('hidden-step');
        successCard.classList.remove('hidden-step');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Publish Verified Vacancy Listing";
    }
});

document.getElementById('copyIdBtn').addEventListener('click', function() {
    navigator.clipboard.writeText(document.getElementById('displayUniqueId').textContent).then(() => {
        const icon = this.querySelector('i');
        icon.className = 'fas fa-check'; icon.style.color = '#2ecc71';
        setTimeout(() => { icon.className = 'far fa-copy'; icon.style.color = ''; }, 2000);
    });
});

document.getElementById('resetFormBtn').addEventListener('click', () => {
    formElement.reset();
    successCard.classList.add('hidden-step');
    formElement.classList.remove('hidden-step');
});

function showError(element, divId, msg) { document.getElementById(divId).textContent = msg; element.parentElement.classList.add('error'); }
function clearErrors() { document.querySelectorAll('.error-message').forEach(m => m.textContent = ''); document.querySelectorAll('.input-group').forEach(g => g.classList.remove('error')); }
