import * as path from 'path';
import { Uri } from 'vscode';

export default interface NamespaceResolver {   
    /**
     * Returns a PHP namespace given a vscode file uri
     * 
     * If no namespace is found, then an empty string is returned.
     * 
     * @param Namespace
     */
    resolve(uri: Uri): Promise<Namespace>;   
}

export class Namespace {
    
    baseUri: Uri;
    baseNamespace: string;

    public constructor(baseUri: Uri, baseNamespace: string)
    {
        this.baseUri = baseUri;
        this.baseNamespace = baseNamespace;
    }

    /**
     * The full absolute path
     * @param path 
     */
    public isContainedIn(uri: Uri): boolean
    {
        return uri.fsPath.startsWith(this.baseUri.fsPath);
    }

    public getRealNamespace(uri: Uri): string
    {
        if (!this.isContainedIn(uri)) {
            return '';
        }
        return this.baseNamespace.concat(uri.fsPath.replace(this.baseUri.fsPath, '').replace('/', '\\'));
    }
    
    public filenameForType(type: string): Uri
    {
        return Uri.joinPath(
            this.baseUri,
            type.replace(this.baseNamespace, '')
            .replace(/\\{1,}/g, path.sep)
            .concat('.php')
        );
    }
}