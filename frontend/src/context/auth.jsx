import { createContext, useEffect, useState } from "react";
import { api } from "../services/api";
import { Navigate } from "react-router-dom";

/* 
    cria um contexto global para quem impoe o seu uso
    no componente
*/
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  /*
    A funcao eh renderizada todas as vezes que o componente for 
    renderizado. Como eh um context que esta no App, entao todas as
    renderizacoes de componentes chamam o useEffect.      
  
    Verifica se a autenticacao ja foi efetuada no sistema.
    Se ja tiver sido feita a auth entao so atualiza o 
    valor no localStorage
  */

  useEffect(() => {
    const loadingStoresData = async () => {
      const storageUser = localStorage.getItem("@Auth:user");
      const storageToken = localStorage.getItem("@Auth:token");

      if (storageUser && storageToken) {
        setUser(storageUser);
      }
    };

    loadingStoresData();
  }, []);

  /*
        Faz a autenticacao do usuario,
        passando o email e a senha para o middleware do
        backend.

        Se der erro ja retorna o problema associado.
        Se nao, efetua a alocacao da informacao e o token
        do usuario no localStorage. Alem disso, aloca o token
        no header da page.

        Por fim, os componentes (children) sao renderizados 
        tendo como valor props passados o user, o signed como
        uma flag se o user tem valor ou nao e o metodo da funcao
        signIn
    */
  const signIn = async ({ email, password }) => {
    const response = await api.post("/auth", { email, password });

    if (response.data.error) {
      alert(response.data.error);
    } else {
      setUser(response.data.user);

      api.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${response.data.token}`;
      localStorage.setItem("@auth:token", response.data.token);
      localStorage.setItem("@auth:token", JSON.stringify(response.data.user));
    }
  };

  /*
    Metodo de singOut da aplicacao, no qual remove os 
    valores de usuario na aplicacao e o token dele de 
    acesso.

    Por fim retorna para a rota de login "/"
  */
  const signOut = () => {
    localStorage.removeItem("@Auth: token");
    localStorage.removeItem("@Auth: user");
    setUser(null);

    return <Navigate to="/" />;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        signed: !!user,
        signIn,
        signOut
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
