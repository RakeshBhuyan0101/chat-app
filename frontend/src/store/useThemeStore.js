import { create } from "zustand";

export const useThemStore = create((set) => ({
    theme : localStorage.getItem("chat-theme") || "coffe",
    setTheme : (theme) => {
        localStorage.setItem("chat-theme" , theme)
        set({theme})
    },
}))