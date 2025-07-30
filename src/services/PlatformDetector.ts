/// <reference lib="dom" />

/**
 * Типы платформ, поддерживаемых приложением
 */
export enum PlatformType {
    /** Браузерная среда */
    BROWSER = 'browser',
    /** Мобильное приложение Cordova */
    CORDOVA = 'cordova'
}

/**
 * Информация о возможностях устройства
 */
export interface DeviceCapabilities {
    /** Поддержка File API */
    hasFileAPI: boolean;
    /** Поддержка localStorage */
    hasLocalStorage: boolean;
    /** Поддержка Cordova File Plugin */
    hasCordovaFile: boolean;
    /** Поддержка Network Information API */
    hasNetworkInfo: boolean;
    /** Является ли устройство мобильным */
    isMobile: boolean;
    /** Поддержка touch событий */
    hasTouch: boolean;
}

/**
 * Состояние интернет-соединения
 */
export enum NetworkStatus {
    /** Онлайн */
    ONLINE = 'online',
    /** Офлайн */
    OFFLINE = 'offline',
    /** Неизвестно */
    UNKNOWN = 'unknown'
}

/**
 * Сервис для определения платформы и возможностей устройства
 * Поддерживает браузерную среду и Apache Cordova
 */
export class PlatformDetector {
    private currentPlatform: PlatformType;
    private capabilities: DeviceCapabilities;
    private networkListeners: Array<(status: NetworkStatus) => void> = [];

    constructor() {
        this.currentPlatform = this.detectPlatform();
        this.capabilities = this.detectCapabilities();
        this.initializeNetworkMonitoring();
    }

    /**
     * Получить текущую платформу
     */
    getPlatform(): PlatformType {
        return this.currentPlatform;
    }

    /**
     * Проверить, является ли текущая платформа браузером
     */
    isBrowser(): boolean {
        return this.currentPlatform === PlatformType.BROWSER;
    }

    /**
     * Проверить, является ли текущая платформа Cordova
     */
    isCordova(): boolean {
        return this.currentPlatform === PlatformType.CORDOVA;
    }

    /**
     * Получить возможности устройства
     */
    getCapabilities(): DeviceCapabilities {
        return { ...this.capabilities };
    }

    /**
     * Проверить наличие интернет-соединения
     */
    isOnline(): boolean {
        if (this.isCordova() && typeof navigator !== 'undefined' && (navigator as any).connection) {
            // Используем Cordova Network Information Plugin
            const connection = (navigator as any).connection;
            return connection.type !== 'none';
        } else if (typeof navigator !== 'undefined' && 'onLine' in navigator) {
            // Используем стандартный Navigator API
            return navigator.onLine;
        }

        // По умолчанию считаем, что онлайн
        return true;
    }

    /**
     * Получить текущий статус сети
     */
    getNetworkStatus(): NetworkStatus {
        if (this.isOnline()) {
            return NetworkStatus.ONLINE;
        } else {
            return NetworkStatus.OFFLINE;
        }
    }

    /**
     * Подписаться на изменения состояния сети
     */
    onNetworkChange(callback: (status: NetworkStatus) => void): () => void {
        this.networkListeners.push(callback);

        // Возвращаем функцию для отписки
        return () => {
            const index = this.networkListeners.indexOf(callback);
            if (index > -1) {
                this.networkListeners.splice(index, 1);
            }
        };
    }

    /**
     * Проверить, поддерживается ли File API
     */
    hasFileAPISupport(): boolean {
        return this.capabilities.hasFileAPI;
    }

    /**
     * Проверить, поддерживается ли localStorage
     */
    hasLocalStorageSupport(): boolean {
        return this.capabilities.hasLocalStorage;
    }

    /**
     * Проверить, доступен ли Cordova File Plugin
     */
    hasCordovaFileSupport(): boolean {
        return this.capabilities.hasCordovaFile;
    }

    /**
     * Проверить, является ли устройство мобильным
     */
    isMobileDevice(): boolean {
        return this.capabilities.isMobile;
    }

    /**
     * Проверить, поддерживаются ли touch события
     */
    hasTouchSupport(): boolean {
        return this.capabilities.hasTouch;
    }

    /**
     * Получить информацию о типе соединения (только для Cordova)
     */
    getConnectionType(): string {
        if (this.isCordova() && typeof navigator !== 'undefined' && (navigator as any).connection) {
            return (navigator as any).connection.type || 'unknown';
        }
        return 'unknown';
    }

    /**
     * Определить текущую платформу
     */
    private detectPlatform(): PlatformType {
        // Проверяем наличие window объекта
        if (typeof window === 'undefined') {
            return PlatformType.BROWSER; // По умолчанию для серверной среды
        }

        // Проверяем наличие Cordova
        if (typeof (window as any).cordova !== 'undefined' ||
            typeof (window as any).PhoneGap !== 'undefined' ||
            typeof (window as any).phonegap !== 'undefined') {
            return PlatformType.CORDOVA;
        }

        // Проверяем через document.URL для Cordova приложений
        if (typeof document !== 'undefined' && document.URL.indexOf('http://') === -1 && document.URL.indexOf('https://') === -1) {
            return PlatformType.CORDOVA;
        }

        return PlatformType.BROWSER;
    }

    /**
     * Определить возможности устройства
     */
    private detectCapabilities(): DeviceCapabilities {
        return {
            hasFileAPI: this.checkFileAPISupport(),
            hasLocalStorage: this.checkLocalStorageSupport(),
            hasCordovaFile: this.checkCordovaFileSupport(),
            hasNetworkInfo: this.checkNetworkInfoSupport(),
            isMobile: this.checkMobileDevice(),
            hasTouch: this.checkTouchSupport()
        };
    }

    /**
     * Проверить поддержку File API
     */
    private checkFileAPISupport(): boolean {
        return typeof File !== 'undefined' &&
            typeof FileReader !== 'undefined' &&
            typeof FileList !== 'undefined' &&
            typeof Blob !== 'undefined';
    }

    /**
     * Проверить поддержку localStorage
     */
    private checkLocalStorageSupport(): boolean {
        try {
            const test = 'test';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Проверить поддержку Cordova File Plugin
     */
    private checkCordovaFileSupport(): boolean {
        return this.isCordova() &&
            typeof (window as any).resolveLocalFileSystemURL !== 'undefined';
    }

    /**
     * Проверить поддержку Network Information API
     */
    private checkNetworkInfoSupport(): boolean {
        if (this.isCordova()) {
            return typeof (window as any).navigator?.connection !== 'undefined';
        } else {
            return typeof navigator !== 'undefined' && 'onLine' in navigator;
        }
    }

    /**
     * Проверить, является ли устройство мобильным
     */
    private checkMobileDevice(): boolean {
        if (this.isCordova()) {
            return true;
        }

        // Проверяем User Agent для браузера
        if (typeof navigator === 'undefined' || typeof window === 'undefined') {
            return false;
        }

        const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
        return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    }

    /**
     * Проверить поддержку touch событий
     */
    private checkTouchSupport(): boolean {
        if (typeof window === 'undefined' || typeof navigator === 'undefined') {
            return false;
        }

        return 'ontouchstart' in window ||
            navigator.maxTouchPoints > 0 ||
            (navigator as any).msMaxTouchPoints > 0;
    }

    /**
     * Инициализировать мониторинг состояния сети
     */
    private initializeNetworkMonitoring(): void {
        if (typeof window === 'undefined' || typeof document === 'undefined') {
            return; // Не можем инициализировать в серверной среде
        }

        if (this.isCordova()) {
            // Используем Cordova события
            document.addEventListener('online', () => {
                this.notifyNetworkChange(NetworkStatus.ONLINE);
            }, false);

            document.addEventListener('offline', () => {
                this.notifyNetworkChange(NetworkStatus.OFFLINE);
            }, false);
        } else {
            // Используем стандартные браузерные события
            window.addEventListener('online', () => {
                this.notifyNetworkChange(NetworkStatus.ONLINE);
            });

            window.addEventListener('offline', () => {
                this.notifyNetworkChange(NetworkStatus.OFFLINE);
            });
        }
    }

    /**
     * Уведомить слушателей об изменении состояния сети
     */
    private notifyNetworkChange(status: NetworkStatus): void {
        this.networkListeners.forEach(callback => {
            try {
                callback(status);
            } catch (error) {
                console.error('Ошибка в callback функции мониторинга сети:', error);
            }
        });
    }
}

// Создаем singleton экземпляр (ленивая инициализация)
let _platformDetector: PlatformDetector | null = null;

export const platformDetector = {
    get instance(): PlatformDetector {
        if (!_platformDetector) {
            _platformDetector = new PlatformDetector();
        }
        return _platformDetector;
    }
};

// Для обратной совместимости экспортируем методы напрямую
export const getPlatform = () => platformDetector.instance.getPlatform();
export const isBrowser = () => platformDetector.instance.isBrowser();
export const isCordova = () => platformDetector.instance.isCordova();
export const isOnline = () => platformDetector.instance.isOnline();