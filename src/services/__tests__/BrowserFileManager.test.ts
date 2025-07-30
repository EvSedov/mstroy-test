/**
 * Тесты для BrowserFileManager
 * Используем моки для браузерных API
 */
import { BrowserFileManager } from '../BrowserFileManager';
import { FileStatus } from '../../types/FileInfo';

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

// Мокаем браузерные API
(global as any).URL = {
    createObjectURL: jest.fn(() => 'mock-url'),
    revokeObjectURL: jest.fn()
};

(global as any).document = {
    createElement: jest.fn(() => ({
        href: '',
        download: '',
        click: jest.fn(),
        remove: jest.fn()
    })),
    body: {
        appendChild: jest.fn(),
        removeChild: jest.fn()
    }
};

(global as any).Blob = jest.fn().mockImplementation((content, options) => ({
    content,
    options
}));

describe('BrowserFileManager', () => {
    let fileManager: BrowserFileManager;
    let mockFile: File;

    beforeEach(() => {
        fileManager = new BrowserFileManager();
        localStorageMock.clear();

        // Создаем мок файла
        mockFile = new File(['test content'], 'test.json', {
            type: 'application/json',
            lastModified: Date.now()
        });
    });

    describe('getFiles', () => {
        it('должен вернуть пустой массив если нет файлов', async () => {
            const files = await fileManager.getFiles();
            expect(files).toEqual([]);
        });

        it('должен вернуть список файлов из localStorage', async () => {
            const testFiles = [{
                name: 'test.json',
                path: 'test_path',
                lastModified: new Date().toISOString(),
                isSaved: false,
                hasWarning: true
            }];

            localStorageMock.setItem('browser_files', JSON.stringify(testFiles));

            const files = await fileManager.getFiles();
            expect(files).toHaveLength(1);
            expect(files[0].name).toBe('test.json');
            expect(files[0].status).toBe(FileStatus.TEMPORARY);
            expect(files[0].hasWarning).toBe(true);
        });
    });

    describe('hasUnsavedChanges', () => {
        it('должен вернуть false если нет файлов', () => {
            const hasChanges = fileManager.hasUnsavedChanges();
            expect(hasChanges).toBe(false);
        });

        it('должен вернуть true если есть файлы', () => {
            const testFiles = [{
                name: 'test.json',
                path: 'test_path',
                lastModified: new Date().toISOString(),
                isSaved: false,
                hasWarning: true
            }];

            localStorageMock.setItem('browser_files', JSON.stringify(testFiles));

            const hasChanges = fileManager.hasUnsavedChanges();
            expect(hasChanges).toBe(true);
        });
    });

    describe('deleteFile', () => {
        it('должен удалить файл из localStorage', async () => {
            const fileInfo = {
                name: 'test.json',
                path: 'test_path',
                lastModified: new Date(),
                isSaved: false,
                hasWarning: true
            };

            // Добавляем файл
            localStorageMock.setItem('browser_files', JSON.stringify([fileInfo]));
            localStorageMock.setItem('file_data_test_path', 'test data');

            const result = await fileManager.deleteFile(fileInfo);

            expect(result).toBe(true);
            expect(localStorageMock.getItem('file_data_test_path')).toBeNull();

            const files = await fileManager.getFiles();
            expect(files).toHaveLength(0);
        });
    });

    describe('getFileData', () => {
        it('должен вернуть данные файла из localStorage', async () => {
            const fileInfo = {
                name: 'test.json',
                path: 'test_path',
                lastModified: new Date(),
                isSaved: false,
                hasWarning: true
            };

            localStorageMock.setItem('file_data_test_path', 'test file content');

            const data = await fileManager.getFileData(fileInfo);
            expect(data).toBe('test file content');
        });

        it('должен выбросить ошибку если данные не найдены', async () => {
            const fileInfo = {
                name: 'test.json',
                path: 'nonexistent_path',
                lastModified: new Date(),
                isSaved: false,
                hasWarning: true
            };

            await expect(fileManager.getFileData(fileInfo)).rejects.toThrow('Ошибка при получении данных файла');
        });
    });

    describe('saveFile', () => {
        it('должен инициировать скачивание файла', async () => {
            const fileInfo = {
                name: 'test.json',
                path: 'test_path',
                lastModified: new Date(),
                isSaved: false,
                hasWarning: true
            };

            const testData = 'test file content';
            const result = await fileManager.saveFile(fileInfo, testData);

            expect(result.status).toBe(FileStatus.TEMPORARY);
            expect(result.hasWarning).toBe(true);
            expect((global as any).Blob).toHaveBeenCalledWith([testData], { type: 'application/json' });
        });
    });
});