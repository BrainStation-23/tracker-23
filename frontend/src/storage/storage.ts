export const setLocalStorage = (key: string, data: any) => {
  if (!data) {
    console.log("Data empty");
    return;
  }

  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.log("Failed to save in local storage");
  }
};

export const getLocalStorage = (key: string) => {
  try {
    return localStorage.getItem(key)
      ? JSON.parse(localStorage.getItem(key))
      : null;
  } catch (e) {
    // logout();
  }
};

export const deleteFromLocalStorage = (key: string) => {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.log(e);
    // logout();
  }
};
const localStorageItems = ["userDetails", "access_token"];
export const clearLocalStorage = () => {
  localStorageItems.forEach((item) => deleteFromLocalStorage(item));
};
