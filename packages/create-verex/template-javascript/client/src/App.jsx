import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);
  const [author, setAuthor] = useState("Unknowed");

  useEffect(() => {
    fetch("/api/v1/data")
      .then((res) => res.json())
      .then((data) => setAuthor(data.author))
      .catch((err) => console.error(err));
  });

  return (
    <div className="App">
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src="/vite.svg" className="logo" alt="Vite logo" />
        </a>
        <a href="https://reactjs.org" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Express + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>client/src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="author">Made by {author}</p>
    </div>
  );
}

export default App;
