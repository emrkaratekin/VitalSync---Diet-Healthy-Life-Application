import React from 'react';
import { useTranslation } from 'react-i18next';
import { PROFILE_LIMITS, validateProfileNumbers } from '../validation';

export const Login = ({ formData, updateData, handleLogin, setView }) => {
    const { t } = useTranslation();
    return (
        <div className="card" style={{ justifyContent: 'center', padding: '40px 30px' }}>
            <img src="/logo.png" alt="Logo" className="logo-img" />
            <h2 style={{ textAlign: 'center' }}>{t('welcome_back')}</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
                <div className="form-group">
                    <input type="email" placeholder={t('email_ph')} value={formData.email} onChange={(e) => updateData('email', e.target.value)} />
                    <input type="password" placeholder={t('password')} value={formData.password} onChange={(e) => updateData('password', e.target.value)} />
                </div>
                <button type="submit" className="primary">{t('login_btn')}</button>
            </form>
            <button className="link" onClick={() => setView('register')}>{t('signup_link')}</button>
        </div>
    );
};

export const Register = ({ formData, updateData, handleRegister, setView }) => {
    const { t } = useTranslation();
    return (
        <div className="card" style={{ justifyContent: 'center', padding: '40px 30px' }}>
            <button className="back-btn" onClick={() => setView('login')}>←</button>
            <h2>{t('create_account')}</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleRegister(); }}>
                <div className="form-group">
                    <input type="text" placeholder={t('fullname_ph')} value={formData.name} onChange={(e) => updateData('name', e.target.value)} />
                    <input type="email" placeholder={t('email_ph')} value={formData.email} onChange={(e) => updateData('email', e.target.value)} />
                    <input type="password" placeholder={t('password')} value={formData.password} onChange={(e) => updateData('password', e.target.value)} />
                </div>
                <button type="submit" className="primary">{t('continue_btn')}</button>
            </form>
        </div>
    );
};

// Onboarding seçenekleri: backend'e her zaman İngilizce kanonik değer gider,
// ekranda ise kullanıcının dilindeki çeviri gösterilir.
const EXERCISE_OPTS = [
    { value: '0 (None)', key: 'ex_none' },
    { value: '1-2 times', key: 'ex_12' },
    { value: '3-4 times', key: 'ex_34' },
    { value: '5+ times', key: 'ex_5' }
];
const MEALS_OPTS = [
    { value: '2 meals', key: 'meals_2' },
    { value: '3 meals', key: 'meals_3' },
    { value: '4+ meals', key: 'meals_4' }
];
const STRESS_OPTS = [
    { value: 'Low', key: 'stress_low' },
    { value: 'Moderate', key: 'stress_moderate' },
    { value: 'High', key: 'stress_high' }
];
const GOAL_OPTS = [
    { value: 'Better health', key: 'goal_health' },
    { value: 'Lose weight', key: 'goal_lose' },
    { value: 'Gain muscle', key: 'goal_gain_muscle' }
];
const SLEEP_OPTS = ['5', '6', '7', '8', '9', '10'];

const optBtnStyle = (active) => ({
    flex: 1,
    padding: '12px 8px',
    borderRadius: '14px',
    fontSize: '0.8rem',
    fontWeight: 'bold',
    border: active ? '2px solid #10B981' : '2px solid #F3F4F6',
    background: active ? '#ECFDF5' : '#FFF',
    color: active ? '#059669' : '#6B7280',
    cursor: 'pointer',
    transition: 'all 0.2s'
});

export const Onboarding = ({ step, setStep, formData, updateData, saveProfileToDb, setView }) => {
    const { t } = useTranslation();

    // 🛡️ Adım 1: gerçekçi yaş/boy/kilo kontrolü
    const handleStep1Next = () => {
        const errorKey = validateProfileNumbers(formData);
        if (errorKey) {
            alert(t(errorKey));
            return;
        }
        setStep(2);
    };

    return (
        <div className="card">
            <div className="main-content" style={{ paddingTop: '60px' }}>
                <div className="progress-dots">
                    <div className={`dot ${step >= 1 ? 'active' : ''}`}></div>
                    <div className={`dot ${step >= 2 ? 'active' : ''}`}></div>
                    <div className={`dot ${step >= 3 ? 'active' : ''}`}></div>
                </div>

                {step === 1 && (
                    <div className="animate-in">
                        <h2>{t('complete_profile')}</h2>
                        <div className="form-group">
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button className={`opt-btn ${formData.gender === 'Male' ? 'active' : ''}`} onClick={() => updateData('gender', 'Male')}>{t('male')}</button>
                                <button className={`opt-btn ${formData.gender === 'Female' ? 'active' : ''}`} onClick={() => updateData('gender', 'Female')}>{t('female')}</button>
                            </div>
                            <input type="number" min={PROFILE_LIMITS.age.min} max={PROFILE_LIMITS.age.max} placeholder={t('age_ph')} value={formData.age} onChange={(e) => updateData('age', e.target.value)} />
                            <div style={{ display: 'flex', gap: '15px' }}>
                                <input type="number" min={PROFILE_LIMITS.height.min} max={PROFILE_LIMITS.height.max} placeholder={t('height_ph')} value={formData.height} onChange={(e) => updateData('height', e.target.value)} />
                                <input type="number" min={PROFILE_LIMITS.weight.min} max={PROFILE_LIMITS.weight.max} placeholder={t('weight_ph')} value={formData.weight} onChange={(e) => updateData('weight', e.target.value)} />
                            </div>
                        </div>
                        <button className="primary" onClick={handleStep1Next}>{t('next_step')}</button>
                    </div>
                )}

                {step === 2 && (
                    <div className="animate-in">
                        <h2>{t('lifestyle_title')}</h2>
                        <div className="form-group">
                            <label>{t('exercise_label')}</label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                {EXERCISE_OPTS.map(opt => (
                                    <button key={opt.value} style={optBtnStyle(formData.exercise === opt.value)} onClick={() => updateData('exercise', opt.value)}>
                                        {t(opt.key)}
                                    </button>
                                ))}
                            </div>

                            <div style={{ display: 'flex', gap: '15px' }}>
                                <div style={{ flex: 1 }}>
                                    <label>{t('sleep_label')}</label>
                                    <select value={formData.sleep} onChange={(e) => updateData('sleep', e.target.value)} style={{ marginTop: '8px' }}>
                                        {SLEEP_OPTS.map(s => <option key={s} value={s}>{s} {t('hours')}</option>)}
                                    </select>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label>{t('meals_label')}</label>
                                    <select value={formData.meals} onChange={(e) => updateData('meals', e.target.value)} style={{ marginTop: '8px' }}>
                                        {MEALS_OPTS.map(opt => <option key={opt.value} value={opt.value}>{t(opt.key)}</option>)}
                                    </select>
                                </div>
                            </div>

                            <label>{t('stress_label')}</label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                {STRESS_OPTS.map(opt => (
                                    <button key={opt.value} style={optBtnStyle(formData.stress === opt.value)} onClick={() => updateData('stress', opt.value)}>
                                        {t(opt.key)}
                                    </button>
                                ))}
                            </div>

                            <label>{t('goal_label')}</label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                {GOAL_OPTS.map(opt => (
                                    <button key={opt.value} style={optBtnStyle(formData.goal === opt.value)} onClick={() => updateData('goal', opt.value)}>
                                        {t(opt.key)}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <button className="primary" onClick={() => setStep(3)}>{t('next_step')}</button>
                    </div>
                )}

                {step >= 3 && (
                    <div className="animate-in" style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '4rem', margin: '30px 0 10px 0' }}>🎉</div>
                        <h2>{t('all_ready')}</h2>
                        <p style={{ color: '#6B7280', margin: '10px 0 25px 0', fontSize: '0.95rem' }}>{t('onboarding_done_desc')}</p>
                        <button className="primary" onClick={() => { saveProfileToDb(formData); setView('dashboard'); }}>{t('go_dashboard')}</button>
                    </div>
                )}
            </div>
        </div>
    );
};
