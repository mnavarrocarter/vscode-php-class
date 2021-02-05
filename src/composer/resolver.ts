import * as path from 'path';
import { Uri } from 'vscode';
import NamespaceResolver, { Namespace } from '../resolver';
import Composer from './composer';

/**
 * Implements a namespace provider from the composer.json information 
 */
export default class ComposerNamespaceResolver implements NamespaceResolver
{
    private projectRoot: Uri;
    private composer: Composer;
    private namespaces: Namespace[]

    public constructor(projectRoot: Uri, composer: Composer)
    {
        this.projectRoot = projectRoot;
        this.composer = composer;
        this.namespaces = [];
    }

    public async resolve(path: Uri): Promise<Namespace>
    {
        if (this.namespaces.length === 0) {
            // No cached namespaces. We parse the composer file.
            await this.parseComposerNamespaces();
        }
        
        const ns = this.namespaces.find(ns => ns.isContainedIn(path));
        if (!ns) {
            throw new Error(`No namespace found for ${path}. Please report this issue in the repoitory.`);
        }
        return ns;
    }
    
    public clearCache(): void
    {
        this.namespaces = [];
        this.composer.deleteCache();
    }

    private async parseComposerNamespaces(): Promise<void>
    {   
        const psr4Namespaces = await this.composer.getPsr4Namespaces();

        // Then we register the composer namespaces
        Object.keys(psr4Namespaces).forEach(key => {
            const nsPath = psr4Namespaces[key];
            const normalizedNs = key.replace(/\\{1,}/g, "\\").replace(/\\{1,}$/g, '');
            if (Array.isArray(nsPath)) {
                // We are dealing with mutiple paths for the same namesapce.
                nsPath.forEach(p => {
                    this.namespaces.push(
                        new Namespace(Uri.joinPath(this.projectRoot, p), normalizedNs)
                    );
                });
                return;
            }
            this.namespaces.push(new Namespace(Uri.joinPath(this.projectRoot, nsPath), normalizedNs));
        });

        // We register the global namespace as a fallback
        this.namespaces.push(new Namespace(this.projectRoot, ''));
    }
}