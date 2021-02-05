import { Composer } from ".";
import { PhpFileWriter, PhpFileType } from "../writer";
import { FileSystem, Uri } from 'vscode';


export default class ComposerPhpFileWriter implements PhpFileWriter
{
    private fs: FileSystem;
    private composer: Composer;

    constructor(fs: FileSystem, composer: Composer)
    {
        this.fs = fs;
        this.composer = composer;
    }
    
    public async write(uri: Uri, name: string, type: PhpFileType): Promise<void>
    {
        const nsParts = name.split('\\');
        const className = nsParts.splice(-1, 1)[0];
        const declaration = `${type} ${className}`;
        const namespace = nsParts.join('\\');
        const string = this.createTemplateString(namespace, declaration);
        const buff = Buffer.from(string, 'utf8');
        
        await this.fs.writeFile(uri, new Uint8Array(buff));
    }

    private createTemplateString(namespace: string, classDeclaration: string): string
    {
    return `<?php declare(strict_types=1);

namespace ${namespace};

${classDeclaration}
{

}

`;
    }
}