import React from 'react';

export const BottomNav = ({ activeTab, setActiveTab }) => {

    const getIcon = (tab, isActive) => {
        const color = isActive ? '#10B981' : '#94A3B8';
        const size = 26;

        switch (tab) {
            case 'home': return <svg width={size} height={size} viewBox="0 0 24 24" fill={isActive ? color : "none"} stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>;
            case 'diet': return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>;
            case 'health': return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>;
            case 'water': return <svg width={size} height={size} viewBox="0 0 24 24" fill={isActive ? color : "none"} stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path></svg>;
            case 'profile': return <svg width={size} height={size} viewBox="0 0 24 24" fill={isActive ? color : "none"} stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
            default: return null;
        }
    };

    const tabs = ['home', 'diet', 'health', 'water', 'profile'];

    return (
        <div style={{
            position: 'absolute', // "fixed" yerine "absolute" yaptık ki ana çerçevenin (400px kılıf) dışına çıkamasın
            bottom: 0,
            left: 0,
            width: '100%',
            background: 'var(--bg-card)',
            borderTop: '1px solid var(--border-subtle)',
            boxShadow: '0 -10px 25px rgba(0,0,0,0.03)',
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            padding: '12px 0 25px 0',
            zIndex: 1000,
            borderTopLeftRadius: '32px',
            borderTopRightRadius: '32px',
            borderBottomLeftRadius: '38px', // Kılıfın kavislerine cuk otursun diye
            borderBottomRightRadius: '38px'
        }}>
            {tabs.map((tab) => {
                const isActive = activeTab === tab;
                return (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            cursor: 'pointer',
                            flex: 1,
                            transition: 'all 0.3s ease',
                            transform: isActive ? 'translateY(-4px)' : 'translateY(0)'
                        }}
                    >
                        {getIcon(tab, isActive)}
                        {isActive && (
                            <span style={{
                                width: '5px',
                                height: '5px',
                                background: '#10B981',
                                borderRadius: '50%',
                                marginTop: '6px',
                                boxShadow: '0 0 5px rgba(16, 185, 129, 0.5)'
                            }}></span>
                        )}
                    </button>
                );
            })}
        </div>
    );
};