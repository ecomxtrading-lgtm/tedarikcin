import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const rootElement = document.getElementById("root");
if (!rootElement) {
  document.body.innerHTML = '<div style="padding: 20px; text-align: center;"><h1>Hata: Root element bulunamadı</h1></div>';
} else {
  try {
    createRoot(rootElement).render(<App />);
  } catch (error) {
    rootElement.innerHTML = '<div style="padding: 20px; text-align: center;"><h1>Uygulama yüklenirken hata oluştu</h1></div>';
  }
}
