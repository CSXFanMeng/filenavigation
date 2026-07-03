import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import "./styles.css";

const languageOptions = [
  ["auto", "Auto"],
  ["en", "English"],
  ["zh-CN", "简体中文"],
  ["zh-TW", "繁體中文"],
  ["es", "Español"],
  ["fr", "Français"],
  ["de", "Deutsch"],
  ["ja", "日本語"],
  ["ko", "한국어"],
  ["pt-BR", "Português"],
  ["ru", "Русский"],
  ["ar", "العربية"],
  ["hi", "हिन्दी"],
  ["it", "Italiano"],
  ["nl", "Nederlands"],
  ["tr", "Türkçe"],
  ["vi", "Tiếng Việt"],
  ["id", "Bahasa Indonesia"],
  ["th", "ไทย"],
  ["pl", "Polski"],
  ["uk", "Українська"]
];

const translations = {
  en: {
    brandSubtitle: "Local directory file search",
    languageLabel: "Language",
    rootLabel: "Search folder",
    rootPlaceholder: "Choose or enter a folder path",
    pickDirectory: "Choose folder",
    queryLabel: "File name keyword",
    queryPlaceholder: "For example report, .rs, invoice",
    caseSensitive: "Case sensitive",
    includeHidden: "Include hidden files",
    maxResults: "Maximum results",
    searchButton: "Search",
    eyebrow: "Search",
    waiting: "Ready to search",
    statFiles: "Files scanned",
    statDirs: "Folders scanned",
    statTime: "Time",
    emptyTitle: "Enter a folder and keyword to begin",
    emptyText: "Search runs locally. File names, paths, and content are not uploaded.",
    searching: "Searching...",
    found: (count) => `Found ${count} result${count === 1 ? "" : "s"}`,
    foundTruncated: (count) => `Found ${count} results, limit reached`,
    noResultsTitle: "No matches",
    noResultsText: "Try another keyword or include hidden files.",
    searchFailed: "Search failed",
    cannotComplete: "Unable to complete the search",
    openFailed: "Open failed",
    file: "File",
    directory: "Folder",
    unknownTime: "Unknown time",
    invalidDirectory: "The selected folder does not exist or is not a folder.",
    searchTaskFailed: "The search task failed.",
    openTaskFailed: "The open task failed.",
    openPathFailed: "Unable to open this path."
  },
  "zh-CN": {
    brandSubtitle: "本地目录文件查找",
    languageLabel: "语言",
    rootLabel: "搜索目录",
    rootPlaceholder: "选择或输入目录路径",
    pickDirectory: "选择目录",
    queryLabel: "文件名关键字",
    queryPlaceholder: "例如 report、.rs、合同",
    caseSensitive: "区分大小写",
    includeHidden: "包含隐藏文件",
    maxResults: "最大结果数",
    searchButton: "开始查找",
    eyebrow: "搜索",
    waiting: "等待搜索",
    statFiles: "扫描文件",
    statDirs: "扫描目录",
    statTime: "耗时",
    emptyTitle: "输入目录和关键字后开始查找",
    emptyText: "搜索在本机完成，不上传文件名、路径或内容。",
    searching: "正在查找...",
    found: (count) => `找到 ${count} 个结果`,
    foundTruncated: (count) => `找到 ${count} 个结果，已达上限`,
    noResultsTitle: "没有匹配结果",
    noResultsText: "换一个关键字，或启用隐藏文件搜索。",
    searchFailed: "搜索失败",
    cannotComplete: "无法完成搜索",
    openFailed: "打开失败",
    file: "文件",
    directory: "目录",
    unknownTime: "未知时间",
    invalidDirectory: "搜索目录不存在或不是目录。",
    searchTaskFailed: "搜索任务失败。",
    openTaskFailed: "打开任务失败。",
    openPathFailed: "无法打开路径。"
  },
  "zh-TW": {
    brandSubtitle: "本機目錄檔案搜尋",
    languageLabel: "語言",
    rootLabel: "搜尋目錄",
    rootPlaceholder: "選擇或輸入目錄路徑",
    pickDirectory: "選擇目錄",
    queryLabel: "檔名關鍵字",
    queryPlaceholder: "例如 report、.rs、合約",
    caseSensitive: "區分大小寫",
    includeHidden: "包含隱藏檔案",
    maxResults: "最大結果數",
    searchButton: "開始搜尋",
    eyebrow: "搜尋",
    waiting: "等待搜尋",
    statFiles: "掃描檔案",
    statDirs: "掃描目錄",
    statTime: "耗時",
    emptyTitle: "輸入目錄和關鍵字後開始搜尋",
    emptyText: "搜尋在本機完成，不會上傳檔名、路徑或內容。",
    searching: "正在搜尋...",
    found: (count) => `找到 ${count} 個結果`,
    foundTruncated: (count) => `找到 ${count} 個結果，已達上限`,
    noResultsTitle: "沒有符合結果",
    noResultsText: "請更換關鍵字，或啟用隱藏檔案搜尋。",
    searchFailed: "搜尋失敗",
    cannotComplete: "無法完成搜尋",
    openFailed: "開啟失敗",
    file: "檔案",
    directory: "目錄",
    unknownTime: "未知時間",
    invalidDirectory: "搜尋目錄不存在或不是目錄。",
    searchTaskFailed: "搜尋任務失敗。",
    openTaskFailed: "開啟任務失敗。",
    openPathFailed: "無法開啟路徑。"
  },
  es: {
    brandSubtitle: "Búsqueda local de archivos",
    languageLabel: "Idioma",
    rootLabel: "Carpeta de búsqueda",
    rootPlaceholder: "Elige o escribe una ruta de carpeta",
    pickDirectory: "Elegir carpeta",
    queryLabel: "Palabra clave del archivo",
    queryPlaceholder: "Por ejemplo report, .rs, factura",
    caseSensitive: "Distinguir mayúsculas",
    includeHidden: "Incluir archivos ocultos",
    maxResults: "Resultados máximos",
    searchButton: "Buscar",
    eyebrow: "Buscar",
    waiting: "Listo para buscar",
    statFiles: "Archivos escaneados",
    statDirs: "Carpetas escaneadas",
    statTime: "Tiempo",
    emptyTitle: "Introduce una carpeta y una palabra clave",
    emptyText: "La búsqueda se ejecuta localmente. No se suben nombres, rutas ni contenido.",
    searching: "Buscando...",
    found: (count) => `${count} resultado${count === 1 ? "" : "s"} encontrado${count === 1 ? "" : "s"}`,
    foundTruncated: (count) => `${count} resultados encontrados, límite alcanzado`,
    noResultsTitle: "Sin coincidencias",
    noResultsText: "Prueba otra palabra clave o incluye archivos ocultos.",
    searchFailed: "Error de búsqueda",
    cannotComplete: "No se pudo completar la búsqueda",
    openFailed: "No se pudo abrir",
    file: "Archivo",
    directory: "Carpeta",
    unknownTime: "Hora desconocida",
    invalidDirectory: "La carpeta seleccionada no existe o no es una carpeta.",
    searchTaskFailed: "La tarea de búsqueda falló.",
    openTaskFailed: "La tarea de apertura falló.",
    openPathFailed: "No se pudo abrir esta ruta."
  },
  fr: {
    brandSubtitle: "Recherche locale de fichiers",
    languageLabel: "Langue",
    rootLabel: "Dossier de recherche",
    rootPlaceholder: "Choisissez ou saisissez un chemin",
    pickDirectory: "Choisir un dossier",
    queryLabel: "Mot-clé du nom de fichier",
    queryPlaceholder: "Par exemple report, .rs, facture",
    caseSensitive: "Respecter la casse",
    includeHidden: "Inclure les fichiers masqués",
    maxResults: "Résultats maximum",
    searchButton: "Rechercher",
    eyebrow: "Recherche",
    waiting: "Prêt à rechercher",
    statFiles: "Fichiers analysés",
    statDirs: "Dossiers analysés",
    statTime: "Durée",
    emptyTitle: "Saisissez un dossier et un mot-clé",
    emptyText: "La recherche s’exécute localement. Aucun nom, chemin ou contenu n’est envoyé.",
    searching: "Recherche...",
    found: (count) => `${count} résultat${count === 1 ? "" : "s"} trouvé${count === 1 ? "" : "s"}`,
    foundTruncated: (count) => `${count} résultats trouvés, limite atteinte`,
    noResultsTitle: "Aucune correspondance",
    noResultsText: "Essayez un autre mot-clé ou incluez les fichiers masqués.",
    searchFailed: "Échec de la recherche",
    cannotComplete: "Impossible de terminer la recherche",
    openFailed: "Ouverture impossible",
    file: "Fichier",
    directory: "Dossier",
    unknownTime: "Heure inconnue",
    invalidDirectory: "Le dossier sélectionné n’existe pas ou n’est pas un dossier.",
    searchTaskFailed: "La tâche de recherche a échoué.",
    openTaskFailed: "La tâche d’ouverture a échoué.",
    openPathFailed: "Impossible d’ouvrir ce chemin."
  },
  de: {
    brandSubtitle: "Lokale Dateisuche",
    languageLabel: "Sprache",
    rootLabel: "Suchordner",
    rootPlaceholder: "Ordnerpfad wählen oder eingeben",
    pickDirectory: "Ordner wählen",
    queryLabel: "Dateiname-Schlüsselwort",
    queryPlaceholder: "Zum Beispiel report, .rs, Rechnung",
    caseSensitive: "Groß-/Kleinschreibung",
    includeHidden: "Versteckte Dateien einbeziehen",
    maxResults: "Maximale Treffer",
    searchButton: "Suchen",
    eyebrow: "Suche",
    waiting: "Bereit zur Suche",
    statFiles: "Dateien geprüft",
    statDirs: "Ordner geprüft",
    statTime: "Zeit",
    emptyTitle: "Ordner und Schlüsselwort eingeben",
    emptyText: "Die Suche läuft lokal. Dateinamen, Pfade und Inhalte werden nicht hochgeladen.",
    searching: "Suche...",
    found: (count) => `${count} Treffer gefunden`,
    foundTruncated: (count) => `${count} Treffer gefunden, Limit erreicht`,
    noResultsTitle: "Keine Treffer",
    noResultsText: "Versuchen Sie ein anderes Schlüsselwort oder versteckte Dateien.",
    searchFailed: "Suche fehlgeschlagen",
    cannotComplete: "Die Suche konnte nicht abgeschlossen werden",
    openFailed: "Öffnen fehlgeschlagen",
    file: "Datei",
    directory: "Ordner",
    unknownTime: "Unbekannte Zeit",
    invalidDirectory: "Der ausgewählte Ordner existiert nicht oder ist kein Ordner.",
    searchTaskFailed: "Die Suchaufgabe ist fehlgeschlagen.",
    openTaskFailed: "Die Öffnungsaufgabe ist fehlgeschlagen.",
    openPathFailed: "Dieser Pfad konnte nicht geöffnet werden."
  },
  ja: {
    brandSubtitle: "ローカルフォルダーのファイル検索",
    languageLabel: "言語",
    rootLabel: "検索フォルダー",
    rootPlaceholder: "フォルダーのパスを選択または入力",
    pickDirectory: "フォルダーを選択",
    queryLabel: "ファイル名キーワード",
    queryPlaceholder: "例: report、.rs、請求書",
    caseSensitive: "大文字小文字を区別",
    includeHidden: "隠しファイルを含める",
    maxResults: "最大結果数",
    searchButton: "検索",
    eyebrow: "検索",
    waiting: "検索待機中",
    statFiles: "スキャンしたファイル",
    statDirs: "スキャンしたフォルダー",
    statTime: "時間",
    emptyTitle: "フォルダーとキーワードを入力してください",
    emptyText: "検索はローカルで実行されます。ファイル名、パス、内容はアップロードされません。",
    searching: "検索中...",
    found: (count) => `${count} 件見つかりました`,
    foundTruncated: (count) => `${count} 件見つかりました。上限に達しました`,
    noResultsTitle: "一致する結果はありません",
    noResultsText: "別のキーワードを試すか、隠しファイルを含めてください。",
    searchFailed: "検索に失敗しました",
    cannotComplete: "検索を完了できません",
    openFailed: "開けませんでした",
    file: "ファイル",
    directory: "フォルダー",
    unknownTime: "不明な時刻",
    invalidDirectory: "選択したフォルダーが存在しないか、フォルダーではありません。",
    searchTaskFailed: "検索タスクに失敗しました。",
    openTaskFailed: "オープンタスクに失敗しました。",
    openPathFailed: "このパスを開けません。"
  },
  ko: {
    brandSubtitle: "로컬 폴더 파일 검색",
    languageLabel: "언어",
    rootLabel: "검색 폴더",
    rootPlaceholder: "폴더 경로를 선택하거나 입력",
    pickDirectory: "폴더 선택",
    queryLabel: "파일 이름 키워드",
    queryPlaceholder: "예: report, .rs, 계약서",
    caseSensitive: "대소문자 구분",
    includeHidden: "숨김 파일 포함",
    maxResults: "최대 결과 수",
    searchButton: "검색",
    eyebrow: "검색",
    waiting: "검색 대기 중",
    statFiles: "스캔한 파일",
    statDirs: "스캔한 폴더",
    statTime: "시간",
    emptyTitle: "폴더와 키워드를 입력하세요",
    emptyText: "검색은 로컬에서 실행됩니다. 파일명, 경로, 내용은 업로드되지 않습니다.",
    searching: "검색 중...",
    found: (count) => `${count}개 결과를 찾았습니다`,
    foundTruncated: (count) => `${count}개 결과를 찾았으며 한도에 도달했습니다`,
    noResultsTitle: "일치 항목 없음",
    noResultsText: "다른 키워드를 사용하거나 숨김 파일을 포함하세요.",
    searchFailed: "검색 실패",
    cannotComplete: "검색을 완료할 수 없습니다",
    openFailed: "열기 실패",
    file: "파일",
    directory: "폴더",
    unknownTime: "알 수 없는 시간",
    invalidDirectory: "선택한 폴더가 없거나 폴더가 아닙니다.",
    searchTaskFailed: "검색 작업이 실패했습니다.",
    openTaskFailed: "열기 작업이 실패했습니다.",
    openPathFailed: "이 경로를 열 수 없습니다."
  },
  "pt-BR": {
    brandSubtitle: "Busca local de arquivos",
    languageLabel: "Idioma",
    rootLabel: "Pasta de busca",
    rootPlaceholder: "Escolha ou digite o caminho da pasta",
    pickDirectory: "Escolher pasta",
    queryLabel: "Palavra-chave do arquivo",
    queryPlaceholder: "Por exemplo report, .rs, contrato",
    caseSensitive: "Diferenciar maiúsculas",
    includeHidden: "Incluir arquivos ocultos",
    maxResults: "Resultados máximos",
    searchButton: "Buscar",
    eyebrow: "Busca",
    waiting: "Pronto para buscar",
    statFiles: "Arquivos verificados",
    statDirs: "Pastas verificadas",
    statTime: "Tempo",
    emptyTitle: "Informe uma pasta e uma palavra-chave",
    emptyText: "A busca roda localmente. Nomes, caminhos e conteúdo não são enviados.",
    searching: "Buscando...",
    found: (count) => `${count} resultado${count === 1 ? "" : "s"} encontrado${count === 1 ? "" : "s"}`,
    foundTruncated: (count) => `${count} resultados encontrados, limite atingido`,
    noResultsTitle: "Nenhuma correspondência",
    noResultsText: "Tente outra palavra-chave ou inclua arquivos ocultos.",
    searchFailed: "Falha na busca",
    cannotComplete: "Não foi possível concluir a busca",
    openFailed: "Falha ao abrir",
    file: "Arquivo",
    directory: "Pasta",
    unknownTime: "Hora desconhecida",
    invalidDirectory: "A pasta selecionada não existe ou não é uma pasta.",
    searchTaskFailed: "A tarefa de busca falhou.",
    openTaskFailed: "A tarefa de abertura falhou.",
    openPathFailed: "Não foi possível abrir este caminho."
  },
  ru: {
    brandSubtitle: "Локальный поиск файлов",
    languageLabel: "Язык",
    rootLabel: "Папка поиска",
    rootPlaceholder: "Выберите или введите путь к папке",
    pickDirectory: "Выбрать папку",
    queryLabel: "Ключевое слово имени файла",
    queryPlaceholder: "Например report, .rs, договор",
    caseSensitive: "Учитывать регистр",
    includeHidden: "Включать скрытые файлы",
    maxResults: "Максимум результатов",
    searchButton: "Искать",
    eyebrow: "Поиск",
    waiting: "Готово к поиску",
    statFiles: "Файлов проверено",
    statDirs: "Папок проверено",
    statTime: "Время",
    emptyTitle: "Введите папку и ключевое слово",
    emptyText: "Поиск выполняется локально. Имена, пути и содержимое не отправляются.",
    searching: "Поиск...",
    found: (count) => `Найдено результатов: ${count}`,
    foundTruncated: (count) => `Найдено результатов: ${count}, достигнут лимит`,
    noResultsTitle: "Совпадений нет",
    noResultsText: "Попробуйте другое ключевое слово или включите скрытые файлы.",
    searchFailed: "Ошибка поиска",
    cannotComplete: "Не удалось завершить поиск",
    openFailed: "Не удалось открыть",
    file: "Файл",
    directory: "Папка",
    unknownTime: "Неизвестное время",
    invalidDirectory: "Выбранная папка не существует или не является папкой.",
    searchTaskFailed: "Задача поиска завершилась ошибкой.",
    openTaskFailed: "Задача открытия завершилась ошибкой.",
    openPathFailed: "Не удалось открыть этот путь."
  },
  ar: {
    brandSubtitle: "بحث ملفات داخل مجلد محلي",
    languageLabel: "اللغة",
    rootLabel: "مجلد البحث",
    rootPlaceholder: "اختر مسار مجلد أو أدخله",
    pickDirectory: "اختر مجلدا",
    queryLabel: "كلمة مفتاحية لاسم الملف",
    queryPlaceholder: "مثال report أو .rs أو invoice",
    caseSensitive: "مطابقة حالة الأحرف",
    includeHidden: "تضمين الملفات المخفية",
    maxResults: "الحد الأقصى للنتائج",
    searchButton: "بحث",
    eyebrow: "بحث",
    waiting: "جاهز للبحث",
    statFiles: "ملفات ممسوحة",
    statDirs: "مجلدات ممسوحة",
    statTime: "الوقت",
    emptyTitle: "أدخل مجلدا وكلمة مفتاحية للبدء",
    emptyText: "يعمل البحث محليا. لا يتم رفع أسماء الملفات أو المسارات أو المحتوى.",
    searching: "جار البحث...",
    found: (count) => `تم العثور على ${count} نتيجة`,
    foundTruncated: (count) => `تم العثور على ${count} نتيجة، تم بلوغ الحد`,
    noResultsTitle: "لا توجد نتائج",
    noResultsText: "جرب كلمة أخرى أو فعّل الملفات المخفية.",
    searchFailed: "فشل البحث",
    cannotComplete: "تعذر إكمال البحث",
    openFailed: "فشل الفتح",
    file: "ملف",
    directory: "مجلد",
    unknownTime: "وقت غير معروف",
    invalidDirectory: "المجلد المحدد غير موجود أو ليس مجلدا.",
    searchTaskFailed: "فشلت مهمة البحث.",
    openTaskFailed: "فشلت مهمة الفتح.",
    openPathFailed: "تعذر فتح هذا المسار."
  },
  hi: {
    brandSubtitle: "स्थानीय फ़ोल्डर फ़ाइल खोज",
    languageLabel: "भाषा",
    rootLabel: "खोज फ़ोल्डर",
    rootPlaceholder: "फ़ोल्डर पथ चुनें या लिखें",
    pickDirectory: "फ़ोल्डर चुनें",
    queryLabel: "फ़ाइल नाम कीवर्ड",
    queryPlaceholder: "जैसे report, .rs, invoice",
    caseSensitive: "बड़े-छोटे अक्षर अलग मानें",
    includeHidden: "छिपी फ़ाइलें शामिल करें",
    maxResults: "अधिकतम परिणाम",
    searchButton: "खोजें",
    eyebrow: "खोज",
    waiting: "खोज के लिए तैयार",
    statFiles: "स्कैन फ़ाइलें",
    statDirs: "स्कैन फ़ोल्डर",
    statTime: "समय",
    emptyTitle: "शुरू करने के लिए फ़ोल्डर और कीवर्ड दर्ज करें",
    emptyText: "खोज स्थानीय रूप से चलती है। फ़ाइल नाम, पथ और सामग्री अपलोड नहीं होती।",
    searching: "खोज जारी है...",
    found: (count) => `${count} परिणाम मिले`,
    foundTruncated: (count) => `${count} परिणाम मिले, सीमा पूरी हुई`,
    noResultsTitle: "कोई मिलान नहीं",
    noResultsText: "दूसरा कीवर्ड आज़माएँ या छिपी फ़ाइलें शामिल करें।",
    searchFailed: "खोज विफल",
    cannotComplete: "खोज पूरी नहीं हो सकी",
    openFailed: "खोलना विफल",
    file: "फ़ाइल",
    directory: "फ़ोल्डर",
    unknownTime: "अज्ञात समय",
    invalidDirectory: "चुना गया फ़ोल्डर मौजूद नहीं है या फ़ोल्डर नहीं है।",
    searchTaskFailed: "खोज कार्य विफल हुआ।",
    openTaskFailed: "खोलने का कार्य विफल हुआ।",
    openPathFailed: "यह पथ नहीं खोला जा सका।"
  },
  it: {
    brandSubtitle: "Ricerca locale di file",
    languageLabel: "Lingua",
    rootLabel: "Cartella di ricerca",
    rootPlaceholder: "Scegli o inserisci il percorso",
    pickDirectory: "Scegli cartella",
    queryLabel: "Parola chiave del file",
    queryPlaceholder: "Per esempio report, .rs, fattura",
    caseSensitive: "Maiuscole/minuscole",
    includeHidden: "Includi file nascosti",
    maxResults: "Risultati massimi",
    searchButton: "Cerca",
    eyebrow: "Ricerca",
    waiting: "Pronto per la ricerca",
    statFiles: "File scansionati",
    statDirs: "Cartelle scansionate",
    statTime: "Tempo",
    emptyTitle: "Inserisci cartella e parola chiave",
    emptyText: "La ricerca avviene localmente. Nomi, percorsi e contenuti non vengono caricati.",
    searching: "Ricerca...",
    found: (count) => `${count} risultat${count === 1 ? "o" : "i"} trovat${count === 1 ? "o" : "i"}`,
    foundTruncated: (count) => `${count} risultati trovati, limite raggiunto`,
    noResultsTitle: "Nessuna corrispondenza",
    noResultsText: "Prova un'altra parola chiave o includi i file nascosti.",
    searchFailed: "Ricerca non riuscita",
    cannotComplete: "Impossibile completare la ricerca",
    openFailed: "Apertura non riuscita",
    file: "File",
    directory: "Cartella",
    unknownTime: "Ora sconosciuta",
    invalidDirectory: "La cartella selezionata non esiste o non è una cartella.",
    searchTaskFailed: "L'attività di ricerca non è riuscita.",
    openTaskFailed: "L'attività di apertura non è riuscita.",
    openPathFailed: "Impossibile aprire questo percorso."
  },
  nl: {
    brandSubtitle: "Lokale bestandszoeker",
    languageLabel: "Taal",
    rootLabel: "Zoekmap",
    rootPlaceholder: "Kies of typ een mappad",
    pickDirectory: "Map kiezen",
    queryLabel: "Bestandsnaam trefwoord",
    queryPlaceholder: "Bijvoorbeeld report, .rs, factuur",
    caseSensitive: "Hoofdlettergevoelig",
    includeHidden: "Verborgen bestanden opnemen",
    maxResults: "Maximale resultaten",
    searchButton: "Zoeken",
    eyebrow: "Zoeken",
    waiting: "Klaar om te zoeken",
    statFiles: "Bestanden gescand",
    statDirs: "Mappen gescand",
    statTime: "Tijd",
    emptyTitle: "Voer een map en trefwoord in",
    emptyText: "Zoeken gebeurt lokaal. Bestandsnamen, paden en inhoud worden niet geüpload.",
    searching: "Zoeken...",
    found: (count) => `${count} resultaat${count === 1 ? "" : "en"} gevonden`,
    foundTruncated: (count) => `${count} resultaten gevonden, limiet bereikt`,
    noResultsTitle: "Geen overeenkomsten",
    noResultsText: "Probeer een ander trefwoord of verborgen bestanden.",
    searchFailed: "Zoeken mislukt",
    cannotComplete: "Zoeken kan niet worden voltooid",
    openFailed: "Openen mislukt",
    file: "Bestand",
    directory: "Map",
    unknownTime: "Onbekende tijd",
    invalidDirectory: "De gekozen map bestaat niet of is geen map.",
    searchTaskFailed: "De zoektaak is mislukt.",
    openTaskFailed: "De opentaak is mislukt.",
    openPathFailed: "Dit pad kan niet worden geopend."
  },
  tr: {
    brandSubtitle: "Yerel klasör dosya arama",
    languageLabel: "Dil",
    rootLabel: "Arama klasörü",
    rootPlaceholder: "Klasör yolu seçin veya girin",
    pickDirectory: "Klasör seç",
    queryLabel: "Dosya adı anahtar sözcüğü",
    queryPlaceholder: "Örneğin report, .rs, fatura",
    caseSensitive: "Büyük/küçük harfe duyarlı",
    includeHidden: "Gizli dosyaları dahil et",
    maxResults: "Maksimum sonuç",
    searchButton: "Ara",
    eyebrow: "Arama",
    waiting: "Aramaya hazır",
    statFiles: "Taranan dosyalar",
    statDirs: "Taranan klasörler",
    statTime: "Süre",
    emptyTitle: "Başlamak için klasör ve anahtar sözcük girin",
    emptyText: "Arama yerel olarak çalışır. Dosya adları, yollar ve içerik yüklenmez.",
    searching: "Aranıyor...",
    found: (count) => `${count} sonuç bulundu`,
    foundTruncated: (count) => `${count} sonuç bulundu, sınıra ulaşıldı`,
    noResultsTitle: "Eşleşme yok",
    noResultsText: "Başka bir anahtar sözcük deneyin veya gizli dosyaları dahil edin.",
    searchFailed: "Arama başarısız",
    cannotComplete: "Arama tamamlanamadı",
    openFailed: "Açılamadı",
    file: "Dosya",
    directory: "Klasör",
    unknownTime: "Bilinmeyen zaman",
    invalidDirectory: "Seçilen klasör yok veya klasör değil.",
    searchTaskFailed: "Arama görevi başarısız oldu.",
    openTaskFailed: "Açma görevi başarısız oldu.",
    openPathFailed: "Bu yol açılamadı."
  },
  vi: {
    brandSubtitle: "Tìm tệp trong thư mục cục bộ",
    languageLabel: "Ngôn ngữ",
    rootLabel: "Thư mục tìm kiếm",
    rootPlaceholder: "Chọn hoặc nhập đường dẫn thư mục",
    pickDirectory: "Chọn thư mục",
    queryLabel: "Từ khóa tên tệp",
    queryPlaceholder: "Ví dụ report, .rs, hóa đơn",
    caseSensitive: "Phân biệt hoa thường",
    includeHidden: "Bao gồm tệp ẩn",
    maxResults: "Số kết quả tối đa",
    searchButton: "Tìm kiếm",
    eyebrow: "Tìm kiếm",
    waiting: "Sẵn sàng tìm kiếm",
    statFiles: "Tệp đã quét",
    statDirs: "Thư mục đã quét",
    statTime: "Thời gian",
    emptyTitle: "Nhập thư mục và từ khóa để bắt đầu",
    emptyText: "Tìm kiếm chạy cục bộ. Tên tệp, đường dẫn và nội dung không được tải lên.",
    searching: "Đang tìm...",
    found: (count) => `Tìm thấy ${count} kết quả`,
    foundTruncated: (count) => `Tìm thấy ${count} kết quả, đã đạt giới hạn`,
    noResultsTitle: "Không có kết quả",
    noResultsText: "Thử từ khóa khác hoặc bao gồm tệp ẩn.",
    searchFailed: "Tìm kiếm thất bại",
    cannotComplete: "Không thể hoàn tất tìm kiếm",
    openFailed: "Mở thất bại",
    file: "Tệp",
    directory: "Thư mục",
    unknownTime: "Không rõ thời gian",
    invalidDirectory: "Thư mục đã chọn không tồn tại hoặc không phải thư mục.",
    searchTaskFailed: "Tác vụ tìm kiếm thất bại.",
    openTaskFailed: "Tác vụ mở thất bại.",
    openPathFailed: "Không thể mở đường dẫn này."
  },
  id: {
    brandSubtitle: "Pencarian file folder lokal",
    languageLabel: "Bahasa",
    rootLabel: "Folder pencarian",
    rootPlaceholder: "Pilih atau masukkan path folder",
    pickDirectory: "Pilih folder",
    queryLabel: "Kata kunci nama file",
    queryPlaceholder: "Misalnya report, .rs, invoice",
    caseSensitive: "Peka huruf besar/kecil",
    includeHidden: "Sertakan file tersembunyi",
    maxResults: "Hasil maksimum",
    searchButton: "Cari",
    eyebrow: "Cari",
    waiting: "Siap mencari",
    statFiles: "File dipindai",
    statDirs: "Folder dipindai",
    statTime: "Waktu",
    emptyTitle: "Masukkan folder dan kata kunci",
    emptyText: "Pencarian berjalan lokal. Nama file, path, dan konten tidak diunggah.",
    searching: "Mencari...",
    found: (count) => `Menemukan ${count} hasil`,
    foundTruncated: (count) => `Menemukan ${count} hasil, batas tercapai`,
    noResultsTitle: "Tidak ada kecocokan",
    noResultsText: "Coba kata kunci lain atau sertakan file tersembunyi.",
    searchFailed: "Pencarian gagal",
    cannotComplete: "Tidak dapat menyelesaikan pencarian",
    openFailed: "Gagal membuka",
    file: "File",
    directory: "Folder",
    unknownTime: "Waktu tidak diketahui",
    invalidDirectory: "Folder yang dipilih tidak ada atau bukan folder.",
    searchTaskFailed: "Tugas pencarian gagal.",
    openTaskFailed: "Tugas membuka gagal.",
    openPathFailed: "Tidak dapat membuka path ini."
  },
  th: {
    brandSubtitle: "ค้นหาไฟล์ในโฟลเดอร์ภายในเครื่อง",
    languageLabel: "ภาษา",
    rootLabel: "โฟลเดอร์ค้นหา",
    rootPlaceholder: "เลือกหรือป้อนเส้นทางโฟลเดอร์",
    pickDirectory: "เลือกโฟลเดอร์",
    queryLabel: "คำค้นชื่อไฟล์",
    queryPlaceholder: "เช่น report, .rs, invoice",
    caseSensitive: "แยกตัวพิมพ์ใหญ่เล็ก",
    includeHidden: "รวมไฟล์ที่ซ่อน",
    maxResults: "จำนวนผลลัพธ์สูงสุด",
    searchButton: "ค้นหา",
    eyebrow: "ค้นหา",
    waiting: "พร้อมค้นหา",
    statFiles: "ไฟล์ที่สแกน",
    statDirs: "โฟลเดอร์ที่สแกน",
    statTime: "เวลา",
    emptyTitle: "ป้อนโฟลเดอร์และคำค้นเพื่อเริ่ม",
    emptyText: "การค้นหาทำงานในเครื่อง ไม่มีการอัปโหลดชื่อไฟล์ เส้นทาง หรือเนื้อหา",
    searching: "กำลังค้นหา...",
    found: (count) => `พบ ${count} รายการ`,
    foundTruncated: (count) => `พบ ${count} รายการ ถึงขีดจำกัดแล้ว`,
    noResultsTitle: "ไม่พบรายการ",
    noResultsText: "ลองคำค้นอื่น หรือรวมไฟล์ที่ซ่อน",
    searchFailed: "ค้นหาล้มเหลว",
    cannotComplete: "ไม่สามารถค้นหาให้เสร็จได้",
    openFailed: "เปิดไม่สำเร็จ",
    file: "ไฟล์",
    directory: "โฟลเดอร์",
    unknownTime: "ไม่ทราบเวลา",
    invalidDirectory: "โฟลเดอร์ที่เลือกไม่มีอยู่หรือไม่ใช่โฟลเดอร์",
    searchTaskFailed: "งานค้นหาล้มเหลว",
    openTaskFailed: "งานเปิดล้มเหลว",
    openPathFailed: "ไม่สามารถเปิดเส้นทางนี้"
  },
  pl: {
    brandSubtitle: "Lokalne wyszukiwanie plików",
    languageLabel: "Język",
    rootLabel: "Folder wyszukiwania",
    rootPlaceholder: "Wybierz lub wpisz ścieżkę folderu",
    pickDirectory: "Wybierz folder",
    queryLabel: "Słowo kluczowe nazwy pliku",
    queryPlaceholder: "Na przykład report, .rs, faktura",
    caseSensitive: "Rozróżniaj wielkość liter",
    includeHidden: "Uwzględnij ukryte pliki",
    maxResults: "Maksymalna liczba wyników",
    searchButton: "Szukaj",
    eyebrow: "Szukaj",
    waiting: "Gotowe do wyszukiwania",
    statFiles: "Przeskanowane pliki",
    statDirs: "Przeskanowane foldery",
    statTime: "Czas",
    emptyTitle: "Wpisz folder i słowo kluczowe",
    emptyText: "Wyszukiwanie działa lokalnie. Nazwy, ścieżki i treść nie są wysyłane.",
    searching: "Wyszukiwanie...",
    found: (count) => `Znaleziono ${count} wyników`,
    foundTruncated: (count) => `Znaleziono ${count} wyników, osiągnięto limit`,
    noResultsTitle: "Brak dopasowań",
    noResultsText: "Spróbuj innego słowa lub uwzględnij ukryte pliki.",
    searchFailed: "Wyszukiwanie nie powiodło się",
    cannotComplete: "Nie można ukończyć wyszukiwania",
    openFailed: "Nie udało się otworzyć",
    file: "Plik",
    directory: "Folder",
    unknownTime: "Nieznany czas",
    invalidDirectory: "Wybrany folder nie istnieje lub nie jest folderem.",
    searchTaskFailed: "Zadanie wyszukiwania nie powiodło się.",
    openTaskFailed: "Zadanie otwierania nie powiodło się.",
    openPathFailed: "Nie można otworzyć tej ścieżki."
  },
  uk: {
    brandSubtitle: "Локальний пошук файлів",
    languageLabel: "Мова",
    rootLabel: "Папка пошуку",
    rootPlaceholder: "Виберіть або введіть шлях до папки",
    pickDirectory: "Вибрати папку",
    queryLabel: "Ключове слово імені файлу",
    queryPlaceholder: "Наприклад report, .rs, рахунок",
    caseSensitive: "Враховувати регістр",
    includeHidden: "Включати приховані файли",
    maxResults: "Максимум результатів",
    searchButton: "Шукати",
    eyebrow: "Пошук",
    waiting: "Готово до пошуку",
    statFiles: "Проскановано файлів",
    statDirs: "Проскановано папок",
    statTime: "Час",
    emptyTitle: "Введіть папку і ключове слово",
    emptyText: "Пошук виконується локально. Імена, шляхи і вміст не завантажуються.",
    searching: "Пошук...",
    found: (count) => `Знайдено результатів: ${count}`,
    foundTruncated: (count) => `Знайдено результатів: ${count}, досягнуто ліміт`,
    noResultsTitle: "Збігів немає",
    noResultsText: "Спробуйте інше ключове слово або включіть приховані файли.",
    searchFailed: "Помилка пошуку",
    cannotComplete: "Не вдалося завершити пошук",
    openFailed: "Не вдалося відкрити",
    file: "Файл",
    directory: "Папка",
    unknownTime: "Невідомий час",
    invalidDirectory: "Вибрана папка не існує або не є папкою.",
    searchTaskFailed: "Завдання пошуку завершилося помилкою.",
    openTaskFailed: "Завдання відкриття завершилося помилкою.",
    openPathFailed: "Не вдалося відкрити цей шлях."
  }
};

const aliases = {
  zh: "zh-CN",
  "zh-Hans": "zh-CN",
  "zh-Hant": "zh-TW",
  pt: "pt-BR",
  "pt-PT": "pt-BR"
};

const elements = {
  rootPath: document.querySelector("#root-path"),
  query: document.querySelector("#query"),
  pickDir: document.querySelector("#pick-dir"),
  caseSensitive: document.querySelector("#case-sensitive"),
  includeHidden: document.querySelector("#include-hidden"),
  maxResults: document.querySelector("#max-results"),
  language: document.querySelector("#language"),
  search: document.querySelector("#search"),
  title: document.querySelector("#status-title"),
  statFiles: document.querySelector("#stat-files"),
  statDirs: document.querySelector("#stat-dirs"),
  statMs: document.querySelector("#stat-ms"),
  emptyState: document.querySelector("#empty-state"),
  resultList: document.querySelector("#result-list")
};

let debounceTimer = 0;
let activeSearchId = 0;
let currentLanguage = resolveLanguage(localStorage.getItem("filenavigation.language") || "auto");
let lastResults = [];
let lastStats = { files: 0, dirs: 0, elapsedMs: 0 };
let lastStatusKey = "waiting";
let lastStatusCount = 0;
let lastStatusTruncated = false;

initLanguageSelect();
applyTranslations();

elements.pickDir.addEventListener("click", async () => {
  const selected = await open({
    directory: true,
    multiple: false,
    title: translate("pickDirectory")
  });

  if (typeof selected === "string") {
    elements.rootPath.value = selected;
    scheduleSearch();
  }
});

elements.language.addEventListener("change", () => {
  localStorage.setItem("filenavigation.language", elements.language.value);
  currentLanguage = resolveLanguage(elements.language.value);
  applyTranslations();
  setStatus(lastStatusKey, lastStats.files, lastStats.dirs, lastStats.elapsedMs, lastStatusCount, lastStatusTruncated);
  if (lastResults.length > 0) {
    renderResults(lastResults);
  }
});

elements.search.addEventListener("click", () => runSearch());
elements.query.addEventListener("input", () => scheduleSearch());
elements.rootPath.addEventListener("input", () => scheduleSearch());
elements.caseSensitive.addEventListener("change", () => scheduleSearch());
elements.includeHidden.addEventListener("change", () => scheduleSearch());
elements.maxResults.addEventListener("change", () => scheduleSearch());

function initLanguageSelect() {
  const saved = localStorage.getItem("filenavigation.language") || "auto";
  const fragment = document.createDocumentFragment();

  for (const [value, label] of languageOptions) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value === "auto" ? `${label} (${resolveLanguage("auto")})` : label;
    fragment.append(option);
  }

  elements.language.replaceChildren(fragment);
  elements.language.value = languageOptions.some(([value]) => value === saved) ? saved : "auto";
}

function resolveLanguage(value) {
  if (value && value !== "auto") {
    return translations[value] ? value : aliases[value] || value.split("-")[0];
  }

  for (const locale of navigator.languages || [navigator.language]) {
    const normalized = aliases[locale] || locale;
    if (translations[normalized]) {
      return normalized;
    }

    const base = normalized.split("-")[0];
    if (translations[base]) {
      return base;
    }
  }

  return "en";
}

function translate(key, ...args) {
  const value = translations[currentLanguage]?.[key] ?? translations.en[key] ?? key;
  return typeof value === "function" ? value(...args) : value;
}

function applyTranslations() {
  document.documentElement.lang = currentLanguage;
  document.documentElement.dir = currentLanguage === "ar" ? "rtl" : "ltr";

  document.querySelectorAll("[data-i18n]").forEach((node) => {
    node.textContent = translate(node.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
    node.placeholder = translate(node.dataset.i18nPlaceholder);
  });
  document.querySelectorAll("[data-i18n-title]").forEach((node) => {
    node.title = translate(node.dataset.i18nTitle);
  });
  document.querySelectorAll("[data-i18n-aria-label]").forEach((node) => {
    node.setAttribute("aria-label", translate(node.dataset.i18nAriaLabel));
  });
}

function scheduleSearch() {
  window.clearTimeout(debounceTimer);
  debounceTimer = window.setTimeout(() => runSearch(), 280);
}

async function runSearch() {
  const root = elements.rootPath.value.trim();
  const query = elements.query.value.trim();

  if (!root || !query) {
    lastResults = [];
    setStatus("waiting", 0, 0, 0);
    renderEmpty("emptyTitle", "emptyText");
    return;
  }

  const searchId = ++activeSearchId;
  elements.search.disabled = true;
  elements.title.textContent = translate("searching");
  elements.emptyState.hidden = true;
  elements.resultList.innerHTML = "";

  try {
    const response = await invoke("search_files", {
      request: {
        root,
        query,
        case_sensitive: elements.caseSensitive.checked,
        include_hidden: elements.includeHidden.checked,
        max_results: Number(elements.maxResults.value || 500)
      }
    });

    if (searchId !== activeSearchId) {
      return;
    }

    lastResults = response.results;
    setStatus(
      "found",
      response.stats.files_scanned,
      response.stats.directories_scanned,
      response.stats.elapsed_ms,
      response.results.length,
      response.truncated
    );

    if (response.results.length === 0) {
      renderEmpty("noResultsTitle", "noResultsText");
    } else {
      renderResults(response.results);
    }
  } catch (error) {
    if (searchId === activeSearchId) {
      lastResults = [];
      setStatus("searchFailed", 0, 0, 0);
      renderEmpty("cannotComplete", mapError(error));
    }
  } finally {
    if (searchId === activeSearchId) {
      elements.search.disabled = false;
    }
  }
}

function setStatus(statusKey, files, dirs, elapsedMs, count = 0, truncated = false) {
  lastStatusKey = statusKey;
  lastStatusCount = count;
  lastStatusTruncated = truncated;
  lastStats = { files, dirs, elapsedMs };

  if (statusKey === "found") {
    elements.title.textContent = translate(truncated ? "foundTruncated" : "found", count);
  } else {
    elements.title.textContent = translate(statusKey);
  }

  elements.statFiles.textContent = formatNumber(files);
  elements.statDirs.textContent = formatNumber(dirs);
  elements.statMs.textContent = `${formatNumber(elapsedMs)} ms`;
}

function renderEmpty(titleKey, textKey) {
  elements.emptyState.hidden = false;
  elements.emptyState.querySelector("h3").textContent = translate(titleKey);
  elements.emptyState.querySelector("p").textContent = translate(textKey);
  elements.resultList.innerHTML = "";
}

function renderResults(results) {
  elements.emptyState.hidden = true;
  const fragment = document.createDocumentFragment();

  for (const result of results) {
    const row = document.createElement("article");
    row.className = "result-row";

    const icon = document.createElement("div");
    icon.className = "file-icon";
    icon.textContent = result.is_dir ? "DIR" : "FILE";

    const content = document.createElement("div");
    content.className = "result-content";

    const name = document.createElement("button");
    name.className = "result-name";
    name.type = "button";
    name.textContent = result.name;
    name.addEventListener("click", () => openPath(result.path));

    const path = document.createElement("p");
    path.className = "result-path";
    path.textContent = result.path;

    const meta = document.createElement("p");
    meta.className = "result-meta";
    meta.textContent = `${translate(result.is_dir ? "directory" : "file")} · ${formatBytes(result.size)} · ${
      result.modified ?? translate("unknownTime")
    }`;

    content.append(name, path, meta);
    row.append(icon, content);
    fragment.append(row);
  }

  elements.resultList.replaceChildren(fragment);
}

async function openPath(path) {
  try {
    await invoke("open_path", { path });
  } catch (error) {
    elements.title.textContent = `${translate("openFailed")}: ${mapError(error)}`;
  }
}

function mapError(error) {
  const key = String(error);
  return translations[currentLanguage]?.[key] ? translate(key) : key;
}

function formatNumber(value) {
  return new Intl.NumberFormat(currentLanguage).format(value);
}

function formatBytes(bytes) {
  if (bytes === 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB", "TB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** index;
  return `${new Intl.NumberFormat(currentLanguage, {
    maximumFractionDigits: value >= 100 || index === 0 ? 0 : 1
  }).format(value)} ${units[index]}`;
}
