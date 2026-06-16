import React from 'react';
import { useTranslation } from 'react-i18next';

const HomeTab = ({
    setShowMealModal, setShowWorkoutModal,
    isGenerating, mealPlan, workoutPlan,
    currentWater, formData
}) => {
    const { t } = useTranslation();

    // Kalori Hesabı (Örnek Mantık, backend'den de gelebilir)
    const caloriesTarget = formData?.exercise !== '0 (None)' ? 2100 : 1850;
    const caloriesBurned = 350; // Örnek yakılan değer

    // 🌅 Saate göre selamlama
    const hour = new Date().getHours();
    const greeting = hour < 12 ? t('good_morning') : hour < 18 ? t('good_afternoon') : t('good_evening');
    const firstName = formData?.name ? formData.name.split(' ')[0] : '';

    // Su Hedefini Profil'den al, yoksa 2 Litre varsay
    const waterGoal = parseFloat(formData?.water) || 2;
    // İçilen suyun hedefe oranını hesapla (Mavi dalga yüksekliği için)
    const waterPercentage = Math.min(((currentWater || 0) / waterGoal) * 100, 100);

    return (
        <div className="animate-in scrollable-home" style={{ padding: '10px 5px 40px 5px', position: 'relative', minHeight: '100%' }}>

            {/* 🌅 ÜST BİLGİ */}
            <div style={{ marginBottom: '25px' }}>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-dim)', fontWeight: 'bold' }}>{greeting},</p>
                <h2 style={{ margin: 0, fontSize: '1.8rem', color: 'var(--text-main)', fontWeight: '900', letterSpacing: '-0.5px' }}>
                    {firstName} 👋
                </h2>
            </div>

            {/* 💡 ZARİF MOTİVASYON BARI */}
            <div style={{ background: 'linear-gradient(90deg, rgba(16,185,129,0.1) 0%, rgba(59,130,246,0.1) 100%)', borderRadius: '16px', padding: '12px 15px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '25px' }}>
                <span style={{ fontSize: '1.2rem' }}>💡</span>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-main)', fontWeight: '600', fontStyle: 'italic', lineHeight: '1.4' }}>
                    "{t('motivation_quote')}"
                </p>
            </div>

            {/* 📊 SU VE KALORİ ÖZETİ (GRID) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '30px' }}>

                {/* 💧 Su Takip Modülü */}
                <div style={{ background: 'var(--bg-card)', borderRadius: '24px', padding: '20px 15px', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-card)', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
                    {/* Arkadaki Dinamik Dalga Efekti */}
                    <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: `${waterPercentage}%`, background: 'rgba(59,130,246,0.12)', zIndex: 0, transition: 'height 0.8s ease' }}></div>

                    <span style={{ fontSize: '1.8rem', zIndex: 1, marginBottom: '5px' }}>💧</span>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '0.75rem', color: 'var(--text-dim)', zIndex: 1, textTransform: 'uppercase', fontWeight: 'bold' }}>{t('water_tracker')}</h4>

                    <div style={{ zIndex: 1, textAlign: 'center', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '0 10px' }}>
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: '900', color: '#3B82F6' }}>{currentWater || 0}L</p>
                            <span style={{ fontSize: '0.6rem', color: 'var(--text-dim)', fontWeight: 'bold' }}>{t('water_drunk')}</span>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--text-dim)' }}>{waterGoal}L</p>
                            <span style={{ fontSize: '0.6rem', color: 'var(--text-dim)', fontWeight: 'bold' }}>{t('water_goal_label')}</span>
                        </div>
                    </div>
                </div>

                {/* 🔥 Kalori İlerleme Modülü */}
                <div style={{ background: 'var(--bg-card)', borderRadius: '24px', padding: '20px 15px', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-card)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 'bold', textAlign: 'center' }}>{t('calories')}</h4>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: '900', color: '#10B981' }}>{caloriesTarget}</p>
                            <span style={{ fontSize: '0.6rem', color: 'var(--text-dim)', fontWeight: 'bold' }}>{t('cal_intake')}</span>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 'bold', color: '#EF4444' }}>{caloriesBurned}</p>
                            <span style={{ fontSize: '0.6rem', color: 'var(--text-dim)', fontWeight: 'bold' }}>{t('cal_burned')}</span>
                        </div>
                    </div>
                    {/* Progress Bar */}
                    <div style={{ width: '100%', height: '6px', background: 'var(--border-subtle)', borderRadius: '10px', overflow: 'hidden', display: 'flex' }}>
                        <div style={{ width: '60%', background: '#10B981' }}></div>
                        <div style={{ width: '40%', background: '#EF4444' }}></div>
                    </div>
                </div>
            </div>

            {/* 🎯 GÜNLÜK AKTİVİTE KARTLARI */}
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '15px', fontWeight: '900' }}>{t('daily_tasks')}</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '35px' }}>

                {/* Beslenme Kartı */}
                <div onClick={() => setShowMealModal(true)} style={{ background: 'var(--bg-card)', padding: '18px', borderRadius: '24px', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-card)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px', transition: 'all 0.2s ease' }}>
                    <div style={{ background: 'rgba(16,185,129,0.1)', width: '52px', height: '52px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>🥗</div>
                    <div style={{ flex: 1 }}>
                        <h4 style={{ margin: '0 0 5px 0', fontSize: '0.95rem', color: 'var(--text-main)', fontWeight: '800' }}>{t('todays_meal')}</h4>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: mealPlan ? '#10B981' : 'var(--text-dim)', fontWeight: mealPlan ? 'bold' : 'normal' }}>
                            {isGenerating ? t('generating') : mealPlan ? t('meal_ready') : t('meal_not_ready')}
                        </p>
                    </div>
                    <div style={{ background: 'var(--bg-app)', width: '32px', height: '32px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-main)', fontWeight: 'bold', fontSize: '1.2rem' }}>›</div>
                </div>

                {/* Antrenman Kartı */}
                <div onClick={() => setShowWorkoutModal(true)} style={{ background: 'var(--bg-card)', padding: '18px', borderRadius: '24px', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-card)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px', transition: 'all 0.2s ease' }}>
                    <div style={{ background: 'rgba(59,130,246,0.1)', width: '52px', height: '52px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>⚡</div>
                    <div style={{ flex: 1 }}>
                        <h4 style={{ margin: '0 0 5px 0', fontSize: '0.95rem', color: 'var(--text-main)', fontWeight: '800' }}>{t('todays_workout')}</h4>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: workoutPlan ? '#3B82F6' : 'var(--text-dim)', fontWeight: workoutPlan ? 'bold' : 'normal' }}>
                            {workoutPlan ? t('meal_ready') : t('view_start_workout')}
                        </p>
                    </div>
                    <div style={{ background: 'var(--bg-app)', width: '32px', height: '32px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-main)', fontWeight: 'bold', fontSize: '1.2rem' }}>›</div>
                </div>
            </div>

        </div>
    );
};

export default HomeTab;
