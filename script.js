// ==================== توابع تبدیل اعداد ====================
function toPersianDigits(str) {
    if (str === undefined || str === null) return '';
    const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return str.toString().replace(/\d/g, x => persianDigits[x]);
}

function toEnglishDigits(str) {
    if (str === undefined || str === null) return '';
    return str.toString()
        .replace(/[۰-۹]/g, x => '۰۱۲۳۴۵۶۷۸۹'.indexOf(x))
        .replace(/[٠-٩]/g, x => '٠١٢٣٤٥٦٧٨٩'.indexOf(x));
}

function formatNumber(num) {
    if (num === null || num === undefined || isNaN(num)) return "۰";
    // اول جداکننده هزارگان می‌زنیم، بعد به فارسی تبدیل می‌کنیم
    let str = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return toPersianDigits(str);
}

function parseNumber(str) {
    if (!str) return 0;
    // اول اعداد فارسی/عربی را به انگلیسی تبدیل کرده و کاماها را حذف می‌کنیم
    let engStr = toEnglishDigits(str).replace(/,/g, '').replace(/،/g, '');
    return parseInt(engStr) || 0;
}

// ==================== داده‌ها ====================
let invoiceNumber = "۱۰۱";
let buyerName = "آقای ";
let buyerAddress = " نشانی : ایران - اصفهان ";
let buyerMobile = "شماره تماس: ۰۹۱۳۱۰۰۱۰۰۰";
let noteText = "به دلیل نوسانات بازار این پیش فاکتور تا زمان دریافت اسناد مالی قابل تغییر قیمت می‌باشد و فروشنده تضمینی در قبال مبلغ ندارد.";

// ردیف‌های فاکتور (حداکثر 6 سطر)
let rowsData = [
    { desc: " محصول جدید ", quantity: 1, unitPrice: 0 }
];

const MAX_ROWS = 6;

// ==================== توابع کمکی تبدیل حروف ====================
function numberToPersianWords(amount) {
    if (amount === 0) return "صفر ریال";

    const units = ["", "یک", "دو", "سه", "چهار", "پنج", "شش", "هفت", "هشت", "نه"];
    const teens = ["ده", "یازده", "دوازده", "سیزده", "چهارده", "پانزده", "شانزده", "هفده", "هجده", "نوزده"];
    const tens = ["", "", "بیست", "سی", "چهل", "پنجاه", "شصت", "هفتاد", "هشتاد", "نود"];
    const hundreds = ["", "صد", "دویست", "سیصد", "چهارصد", "پانصد", "ششصد", "هفتصد", "هشتصد", "نهصد"];

    function convertChunk(num) {
        if (num === 0) return "";
        let result = "";
        let h = Math.floor(num / 100);
        let r = num % 100;
        if (h > 0) result += hundreds[h];
        if (r >= 10 && r <= 19) {
            if (h > 0) result += " و ";
            result += teens[r - 10];
        } else {
            let t = Math.floor(r / 10);
            let u = r % 10;
            if (t > 0) {
                if (h > 0) result += " و ";
                result += tens[t];
            }
            if (u > 0) {
                if (h > 0 || t > 0) result += " و ";
                result += units[u];
            }
        }
        return result;
    }

    let parts = [];

    // جداسازی میلیارد، میلیون، هزار و باقیمانده
    let billions = Math.floor(amount / 1000000000);
    let remaining = amount % 1000000000;
    let millions = Math.floor(remaining / 1000000);
    remaining = remaining % 1000000;
    let thousands = Math.floor(remaining / 1000);
    let rest = remaining % 1000;

    if (billions > 0) {
        let billText = convertChunk(billions);
        parts.push(billText + " میلیارد");
    }
    if (millions > 0) {
        let milText = convertChunk(millions);
        parts.push(milText + " میلیون");
    }
    if (thousands > 0) {
        let thouText = convertChunk(thousands);
        parts.push(thouText + " هزار");
    }
    if (rest > 0) {
        parts.push(convertChunk(rest));
    }

    let result = "";
    if (parts.length === 1) {
        result = parts[0];
    } else {
        result = parts.join(" و ");
    }

    return result + " ریال";
}

// به‌روزرسانی وضعیت دکمه افزودن
function updateAddButtonState() {
    const addBtn = document.getElementById('addRowBtn');
    if (rowsData.length >= MAX_ROWS) {
        addBtn.disabled = true;
        addBtn.style.opacity = '0.5';
        addBtn.title = 'حداکثر 6 سطر قابل افزودن است';
    } else {
        addBtn.disabled = false;
        addBtn.style.opacity = '1';
        addBtn.title = '';
    }
}

// به‌روزرسانی فقط جمع کل یک ردیف خاص
function updateRowTotal(rowIndex) {
    const row = rowsData[rowIndex];
    const rowTotal = row.quantity * row.unitPrice;

    // به‌روزرسانی سلول جمع کل در جدول
    const tbody = document.getElementById('items-table-body');
    const rowElement = tbody.children[rowIndex];
    if (rowElement) {
        const totalCell = rowElement.cells[4];
        totalCell.textContent = formatNumber(rowTotal);
    }

    // محاسبه و به‌روزرسانی جمع نهایی
    updateGrandTotal();
}

// محاسبه و به‌روزرسانی جمع نهایی
function updateGrandTotal() {
    let grandTotal = 0;
    rowsData.forEach(row => {
        grandTotal += row.quantity * row.unitPrice;
    });

    document.getElementById('total-amount').innerHTML = formatNumber(grandTotal) + ' <span style="font-size:1.4rem; margin-left: 10px;">ریال</span>';
    document.getElementById('amount-in-words').innerHTML = numberToPersianWords(grandTotal);
}

// ساخت جدول از ابتدا
function buildTable() {
    const tbody = document.getElementById('items-table-body');
    tbody.innerHTML = '';

    rowsData.forEach((row, idx) => {
        const rowTotal = row.quantity * row.unitPrice;
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="text-align: center;">${toPersianDigits(idx + 1)}</td>
            <td><input type="text" class="row-desc" data-row="${idx}" value="${escapeHtml(row.desc)}" style="width: 100%; text-align: right;"></td>
            <td><input type="text" class="row-quantity" data-row="${idx}" value="${toPersianDigits(row.quantity)}" style="width: 100%; text-align: center;"></td>
            <td><input type="text" class="row-price" data-row="${idx}" value="${formatNumber(row.unitPrice)}" style="width: 100%; text-align: left; direction: ltr;"></td>
            <td style="text-align: left; direction: ltr; font-weight: bold;">${formatNumber(rowTotal)}</td>
        `;
        tbody.appendChild(tr);
    });

    attachRowEvents();
    updateGrandTotal();
    updateAddButtonState();
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function (m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function attachRowEvents() {
    document.querySelectorAll('.row-desc').forEach(input => {
        input.removeEventListener('input', handleDescChange);
        input.addEventListener('input', handleDescChange);
    });
    document.querySelectorAll('.row-quantity').forEach(input => {
        input.removeEventListener('input', handleQuantityChange);
        input.addEventListener('input', handleQuantityChange);
    });
    document.querySelectorAll('.row-price').forEach(input => {
        input.removeEventListener('input', handlePriceChange);
        input.addEventListener('input', handlePriceChange);
    });
}

function handleDescChange(e) {
    const rowIdx = parseInt(e.target.getAttribute('data-row'));
    if (!isNaN(rowIdx) && rowsData[rowIdx]) {
        rowsData[rowIdx].desc = e.target.value;
    }
}

function handleQuantityChange(e) {
    const rowIdx = parseInt(e.target.getAttribute('data-row'));
    if (!isNaN(rowIdx) && rowsData[rowIdx]) {
        let val = parseNumber(e.target.value);
        if (isNaN(val)) val = 0;
        rowsData[rowIdx].quantity = val;
        
        // نمایش همزمان به صورت فارسی در کادر
        const cursorPos = e.target.selectionStart;
        e.target.value = toPersianDigits(val || '');
        
        updateRowTotal(rowIdx); 
    }
}

function handlePriceChange(e) {
    const rowIdx = parseInt(e.target.getAttribute('data-row'));
    if (!isNaN(rowIdx) && rowsData[rowIdx]) {
        let val = parseNumber(e.target.value);
        if (isNaN(val)) val = 0;
        rowsData[rowIdx].unitPrice = val;
        
        // نمایش به صورت فارسی و سه‌رقم سه‌رقم
        e.target.value = val === 0 ? '' : formatNumber(val);
        
        updateRowTotal(rowIdx); 
    }
}

// ==================== ویرایش تیتر با سلیکت ====================
const factorTitleSpan = document.getElementById('factor-title-text');
const factorTitleSelect = document.getElementById('invoice-type-select');

if (factorTitleSelect) {
    factorTitleSelect.style.appearance = 'none';
    factorTitleSelect.style.webkitAppearance = 'none';
    factorTitleSelect.style.mozAppearance = 'none';
}

if (factorTitleSpan) {
    factorTitleSpan.removeAttribute('onclick');
    factorTitleSpan.onclick = (e) => {
        e.stopPropagation();
        factorTitleSpan.style.display = 'none';
        factorTitleSelect.style.display = 'inline-block';
        factorTitleSelect.value = factorTitleSpan.textContent;
        factorTitleSelect.focus();
    };
}

if (factorTitleSelect) {
    factorTitleSelect.onblur = () => {
        const newValue = factorTitleSelect.value;
        if (newValue) {
            factorTitleSpan.textContent = newValue;
        }
        factorTitleSpan.style.display = 'inline-block';
        factorTitleSelect.style.display = 'none';
    };

    factorTitleSelect.onchange = () => {
        factorTitleSpan.textContent = factorTitleSelect.value;
        factorTitleSpan.style.display = 'inline-block';
        factorTitleSelect.style.display = 'none';
    };

    factorTitleSelect.onkeydown = (e) => {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
        }
    };
}

// ==================== تاریخ شمسی ====================
function getCurrentPersianDate() {
    const today = new Date();
    const persianDate = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).format(today);
    return toPersianDigits(persianDate.replace(/\//g, '/'));
}

function gregorianToPersian(date) {
    const d = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).format(date).replace(/\//g, '/');
    return toPersianDigits(d);
}

function persianToGregorian(persianDateStr) {
    const engDate = toEnglishDigits(persianDateStr);
    const parts = engDate.split('/');
    if (parts.length !== 3) return new Date();
    return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
}

const dateSpan = document.getElementById('invoice-date-text');
const dateInput = document.getElementById('invoice-date-input');

let currentInvoiceDate = getCurrentPersianDate();
if (dateSpan) {
    dateSpan.textContent = currentInvoiceDate;
}

if (dateSpan) {
    dateSpan.onclick = (e) => {
        e.stopPropagation();
        dateSpan.style.display = 'none';
        dateInput.style.display = 'inline-block';

        const gregorianDate = persianToGregorian(currentInvoiceDate);
        const year = gregorianDate.getFullYear();
        const month = String(gregorianDate.getMonth() + 1).padStart(2, '0');
        const day = String(gregorianDate.getDate()).padStart(2, '0');
        dateInput.value = `${year}-${month}-${day}`;

        setTimeout(() => {
            dateInput.showPicker ? dateInput.showPicker() : dateInput.click();
        }, 50);
    };
}

if (dateInput) {
    dateInput.onchange = () => {
        if (dateInput.value) {
            const selectedDate = new Date(dateInput.value);
            currentInvoiceDate = gregorianToPersian(selectedDate);
            dateSpan.textContent = currentInvoiceDate;
        }
        dateSpan.style.display = 'inline-block';
        dateInput.style.display = 'none';
    };

    dateInput.onblur = () => {
        dateSpan.style.display = 'inline-block';
        dateInput.style.display = 'none';
    };
}

// ==================== ویرایش شماره ====================
const numberSpan = document.getElementById('invoice-number-text');
const numberInput = document.getElementById('invoice-number-input');
if (numberSpan) {
    numberSpan.onclick = () => {
        numberSpan.style.display = 'none';
        numberInput.style.display = 'inline-block';
        numberInput.value = invoiceNumber;
        numberInput.focus();
    };
}
if (numberInput) {
    numberInput.onblur = () => {
        if (numberInput.value.trim()) invoiceNumber = toPersianDigits(numberInput.value.trim());
        numberSpan.textContent = invoiceNumber;
        numberSpan.style.display = 'inline-block';
        numberInput.style.display = 'none';
    };
    numberInput.onkeypress = (e) => { if (e.key === 'Enter') numberInput.blur(); };
}

// ==================== ویرایش نام خریدار ====================
const nameSpan = document.getElementById('buyer-name-text');
const nameInputElem = document.getElementById('buyer-name-input');
if (nameSpan) {
    nameSpan.onclick = () => {
        nameSpan.style.display = 'none';
        nameInputElem.style.display = 'inline-block';
        nameInputElem.value = buyerName;
        nameInputElem.focus();
    };
}
if (nameInputElem) {
    nameInputElem.onblur = () => {
        if (nameInputElem.value.trim()) buyerName = nameInputElem.value.trim();
        nameSpan.textContent = buyerName;
        nameSpan.style.display = 'inline-block';
        nameInputElem.style.display = 'none';
    };
    nameInputElem.onkeypress = (e) => { if (e.key === 'Enter') nameInputElem.blur(); };
}

// ==================== ویرایش آدرس خریدار ====================
const addressSpan = document.getElementById('buyer-address-text');
const addressInput = document.getElementById('buyer-address-input');
if (addressSpan) {
    addressSpan.onclick = () => {
        addressSpan.style.display = 'none';
        addressInput.style.display = 'inline-block';
        addressInput.value = buyerAddress;
        addressInput.focus();
    };
}
if (addressInput) {
    addressInput.onblur = () => {
        if (addressInput.value.trim()) buyerAddress = toPersianDigits(addressInput.value.trim());
        addressSpan.textContent = buyerAddress;
        addressSpan.style.display = 'inline-block';
        addressInput.style.display = 'none';
    };
    addressInput.onkeypress = (e) => { if (e.key === 'Enter') addressInput.blur(); };
}

// ==================== ویرایش موبایل خریدار ====================
const mobileSpan = document.getElementById('buyer-mobile-text');
const mobileInput = document.getElementById('buyer-mobile-input');
if (mobileSpan) {
    mobileSpan.onclick = () => {
        mobileSpan.style.display = 'none';
        mobileInput.style.display = 'inline-block';
        mobileInput.value = buyerMobile; 
        mobileInput.focus();
    };
}
if (mobileInput) {
    mobileInput.onblur = () => {
        if (mobileInput.value.trim()) buyerMobile = toPersianDigits(mobileInput.value.trim());
        mobileSpan.textContent = buyerMobile;
        mobileSpan.style.display = 'inline-block';
        mobileInput.style.display = 'none';
    };
    mobileInput.onkeypress = (e) => { if (e.key === 'Enter') mobileInput.blur(); };
}

// ==================== ویرایش توضیحات ====================
const noteBox = document.getElementById('note-box');
const noteDisplay = document.getElementById('note-text-display');
const noteTextarea = document.getElementById('note-input');
if (noteDisplay && noteTextarea) {
    noteDisplay.textContent = noteText;
    noteBox.onclick = (e) => {
        if (e.target === noteTextarea) return;
        noteDisplay.style.display = 'none';
        noteTextarea.style.display = 'block';
        noteTextarea.value = noteText;
        noteTextarea.focus();
    };
    noteTextarea.onblur = () => {
        if (noteTextarea.value.trim()) noteText = toPersianDigits(noteTextarea.value.trim());
        noteDisplay.textContent = noteText;
        noteDisplay.style.display = 'block';
        noteTextarea.style.display = 'none';
    };
}

// ==================== افزودن و حذف سطر ====================
document.getElementById('addRowBtn').addEventListener('click', () => {
    if (rowsData.length < MAX_ROWS) {
        rowsData.push({ desc: "محصول جدید", quantity: 1, unitPrice: 0 });
        buildTable(); 
    } else {
        alert("حداکثر 6 سطر قابل افزودن است!");
    }
});

document.getElementById('removeRowBtn').addEventListener('click', () => {
    if (rowsData.length > 1) {
        rowsData.pop();
        buildTable(); 
    } else {
        alert("حداقل یک سطر باید باقی بماند!");
    }
});

// ==================== ذخیره تصویر ====================
async function saveAsImage() {
    const btn = document.getElementById('saveAsImageBtn');
    const originalText = btn.innerHTML;
    btn.innerHTML = '⏳ در حال ذخیره‌سازی...';
    btn.disabled = true;

    const element = document.querySelector('.invoice-card2');
    const targetWidth = 904;
    const targetHeight = 1280;

    try {
        if (factorTitleSelect.style.display === 'inline-block') factorTitleSelect.blur();
        if (dateInput.style.display === 'inline-block') dateInput.blur();
        if (numberInput.style.display === 'inline-block') numberInput.blur();
        if (nameInputElem.style.display === 'inline-block') nameInputElem.blur();
        if (addressInput.style.display === 'inline-block') addressInput.blur();
        if (mobileInput.style.display === 'inline-block') mobileInput.blur();
        if (noteTextarea.style.display === 'block') noteTextarea.blur();

        await new Promise(resolve => setTimeout(resolve, 50));

        const canvas = await html2canvas(element, {
            scale: 2,
            backgroundColor: '#ffffff',
            logging: false,
            useCORS: false,
            width: targetWidth,
            height: targetHeight,
            windowWidth: element.scrollWidth
        });

        const resizedCanvas = document.createElement('canvas');
        resizedCanvas.width = targetWidth;
        resizedCanvas.height = targetHeight;
        const ctx = resizedCanvas.getContext('2d');
        ctx.drawImage(canvas, 0, 0, targetWidth, targetHeight);

        const base64Image = resizedCanvas.toDataURL('image/png');

        if (window.AndroidBridge) {
            const base64Data = base64Image.split(',')[1];
            window.AndroidBridge.saveImageToGallery(base64Data);
        } else {
            const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
            const link = document.createElement('a');
            link.download = `${factorTitleSpan.textContent}_${timestamp}.png`;
            link.href = base64Image;
            link.click();
        }

    } catch (error) {
        console.error('خطا:', error);
        alert('خطا در ذخیره تصویر');
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

document.getElementById('saveAsImageBtn').addEventListener('click', saveAsImage);

// ==================== تنظیمات سیستم (ذخیره اطلاعات و تم) ====================
const defaultSettings = {
    theme: 'gold',
    companyName: ' کارتن سازی مکعب طلایی ',
    companyAddress: ' اصفهان - اتوبان خاتون آبادب ',
    companyPhone: ' 09134107656 '
};

let currentSettings = { ...defaultSettings };

const modal = document.getElementById('settingsModal');
const openSettingsBtn = document.getElementById('openSettingsBtn');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');
const saveSettingsBtn = document.getElementById('saveSettingsBtn');
const themeBtns = document.querySelectorAll('.theme-btn');

function initSettings() {
    const saved = localStorage.getItem('invoiceSettings');
    if (saved) {
        currentSettings = { ...defaultSettings, ...JSON.parse(saved) };
    }
    applySettingsToUI();
}

function applySettingsToUI() {
    document.documentElement.setAttribute('data-theme', currentSettings.theme);
    
    const subBrand = document.getElementById('sub-brand');
    const footerName = document.getElementById('footer-company-name');
    const footerAddress = document.getElementById('footer-company-address');
    const footerPhone = document.getElementById('footer-company-phone');

    if(subBrand) subBrand.textContent = currentSettings.companyName;
    if(footerName) footerName.textContent = currentSettings.companyName;
    if(footerAddress) footerAddress.innerHTML = `<span>📍</span> ${toPersianDigits(currentSettings.companyAddress)}`;
    if(footerPhone) footerPhone.textContent = toPersianDigits(currentSettings.companyPhone);

    const setCompName = document.getElementById('setting-company-name');
    const setCompAddr = document.getElementById('setting-company-address');
    const setCompPhone = document.getElementById('setting-company-phone');

    if(setCompName) setCompName.value = currentSettings.companyName;
    if(setCompAddr) setCompAddr.value = toPersianDigits(currentSettings.companyAddress);
    if(setCompPhone) setCompPhone.value = toPersianDigits(currentSettings.companyPhone);

    themeBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-theme') === currentSettings.theme) {
            btn.classList.add('active');
        }
    });
}

if(openSettingsBtn) {
    openSettingsBtn.addEventListener('click', () => {
        applySettingsToUI();
        modal.style.display = 'flex';
    });
}

if(closeSettingsBtn) {
    closeSettingsBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
}

themeBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        themeBtns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentSettings.theme = e.target.getAttribute('data-theme');
        document.documentElement.setAttribute('data-theme', currentSettings.theme);
    });
});

if(saveSettingsBtn) {
    saveSettingsBtn.addEventListener('click', () => {
        currentSettings.companyName = document.getElementById('setting-company-name').value;
        currentSettings.companyAddress = toPersianDigits(document.getElementById('setting-company-address').value);
        currentSettings.companyPhone = toPersianDigits(document.getElementById('setting-company-phone').value);

        localStorage.setItem('invoiceSettings', JSON.stringify(currentSettings));
        
        applySettingsToUI();
        modal.style.display = 'none';
    });
}
// ==================== دکمه بازنشانی تنظیمات (ریست) ====================
const resetSettingsBtn = document.getElementById('resetSettingsBtn');
let resetTimeout;

if (resetSettingsBtn) {
    resetSettingsBtn.addEventListener('click', () => {
        // اگر دکمه قبلاً کلیک شده و در حالت تایید (مرحله دوم) است
        if (resetSettingsBtn.getAttribute('data-confirm') === 'true') {
            // پاک کردن اطلاعات از حافظه
            localStorage.removeItem('invoiceSettings');
            
            // برگرداندن متغیر تنظیمات فعلی به حالت پیش‌فرض
            currentSettings = { ...defaultSettings };
            
            // اعمال روی ظاهر فرم و فاکتور
            applySettingsToUI();
            
            // بستن پنجره
            modal.style.display = 'none';

            // بازگرداندن دکمه به حالت اولیه برای دفعات بعد
            resetSettingsBtn.innerHTML = '🔄 بازنشانی';
            resetSettingsBtn.removeAttribute('data-confirm');
            clearTimeout(resetTimeout);
        } else {
            // مرحله اول: تغییر متن دکمه برای گرفتن تایید از کاربر
            resetSettingsBtn.innerHTML = '⚠️ مطمئن هستید؟ (دوباره لمس کنید)';
            resetSettingsBtn.setAttribute('data-confirm', 'true');
            
            // اگر کاربر تا 4 ثانیه تایید نکرد، دکمه به حالت اول برگردد
            resetTimeout = setTimeout(() => {
                resetSettingsBtn.innerHTML = '🔄 بازنشانی';
                resetSettingsBtn.removeAttribute('data-confirm');
            }, 4000);
        }
    });
}
// ==================== جلوگیری از زوم خودکار در موبایل ====================
// این کد باعث می‌شود وقتی روی کادرهای متنی می‌زنید، گوشی خودکار زوم نکند
// اما قابلیت زوم دستی (دو انگشتی) همچنان برای کاربر فعال می‌ماند.
const viewportMeta = document.querySelector('meta[name="viewport"]');

if (viewportMeta) {
    // مرحله اول: وقتی کاربر روی کادر ضربه می‌زند، زوم موقتاً قفل می‌شود
    document.body.addEventListener('touchstart', function(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') {
            viewportMeta.setAttribute('content', 'width=950, user-scalable=yes, maximum-scale=1');
        }
    }, { passive: true });

    // مرحله دوم: وقتی کاربر از کادر خارج می‌شود، قفل زوم برداشته شده و اجازه زوم دستی داده می‌شود
    document.body.addEventListener('blur', function(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') {
            // اجازه زوم دستی تا ۵ برابر
            viewportMeta.setAttribute('content', 'width=950, user-scalable=yes, maximum-scale=5');
        }
    }, true); // کلمه true در اینجا برای تشخیص دقیق خروج از کادر ضروری است
}
// ==================== مقداردهی اولیه ====================
buildTable();
initSettings();

// ==================== سیستم مدیریت پایگاه داده (LocalStorage) ====================
let currentEditingInvoiceId = null; // برای تشخیص اینکه آیا در حال ویرایش فاکتور قبلی هستیم یا خیر
let currentActiveCustomerId = null; // مشتری فعال در مودال مدیریت

function getAppDB() {
    let db = localStorage.getItem('app_database');
    if (!db) {
        return { customers: [], invoices: [], transactions: [] };
    }
    return JSON.parse(db);
}

function saveAppDB(db) {
    localStorage.setItem('app_database', JSON.stringify(db));
}

// دکمه فاکتور جدید (پاک کردن فرم)
document.getElementById('newInvoiceBtn').addEventListener('click', () => {
    if(confirm('آیا مطمئن هستید که می‌خواهید یک فاکتور کاملاً جدید ایجاد کنید؟ اطلاعات فعلی از روی صفحه پاک می‌شود.')){
        currentEditingInvoiceId = null;
        
        // افزایش خودکار شماره فاکتور بر اساس آخرین شماره
        let engNum = parseInt(toEnglishDigits(invoiceNumber));
        if(!isNaN(engNum)) {
            invoiceNumber = toPersianDigits(engNum + 1);
            document.getElementById('invoice-number-text').textContent = invoiceNumber;
        }

        buyerName = "آقای ";
        buyerAddress = " نشانی : ایران - اصفهان ";
        buyerMobile = "شماره تماس: ۰۹۱۳۱۰۰۱۰۰۰";
        
        document.getElementById('buyer-name-text').textContent = buyerName;
        document.getElementById('buyer-address-text').textContent = buyerAddress;
        document.getElementById('buyer-mobile-text').textContent = buyerMobile;
        
        rowsData = [{ desc: " محصول جدید ", quantity: 1, unitPrice: 0 }];
        buildTable();
    }
});

// ذخیره فاکتور در سیستم
document.getElementById('saveSystemBtn').addEventListener('click', () => {
    let db = getAppDB();
    let name = buyerName.trim();
    
    if(!name || name === 'آقای ' || name === 'شرکت') {
        alert('لطفا ابتدا نام خریدار را به درستی وارد کنید.');
        return;
    }

    // 1. جستجو یا ساخت مشتری جدید
    let customer = db.customers.find(c => c.name === name);
    if(!customer) {
        customer = { 
            id: 'CUST_' + Date.now(), 
            name: name, 
            address: buyerAddress, 
            mobile: buyerMobile 
        };
        db.customers.push(customer);
    } else {
        // به‌روزرسانی اطلاعات تماس مشتری در صورت تغییر
        customer.address = buyerAddress;
        customer.mobile = buyerMobile;
    }

    // 2. آماده‌سازی اطلاعات فاکتور فعلی
    let currentTotal = rowsData.reduce((sum, row) => sum + (row.quantity * row.unitPrice), 0);
    let invoiceData = {
        id: currentEditingInvoiceId || ('INV_' + Date.now()),
        customerId: customer.id,
        type: document.getElementById('factor-title-text').textContent, // پیش فاکتور یا فاکتور
        number: invoiceNumber,
        date: currentInvoiceDate,
        note: noteText,
        rowsData: JSON.parse(JSON.stringify(rowsData)), // کپی عمیق از سطرها
        totalAmount: currentTotal
    };

    // 3. ذخیره یا آپدیت فاکتور
    if (currentEditingInvoiceId) {
        let idx = db.invoices.findIndex(i => i.id === currentEditingInvoiceId);
        if(idx > -1) {
            db.invoices[idx] = invoiceData;
        } else {
            db.invoices.push(invoiceData);
        }
    } else {
        db.invoices.push(invoiceData);
        currentEditingInvoiceId = invoiceData.id; // از این به بعد در حالت ویرایش این فاکتور هستیم
    }

    saveAppDB(db);
    
    let btn = document.getElementById('saveSystemBtn');
    let originalText = btn.innerHTML;
    btn.innerHTML = '✅ با موفقیت ذخیره شد';
    btn.style.background = '#16a34a';
    setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.background = 'linear-gradient(135deg, #059669, #047857)';
    }, 2000);
});


// ==================== منطق پنجره مدیریت حساب‌ها (CRM) ====================
const crmModal = document.getElementById('crmModal');
const openCrmBtn = document.getElementById('openCrmBtn');
const closeCrmBtn = document.getElementById('closeCrmBtn');

openCrmBtn.addEventListener('click', () => {
    crmModal.style.display = 'flex';
    renderCustomersList();
});

closeCrmBtn.addEventListener('click', () => {
    crmModal.style.display = 'none';
    document.getElementById('crmCustomerDetail').style.display = 'none';
    document.getElementById('crmCustomersList').style.display = 'block';
});

// محاسبه مانده حساب یک مشتری
function calculateCustomerLedger(customerId, db) {
    // فقط مواردی که "فاکتور" هستند بدهی محسوب می‌شوند، "پیش فاکتور" اثری ندارد
    let totalDebt = db.invoices
        .filter(i => i.customerId === customerId && i.type === 'فاکتور')
        .reduce((sum, i) => sum + i.totalAmount, 0);
        
    let totalPaid = db.transactions
        .filter(t => t.customerId === customerId)
        .reduce((sum, t) => sum + t.amount, 0);
        
    return {
        invoiced: totalDebt,
        paid: totalPaid,
        balance: totalDebt - totalPaid
    };
}

// نمایش لیست مشتریان
function renderCustomersList(searchQuery = "") {
    document.getElementById('crmCustomersList').style.display = 'block';
    document.getElementById('crmCustomerDetail').style.display = 'none';
    
    let db = getAppDB();
    let customers = db.customers;
    
    if(searchQuery) {
        customers = customers.filter(c => c.name.includes(searchQuery));
    }

    let html = `<table class="crm-table">
        <thead>
            <tr>
                <th>نام مشتری</th>
                <th>شماره تماس</th>
                <th>مانده بدهی (ریال)</th>
                <th>عملیات</th>
            </tr>
        </thead>
        <tbody>`;
        
    if(customers.length === 0) {
        html += `<tr><td colspan="4" style="padding: 20px;">هیچ مشتری ثبت نشده است. با ثبت اولین فاکتور، مشتری خودکار اضافه می‌شود.</td></tr>`;
    } else {
        customers.reverse().forEach(c => {
            let ledger = calculateCustomerLedger(c.id, db);
            let balanceColor = ledger.balance > 0 ? '#dc2626' : (ledger.balance < 0 ? '#16a34a' : '#333');
            
            html += `<tr>
                <td style="font-weight:bold;">${c.name}</td>
                <td>${toPersianDigits(c.mobile)}</td>
                <td style="color: ${balanceColor}; font-weight:bold; direction:ltr;">${formatNumber(ledger.balance)}</td>
                <td><button class="crm-btn-sm" onclick="openCustomerDetail('${c.id}')">ورود به حساب</button></td>
            </tr>`;
        });
    }
    
    html += `</tbody></table>`;
    document.getElementById('customersTableContainer').innerHTML = html;
}

document.getElementById('crmSearchInput').addEventListener('input', (e) => {
    renderCustomersList(e.target.value);
});

// باز کردن پرونده یک مشتری خاص
window.openCustomerDetail = function(customerId) {
    currentActiveCustomerId = customerId;
    let db = getAppDB();
    let customer = db.customers.find(c => c.id === customerId);
    if(!customer) return;

    document.getElementById('crmCustomersList').style.display = 'none';
    document.getElementById('crmCustomerDetail').style.display = 'block';
    
    document.getElementById('cdName').textContent = 'حساب: ' + customer.name;
    
    updateLedgerUI();
    renderInvoicesList();
    renderPaymentsList();
    
    // سوییچ به تب فاکتورها به صورت پیش‌فرض
    document.querySelector('.crm-tab-btn[data-tab="invoices"]').click();
};

function updateLedgerUI() {
    let db = getAppDB();
    let ledger = calculateCustomerLedger(currentActiveCustomerId, db);
    document.getElementById('cdTotalInvoiced').textContent = formatNumber(ledger.invoiced);
    document.getElementById('cdTotalPaid').textContent = formatNumber(ledger.paid);
    document.getElementById('cdBalance').textContent = formatNumber(ledger.balance);
}

// دکمه‌های بازگشت و انتخاب برای فاکتور
document.getElementById('cdBackBtn').addEventListener('click', () => renderCustomersList());

document.getElementById('cdSelectForInvoiceBtn').addEventListener('click', () => {
    let db = getAppDB();
    let customer = db.customers.find(c => c.id === currentActiveCustomerId);
    if(customer) {
        buyerName = customer.name;
        buyerAddress = customer.address;
        buyerMobile = customer.mobile;
        
        document.getElementById('buyer-name-text').textContent = buyerName;
        document.getElementById('buyer-address-text').textContent = buyerAddress;
        document.getElementById('buyer-mobile-text').textContent = buyerMobile;
        
        currentEditingInvoiceId = null; // چون فاکتور جدید است
        alert(`مشتری ${customer.name} برای صدور فاکتور جدید انتخاب شد.`);
        crmModal.style.display = 'none';
    }
});

// تب‌های داخل حساب مشتری
document.querySelectorAll('.crm-tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.crm-tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.crm-tab-content').forEach(c => c.classList.remove('active'));
        
        e.target.classList.add('active');
        let tabId = e.target.getAttribute('data-tab');
        document.getElementById('tab' + tabId.charAt(0).toUpperCase() + tabId.slice(1)).classList.add('active');
    });
});

// رندر لیست فاکتورهای مشتری
function renderInvoicesList() {
    let db = getAppDB();
    let invs = db.invoices.filter(i => i.customerId === currentActiveCustomerId).reverse();
    
    let html = `<table class="crm-table">
        <thead><tr><th>تاریخ</th><th>شماره</th><th>نوع</th><th>مبلغ (ریال)</th><th>عملیات</th></tr></thead><tbody>`;
        
    if(invs.length === 0) {
        html += `<tr><td colspan="5">فاکتوری ثبت نشده است</td></tr>`;
    } else {
        invs.forEach(inv => {
            let typeColor = inv.type === 'فاکتور' ? '#16a34a' : '#d97706';
            html += `<tr>
                <td>${inv.date}</td>
                <td>${inv.number}</td>
                <td style="color:${typeColor}; font-weight:bold;">${inv.type}</td>
                <td style="direction:ltr;">${formatNumber(inv.totalAmount)}</td>
                <td>
                    <button class="crm-btn-sm crm-btn-edit" onclick="loadInvoiceToMainScreen('${inv.id}')">✏️ باز کردن و ویرایش</button>
                </td>
            </tr>`;
        });
    }
    html += `</tbody></table>`;
    document.getElementById('tabInvoices').innerHTML = html;
}

// بارگذاری فاکتور انتخاب شده روی صفحه اصلی برای ویرایش
window.loadInvoiceToMainScreen = function(invoiceId) {
    let db = getAppDB();
    let inv = db.invoices.find(i => i.id === invoiceId);
    let customer = db.customers.find(c => c.id === inv.customerId);
    
    if(inv && customer) {
        currentEditingInvoiceId = inv.id;
        
        // تنظیمات مشتری
        buyerName = customer.name;
        buyerAddress = customer.address;
        buyerMobile = customer.mobile;
        document.getElementById('buyer-name-text').textContent = buyerName;
        document.getElementById('buyer-address-text').textContent = buyerAddress;
        document.getElementById('buyer-mobile-text').textContent = buyerMobile;
        
        // تنظیمات فاکتور
        invoiceNumber = inv.number;
        document.getElementById('invoice-number-text').textContent = invoiceNumber;
        
        document.getElementById('factor-title-text').textContent = inv.type;
        document.getElementById('invoice-type-select').value = inv.type;
        
        currentInvoiceDate = inv.date;
        document.getElementById('invoice-date-text').textContent = currentInvoiceDate;
        
        noteText = inv.note || "";
        document.getElementById('note-text-display').textContent = noteText;
        
        // تنظیم سطرها
        rowsData = JSON.parse(JSON.stringify(inv.rowsData));
        buildTable();
        
        crmModal.style.display = 'none';
        
        // یک اسکرول نرم به بالای صفحه
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
};

// منطق پرداختی‌ها
const payAmountInput = document.getElementById('payAmount');
const payDescInput = document.getElementById('payDesc');

// سه‌رقم کردن لحظه‌ای مبلغ پرداختی هنگام تایپ
payAmountInput.addEventListener('input', function(e) {
    let val = parseNumber(e.target.value);
    e.target.value = val === 0 ? '' : formatNumber(val);
});

document.getElementById('savePaymentBtn').addEventListener('click', () => {
    let amt = parseNumber(payAmountInput.value);
    let desc = payDescInput.value.trim();
    
    if(amt <= 0) return alert('مبلغ پرداختی نامعتبر است.');
    
    let db = getAppDB();
    db.transactions.push({
        id: 'TRN_' + Date.now(),
        customerId: currentActiveCustomerId,
        amount: amt,
        desc: desc || 'دریافت وجه',
        date: getCurrentPersianDate()
    });
    
    saveAppDB(db);
    payAmountInput.value = '';
    payDescInput.value = '';
    
    updateLedgerUI();
    renderPaymentsList();
});

function renderPaymentsList() {
    let db = getAppDB();
    let trans = db.transactions.filter(t => t.customerId === currentActiveCustomerId).reverse();
    
    let html = `<table class="crm-table">
        <thead><tr><th>تاریخ</th><th>مبلغ دریافتی (ریال)</th><th>توضیحات</th><th>حذف</th></tr></thead><tbody>`;
        
    if(trans.length === 0) {
        html += `<tr><td colspan="4">پرداختی ثبت نشده است</td></tr>`;
    } else {
        trans.forEach(t => {
            html += `<tr>
                <td>${t.date}</td>
                <td style="color:#16a34a; font-weight:bold; direction:ltr;">+ ${formatNumber(t.amount)}</td>
                <td>${t.desc}</td>
                <td><button class="crm-btn-sm crm-btn-del" onclick="deleteTransaction('${t.id}')">حذف</button></td>
            </tr>`;
        });
    }
    html += `</tbody></table>`;
    document.getElementById('paymentsTableContainer').innerHTML = html;
}

window.deleteTransaction = function(trnId) {
    if(confirm('آیا از حذف این پرداختی مطمئن هستید؟ (در مانده حساب تاثیر می‌گذارد)')) {
        let db = getAppDB();
        db.transactions = db.transactions.filter(t => t.id !== trnId);
        saveAppDB(db);
        updateLedgerUI();
        renderPaymentsList();
    }
};