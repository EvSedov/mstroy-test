/**
 * Интерфейс для информации о файлах данных
 * Используется для отслеживания состояния загруженных файлов
 */
export interface FileInfo {
    /** Имя файла */
    name: string;

    /** Путь к файлу (для мобильного приложения) или идентификатор (для браузера) */
    path: string;

    /** Дата последнего изменения */
    lastModified: Date;

    /** Флаг сохранения файла на устройстве */
    isSaved: boolean;

    /** Флаг предупреждения о несохраненном файле */
    hasWarning: boolean;

    /** Размер файла в байтах */
    size?: number;

    /** Тип файла */
    type?: string;
}

/**
 * Состояние файла для отображения в интерфейсе
 */
export enum FileStatus {
    /** Файл сохранен на устройстве */
    SAVED = 'saved',

    /** Файл временный, не сохранен */
    TEMPORARY = 'temporary',

    /** Файл загружается */
    LOADING = 'loading',

    /** Ошибка при работе с файлом */
    ERROR = 'error'
}

/**
 * Расширенная информация о файле с состоянием
 */
export interface FileInfoWithStatus extends FileInfo {
    /** Текущее состояние файла */
    status: FileStatus;

    /** Сообщение об ошибке, если есть */
    errorMessage?: string;
}