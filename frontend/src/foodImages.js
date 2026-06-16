// src/foodImages.js
// Ürün görselleri: TheMealDB'nin ücretsiz malzeme fotoğrafları (beyaz fonlu, isimle erişilir).
// Fotoğrafı olmayan ürünler emoji ile gösterilir; fotoğraf yüklenemezse de emoji devreye girer.

// Bizim isim ≠ TheMealDB ismi olan ürünler (çoğul/alias eşleştirmesi)
const MEALDB_ALIAS = {
    'Cheddar': 'Cheddar Cheese',
    'Goat Cheese': 'Goats Cheese',
    'Gouda': 'Gouda Cheese',
    'Pork Chop': 'Pork Chops',
    'Turkey Breast': 'Turkey',
    'Chicken Drumstick': 'Chicken Drumsticks',
    'Beef Steak': 'Sirloin Steak',
    'Ground Turkey': 'Turkey Mince',
    'Sucuk': 'Chorizo',
    'Anchovy': 'Anchovies',
    'Bell Pepper': 'Red Pepper',
    'Sweet Potato': 'Sweet Potatoes',
    'Arugula': 'Rocket',
    'Strawberry': 'Strawberries',
    'Blueberry': 'Blueberries',
    'Blackberry': 'Blackberries',
    'Raspberry': 'Raspberries',
    'Peach': 'Peaches',
    'Pear': 'Pears',
    'Fig': 'Figs',
    'Dates': 'Medjool Dates',
    'Walnut': 'Walnuts',
    'Almond': 'Almonds',
    'Peanut': 'Peanuts',
    'Cashew': 'Cashews',
    'Pecan': 'Pecan Nuts',
    'Sesame Seeds': 'Sesame Seed',
    'Green Peas': 'Peas',
    'White Beans': 'Cannellini Beans',
    'Fava Beans': 'Broad Beans',
    'Whole Wheat Bread': 'Bread',
    'Pasta': 'Spaghetti',
    'Bulgur': 'Bulgur Wheat',
    'Corn': 'Sweetcorn',
    'Coconut Oil': 'Coconut Cream',
    'Sesame Oil': 'Sesame Seed Oil',
    'Green Tea': 'Tea',
    'Black Tea': 'Tea',
    'Coconut Water': 'Coconut Milk',
    'Mineral Water': 'Water',
    'Granola': 'Oats'
};

// TheMealDB'de karşılığı olmayan ürünler (sadece emoji gösterilir)
const NO_IMAGE = new Set([
    'Cottage Cheese', 'Kefir', 'Skyr', 'Quark', 'Halloumi', 'Labneh',
    'Beef Liver', 'Quail',
    'Scallops', 'Crab', 'Lobster', 'Sea Bream', 'Octopus',
    'Cauliflower', 'Artichoke', 'Okra',
    'Grape', 'Plum', 'Melon', 'Watermelon',
    'Hazelnut', 'Sunflower Seeds', 'Pumpkin Seeds', 'Flaxseed',
    'Soybeans', 'Edamame', 'Mung Beans',
    'Barley', 'Avocado Oil',
    'Ayran', 'Kombucha', 'Protein Bar', 'Popcorn'
]);

const FOOD_EMOJI = {
    // Süt & Yumurta
    'Milk': '🥛', 'Yogurt': '🥣', 'Feta Cheese': '🧀', 'Cheddar': '🧀', 'Cottage Cheese': '🧀',
    'Butter': '🧈', 'Kefir': '🥛', 'Eggs': '🥚', 'Mozzarella': '🧀', 'Parmesan': '🧀',
    'Gouda': '🧀', 'Cream Cheese': '🧀', 'Ricotta': '🧀', 'Sour Cream': '🥣', 'Greek Yogurt': '🥣',
    'Skyr': '🥣', 'Quark': '🥣', 'Goat Cheese': '🧀', 'Halloumi': '🧀', 'Labneh': '🥣',
    // Et & Kümes
    'Chicken Breast': '🍗', 'Beef': '🥩', 'Turkey Breast': '🦃', 'Lamb': '🍖', 'Pork Chop': '🥩',
    'Duck': '🦆', 'Veal': '🥩', 'Chicken Thigh': '🍗', 'Minced Beef': '🥩', 'Chicken Wings': '🍗',
    'Chicken Drumstick': '🍗', 'Beef Steak': '🥩', 'Beef Liver': '🥩', 'Ground Turkey': '🦃',
    'Sucuk': '🌭', 'Quail': '🐦',
    // Deniz Ürünleri
    'Salmon': '🐟', 'Shrimp': '🦐', 'Tuna': '🐟', 'Cod': '🐟', 'Mackerel': '🐟', 'Sardines': '🐟',
    'Scallops': '🦪', 'Crab': '🦀', 'Lobster': '🦞', 'Trout': '🐟', 'Sea Bass': '🐟',
    'Sea Bream': '🐟', 'Anchovy': '🐟', 'Octopus': '🐙', 'Squid': '🦑', 'Mussels': '🦪',
    // Sebzeler
    'Spinach': '🥬', 'Broccoli': '🥦', 'Carrot': '🥕', 'Garlic': '🧄', 'Onion': '🧅',
    'Tomato': '🍅', 'Cucumber': '🥒', 'Bell Pepper': '🫑', 'Zucchini': '🥒', 'Asparagus': '🥬',
    'Cabbage': '🥬', 'Cauliflower': '🥦', 'Celery': '🥬', 'Eggplant': '🍆', 'Kale': '🥬',
    'Lettuce': '🥬', 'Mushroom': '🍄', 'Potato': '🥔', 'Sweet Potato': '🍠', 'Brussels Sprouts': '🥬',
    'Pumpkin': '🎃', 'Beetroot': '🍠', 'Radish': '🌱', 'Green Beans': '🥒', 'Okra': '🌿',
    'Artichoke': '🥬', 'Leek': '🥬', 'Arugula': '🌿',
    // Meyveler
    'Apple': '🍎', 'Banana': '🍌', 'Orange': '🍊', 'Strawberry': '🍓', 'Avocado': '🥑',
    'Blueberry': '🫐', 'Blackberry': '🫐', 'Mango': '🥭', 'Pineapple': '🍍', 'Watermelon': '🍉',
    'Peach': '🍑', 'Pear': '🍐', 'Cherry': '🍒', 'Grape': '🍇', 'Kiwi': '🥝', 'Lemon': '🍋',
    'Pomegranate': '🍎', 'Fig': '🍇', 'Apricot': '🍑', 'Plum': '🍇', 'Grapefruit': '🍊',
    'Melon': '🍈', 'Dates': '🌴', 'Raspberry': '🍓',
    // Kuruyemiş & Tohum
    'Walnut': '🌰', 'Almond': '🌰', 'Chia Seeds': '🌱', 'Peanut': '🥜', 'Pistachio': '🥜',
    'Cashew': '🥜', 'Hazelnut': '🌰', 'Pecan': '🌰', 'Sunflower Seeds': '🌻', 'Pumpkin Seeds': '🎃',
    'Flaxseed': '🌾', 'Brazil Nuts': '🌰', 'Macadamia': '🌰', 'Sesame Seeds': '🌱',
    // Baklagiller
    'Red Lentils': '🍲', 'Chickpeas': '🧆', 'Soybeans': '🫘', 'Black Beans': '🫘',
    'Kidney Beans': '🫘', 'Green Peas': '🫛', 'Pinto Beans': '🫘', 'Edamame': '🫘',
    'White Beans': '🫘', 'Fava Beans': '🫘', 'Mung Beans': '🫘',
    // Tahıllar
    'Rice': '🍚', 'Oats': '🌾', 'Quinoa': '🌾', 'Whole Wheat Bread': '🍞', 'Pasta': '🍝',
    'Barley': '🌾', 'Buckwheat': '🌾', 'Bulgur': '🌾', 'Couscous': '🍚', 'Corn': '🌽',
    'Brown Rice': '🍚', 'Rye Bread': '🍞', 'Tortilla': '🌮', 'Noodles': '🍜',
    // Yağlar
    'Olive Oil': '🫒', 'Coconut Oil': '🥥', 'Avocado Oil': '🥑', 'Sesame Oil': '🌱',
    'Tahini': '🥣', 'Peanut Butter': '🥜', 'Ghee': '🧈',
    // Baharatlar & Otlar
    'Basil': '🌿', 'Mint': '🌿', 'Parsley': '🌿', 'Dill': '🌿', 'Oregano': '🌿',
    'Rosemary': '🌿', 'Thyme': '🌿', 'Cumin': '🧂', 'Paprika': '🌶️', 'Turmeric': '🧂',
    'Ginger': '🌱', 'Cinnamon': '🟤', 'Black Pepper': '🧂',
    // İçecekler
    'Green Tea': '🍵', 'Black Tea': '🫖', 'Coffee': '☕', 'Ayran': '🥛', 'Kombucha': '🥤',
    'Orange Juice': '🧃', 'Coconut Water': '🥥', 'Mineral Water': '💧',
    // Tatlılar & Ekstralar
    'Honey': '🍯', 'Dark Chocolate': '🍫', 'Maple Syrup': '🍁', 'Granola': '🥣',
    'Protein Bar': '🍫', 'Popcorn': '🍿'
};

export const getFoodEmoji = (name) => FOOD_EMOJI[name] || '🍽️';

export const getFoodImageUrl = (name) => {
    if (NO_IMAGE.has(name)) return null;
    const mealdbName = MEALDB_ALIAS[name] || name;
    return `https://www.themealdb.com/images/ingredients/${encodeURIComponent(mealdbName)}-small.png`;
};
