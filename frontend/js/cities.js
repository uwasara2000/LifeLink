/**
 * Comprehensive Sri Lanka Locations Database
 * Contains all 25 Districts and 450+ cities, towns, and suburbs across Sri Lanka.
 */

const SRI_LANKA_DISTRICTS = [
    "Ampara",
    "Anuradhapura",
    "Badulla",
    "Batticaloa",
    "Colombo",
    "Galle",
    "Gampaha",
    "Hambantota",
    "Jaffna",
    "Kalutara",
    "Kandy",
    "Kegalle",
    "Kilinochchi",
    "Kurunegala",
    "Mannar",
    "Matale",
    "Matara",
    "Monaragala",
    "Mullaitivu",
    "Nuwara Eliya",
    "Polonnaruwa",
    "Puttalam",
    "Ratnapura",
    "Trincomalee",
    "Vavuniya"
];

const SRI_LANKA_DISTRICT_CITIES = {
    "Ampara": [
        "Addalaichenai", "Akkaraipattu", "Alayadivembu", "Ampara", "Central Camp",
        "Damana", "Dehiattakandiya", "Irakkamam", "Kalmunai", "Karaitivu",
        "Komari", "Lahugala", "Mahaoya", "Marathamunai", "Navithanveli",
        "Nintavur", "Oluvil", "Padiyathalawa", "Pothuvil", "Sainthamaruthu",
        "Sammanthurai", "Thirukkovil", "Uhana"
    ],
    "Anuradhapura": [
        "Anuradhapura", "Bulnewa", "Eppawala", "Galenbindunuwewa", "Galkiriyagama",
        "Galnewa", "Habarana", "Horowpathana", "Kahatagasdigiliya", "Kebithigollewa",
        "Kekirawa", "Konwewa", "Madatugama", "Mahavilachchiya", "Maradankadawala",
        "Medawachchiya", "Mihintale", "Nachchaduwa", "Nochchiyagama", "Padaviya",
        "Palagala", "Rajanganaya", "Rambewa", "Seeppukulama", "Talawa",
        "Tambuttegama", "Tirappane", "Yakalla"
    ],
    "Badulla": [
        "Badulla", "Bandarawela", "Beragala", "Demodara", "Diyatalawa",
        "Ella", "Ettampitiya", "Hali-Ela", "Haputale", "Kandaketiya",
        "Koslanda", "Lunugala", "Mahiyanganaya", "Meegahakiula", "Passara",
        "Rideemaliyadda", "Soranatota", "Welimada"
    ],
    "Batticaloa": [
        "Arapatha", "Batticaloa", "Chenkalady", "Eravur", "Kaluwanchikudy",
        "Kattankudy", "Kiran", "Kokkadichcholai", "Oddamavadi", "Pasikudah",
        "Thiruperunturai", "Vakarai", "Valaichchenai", "Vellavely"
    ],
    "Colombo": [
        "Angoda", "Athurugiriya", "Avissawella", "Battaramulla", "Boralesgamuwa",
        "Colombo 01", "Colombo 02", "Colombo 03", "Colombo 04", "Colombo 05",
        "Colombo 06", "Colombo 07", "Colombo 08", "Colombo 09", "Colombo 10",
        "Colombo 11", "Colombo 12", "Colombo 13", "Colombo 14", "Colombo 15",
        "Dehiwala", "Godagama", "Hanwella", "Hokandara", "Homagama",
        "Kaduwela", "Kesbewa", "Kohuwala", "Kolonnawa", "Kosgama",
        "Kottawa", "Kotte", "Maharagama", "Malabe", "Meegoda",
        "Moratuwa", "Mount Lavinia", "Mulleriyawa", "Nawala", "Nugegoda",
        "Padukka", "Pannipitiya", "Piliyandala", "Pitakotte", "Rajagiriya",
        "Ranala", "Ratmalana", "Talawatugoda", "Wellampitiya"
    ],
    "Galle": [
        "Ahangama", "Ahungalla", "Akmeemana", "Ambalangoda", "Baddegama",
        "Balapitiya", "Batapola", "Bentota", "Bope", "Elpitiya",
        "Galle", "Galle Fort", "Habaraduwa", "Hikkaduwa", "Hiniduma",
        "Imaduwa", "Karandeniya", "Karapitiya", "Koggala", "Meetiyagoda",
        "Nagoda", "Neluwa", "Rathgama", "Thawalama", "Udugama",
        "Unawatuna", "Wanduramba", "Yakkalamulla"
    ],
    "Gampaha": [
        "Attanagalla", "Biyagama", "Delgoda", "Divulapitiya", "Dompe",
        "Ekala", "Gampaha", "Ganemulla", "Heiyanthuduwa", "Hendala",
        "Ja-Ela", "Kadawatha", "Kandana", "Katana", "Katunayake",
        "Kelaniya", "Kiribathgoda", "Kirindiwela", "Kochchikade", "Kotadeniyawa",
        "Mahabage", "Malwana", "Marandagahamula", "Minuwangoda", "Mirigama",
        "Negombo", "Nittambuwa", "Pamunugama", "Peliyagoda", "Pugoda",
        "Radawana", "Ragama", "Seeduwa", "Udugampola", "Veyangoda",
        "Wattala", "Weliweriya", "Yakkala"
    ],
    "Hambantota": [
        "Ambalantota", "Angunakolapelessa", "Beliatta", "Hambantota", "Katuwana",
        "Kirinda", "Lunugamvehera", "Middeniya", "Okewela", "Ranna",
        "Ridiyagama", "Sooriyawewa", "Tangalle", "Tissamaharama", "Walasmulla",
        "Weeraketiya"
    ],
    "Jaffna": [
        "Araly", "Atchuvely", "Chankanai", "Chavakachcheri", "Chunnakam",
        "Delft", "Illavalai", "Jaffna", "Kaithady", "Karainagar",
        "Karaveddy", "Kayts", "Kodikamam", "Kokuvil", "Kondavil",
        "Kopay", "Manipay", "Maruthankerney", "Meesalai", "Nallur",
        "Pandateruppu", "Point Pedro", "Sandilipay", "Tellippalai", "Uduvil",
        "Urumpirai", "Vaddukoddai", "Valvettithurai", "Velanai"
    ],
    "Kalutara": [
        "Agalawatta", "Aluthgama", "Anguruwatota", "Baduraliya", "Bandaragama",
        "Beruwala", "Bulathsinhala", "Dodangoda", "Horana", "Ingiriya",
        "Kalutara", "Kalutara North", "Kalutara South", "Madurawala", "Mathugama",
        "Millaniya", "Moragahahena", "Naboda", "Nagoda", "Paiyagala",
        "Panadura", "Payagala", "Pokunuwita", "Tebuwana", "Wadduwa",
        "Walallawita"
    ],
    "Kandy": [
        "Akurana", "Alawatugoda", "Ambatenna", "Ampitiya", "Digana",
        "Galagedara", "Gampola", "Gelioya", "Hasalaka", "Hataraliyadda",
        "Kadugannawa", "Kandy", "Katugastota", "Kundasale", "Madawala",
        "Menikhinna", "Nawalapitiya", "Panwila", "Peradeniya", "Pilimathalawa",
        "Pussellawa", "Talatuoya", "Teldeniya", "Ududumbara", "Udispattuwa",
        "Wattegama"
    ],
    "Kegalle": [
        "Ambepussa", "Aranayaka", "Bulathkohupitiya", "Dehiowita", "Deraniyagala",
        "Galigamuwa", "Hemmathagama", "Karawanella", "Kegalle", "Kitulgala",
        "Kotiyakumbura", "Mawanella", "Rambukkana", "Ruwanwella", "Undugoda",
        "Warakapola", "Yatiyantota"
    ],
    "Kilinochchi": [
        "Dharmapuram", "Elephant Pass", "Iranamadu", "Kandavalai", "Kilinochchi",
        "Pallai", "Paranthan", "Poonakary", "Vannerikkulam"
    ],
    "Kurunegala": [
        "Alawwa", "Bingiriya", "Dambadeniya", "Dandagamuwa", "Galgamuwa",
        "Giriulla", "Hettipola", "Ibbagamuwa", "Katupotha", "Kuliyapitiya",
        "Kurunegala", "Maho", "Malsiripura", "Mawathagama", "Narammala",
        "Nikaweratiya", "Panduwasnuwara", "Pannala", "Polgahawela", "Potuhera",
        "Rideegama", "Wariyapola"
    ],
    "Mannar": [
        "Adampan", "Erukkulampiddi", "Madhu", "Mannar", "Marichchukaddi",
        "Murunkan", "Nanaddan", "Pesalai", "Silavatturai", "Talaimannar",
        "Vankalai"
    ],
    "Matale": [
        "Dambulla", "Galewela", "Gammaduwa", "Inamaluwa", "Kandalama",
        "Laggala", "Matale", "Naula", "Palapathwela", "Pallepola",
        "Rattota", "Sigiriya", "Ukuwela", "Wahacotte", "Wilgamuwa",
        "Yatawatta"
    ],
    "Matara": [
        "Akuressa", "Deniyaya", "Devinuwara", "Dickwella", "Gandara",
        "Hakmana", "Kamburugamuwa", "Kamburupitiya", "Kekanadurra", "Kirinda Puhulwella",
        "Kotapola", "Malimbada", "Matara", "Mirissa", "Morawaka",
        "Pasgoda", "Pitabeddara", "Thihagoda", "Urubokka", "Walasgala",
        "Walasmulla", "Weligama"
    ],
    "Monaragala": [
        "Badalkumbura", "Bibile", "Buttala", "Kataragama", "Madulla",
        "Medagama", "Monaragala", "Okkampitiya", "Sevanagala", "Siyambalanduwa",
        "Thanamalwila", "Wellawaya"
    ],
    "Mullaitivu": [
        "Alampil", "Mallavi", "Mankulam", "Mullaitivu", "Mulliyawalai",
        "Oddusuddan", "Puthukkudiyiruppu", "Thunukkai", "Visvamadu"
    ],
    "Nuwara Eliya": [
        "Agrapatana", "Ambewela", "Bogawantalawa", "Dayagama", "Ginigathena",
        "Hanguranketha", "Hatton", "Kotagala", "Kotmale", "Labukele",
        "Maskeliya", "Nanu Oya", "Norwood", "Nuwara Eliya", "Pundaluoya",
        "Ragala", "Rikillagaskada", "Rozella", "Talawakele", "Udapussellawa",
        "Walapane", "Watawala"
    ],
    "Polonnaruwa": [
        "Aralaganwila", "Bakamuna", "Dimbulagala", "Elahera", "Giritale",
        "Hingurakgoda", "Kaduruwela", "Lankapura", "Manampitiya", "Medirigiriya",
        "Minneriya", "Polonnaruwa", "Sungawila", "Welikanda"
    ],
    "Puttalam": [
        "Anamaduwa", "Chilaw", "Dankotuwa", "Kalpitiya", "Madampe",
        "Mahawewa", "Marawila", "Mundel", "Nattandiya", "Palavi",
        "Puttalam", "Vanathavilluwa", "Wennappuwa"
    ],
    "Ratnapura": [
        "Ayagama", "Balangoda", "Eheliyagoda", "Embilipitiya", "Godakawela",
        "Kahawatta", "Kalawana", "Kuruwita", "Nivithigala", "Opanayake",
        "Pelmadulla", "Pohorabawa", "Rakwana", "Ratnapura", "Udawalawa"
    ],
    "Trincomalee": [
        "Chinabay", "Gomarankadawala", "Kantale", "Kinniya", "Kuchchaveli",
        "Morawewa", "Muttur", "Nilaveli", "Pulmoddai", "Sampur",
        "Serunuwara", "Thampalakamam", "Trincomalee"
    ],
    "Vavuniya": [
        "Cheddikulam", "Kanagarayankulam", "Nedunkeni", "Omanthai", "Puliyankulam",
        "Vavuniya"
    ]
};

// Generate a unified, sorted list of all city objects { city, district }
const SRI_LANKA_ALL_CITIES = (() => {
    const list = [];
    for (const [district, cities] of Object.entries(SRI_LANKA_DISTRICT_CITIES)) {
        cities.forEach(city => {
            list.push({ city, district });
        });
    }
    // Sort alphabetically by city name
    return list.sort((a, b) => a.city.localeCompare(b.city));
})();

// Helper function to search cities with optional district filter & smart relevance ranking
function searchSriLankanCities(query = '', selectedDistrict = '') {
    const q = (query || '').trim().toLowerCase();
    const dist = (selectedDistrict || '').trim();

    const filtered = SRI_LANKA_ALL_CITIES.filter(item => {
        const matchesDistrict = !dist || dist === 'ALL' || dist === 'Select District' || item.district.toLowerCase() === dist.toLowerCase();
        if (!matchesDistrict) return false;
        if (!q) return true;
        return item.city.toLowerCase().includes(q) || item.district.toLowerCase().includes(q);
    });

    if (!q) return filtered;

    // Prioritize cities that start with the typed letter(s)
    return filtered.sort((a, b) => {
        const aCity = a.city.toLowerCase();
        const bCity = b.city.toLowerCase();
        const aStarts = aCity.startsWith(q);
        const bStarts = bCity.startsWith(q);

        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;

        const aDistStarts = a.district.toLowerCase().startsWith(q);
        const bDistStarts = b.district.toLowerCase().startsWith(q);
        if (aDistStarts && !bDistStarts) return -1;
        if (!aDistStarts && bDistStarts) return 1;

        return a.city.localeCompare(b.city);
    });
}

// Global scope attachment for universal access
if (typeof window !== 'undefined') {
    window.SRI_LANKA_DISTRICTS = SRI_LANKA_DISTRICTS;
    window.SRI_LANKA_DISTRICT_CITIES = SRI_LANKA_DISTRICT_CITIES;
    window.SRI_LANKA_ALL_CITIES = SRI_LANKA_ALL_CITIES;
    window.searchSriLankanCities = searchSriLankanCities;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        SRI_LANKA_DISTRICTS,
        SRI_LANKA_DISTRICT_CITIES,
        SRI_LANKA_ALL_CITIES,
        searchSriLankanCities
    };
}
