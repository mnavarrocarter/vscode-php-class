import { FileSystem, Uri} from 'vscode';
import { RootNamespace } from '../namespace';

/**
 * This class wraps access to the composer.json file and allows querying some
 * of it's information, like the psr-4 namespaces.
 */
export default class Composer
{
    private fs: FileSystem;
    private composerUri: Uri;
    private namespaces: RootNamespace[];

    public constructor(fs: FileSystem, composerUri: Uri)
    {
        this.fs = fs;
        this.composerUri = composerUri;
        this.namespaces = [];
    }

    /**
     * Given a uri, we return the namespace information for it
     * @param uri 
     */
    public async findRootNamespaceFor(uri: Uri): Promise<RootNamespace>
    {
        await this.ensureIsParsed();
        const ns = this.namespaces.find(ns => ns.isContainedIn(uri));
        if (!ns) {
            return new RootNamespace(uri, '');
        }
        return ns;
    }

    private async ensureIsParsed(): Promise<void>
    {
        if (this.namespaces.length === 0) {
            const bytes = await this.fs.readFile(this.composerUri);
            const parsedjson = JSON.parse(bytes.toString());
            const prod = parsedjson?.autoload?.['psr-4'] || {};
            const dev = parsedjson?.['autoload-dev']?.['psr-4'] ||{};

            const projectRoot = this.composerUri.with({
                path: this.composerUri.path.replace('composer.json', '')
            });

            // Register the production psr-4 namespaces
            this.registerNamespaces(projectRoot, prod);
            // Register the dev namespaces
            this.registerNamespaces(projectRoot, dev);
        }
    }

    /**
     * @param projectRoot 
     * @param psr4 
     */
    private registerNamespaces(projectRoot: Uri, psr4: any): void
    {
        // Register the production psr-4 namespaces
        Object.keys(psr4).forEach(key => {
            const nsPath = psr4[key];
            const normalizedNs = key.replace(/\\{1,}/g, "\\").replace(/\\{1,}$/g, '');
            if (Array.isArray(nsPath)) {
                // We are dealing with mutiple paths for the same namesapce.
                nsPath.forEach(p => {
                    this.namespaces.push(
                        new RootNamespace(
                            Uri.joinPath(projectRoot, p), 
                            normalizedNs
                        )
                    );
                });
                return;
            }
            this.namespaces.push(new RootNamespace(Uri.joinPath(projectRoot, nsPath), normalizedNs));
        });
    }

    public async rebuildCache(): Promise<void>
    {
        this.namespaces = [];
        await this.ensureIsParsed();       
    }
}