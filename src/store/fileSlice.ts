import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Directory } from '../util/file';

export const slice = createSlice({
    name: "files",
    initialState: {
        songDirectory: ({} as Directory)
    },
    reducers: {
        setSongDirectory: (state, v: PayloadAction<Directory>) => {
            state.songDirectory = v.payload;
        }
    },
});

export const actions = slice.actions;
export default slice.reducer;
