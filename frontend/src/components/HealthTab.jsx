import React from 'react';
import { useTranslation } from 'react-i18next';

const HealthTab = ({ formData, workoutPlan, setWorkoutPlan, isGeneratingWorkout, setShowWorkoutSurvey, expandedDay, setExpandedDay, workoutHistory = [], nutritionHistory = [] }) => {
    const { t } = useTranslation();

    const fmtDate = (d) => {
        if (!d) return '';
        try { return new Date(d).toLocaleDateString(); } catch { return ''; }
    };

    // 🧮 SAĞLIK ANALİZİ MATEMATİK MOTORU
    const hInM = formData.height ? parseFloat(formData.height) / 100 : 1.70;
    const wKg = formData.weight ? parseFloat(formData.weight) : 70;
    const ageVal = formData.age ? parseInt(formData.age) : 25;

    // BMI Hesaplama
    const bmiNum = hInM > 0 ? wKg / (hInM * hInM) : 0;
    const bmiValue = bmiNum.toFixed(1);
    const idealWeight = (21.7 * (hInM * hInM)).toFixed(1);

    // TDEE (Kalori)
    let bmr = (10 * wKg) + (6.25 * (hInM * 100)) - (5 * ageVal);
    bmr = formData.gender === 'Male' ? bmr + 5 : bmr - 161;
    const activityMap = { '0 (None)': 1.2, '1-2 times': 1.375, '3-4 times': 1.55, '5+ times': 1.725 };
    const activityFactor = activityMap[formData.exercise] || 1.2;
    const tdee = Math.round(bmr * activityFactor);

    // Su Hesaplama (haftada 3+ antrenman yapanlara +0.5L)
    const isActive = activityFactor >= 1.55;
    const calculatedWater = (wKg * 0.035 + (isActive ? 0.5 : 0)).toFixed(1);

    // BMI Durum (Dil desteğine bağlandı)
    let status = t('status_healthy', "Sağlıklı");
    let barColor = "#10B981";
    if (bmiNum < 18.5) { status = t('status_underweight', "Zayıf"); barColor = "#FBBF24"; }
    else if (bmiNum >= 25 && bmiNum < 30) { status = t('status_overweight', "Fazla Kilolu"); barColor = "#F59E0B"; }
    else if (bmiNum >= 30) { status = t('status_obese', "Obez"); barColor = "#EF4444"; }
    const pointerPos = Math.min(Math.max(((bmiNum - 15) / (40 - 15)) * 100, 0), 100);

    return (
        <div className="animate-in scrollable-health" style={{ padding: '20px 15px 100px 15px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

            {/* BAŞLIK */}
            <div style={{ width: '100%', maxWidth: '400px', marginBottom: '25px' }}>
                <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.6rem', fontWeight: '900' }}>{t('health_analysis', 'Sağlık Analizi')}</h3>
            </div>

            {/* BMI KARTI */}
            <div style={{ width: '100%', maxWidth: '400px', background: 'var(--bg-card)', borderRadius: '28px', padding: '25px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', border: '1px solid var(--border-subtle)', marginBottom: '25px' }}>
                <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '800', color: barColor, fontSize: '1.1rem' }}>{status}</span>
                    <span style={{ background: 'var(--text-main)', color: 'var(--bg-card)', padding: '5px 12px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 'bold' }}>BMI {bmiValue}</span>
                </div>
                {/* Segment genişlikleri 15-40 BMI skalasındaki gerçek eşiklere (18.5 / 25 / 30) hizalı */}
                <div style={{ height: '10px', background: 'var(--border-subtle)', borderRadius: '10px', position: 'relative', display: 'flex', overflow: 'hidden' }}>
                    <div style={{ width: '14%', background: '#FBBF24' }}></div>
                    <div style={{ width: '26%', background: '#10B981' }}></div>
                    <div style={{ width: '20%', background: '#F59E0B' }}></div>
                    <div style={{ width: '40%', background: '#EF4444' }}></div>
                    <div style={{ left: `${pointerPos}%`, background: 'var(--text-main)', border: '2px solid var(--bg-card)', width: '6px', height: '100%', position: 'absolute', transform: 'translateX(-50%)', borderRadius: '4px' }}></div>
                </div>
            </div>

            {/* ANALİZ IZGARASI */}
            <div style={{ width: '100%', maxWidth: '400px', gap: '15px', display: 'grid', gridTemplateColumns: '1fr 1fr', marginBottom: '30px' }}>
                <div style={{ gridColumn: 'span 2', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', padding: '20px', borderRadius: '24px' }}>
                    <span style={{ color: 'var(--text-dim)', fontWeight: 'bold', fontSize: '0.75rem', textTransform: 'uppercase' }}>{t('weight_status', 'Kilo Durumu')}</span>
                    <p style={{ fontSize: '1.3rem', color: 'var(--text-main)', fontWeight: '900', margin: '5px 0' }}>{wKg} kg / {idealWeight} kg</p>
                </div>
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', padding: '20px', borderRadius: '24px' }}>
                    <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem', textTransform: 'uppercase' }}>{t('daily_calories', 'Günlük Kalori')}</span>
                    <p style={{ fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: '900' }}>{tdee} kcal</p>
                </div>
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', padding: '20px', borderRadius: '24px' }}>
                    <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem', textTransform: 'uppercase' }}>{t('water_goal', 'Su Hedefi')}</span>
                    <p style={{ fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: '900' }}>{calculatedWater} L</p>
                </div>
            </div>

            {/* WORKOUT COACH BÖLÜMÜ */}
            <div style={{ width: '100%', maxWidth: '400px', marginBottom: '20px' }}>
                <h3 style={{ margin: '0 0 15px 0', fontSize: '1.2rem', color: 'var(--text-main)' }}>{t('workout_coach', 'Workout Coach ⚡')}</h3>

                {!workoutPlan && !isGeneratingWorkout && (
                    <button
                        onClick={() => setShowWorkoutSurvey(true)}
                        style={{
                            width: '100%', padding: '20px', borderRadius: '24px',
                            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                            color: 'white', border: 'none', fontWeight: '800', fontSize: '1rem',
                            cursor: 'pointer', boxShadow: '0 10px 20px rgba(16, 185, 129, 0.25)',
                            transition: 'transform 0.2s'
                        }}
                        onMouseOver={(e) => e.target.style.transform = 'scale(1.02)'}
                        onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                    >
                        ✨ {t('generate_workout', 'Antrenman Oluştur')}
                    </button>
                )}

                {isGeneratingWorkout && (
                    <div style={{ padding: '20px', background: 'var(--bg-card)', borderRadius: '24px', textAlign: 'center', border: '1px solid var(--border-subtle)' }}>
                        <p style={{ fontWeight: 'bold' }}>{t('generating_workout', 'AI antrenmanını hazırlıyor... 🤖')}</p>
                    </div>
                )}
            </div>

            {workoutPlan && (
                <div style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{ margin: 0 }}>{t('your_plan', 'Planın')}</h4>
                        <button onClick={() => setWorkoutPlan(null)} style={{ background: 'transparent', border: 'none', color: '#10B981', fontWeight: 'bold', cursor: 'pointer' }}>{t('reset_plan', 'Sıfırla 🔄')}</button>
                    </div>
                    {workoutPlan.map((day, idx) => (
                        <div key={idx} onClick={() => setExpandedDay(expandedDay === idx ? null : idx)} style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '20px', cursor: 'pointer', border: '1px solid var(--border-subtle)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: '800' }}>
                                    {day.is_rest_day ? '😴 ' : ''}{t('day', 'Gün')} {day.day}: {day.is_rest_day ? t('rest_day') : day.focus}
                                </span>
                                <span>{expandedDay === idx ? '🔼' : '🔽'}</span>
                            </div>
                            {expandedDay === idx && (
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: '15px', whiteSpace: 'pre-line', lineHeight: '1.7' }}>
                                    {Array.isArray(day.exercises)
                                        ? day.exercises.map(ex => `• ${ex.name} — ${ex.sets}×${ex.reps}${ex.rest_sec ? ` (⏸ ${ex.rest_sec}s)` : ''}`).join('\n') || day.notes
                                        : day.exercises}
                                    {Array.isArray(day.exercises) && day.exercises.length > 0 && day.notes ? `\n💡 ${day.notes}` : ''}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}
            {/* 🍽️ BESLENME GEÇMİŞİ (taranan yemekler) */}
            {nutritionHistory && nutritionHistory.length > 0 && (
                <div style={{ width: '100%', maxWidth: '400px', marginTop: '30px' }}>
                    <h3 style={{ margin: '0 0 15px 0', fontSize: '1.2rem', color: 'var(--text-main)' }}>{t('nutrition_history', 'Beslenme Geçmişi 🍽️')}</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {nutritionHistory.slice(0, 8).map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', padding: '14px 16px', borderRadius: '16px' }}>
                                <span style={{ fontWeight: '700', color: 'var(--text-main)' }}>{item.food_name}</span>
                                <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                    <span style={{ fontWeight: '800', color: '#10B981', fontSize: '0.9rem' }}>{Math.round(item.calories || 0)} kcal</span>
                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{fmtDate(item.date)}</span>
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 🏋️ GEÇMİŞ ANTRENMANLAR */}
            {workoutHistory && workoutHistory.length > 0 && (
                <div style={{ width: '100%', maxWidth: '400px', marginTop: '30px' }}>
                    <h3 style={{ margin: '0 0 15px 0', fontSize: '1.2rem', color: 'var(--text-main)' }}>{t('workout_history', 'Geçmiş Antrenmanlar 🏋️')}</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {workoutHistory.slice(0, 8).map((entry, idx) => {
                            const plan = entry.plan && entry.plan.workout_plan ? entry.plan.workout_plan : [];
                            const trainingDays = plan.filter(d => d && !d.is_rest_day).length;
                            return (
                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', padding: '14px 16px', borderRadius: '16px' }}>
                                    <span style={{ fontWeight: '700', color: 'var(--text-main)' }}>
                                        {trainingDays > 0 ? `${trainingDays} ${t('training_days', 'antrenman günü')}` : t('weekly_plan', 'Haftalık plan')}
                                    </span>
                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{fmtDate(entry.date)}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default HealthTab;