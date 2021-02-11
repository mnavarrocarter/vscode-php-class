import { Uri } from "vscode";
import * as path from 'path';

export interface Namespace
{
    rootDir: Uri;
    rootNs: string
}

/**
 * Namespaces contains the information about the psr-4 namespaces and provides
 * methods to resolve uris into namespaces and viceversa.
 */
export class RootNamespace
{
    private rootPath: Uri;
    private rootName: string;

    public constructor(rootPath: Uri, rootName: string)
    {
        this.rootPath = rootPath;
        this.rootName = rootName;
    }

    /**
     * @param path 
     */
    public isContainedIn(uri: Uri): boolean
    {
        return uri.fsPath.startsWith(this.rootPath.fsPath);
    }

    public createRealNamespaceFor(uri: Uri)
    {
        if (!this.isContainedIn(uri)) {
            return '';
        }
        if (this.rootName === '') {
            return '';
        }
        const basePath = uri.fsPath.replace(this.rootPath.fsPath, '');
        return this.rootName.concat(basePath).split(path.sep).join('\\');
    }

    /**
     * Returns an URI for a Fully Qualified Class Name.
     * 
     * @param namespace 
     */
    public createUriFor(fqcn: string): Uri
    {
        return Uri.joinPath(
            this.rootPath,
            fqcn.replace(this.rootName, '')
            .replace(/\\{1,}/g, path.sep)
            .concat('.php')
        );
    }
}