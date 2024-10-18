"use client";
import { useRouter } from "next/navigation";
import tokenLoginUser from "./token";
import { useProduct } from "@/provider/ProviderContext";
import LoadingSJL from "@/components/loading/LoadingSJL";
import dataApi from "@/data/fetchData";
import { useQuery } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { getAllDocumentsSection } from "@/redux/documents/actions";

const withAuth = (WrappedComponent, requiredRole) => {
  const ComponentWithAuth = (props) => {
    const router = useRouter();
    const dispatch = useDispatch();
    const { setUser, setAllUser, setDocumentSection } = useProduct();

    // Función para verificar el token y obtener los datos del usuario
    const fetchUserData = async (token) => {
      
      const userData = await tokenLoginUser(token);
    
       
      if (!userData || userData.message === "Unauthorized") {
        throw new Error("Unauthorized");
      }

      const allUsers = await dataApi.getAllUser(token);
      const document = await dataApi.sectionDocument(token);
       
      dispatch(getAllDocumentsSection({ token }));
      setDocumentSection(document);
      setAllUser(allUsers);
      setUser(userData);

      
      if (requiredRole && userData.roles[0] !== requiredRole) {
        throw new Error("Unauthorized role");
      }

      return userData;
    };

    const { data: userData, error, isLoading } = useQuery({
      queryKey: ["userData"], // Clave única para la consulta
      queryFn: () => {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No token found");
        }
        return fetchUserData(token);
      },
      retry: false, // No reintentar en caso de error
      onError: (error) => {
        console.error("Error during authentication:", error);
        localStorage.removeItem("token"); 
        router.push("/"); 
      },
    });


    if (isLoading) {
      return <LoadingSJL />;
    }

    
    
    // Si hay un error, redirigir al usuario
    if (error) {
      
      router.push("/");
    }

    return <WrappedComponent {...props} />; 
  };

  ComponentWithAuth.displayName = `WithAuth(${
    WrappedComponent.displayName || WrappedComponent.name || "Component"
  })`;

  return ComponentWithAuth;
};

export default withAuth;

