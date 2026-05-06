import * as path from 'path';
import * as fs from 'fs';
import { app } from 'electron';

export const generateBackupFileName = (prefix: string = 'app-backup', extension: string = '.db'): string => {
    const now = new Date();

    const YYYY = now.getFullYear();
    const MM = String(now.getMonth() + 1).padStart(2, '0');
    const DD = String(now.getDate()).padStart(2, '0');
    const HH = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');

    return `${prefix}-${YYYY}-${MM}-${DD}-${HH}-${mm}-${ss}${extension}`;
};

export class BackupService {
    private static backupFolder = path.join(app.getPath('userData'), 'backups');

    static async createBackup(sourcePath: string, prefix: string = 'app-backup'): Promise<string> {
        if (!fs.existsSync(this.backupFolder)) {
            fs.mkdirSync(this.backupFolder, { recursive: true });
        }

        const extension = path.parse(sourcePath).ext;
        const fileName = generateBackupFileName(prefix, extension);
        const destinationPath = path.join(this.backupFolder, fileName);

        await fs.promises.copyFile(sourcePath, destinationPath);
        return destinationPath;
    }

    static listBackups(): string[] {
        if (!fs.existsSync(this.backupFolder)) return [];
        return fs.readdirSync(this.backupFolder).filter(f => f.endsWith('.sqlite') || f.endsWith('.db'));
    }
}
