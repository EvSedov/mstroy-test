import type { FileInfo, FileInfoWithStatus } from '../types/FileInfo';

/**
 * Базовый интерфейс для управления файлами
 * Определяет общие методы для работы с файлами в браузере и мобильном приложении
 */
export interface FileManager {
    /**
     * Загрузить файл из устройства
     * @param file - файл для загрузки
     * @returns Promise с информацией о загруженном файле
     */
    loadFile(file: File): Promise<FileInfoWithStatus>;

    /**
     * Сохранить файл на устройство
     * @param fileInfo - информация о файле
     * @param data - данные для сохранения
     * @returns Promise с обновленной информацией о файле
     */
    saveFile(fileInfo: FileInfo, data: string): Promise<FileInfoWithStatus>;

    /**
     * Получить список всех файлов
     * @returns Promise со списком файлов
     */
    getFiles(): Promise<FileInfoWithStatus[]>;

    /**
     * Удалить файл
     * @param fileInfo - информация о файле для удаления
     * @returns Promise с результатом операции
     */
    deleteFile(fileInfo: FileInfo): Promise<boolean>;

    /**
     * Проверить, есть ли несохраненные изменения
     * @returns true, если есть несохраненные файлы
     */
    hasUnsavedChanges(): boolean;

    /**
     * Получить данные файла
     * @param fileInfo - информация о файле
     * @returns Promise с содержимым файла
     */
    getFileData(fileInfo: FileInfo): Promise<string>;
}