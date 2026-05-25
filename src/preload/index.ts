import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
    print: {
        generateHTML: (type: string, data: any) => ipcRenderer.invoke('print:generate-html', { type, data }),
        doPrint: (html: string) => ipcRenderer.invoke('print:do-print', html),
    },
});
