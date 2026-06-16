import React from 'react';
import Confetti from 'react-confetti';
import { useTranslation } from 'react-i18next';

const WaterTab = ({ currentWater, setCurrentWater, formData, reminderEnabled, setReminderEnabled, reminderHours, setReminderHours, updateData, saveProfileToDb, showWaterHistory, setShowWaterHistory, showWaterSettings, setShowWaterSettings }) => {
    const { t, i18n } = useTranslation();

    const targetW = parseFloat(formData.water || 2);
    const wPercent = Math.min((currentWater / targetW) * 100, 100);
    const isGoalMet = wPercent >= 100;

    // 🎨 Animasyonlu Çember
    const radius = 130;
    const stroke = 24;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (wPercent / 100) * circumference;

    // 📅 MİNİ TAKVİM
    const historyData = JSON.parse(localStorage.getItem('vitalsync_water_history')) || {};
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const langCode = i18n.language === 'en' ? 'en-US' : i18n.language === 'pl' ? 'pl-PL' : 'tr-TR';

        return {
            dateStr: d.toLocaleDateString('tr-TR'),
            dayName: d.toLocaleDateString(langCode, { weekday: 'short' }),
            isToday: i === 6
        };
    });

    // 💧 Su İçme Butonu İşlemi (Sayacı Sıfırlar)
    const handleAddWater = () => {
        setCurrentWater(prev => Math.min(prev + 0.25, targetW));
        localStorage.setItem('vitalsync_last_drink_time', Date.now().toString());
    };

    // 🔔 Hatırlatıcı Toggle İşlemi (Tarayıcıdan İzin İster)
    const handleReminderToggle = () => {
        const newState = !reminderEnabled;
        setReminderEnabled(newState);

        if (newState) {
            localStorage.setItem('vitalsync_last_drink_time', Date.now().toString()); // Başlangıç zamanını kaydet
            if ('Notification' in window && Notification.permission !== 'granted') {
                Notification.requestPermission(); // Tarayıcıdan bildirim izni iste
            }
        }
    };

    return (
        <div className="animate-in" style={{ textAlign: 'center', position: 'relative', padding: '0 5px 40px 5px' }}>
            {isGoalMet && <Confetti recycle={false} numberOfPieces={500} gravity={0.15} width={window.innerWidth} height={window.innerHeight} style={{ position: 'fixed', top: 0, left: 0, zIndex: 9999, pointerEvents: 'none' }} />}

            {/* ÜST BÖLÜM: BAŞLIK VE İKONLAR */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', marginTop: '10px' }}>
                <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-main)' }}>{t('hydration', 'Su Takibi')}</h3>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => { setShowWaterHistory(!showWaterHistory); setShowWaterSettings(false); }} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '14px', width: '42px', height: '42px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: showWaterHistory ? '#3B82F6' : 'var(--text-main)', boxShadow: 'var(--shadow-card)', transition: 'all 0.3s ease' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                    </button>
                    <button onClick={() => { setShowWaterSettings(!showWaterSettings); setShowWaterHistory(false); }} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '14px', width: '42px', height: '42px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: showWaterSettings ? '#3B82F6' : 'var(--text-main)', boxShadow: 'var(--shadow-card)', transition: 'all 0.3s ease' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="3"></circle>
                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                        </svg>
                    </button>
                </div>
            </div>

            {/* 📅 YENİ NESİL GEÇMİŞ PANELİ */}
            {showWaterHistory && (
                <div className="animate-in history-panel" style={{ marginBottom: '20px', padding: '20px 15px', background: 'var(--bg-card)', borderRadius: '20px', border: '1px solid var(--border-subtle)', textAlign: 'left', boxShadow: 'var(--shadow-card)' }}>
                    <h4 style={{ margin: '0 0 15px 0', color: 'var(--text-main)', fontSize: '1rem' }}>{t('weekly_history', 'Haftalık Geçmiş 💧')}</h4>

                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '5px', overflowX: 'auto' }}>
                        {last7Days.map((day, idx) => {
                            const waterAmount = day.isToday ? currentWater : (historyData[day.dateStr] || 0);
                            const percent = Math.min((waterAmount / targetW) * 100, 100);
                            const isMet = percent >= 100;

                            return (
                                <div key={idx} style={{ flex: '1', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '0.75rem', color: day.isToday ? '#3B82F6' : 'var(--text-dim)', fontWeight: day.isToday ? 'bold' : 'normal' }}>
                                        {day.dayName}
                                    </span>
                                    <div style={{ width: '100%', maxWidth: '30px', height: '80px', backgroundColor: 'var(--bg-input)', borderRadius: '12px', position: 'relative', overflow: 'hidden' }}>
                                        <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: `${percent}%`, backgroundColor: isMet ? '#10B981' : '#3B82F6', transition: 'height 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }} />
                                    </div>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-main)', fontWeight: 'bold' }}>
                                        {waterAmount > 0 ? `${waterAmount}${t('l_short', 'L')}` : '-'}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* AYARLAR PANELİ */}
            {showWaterSettings && (
                <div className="animate-in settings-panel" style={{ marginBottom: '20px', padding: '20px', background: 'var(--bg-card)', borderRadius: '20px', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'var(--shadow-card)' }}>
                    <label style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 'bold' }}>{t('daily_target', 'Günlük Hedef:')}</label>
                    <select value={formData.water} onChange={(e) => { updateData('water', e.target.value); saveProfileToDb({ ...formData, water: e.target.value }); }} style={{ padding: '10px 15px', borderRadius: '12px', border: 'none', background: 'var(--bg-input)', color: 'var(--text-main)', fontWeight: 'bold', outline: 'none' }}>
                        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'].map(w => <option key={w} value={w}>{w} {t('liters', 'Litre')}</option>)}
                    </select>
                </div>
            )}

            {/* YUMUŞAK ANİMASYONLU SU BARI */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '40px 0', position: 'relative' }}>
                <svg height={radius * 2} width={radius * 2} style={{ transform: 'rotate(-90deg)' }}>
                    <circle
                        stroke="var(--border-subtle)"
                        fill="transparent"
                        strokeWidth={stroke}
                        r={normalizedRadius}
                        cx={radius}
                        cy={radius}
                    />
                    <circle
                        stroke="#3B82F6"
                        fill="transparent"
                        strokeWidth={stroke}
                        strokeDasharray={circumference + ' ' + circumference}
                        style={{ strokeDashoffset, transition: 'stroke-dashoffset 1s ease-in-out' }}
                        strokeLinecap="round"
                        r={normalizedRadius}
                        cx={radius}
                        cy={radius}
                    />
                </svg>
                <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '2.4rem', fontWeight: '900', color: '#3B82F6', letterSpacing: '-1px' }}>{Math.round(wPercent)}%</span>
                    <p style={{ color: 'var(--text-dim)', fontSize: '1.1rem', marginTop: '0px', fontWeight: 'bold' }}>{Math.min(currentWater, targetW)}{t('l_short', 'L')} / {targetW}{t('l_short', 'L')}</p>
                </div>
            </div>

            {/* SU EKLEME BUTONU */}
            <button className="primary" style={{ width: '100%', backgroundColor: isGoalMet ? '#10B981' : '#3B82F6', padding: '20px', fontSize: '1.2rem', fontWeight: 'bold', borderRadius: '24px', border: 'none', color: 'white', cursor: isGoalMet ? 'default' : 'pointer', transition: 'all 0.3s ease', boxShadow: isGoalMet ? '0 10px 25px rgba(16, 185, 129, 0.4)' : '0 10px 25px rgba(59, 130, 246, 0.4)' }} onClick={handleAddWater} disabled={isGoalMet}>
                {isGoalMet ? t('goal_reached', 'Hedefe Ulaşıldı! 🎉') : t('drink_water', '+ 250ml İç')}
            </button>

            {/* AKILLI HATIRLATICILAR */}
            <div style={{ marginTop: '40px', padding: '25px', backgroundColor: 'var(--bg-card)', borderRadius: '28px', textAlign: 'left', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h4 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.1rem' }}>{t('smart_reminders', 'Akıllı Hatırlatıcılar')}</h4>
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: '500' }}>{t('stay_hydrated', 'Gün boyu susuz kalma')}</p>
                    </div>
                    <div onClick={handleReminderToggle} style={{ width: '54px', height: '30px', backgroundColor: reminderEnabled ? '#3B82F6' : 'var(--border-subtle)', borderRadius: '20px', position: 'relative', cursor: 'pointer', transition: 'all 0.3s ease' }}>
                        <div style={{ width: '24px', height: '24px', backgroundColor: 'white', borderRadius: '50%', position: 'absolute', top: '3px', left: reminderEnabled ? '27px' : '3px', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }} />
                    </div>
                </div>

                {reminderEnabled && (
                    <div className="animate-in" style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border-subtle)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 'bold' }}>{t('frequency', 'Sıklık:')}</span>
                            <select value={reminderHours} onChange={(e) => setReminderHours(parseInt(e.target.value))} style={{ padding: '10px 15px', borderRadius: '12px', border: 'none', background: 'var(--bg-input)', color: 'var(--text-main)', fontWeight: 'bold', outline: 'none' }}>
                                {[1, 2, 3, 4].map(h => <option key={h} value={h}>{h} {t('hours', 'Saat')}</option>)}
                            </select>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WaterTab;