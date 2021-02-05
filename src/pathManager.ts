import { workspace } from 'vscode';
import * as fs from 'fs';
import * as p from 'path';
import PhpName from './entities/phpName';
import NamespaceResolver from './resolver';

export default class PathManager {
    private namespaceResolver: NamespaceResolver;

    constructor(namespaceResolver: NamespaceResolver) {
        this.namespaceResolver = namespaceResolver;
    }

    public prepareDefaultPath(target, name) {
        const phpName = new PhpName(name);

        return target + '/' + phpName.getUnqualifiedName() + '.php';
    }

    public validatePath(path) {
        return !fs.existsSync(path);
    }

    public basename(path) {
        return p.basename(path);
    }
    
    public resolveNamespace(path) {
        return this.namespaceResolver.resolve(path);
    }

    public resolvePath(name, defaultPath) {
        const phpName = new PhpName(name);
        const namespace = phpName.getNamespace() || '';
        const namespaces = this.configsRepository.getNamespaces();

        const resolvedPath = Object.keys(namespaces).reduce((carry, ns) => {
            if (carry !== null) {
                return carry;
            }

            let offset = this.getOffset(ns, namespace);

            if (offset !== null) {
                offset = offset.split('\\').concat([phpName.getUnqualifiedName() + '.php']).join('/');
                carry = workspace.rootPath + '/' + namespaces[ns] + offset;
            }
            
            return carry;
        }, null);

        return resolvedPath || defaultPath;
    }

    private getOffset(base, full) {
        return full.indexOf(base) === 0 ? full.slice(base.length) : null;
    }
}
