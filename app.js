let localPeerConnection;
let dataChannel;
let currentUser = { name: '', phone: '' };
let peerUser = { name: 'Suhbatdosh', phone: 'Yuklanmoqda...' };
let currentScreenBeforeProfile = 'screen-chat';

// STUN serverlar foydalanuvchilarning tashqi IP manzillarini aniqlab beradi (mutlaqo bepul va ochiq)
const rtcConfig = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
    ]
};

// Validatsiya va Ekran almashtirish elementlari
const inputPhone = document.getElementById('userphone');
const inputName = document.getElementById('username');
const errorAuth = document.getElementById('error-auth');

// Avtomatik O'zbekiston raqam formati
inputPhone.addEventListener('input', (e) => {
    let val = e.target.value;
    if (!val.startsWith('+998')) {
        e.target.value = '+998' + val.replace(/[^\d]/g, '');
    }
});

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

// 1-Oynadan o'tish
document.getElementById('btn-next').addEventListener('click', () => {
    const name = inputName.value.trim();
    const phone = inputPhone.value.trim();

    const nameRegex = /^[A-Za-zʻʼa-oʻgʻshchshShChGʻOʻ ]+$/;
    if (!nameRegex.test(name)) {
        errorAuth.innerText = "Ismga raqam yoki belgilar kiritish mumkin emas!";
        return;
    }

    const uzbPhoneRegex = /^\+998(33|50|77|88|90|91|93|94|95|97|98|99)\d{7}$/;
    if (!uzbPhoneRegex.test(phone)) {
        errorAuth.innerText = "Yolgʻon yoki notoʻgʻri telefon raqam!";
        return;
    }

    currentUser.name = name;
    currentUser.phone = phone;

    document.getElementById('my-avatar').innerText = name.charAt(0).toUpperCase();
    errorAuth.innerText = "";
    showScreen('screen-connect');
});

// ================= P2P ALOQA LOGIKASI =================

// Birinchi bo'lib server ochgan odam (Offer yaratuvchi)
document.getElementById('btn-start-server').addEventListener('click', async () => {
    initWebRTC(true);
    
    // Ma'lumot uzatish kanalini ochish
    dataChannel = localPeerConnection.createDataChannel("chat");
    setupDataChannelEvents();

    const offer = await localPeerConnection.createOffer();
    await localPeerConnection.setLocalDescription(offer);
});

// Ikkinchi ulanuvchi odam (Answer yaratuvchi)
document.getElementById('btn-connect').addEventListener('click', async () => {
    const rawPin = document.getElementById('pincode-input').value.trim();
    if (!rawPin) return alert("PIN kodni kiriting!");

    try {
        const decodedData = JSON.parse(atob(rawPin));
        
        // Agar local ulanish hali yaratilmagan bo'lsa, demak bu odam ulanuvchi
        if (!localPeerConnection) {
            initWebRTC(false);
            
            peerUser.name = decodedData.uName;
            peerUser.phone = decodedData.uPhone;

            await localPeerConnection.setRemoteDescription(new RTCSessionDescription(decodedData.rtcData));
            const answer = await localPeerConnection.createAnswer();
            await localPeerConnection.setLocalDescription(answer);
        } else {
            // Agar server ochgan odam javob kodini kiritayotgan bo'lsa
            peerUser.name = decodedData.uName;
            peerUser.phone = decodedData.uPhone;
            await localPeerConnection.setRemoteDescription(new RTCSessionDescription(decodedData.rtcData));
        }
    } catch (e) {
        alert("PIN kod noto'g'ri yoki buzilgan!");
    }
});

function initWebRTC(isHost) {
    localPeerConnection = new RTCPeerConnection(rtcConfig);

    // IP va aloqa ma'lumotlari to'planganda PIN kodni yangilash
    localPeerConnection.onicecandidate = (event) => {
        if (!event.candidate) {
            // Barcha tarmoq ma'lumotlari yig'ilgach, siqilgan PIN kod tayyor bo'ladi
            const packageData = {
                uName: currentUser.name,
                uPhone: currentUser.phone,
                rtcData: localPeerConnection.localDescription
            };
            const base64Pin = btoa(JSON.stringify(packageData));
            
            document.getElementById('my-pincode').value = base64Pin;
            document.getElementById('generated-code-box').style.display = "block";
        }
    };

    if (!isHost) {
        // Agar ulanuvchi bo'lsa, xost ochgan kanalni ushlab olish
        localPeerConnection.ondatachannel = (event) => {
            dataChannel = event.channel;
            setupDataChannelEvents();
        };
    }
}

function setupDataChannelEvents() {
    dataChannel.onopen = () => {
        document.getElementById('chat-header').innerText = peerUser.name;
        showScreen('screen-chat');
    };

    dataChannel.onmessage = (event) => {
        const msgBox = document.getElementById('chat-box');
        msgBox.innerHTML += `<div class="msg peer">${event.data}</div>`;
        msgBox.scrollTop = msgBox.scrollHeight;
    };
}

// Xabar yuborish
function sendMessage() {
    const input = document.getElementById('msg-input');
    const text = input.value.trim();
    if (!text || !dataChannel || dataChannel.readyState !== "open") return;

    dataChannel.send(text);
    
    const msgBox = document.getElementById('chat-box');
    msgBox.innerHTML += `<div class="msg me">${text}</div>`;
    msgBox.scrollTop = msgBox.scrollHeight;
    input.value = "";
}

document.getElementById('btn-send').addEventListener('click', sendMessage);
document.getElementById('msg-input').addEventListener('keypress', (e) => {
    if(e.key === 'Enter') sendMessage();
});

// ================= PROFIL BOSHQARUVI =================

function openProfile(name, phone, fromScreen) {
    currentScreenBeforeProfile = fromScreen;
    document.getElementById('prof-name').innerText = name;
    document.getElementById('prof-phone').innerText = phone;
    showScreen('screen-profile');
}

document.getElementById('my-avatar').addEventListener('click', () => {
    openProfile(currentUser.name, currentUser.phone, 'screen-connect');
});

document.getElementById('chat-header').addEventListener('click', () => {
    openProfile(peerUser.name, peerUser.phone, 'screen-chat');
});

document.getElementById('btn-back').addEventListener('click', () => {
    showScreen(currentScreenBeforeProfile);
});
