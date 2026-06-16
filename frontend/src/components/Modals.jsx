import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { getFoodEmoji } from '../foodImages';

// 🥗 7 GÜNLÜK BESLENME PLANI MODALI (Akordeon Tasarımı)
export const MealModal = ({ setShowMealModal, mealPlan, mealTarget, onChooseIngredients }) => {
    const { t } = useTranslation();
    const [expandedDay, setExpandedDay] = useState(1);

    const getIconForMeal = (mealName) => {
        if (!mealName) return '🍎';
        const name = String(mealName).toLowerCase();
        if (name.includes('breakfast') || name.includes('kahvaltı')) return '🍳';
        if (name.includes('lunch') || name.includes('öğle')) return '🍗';
        if (name.includes('dinner') || name.includes('akşam')) return '🐟';
        if (name.includes('snack') || name.includes('ara öğün')) return '🥜';
        return '🍎';
    };

    return (
        <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
            <div className="animate-in" style={{ background: 'var(--bg-card)', padding: '25px', borderRadius: '32px', width: '100%', maxWidth: '400px', maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', position: 'relative' }}>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-main)', fontWeight: '900' }}>{t('weekly_meal_plan')} 🥗</h3>
                    <button onClick={() => setShowMealModal(false)} style={{ background: 'var(--bg-app)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', color: 'var(--text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>✕</button>
                </div>

                {/* 🎯 AI'ın hesapladığı günlük kalori hedefi */}
                {mealTarget && mealPlan && mealPlan.length > 0 && (
                    <div style={{ background: 'rgba(16,185,129,0.1)', borderRadius: '14px', padding: '10px 15px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1rem' }}>🎯</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#059669' }}>{mealTarget} kcal / {t('day', 'Gün').toLowerCase()}</span>
                    </div>
                )}

                {mealPlan && mealPlan.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {mealPlan.map((dayData, idx) => (
                            <div key={idx} style={{ border: '1px solid var(--border-subtle)', borderRadius: '20px', overflow: 'hidden' }}>
                                <div
                                    onClick={() => setExpandedDay(expandedDay === dayData.day ? null : dayData.day)}
                                    style={{ padding: '16px 20px', background: expandedDay === dayData.day ? '#10B981' : 'var(--bg-app)', color: expandedDay === dayData.day ? 'white' : 'var(--text-main)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontWeight: '800', transition: 'all 0.2s' }}
                                >
                                    <span>{t('day', 'Gün')} {dayData.day || (idx + 1)}</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        {typeof dayData.total_calories === 'number' && (
                                            <span style={{ fontSize: '0.7rem', fontWeight: '800', background: expandedDay === dayData.day ? 'rgba(255,255,255,0.25)' : 'rgba(16,185,129,0.12)', color: expandedDay === dayData.day ? 'white' : '#059669', padding: '3px 8px', borderRadius: '8px' }}>
                                                {dayData.total_calories} kcal
                                            </span>
                                        )}
                                        <span>{expandedDay === dayData.day ? '−' : '+'}</span>
                                    </span>
                                </div>

                                {expandedDay === dayData.day && dayData.meals && (
                                    <div style={{ padding: '15px', display: 'flex', flexDirection: 'column', gap: '15px', background: 'var(--bg-card)' }}>
                                        {dayData.meals.map((meal, i) => (
                                            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '15px' }}>
                                                <div style={{ fontSize: '1.5rem', background: 'var(--bg-app)', width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', flexShrink: 0 }}>
                                                    {getIconForMeal(meal.meal)}
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                                        <h5 style={{ margin: 0, color: '#10B981', fontSize: '0.95rem', fontWeight: '800' }}>{meal.meal}</h5>
                                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 'bold' }}>
                                                            {typeof meal.calories === 'number' ? `${meal.calories} kcal · ` : ''}{meal.time}
                                                        </span>
                                                    </div>
                                                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: '1.4' }}>{meal.description}</p>
                                                    {meal.portion && (
                                                        <p style={{ margin: '3px 0 0 0', fontSize: '0.75rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>{meal.portion}</p>
                                                    )}
                                                    {typeof meal.protein_g === 'number' && (
                                                        <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                                                            <span style={{ fontSize: '0.65rem', fontWeight: '800', background: 'rgba(16,185,129,0.1)', color: '#059669', padding: '2px 7px', borderRadius: '7px' }}>P {meal.protein_g}g</span>
                                                            <span style={{ fontSize: '0.65rem', fontWeight: '800', background: 'rgba(59,130,246,0.1)', color: '#2563EB', padding: '2px 7px', borderRadius: '7px' }}>C {meal.carbs_g}g</span>
                                                            <span style={{ fontSize: '0.65rem', fontWeight: '800', background: 'rgba(245,158,11,0.12)', color: '#D97706', padding: '2px 7px', borderRadius: '7px' }}>F {meal.fat_g}g</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ padding: '30px 20px 10px 20px', textAlign: 'center', color: 'var(--text-dim)' }}>
                        <p>{t('no_diet_plan_yet', 'Henüz bir diyet planı oluşturulmadı.')}<br />{t('add_items_to_cart', "Sepetten malzemelerini seçip AI'a hazırlat! 🍳")}</p>
                        {/* 🛒 Boş durumdan direkt malzeme seçimine git */}
                        <button
                            onClick={onChooseIngredients}
                            style={{ marginTop: '25px', width: '100%', padding: '16px', borderRadius: '18px', background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: '800', fontSize: '1rem', boxShadow: '0 8px 20px rgba(16,185,129,0.3)' }}
                        >
                            {t('choose_ingredients')}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// ⚡ 7 GÜNLÜK ANTRENMAN MODALI (Akordeon Tasarımı)
export const WorkoutModal = ({ workoutPlan, setShowWorkoutModal, onCreateWorkout }) => {
    const { t } = useTranslation();
    const [expandedDay, setExpandedDay] = useState(1);

    // Egzersizler hem yeni yapısal format (dizi) hem eski düz metin olabilir
    const renderExercises = (exercises) => {
        if (Array.isArray(exercises)) {
            return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {exercises.map((ex, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-app)', padding: '10px 14px', borderRadius: '12px' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)' }}>{ex.name}</span>
                            <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#3B82F6', whiteSpace: 'nowrap', marginLeft: '10px' }}>
                                {ex.sets}×{ex.reps}{ex.rest_sec ? ` · ⏸ ${ex.rest_sec}s` : ''}
                            </span>
                        </div>
                    ))}
                </div>
            );
        }
        return (
            <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: '1.7', color: 'var(--text-main)', whiteSpace: 'pre-line' }}>
                {exercises}
            </p>
        );
    };

    return (
        <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
            <div className="animate-in" style={{ background: 'var(--bg-card)', padding: '25px', borderRadius: '32px', width: '100%', maxWidth: '400px', maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '15px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-main)', fontWeight: '900' }}>{t('weekly_workout_plan')} ⚡</h3>
                    <button onClick={() => setShowWorkoutModal(false)} style={{ background: 'var(--bg-app)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', color: 'var(--text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>✕</button>
                </div>

                {workoutPlan && workoutPlan.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {workoutPlan.map((dayData, idx) => (
                            <div key={idx} style={{ border: '1px solid var(--border-subtle)', borderRadius: '20px', overflow: 'hidden' }}>
                                <div
                                    onClick={() => setExpandedDay(expandedDay === dayData.day ? null : dayData.day)}
                                    style={{ padding: '16px 20px', background: expandedDay === dayData.day ? '#3B82F6' : 'var(--bg-app)', color: expandedDay === dayData.day ? 'white' : 'var(--text-main)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontWeight: '800', transition: 'all 0.2s', gap: '10px' }}
                                >
                                    <span style={{ fontSize: '0.9rem' }}>
                                        {dayData.is_rest_day ? '😴 ' : ''}{t('day', 'Gün')} {dayData.day || (idx + 1)}: {dayData.is_rest_day ? t('rest_day') : dayData.focus}
                                    </span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                                        {!dayData.is_rest_day && typeof dayData.duration_min === 'number' && (
                                            <span style={{ fontSize: '0.7rem', fontWeight: '800', background: expandedDay === dayData.day ? 'rgba(255,255,255,0.25)' : 'rgba(59,130,246,0.12)', color: expandedDay === dayData.day ? 'white' : '#2563EB', padding: '3px 8px', borderRadius: '8px' }}>
                                                ⏱ {dayData.duration_min}'
                                            </span>
                                        )}
                                        <span>{expandedDay === dayData.day ? '−' : '+'}</span>
                                    </span>
                                </div>

                                {expandedDay === dayData.day && (
                                    <div style={{ padding: '20px', background: 'var(--bg-card)' }}>
                                        {(!dayData.is_rest_day || (Array.isArray(dayData.exercises) && dayData.exercises.length > 0)) && (
                                            <>
                                                <h5 style={{ margin: '0 0 10px 0', color: 'var(--text-dim)', fontSize: '0.75rem', textTransform: 'uppercase' }}>{t('workout_details', 'Egzersiz Detayları')}</h5>
                                                {renderExercises(dayData.exercises)}
                                            </>
                                        )}
                                        {dayData.notes && (
                                            <p style={{ margin: '12px 0 0 0', fontSize: '0.8rem', color: 'var(--text-dim)', fontStyle: 'italic', lineHeight: '1.5' }}>💡 {dayData.notes}</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ padding: '30px 20px 10px 20px', textAlign: 'center', color: 'var(--text-dim)' }}>
                        <p>{t('no_workout_plan_yet', 'Henüz bir plan oluşturulmadı.')}<br />{t('go_to_health_tab_plan')}</p>
                        {/* ⚡ Boş durumdan direkt antrenman anketine git */}
                        <button
                            onClick={onCreateWorkout}
                            style={{ marginTop: '25px', width: '100%', padding: '16px', borderRadius: '18px', background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: '800', fontSize: '1rem', boxShadow: '0 8px 20px rgba(59,130,246,0.3)' }}
                        >
                            ✨ {t('generate_workout')}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// 🛒 MARKET SEPETİ MODALI
export const CartModal = ({ inventory, setShowList, toggleFood, handleGenerateRecipes, isGenerating }) => {
    const { t } = useTranslation();
    return (
        <div className="inventory-modal" style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
            <div className="modal-content animate-in" style={{ background: 'var(--bg-card)', padding: '25px', borderRadius: '32px', width: '100%', maxWidth: '400px', maxHeight: '85vh', overflowY: 'auto' }}>
                <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0 }}>{t('my_cart', 'Sepetim')} ({inventory.length})</h3>
                    <button className="close-modal" onClick={() => setShowList(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--text-main)' }}>✕</button>
                </div>

                {inventory.length === 0 && (
                    <p style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '25px 10px' }}>{t('cart_empty')}</p>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                    {inventory.map(item => (
                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-app)', padding: '12px 15px', borderRadius: '12px' }}>
                            <span style={{ fontWeight: 'bold' }}>{getFoodEmoji(item.name)} {item.name}</span>
                            <button onClick={() => toggleFood(item)} style={{ background: '#EF4444', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem' }}>{t('remove', 'Sil')}</button>
                        </div>
                    ))}
                </div>

                {inventory.length > 0 && (
                    <button
                        onClick={handleGenerateRecipes}
                        disabled={isGenerating}
                        style={{ width: '100%', padding: '18px', borderRadius: '16px', background: isGenerating ? 'var(--bg-input)' : '#10B981', color: isGenerating ? 'var(--text-dim)' : 'white', fontWeight: '800', border: 'none', cursor: isGenerating ? 'default' : 'pointer' }}
                    >
                        {isGenerating ? t('generating', 'Hazırlanıyor... ⏳') : t('generate_recipes', 'AI Tarif Oluştur ✨')}
                    </button>
                )}
            </div>
        </div>
    );
};

// 👁️ VISION AI MODALI
export const VisionAnalysisModal = ({ onClose, onAnalyze, isAnalyzing, analysisResult }) => {
    const { t } = useTranslation();
    const [preview, setPreview] = useState(null);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const fileRef = useRef(null);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
            videoRef.current.srcObject = stream;
            setIsCameraActive(true);
        } catch {
            alert(t('camera_error', "Kamera açılamadı! Lütfen izinleri kontrol edin."));
        }
    };

    const takePhoto = () => {
        const canvas = canvasRef.current;
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
        const data = canvas.toDataURL('image/jpeg');
        setPreview(data);
        videoRef.current.srcObject.getTracks().forEach(t => t.stop());
        setIsCameraActive(false);
        onAnalyze(data.split(',')[1]);
    };


    const handleFileUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            const data = reader.result;
            setPreview(data);
            onAnalyze(String(data).split(',')[1]);
        };
        reader.readAsDataURL(file);
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10001, padding: '20px' }}>
            <div style={{ width: '100%', maxWidth: '400px', background: 'var(--bg-card)', borderRadius: '32px', padding: '25px', position: 'relative' }}>
                <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                    <h3 style={{ margin: 0 }}>{t('ai_scanner', 'AI Scanner 🤖')}</h3>
                    <button onClick={onClose} style={{ position: 'absolute', right: '20px', top: '20px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.2rem', color: 'var(--text-main)' }}>✕</button>
                </div>
                <div style={{ width: '100%', height: '280px', background: '#000', borderRadius: '24px', overflow: 'hidden', marginBottom: '20px', position: 'relative' }}>
                    {!preview && <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                    {preview && <img src={preview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                    <canvas ref={canvasRef} style={{ display: 'none' }} />
                    {isAnalyzing && (
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>{t('analyzing', 'Analiz Ediliyor...')}</div>
                    )}
                </div>
                {analysisResult && (
                    <div style={{ background: 'var(--bg-app)', padding: '15px', borderRadius: '20px', marginBottom: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                            <h4 style={{ color: '#10B981', margin: 0 }}>
                                {analysisResult.food_name}
                                {analysisResult.calories_estimate ? ` · ~${analysisResult.calories_estimate} kcal` : ''}
                            </h4>
                            {typeof analysisResult.health_score === 'number' && (
                                <span style={{ flexShrink: 0, fontSize: '0.75rem', fontWeight: '900', padding: '4px 9px', borderRadius: '10px', background: analysisResult.health_score >= 7 ? 'rgba(16,185,129,0.15)' : analysisResult.health_score >= 4 ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)', color: analysisResult.health_score >= 7 ? '#059669' : analysisResult.health_score >= 4 ? '#D97706' : '#DC2626' }}>
                                    ❤️ {analysisResult.health_score}/10
                                </span>
                            )}
                        </div>
                        {analysisResult.portion_estimate && (
                            <p style={{ margin: '0 0 6px 0', fontSize: '0.75rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>{analysisResult.portion_estimate}</p>
                        )}
                        {typeof analysisResult.protein_g === 'number' && (
                            <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                                <span style={{ fontSize: '0.65rem', fontWeight: '800', background: 'rgba(16,185,129,0.1)', color: '#059669', padding: '2px 7px', borderRadius: '7px' }}>P {analysisResult.protein_g}g</span>
                                <span style={{ fontSize: '0.65rem', fontWeight: '800', background: 'rgba(59,130,246,0.1)', color: '#2563EB', padding: '2px 7px', borderRadius: '7px' }}>C {analysisResult.carbs_g}g</span>
                                <span style={{ fontSize: '0.65rem', fontWeight: '800', background: 'rgba(245,158,11,0.12)', color: '#D97706', padding: '2px 7px', borderRadius: '7px' }}>F {analysisResult.fat_g}g</span>
                            </div>
                        )}
                        <p style={{ margin: 0, fontSize: '0.85rem' }}>{analysisResult.analysis || analysisResult.analysis_tr}</p>
                        {analysisResult.tip && (
                            <p style={{ margin: '8px 0 0 0', fontSize: '0.8rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>💡 {analysisResult.tip}</p>
                        )}
                    </div>
                )}
                {!isCameraActive && !preview && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <button onClick={startCamera} style={{ width: '100%', padding: '16px', borderRadius: '18px', background: '#10B981', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>{t('open_camera', 'Kamerayı Aç')}</button>
                        <button onClick={() => fileRef.current?.click()} style={{ width: '100%', padding: '16px', borderRadius: '18px', background: 'var(--bg-app)', color: 'var(--text-main)', border: '1px solid var(--border-subtle)', cursor: 'pointer', fontWeight: 'bold' }}>📁 {t('upload_photo')}</button>
                        <input ref={fileRef} type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
                    </div>
                )}
                {isCameraActive && !isAnalyzing && <button onClick={takePhoto} style={{ width: '100%', padding: '16px', borderRadius: '18px', background: '#10B981', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>{t('capture', 'Fotoğrafı Çek')}</button>}
            </div>
        </div>
    );
};