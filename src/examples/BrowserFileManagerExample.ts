import { BrowserFileManager } from '../services/BrowserFileManager';
import type { FileInfoWithStatus } from '../types/FileInfo';

/**
 * Пример использования BrowserFileManager
 * Демонстрирует основные возможности класса
 */
export class BrowserFileManagerExample {
    private fileManager: BrowserFileManager;

    constructor() {
        this.fileManager = new BrowserFileManager();
    }

    /**
     * Демонстрация загрузки файла
     */
    async demonstrateFileLoad(file: File): Promise<void> {
        try {
            console.log('Загружаем файл:', file.name);

            const fileInfo = await this.fileManager.loadFile(file);

            console.log('Файл успешно загружен:');
            console.log('- Имя:', fileInfo.name);
            console.log('- Размер:', fileInfo.size, 'байт');
            console.log('- Статус:', fileInfo.status);
            console.log('- Есть предупреждение:', fileInfo.hasWarning);
            console.log('- Сохранен:', fileInfo.isSaved);

        } catch (error) {
            console.error('Ошибка при загрузке файла:', error);
        }
    }

    /**
     * Демонстрация получения списка файлов
     */
    async demonstrateFilesList(): Promise<void> {
        try {
            const files = await this.fileManager.getFiles();

            console.log('Список файлов в localStorage:');
            if (files.length === 0) {
                console.log('- Нет загруженных файлов');
            } else {
                files.forEach((file: FileInfoWithStatus, index: number) => {
                    console.log(`- Файл ${index + 1}:`);
                    console.log(`  Имя: ${file.name}`);
                    console.log(`  Статус: ${file.status}`);
                    console.log(`  Предупреждение: ${file.hasWarning ? 'Да' : 'Нет'}`);
                });
            }

        } catch (error) {
            console.error('Ошибка при получении списка файлов:', error);
        }
    }

    /**
     * Демонстрация проверки несохраненных изменений
     */
    demonstrateUnsavedChanges(): void {
        const hasUnsaved = this.fileManager.hasUnsavedChanges();
        console.log('Есть несохраненные изменения:', hasUnsaved ? 'Да' : 'Нет');

        if (hasUnsaved) {
            console.log('⚠️ Предупреждение: У вас есть несохраненные файлы!');
            console.log('В браузерной среде файлы сохраняются только при скачивании.');
        }
    }

    /**
     * Демонстрация получения данных файла
     */
    async demonstrateGetFileData(fileName: string): Promise<void> {
        try {
            const files = await this.fileManager.getFiles();
            const targetFile = files.find((f: FileInfoWithStatus) => f.name === fileName);

            if (!targetFile) {
                console.log(`Файл "${fileName}" не найден`);
                return;
            }

            const data = await this.fileManager.getFileData(targetFile);
            console.log(`Содержимое файла "${fileName}":`);
            console.log(data.substring(0, 200) + (data.length > 200 ? '...' : ''));

        } catch (error) {
            console.error('Ошибка при получении данных файла:', error);
        }
    }

    /**
     * Демонстрация сохранения файла (скачивания)
     */
    async demonstrateSaveFile(fileName: string, newData: string): Promise<void> {
        try {
            const files = await this.fileManager.getFiles();
            const targetFile = files.find((f: FileInfoWithStatus) => f.name === fileName);

            if (!targetFile) {
                console.log(`Файл "${fileName}" не найден`);
                return;
            }

            console.log(`Сохраняем файл "${fileName}" (инициируем скачивание)...`);
            const updatedFile = await this.fileManager.saveFile(targetFile, newData);

            console.log('Файл сохранен:');
            console.log('- Статус:', updatedFile.status);
            console.log('- Предупреждение:', updatedFile.hasWarning ? 'Да' : 'Нет');

        } catch (error) {
            console.error('Ошибка при сохранении файла:', error);
        }
    }

    /**
     * Демонстрация удаления файла
     */
    async demonstrateDeleteFile(fileName: string): Promise<void> {
        try {
            const files = await this.fileManager.getFiles();
            const targetFile = files.find((f: FileInfoWithStatus) => f.name === fileName);

            if (!targetFile) {
                console.log(`Файл "${fileName}" не найден`);
                return;
            }

            const success = await this.fileManager.deleteFile(targetFile);

            if (success) {
                console.log(`Файл "${fileName}" успешно удален`);
            } else {
                console.log(`Не удалось удалить файл "${fileName}"`);
            }

        } catch (error) {
            console.error('Ошибка при удалении файла:', error);
        }
    }
}

// Экспортируем функцию для создания примера
export function createBrowserFileManagerExample(): BrowserFileManagerExample {
    return new BrowserFileManagerExample();
}