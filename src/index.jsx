// This is the entry point of the React app.
// It finds the <div id="root"> in index.html and renders our App inside it.
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

const root = createRoot(document.getElementById("root"));
root.render(<App />);
