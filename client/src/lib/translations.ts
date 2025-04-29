export type Language = 'en' | 'ru' | 'tj';

export type TranslationKey = 
  // Common
  | 'app_name'
  | 'dashboard'
  | 'equipment'
  | 'network'
  | 'reports'
  | 'analytics'
  | 'settings'
  | 'users'
  | 'permits'
  | 'login'
  | 'logout'
  | 'username'
  | 'password'
  | 'search'
  | 'loading'
  | 'error'
  | 'success'
  | 'cancel'
  | 'save'
  | 'edit'
  | 'delete'
  | 'add'
  | 'view'
  | 'download'
  | 'export'
  | 'back'
  | 'next'
  | 'preview'
  | 'generate'
  | 'title'
  | 'description'
  | 'enter'
  | 'report'
  | 'saved'
  | 'report_configuration'
  | 'based_on'
  | 'and'
  
  // Dashboard
  | 'overview'
  | 'status'
  | 'alerts'
  | 'recent_activities'
  | 'kpi_dashboard'
  | 'energy_consumption'
  | 'system_health'
  | 'welcome_message'
  
  // Equipment
  | 'add_equipment'
  | 'equipment_id'
  | 'equipment_type'
  | 'equipment_name'
  | 'equipment_status'
  | 'location'
  | 'manufacturer'
  | 'installation_date'
  | 'last_maintenance'
  | 'power_rating'
  | 'voltage_level'
  
  // Network
  | 'network_diagram'
  | 'nodes'
  | 'connections'
  | 'meters'
  | 'network_balance'
  | 'add_node'
  | 'add_connection'
  | 'add_meter'
  | 'node_type'
  | 'node_name'
  | 'source_node'
  | 'target_node'
  
  // Reports
  | 'report_generator'
  | 'kpi_reports'
  | 'system_logs'
  | 'energy_reports'
  | 'predictions'
  | 'alerts_analysis'
  | 'performance_analytics'
  | 'frequency'
  | 'monthly'
  | 'quarterly'
  | 'yearly'
  | 'custom'
  | 'report_type'
  | 'report_period'
  | 'report_title'
  | 'report_description'
  | 'report_standard'
  | 'report_category'
  | 'report_format'
  | 'select_metrics'
  | 'schedule_generation'
  | 'generated_reports'
  | 'saved_reports'
  | 'operational'
  | 'commercial'
  | 'financial'
  | 'safety'
  | 'compliance'
  
  // Analytics
  | 'trends'
  | 'comparisons'
  | 'forecasts'
  | 'time_range'
  | 'metrics'
  | 'visualization'
  | 'chart_type'
  
  // Permits
  | 'work_permits'
  | 'permit_id'
  | 'permit_type'
  | 'permit_status'
  | 'start_date'
  | 'end_date'
  | 'issued_by'
  | 'approved_by'
  
  // Settings
  | 'profile'
  | 'language'
  | 'theme'
  | 'notifications'
  | 'security'
  | 'api_keys'
  | 'preferences'
  | 'account';

export const translations: Record<Language, Record<TranslationKey, string>> = {
  en: {
    // Common
    app_name: 'Energy Management System',
    dashboard: 'Dashboard',
    equipment: 'Equipment',
    network: 'Network',
    reports: 'Reports',
    analytics: 'Analytics',
    settings: 'Settings',
    users: 'Users',
    permits: 'Permits',
    login: 'Login',
    logout: 'Logout',
    username: 'Username',
    password: 'Password',
    search: 'Search',
    loading: 'Loading',
    error: 'Error',
    success: 'Success',
    cancel: 'Cancel',
    save: 'Save',
    edit: 'Edit',
    delete: 'Delete',
    add: 'Add',
    view: 'View',
    download: 'Download',
    export: 'Export',
    back: 'Back',
    next: 'Next',
    preview: 'Preview',
    generate: 'Generate',
    title: 'Title',
    description: 'Description',
    enter: 'Enter',
    report: 'Report',
    saved: 'Saved',
    report_configuration: 'Report Configuration',
    based_on: 'based on',
    and: 'and',
    
    // Dashboard
    overview: 'Overview',
    status: 'Status',
    alerts: 'Alerts',
    recent_activities: 'Recent Activities',
    kpi_dashboard: 'KPI Dashboard',
    energy_consumption: 'Energy Consumption',
    system_health: 'System Health',
    welcome_message: 'Welcome to the Energy Management System',
    
    // Equipment
    add_equipment: 'Add Equipment',
    equipment_id: 'Equipment ID',
    equipment_type: 'Equipment Type',
    equipment_name: 'Equipment Name',
    equipment_status: 'Status',
    location: 'Location',
    manufacturer: 'Manufacturer',
    installation_date: 'Installation Date',
    last_maintenance: 'Last Maintenance',
    power_rating: 'Power Rating',
    voltage_level: 'Voltage Level',
    
    // Network
    network_diagram: 'Network Diagram',
    nodes: 'Nodes',
    connections: 'Connections',
    meters: 'Meters',
    network_balance: 'Network Balance',
    add_node: 'Add Node',
    add_connection: 'Add Connection',
    add_meter: 'Add Meter',
    node_type: 'Node Type',
    node_name: 'Node Name',
    source_node: 'Source Node',
    target_node: 'Target Node',
    
    // Reports
    report_generator: 'Report Generator',
    kpi_reports: 'KPI Reports',
    system_logs: 'System Logs',
    energy_reports: 'Energy Reports',
    predictions: 'AI Predictions',
    alerts_analysis: 'Alerts Analysis',
    performance_analytics: 'Performance Analytics',
    frequency: 'Frequency',
    monthly: 'Monthly',
    quarterly: 'Quarterly',
    yearly: 'Yearly',
    custom: 'Custom',
    report_type: 'Report Type',
    report_period: 'Report Period',
    report_title: 'Report Title',
    report_description: 'Description',
    report_standard: 'Report Standard',
    report_category: 'Metric Category',
    report_format: 'Export Format',
    select_metrics: 'Select Metrics',
    schedule_generation: 'Schedule Generation',
    generated_reports: 'Generated Reports',
    saved_reports: 'Saved Reports',
    operational: 'Operational',
    commercial: 'Commercial',
    financial: 'Financial',
    safety: 'Safety',
    compliance: 'Compliance',
    
    // Analytics
    trends: 'Trends',
    comparisons: 'Comparisons',
    forecasts: 'Forecasts',
    time_range: 'Time Range',
    metrics: 'Metrics',
    visualization: 'Visualization',
    chart_type: 'Chart Type',
    
    // Permits
    work_permits: 'Work Permits',
    permit_id: 'Permit ID',
    permit_type: 'Permit Type',
    permit_status: 'Status',
    start_date: 'Start Date',
    end_date: 'End Date',
    issued_by: 'Issued By',
    approved_by: 'Approved By',
    
    // Settings
    profile: 'Profile',
    language: 'Language',
    theme: 'Theme',
    notifications: 'Notifications',
    security: 'Security',
    api_keys: 'API Keys',
    preferences: 'Preferences',
    account: 'Account'
  },
  
  ru: {
    // Common
    app_name: 'Система управления энергией',
    dashboard: 'Панель управления',
    equipment: 'Оборудование',
    network: 'Сеть',
    reports: 'Отчеты',
    analytics: 'Аналитика',
    settings: 'Настройки',
    users: 'Пользователи',
    permits: 'Разрешения',
    login: 'Вход',
    logout: 'Выход',
    username: 'Имя пользователя',
    password: 'Пароль',
    search: 'Поиск',
    loading: 'Загрузка',
    error: 'Ошибка',
    success: 'Успех',
    cancel: 'Отмена',
    save: 'Сохранить',
    edit: 'Редактировать',
    delete: 'Удалить',
    add: 'Добавить',
    view: 'Просмотр',
    download: 'Скачать',
    export: 'Экспорт',
    back: 'Назад',
    next: 'Далее',
    preview: 'Предпросмотр',
    generate: 'Генерировать',
    title: 'Заголовок',
    description: 'Описание',
    enter: 'Введите',
    report: 'Отчет',
    saved: 'Сохраненный',
    report_configuration: 'Конфигурация отчета',
    based_on: 'на основе',
    and: 'и',
    
    // Dashboard
    overview: 'Обзор',
    status: 'Статус',
    alerts: 'Оповещения',
    recent_activities: 'Последние действия',
    kpi_dashboard: 'Панель KPI',
    energy_consumption: 'Потребление энергии',
    system_health: 'Состояние системы',
    welcome_message: 'Добро пожаловать в систему управления энергией',
    
    // Equipment
    add_equipment: 'Добавить оборудование',
    equipment_id: 'ID оборудования',
    equipment_type: 'Тип оборудования',
    equipment_name: 'Название оборудования',
    equipment_status: 'Статус',
    location: 'Местоположение',
    manufacturer: 'Производитель',
    installation_date: 'Дата установки',
    last_maintenance: 'Последнее обслуживание',
    power_rating: 'Мощность',
    voltage_level: 'Уровень напряжения',
    
    // Network
    network_diagram: 'Схема сети',
    nodes: 'Узлы',
    connections: 'Соединения',
    meters: 'Счетчики',
    network_balance: 'Баланс сети',
    add_node: 'Добавить узел',
    add_connection: 'Добавить соединение',
    add_meter: 'Добавить счетчик',
    node_type: 'Тип узла',
    node_name: 'Название узла',
    source_node: 'Исходный узел',
    target_node: 'Целевой узел',
    
    // Reports
    report_generator: 'Генератор отчетов',
    kpi_reports: 'Отчеты KPI',
    system_logs: 'Системные журналы',
    energy_reports: 'Отчеты по энергии',
    predictions: 'ИИ прогнозы',
    alerts_analysis: 'Анализ оповещений',
    performance_analytics: 'Аналитика производительности',
    frequency: 'Частота',
    monthly: 'Ежемесячно',
    quarterly: 'Ежеквартально',
    yearly: 'Ежегодно',
    custom: 'Пользовательский',
    report_type: 'Тип отчета',
    report_period: 'Период отчета',
    report_title: 'Название отчета',
    report_description: 'Описание',
    report_standard: 'Стандарт отчета',
    report_category: 'Категория метрики',
    report_format: 'Формат экспорта',
    select_metrics: 'Выбрать метрики',
    schedule_generation: 'Запланировать генерацию',
    generated_reports: 'Сгенерированные отчеты',
    saved_reports: 'Сохраненные отчеты',
    operational: 'Операционный',
    commercial: 'Коммерческий',
    financial: 'Финансовый',
    safety: 'Безопасность',
    compliance: 'Соответствие',
    
    // Analytics
    trends: 'Тренды',
    comparisons: 'Сравнения',
    forecasts: 'Прогнозы',
    time_range: 'Временной диапазон',
    metrics: 'Метрики',
    visualization: 'Визуализация',
    chart_type: 'Тип графика',
    
    // Permits
    work_permits: 'Разрешения на работу',
    permit_id: 'ID разрешения',
    permit_type: 'Тип разрешения',
    permit_status: 'Статус',
    start_date: 'Дата начала',
    end_date: 'Дата окончания',
    issued_by: 'Выдано',
    approved_by: 'Утверждено',
    
    // Settings
    profile: 'Профиль',
    language: 'Язык',
    theme: 'Тема',
    notifications: 'Уведомления',
    security: 'Безопасность',
    api_keys: 'API ключи',
    preferences: 'Предпочтения',
    account: 'Аккаунт'
  },
  
  tj: {
    // Common
    app_name: 'Системаи идоракунии энергия',
    dashboard: 'Лавҳаи идоракунӣ',
    equipment: 'Таҷҳизот',
    network: 'Шабака',
    reports: 'Ҳисоботҳо',
    analytics: 'Таҳлилҳо',
    settings: 'Танзимот',
    users: 'Корбарон',
    permits: 'Иҷозатҳо',
    login: 'Воридшавӣ',
    logout: 'Баромадан',
    username: 'Номи корбар',
    password: 'Рамз',
    search: 'Ҷустуҷӯ',
    loading: 'Боркунӣ',
    error: 'Хато',
    success: 'Бомуваффақият',
    cancel: 'Бекор кардан',
    save: 'Нигоҳ доштан',
    edit: 'Таҳрир кардан',
    delete: 'Нест кардан',
    add: 'Илова кардан',
    view: 'Дидан',
    download: 'Зеркашӣ',
    export: 'Содирот',
    back: 'Бозгашт',
    next: 'Навбатӣ',
    preview: 'Пешнамоиш',
    generate: 'Эҷод кардан',
    title: 'Сарлавҳа',
    description: 'Тавсиф',
    enter: 'Ворид кунед',
    report: 'Ҳисобот',
    saved: 'Нигоҳдошташуда',
    report_configuration: 'Танзимоти ҳисобот',
    based_on: 'дар асоси',
    and: 'ва',
    
    // Dashboard
    overview: 'Мурури умумӣ',
    status: 'Ҳолат',
    alerts: 'Огоҳиҳо',
    recent_activities: 'Фаъолиятҳои охирин',
    kpi_dashboard: 'Лавҳаи KPI',
    energy_consumption: 'Истеъмоли энергия',
    system_health: 'Саломатии система',
    welcome_message: 'Хуш омадед ба системаи идоракунии энергия',
    
    // Equipment
    add_equipment: 'Илова кардани таҷҳизот',
    equipment_id: 'ID таҷҳизот',
    equipment_type: 'Навъи таҷҳизот',
    equipment_name: 'Номи таҷҳизот',
    equipment_status: 'Ҳолат',
    location: 'Ҷойгиршавӣ',
    manufacturer: 'Истеҳсолкунанда',
    installation_date: 'Санаи насб',
    last_maintenance: 'Хизматрасонии охирин',
    power_rating: 'Иқтидори барқ',
    voltage_level: 'Сатҳи шиддат',
    
    // Network
    network_diagram: 'Нақшаи шабака',
    nodes: 'Гиреҳҳо',
    connections: 'Пайвастҳо',
    meters: 'Ҳисобкунакҳо',
    network_balance: 'Тавозуни шабака',
    add_node: 'Илова кардани гиреҳ',
    add_connection: 'Илова кардани пайваст',
    add_meter: 'Илова кардани ҳисобкунак',
    node_type: 'Навъи гиреҳ',
    node_name: 'Номи гиреҳ',
    source_node: 'Гиреҳи манбаъ',
    target_node: 'Гиреҳи мақсад',
    
    // Reports
    report_generator: 'Тавлидкунандаи ҳисобот',
    kpi_reports: 'Ҳисоботи KPI',
    system_logs: 'Сабтҳои система',
    energy_reports: 'Ҳисоботи энергия',
    predictions: 'Пешгӯиҳои AI',
    alerts_analysis: 'Таҳлили огоҳиҳо',
    performance_analytics: 'Таҳлили самаранокӣ',
    frequency: 'Басомад',
    monthly: 'Моҳона',
    quarterly: 'Семоҳа',
    yearly: 'Солона',
    custom: 'Фармоишӣ',
    report_type: 'Навъи ҳисобот',
    report_period: 'Давраи ҳисобот',
    report_title: 'Унвони ҳисобот',
    report_description: 'Тавсиф',
    report_standard: 'Стандарти ҳисобот',
    report_category: 'Категорияи ченак',
    report_format: 'Формати содирот',
    select_metrics: 'Интихоби ченакҳо',
    schedule_generation: 'Ҷадвали тавлид',
    generated_reports: 'Ҳисоботҳои тавлидшуда',
    saved_reports: 'Ҳисоботҳои нигоҳдошташуда',
    operational: 'Амалиётӣ',
    commercial: 'Тиҷоратӣ',
    financial: 'Молиявӣ',
    safety: 'Бехатарӣ',
    compliance: 'Мутобиқат',
    
    // Analytics
    trends: 'Равандҳо',
    comparisons: 'Муқоисаҳо',
    forecasts: 'Пешбиниҳо',
    time_range: 'Фосилаи вақт',
    metrics: 'Ченакҳо',
    visualization: 'Визуализатсия',
    chart_type: 'Навъи диаграмма',
    
    // Permits
    work_permits: 'Иҷозатҳои корӣ',
    permit_id: 'ID иҷозат',
    permit_type: 'Навъи иҷозат',
    permit_status: 'Ҳолат',
    start_date: 'Санаи оғоз',
    end_date: 'Санаи анҷом',
    issued_by: 'Содиршуда аз тарафи',
    approved_by: 'Тасдиқшуда аз тарафи',
    
    // Settings
    profile: 'Профил',
    language: 'Забон',
    theme: 'Мавзӯъ',
    notifications: 'Огоҳиҳо',
    security: 'Амният',
    api_keys: 'Калидҳои API',
    preferences: 'Афзалиятҳо',
    account: 'Ҳисоб'
  }
};