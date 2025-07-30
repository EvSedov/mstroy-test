import { platformDetector, PlatformType, NetworkStatus } from '../services/PlatformDetector';

/**
 * Пример использования PlatformDetector
 * Демонстрирует основные возможности определения платформы и возможностей устройства
 */
export class PlatformDetectorExample {
    private networkUnsubscribe?: () => void;

    /**
     * Демонстрация определения платформы
     */
    demonstratePlatformDetection(): void {
        console.log('=== Определение платформы ===');

        const platform = platformDetector.instance.getPlatform();
        console.log('Текущая платформа:', platform);

        if (platformDetector.instance.isBrowser()) {
            console.log('✅ Работаем в браузере');
        } else if (platformDetector.instance.isCordova()) {
            console.log('📱 Работаем в мобильном приложении Cordova');
        }
    }

    /**
     * Демонстрация определения возможностей устройства
     */
    demonstrateCapabilities(): void {
        console.log('\n=== Возможности устройства ===');

        const capabilities = platformDetector.instance.getCapabilities();

        console.log('File API поддержка:', capabilities.hasFileAPI ? '✅' : '❌');
        console.log('localStorage поддержка:', capabilities.hasLocalStorage ? '✅' : '❌');
        console.log('Cordova File поддержка:', capabilities.hasCordovaFile ? '✅' : '❌');
        console.log('Network Info поддержка:', capabilities.hasNetworkInfo ? '✅' : '❌');
        console.log('Мобильное устройство:', capabilities.isMobile ? '📱' : '💻');
        console.log('Touch поддержка:', capabilities.hasTouch ? '👆' : '🖱️');
    }

    /**
     * Демонстрация проверки состояния сети
     */
    demonstrateNetworkStatus(): void {
        console.log('\n=== Состояние сети ===');

        const isOnline = platformDetector.instance.isOnline();
        const networkStatus = platformDetector.instance.getNetworkStatus();
        const connectionType = platformDetector.instance.getConnectionType();

        console.log('Статус подключения:', isOnline ? '🟢 Онлайн' : '🔴 Офлайн');
        console.log('Статус сети:', networkStatus);
        console.log('Тип соединения:', connectionType);
    }

    /**
     * Демонстрация мониторинга изменений сети
     */
    demonstrateNetworkMonitoring(): void {
        console.log('\n=== Мониторинг сети ===');

        // Подписываемся на изменения состояния сети
        this.networkUnsubscribe = platformDetector.instance.onNetworkChange((status: NetworkStatus) => {
            console.log('🔄 Изменение состояния сети:', status);

            switch (status) {
                case NetworkStatus.ONLINE:
                    console.log('✅ Соединение восстановлено');
                    this.handleOnlineMode();
                    break;
                case NetworkStatus.OFFLINE:
                    console.log('❌ Соединение потеряно');
                    this.handleOfflineMode();
                    break;
                default:
                    console.log('❓ Неизвестное состояние сети');
            }
        });

        console.log('Мониторинг сети активирован. Попробуйте отключить/включить интернет.');
    }

    /**
     * Демонстрация использования вспомогательных методов
     */
    demonstrateHelperMethods(): void {
        console.log('\n=== Вспомогательные методы ===');

        console.log('File API:', platformDetector.instance.hasFileAPISupport() ? 'Поддерживается' : 'Не поддерживается');
        console.log('localStorage:', platformDetector.instance.hasLocalStorageSupport() ? 'Доступен' : 'Недоступен');
        console.log('Cordova File:', platformDetector.instance.hasCordovaFileSupport() ? 'Доступен' : 'Недоступен');
        console.log('Мобильное устройство:', platformDetector.instance.isMobileDevice() ? 'Да' : 'Нет');
        console.log('Touch поддержка:', platformDetector.instance.hasTouchSupport() ? 'Есть' : 'Нет');
    }

    /**
     * Демонстрация адаптивной логики в зависимости от платформы
     */
    demonstrateAdaptiveLogic(): void {
        console.log('\n=== Адаптивная логика ===');

        if (platformDetector.instance.isBrowser()) {
            console.log('🌐 Браузерный режим:');
            console.log('  - Используем File API для загрузки файлов');
            console.log('  - Сохраняем данные в localStorage');
            console.log('  - Показываем предупреждения о несохраненных файлах');

        } else if (platformDetector.instance.isCordova()) {
            console.log('📱 Мобильный режим:');
            console.log('  - Используем Cordova File API');
            console.log('  - Сохраняем файлы в системную папку');
            console.log('  - Автосохранение при появлении интернета');

            if (platformDetector.instance.isOnline()) {
                console.log('  - Синхронизация с облаком доступна');
            } else {
                console.log('  - Работаем в офлайн режиме');
            }
        }
    }

    /**
     * Обработка онлайн режима
     */
    private handleOnlineMode(): void {
        console.log('🔄 Переключение в онлайн режим:');

        if (platformDetector.instance.isCordova()) {
            console.log('  - Запуск синхронизации файлов');
            console.log('  - Отправка отложенных данных');
        }

        console.log('  - Включение функций, требующих интернет');
    }

    /**
     * Обработка офлайн режима
     */
    private handleOfflineMode(): void {
        console.log('🔄 Переключение в офлайн режим:');
        console.log('  - Отключение функций, требующих интернет');
        console.log('  - Переход на локальное хранение');

        if (platformDetector.instance.isCordova()) {
            console.log('  - Сохранение изменений локально');
        }
    }

    /**
     * Остановить мониторинг сети
     */
    stopNetworkMonitoring(): void {
        if (this.networkUnsubscribe) {
            this.networkUnsubscribe();
            console.log('🛑 Мониторинг сети остановлен');
        }
    }

    /**
     * Запустить полную демонстрацию
     */
    runFullDemo(): void {
        console.log('🚀 Запуск демонстрации PlatformDetector\n');

        this.demonstratePlatformDetection();
        this.demonstrateCapabilities();
        this.demonstrateNetworkStatus();
        this.demonstrateHelperMethods();
        this.demonstrateAdaptiveLogic();
        this.demonstrateNetworkMonitoring();

        console.log('\n✅ Демонстрация завершена');
        console.log('💡 Для остановки мониторинга сети вызовите stopNetworkMonitoring()');
    }
}

// Экспортируем функцию для создания примера
export function createPlatformDetectorExample(): PlatformDetectorExample {
    return new PlatformDetectorExample();
}

// Пример использования singleton экземпляра
export function demonstrateSingletonUsage(): void {
    console.log('=== Использование singleton экземпляра ===');

    // Можно использовать напрямую импортированный экземпляр
    console.log('Платформа:', platformDetector.instance.getPlatform());
    console.log('Онлайн:', platformDetector.instance.isOnline());

    // Или использовать вспомогательные функции
    // console.log('Платформа:', getPlatform());
    // console.log('Онлайн:', isOnline());
}