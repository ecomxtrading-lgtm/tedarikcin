import { useNavigate } from "react-router-dom";

export const useAuthRedirect = () => {
  const navigate = useNavigate();

  const handleTeklifAlClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Login sonrası nereye gideceğini burada saklıyoruz
    sessionStorage.setItem("postAuthRedirect", "/dashboard");

    // Her zaman önce login ekranına git
    navigate("/login");
  };

  return { handleTeklifAlClick };
};
