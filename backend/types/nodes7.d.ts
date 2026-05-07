declare module 'nodes7' {
  class nodes7 {
    initiateConnection(params: object, callback: (err?: Error) => void): void;
    setTranslationCB(callback: (tag: string) => string): void;
    addItems(items: string | string[]): void;
    removeItems(items: string | string[]): void;
    readAllItems(callback: (err: boolean, values: Record<string, any>) => void): void;
    writeItems(items: string | string[], values: any | any[], callback: (err: boolean) => void): void;
  }
  export = nodes7;
}
