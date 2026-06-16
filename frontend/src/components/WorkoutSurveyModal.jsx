import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const WorkoutSurveyModal = ({ setShowWorkoutModal, onGenerate }) => {
    const { t } = useTranslation();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Çeviri anahtarları (Artık dilden dile otomatik dönecek)
    const levelOpts = ['level_beginner', 'level_intermediate', 'level_advanced'];
    const goalOpts = ['goal_muscle', 'goal_weightloss', 'goal_strength', 'goal_toning'];
    const equipmentOpts = ['loc_gym', 'loc_home_dumbbell', 'loc_home_bodyweight'];
    const daysOpts = ['days_2', 'days_3', 'days_4', 'days_5'];
    const durationOpts = ['dur_30', 'dur_45_60', 'dur_90'];

    // State içinde artık çeviri anahtarlarını tutuyoruz
    const [surveyData, setSurveyData] = useState({
        level: 'level_beginner',
        goal: 'goal_muscle',
        equipment: 'loc_gym',
        days: 'days_3',
        duration: 'dur_45_60'
    });

    const handleSelect = (key, value) => {
        setSurveyData({ ...surveyData, [key]: value });
    };

    const handleStartGeneration = async () => {
        setIsSubmitting(true);

        // Backend'e gönderirken o anki seçili dildeki gerçek metne çevirip gönderiyoruz (Yapay zeka anlasın diye)
        const translatedData = {
            level: t(surveyData.level),
            goal: t(surveyData.goal),
            equipment: t(surveyData.equipment),
            days: t(surveyData.days),
            duration: t(surveyData.duration)
        };

        await onGenerate(translatedData);
        setIsSubmitting(false);
        setShowWorkoutModal(false);
    };

    return (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'flex-end', zIndex: 1000, animation: 'fadeIn 0.3s ease' }}>
            <div className="modal-content" style={{ background: 'var(--bg-app)', width: '100%', maxWidth: '500px', height: '85vh', borderTopLeftRadius: '30px', borderTopRightRadius: '30px', padding: '25px 20px', display: 'flex', flexDirection: 'column', boxShadow: '0 -10px 40px rgba(0,0,0,0.2)', animation: 'slideUp 0.3s ease' }}>

                <div style={{ width: '40px', height: '5px', background: 'var(--border-subtle)', borderRadius: '10px', margin: '0 auto 20px auto' }}></div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--text-main)', fontWeight: '900' }}>{t('workout_setup_title')} ⚡</h2>
                        <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', color: 'var(--text-dim)' }}>{t('workout_setup_desc')}</p>
                    </div>
                    <button onClick={() => setShowWorkoutModal(false)} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '50%', width: '35px', height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-main)', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', paddingRight: '5px', display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '20px' }}>

                    <div>
                        <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 'bold' }}>{t('q1_level')}</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                            {levelOpts.map(opt => (
                                <button key={opt} onClick={() => handleSelect('level', opt)} style={{ padding: '12px 5px', borderRadius: '16px', fontSize: '0.8rem', fontWeight: 'bold', border: surveyData.level === opt ? '2px solid #3B82F6' : '1px solid var(--border-subtle)', background: surveyData.level === opt ? 'rgba(59,130,246,0.1)' : 'var(--bg-card)', color: surveyData.level === opt ? '#3B82F6' : 'var(--text-main)', cursor: 'pointer', transition: 'all 0.2s' }}>
                                    {t(opt)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 'bold' }}>{t('q2_goal')}</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            {goalOpts.map(opt => (
                                <button key={opt} onClick={() => handleSelect('goal', opt)} style={{ padding: '12px 10px', borderRadius: '16px', fontSize: '0.8rem', fontWeight: 'bold', border: surveyData.goal === opt ? '2px solid #10B981' : '1px solid var(--border-subtle)', background: surveyData.goal === opt ? 'rgba(16,185,129,0.1)' : 'var(--bg-card)', color: surveyData.goal === opt ? '#10B981' : 'var(--text-main)', cursor: 'pointer', transition: 'all 0.2s' }}>
                                    {t(opt)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 'bold' }}>{t('q3_location')}</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {equipmentOpts.map(opt => (
                                <button key={opt} onClick={() => handleSelect('equipment', opt)} style={{ padding: '15px 15px', borderRadius: '16px', fontSize: '0.85rem', fontWeight: 'bold', textAlign: 'left', border: surveyData.equipment === opt ? '2px solid #8B5CF6' : '1px solid var(--border-subtle)', background: surveyData.equipment === opt ? 'rgba(139,92,246,0.1)' : 'var(--bg-card)', color: surveyData.equipment === opt ? '#8B5CF6' : 'var(--text-main)', cursor: 'pointer', transition: 'all 0.2s' }}>
                                    {t(opt)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div>
                            <h4 style={{ margin: '0 0 10px 0', fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 'bold' }}>{t('q4_days')}</h4>
                            <select value={surveyData.days} onChange={(e) => handleSelect('days', e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '16px', border: '1px solid var(--border-subtle)', background: 'var(--bg-card)', color: 'var(--text-main)', fontSize: '0.85rem', outline: 'none' }}>
                                {daysOpts.map(opt => <option key={opt} value={opt}>{t(opt)}</option>)}
                            </select>
                        </div>
                        <div>
                            <h4 style={{ margin: '0 0 10px 0', fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 'bold' }}>{t('q5_duration')}</h4>
                            <select value={surveyData.duration} onChange={(e) => handleSelect('duration', e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '16px', border: '1px solid var(--border-subtle)', background: 'var(--bg-card)', color: 'var(--text-main)', fontSize: '0.85rem', outline: 'none' }}>
                                {durationOpts.map(opt => <option key={opt} value={opt}>{t(opt)}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleStartGeneration}
                    disabled={isSubmitting}
                    style={{ marginTop: '10px', width: '100%', padding: '18px', borderRadius: '20px', background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', color: 'white', fontWeight: 'bold', fontSize: '1rem', border: 'none', cursor: isSubmitting ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', boxShadow: '0 8px 20px rgba(16,185,129,0.3)', transition: 'transform 0.1s' }}
                    onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
                    onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    {isSubmitting ? (
                        <>
                            <div className="spinner" style={{ width: '20px', height: '20px', border: '3px solid rgba(255,255,255,0.3)', borderTop: '3px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                            {t('creating_program_loading')}
                        </>
                    ) : (
                        <>✨ {t('create_program_btn')}</>
                    )}
                </button>
            </div>
        </div>
    );
};

export default WorkoutSurveyModal;