import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PROFILE_LIMITS, validateProfileNumbers } from '../validation';

const ProfileTab = ({ formData, updateData, saveProfileToDb, isDarkMode, setIsDarkMode, handleLogout, apiBase }) => {
    // Hook kullanımı her zaman fonksiyonun en başında olmalı
    const { t, i18n } = useTranslation();

    const [showSettings, setShowSettings] = useState(false);
    const [credentials, setCredentials] = useState({ current: '', next: '' });
    // Şifre gösterme/gizleme state'i
    const [showPassword, setShowPassword] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    const changeLanguage = (lang) => {
        i18n.changeLanguage(lang);
        localStorage.setItem('vitalsync_lang', lang); // dil tercihi kalıcı
    };

    // 🛡️ Kaydetmeden önce gerçekçi yaş/boy/kilo kontrolü
    const handleSaveProfile = () => {
        const errorKey = validateProfileNumbers(formData);
        if (errorKey) {
            alert(t(errorKey));
            return;
        }
        saveProfileToDb(formData);
    };

    // 🔐 Gerçek şifre değiştirme (eskiden sahte bir "Güncellendi" alert'i vardı)
    const handleCredentialsUpdate = async () => {
        if (!credentials.current || !credentials.next) {
            alert(t('fill_all_fields'));
            return;
        }
        if (credentials.next.length < 6) {
            alert(t('password_min'));
            return;
        }
        setIsUpdating(true);
        try {
            const res = await fetch(`${apiBase}/update-credentials`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('vitalsync_token') || ''}`
                },
                body: JSON.stringify({
                    email: formData.email,
                    current_password: credentials.current,
                    new_password: credentials.next
                })
            });
            if (res.ok) {
                alert(t('password_updated'));
                setCredentials({ current: '', next: '' });
                setShowSettings(false);
            } else if (res.status === 401) {
                alert(t('wrong_password'));
            } else {
                alert(t('update_failed'));
            }
        } catch {
            alert(t('server_error'));
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="animate-in profile-tab-view" style={{ padding: '0 10px 40px 10px', height: '100%', overflowY: 'auto' }}>

            {/* ÜST BÖLÜM: BAŞLIK VE AYARLAR */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', marginTop: '10px' }}>
                <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.4rem', fontWeight: '800' }}>
                    {t('profile_title')}
                </h3>
                <div style={{ display: 'flex', gap: '10px' }}>
                    {/* Modern Ayarlar İkonu (SVG) */}
                    <button onClick={() => setShowSettings(true)} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '14px', width: '42px', height: '42px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-main)', boxShadow: 'var(--shadow-card)' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="3"></circle>
                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                        </svg>
                    </button>

                    {/* Modern Tema (Güneş/Ay) İkonu (SVG) */}
                    <button onClick={() => setIsDarkMode(!isDarkMode)} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '14px', width: '42px', height: '42px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-main)', boxShadow: 'var(--shadow-card)' }}>
                        {isDarkMode ? (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="5"></circle>
                                <line x1="12" y1="1" x2="12" y2="3"></line>
                                <line x1="12" y1="21" x2="12" y2="23"></line>
                                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                                <line x1="1" y1="12" x2="3" y2="12"></line>
                                <line x1="21" y1="12" x2="23" y2="12"></line>
                                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                            </svg>
                        ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                            </svg>
                        )}
                    </button>
                </div>
            </div>

            {/* KİŞİSEL BİLGİLER FORMU */}
            <div style={{ background: 'var(--bg-card)', padding: '25px', borderRadius: '28px', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border-subtle)', textAlign: 'left' }}>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 'bold', letterSpacing: '1px' }}>{t('name_label', 'Ad Soyad')}</label>
                    <input type="text" value={formData.name || ''} onChange={(e) => updateData('name', e.target.value)} style={{ width: '100%', padding: '15px', borderRadius: '15px', border: 'none', background: 'var(--bg-input)', color: 'var(--text-main)', marginTop: '8px', fontSize: '1rem', outline: 'none', boxSizing: 'border-box' }} />
                </div>

                <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 'bold' }}>{t('age_label', 'Yaş')}</label>
                        <input type="number" min={PROFILE_LIMITS.age.min} max={PROFILE_LIMITS.age.max} value={formData.age || ''} onChange={(e) => updateData('age', e.target.value)} style={{ width: '100%', padding: '15px', borderRadius: '15px', border: 'none', background: 'var(--bg-input)', color: 'var(--text-main)', marginTop: '8px', outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 'bold' }}>{t('gender_label', 'Cinsiyet')}</label>
                        <select value={formData.gender || 'Male'} onChange={(e) => updateData('gender', e.target.value)} style={{ width: '100%', padding: '15px', borderRadius: '15px', border: 'none', background: 'var(--bg-input)', color: 'var(--text-main)', marginTop: '8px', height: '54px', outline: 'none', boxSizing: 'border-box' }}>
                            <option value="Male">{t('male', 'Erkek')}</option>
                            <option value="Female">{t('female', 'Kadın')}</option>
                        </select>
                    </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 'bold' }}>{t('height_label', 'Boy (cm)')}</label>
                    <input type="number" min={PROFILE_LIMITS.height.min} max={PROFILE_LIMITS.height.max} value={formData.height || ''} onChange={(e) => updateData('height', e.target.value)} style={{ width: '100%', padding: '15px', borderRadius: '15px', border: 'none', background: 'var(--bg-input)', color: 'var(--text-main)', marginTop: '8px', outline: 'none', boxSizing: 'border-box' }} />
                </div>

                <div style={{ marginBottom: '30px' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 'bold' }}>{t('weight_label', 'Kilo (kg)')}</label>
                    <input type="number" min={PROFILE_LIMITS.weight.min} max={PROFILE_LIMITS.weight.max} value={formData.weight || ''} onChange={(e) => updateData('weight', e.target.value)} style={{ width: '100%', padding: '15px', borderRadius: '15px', border: 'none', background: 'var(--bg-input)', color: 'var(--text-main)', marginTop: '8px', outline: 'none', boxSizing: 'border-box' }} />
                </div>

                <button onClick={handleSaveProfile} style={{ width: '100%', padding: '18px', borderRadius: '20px', background: '#10B981', color: 'white', fontWeight: 'bold', fontSize: '1.1rem', border: 'none', cursor: 'pointer', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)' }}>
                    {t('save_btn', 'Kaydet')}
                </button>
            </div>

            <div style={{ textAlign: 'center', marginTop: '30px' }}>
                <button style={{ color: '#EF4444', fontWeight: '800', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }} onClick={handleLogout}>{t('logout', 'Çıkış Yap')}</button>
            </div>

            {/* AYARLAR MODALI */}
            {showSettings && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '20px' }}>
                    <div style={{ background: 'var(--bg-card)', padding: '25px', borderRadius: '24px', width: '100%', maxWidth: '380px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '15px' }}>
                            <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.2rem', fontWeight: 'bold' }}>{t('settings', 'Ayarlar')}</h3>
                            <button onClick={() => setShowSettings(false)} style={{ background: 'var(--bg-app)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-main)', cursor: 'pointer' }}>✕</button>
                        </div>

                        {/* DİL SEÇİMİ */}
                        <div style={{ textAlign: 'left', marginBottom: '25px' }}>
                            <label style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 'bold', letterSpacing: '1px' }}>{t('language', 'Dil Seçimi')}</label>
                            <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                                {['TR', 'EN', 'PL'].map((lang) => (
                                    <button
                                        key={lang}
                                        onClick={() => changeLanguage(lang.toLowerCase())}
                                        style={{
                                            flex: 1, padding: '12px', borderRadius: '12px',
                                            background: i18n.language === lang.toLowerCase() ? '#10B981' : 'var(--bg-app)',
                                            color: i18n.language === lang.toLowerCase() ? 'white' : 'var(--text-main)',
                                            border: '1px solid var(--border-subtle)', fontWeight: 'bold', cursor: 'pointer'
                                        }}
                                    >
                                        {lang}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* GÜVENLİK: GERÇEK ŞİFRE DEĞİŞTİRME */}
                        <div style={{ textAlign: 'left', marginBottom: '25px' }}>
                            <label style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 'bold', letterSpacing: '1px' }}>{t('security', 'Güvenlik')}</label>
                            <input type="email" value={formData.email || ''} disabled style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-subtle)', background: 'var(--bg-app)', color: 'var(--text-dim)', marginTop: '10px', marginBottom: '10px', outline: 'none', boxSizing: 'border-box' }} />

                            <input
                                type="password"
                                placeholder={t('current_password')}
                                value={credentials.current}
                                onChange={(e) => setCredentials({ ...credentials, current: e.target.value })}
                                style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-subtle)', background: 'var(--bg-app)', color: 'var(--text-main)', marginBottom: '10px', outline: 'none', boxSizing: 'border-box' }}
                            />

                            <div style={{ position: 'relative', width: '100%' }}>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder={t('new_password')}
                                    value={credentials.next}
                                    onChange={(e) => setCredentials({ ...credentials, next: e.target.value })}
                                    style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-subtle)', background: 'var(--bg-app)', color: 'var(--text-main)', outline: 'none', boxSizing: 'border-box', paddingRight: '45px' }}
                                />
                                {/* Basılı tutunca şifreyi gösteren buton */}
                                <button
                                    onMouseDown={() => setShowPassword(true)}
                                    onMouseUp={() => setShowPassword(false)}
                                    onMouseLeave={() => setShowPassword(false)}
                                    onTouchStart={() => setShowPassword(true)}
                                    onTouchEnd={() => setShowPassword(false)}
                                    style={{
                                        position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                                        background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                        <circle cx="12" cy="12" r="3"></circle>
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <button onClick={handleCredentialsUpdate} disabled={isUpdating} style={{ width: '100%', padding: '16px', borderRadius: '16px', background: 'var(--text-main)', color: 'var(--bg-card)', fontWeight: 'bold', border: 'none', cursor: isUpdating ? 'default' : 'pointer', opacity: isUpdating ? 0.7 : 1 }}>
                            {isUpdating ? '...' : t('update_btn', 'Güncelle')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfileTab;