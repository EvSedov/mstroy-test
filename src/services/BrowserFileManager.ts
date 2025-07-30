/// <reference lib="dom" />
import type { FileManager } from './FileManager';
import type { FileInfo, FileInfoWithStatus } from '../types/FileInfo';
import { FileStatus } from '../types/FileInfo';

/**
 * Реализация FileManager для браузерной среды
 * Использует File API для чтения файлов и localStorage для временного хранения
 */
export class BrowserFileManager implements FileManager {
    private readonly STORAGE_KEY = 'browser_files';
    private readonly DATA_KEY_PREFIX = 'file_data_';

    /**
     * Загрузить файл из браузера используя File API
     */
    async loadFile(file: File): Promise<FileInfoWithStatus> {
        try {
            // Читаем содержимое файла
            const data = await this.readFileContent(file);

            // Создаем информацию о файле
            const fileInfo: FileInfo = {
                name: file.name,
                path: this.generateFileId(file),
                lastModified: new Date(file.lastModified),
                isSaved: false, // В браузере файлы всегда временные
                hasWarning: true, // Всегда показываем предупреждение о несохраненности
                size: file.size,
                type: file.type
            };

            // Сохраняем данные в localStorage
            this.saveToLocalStorage(fileInfo, data);

            // Обновляем список файлов
            await this.updateFilesList(fileInfo);

            return {
                ...fileInfo,
                status: FileStatus.TEMPORARY
            };
        } catch (error) {
            throw new Error(`Ошибка при загрузке файла: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
        }
    }

    /**
     * В браузерной среде "сохранение" означает скачивание файла
     */
    async saveFile(fileInfo: FileInfo, data: string): Promise<FileInfoWithStatus> {
        try {
            // Создаем blob с данными
            const blob = new Blob([data], { type: 'application/json' });

            // Создаем ссылку для скачивания
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileInfo.name;

            // Инициируем скачивание
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Освобождаем память
            URL.revokeObjectURL(url);

            // Обновляем информацию о файле (но он все равно остается временным)
            const updatedFileInfo: FileInfo = {
                ...fileInfo,
                lastModified: new Date(),
                hasWarning: true // В браузере всегда есть предупреждение
            };

            // Обновляем данные в localStorage
            this.saveToLocalStorage(updatedFileInfo, data);
            await this.updateFilesList(updatedFileInfo);

            return {
                ...updatedFileInfo,
                status: FileStatus.TEMPORARY
            };
        } catch (error) {
            return {
                ...fileInfo,
                status: FileStatus.ERROR,
                errorMessage: `Ошибка при сохранении файла: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`
            };
        }
    }

    /**
     * Получить список всех файлов из localStorage
     */
    async getFiles(): Promise<FileInfoWithStatus[]> {
        try {
            const filesData = localStorage.getItem(this.STORAGE_KEY);
            if (!filesData) {
                return [];
            }

            const files: FileInfo[] = JSON.parse(filesData);
            return files.map(file => ({
                ...file,
                lastModified: new Date(file.lastModified), // Восстанавливаем Date объект
                status: FileStatus.TEMPORARY,
                hasWarning: true // В браузере всегда есть предупреждение о несохраненности
            }));
        } catch (error) {
            console.error('Ошибка при получении списка файлов:', error);
            return [];
        }
    }

    /**
     * Удалить файл из localStorage
     */
    async deleteFile(fileInfo: FileInfo): Promise<boolean> {
        try {
            // Удаляем данные файла
            localStorage.removeItem(this.DATA_KEY_PREFIX + fileInfo.path);

            // Обновляем список файлов
            const files = await this.getFiles();
            const updatedFiles = files.filter(f => f.path !== fileInfo.path);
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedFiles));

            return true;
        } catch (error) {
            console.error('Ошибка при удалении файла:', error);
            return false;
        }
    }

    /**
     * В браузерной среде всегда есть несохраненные изменения
     */
    hasUnsavedChanges(): boolean {
        try {
            const filesData = localStorage.getItem(this.STORAGE_KEY);
            if (!filesData) {
                return false;
            }

            const files: FileInfo[] = JSON.parse(filesData);
            return files.length > 0; // Если есть файлы, значит есть несохраненные изменения
        } catch (error) {
            console.error('Ошибка при проверке несохраненных изменений:', error);
            return false;
        }
    }

    /**
     * Получить данные файла из localStorage
     */
    async getFileData(fileInfo: FileInfo): Promise<string> {
        try {
            const data = localStorage.getItem(this.DATA_KEY_PREFIX + fileInfo.path);
            if (!data) {
                throw new Error('Данные файла не найдены');
            }
            return data;
        } catch (error) {
            throw new Error(`Ошибка при получении данных файла: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
        }
    }

    /**
     * Читает содержимое файла используя FileReader API
     */
    private readFileContent(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (event) => {
                if (event.target?.result) {
                    resolve(event.target.result as string);
                } else {
                    reject(new Error('Не удалось прочитать файл'));
                }
            };

            reader.onerror = () => {
                reject(new Error('Ошибка при чтении файла'));
            };

            reader.readAsText(file);
        });
    }

    /**
     * Генерирует уникальный ID для файла
     */
    private generateFileId(file: File): string {
        return `browser_${file.name}_${file.lastModified}_${file.size}`;
    }

    /**
     * Сохраняет данные файла в localStorage
     */
    private saveToLocalStorage(fileInfo: FileInfo, data: string): void {
        localStorage.setItem(this.DATA_KEY_PREFIX + fileInfo.path, data);
    }

    /**
     * Обновляет список файлов в localStorage
     */
    private async updateFilesList(fileInfo: FileInfo): Promise<void> {
        const files = await this.getFiles();
        const existingIndex = files.findIndex(f => f.path === fileInfo.path);

        if (existingIndex >= 0) {
            files[existingIndex] = { ...files[existingIndex], ...fileInfo };
        } else {
            files.push({ ...fileInfo, status: FileStatus.TEMPORARY });
        }

        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(files));
    }
}