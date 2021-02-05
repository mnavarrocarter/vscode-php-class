export type PhpFileType = 'class' | 'interface' | 'trait';
import { Uri } from 'vscode';

export interface PhpFileWriter
{
    /**
     * Writes a PHP File to the passed uri in the VS Code Filesystem
     * @param uri 
     * @param name 
     * @param type 
     */
    write(uri: Uri, name: string, type: PhpFileType): Promise<void>;
}