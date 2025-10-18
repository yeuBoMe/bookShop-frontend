import { getAccountInfoAPI } from "@/services/api.service";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import BarLoader from "react-spinners/BarLoader";
import "styles/spinner.scss";

// blueprint
interface CurrentUserContextType {
    isAuthenticated: boolean;
    setIsAuthenticated: (v: boolean) => void;
    isAppLoading: boolean;
    setIsAppLoading: (v: boolean) => void;
    user: IUser | null;
    setUser: (v: IUser | null) => void;
    carts: ICart[] | null;
    setCarts: (v: ICart[]) => void;
}

// where provide data
const CurrentUserContext = createContext<CurrentUserContextType | null>(null);

type IProps = {
    children: React.ReactNode
}

export const AuthProvider = (props: IProps) => {
    // real data
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isAppLoading, setIsAppLoading] = useState<boolean>(true);
    const [user, setUser] = useState<IUser | null>(null);
    const [carts, setCarts] = useState<ICart[] | null>([]);

    useEffect(() => {
        fetchUserInfoWithAccessTokenRequest()
    }, []);

    const delayTime = (milSeconds: number) => {
        return new Promise<void>((resolve) => {
            setTimeout(() => {
                resolve();
            }, milSeconds);
        });
    }

    const fetchUserInfoWithAccessTokenRequest = async () => {
        try {
            const getAccountInfoResponse = await getAccountInfoAPI();
            await delayTime(200);

            if (getAccountInfoResponse?.data) {
                await new Promise((resolve) => setTimeout(resolve, 100));

                const mappedIAccountToIUser: IUser = {
                    id: getAccountInfoResponse.data.user.id,
                    fullName: getAccountInfoResponse.data.user.name,
                    email: getAccountInfoResponse.data.user.email,
                    avatar: getAccountInfoResponse.data.user.avatar || "",
                    phone: getAccountInfoResponse.data.user.phone || "",
                    role: getAccountInfoResponse.data.user.role,
                }

                setUser(mappedIAccountToIUser);
                setIsAuthenticated(true);

                const carts = localStorage.getItem(`carts_${user?.email}`);
                if (carts) {
                    const cartsData = JSON.parse(carts) as ICart[];
                    setCarts(cartsData);
                }
            }
        } catch (error: any) {
            console.log("Check error fetching user info >>> ", error)
            setIsAuthenticated(false);
        } finally {
            setIsAppLoading(false);
        }
    }

    const value = useMemo(() => ({
        isAuthenticated, setIsAuthenticated,
        isAppLoading, setIsAppLoading,
        user, setUser,
        carts, setCarts
    }), [isAuthenticated, isAppLoading, user, carts]);

    return (
        <>
            {isAppLoading === true ? (
                <div className="app-spinner">
                    <BarLoader width={100} color="#00FFC8" loading={true} />
                </div>
            ) : (
                <CurrentUserContext.Provider value={value}>
                    {props.children}
                    {/* children: all components are wrapped in AuthProvider */}
                </CurrentUserContext.Provider>
            )}
        </>
    );
};

export const useCurrentApp = () => {
    const currentUserContext = useContext(CurrentUserContext);

    if (!currentUserContext) {
        throw new Error(
            "useCurrentApp has to be used within <CurrentUserContext.Provider>"
        );
    }

    return currentUserContext;
};
