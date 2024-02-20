import React from "react";

export const Selector = "body";
export const ClassName = "dark";
export const LocalStorageItemKey = "darkModeEnabled";

export function useDarkMode() {
  const [isDarkMode, setIsDarkMode] = React.useState<boolean>(false);

  React.useEffect(() => {
    const darkModeEnabled =
      window &&
      window.localStorage &&
      window.localStorage.getItem(LocalStorageItemKey);
    if (darkModeEnabled === "true") {
      setIsDarkMode(true);
    } else {
      setIsDarkMode(
        (window &&
          window.matchMedia &&
          window.matchMedia("(prefers-color-scheme: dark)").matches) ||
          false
      );
    }
  }, []);

  React.useEffect(() => {
    if (document === null) {
      return;
    }
    if (isDarkMode) {
      // @ts-ignore
      document.querySelector(Selector).classList.add(ClassName);
      window &&
        window.localStorage &&
        window.localStorage.setItem(LocalStorageItemKey, "true");
    } else {
      // @ts-ignore
      document.querySelector(Selector).classList.remove(ClassName);
      window &&
        window.localStorage &&
        window.localStorage.removeItem(LocalStorageItemKey);
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return { isDarkMode, toggleDarkMode };
}

export default useDarkMode;
