// src/validation.js
// Kişi profili için gerçekçi sayı aralıkları — onboarding ve profil kaydında ortak kullanılır.

export const PROFILE_LIMITS = {
    age: { min: 13, max: 100 },
    height: { min: 100, max: 250 }, // cm
    weight: { min: 30, max: 300 }   // kg
};

// Dolu ve aralık-dışı değerleri kontrol eder.
// Dönüş: hata varsa i18n anahtarı, yoksa null.
export function validateProfileNumbers({ age, height, weight }) {
    if (age === '' || height === '' || weight === '' || age == null || height == null || weight == null) {
        return 'fill_all_fields';
    }

    const ageNum = parseInt(age, 10);
    if (Number.isNaN(ageNum) || ageNum < PROFILE_LIMITS.age.min || ageNum > PROFILE_LIMITS.age.max) {
        return 'invalid_age';
    }

    const heightNum = parseFloat(height);
    if (Number.isNaN(heightNum) || heightNum < PROFILE_LIMITS.height.min || heightNum > PROFILE_LIMITS.height.max) {
        return 'invalid_height';
    }

    const weightNum = parseFloat(weight);
    if (Number.isNaN(weightNum) || weightNum < PROFILE_LIMITS.weight.min || weightNum > PROFILE_LIMITS.weight.max) {
        return 'invalid_weight';
    }

    return null;
}
