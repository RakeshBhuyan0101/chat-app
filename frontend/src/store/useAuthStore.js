import { axiosInstance } from "@/lib/axios";
import toast from "react-hot-toast";
import { create } from "zustand";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

export const useAuthStore = create((set , get) => ({
    authUser : null ,
    isSigningUp : false,
    isLogingIn : false,
    isUpdatingProfile : false,
    onlineUsers : [],
    isCheackingAuth : true,
    socket : null ,

    cheackAuth : async() => {
        try {
            set({isCheackingAuth : true})
            const res = await axiosInstance.get("/user/check")
            set({authUser : res.data})
            get().connectSocket()
        } catch (error) {
            console.log(error)
            set({authUser : null })
        } finally {
            set({isCheackingAuth : false})
        }
    },

    signUp  : async (formData) => {
        try {
            set({isSigningUp : true})
            const res = await axiosInstance.post("/user/signup" , formData)
            set({authUser : res.data})
            get().connectSocket()
            toast.success("Account created successfully")
        } catch (error) {
            console.log(error)
            set({authUser : null })
            toast.error(error.response.data.message)
        } finally {
            set ({isSigningUp : false})
        }
    },
    signin : async (data) => {
        try {
            set({isLogingIn : true})
            const res = await axiosInstance.post("/user/signin", data)
            set({authUser : res.data})
            toast.success("Logged in successfully")
            get.connectSocket()
        } catch (error) {
            toast.error(error.response.data.message)
            console.log(error)
        } finally{
            set({isLogingIn : false})
        }
    },
    logout : async () => {
        try {
            const res = await axiosInstance.post("/user/logout")
            console.log(res)
            set({authUser : null})
            toast.success("Logged out successfuly")
            get().disconnectSocket()
        } catch (error) {
            console.log(error)
            toast.error(error.response.data.message)
        }
    },

    updateProfile : async (data) => {
        try {
            set({isUpdatingProfile : true})
            const res = await axiosInstance.put("/user/update-profile",data , {headers : "multipart/form-data"})
            set({authUser : res.data})
            toast.success("Profile updated")
            return res.data.user;
        } catch (error) {
            console.log(error)
            // toast.error(error.response.data.message)
        } finally{
            set({isUpdatingProfile : false})
        }
    },

    connectSocket : () => {
        const {authUser} = get()
        if (!authUser || get().socket?.connected) return;

        const socket = io(BASE_URL , {
            query : {
                userId : authUser._id,
            }
        })
        socket.connect()
        set({socket : socket})

        socket.on("getOnlineUsers" , (userIds) => {
            set({onlineUsers : userIds})
        } )
    },

    disconnectSocket : () => {
        if (get().socket?.connected) get().socket.disconnect();
    },
}))