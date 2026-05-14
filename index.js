async function executeSend() {
    const user = JSON.parse(localStorage.getItem('xms_user'));
    const role = document.getElementById('role-select').value;
    const msg = document.getElementById('msg-text').value;

    const report = `📁 X-MS REPORT\n👤 FROM: ${user.name}\n🎯 TO: ${role.toUpperCase()}\n💬 MSG: ${msg}`;

    console.log("Yuborilmoqda..."); // Tekshirish uchun

    try {
        const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: ADMIN_ID,
                text: report
            })
        });

        const result = await response.json();
        if (result.ok) {
            alert("XABAR YETKAZILDI.");
        } else {
            alert("XATO: " + result.description);
        }
    } catch(e) {
        alert("TARMOQDA XATOLIK!");
    }
}
