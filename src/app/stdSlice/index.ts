import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type Student = { Name: string; Students: string[] };

type State = {
  loading: boolean;
  students: Student[];
};

const initialState: State = {
  loading: false,
  students: [],
};

export const stdSlice = createSlice({
  name: "students",
  initialState,
  reducers: {
    SET_LOADING: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    SET_STUDENTS: (state, action: PayloadAction<Student[]>) => {
      state.students = action.payload;
    },
  },
});

export const { SET_LOADING, SET_STUDENTS } = stdSlice.actions;

export default stdSlice.reducer;
