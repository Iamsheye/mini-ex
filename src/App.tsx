import axios from "axios";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { SET_LOADING, SET_STUDENTS } from "./app/stdSlice";
import { RootState } from "./app/store";

type CRecord = {
  id: string;
  createdTime: string;
  fields: {
    Name: string;
    Classes: string[];
  };
};

type SRecord = {
  id: string;
  createdTime: string;
  fields: {
    Name: string;
    Students: string[];
  };
};

const instance = axios.create({
  baseURL: "https://api.airtable.com/v0/app8ZbcPx7dkpOnP0/",
  headers: {
    Authorization: `Bearer ${process.env.REACT_APP_API_KEY}`,
  },
});

const buildURLstring = (recordArr: string[]) => {
  return recordArr
    .map((record) => {
      return `RECORD_ID()='${record}',`;
    })
    .join("")
    .slice(0, -1);
};

function App() {
  const [name, setName] = useState("");
  const dispatch = useDispatch();
  const data = useSelector((state: RootState) => state.students);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(SET_LOADING(true));
    const { data: students } = await instance.get(
      `/Students?filterByFormula=Name="${name}"`
    );

    if (students.records.length < 1) {
      dispatch(SET_LOADING(false));
    }
    const classesRecID = students.records[0].fields.Classes;

    const { data: classes } = await instance.get(
      `/Classes?filterByFormula=OR(${buildURLstring(classesRecID)})`
    );
    const stdRecID = classes.records
      .map((record: SRecord) => record.fields.Students)
      .reduce((acc: string[], curr: string[]) => [...acc, ...curr]);

    const { data: allStd } = await instance.get(
      `/Students?filterByFormula=OR(${buildURLstring(stdRecID)})`
    );

    const classData = classes.records.map((record: SRecord) => {
      return {
        Name: record.fields.Name,
        Students: record.fields.Students.map(
          (student: string) =>
            allStd.records.find((elem: CRecord) => elem.id === student).fields
              .Name
        ),
      };
    });

    dispatch(SET_STUDENTS(classData));
    dispatch(SET_LOADING(false));
    setName("");
  };

  return (
    <div className="app">
      <section className="form">
        {!data.loading && data.students.length <= 0 && (
          <form onSubmit={handleSubmit}>
            <label htmlFor="studentName">Student Name: </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <button type="submit">Login</button>
          </form>
        )}
        {data.loading && <h4>Loading...</h4>}
        {!data.loading && data.students.length > 0 && (
          <section>
            <button
              className="logout"
              onClick={() => dispatch(SET_STUDENTS([]))}
            >
              Logout
            </button>
            {data.students.map((elem) => (
              <div key={elem.Name} className="class">
                <h4>Name</h4>
                <p>{elem.Name}</p>
                <h4>Students</h4>
                <p>{elem.Students.join(", ")}</p>
              </div>
            ))}
          </section>
        )}
      </section>
    </div>
  );
}

export default App;
