import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getFoodEmoji, getFoodImageUrl } from '../foodImages';

const DietTab = ({
    searchQuery,
    setSearchQuery,
    inventory,
    setShowList,
    foodData,
    toggleFood,
    setShowVisionModal
}) => {
    const { t } = useTranslation();

    // 📂 Kategori bazlı "Tümünü Gör" durumu
    const [expandedCats, setExpandedCats] = useState({});
    const toggleCat = (cat) => setExpandedCats(prev => ({ ...prev, [cat]: !prev[cat] }));

    // 🍎 Arama Sorgusuna Göre Verileri Filtrele
    const filteredFoodData = {};
    Object.keys(foodData).forEach(category => {
        const filteredItems = foodData[category].filter(food =>
            food.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        if (filteredItems.length > 0) {
            filteredFoodData[category] = filteredItems;
        }
    });

    // 🃏 Tek ürün kartı (rayda dar, gridde %50 genişlik)
    const renderFoodCard = (food, isExpanded) => {
        const isSelected = inventory.find(i => i.id === food.id);
        const imgUrl = getFoodImageUrl(food.name);
        return (
            <div
                key={food.id}
                onClick={() => toggleFood(food)}
                style={{
                    ...(isExpanded
                        ? { width: 'calc(50% - 6px)', boxSizing: 'border-box' }
                        : { minWidth: '140px', maxWidth: '140px' }),
                    background: 'var(--bg-card)', borderRadius: '22px',
                    padding: '14px', textAlign: 'left', position: 'relative', cursor: 'pointer',
                    boxShadow: isSelected ? '0 8px 20px rgba(16, 185, 129, 0.15)' : '0 4px 15px rgba(0,0,0,0.03)',
                    border: isSelected ? '2px solid #10B981' : '2px solid transparent',
                    transition: 'all 0.2s ease'
                }}
            >
                {/* 🖼️ Ürün görseli: fotoğraf varsa fotoğraf, yoksa/yüklenemezse emoji */}
                <div style={{ position: 'relative', width: '100%', height: '64px', borderRadius: '14px', background: 'var(--bg-input)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px', overflow: 'hidden' }}>
                    <span style={{ fontSize: '2rem', lineHeight: 1 }}>{getFoodEmoji(food.name)}</span>
                    {imgUrl && (
                        <img
                            src={imgUrl}
                            alt={food.name}
                            loading="lazy"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'contain', background: '#fff' }}
                        />
                    )}
                </div>

                <h5 style={{ margin: '0 0 10px 0', fontSize: '0.95rem', color: 'var(--text-main)', fontWeight: '800' }}>
                    {food.name}
                </h5>

                <div style={{ background: 'var(--bg-input)', padding: '5px 10px', borderRadius: '10px', display: 'inline-block', marginBottom: '12px' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 'bold' }}>
                        P: {food.protein}g &nbsp; F: {food.fat}g
                    </span>
                </div>

                <div style={{ color: '#10B981', fontSize: '0.75rem', fontWeight: 'bold' }}>
                    ✨ {food.vitamin}
                </div>

                {/* ✓ "Bu ürün sepetimde" rozeti */}
                {isSelected && (
                    <div style={{
                        position: 'absolute', top: '8px', right: '8px', width: '24px', height: '24px',
                        borderRadius: '50%', background: '#10B981', color: 'white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.85rem', fontWeight: '900', zIndex: 2,
                        border: '2px solid var(--bg-card)', boxShadow: '0 2px 8px rgba(16,185,129,0.5)'
                    }}>✓</div>
                )}
            </div>
        );
    };

    return (
        <div className="animate-in diet-view" style={{ padding: '10px 5px 100px 5px', display: 'flex', flexDirection: 'column' }}>

            {/* 🔍 ÜST PANEL: BAŞLIK + ARAMA + KAMERA + SEPET */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px' }}>

                {/* Sol Başlık */}
                <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '900', color: 'var(--text-main)', marginRight: 'auto' }}>
                    {t('diet')}
                </h2>

                {/* Arama Kutusu */}
                <div style={{ position: 'relative', flex: 1, maxWidth: '140px' }}>
                    <input
                        type="text"
                        placeholder={t('search_place')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%', padding: '12px 15px', borderRadius: '16px', border: '1px solid var(--border-subtle)',
                            background: 'var(--bg-card)', color: 'var(--text-main)', fontSize: '0.85rem',
                            outline: 'none', boxShadow: 'var(--shadow-card)', transition: 'all 0.3s ease'
                        }}
                    />
                </div>

                {/* 📷 AI Scanner Kamera Butonu */}
                <button
                    title={t('open_camera', 'Kamerayı Aç')}
                    onClick={() => setShowVisionModal(true)}
                    style={{
                        width: '46px', height: '46px', borderRadius: '16px', background: 'var(--bg-card)',
                        border: '1px solid var(--border-subtle)', cursor: 'pointer', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', boxShadow: 'var(--shadow-card)', transition: 'all 0.2s ease',
                        color: 'var(--text-dim)'
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.color = '#10B981'; e.currentTarget.style.borderColor = '#10B981'; }}
                    onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.color = 'var(--text-dim)'; e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
                >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                        <circle cx="12" cy="13" r="4"></circle>
                    </svg>
                </button>

                {/* 🛒 Sepet Butonu */}
                <div style={{ position: 'relative' }}>
                    <button
                        title={t('my_cart', 'Sepetim')}
                        onClick={() => setShowList(true)}
                        style={{
                            width: '46px', height: '46px', borderRadius: '16px', background: 'var(--bg-card)',
                            border: '1px solid var(--border-subtle)', cursor: 'pointer', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', boxShadow: 'var(--shadow-card)', transition: 'all 0.2s ease',
                            color: 'var(--text-dim)'
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.color = '#3B82F6'; e.currentTarget.style.borderColor = '#3B82F6'; }}
                        onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.color = 'var(--text-dim)'; e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
                    >
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="9" cy="21" r="1"></circle>
                            <circle cx="20" cy="21" r="1"></circle>
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                        </svg>
                    </button>
                    {/* Sepet Bildirim Balonu */}
                    {inventory.length > 0 && (
                        <span style={{
                            position: 'absolute', top: '-6px', right: '-6px', background: '#EF4444',
                            color: 'white', borderRadius: '50%', width: '22px', height: '22px',
                            fontSize: '0.75rem', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', fontWeight: '900', border: '2px solid var(--bg-card)',
                            boxShadow: '0 2px 6px rgba(239, 68, 68, 0.4)'
                        }}>
                            {inventory.length}
                        </span>
                    )}
                </div>
            </div>

            {/* 🍎 KATEGORİLER: yatay ray + "Tümünü Gör" grid genişletmesi */}
            <div style={{ width: '100%' }}>
                {Object.keys(filteredFoodData).length === 0 ? (
                    <p style={{ textAlign: 'center', marginTop: '30px', color: 'var(--text-dim)' }}>{t('no_products_found')}</p>
                ) : (
                    Object.keys(filteredFoodData).map(category => {
                        const items = filteredFoodData[category];
                        const isExpanded = !!expandedCats[category];
                        return (
                            <div key={category} style={{ marginBottom: '35px', textAlign: 'left' }}>

                                {/* Kategori Başlığı + Tümünü Gör */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                    <h4 style={{ margin: 0, color: '#7E8A9A', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '800' }}>
                                        {t(category.toLowerCase())}
                                    </h4>
                                    {items.length > 2 && (
                                        <button
                                            onClick={() => toggleCat(category)}
                                            style={{ background: 'none', border: 'none', color: '#10B981', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer', padding: '4px 0', whiteSpace: 'nowrap' }}
                                        >
                                            {isExpanded ? `${t('show_less')} ▲` : `${t('see_all')} (${items.length}) ▼`}
                                        </button>
                                    )}
                                </div>

                                {/* Genişletilmiş: 2 sütunlu grid | Kapalı: yatay kaydırma rayı */}
                                <div style={isExpanded
                                    ? { display: 'flex', flexWrap: 'wrap', gap: '12px' }
                                    : { display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '10px', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }
                                }>
                                    {items.map(food => renderFoodCard(food, isExpanded))}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default DietTab;
