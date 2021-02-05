import { FileSystem, Uri} from 'vscode';

export default class Composer
{
    private fs: FileSystem;
    private composerUri: Uri;
    private parsedjson?: any;

    public constructor(fs: FileSystem, composerUri: Uri)
    {
        this.fs = fs;
        this.composerUri = composerUri;
    }

    public async getPsr4Namespaces(): Promise<any>
    {
        await this.ensureIsParsed();
        return this.parsedjson.autoload['psr-4'] || {};
    }

    private async ensureIsParsed(): Promise<void>
    {
        if (!this.parsedjson) {
            const bytes = await this.fs.readFile(this.composerUri);
            this.parsedjson = JSON.parse(bytes.toString());
        }
    }

    public deleteCache(): void
    {
        this.parsedjson = undefined;        
    }
}