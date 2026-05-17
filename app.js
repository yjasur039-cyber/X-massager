function formatUzbekNumber(input) {
    // Faqat raqamlarni qoldiramiz va agar + bo'lsa saqlaymiz
    let num = input.replace(/[^\d+]/g, '');
    if (!num.startsWith('+998') && num.startsWith('998')) {
        num = '+' + num;
    } else if (!num.startsWith('+998')) {
        num = '+998' + num.replace(/^\+?998?/, '');
    }
    return num;
}

function validateUser(name, phone) {
    // Ismda raqam borligini tekshirish
    const nameRegex = /^[A-Za-zʻʻʼa-oʻgʻshchsh ]+$/;
    if (!nameRegex.test(name)) {
        return "Ismga raqam yoki simvollar kiritish mumkin emas!";
    }

    // O'zbekiston raqamlari formati (kodlari bilan)
    const uzbPhoneRegex = /^\+998(33|50|77|88|90|91|93|94|95|97|98|99)\d{7}$/;
    if (!uzbPhoneRegex.test(phone)) {
        return "Yolgʻon yoki notoʻgʻri telefon raqam!";
    }

    return true; // Hammasi to'g'ri
}
