import { createSignal } from "solid-js";
import solidLogo from "./assets/solid.svg";
import viteLogo from "/vite.svg";
import "./App.css";

function App() {
  const [count, setCount] = createSignal(0);

  return (
    <>
      <label>Recipe URL</label>
      <input placeholder="www.chef.com/cookie-recipe"></input>
    </>
  );
}

export default App;
