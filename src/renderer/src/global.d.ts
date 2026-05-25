declare global {
    interface Window {
        api: {
            print: {
                generateHTML: (type: string, data: any) => Promise<string>;
                doPrint: (html: string) => Promise<void>;
            };
        };
    }
}

export {};
