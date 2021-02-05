import { Composer } from ".";
import { PhpFileWriter, PhpFileType } from "../writer";
import { FileSystem, Uri } from 'vscode';

function createTemplateString(namespace: string, classDeclaration: string)
{
    return `
<?php declare(strict_types=1);

namespace ${namespace};

${classDeclaration}
{

}

`;
}

export default class ComposerPhpFileWriter implements PhpFileWriter
{
    private composer: Composer;

    constructor(fs: FileSystem, composer: Composer)
    {
        this.composer = composer;
    }
    
    async write(uri: Uri, name: string, type: PhpFileType): Promise<void>
    {
        
    }
}