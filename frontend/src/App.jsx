import { useState, useEffect } from 'react';
import foodData from './foodData';
import './App.css';
import './i18n';
import { useTranslation } from 'react-i18next';

// 📦 COMPONENTLERİ İÇERİ AKTAR
import HomeTab from './components/HomeTab.jsx';
import DietTab from './components/DietTab.jsx';
import HealthTab from './components/HealthTab.jsx';
import WaterTab from './components/WaterTab.jsx';
import ProfileTab from './components/ProfileTab.jsx';
import { Login, Register, Onboarding } from './components/Auth.jsx';
import { BottomNav } from './components/BottomNav.jsx';
import { MealModal, WorkoutModal, CartModal, VisionAnalysisModal } from './components/Modals.jsx';
import WorkoutSurveyModal from './components/WorkoutSurveyModal.jsx';

// 🌍 BACKEND ADRESİ (Capacitor/farklı ortamlar için env ile değiştirilebilir)
const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

// 🔐 Korunan isteklere oturum token'ını ekler
const authHeaders = () => {
  const token = localStorage.getItem('vitalsync_token');
  const h = { 'Content-Type': 'application/json' };
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
};

const EMPTY_FORM = {
  name: '', email: '', password: '', gender: 'Male', age: '', height: '', weight: '',
  exercise: '0 (None)', water: '2', sleep: '8', meals: '3 meals', stress: 'Moderate', goal: 'Better health', customGoal: ''
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function App() {
  const { t, i18n } = useTranslation();

  // 🧠 STATE'LER
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('vitalsync_dark') === 'true');
  // Kayıtlı oturum varsa direkt dashboard'da başla (lazy init — mount'ta state çakışması yok)
  const [view, setView] = useState(() => (localStorage.getItem('vitalsync_user') ? 'dashboard' : 'login'));
  const [activeTab, setActiveTab] = useState('home');
  const [step, setStep] = useState(1);
  const [inventory, setInventory] = useState([]);
  const [showList, setShowList] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Modallar
  const [showMealModal, setShowMealModal] = useState(false);
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [showWorkoutSurvey, setShowWorkoutSurvey] = useState(false);
  const [expandedDay, setExpandedDay] = useState(null);

  // AI Sonuçları
  const [workoutPlan, setWorkoutPlan] = useState(null);
  const [mealPlan, setMealPlan] = useState(null);
  const [mealTarget, setMealTarget] = useState(null); // AI planının günlük kalori hedefi
  const [isGeneratingWorkout, setIsGeneratingWorkout] = useState(false);

  // 📸 VISION AI STATE'LERİ
  const [showVisionModal, setShowVisionModal] = useState(false);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [visionAnalysisResult, setVisionAnalysisResult] = useState(null);

  // 📜 BACKEND'DEN GELEN GEÇMİŞLER (antrenman + beslenme)
  const [workoutHistory, setWorkoutHistory] = useState([]);
  const [nutritionHistory, setNutritionHistory] = useState([]);

  // 💧 SU TAKİBİ
  const [currentWater, setCurrentWater] = useState(() => {
    const today = new Date().toLocaleDateString('tr-TR');
    const savedDate = localStorage.getItem('vitalsync_water_date');
    const savedWater = localStorage.getItem('vitalsync_water_current');

    if (savedDate === today && savedWater !== null) {
      return parseFloat(savedWater);
    }

    if (savedDate && savedDate !== today) {
      const history = JSON.parse(localStorage.getItem('vitalsync_water_history')) || {};
      history[savedDate] = parseFloat(savedWater || 0);
      localStorage.setItem('vitalsync_water_history', JSON.stringify(history));
    }

    localStorage.setItem('vitalsync_water_date', today);
    localStorage.setItem('vitalsync_water_current', '0');
    return 0;
  });

  const [showWaterSettings, setShowWaterSettings] = useState(false);
  const [showWaterHistory, setShowWaterHistory] = useState(false);

  // 🔔 HATIRLATICI AYARLARI
  const [reminderEnabled, setReminderEnabled] = useState(() => localStorage.getItem('vitalsync_reminder_enabled') === 'true');
  const [reminderHours, setReminderHours] = useState(() => parseInt(localStorage.getItem('vitalsync_reminder_hours')) || 2);

  // ⚙️ OTURUM (LOCALSTORAGE) — kayıtlı kullanıcıyı geri yükle
  const [formData, setFormData] = useState(() => {
    try {
      const savedUser = localStorage.getItem('vitalsync_user');
      return savedUser ? { ...EMPTY_FORM, ...JSON.parse(savedUser) } : EMPTY_FORM;
    } catch {
      return EMPTY_FORM;
    }
  });

  // 🚪 ÇIKIŞ: oturum sadece kullanıcı isteyince temizlenir (mount'ta DEĞİL)
  const handleLogout = () => {
    localStorage.removeItem('vitalsync_user');
    localStorage.removeItem('vitalsync_token');
    setFormData(EMPTY_FORM);
    setMealPlan(null);
    setWorkoutPlan(null);
    setInventory([]);
    setActiveTab('home');
    setStep(1);
    setView('login');
  };

  useEffect(() => {
    document.body.classList.toggle('dark-mode', isDarkMode);
    localStorage.setItem('vitalsync_dark', isDarkMode);
  }, [isDarkMode]);

  // 📜 ANTRENMAN VE BESLENME GEÇMİŞİNİ BACKEND'DEN ÇEK
  const loadHistories = async () => {
    if (!formData.email) return;
    try {
      const mail = encodeURIComponent(formData.email.trim());
      const [wRes, nRes] = await Promise.all([
        fetch(`${API_BASE}/workout-history/${mail}`, { headers: authHeaders() }),
        fetch(`${API_BASE}/nutrition-history/${mail}`, { headers: authHeaders() })
      ]);
      if (wRes.ok) setWorkoutHistory(await wRes.json());
      if (nRes.ok) setNutritionHistory(await nRes.json());
    } catch {
      /* geçmiş kritik değil; sessizce geç */
    }
  };

  // Giriş yapıldığında / dashboard açıldığında geçmişi yükle
  useEffect(() => {
    if (view === 'dashboard' && formData.email) loadHistories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, formData.email]);

  // 💧 KULLANICI SU İÇTİKÇE ANINDA HAFIZAYA KAZI
  useEffect(() => {
    localStorage.setItem('vitalsync_water_current', currentWater.toString());
  }, [currentWater]);

  // 🔔 HATIRLATICI AYARLARINI HAFIZAYA KAZI
  useEffect(() => {
    localStorage.setItem('vitalsync_reminder_enabled', reminderEnabled);
    localStorage.setItem('vitalsync_reminder_hours', reminderHours);
  }, [reminderEnabled, reminderHours]);

  // 🕛 GECE 12 NÖBETÇİSİ VE AKILLI BİLDİRİM MOTORU
  useEffect(() => {
    const interval = setInterval(() => {
      const today = new Date().toLocaleDateString('tr-TR');
      const savedDate = localStorage.getItem('vitalsync_water_date');

      if (savedDate && savedDate !== today) {
        const savedWater = localStorage.getItem('vitalsync_water_current');
        const history = JSON.parse(localStorage.getItem('vitalsync_water_history')) || {};
        history[savedDate] = parseFloat(savedWater || 0);
        localStorage.setItem('vitalsync_water_history', JSON.stringify(history));

        setCurrentWater(0);
        localStorage.setItem('vitalsync_water_current', '0');
        localStorage.setItem('vitalsync_water_date', today);
      }

      if (reminderEnabled) {
        const lastDrink = parseInt(localStorage.getItem('vitalsync_last_drink_time') || Date.now().toString());
        const hoursPassed = (Date.now() - lastDrink) / (1000 * 60 * 60);

        if (hoursPassed >= reminderHours) {
          const title = t('water_time_title', 'Su İçme Vakti! 💧');
          const body = t('water_time_desc', 'Bayağı oldu su içmeyeli. Hadi bir bardak su iç!');

          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, { body: body });
          } else {
            alert(`${title}\n${body}`);
          }
          localStorage.setItem('vitalsync_last_drink_time', Date.now().toString());
        }
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [reminderEnabled, reminderHours, t]);

  const changeDate = (days) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };
  const formatDisplayDate = (date) => date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' });
  const updateData = (key, value) => setFormData({ ...formData, [key]: value });
  const toggleFood = (food) => setInventory(prev => prev.find(i => i.id === food.id) ? prev.filter(i => i.id !== food.id) : [...prev, food]);

  // 🚀 GERÇEK BACKEND BAĞLANTILARI (AUTH)
  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      alert(t('fill_all_fields'));
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password
        })
      });

      if (res.ok) {
        // Backend artık tam profili döndürüyor (boy, kilo, yaş, su hedefi...)
        const data = await res.json();
        const updatedData = {
          ...formData,
          ...data,
          age: data.age ? String(data.age) : '',
          height: data.height ? String(data.height) : '',
          weight: data.weight ? String(data.weight) : '',
          water: String(data.water || 2)
        };

        if (data.token) localStorage.setItem('vitalsync_token', data.token);
        setFormData(updatedData);
        localStorage.setItem('vitalsync_user', JSON.stringify(updatedData));
        setView('dashboard');
      } else {
        alert(t('login_error'));
      }
    } catch {
      alert(t('server_error'));
    }
  };

  const handleRegister = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      alert(t('fill_all_fields'));
      return;
    }
    if (!EMAIL_RE.test(formData.email.trim())) {
      alert(t('invalid_email'));
      return;
    }
    if (formData.password.length < 6) {
      alert(t('password_min'));
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.email.trim(),
          name: formData.name,
          email: formData.email.trim(),
          password: formData.password
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.token) localStorage.setItem('vitalsync_token', data.token);
        setStep(1);
        setView('onboarding');
      } else {
        alert(t('email_taken'));
      }
    } catch {
      alert(t('server_error'));
    }
  };

  const saveProfileToDb = async (data) => {
    try {
      const res = await fetch(`${API_BASE}/update-profile`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          email: data.email,
          name: data.name || '',
          gender: data.gender || 'Male',
          age: parseInt(data.age) || 0,
          height: parseFloat(data.height) || 0,
          weight: parseFloat(data.weight) || 0,
          exercise: data.exercise || '0 (None)',
          sleep: data.sleep || '8',
          meals: data.meals || '3 meals',
          stress: data.stress || 'Moderate',
          goal: data.goal || 'Better health',
          water: parseFloat(data.water) || 2
        })
      });
      if (res.ok) {
        alert(t('profile_saved'));
        localStorage.setItem('vitalsync_user', JSON.stringify(data));
      } else {
        alert(t('update_failed'));
      }
    } catch {
      alert(t('server_error'));
    }
  };

  // 🔥 AI DİYET OLUŞTURMA FONKSİYONU
  const handleGenerateDiet = async () => {
    setIsGenerating(true);

    try {
      const res = await fetch(`${API_BASE}/api/generate-diet`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          email: formData.email?.trim(),
          inventory: inventory.map(item => item.name),
          lang: i18n.language
        })
      });

      const data = await res.json();

      if (res.ok && data.diet_plan) {
        setMealPlan(data.diet_plan);
        setMealTarget(data.daily_calories_target || null);
        setShowList(false);
        setShowMealModal(true);
      } else {
        alert(t('update_failed') + ' ' + (data.detail || ''));
      }
    } catch {
      alert(t('server_error'));
    } finally {
      setIsGenerating(false);
    }
  };

  // 🔥 AI ANTRENMAN OLUŞTURMA FONKSİYONU
  const handleGenerateWorkout = async (surveyData) => {
    setIsGeneratingWorkout(true);
    try {
      const res = await fetch(`${API_BASE}/api/generate-workout`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          email: formData.email,
          survey_data: surveyData,
          lang: i18n.language
        })
      });
      const data = await res.json();

      if (res.ok && data.workout_plan) {
        setWorkoutPlan(data.workout_plan);
        setShowWorkoutModal(true); // Program hazır olunca Modal'ı aç
        loadHistories(); // yeni kaydı geçmişe yansıt
      } else {
        alert(t('update_failed') + ' ' + (data.detail || ''));
      }
    } catch {
      alert(t('server_error'));
    } finally {
      setIsGeneratingWorkout(false);
    }
  };

  // 📸 GÖRSEL ANALİZ FONKSİYONU
  const handleAnalyzeImage = async (base64) => {
    setIsAnalyzingImage(true);
    try {
      const res = await fetch(`${API_BASE}/analyze-food-image`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ image_base64: base64, email: formData.email, lang: i18n.language })
      });
      const data = await res.json();
      if (res.ok) {
        setVisionAnalysisResult(data);
        loadHistories(); // taranan yemeği geçmişe yansıt
      } else {
        alert(t('analysis_failed'));
      }
    } catch {
      alert(t('analysis_failed'));
    } finally {
      setIsAnalyzingImage(false);
    }
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomeTab
            selectedDate={selectedDate}
            changeDate={changeDate}
            formatDisplayDate={formatDisplayDate}
            setShowMealModal={setShowMealModal}
            setShowWorkoutModal={setShowWorkoutModal}
            setShowWorkoutSurvey={setShowWorkoutSurvey}
            isGenerating={isGenerating}
            mealPlan={mealPlan}
            workoutPlan={workoutPlan}
            currentWater={currentWater}
            formData={formData}
          />
        );
      case 'diet': return <DietTab {...{ searchQuery, setSearchQuery, inventory, setShowList, foodData, toggleFood, setShowVisionModal }} />;
      case 'health': return <HealthTab {...{ formData, workoutPlan, setWorkoutPlan, isGeneratingWorkout, setShowWorkoutSurvey, expandedDay, setExpandedDay, workoutHistory, nutritionHistory }} />;
      case 'water': return <WaterTab {...{ currentWater, setCurrentWater, formData, reminderEnabled, setReminderEnabled, reminderHours, setReminderHours, updateData, saveProfileToDb, showWaterHistory, setShowWaterHistory, showWaterSettings, setShowWaterSettings }} />;
      case 'profile': return <ProfileTab {...{ formData, updateData, saveProfileToDb, isDarkMode, setIsDarkMode, handleLogout, apiBase: API_BASE }} />;
      default: return null;
    }
  };

  return (
    <div className="container">
      {view === 'login' && <Login formData={formData} updateData={updateData} handleLogin={handleLogin} setView={setView} />}
      {view === 'register' && <Register formData={formData} updateData={updateData} handleRegister={handleRegister} setView={setView} />}
      {view === 'onboarding' && <Onboarding step={step} setStep={setStep} formData={formData} updateData={updateData} saveProfileToDb={saveProfileToDb} setView={setView} />}

      {view === 'dashboard' && (
        <div className="card">
          <div className="main-content" style={{ paddingTop: '30px' }}>{renderTab()}</div>
          <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

          {/* 🔥 MODALLARIN RENDER EDİLDİĞİ YER */}
          {showWorkoutSurvey && <WorkoutSurveyModal setShowWorkoutModal={setShowWorkoutSurvey} onGenerate={handleGenerateWorkout} />}
          {showList && <CartModal inventory={inventory} setShowList={setShowList} toggleFood={toggleFood} handleGenerateRecipes={handleGenerateDiet} isGenerating={isGenerating} />}
          {showMealModal && (
            <MealModal
              setShowMealModal={setShowMealModal}
              mealPlan={mealPlan}
              mealTarget={mealTarget}
              onChooseIngredients={() => { setShowMealModal(false); setActiveTab('diet'); }}
            />
          )}
          {showWorkoutModal && (
            <WorkoutModal
              workoutPlan={workoutPlan}
              setShowWorkoutModal={setShowWorkoutModal}
              onCreateWorkout={() => { setShowWorkoutModal(false); setShowWorkoutSurvey(true); }}
            />
          )}

          {showVisionModal && (
            <VisionAnalysisModal
              onClose={() => { setShowVisionModal(false); setVisionAnalysisResult(null); }}
              onAnalyze={handleAnalyzeImage}
              isAnalyzing={isAnalyzingImage}
              analysisResult={visionAnalysisResult}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default App;
