import { createRef } from "preact";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { transformDir, flatFileIterator } from "../../util/file";
import { actions as fileStore } from "../../store/fileSlice";
import routes from "../routes";

const index = () => {
    const folderRef = createRef<HTMLInputElement>();
    const dispatch = useAppDispatch();
    const files = useAppSelector(state => state.files);
    const navigate = useNavigate();

    const handleSongSelect = (path: string) => () => {
        navigate(routes.game.route, {
            state: {
                filePath: path
            }
        });
    };

    return (
        <>
            <input
                type="file"
                /* @ts-expect-error */
                // directory=""
                webkitdirectory
                ref={folderRef}
                onChange={(a: any) => dispatch(fileStore.setSongDirectory(transformDir(a.target.files)))}
                multiple
            />
            
                {
                    // looks terrible but works for now
                    [...flatFileIterator(files.songDirectory)]
                        .filter((f: File) => f.name.endsWith(".osu"))
                        .map(a => <><br/><button onClick={handleSongSelect((a as any).webkitRelativePath)}>{a.name}</button></>)
                }
            {console.log(files)}
        </>
    );
};

export default index;
