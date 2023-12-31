import { createBoard } from "@wixc3/react-board";
import App from "../../../App";
import "../../../index.css";

export default createBoard({
  name: "App",
  Board: () => <App />,
  isSnippet: true,
  environmentProps: {
    canvasHeight: 495,
    windowWidth: 1024,
    windowHeight: 768,
  },
});
