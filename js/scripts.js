document.querySelector('.dropbox').addEventListener('click', function () {
    document.querySelector('#file-input').click();
});

document.querySelector('#file-input').addEventListener('change', function () {
    if (this.files && this.files[0]) {
        document.querySelector('#license-section').style.display = 'block';
        document.querySelector('#download-button').style.display = 'block';
    }
});

function loadLicenseText() {
    const license = document.querySelector('#license').value;
    let licenseText = '';

    if (license === 'custom') {
        document.querySelector('#custom-license-file').style.display = 'block';
        document.querySelector('#license_text').value = '';
        return;
    } else {
        document.querySelector('#custom-license-file').style.display = 'none';
    }

    switch (license) {
        case 'CC BY':
            licenseText = 'This work is licensed under a Creative Commons Attribution 4.0 International License. https://creativecommons.org/licenses/by/4.0/';
            break;
        case 'CC BY-SA':
            licenseText = 'This work is licensed under a Creative Commons Attribution-ShareAlike 4.0 International License. https://creativecommons.org/licenses/by-sa/4.0/';
            break;
        case 'CC BY-ND':
            licenseText = 'This work is licensed under a Creative Commons Attribution-NoDerivs 4.0 International License. https://creativecommons.org/licenses/by-nd/4.0/';
            break;
        case 'CC BY-NC':
            licenseText = 'This work is licensed under a Creative Commons Attribution-NonCommercial 4.0 International License. https://creativecommons.org/licenses/by-nc/4.0/';
            break;
        case 'CC BY-NC-SA':
            licenseText = 'This work is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License. https://creativecommons.org/licenses/by-nc-sa/4.0/';
            break;
        case 'CC BY-NC-ND':
            licenseText = 'This work is licensed under a Creative Commons Attribution-NonCommercial-NoDerivs 4.0 International License. https://creativecommons.org/licenses/by-nc-nd/4.0/';
            break;
        case 'CC0':
            licenseText = 'This work is licensed under a Creative Commons CC0 1.0 Universal (CC0 1.0) Public Domain Dedication. https://creativecommons.org/publicdomain/zero/1.0/';
            break;
    }

    document.querySelector('#license_text').value = licenseText;
}

function loadCustomLicense() {
    const file = document.querySelector('#custom-license-file').files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            document.querySelector('#license_text').value = e.target.result;
        };
        reader.readAsText(file);
    }
}

function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.style.display = 'block';
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

function processImage() {
    const fileInput = document.querySelector('#file-input');
    const file = fileInput.files[0];
    const licenseText = document.querySelector('#license_text').value;
    const watermark = document.querySelector('#watermark').checked;
    const format = document.querySelector('#format').value;

    if (!file) {
        alert('Please select an image file.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        const img = new Image();
        img.src = e.target.result;
        img.onload = function () {
            const canvas = document.querySelector('#canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;

            ctx.drawImage(img, 0, 0);

            if (watermark) {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                ctx.fillRect(0, canvas.height - 80, canvas.width, 80);
                ctx.fillStyle = 'white';
                ctx.font = '16px Arial';
                ctx.fillText(`License: ${licenseText.split('. ')[0]}`, 10, canvas.height - 50);
                ctx.fillText(`Info: ${licenseText.split('. ')[1]}`, 10, canvas.height - 20);
            }

            let dataUrl = canvas.toDataURL(`image/${format}`, 0.8);
            if (format === 'jpeg') {
                const base64Data = dataUrl.split(',')[1];
                const exifObj = { "0th": {}, "Exif": {}, "GPS": {}, "Interop": {}, "1st": {} };
                exifObj["0th"][piexif.ImageIFD.Artist] = licenseText;

                const exifBytes = piexif.dump(exifObj);
                dataUrl = piexif.insert(exifBytes, `data:image/jpeg;base64,${base64Data}`);
            }

            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = `licensed_image.${format}`;
            link.click();

            showNotification('Image processed and downloaded');
        };
    };
    reader.readAsDataURL(file);
}
