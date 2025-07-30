/**
 * Тесты для PlatformDetector
 */
import { PlatformDetector, PlatformType, NetworkStatus } from '../PlatformDetector';

// Мокаем localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
            store[key] = value;
        },
        removeItem: (key: string) => {
            delete store[key];
        },
        clear: () => {
            store = {};
        }
    };
})();

Object.defineProperty(global, 'localStorage', {
    value: localStorageMock
});

// Мокаем navigator
Object.defineProperty(global, 'navigator', {
    value: {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        onLine: true,
        maxTouchPoints: 0
    },
    writable: true
});

// Мокаем window
Object.defineProperty(global, 'window', {
    value: {
        addEventListener: jest.fn(),
        removeEventListener: jest.fn()
    },
    writable: true
});

// Мокаем document
Object.defineProperty(global, 'document', {
    value: {
        URL: 'http://localhost:3000',
        addEventListener: jest.fn(),
        removeEventListener: jest.fn()
    },
    writable: true
});

// Мокаем File API
(global as any).File = jest.fn();
(global as any).FileReader = jest.fn();
(global as any).FileList = jest.fn();
(global as any).Blob = jest.fn();

describe('PlatformDetector', () => {
    let platformDetector: PlatformDetector;

    beforeEach(() => {
        // Сбрасываем моки
        jest.clearAllMocks();
        localStorageMock.clear();

        // Сбрасываем window объект к браузерному состоянию
        (global as any).window = {
            addEventListener: jest.fn(),
            removeEventListener: jest.fn()
        };

        (global as any).document = {
            URL: 'http://localhost:3000',
            addEventListener: jest.fn(),
            removeEventListener: jest.fn()
        };

        (global as any).navigator = {
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            onLine: true,
            maxTouchPoints: 0
        };
    });

    describe('Определение платформы', () => {
        it('должен определить браузерную платформу', () => {
            platformDetector = new PlatformDetector();

            expect(platformDetector.getPlatform()).toBe(PlatformType.BROWSER);
            expect(platformDetector.isBrowser()).toBe(true);
            expect(platformDetector.isCordova()).toBe(false);
        });

        it('должен определить Cordova платформу по наличию cordova объекта', () => {
            (global as any).window.cordova = {};

            platformDetector = new PlatformDetector();

            expect(platformDetector.getPlatform()).toBe(PlatformType.CORDOVA);
            expect(platformDetector.isCordova()).toBe(true);
            expect(platformDetector.isBrowser()).toBe(false);
        });

        it('должен определить Cordova платформу по URL', () => {
            (global as any).document.URL = 'file:///android_asset/www/index.html';

            platformDetector = new PlatformDetector();

            expect(platformDetector.getPlatform()).toBe(PlatformType.CORDOVA);
            expect(platformDetector.isCordova()).toBe(true);
        });
    });

    describe('Определение возможностей устройства', () => {
        beforeEach(() => {
            platformDetector = new PlatformDetector();
        });

        it('должен определить поддержку File API', () => {
            const capabilities = platformDetector.getCapabilities();
            expect(capabilities.hasFileAPI).toBe(true);
        });

        it('должен определить поддержку localStorage', () => {
            const capabilities = platformDetector.getCapabilities();
            expect(capabilities.hasLocalStorage).toBe(true);
        });

        it('должен определить отсутствие Cordova File в браузере', () => {
            const capabilities = platformDetector.getCapabilities();
            expect(capabilities.hasCordovaFile).toBe(false);
        });

        it('должен определить поддержку Network Info в браузере', () => {
            const capabilities = platformDetector.getCapabilities();
            expect(capabilities.hasNetworkInfo).toBe(true);
        });

        it('должен определить desktop устройство', () => {
            const capabilities = platformDetector.getCapabilities();
            expect(capabilities.isMobile).toBe(false);
        });

        it('должен определить мобильное устройство по User Agent', () => {
            (global as any).navigator.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)';

            platformDetector = new PlatformDetector();
            const capabilities = platformDetector.getCapabilities();

            expect(capabilities.isMobile).toBe(true);
        });

        it('должен определить отсутствие touch поддержки', () => {
            const capabilities = platformDetector.getCapabilities();
            expect(capabilities.hasTouch).toBe(false);
        });
    });

    describe('Проверка состояния сети', () => {
        beforeEach(() => {
            platformDetector = new PlatformDetector();
        });

        it('должен вернуть онлайн статус в браузере', () => {
            expect(platformDetector.isOnline()).toBe(true);
            expect(platformDetector.getNetworkStatus()).toBe(NetworkStatus.ONLINE);
        });

        it('должен вернуть офлайн статус в браузере', () => {
            (global as any).navigator.onLine = false;

            expect(platformDetector.isOnline()).toBe(false);
            expect(platformDetector.getNetworkStatus()).toBe(NetworkStatus.OFFLINE);
        });

        it('должен вернуть unknown для типа соединения в браузере', () => {
            expect(platformDetector.getConnectionType()).toBe('unknown');
        });
    });

    describe('Подписка на изменения сети', () => {
        beforeEach(() => {
            platformDetector = new PlatformDetector();
        });

        it('должен позволить подписаться на изменения сети', () => {
            const callback = jest.fn();
            const unsubscribe = platformDetector.onNetworkChange(callback);

            expect(typeof unsubscribe).toBe('function');
        });

        it('должен позволить отписаться от изменений сети', () => {
            const callback = jest.fn();
            const unsubscribe = platformDetector.onNetworkChange(callback);

            // Отписываемся
            unsubscribe();

            // Проверяем, что callback больше не вызывается
            expect(callback).not.toHaveBeenCalled();
        });
    });

    describe('Вспомогательные методы', () => {
        beforeEach(() => {
            platformDetector = new PlatformDetector();
        });

        it('должен проверить поддержку File API', () => {
            expect(platformDetector.hasFileAPISupport()).toBe(true);
        });

        it('должен проверить поддержку localStorage', () => {
            expect(platformDetector.hasLocalStorageSupport()).toBe(true);
        });

        it('должен проверить отсутствие Cordova File поддержки в браузере', () => {
            expect(platformDetector.hasCordovaFileSupport()).toBe(false);
        });

        it('должен проверить, что устройство не мобильное', () => {
            expect(platformDetector.isMobileDevice()).toBe(false);
        });

        it('должен проверить отсутствие touch поддержки', () => {
            expect(platformDetector.hasTouchSupport()).toBe(false);
        });
    });

    describe('Cordova специфичные функции', () => {
        beforeEach(() => {
            // Настраиваем Cordova окружение
            (global as any).window.cordova = {};
            (global as any).window.resolveLocalFileSystemURL = jest.fn();
            (global as any).navigator.connection = {
                type: 'wifi'
            };

            platformDetector = new PlatformDetector();
        });

        it('должен определить Cordova File поддержку', () => {
            expect(platformDetector.hasCordovaFileSupport()).toBe(true);
        });

        it('должен вернуть тип соединения в Cordova', () => {
            // Создаем новый экземпляр для Cordova окружения
            const cordovaPlatformDetector = new PlatformDetector();
            expect(cordovaPlatformDetector.getConnectionType()).toBe('wifi');
        });

        it('должен определить мобильное устройство в Cordova', () => {
            expect(platformDetector.isMobileDevice()).toBe(true);
        });

        it('должен проверить онлайн статус через Cordova connection', () => {
            expect(platformDetector.isOnline()).toBe(true);
        });

        it('должен проверить офлайн статус через Cordova connection', () => {
            (global as any).navigator.connection.type = 'none';

            // Создаем новый экземпляр для проверки офлайн статуса
            const cordovaPlatformDetector = new PlatformDetector();
            expect(cordovaPlatformDetector.isOnline()).toBe(false);
        });
    });
});