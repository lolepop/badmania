
export type Directory = {[k: string]: Directory | File};

export function* flatFileIterator(directory: Directory): Generator<File>
{
    for (const [k, v] of Object.entries(directory))
    {
        if (v instanceof File)
            yield v;
        else
            yield *flatFileIterator(v);
    }
}

export function pathSplit(path: string)
{
    const a = path.lastIndexOf("/");
    return [path.substring(0, a), path.substring(a + 1, path.length)];
}

export function gotoDir(directory: Directory, path: string): Directory
{
    let n: any = directory;
    for (const i of path.split("/"))
        n = n[i];
    return n;
}

export function transformDir(fileList: FileList): Directory
{
    const dir: Directory = {};
    for (const i of fileList)
    {
        const p = (i as any).webkitRelativePath.split("/");
        
        let n: any = dir;
        for (const [si, s] of p.entries())
        {
            if (si < p.length - 1)
            {
                n[s] = n[s] || {};
                n = n[s];
            }
            else
            {
                n[s] = i;
            }
        }
    }
    
    return dir;
}
